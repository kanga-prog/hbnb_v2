// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";


function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch("http://127.0.0.1:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        // ✅ Le backend a envoyé le code 2FA
        setMessage("Un code de vérification a été envoyé à votre email.");
        // Sauvegarde temporaire de l’email pour la page Verify
        localStorage.setItem("pendingEmail", formData.email);
        setTimeout(() => navigate("/verify"), 1500);
      } else {
        setMessage(data.message || "Email ou mot de passe incorrect.");
      }
    } catch (error) {
      console.error("Erreur :", error);
      setMessage("Impossible de contacter le serveur.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 shadow-md rounded-xl bg-white">
      <h2 className="text-2xl font-bold mb-4 text-center">Se connecter</h2>
      {message && (
        <p className="mb-4 text-center text-red-500">{message}</p>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          name="email"
          placeholder="Adresse e-mail"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
        <input
          type="password"
          name="password"
          placeholder="Mot de passe"
          value={formData.password}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Se connecter
        </button>
      </form>
      <p className="mt-4 text-center">
        Pas encore inscrit ?{" "}
        <span
          onClick={() => navigate("/register")}
          className="text-blue-600 cursor-pointer"
        >
          Créer un compte
        </span>
      </p>
    </div>
  );
}

export default LoginPage;
