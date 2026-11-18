import os
from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not set. Copy .env.example to .env and fill in your Supabase connection string.")

engine = create_engine(
    DATABASE_URL,
    pool_size=3,
    max_overflow=5,
    pool_timeout=30,
    pool_pre_ping=True,
    connect_args={"connect_timeout": 10},
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class User(Base):
    __tablename__ = "users"
    id         = Column(Integer, primary_key=True, index=True)
    name       = Column(String, nullable=False)
    email      = Column(String, unique=True, index=True, nullable=False)
    password   = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    analyses   = relationship("Analysis", back_populates="user", cascade="all, delete")


class Analysis(Base):
    __tablename__ = "analyses"
    id               = Column(Integer, primary_key=True, index=True)
    user_id          = Column(Integer, ForeignKey("users.id"), nullable=False)
    repo_url         = Column(String, nullable=False)
    repo_name        = Column(String, nullable=False)
    repo_owner       = Column(String, nullable=False)
    health_score     = Column(Integer, default=0)
    health_grade     = Column(String, default="")
    total_files      = Column(Integer, default=0)
    high_risk        = Column(Integer, default=0)
    medium_risk      = Column(Integer, default=0)
    low_risk         = Column(Integer, default=0)
    result_json      = Column(Text, nullable=True)
    tech_stack_json  = Column(Text, nullable=True)
    setup_guide_json = Column(Text, nullable=True)
    impact_json      = Column(Text, nullable=True)
    created_at       = Column(DateTime, default=datetime.utcnow)
    user             = relationship("User", back_populates="analyses")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    Base.metadata.create_all(bind=engine)
