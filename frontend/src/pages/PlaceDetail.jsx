// src/pages/PlaceDetail.jsx
import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../services/api";
import ReviewForm from "../components/place/ReviewForm";
import ReviewList from "../components/place/ReviewList";

export default function PlaceDetail() {
  const { id } = useParams();
  const [place, setPlace] = useState(null);
  const [amenities, setAmenities] = useState([]);
  const [images, setImages] = useState([]);
  const reviewListRef = useRef(null); // 🔹 pour accéder à refreshReviews()

  useEffect(() => {
    API.get(`/places/${id}/`)
      .then((res) => {
        setPlace(res.data);
        if (res.data.images) {
          setImages(res.data.images);
        }
      })
      .catch((err) => console.error("Erreur chargement lieu:", err));

    API.get(`/places/${id}/amenities`)
      .then((res) => {
        const cleanAmenities = Array.isArray(res.data)
          ? res.data.map((a) => {
              if (typeof a === "string") return a;
              if (typeof a === "object" && a !== null && "name" in a) return a.name;
              return String(a);
            })
          : [];
        setAmenities(cleanAmenities);
      })
      .catch((err) => console.error("Erreur chargement équipements:", err));
  }, [id]);

  if (!place) return <p>Chargement...</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <Link to="/">← Retour</Link>
      <h1>{place.name}</h1>
      <p>{place.description}</p>
      <p>
        <strong>Prix :</strong> {place.price_by_night} €/nuit
      </p>

      {/* Images */}
      {images.length > 0 && (
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", margin: "1rem 0" }}>
          {images.map((img, idx) => (
            <img
              key={idx}
              src={img.url || img}
              alt={`${place.name || "Place"} - ${idx + 1}`}
              style={{
                width: "200px",
                height: "150px",
                objectFit: "cover",
                borderRadius: "8px",
              }}
            />
          ))}
        </div>
      )}

      <h3>Équipements :</h3>
      {amenities.length > 0 ? (
        <ul>
          {amenities.map((name, idx) => (
            <li key={idx}>{name}</li>
          ))}
        </ul>
      ) : (
        <p>Aucun équipement disponible.</p>
      )}

      {/* Avis */}
      <ReviewList ref={reviewListRef} placeId={id} />

      {/* Formulaire ajout avis */}
      <ReviewForm
        placeId={id}
        onReviewAdded={() => reviewListRef.current?.refreshReviews()}
      />
    </div>
  );
}
