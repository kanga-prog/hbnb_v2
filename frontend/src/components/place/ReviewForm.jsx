import { useState } from "react";
import API from "../../services/api"; 
import StarRating from "../common/StarRating";

export default function ReviewForm({ placeId, onReviewAdded }) {
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Vous devez être connecté pour laisser un avis.");
        return;
      }

      const res = await API.post(
        `/places/${placeId}/reviews`,
        { comment, rating }, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setComment("");
      setRating(5);

      if (onReviewAdded) onReviewAdded(res.data);
    } catch (err) {
      console.error(err);
      if (err.response) {
        setError(err.response.data?.message || "Erreur côté serveur.");
      } else {
        setError("Erreur réseau. Vérifiez votre connexion ou CORS.");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: "2rem" }}>
      <h3>Laisser un avis :</h3>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* 🔹 étoiles interactives */}
      <StarRating rating={rating} setRating={setRating} />

      <div style={{ marginBottom: "1rem", marginTop: "1rem" }}>
        <label>
          Commentaire :
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            style={{ width: "100%" }}
            placeholder="Votre avis ici..."
          />
        </label>
      </div>

      <button type="submit">Envoyer</button>
    </form>
  );
}
