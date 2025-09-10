import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import ReviewForm from "../components/place/ReviewForm";
import ReviewList from "../components/place/ReviewList";
import ReservationForm from "../components/place/ReservationForm";
import { getCurrentUser } from "../utils/auth"; // 🔑 récupère l'utilisateur connecté (selon ton utilitaire auth.js)

export default function PlaceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [place, setPlace] = useState(null);
  const [amenities, setAmenities] = useState([]);
  const [images, setImages] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [currentUser, setCurrentUser] = useState(null); // 👤 user connecté
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
    // 🔑 on charge l'utilisateur courant
    setCurrentUser(getCurrentUser());

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

  const handleDelete = async () => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce lieu ?")) return;

    try {
      await API.delete(`/places/${id}/`);
      alert("Lieu supprimé avec succès !");
      navigate("/"); // retour à la page d’accueil
    } catch (err) {
      console.error("Erreur suppression lieu:", err);
      alert("Impossible de supprimer ce lieu.");
    }
  };

  const handleEdit = () => {
    navigate(`/places/${id}/edit`);
  };

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

      {/* ✅ Boutons visibles seulement si user = propriétaire */}
      {currentUser?.id === place.owner_id && (
        <div className="flex gap-4 mt-6">
          <button
            onClick={handleEdit}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Modifier
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Supprimer
          </button>
        </div>
      )}
    </div>
  );
}
