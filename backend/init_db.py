import mysql.connector
import os
from models import engine, Base

def create_database():
    try:
        # Get credentials from environment
        db_host = os.getenv("DB_HOST", "localhost")
        db_user = os.getenv("DB_USER", "root")
        db_password = os.getenv("DB_PASSWORD", "nivi@Cyrus123")
        db_port = int(os.getenv("DB_PORT", "3306"))
        db_name = os.getenv("DB_NAME", "friend_tracker")
        
        # Initial connection to create the database if it doesn't exist
        conn = mysql.connector.connect(
            host=db_host,
            user=db_user,
            password=db_password,
            port=db_port
        )
        cursor = conn.cursor()
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_name}")
        print(f"Database '{db_name}' ensured.")
        cursor.close()
        conn.close()
        
        # Now use SQLAlchemy to create tables
        print("Creating table structures via SQLAlchemy...")
        Base.metadata.create_all(bind=engine)
        print("Successfully initialized all database tables.")
        
    except Exception as e:
        print(f"Error during database initialization: {e}")

if __name__ == "__main__":
    create_database()
