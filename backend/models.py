from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker
from sqlalchemy import create_engine
import datetime
import os
import logging
from urllib.parse import quote_plus

# Database setup
# Check for Railway's DATABASE_URL first (preferred), then fall back to individual variables
database_url = os.getenv("DATABASE_URL")

if database_url:
    # Railway provides DATABASE_URL for MySQL
    # Convert mysql:// to mysql+mysqlconnector://
    if database_url.startswith("mysql://"):
        SQLALCHEMY_DATABASE_URL = database_url.replace("mysql://", "mysql+mysqlconnector://", 1)
    else:
        SQLALCHEMY_DATABASE_URL = database_url
else:
    # Fallback to individual environment variables for local development
    db_user = os.getenv("DB_USER", "root")
    db_password = os.getenv("DB_PASSWORD", "nivi@Cyrus123")
    db_host = os.getenv("DB_HOST", "localhost")
    db_port = os.getenv("DB_PORT", "3306")
    db_name = os.getenv("DB_NAME", "friend_tracker")
    
    # Properly encode the password to handle special characters ('@')
    password = quote_plus(db_password)
    SQLALCHEMY_DATABASE_URL = f"mysql+mysqlconnector://{db_user}:{password}@{db_host}:{db_port}/{db_name}"

logger = logging.getLogger(__name__)
logger.info(f"Database URL configured (redacted for security)")

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    email = Column(String(100), unique=True, index=True)
    phone_number = Column(String(20))
    hashed_password = Column(String(255))
    profile_picture = Column(String(16777215), nullable=True)  # LONGTEXT equivalent (16MB max)
    
    # Relationships
    friends = relationship("FriendLink", foreign_keys="FriendLink.user_id", back_populates="owner")
    locations = relationship("LocationHistory", back_populates="user")

class FriendLink(Base):
    __tablename__ = "friend_links"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    friend_id = Column(Integer, ForeignKey("users.id"))
    status = Column(String(20), default="accepted") # pending, accepted, blocked
    
    owner = relationship("User", foreign_keys=[user_id], back_populates="friends")

class LocationHistory(Base):
    __tablename__ = "location_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    battery_percentage = Column(Integer)
    is_charging = Column(Boolean, default=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="locations")

class Geofence(Base):
    __tablename__ = "geofences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String(100))
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    radius = Column(Float, default=100.0) # In meters
    zone_type = Column(String(20), default="safe") # safe, alert
