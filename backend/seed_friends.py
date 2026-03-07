from models import SessionLocal, User, FriendLink, LocationHistory
import datetime
import random

session = SessionLocal()

# Get all users
users = session.query(User).all()
print(f"Found {len(users)} users")

if len(users) < 2:
    print("Not enough users to create friend links")
    session.close()
    exit()

# Create friend links (each user is friends with all other users)
print("\nCreating friend links...")
for i, user in enumerate(users):
    for friend in users:
        if user.id != friend.id:
            # Check if link already exists
            existing = session.query(FriendLink).filter(
                FriendLink.user_id == user.id,
                FriendLink.friend_id == friend.id
            ).first()
            if not existing:
                link = FriendLink(user_id=user.id, friend_id=friend.id, status="accepted")
                session.add(link)
                print(f"  ✓ {user.username} <-> {friend.username}")

session.commit()

# Create location history with sample coordinates (NYC area)
print("\nCreating location history...")
locations = [
    (40.7128, -74.0060, "jeevan"),      # NYC
    (40.7580, -73.9855, "alice"),       # Times Square
    (40.7489, -73.9680, "bob"),         # Grand Central
    (40.7505, -73.9972, "charlie"),     # Central Park
]

for lat, lng, username in locations:
    user = session.query(User).filter(User.username == username).first()
    if user:
        # Create 5 location points to show a path on the map
        for i in range(5):
            loc = LocationHistory(
                user_id=user.id,
                latitude=lat + (random.random() - 0.5) * 0.01,
                longitude=lng + (random.random() - 0.5) * 0.01,
                battery_percentage=random.randint(40, 100),
                is_charging=random.choice([True, False]),
                timestamp=datetime.datetime.utcnow() - datetime.timedelta(minutes=i*10)
            )
            session.add(loc)
        print(f"  ✓ {username}: Added 5 location points")

session.commit()
print("\n✅ Database seeded with friend links and location data!")
session.close()
