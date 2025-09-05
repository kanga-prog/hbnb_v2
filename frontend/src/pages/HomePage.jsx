// src/pages/HomePage.jsx
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";

export default function HomePage() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/places/")
      .then((res) => {
        console.log("Places récupérées:", res.data);
        setPlaces(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur chargement des lieux :", err);
        setError("Impossible de charger les lieux.");
        setLoading(false);
      });
  }, []);

  if (loading) return <p style={{ padding: "2rem" }}>Chargement des lieux...</p>;
  if (error) return <p style={{ padding: "2rem", color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Bienvenue sur HBnB</h1>
      <p>Découvrez nos lieux ou créez le vôtre !</p>

      {/* Encadré pour créer un nouveau lieu */}
      <div style={{
        margin: "2rem 0",
        padding: "1.5rem",
        border: "1px solid #ccc",
        borderRadius: "10px",
        backgroundColor: "#f9f9f9",
        textAlign: "center"
      }}>
        <h2>Vous avez un lieu à partager ?</h2>
        <p>Ajoutez-le en quelques clics.</p>
        <Link to="/places/new">
          <button style={{
            padding: "0.7rem 1.2rem",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}>
            Créer un nouveau lieu
          </button>
        </Link>
      </div>

      {/* Liste des lieux */}
      <div>
        <h2>Nos lieux</h2>
        {places.length === 0 ? (
          <p>Aucun lieu disponible pour le moment.</p>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: "1.5rem"
          }}>
            {places.map((place) => (
              <div key={place.id} style={{
                border: "1px solid #ddd",
                borderRadius: "10px",
                padding: "1rem",
                backgroundColor: "white",
                boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
              }}>
                <Link to={`/place/${place.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                  {place.images && place.images[0] && (
                    <img
                      src={place.images[0].url}
                      alt={place.name}
                      style={{
                        width: "100%",
                        height: "150px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        marginBottom: "0.5rem"
                      }}
                    />
                  )}
                  <h3 style={{ marginBottom: "0.5rem" }}>{place.name}</h3>
                </Link>

                <p><strong>{place.price_by_night} €</strong> / nuit</p>
                <p style={{ color: "#555" }}>{place.town}, {place.country}</p>
                <p style={{ fontSize: "0.9rem", color: "#666", marginBottom: "0.5rem" }}>
                  {place.description ? place.description.slice(0, 80) : ""}...
                </p>

                {/* Amenities */}
                {Array.isArray(place.amenities) && place.amenities.length > 0 && (
                  <div style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.4rem",
                    fontSize: "0.8rem"
                  }}>
                    {place.amenities.map((a) => {
                      const name = typeof a === "string" ? a : a.name;
                      const key = typeof a === "string" ? a : a.id;
                      return (
                        <span key={key} style={{
                          padding: "0.2rem 0.5rem",
                          border: "1px solid #ccc",
                          borderRadius: "5px",
                          backgroundColor: "#f1f1f1"
                        }}>
                          {name}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
