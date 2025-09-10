// src/pages/HomePage.jsx
import { useEffect, useState } from "react";
import api from "../services/api";
import PlaceCard from "../components/place/PlaceCard";

export default function HomePage() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/places/")
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

  const handleDelete = async (placeId) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce lieu ?")) return;
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/places/${placeId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlaces((prev) => prev.filter((p) => p.id !== placeId));
      alert("Lieu supprimé !");
    } catch (err) {
      console.error("Erreur suppression place :", err);
      alert(err.response?.data?.message || "Impossible de supprimer ce lieu.");
    }
  };

  if (loading) return <p style={{ padding: "2rem" }}>Chargement des lieux...</p>;
  if (error) return <p style={{ padding: "2rem", color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Nos lieux</h2>
      {places.length === 0 ? (
        <p>Aucun lieu disponible pour le moment.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {places.map((place) => (
            <PlaceCard key={place.id} place={place} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
