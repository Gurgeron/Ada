from datetime import datetime
from sqlalchemy import Column, Integer, String, JSON, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
from models.wizard import ProductContext

class FeatureRequestData(Base):
    """Model for storing processed feature request data"""
    __tablename__ = 'feature_requests'

    id = Column(Integer, primary_key=True)
    context_id = Column(Integer, ForeignKey('product_contexts.id'), nullable=False)
    original_filename = Column(String(255), nullable=False)
    processed_data = Column(JSON, nullable=False)  # Stores normalized feature requests
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
            'processed_data': self.processed_data,
            'file_type': self.file_type,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        } 