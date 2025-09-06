import { useEffect, useState, useRef, useCallback } from "react"; 
import { useParams, Link } from "react-router-dom";
import API from "../services/api";
import ReviewForm from "../components/place/ReviewForm";
import ReviewList from "../components/place/ReviewList";
import ReservationForm from "../components/place/ReservationForm";

export default function PlaceDetail() {
  const { id } = useParams();
  const [place, setPlace] = useState(null);
  const [amenities, setAmenities] = useState([]);
  const [images, setImages] = useState([]);
  const [reservations, setReservations] = useState([]);
  const reviewListRef = useRef(null);

  const loadReservations = useCallback(() => {
    API.get(`/reservations/place/${id}`)
      .then((res) => setReservations(res.data || []))
      .catch((err) => {
        console.error("Erreur chargement réservations:", err);
        setReservations([]);
      });
  }, [id]);

  useEffect(() => {
    API.get(`/places/${id}/`)
      .then((res) => {
        setPlace(res.data);
        if (res.data.images) setImages(res.data.images);
      })
      .catch((err) => console.error("Erreur chargement lieu:", err));

    API.get(`/places/${id}/amenities`)
      .then((res) => {
        const cleanAmenities = Array.isArray(res.data)
          ? res.data.map((a) => (typeof a === "string" ? a : a.name || String(a)))
          : [];
        setAmenities(cleanAmenities);
      })
      .catch((err) => console.error("Erreur chargement équipements:", err));

    loadReservations();
  }, [id, loadReservations]);

  if (!place) return <p>Chargement...</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <Link to="/">← Retour</Link>
      <h1>{place.name}</h1>
      <p>{place.description}</p>
      <p><strong>Prix :</strong> {place.price_by_night} €/nuit</p>

      {/* Images */}
      {images.length > 0 && (
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", margin: "1rem 0" }}>
          {images.map((img, idx) => (
            <img
              key={idx}
              src={img.url || img}
              alt={`${place.name || "Place"} - ${idx + 1}`}
              style={{ width: "200px", height: "150px", objectFit: "cover", borderRadius: "8px" }}
            />
          ))}
        </div>
      )}

      <h3>Équipements :</h3>
      {amenities.length > 0 ? (
        <ul>{amenities.map((name, idx) => <li key={idx}>{name}</li>)}</ul>
      ) : (
        <p>Aucun équipement disponible.</p>
      )}

      {/* Réservations */}
      <h3>Réservations :</h3>
      {reservations.length > 0 ? (
        reservations.map((r) => (
          <p key={r.id}>
            {new Date(r.start_datetime).toLocaleString()} → {new Date(r.end_datetime).toLocaleString()}
          </p>
        ))
      ) : (
        <p>Aucune réservation pour ce lieu.</p>
      )}

      {/* Formulaire réservation */}
      <ReservationForm place_Id={parseInt(id, 10)} onReservationAdded={loadReservations} />

      {/* Avis */}
      <ReviewList ref={reviewListRef} place_Id={parseInt(id, 10)} />
      <ReviewForm place_Id={parseInt(id, 10)} onReviewAdded={() => reviewListRef.current?.refreshReviews()} />
    </div>
  );
}
