from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from typing import List
from datetime import datetime, timedelta
import models
import auth_utils
from sqlalchemy.orm import Session
from models import SessionLocal, User, FriendLink, LocationHistory, Base, engine
from pydantic import BaseModel, EmailStr
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="FriendLocator API")

# Configure CORS to allow your Vercel frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:8100",
        "https://frontend-indol-sigma-60.vercel.app",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database tables on startup
@app.on_event("startup")
async def startup_event():
    """Create database tables on application startup"""
    try:
        logger.info("Creating database tables...")
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables initialized successfully")
    except Exception as e:
        logger.error(f"Error initializing database: {e}")
        # Don't crash the app, just log the error
        # This allows it to handle connection retries

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Pydantic models for validation
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    profile_picture: str = None  # Optional base64 image data

class Token(BaseModel):
    access_token: str
    token_type: str

# Dependency to get the database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Auth Endpoints
@app.post("/register", response_model=dict)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    # Check if username exists
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    # Check if email exists
    db_email = db.query(User).filter(User.email == user.email).first()
    if db_email:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = auth_utils.get_password_hash(user.password)
    new_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        profile_picture=user.profile_picture
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User created successfully", "username": new_user.username}

@app.post("/token", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    try:
        user = db.query(User).filter(User.username == form_data.username).first()
        if not user or not auth_utils.verify_password(form_data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        access_token = auth_utils.create_access_token(data={"sub": user.username})
        return {"access_token": access_token, "token_type": "bearer"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"ERROR in login: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = auth_utils.decode_access_token(token)
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except Exception:
        raise credentials_exception
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception
    return user

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, set to your React app's domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "online", "message": "FriendLocator API is running"}

@app.get("/users/me")
async def get_current_user_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get the current user's profile information"""
    # Get the user's latest location
    last_loc = db.query(LocationHistory)\
                 .filter(LocationHistory.user_id == current_user.id)\
                 .order_by(LocationHistory.timestamp.desc())\
                 .first()
    
    user_data = {
        "id": current_user.id,
        "username": current_user.username,
        "name": current_user.username.capitalize(),
        "email": current_user.email,
        "phone_number": current_user.phone_number,
        "profile_picture": current_user.profile_picture,
        "isOwn": True,
        "isOnline": True
    }
    
    # Add location if available
    if last_loc:
        user_data.update({
            "lat": last_loc.latitude,
            "lng": last_loc.longitude,
            "battery": last_loc.battery_percentage,
            "isCharging": last_loc.is_charging,
            "lastSeen": "Just now"
        })
    
    return user_data

@app.get("/friends/live")
def get_live_friends(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Get all users-friends connections (using the authenticated user's ID)
    friend_links = db.query(FriendLink).filter(FriendLink.user_id == current_user.id).all()
    results = []
    
    # Add current user's own location first
    my_last_loc = db.query(LocationHistory)\
                     .filter(LocationHistory.user_id == current_user.id)\
                     .order_by(LocationHistory.timestamp.desc())\
                     .first()
    
    if my_last_loc:
        results.append({
            "id": current_user.id,
            "name": current_user.username.capitalize(),
            "lat": my_last_loc.latitude,
            "lng": my_last_loc.longitude,
            "isOnline": True,
            "battery": my_last_loc.battery_percentage,
            "isCharging": my_last_loc.is_charging,
            "lastSeen": "Just now",
            "profile_picture": current_user.profile_picture,
            "isOwn": True
        })
    
    # Add friends' locations
    for link in friend_links:
        friend = db.query(User).filter(User.id == link.friend_id).first()
        if not friend:
            continue
            
        # Get the latest location record
        last_loc = db.query(LocationHistory)\
                     .filter(LocationHistory.user_id == friend.id)\
                     .order_by(LocationHistory.timestamp.desc())\
                     .first()
        
        if last_loc:
            results.append({
                "id": friend.id,
                "name": friend.username.capitalize(),
                "lat": last_loc.latitude,
                "lng": last_loc.longitude,
                "isOnline": True,
                "battery": last_loc.battery_percentage,
                "isCharging": last_loc.is_charging,
                "lastSeen": "Just now",
                "profile_picture": friend.profile_picture,
                "isOwn": False
            })
    
    return results

@app.get("/history/{friend_id}")
async def get_friend_history(friend_id: int, date: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Verify the user is a friend
    is_friend = db.query(FriendLink).filter(FriendLink.user_id == current_user.id, FriendLink.friend_id == friend_id).first()
    if not is_friend and current_user.id != friend_id:
         raise HTTPException(status_code=403, detail="You do not have permission to view this history.")

    # Parse the date and get the start and end of that day
    try:
        target_date = datetime.strptime(date, "%Y-%m-%d")
        start_of_day = target_date.replace(hour=0, minute=0, second=0, microsecond=0)
        end_of_day = start_of_day + timedelta(days=1)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")

    # Returns a list of path segments for history playback from DB filtered by date
    history_records = db.query(LocationHistory).filter(
        LocationHistory.user_id == friend_id,
        LocationHistory.timestamp >= start_of_day,
        LocationHistory.timestamp < end_of_day
    ).order_by(LocationHistory.timestamp.asc()).all()
    
    return {
        "friend_id": friend_id,
        "date": date,
        "path": [{"lat": r.latitude, "lng": r.longitude, "time": r.timestamp.strftime("%H:%M:%S")} for r in history_records]
    }

@app.get("/search-users")
async def search_users(query: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Search for users by username or email"""
    if len(query) < 2:
        return {"users": []}
    
    search_term = f"%{query}%"
    users = db.query(User).filter(
        (User.username.like(search_term)) | (User.email.like(search_term)),
        User.id != current_user.id  # Exclude self
    ).limit(10).all()
    
    result = []
    for user in users:
        # Check if already friends or pending
        existing = db.query(FriendLink).filter(
            ((FriendLink.user_id == current_user.id) & (FriendLink.friend_id == user.id)) |
            ((FriendLink.user_id == user.id) & (FriendLink.friend_id == current_user.id))
        ).first()
        
        status = "not_friends"
        if existing:
            status = existing.status
        
        result.append({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "status": status,
            "profile_picture": user.profile_picture
        })
    
    return {"users": result}

@app.post("/friend-request/send-by-email")
async def send_friend_request_by_email(body: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Send a friend request using recipient's email"""
    email = body.get('email', '').lower().strip()
    
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
    
    recipient = db.query(User).filter(User.email == email).first()
    if not recipient:
        raise HTTPException(status_code=404, detail="User not found with this email")
    
    if recipient.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot friend yourself")
    
    # Check if request already exists in either direction
    existing = db.query(FriendLink).filter(
        ((FriendLink.user_id == current_user.id) & (FriendLink.friend_id == recipient.id)) |
        ((FriendLink.user_id == recipient.id) & (FriendLink.friend_id == current_user.id))
    ).first()
    
    if existing:
        status_map = {
            "pending": "Friend request already sent",
            "accepted": "Already friends",
            "blocked": "Blocked by this user"
        }
        raise HTTPException(status_code=400, detail=status_map.get(existing.status, "Request already exists"))
    
    # Create new request
    request = FriendLink(user_id=current_user.id, friend_id=recipient.id, status="pending")
    db.add(request)
    db.commit()
    
    return {"detail": f"Friend request sent to {email}", "recipient_username": recipient.username}

@app.get("/friend-requests/pending")
async def get_pending_requests(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get pending friend requests for the current user"""
    pending = db.query(FriendLink).filter(
        FriendLink.friend_id == current_user.id,
        FriendLink.status == "pending"
    ).all()
    
    requests = []
    for req in pending:
        sender = db.query(User).filter(User.id == req.user_id).first()
        requests.append({
            "request_id": req.id,
            "from_user_id": sender.id,
            "from_username": sender.username,
            "from_email": sender.email,
            "from_profile_picture": sender.profile_picture,
            "created_at": str(req.id)  # Simple timestamp approximation
        })
    
    return {"requests": requests}

@app.post("/friend-request/{request_id}/accept")
async def accept_friend_request(request_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Accept a friend request"""
    request = db.query(FriendLink).filter(FriendLink.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    if request.friend_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only accept requests sent to you")
    
    # Update request status
    request.status = "accepted"
    
    # Create reverse link
    reverse = db.query(FriendLink).filter(
        FriendLink.user_id == current_user.id,
        FriendLink.friend_id == request.user_id
    ).first()
    
    if not reverse:
        reverse_link = FriendLink(user_id=current_user.id, friend_id=request.user_id, status="accepted")
        db.add(reverse_link)
    else:
        reverse.status = "accepted"
    
    db.commit()
    return {"detail": "Friend request accepted"}

@app.post("/friend-request/{request_id}/reject")
async def reject_friend_request(request_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Reject a friend request"""
    request = db.query(FriendLink).filter(FriendLink.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    if request.friend_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only reject requests sent to you")
    
    db.delete(request)
    db.commit()
    return {"detail": "Friend request rejected"}

@app.delete("/friends/{friend_id}")
async def remove_friend(friend_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Remove a friend"""
    # Delete both directions
    db.query(FriendLink).filter(
        ((FriendLink.user_id == current_user.id) & (FriendLink.friend_id == friend_id)) |
        ((FriendLink.user_id == friend_id) & (FriendLink.friend_id == current_user.id))
    ).delete()
    db.commit()
    return {"detail": "Friend removed"}

@app.post("/location/update")
async def update_location(body: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Update user's real-time location"""
    latitude = body.get('latitude')
    longitude = body.get('longitude')
    battery = body.get('battery', 100)
    charging = body.get('charging', False)
    
    if latitude is None or longitude is None:
        raise HTTPException(status_code=400, detail="Latitude and longitude required")
    
    # Create new location history entry
    location = LocationHistory(
        user_id=current_user.id,
        latitude=latitude,
        longitude=longitude,
        battery_percentage=int(battery),
        is_charging=charging,
        timestamp=datetime.utcnow()
    )
    db.add(location)
    db.commit()
    
    return {"status": "success", "message": "Location updated"}

@app.post("/geofences")
async def create_geofence(geofence: dict, current_user: User = Depends(get_current_user)):
    # Logic to save a new safe/alert zone
    return {"status": "success", "message": "Geofence created"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
