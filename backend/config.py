import os

class Config:
    # Correspond à la variable .env SQLALCHEMY_DATABASE_URI
    SQLALCHEMY_DATABASE_URI = os.getenv("SQLALCHEMY_DATABASE_URI")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.getenv("FLASK_SECRET_KEY", "secret-key")

    # Configuration pour l'envoi d'e-mail via Gmail
    MAIL_SERVER = 'smtp.gmail.com'
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USE_SSL = False
    MAIL_USERNAME = 'teckivoire@gmail.com'  # Ton adresse Gmail
    MAIL_PASSWORD = 'ynsbluupsuxntxrr'      # Mot de passe d’application
    MAIL_DEFAULT_SENDER = 'teckivoire@gmail.com'
