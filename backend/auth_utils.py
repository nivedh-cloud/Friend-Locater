from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from typing import Optional
import os
import hashlib

# Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "SUPER_SECRET_KEY_FOR_JWT_FRIEND_LOCATOR")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 # 24 hours

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password_for_bcrypt(password: str) -> str:
    """
    Hash password with SHA256 first to ensure it never exceeds bcrypt's 72-byte limit.
    Returns the SHA256 hash which will then be bcrypted.
    """
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(plain_password, hashed_password):
    # Hash the plain password with SHA256, then verify against bcrypt hash
    sha256_hash = hash_password_for_bcrypt(plain_password)
    return pwd_context.verify(sha256_hash, hashed_password)

def get_password_hash(password):
    # First hash with SHA256, then bcrypt the result
    sha256_hash = hash_password_for_bcrypt(password)
    return pwd_context.hash(sha256_hash)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str):
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
