from datetime import datetime
from sqlalchemy import Column, Integer, String, JSON, DateTime
from sqlalchemy.orm import relationship
from database import Base

class ProductContext(Base):
    """Model for storing product context from the wizard"""
    __tablename__ = 'product_contexts'

    id = Column(Integer, primary_key=True)
    product_name = Column(String(255), nullable=False)
    product_goals = Column(String(1000), nullable=False)
    user_personas = Column(JSON, nullable=False)  # Store as JSON array
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Add relationship to FeatureRequestData
    feature_requests = relationship("FeatureRequestData", back_populates="product_context", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'id': self.id,
            'product_name': self.product_name,
            'product_goals': self.product_goals,
            'user_personas': self.user_personas,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        } 