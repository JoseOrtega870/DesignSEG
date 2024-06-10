from flask import Flask
from .views import register_blueprints
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    CORS(app)
    register_blueprints(app)
    
    return app