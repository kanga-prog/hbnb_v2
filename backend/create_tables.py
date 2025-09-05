#!/usr/bin/env python3
"""
Script pour créer toutes les tables de la base de données
sans utiliser Flask-Migrate
"""

from app import create_app
from app.extensions import db

app = create_app()

with app.app_context():  # Obligatoire pour que db "voit" l'app
    db.create_all()
    print("✅ Tables créées avec succès !")
