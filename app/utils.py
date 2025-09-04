import os
from werkzeug.utils import secure_filename
from flask import url_for, current_app

def save_file(file):
    """
    Sauvegarde un fichier dans /uploads et retourne son URL publique.
    """
    # Dossier uploads
    upload_folder = os.path.join(current_app.root_path, "uploads")
    os.makedirs(upload_folder, exist_ok=True)

    # Nom sécurisé
    filename = secure_filename(file.filename)
    filepath = os.path.join(upload_folder, filename)

    # Sauvegarde physique
    file.save(filepath)

    # Retourne URL publique
    return url_for("uploaded_file", filename=filename, _external=True)
