// src/components/place/PlaceCard.jsx
import { Link, useNavigate } from "react-router-dom";

export default function PlaceCard({ place, onDelete }) {
  const navigate = useNavigate();

  const handleDelete = () => {
    if (onDelete) onDelete(place.id);
  };

  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: "10px",
        padding: "1rem",
        backgroundColor: "white",
        boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
      }}
    >
      <Link
        to={`/places/${place.id}`}
        style={{ textDecoration: "none", color: "inherit" }}
      >
        {place.images && place.images[0] && (
          <img
            src={place.images[0].url}
            alt={place.name}
            style={{
              width: "100%",
              height: "150px",
              objectFit: "cover",
              borderRadius: "8px",
              marginBottom: "0.5rem",
            }}
          />
        )}
        <h3 style={{ marginBottom: "0.5rem" }}>{place.name}</h3>
      </Link>

      {place.owner && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginTop: "0.5rem",
            marginBottom: "0.5rem",
            gap: "0.5rem",
          }}
        >
          <img
            src={place.owner.avatar || "/default-avatar.png"}
            alt={place.owner.name}
            style={{
              width: "35px",
              height: "35px",
              borderRadius: "50%",
              objectFit: "cover",
              border: "1px solid #ccc",
            }}
          />
          <span style={{ fontSize: "0.9rem", color: "#333" }}>
            {place.owner.name}
          </span>
        </div>
      )}

      <p>
        <strong>{place.price_by_night} €</strong> / nuit
      </p>
      <p style={{ color: "#555" }}>
        {place.town}, {place.country}
      </p>
      <p
        style={{
          fontSize: "0.9rem",
          color: "#666",
          marginBottom: "0.5rem",
        }}
      >
        {place.description ? place.description.slice(0, 80) : ""}...
      </p>

      {Array.isArray(place.amenities) && place.amenities.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.4rem",
            fontSize: "0.8rem",
          }}
        >
          {place.amenities.map((a) => {
            const name = typeof a === "string" ? a : a.name;
            const key = typeof a === "string" ? a : a.id;
            return (
              <span
                key={key}
                style={{
                  padding: "0.2rem 0.5rem",
                  border: "1px solid #ccc",
                  borderRadius: "5px",
                  backgroundColor: "#f1f1f1",
                }}
              >
                {name}
              </span>
            );
          })}
        </div>
      )}

      {/* Boutons pour tous */}
      <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.5rem" }}>
        <button
          onClick={() => navigate(`/places/${place.id}/edit`)}
          style={{
            background: "orange",
            color: "white",
            border: "none",
            padding: "0.4rem 0.8rem",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Modifier
        </button>
        <button
          onClick={handleDelete}
          style={{
            background: "red",
            color: "white",
            border: "none",
            padding: "0.4rem 0.8rem",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Supprimer
        </button>
      </div>
    </div>
  );
}
