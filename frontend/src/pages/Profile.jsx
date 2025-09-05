// src/pages/Profile.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Profile() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Récupère le token JWT (stocké après login/register)
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login"); // si pas connecté → redirection
      return;
    }

    // Appelle ton backend
    fetch("http://127.0.0.1:5000/api/users/me", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    })
      .then(res => {
        if (!res.ok) {
          throw new Error("Impossible de charger le profil utilisateur");
        }
        return res.json();
      })
      .then(data => setUser(data))
      .catch(err => setError(err.message));
  }, [navigate]);

  if (error) {
    return (
      <div className="text-center text-red-500 mt-10">
        <p>{error}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center mt-10">
        <p>Chargement du profil...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 shadow-md rounded-xl bg-white">
      <h2 className="text-2xl font-bold mb-4">Mon Profil</h2>
      <ul className="space-y-2">
        <li><strong>Nom d'utilisateur :</strong> {user.username}</li>
        <li><strong>Email :</strong> {user.email}</li>
        <li><strong>Téléphone :</strong> {user.phone_number || "Non renseigné"}</li>
        <li><strong>Pays :</strong> {user.country}</li>
        <li><strong>Ville :</strong> {user.town}</li>
        <li><strong>Admin :</strong> {user.is_admin ? "Oui" : "Non"}</li>
      </ul>
    </div>
  );
}

export default Profile;
