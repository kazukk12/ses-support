from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.sql import func
from ..db.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=True)  # OAuth用にnullable
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)

    # OAuth関連
    google_id = Column(String, unique=True, nullable=True)
    avatar_url = Column(Text, nullable=True)

    # タイムスタンプ
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<User(email='{self.email}', name='{self.name}')>"