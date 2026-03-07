from sqlalchemy.orm import Session
from models import SessionLocal, User, FriendLink, LocationHistory, Geofence
import datetime

def seed_data():
    db = SessionLocal()
    try:
        # Create a main user
        main_user = User(
            username="jeevan",
            email="jeevan@example.com",
            phone_number="1234567890",
            hashed_password="hashed_password_placeholder"
        )
        db.add(main_user)
        db.flush()

        # Create some friends
        friend1 = User(username="alice", email="alice@example.com", phone_number="1112223333")
        friend2 = User(username="bob", email="bob@example.com", phone_number="4445556666")
        friend3 = User(username="charlie", email="charlie@example.com", phone_number="7778889999")
        
        db.add_all([friend1, friend2, friend3])
        db.flush()

        # Link friends to main user
        links = [
            FriendLink(user_id=main_user.id, friend_id=friend1.id, status="accepted"),
            FriendLink(user_id=main_user.id, friend_id=friend2.id, status="accepted"),
            FriendLink(user_id=main_user.id, friend_id=friend3.id, status="accepted")
        ]
        db.add_all(links)

        # Add some initial locations for friends (New York area)
        now = datetime.datetime.utcnow()
        locations = [
            LocationHistory(user_id=friend1.id, latitude=40.7128, longitude=-74.0060, battery_percentage=85, is_charging=False, timestamp=now),
            LocationHistory(user_id=friend2.id, latitude=40.7228, longitude=-74.0160, battery_percentage=15, is_charging=False, timestamp=now),
            LocationHistory(user_id=friend3.id, latitude=40.7028, longitude=-73.9960, battery_percentage=100, is_charging=True, timestamp=now)
        ]
        db.add_all(locations)

        # Add a geofence for the main user
        fence = Geofence(user_id=main_user.id, name="Home", latitude=40.7128, longitude=-74.0060, radius=500.0, zone_type="safe")
        db.add(fence)

        db.commit()
        print("Successfully seeded initial friend and location data.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding data: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
