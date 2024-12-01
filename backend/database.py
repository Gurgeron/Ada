from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session
from sqlalchemy.ext.declarative import declarative_base
import os
from dotenv import load_dotenv

load_dotenv()

# Use SQLite as the default database
DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///feature_insights.db')

engine = create_engine(DATABASE_URL)
db_session = scoped_session(sessionmaker(bind=engine))

Base = declarative_base()
Base.query = db_session.query_property()

def init_db():
    """Initialize the database, creating all tables"""
    from models.wizard import ProductContext
    from models.data import FeatureRequestData
    
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

def get_db():
    """Get a new database session"""
    return db_session() 