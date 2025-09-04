import random
import smtplib
from email.message import EmailMessage
from datetime import datetime, timedelta

from flask import request, jsonify
from app.facades.user_facade import UserFacade
from flask_restx import Namespace, Resource, fields
from flask_jwt_extended import create_access_token
from werkzeug.security import check_password_hash
from app.models.user import User
from app import db

api = Namespace('auth', description='Authentication operations')

# Temp store (à remplacer par Redis ou DB pour prod)
two_factor_store = {}

# Configuration d’envoi email (ajuste selon ton fournisseur)
SMTP_SERVER = 'smtp.gmail.com'
SMTP_PORT = 587
SMTP_USER = 'teckivoire@gmail.com'
SMTP_PASSWORD = 'qzhsromouugmappf'


# === UTILITY ===
def send_2fa_code(email, code):
    msg = EmailMessage()
    msg['Subject'] = 'Your 2FA Code'
    msg['From'] = f"HBNB <{SMTP_USER}>"
    msg['To'] = email
    msg.set_content(f'Votre code de vérification 2FA est : {code}')

    with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
        server.starttls()
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.send_message(msg)

# === MODELS ===
register_model = api.model('Register', {
    'username': fields.String(required=True),
    'email': fields.String(required=True),
    'password': fields.String(required=True),
    'phone_number':fields.String(required=True)
})

login_model = api.model('Login', {
    'email': fields.String(required=True),
    'password': fields.String(required=True)
})

verify_model = api.model('Verify2FA', {
    'email': fields.String(required=True),
    'code': fields.String(required=True)
})

# === ROUTES ===

@api.route('/register')
class Register(Resource):
    @api.expect(register_model)
    def post(self):
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        phone_number = data.get('phone_number')
        country = data.get('country')
        town = data.get('town')

        # Vérification des champs manquants
        missing_fields = [field for field in ['username', 'email', 'password', 'phone_number', 'country', 'town'] if not data.get(field)]
        if missing_fields:
            return {'message': f'Missing fields: {", ".join(missing_fields)}'}, 400

        # Vérification de l'unicité de l'email
        if User.query.filter_by(email=email).first():
            return {'message': 'Email already registered'}, 409

        # Vérification de l'unicité du téléphone
        if User.query.filter_by(phone_number=phone_number).first():
            return {'message': 'Phone number already registered'}, 409    

        # Création de l'utilisateur
        new_user = User(
            username=username,
            email=email,
            phone_number=phone_number,
            country=country,
            town=town
        )
        new_user.set_password(password)

        try:
            db.session.add(new_user)
            db.session.commit()
            return {'message': 'User registered successfully'}, 201
        except SQLAlchemyError as e:
            db.session.rollback()
            return {'message': 'Internal server error', 'error': str(e)}, 500

@api.route('/login')
class Login(Resource):
    @api.expect(login_model)
    def post(self):
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        user = User.query.filter_by(email=email).first()

        if not user or not check_password_hash(user.password_hash, password):
            return {'message': 'Invalid credentials'}, 401

        # Générer un code 2FA
        code = str(random.randint(100000, 999999))
        expires = datetime.utcnow() + timedelta(minutes=10)

        # Stocker en mémoire
        two_factor_store[email] = {
            'code': code,
            'expires': expires,
            'user_id': user.id
        }

        try:
            send_2fa_code(email, code)
        except Exception as e:
            return {'message': f'Failed to send code: {str(e)}'}, 500

        return {'message': '2FA code sent to your email'}, 200

@api.route('/verify-2fa')
class Verify2FA(Resource):
    @api.expect(verify_model)
    def post(self):
        data = request.get_json()
        email = data.get('email')
        code = data.get('code')

        record = two_factor_store.get(email)
        if not record:
            return {'message': 'No code found. Please login again.'}, 404

        if datetime.utcnow() > record['expires']:
            return {'message': 'Code expired. Please login again.'}, 400

        if code != record['code']:
            return {'message': 'Invalid code'}, 401

        # Tout est OK, générer le token
        access_token = create_access_token(identity=str(record['user_id']))
        del two_factor_store[email]  # Nettoyage

        return {'access_token': access_token}, 200

api.route("/api/reset_password/", methods=["POST"])
def reset_password():
    data = request.get_json()
    email = data.get("email")
    new_password = data.get("new_password")

    if not email or not new_password:
        return jsonify({"msg": "Email and new password required"}), 400

    user = UserFacade.get_user_by_email(email)
    if not user:
        return jsonify({"msg": "User not found"}), 404

    UserFacade.update_user(user.id, password=new_password)

    return jsonify({"msg": "Password updated successfully"}), 200