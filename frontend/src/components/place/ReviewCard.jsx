// src/components/place/ReviewCard.jsx
import React from "react";
import StarRating from "../common/StarRating";

export default function ReviewCard({ review, onDelete, canDelete }) {
  // ✅ Construction URL avatar ou fallback
  const avatarUrl =
    review.user?.photo ||
    review.user_avatar || // si ton backend renvoie "user_avatar"
    "https://dummyimage.com/40x40/ccc/fff&text=User";

  return (
    <div className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition mb-4 flex gap-3">
      {/* Avatar */}
      <img
        src={avatarUrl}
        alt={review.user?.name || review.user_name || "Anonyme"}
        className="w-10 h-10 rounded-full object-cover"
      />

      {/* Contenu */}
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="font-semibold">
            {review.user?.name || review.user_name || "Anonyme"}
          </span>
        </div>

        {/* ⭐ Stars */}
        <StarRating rating={review.rating} setRating={() => {}} />

        {/* Texte */}
        <p className="mt-2 text-gray-700">{review.comment}</p>

        {/* Actions si owner */}
        {canDelete && (
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => onDelete(review.id)}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
            >
              Supprimer
            </button>
            <button className="bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600 text-sm">
              Modifier
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
