import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../utils/auth";
import API, { uploadAvatar } from "../services/api";
import StarRating from "../components/common/StarRating";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const currentUser = getCurrentUser(); // ✅ ici tu récupères l’utilisateur
    console.log("Utilisateur courant :", currentUser);

    // Si pas connecté -> redirection
    if (!currentUser) {
      navigate("/login");
      return;
    }

    // Normalise l'id (au cas où ce serait `_id` dans ton backend)
    const userId = currentUser.id || currentUser._id || currentUser.userId;
    if (!userId) {
      console.error("❌ Pas d'ID utilisateur valide :", currentUser);
      navigate("/login");
      return;
    }

    setUser({ ...currentUser, id: userId }); // ✅ force la présence de `id`

    // Charge les données
    API.get(`/reservations/user/${userId}`)
      .then(res => setReservations(res.data))
      .catch(err => console.error("Erreur réservations :", err));

    API.get(`/reviews/user/${userId}`)
      .then(res => setReviews(res.data))
      .catch(err => console.error("Erreur avis :", err))
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleAvatarChange = (e) => {
    if (e.target.files.length > 0) setAvatarFile(e.target.files[0]);
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile || !user) return;
    try {
      const data = await uploadAvatar(user.id, avatarFile);
      setUser(prev => ({ ...prev, photo: data.url }));
      setAvatarFile(null);
      setMessage("Avatar mis à jour !");
      setTimeout(() => setMessage(""), 2000);
    } catch (err) {
      console.error(err);
      setMessage("Erreur lors de l'upload de l'avatar");
    }
  };

  if (!user || loading) {
    return <p className="text-center mt-10 text-gray-600">Chargement...</p>;
  }

  const totalReservations = reservations.length;
  const totalReviews = reviews.length;
  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Message */}
      {message && (
        <p className="mb-4 text-center text-green-500 font-semibold">{message}</p>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
        <div className="relative">
          <img 
            src={user.avatar ? `http://127.0.0.1:5000${user.avatar}` : "/default-avatar.png"} 
            alt="Avatar"
            className="w-40 h-40 rounded-full shadow-lg object-cover hover:scale-105 transition-transform"
          />
          <input
            type="file"
            name="avatar"
            onChange={handleAvatarChange}
            className="mt-2"
          />
          {avatarFile && (
            <button
              onClick={handleAvatarUpload}
              className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
            >
              Mettre à jour
            </button>
          )}
        </div>

        <div className="flex-1">
          <h1 className="text-3xl font-bold">{user.name}</h1>
          <p className="text-gray-600">{user.email}</p>

          <div className="flex gap-4 mt-3 font-semibold text-gray-700">
            <span>Réservations : {totalReservations}</span>
            <span>Avis : {totalReviews}</span>
            <span>Note moyenne : {avgRating} ⭐</span>
          </div>

          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
            Modifier le profil
          </button>
        </div>
      </div>

      {/* Mes réservations */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4 border-b pb-2">Mes réservations</h2>
        {reservations.length === 0 ? (
          <p className="text-gray-500">Pas de réservation pour le moment.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {reservations.map(r => (
              <div key={r.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
                <img
                  src={r.place_image || "/default-place.png"}
                  alt={r.place_name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold">{r.place_name}</h3>
                  <div className="flex gap-2 my-1 flex-wrap">
                    <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-sm">{r.type || "Appartement"}</span>
                    <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-sm">{r.city}</span>
                  </div>
                  <p>Date : {new Date(r.date).toLocaleDateString()}</p>
                  <p>Prix : {r.price_by_night} € / nuit</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Mes avis */}
      <section>
        <h2 className="text-2xl font-bold mb-4 border-b pb-2">Mes avis</h2>
        {reviews.length === 0 ? (
          <p className="text-gray-500">Aucun avis laissé pour le moment.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {reviews.map(r => (
              <div key={r.id} className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition">
                <h3 className="text-lg font-semibold">{r.place_name}</h3>
                <StarRating rating={r.rating} setRating={() => {}} />
                <p className="mt-2 text-gray-700">{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
