from models import SessionLocal, User, LocationHistory
import datetime
import random

session = SessionLocal()

# Get all users
users = session.query(User).all()
print(f"Creating location history for {len(users)} users...\n")

# NYC area coordinates for different locations
locations_paths = {
    'jeevan': [
        (40.7128, -74.0060),    # Times Square
        (40.7150, -74.0050),
        (40.7200, -74.0020),
        (40.7250, -74.0000),
        (40.7300, -73.9950),
    ],
    'alice': [
        (40.7580, -73.9855),    # Grand Central
        (40.7570, -73.9800),
        (40.7550, -73.9750),
        (40.7530, -73.9700),
        (40.7510, -73.9650),
    ],
    'bob': [
        (40.7489, -73.9680),    # Central Park South
        (40.7500, -73.9700),
        (40.7520, -73.9750),
        (40.7540, -73.9800),
        (40.7560, -73.9850),
    ],
    'charlie': [
        (40.7505, -73.9972),    # Central Park
        (40.7520, -73.9900),
        (40.7540, -73.9850),
        (40.7560, -73.9800),
        (40.7580, -73.9750),
    ]
}

# Create location history for the past 7 days
base_time = datetime.datetime.utcnow()

for user in users:
    if user.username in locations_paths:
        path = locations_paths[user.username]
        print(f"📍 {user.username.upper()}:")
        
        # For each day in the past 7 days
        for day_offset in range(7, 0, -1):
            # For each location in the path
            for idx, (lat, lng) in enumerate(path):
                # Create multiple points throughout the day (hourly)
                hour_offset = idx * 2  # 2 hours apart
                timestamp = base_time - datetime.timedelta(days=day_offset, hours=hour_offset)
                
                loc = LocationHistory(
                    user_id=user.id,
                    latitude=lat + random.uniform(-0.002, 0.002),
                    longitude=lng + random.uniform(-0.002, 0.002),
                    battery_percentage=random.randint(20, 100),
                    is_charging=random.choice([True, False]),
                    timestamp=timestamp
                )
                session.add(loc)
        
        print(f"  ✓ Added 35 location points (7 days × 5 locations)")

session.commit()
print("\n✅ History data seeded successfully!")
print("\nYou can now:")
print("  1. Click the HISTORY button on the dashboard")
print("  2. Select a friend to view their location history")
print("  3. Play back the movement animation")

session.close()
