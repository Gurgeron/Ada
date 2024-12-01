from flask import Blueprint, request, jsonify
from models.wizard import ProductContext
from sqlalchemy.orm import Session
from database import get_db
import json

wizard_bp = Blueprint('wizard', __name__)

@wizard_bp.route('/context', methods=['POST'])
def create_context():
    """Create new product context"""
    data = request.get_json()
    print(f"\n=== WIZARD DATA ===\n{json.dumps(data, indent=2)}\n==================")
    
    required_fields = ['product_name', 'product_goals', 'user_personas']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    db = get_db()
    try:
        context = ProductContext(
            product_name=data['product_name'],
            product_goals=data['product_goals'],
            user_personas=data['user_personas']
        )
        db.add(context)
        db.commit()
        print(f"✅ Context created successfully with ID: {context.id}")
        return jsonify(context.to_dict()), 201
    except Exception as e:
        db.rollback()
        print(f"❌ Error creating context: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()

@wizard_bp.route('/context/<int:context_id>', methods=['GET'])
def get_context(context_id):
    """Get product context by ID"""
    db = get_db()
    try:
        context = db.query(ProductContext).get(context_id)
        if not context:
            return jsonify({'error': 'Context not found'}), 404
        return jsonify(context.to_dict())
    finally:
        db.close()

@wizard_bp.route('/context/<int:context_id>', methods=['PUT'])
def update_context(context_id):
    """Update product context"""
    data = request.get_json()
    db = get_db()
    try:
        context = db.query(ProductContext).get(context_id)
        if not context:
            return jsonify({'error': 'Context not found'}), 404
        
        if 'product_name' in data:
            context.product_name = data['product_name']
        if 'product_goals' in data:
            context.product_goals = data['product_goals']
        if 'user_personas' in data:
            context.user_personas = data['user_personas']
        
        db.commit()
        return jsonify(context.to_dict())
    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        db.close() 