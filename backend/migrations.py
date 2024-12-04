from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from database import Base
from models.data import FeatureRequestData, SheetsConfig
import os

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///feature_insights.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize SQLAlchemy with app
db = SQLAlchemy(app)
migrate = Migrate(app, db)

if __name__ == '__main__':
    app.run() 