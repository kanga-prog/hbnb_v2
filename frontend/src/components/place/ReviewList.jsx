// src/components/place/ReviewList.jsx
import {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from "react";
import API from "../../services/api";
import ReviewCard from "./ReviewCard";

const ReviewList = forwardRef(({ place_Id }, ref) => {
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState("");
  const userId = localStorage.getItem("user_id"); // ✅ user connecté

  // 🔹 fetchReviews mémorisé
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

  // 🔹 expose refreshReviews() au parent
  useImperativeHandle(ref, () => ({
    refreshReviews: fetchReviews,
  }));

  // 🔹 suppression review
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

  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="mt-6">
      <h3 className="text-lg font-bold mb-4">Avis des utilisateurs :</h3>

      {reviews.length === 0 ? (
        <p className="text-gray-500">Aucun avis pour ce lieu.</p>
      ) : (
        <ul className="space-y-4">
          {reviews.map((r) => (
            <li key={r.id}>
              <ReviewCard
                review={r}
                onDelete={handleDelete}
                canDelete={userId && parseInt(userId) === r.user_id}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});

export default ReviewList;
