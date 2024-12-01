from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class FeatureRequest(Base):
    """Model for storing feature requests"""
    __tablename__ = 'feature_request_items'

    id = Column(Integer, primary_key=True)
    context_id = Column(Integer, ForeignKey('product_contexts.id'), nullable=False)
    feature_title = Column(String(255), nullable=False)
    description = Column(String(1000))
    priority = Column(String(50))
    status = Column(String(50))
    product = Column(String(255))
    request_channel = Column(String(100))
    customer_type = Column(String(100))
    type = Column(String(100))
    requested_by = Column(String(255))
    request_date = Column(DateTime)
    business_value = Column(String(50))
    implementation_complexity = Column(String(50))
    customer_impact = Column(String(50))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship to ProductContext
    product_context = relationship("ProductContext", back_populates="feature_requests")

    def to_dict(self):
        return {
            'id': self.id,
            'context_id': self.context_id,
            'feature_title': self.feature_title,
            'description': self.description,
            'priority': self.priority,
            'status': self.status,
            'product': self.product,
            'request_channel': self.request_channel,
            'customer_type': self.customer_type,
            'type': self.type,
            'requested_by': self.requested_by,
            'request_date': self.request_date.isoformat() if self.request_date else None,
            'business_value': self.business_value,
            'implementation_complexity': self.implementation_complexity,
            'customer_impact': self.customer_impact,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        } 