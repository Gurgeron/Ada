from datetime import datetime
from sqlalchemy import Column, Integer, String, JSON, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base
from models.wizard import ProductContext

class FeatureRequestData(Base):
    """Model for storing feature request data"""
    __tablename__ = 'feature_requests'

    id = Column(Integer, primary_key=True)
    context_id = Column(Integer, ForeignKey('product_contexts.id'), nullable=False)
    original_filename = Column(String(255), nullable=False)
    raw_data = Column(Text, nullable=True)  # Store raw CSV content
    processed_data = Column(JSON, nullable=True)  # Store processed JSON
    file_type = Column(String(50), nullable=False)  # 'csv' or 'excel'
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship to ProductContext
    product_context = relationship("ProductContext", back_populates="feature_requests")

    def to_dict(self):
        return {
            'id': self.id,
            'context_id': self.context_id,
            'original_filename': self.original_filename,
            'raw_data': self.raw_data if self.raw_data else None,
            'processed_data': self.processed_data if self.processed_data else None,
            'file_type': self.file_type,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        } 