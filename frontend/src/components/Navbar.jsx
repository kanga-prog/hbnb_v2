// src/components/Navbar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCurrentUser, logout } from "../utils/auth";

function Navbar() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "center",
        gap: "1.5rem",
        padding: "1rem",
        backgroundColor: "#f5f5f5",
        borderBottom: "1px solid #ddd",
      }}
    >
      <Link to="/" style={{ textDecoration: "none", color: "#333" }}>
        Accueil
      </Link>

      {user ? (
        <>
          <Link to="/profile" style={{ textDecoration: "none", color: "#333" }}>
            Mon profil
          </Link>
          <Link
            to="/places/new"
            style={{ textDecoration: "none", color: "#333" }}
          >
            Créer un lieu
          </Link>
          <button
            onClick={handleLogout}
            style={{
              background: "transparent",
              border: "none",
              color: "#d9534f",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Déconnexion
          </button>
        </>
      ) : (
        <>
          <Link to="/login" style={{ textDecoration: "none", color: "#333" }}>
            Se connecter
          </Link>
          <Link to="/register" style={{ textDecoration: "none", color: "#333" }}>
            S’inscrire
          </Link>
        </>
      )}
    </nav>
  );
}

export default Navbar;
