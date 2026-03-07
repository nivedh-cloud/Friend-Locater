import mysql.connector
from models import engine, Base

def create_database():
    try:
        # Initial connection to create the database if it doesn't exist
        conn = mysql.connector.connect(
            host="localhost",
            user="root",
            password="nivi@Cyrus123",
            port=3306
        )
        cursor = conn.cursor()
        cursor.execute("CREATE DATABASE IF NOT EXISTS friend_tracker")
        print("Database 'friend_tracker' ensured.")
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
