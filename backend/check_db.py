"""
Diagnostic script to check database connectivity and table creation
"""
import os
import logging
from urllib.parse import quote_plus, urlparse
import mysql.connector
from sqlalchemy import create_engine, inspect

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get database credentials
database_url = os.getenv("DATABASE_URL")

if database_url:
    # Parse Railway's DATABASE_URL
    parsed = urlparse(database_url)
    db_host = parsed.hostname
    db_user = parsed.username
    db_password = parsed.password
    db_port = parsed.port or 3306
    db_name = parsed.path.lstrip('/')
    print(f"Using DATABASE_URL from Railway")
else:
    db_user = os.getenv("DB_USER", "root")
    db_password = os.getenv("DB_PASSWORD", "nivi@Cyrus123")
    db_host = os.getenv("DB_HOST", "localhost")
    db_port = os.getenv("DB_PORT", "3306")
    db_name = os.getenv("DB_NAME", "friend_tracker")
    print(f"Using individual environment variables")

print(f"DB_HOST: {db_host}")
print(f"DB_PORT: {db_port}")
print(f"DB_USER: {db_user}")
print(f"DB_NAME: {db_name}")
print()

# Step 1: Test raw MySQL connection
print("=" * 50)
print("STEP 1: Testing MySQL Connection...")
print("=" * 50)
try:
    conn = mysql.connector.connect(
        host=db_host,
        user=db_user,
        password=db_password,
        port=int(db_port)
    )
    print("✓ MySQL connection successful!")
    cursor = conn.cursor()
    
    # Check if database exists
    cursor.execute(f"SHOW DATABASES LIKE '{db_name}'")
    result = cursor.fetchone()
    if result:
        print(f"✓ Database '{db_name}' exists")
    else:
        print(f"✗ Database '{db_name}' does NOT exist")
        print(f"  Creating database '{db_name}'...")
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_name}")
        conn.commit()
        print(f"✓ Database '{db_name}' created")
    
    cursor.close()
    conn.close()
except Exception as e:
    print(f"✗ MySQL connection failed: {e}")
    import traceback
    traceback.print_exc()
    exit(1)

# Step 2: Test SQLAlchemy connection
print("\n" + "=" * 50)
print("STEP 2: Testing SQLAlchemy Connection...")
print("=" * 50)
try:
    if database_url:
        if database_url.startswith("mysql://"):
            SQLALCHEMY_DATABASE_URL = database_url.replace("mysql://", "mysql+mysqlconnector://", 1)
        else:
            SQLALCHEMY_DATABASE_URL = database_url
    else:
        password = quote_plus(db_password)
        SQLALCHEMY_DATABASE_URL = f"mysql+mysqlconnector://{db_user}:{password}@{db_host}:{db_port}/{db_name}"
    
    engine = create_engine(SQLALCHEMY_DATABASE_URL, echo=False)
    
    # Test connection
    with engine.connect() as connection:
        print("✓ SQLAlchemy connection successful!")
    
    # Check existing tables
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    print(f"✓ Existing tables: {tables if tables else 'None found'}")
    
except Exception as e:
    print(f"✗ SQLAlchemy connection failed: {e}")
    import traceback
    traceback.print_exc()
    exit(1)

# Step 3: Create tables
print("\n" + "=" * 50)
print("STEP 3: Creating Database Tables...")
print("=" * 50)
try:
    from models import Base
    
    Base.metadata.create_all(bind=engine)
    
    # Verify tables were created
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    print(f"✓ Tables created: {tables}")
    
except Exception as e:
    print(f"✗ Failed to create tables: {e}")
    import traceback
    traceback.print_exc()
    exit(1)

print("\n" + "=" * 50)
print("✓ ALL CHECKS PASSED!")
print("=" * 50)

