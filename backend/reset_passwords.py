from models import SessionLocal, User, FriendLink, LocationHistory, Geofence
from passlib.context import CryptContext

# Use a simpler hashing method that doesn't require bcrypt
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

session = SessionLocal()

# Clear all tables in correct order (respect foreign keys)
print("Clearing location history...")
session.query(LocationHistory).delete()
session.commit()

print("Clearing geofences...")
session.query(Geofence).delete()
session.commit()

print("Clearing friend links...")
session.query(FriendLink).delete()
session.commit()

print("Clearing users...")
session.query(User).delete()
session.commit()

# Create fresh users with HASHED passwords
print("\nCreating new users with hashed passwords...")
users_data = [
    ('jeevan', 'jeevan@example.com', 'jeevan123'),
    ('alice', 'alice@example.com', 'alice123'),
    ('bob', 'bob@example.com', 'bob123'),
    ('charlie', 'charlie@example.com', 'charlie123'),
]

for username, email, password in users_data:
    hashed = pwd_context.hash(password)
    user = User(username=username, email=email, hashed_password=hashed)
    session.add(user)
    print(f"  ✓ {username} - Password hashed successfully")

session.commit()
print("\n✅ Database reset successfully!")
print("\nTest Credentials:")
print("  jeevan / jeevan123")
print("  alice / alice123")
print("  bob / bob123")
print("  charlie / charlie123")

# Verify
print("\nVerifying passwords in database:")
for username, _, password in users_data:
    user = session.query(User).filter(User.username == username).first()
    if user and user.hashed_password:
        print(f"  ✓ {username}: {user.hashed_password[:30]}...")
    else:
        print(f"  ✗ {username}: FAILED TO SAVE")

session.close()
