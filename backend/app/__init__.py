# app/__init__.py
from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_restx import Api
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from dotenv import load_dotenv
from datetime import timedelta
import os

from .extensions import db, migrate

# Import des namespaces
from app.routes.places import api as PLACES_NS
from app.routes.amenities import api as AMENITIES_NS
from app.routes.reservations import api as RESERVATIONS_NS
from app.routes.reviews import api as REVIEWS_NS
from app.routes.users import api as USERS_NS
from app.routes.auth import api as AUTH_NS

# Charger les variables d'environnement
load_dotenv()

def create_app():
    app = Flask(__name__)

    # CONFIGURATION
    app.config.from_object('config.Config')
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', app.config.get('SECRET_KEY'))
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)

    # EXTENSIONS
    db.init_app(app)
    migrate.init_app(app, db)
    jwt = JWTManager(app)
    mail = Mail(app)

    # CORS pour développement React
    CORS(app)

    # API REST
    api = Api(
        app,
        version='1.0',
        title='HBnB API',
        description='API HBnB avec Flask-RESTx'
    )

    # ENREGISTREMENT DES NAMESPACES
    api.add_namespace(PLACES_NS, path='/api/places')
    api.add_namespace(AMENITIES_NS, path='/api/amenities')
    api.add_namespace(RESERVATIONS_NS, path='/api/reservations')
    api.add_namespace(REVIEWS_NS, path='/api/reviews')
    api.add_namespace(USERS_NS, path='/api/users')
    api.add_namespace(AUTH_NS, path='/api/auth')

    # ROUTES POUR FICHIERS UPLOADÉS

    # Pour tous les fichiers dans /uploads
    @app.route('/uploads/<path:filename>')
    def uploaded_file(filename):
        upload_folder = os.path.join(app.root_path, "uploads")
        return send_from_directory(upload_folder, filename)

    # Pour les avatars spécifiquement
    @app.route('/uploads/avatars/<path:filename>')
    def uploaded_avatar(filename):
        upload_folder = os.path.join(app.root_path, "uploads/avatars")
        return send_from_directory(upload_folder, filename)

    return app
