#!/usr/bin/env python3
"""
Seed script to create pending friend requests for testing
"""

from models import SessionLocal, User, FriendLink

db = SessionLocal()

try:
    # Get users
    jeevan = db.query(User).filter(User.username == "jeevan").first()
    alice = db.query(User).filter(User.username == "alice").first()
    bob = db.query(User).filter(User.username == "bob").first()

    if not all([jeevan, alice, bob]):
        print("❌ Not all test users found!")
        exit(1)

    # Create some pending requests
    print("Creating pending friend requests...")

    # Alice sent request to Bob (pending)
    existing = db.query(FriendLink).filter(
        ((FriendLink.user_id == alice.id) & (FriendLink.friend_id == bob.id)) |
        ((FriendLink.user_id == bob.id) & (FriendLink.friend_id == alice.id))
    ).first()

    if not existing:
        request1 = FriendLink(user_id=alice.id, friend_id=bob.id, status="pending")
        db.add(request1)
        print(f"✓ Created pending request: alice → bob")

    db.commit()
    print("✅ Friend requests seeded successfully!")

except Exception as e:
    print(f"❌ Error: {e}")
    db.rollback()
finally:
    db.close()
