// src/pages/VerifyCode.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function VerifyCode() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const email = localStorage.getItem("pendingEmail");
    if (!email) {
      setMessage("Session expirée, veuillez vous reconnecter.");
      return navigate("/login");
    }

    try {
      const response = await fetch("http://127.0.0.1:5000/api/auth/verify-2fa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, code })
      });

      const data = await response.json();

      if (response.ok && data.access_token) {
        // ✅ Stockage du JWT
        localStorage.setItem("token", data.access_token);
        localStorage.removeItem("pendingEmail");
        setMessage("Connexion réussie !");
        setTimeout(() => navigate("/"), 1500);
      } else {
        setMessage(data.message || "Code invalide.");
      }
    } catch (error) {
      console.error("Erreur :", error);
      setMessage("Impossible de contacter le serveur.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 shadow-md rounded-xl bg-white">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Vérification du code
      </h2>
      {message && (
        <p className="mb-4 text-center text-red-500">{message}</p>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Entrez le code reçu par email"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
          className="w-full p-2 border rounded"
        />
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
        >
          Vérifier
        </button>
      </form>
    </div>
  );
}

export default VerifyCode;
