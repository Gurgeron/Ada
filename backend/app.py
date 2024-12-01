from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os

# Import blueprints
from routes.wizard import wizard_bp
from routes.ada import ada_bp
from routes.data import data_bp

# Load environment variables
load_dotenv()

def create_app():
    app = Flask(__name__)
    CORS(app)

    # Configure app
    app.config['SQLALCHEMY_DATABASE_URL'] = os.getenv('DATABASE_URL', 'sqlite:///feature_insights.db')
    app.config['OPENAI_API_KEY'] = os.getenv('OPENAI_API_KEY')

    # Register blueprints with api prefix
    app.register_blueprint(wizard_bp, url_prefix='/api/wizard')
    app.register_blueprint(ada_bp, url_prefix='/api/ada')
    app.register_blueprint(data_bp, url_prefix='/api/data')

    @app.route('/health')
    def health_check():
        return {'status': 'healthy'}

    return app

if __name__ == '__main__':
    app = create_app()
    port = int(os.getenv('FLASK_RUN_PORT', 3002))
    app.run(debug=True, port=port) 