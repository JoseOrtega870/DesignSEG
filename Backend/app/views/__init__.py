# Importing individual blueprints from their respective modules
from .areas import bp as areas_bp
from .login import bp as login_bp
from .orders import bp as orders_bp
from .products import bp as products_bp
from .proposals import bp as proposals_bp
from .users import bp as users_bp

# List of blueprints to be registered
blueprints = [areas_bp, login_bp, orders_bp, products_bp, proposals_bp, users_bp]

def register_blueprints(app):
    for bp in blueprints:
        app.register_blueprint(bp)