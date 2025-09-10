import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import PlaceForm from "../components/place/PlaceForm";

export default function EditPlace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get(`/places/${id}/`)
      .then((res) => {
        setPlace(res.data); // passe directement l'objet
      })
      .catch((err) => {
        console.error("Erreur chargement lieu:", err);
        alert("Impossible de charger le lieu.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleUpdate = async (data) => {
    try {
      const formData = new FormData();

      // Champs texte / numériques
      for (const key of [
        "name",
        "description",
        "price_by_night",
        "location",
        "country",
        "town",
        "latitude",
        "longitude",
      ]) {
        if (data[key] !== undefined) formData.append(key, data[key]);
      }

      // Amenities
      if (data.amenities) {
        data.amenities.forEach((a) => formData.append("amenity_ids", a));
      }

      // Nouvelles images
      if (data.images && data.images.length > 0) {
        data.images.forEach((file) => formData.append("files", file));
      }

      // Existing images si backend nécessite
      if (data.existingImages) {
        data.existingImages.forEach((img) =>
          formData.append("existing_images", img.url || img)
        );
      }

      await API.put(`/places/${id}/`, data); // ou formData si ton backend accepte multipart

      alert("Lieu mis à jour !");
      navigate(`/places/${id}`);
    } catch (err) {
      console.error("Erreur mise à jour :", err);
      alert(err.response?.data?.message || "Erreur lors de la mise à jour");
    }
  };

  if (loading) return <p>Chargement...</p>;
  if (!place) return <p>Lieu introuvable.</p>;

  return <PlaceForm onSubmit={handleUpdate} initialData={place} />;
}
