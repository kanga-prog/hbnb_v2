// src/components/place/ReviewList.jsx
import { useEffect, useState, forwardRef, useImperativeHandle, useCallback } from "react";
import API from "../../services/api";
import StarRating from "../common/StarRating";


const ReviewList = forwardRef(({ place_Id }, ref) => {
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState("");
  const userId = localStorage.getItem("user_id"); // ✅ id du user connecté

  // 🔹 fetchReviews mémorisé avec useCallback
  const fetchReviews = useCallback(async () => {
    try {
      const res = await API.get(`/places/${place_Id}/reviews`);
      setReviews(res.data);
    } catch (err) {
      console.error("Erreur fetch reviews:", err);
      setError("Erreur chargement avis.");
    }
  }, [place_Id]);

  // 🔹 appel initial
  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // 🔹 expose refreshReviews() au parent via ref
  useImperativeHandle(ref, () => ({
    refreshReviews: fetchReviews,
  }));

  const handleDelete = async (reviewId) => {
    if (!window.confirm("Supprimer cet avis ?")) return;
    try {
      const token = localStorage.getItem("token");
      await API.delete(`/places/${place_Id}/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    } catch (err) {
      console.error("Erreur suppression review:", err);
      setError("Impossible de supprimer cet avis.");
    }
  };

  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ marginTop: "2rem" }}>
      <h3>Avis des utilisateurs :</h3>
      {reviews.length === 0 ? (
        <p>Aucun avis pour ce lieu.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {reviews.map((r) => (
            <li
              key={r.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "1rem",
                marginBottom: "1rem",
                display: "flex",
                alignItems: "flex-start",
                gap: "0.8rem",
              }}
            >
              <img
                src={r.user_avatar || "https://dummyimage.com/40x40/ccc/fff&text=User"}
                alt={r.user_name}
                style={{ width: "40px", height: "40px", borderRadius: "50%", marginRight: "0.8rem" }}
            />


              <div style={{ flex: 1 }}>
                <strong>{r.user_name || "Anonyme"}</strong>
                <StarRating rating={r.rating} setRating={() => {}} /> {/* lecture seule */}
                <p>{r.comment}</p>

                {userId && parseInt(userId) === r.user_id && (
                  <div style={{ marginTop: "0.5rem" }}>
                    <button
                      onClick={() => handleDelete(r.id)}
                      style={{
                        background: "red",
                        color: "white",
                        border: "none",
                        padding: "0.4rem 0.8rem",
                        borderRadius: "4px",
                        cursor: "pointer",
                        marginRight: "0.5rem",
                      }}
                    >
                      Supprimer
                    </button>
                    <button
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
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});

export default ReviewList;
