from database import init_db, get_db
from models.data import FeatureRequestData
from models.wizard import ProductContext
import json

def create_test_data():
    """Create test data for development"""
    db = get_db()
    try:
        # Create a test product context
        context = ProductContext(
            product_name="Test Product",
            product_goals="Improve user experience and add new features",
            user_personas=[
                {
                    "name": "Enterprise User",
                    "role": "System Administrator",
                    "needs": ["API Integration", "Security"]
                },
                {
                    "name": "SMB User",
                    "role": "Business Owner",
                    "needs": ["Easy Setup", "Mobile Access"]
                }
            ]
        )
        db.add(context)
        db.commit()

        # Create test feature requests
        test_data = [
            {
                "Feature Title": "API Integration Enhancement",
                "Description": "Improve API integration capabilities",
                "Priority": "High",
                "Status": "Open",
                "Type": "Enhancement",
                "Customer Type": "Enterprise",
                "Business Value": "High",
                "Customer Impact": "High"
            },
            {
                "Feature Title": "Mobile App Support",
                "Description": "Add support for mobile devices",
                "Priority": "Medium",
                "Status": "Planned",
                "Type": "Feature",
                "Customer Type": "SMB",
                "Business Value": "Medium",
                "Customer Impact": "Medium"
            }
        ]

        feature_request = FeatureRequestData(
            context_id=context.id,
            original_filename="test_data.json",
            processed_data=test_data,
            file_type="json"
        )
        db.add(feature_request)
        db.commit()

        print("✅ Test data created successfully!")
        print(f"Context ID: {context.id}")

    except Exception as e:
        print(f"Error creating test data: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == '__main__':
    # Initialize database first
    init_db()
    # Create test data
    create_test_data() 