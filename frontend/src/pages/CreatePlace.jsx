import React from "react";
import { useNavigate } from "react-router-dom";
import PlaceForm from "../components/place/PlaceForm";
import API, { createPlace } from "../services/api";

const CreatePlace = () => {
  const navigate = useNavigate();

  const handleCreate = async (data) => {
    try {
      // 1️⃣ Création du lieu (JSON)
      const response = await createPlace({
        ...data,
        price_by_night: Number(data.price_by_night),
        latitude: data.latitude ? Number(data.latitude) : null,
        longitude: data.longitude ? Number(data.longitude) : null,
        images: undefined, // images uploadées séparément
      });

      console.log("Place créée :", response);
      const placeId = response.id;

      // 2️⃣ Création des amenities si elles existent
      if (data.amenities && data.amenities.length > 0) {
        await Promise.all(
          data.amenities.map((amenity) =>
            API.post(`/places/${placeId}/amenities`, { name: amenity })
          )
        );
        console.log("Amenities créées et liées à la place !");
      }

      // 3️⃣ Upload des images si elles existent
      if (data.images && data.images.length > 0) {
        await Promise.all(
          data.images.map((img) => {
            if (img instanceof File) {
              // Upload local file
              const formData = new FormData();
              formData.append("file", img);
              return API.post(`/places/${placeId}/images`, formData); // axios gère Content-Type automatiquement
            } else if (typeof img === "string") {
              // URL existante
              return API.post(`/places/${placeId}/images`, { url: img });
            }
            return Promise.resolve(null); // ✅ éviter warning ESLint "array-callback-return"
          })
        );
        console.log("Images créées et liées à la place !");
      }

      // 4️⃣ Redirection vers le détail du lieu
      navigate(`/place/${placeId}`);
    } catch (err) {
      console.error("Erreur lors de la création :", err);
      alert(err.response?.data?.message || "Erreur lors de la création du lieu");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Créer un nouveau lieu</h1>
      <PlaceForm onSubmit={handleCreate} />
    </div>
  );
};

export default CreatePlace;
