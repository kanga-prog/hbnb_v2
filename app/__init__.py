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
from app.routes.places import api as places_ns
from app.routes.amenities import api as amenities_ns
from app.routes.reservations import api as reservations_ns
from app.routes.reviews import api as reviews_ns
from app.routes.users import api as users_ns
from app.routes.auth import api as auth_ns

# Charger les variables d'environnement
load_dotenv()

def create_app():
    app = Flask(__name__)

    # Config depuis config.py
    app.config.from_object('config.Config')

    # JWT
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', app.config.get('SECRET_KEY'))
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)

    # Extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt = JWTManager(app)
    mail = Mail(app)

    # 🔹 CORS pour dev React
    CORS(app)

    # 🔹 API REST
    api = Api(
        app,
        version='1.0',
        title='HBnB API',
        description='API HBnB avec Flask-RESTx'
    )

    # 🔹 Enregistrement des namespaces
    api.add_namespace(places_ns, path='/api/places')
    api.add_namespace(amenities_ns, path='/api/amenities')
    api.add_namespace(reservations_ns, path='/api/reservations')
    api.add_namespace(reviews_ns, path='/api/reviews')
    api.add_namespace(users_ns, path='/api/users')
    api.add_namespace(auth_ns, path='/api/auth')

    # 🔹 Route pour les fichiers uploadés
    @app.route('/uploads/<path:filename>')
    def uploaded_file(filename):
        upload_folder = os.path.join(app.root_path, "uploads")
        return send_from_directory(upload_folder, filename)

    @app.route('/uploads/avatars/<path:filename>')
    def uploaded_avatar(filename):
        upload_folder = os.path.join(app.root_path, "uploads/avatars")
        return send_from_directory(upload_folder, filename)
    

    return app
