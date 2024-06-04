from flask import Flask
from .views import register_blueprints

def create_app():
    app = Flask(__name__)
    
    register_blueprints(app)
    print(app.url_map)
    return app