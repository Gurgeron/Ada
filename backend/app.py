from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os

# Import blueprints
from routes.wizard import wizard_bp
from routes.ada import ada_bp
from routes.data import data_bp
from routes.insights import insights_bp
from routes.podcast import podcast_bp

# Load environment variables
load_dotenv()

def create_app():
    app = Flask(__name__)
    
    # Configure CORS with specific origins and options
    CORS(app, resources={
        r"/api/*": {
            "origins": ["http://localhost:3000"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })

    # Configure app
    app.config['SQLALCHEMY_DATABASE_URL'] = os.getenv('DATABASE_URL', 'sqlite:///feature_insights.db')
    app.config['OPENAI_API_KEY'] = os.getenv('OPENAI_API_KEY')

    # Register blueprints with api prefix
    app.register_blueprint(wizard_bp, url_prefix='/api/wizard')
    app.register_blueprint(ada_bp, url_prefix='/api/ada')
    app.register_blueprint(data_bp, url_prefix='/api/data')
    app.register_blueprint(insights_bp, url_prefix='/api/insights')
    app.register_blueprint(podcast_bp, url_prefix='/api/podcast')

    @app.route('/health')
    def health_check():
        return {'status': 'healthy'}

    return app

if __name__ == '__main__':
    app = create_app()
    port = int(os.getenv('FLASK_RUN_PORT', 3002))
    app.run(debug=True, port=port) 