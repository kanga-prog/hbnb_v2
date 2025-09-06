import { useState } from "react";
import API from "../../services/api";
import StarRating from "../common/StarRating";

export default function ReviewForm({ place_Id, onReviewAdded }) {
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
        `/places/${place_Id}/reviews`,
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
    <form
      onSubmit={handleSubmit}
      style={{
        marginTop: "2rem",
        padding: "1.5rem",
        border: "1px solid #333",
        borderRadius: "8px",
        backgroundColor: "#fafafa",
        maxWidth: "600px",
      }}
    >
      <h3 style={{ marginBottom: "1rem", color: "#000" }}>Laisser un avis :</h3>

      {/* Bloc d'erreur esthétique */}
      {error && (
        <div
          style={{
            border: "1px solid #333",
            backgroundColor: "#f0f0f0",
            color: "#000",
            padding: "0.75rem 1rem",
            borderRadius: "5px",
            marginBottom: "1rem",
            fontWeight: "500",
          }}
        >
          {error}
        </div>
      )}

      {/* Étoiles interactives */}
      <StarRating rating={rating} setRating={setRating} />

      <div style={{ margin: "1rem 0" }}>
        <label
          style={{ display: "block", marginBottom: "0.5rem", color: "#000" }}
        >
          Commentaire :
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          style={{
            width: "100%",
            padding: "0.5rem",
            borderRadius: "5px",
            border: "1px solid #333",
            fontFamily: "inherit",
            fontSize: "1rem",
            color: "#000",
            backgroundColor: "#fff",
            resize: "vertical",
          }}
          placeholder="Votre avis ici..."
        />
      </div>

      <button
        type="submit"
        style={{
          padding: "0.6rem 1.2rem",
          borderRadius: "5px",
          border: "none",
          backgroundColor: "#333",
          color: "#fff",
          cursor: "pointer",
          fontWeight: "500",
          transition: "background-color 0.2s ease",
        }}
        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#555")}
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#333")}
      >
        Envoyer
      </button>
    </form>
  );
}
