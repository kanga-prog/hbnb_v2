import { useState, useEffect } from "react";

export default function PlaceForm({ onSubmit, initialData = {} }) {
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    description: "",
    price_by_night: "",
    location: "",
    country: "",
    town: "",
    latitude: "",
    longitude: "",
    amenities: [],
  });

  const [images, setImages] = useState([]); // nouvelles images
  const [existingImages, setExistingImages] = useState([]); // images backend
  const [error, setError] = useState("");

  // ✅ Correction du useEffect pour éviter la boucle infinie
  useEffect(() => {
    if (!initialData || !initialData.id) return;

    setFormData({
      id: initialData.id || null,
      name: initialData.name || "",
      description: initialData.description || "",
      price_by_night: initialData.price_by_night || "",
      location: initialData.location || "",
      country: initialData.country || "",
      town: initialData.town || "",
      latitude: initialData.latitude || "",
      longitude: initialData.longitude || "",
      amenities: initialData.amenities || [],
    });

    setExistingImages(
      (initialData.images || []).map((img) =>
        img.url
          ? img.url
          : `http://127.0.0.1:5000/uploads/places/${img}`
      )
    );
  }, [initialData?.id]); // ✅ on dépend seulement de l'id

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAmenityChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      amenities: checked
        ? [...prev.amenities, value]
        : prev.amenities.filter((a) => a !== value),
    }));
  };

  const handleFileChange = (e) => {
    setImages([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) return setError("Le nom est obligatoire.");
    if (!formData.price_by_night || isNaN(Number(formData.price_by_night)))
      return setError("Le prix doit être un nombre.");

    try {
      await onSubmit({
        ...formData,
        price_by_night: Number(formData.price_by_night),
        latitude: formData.latitude ? Number(formData.latitude) : null,
        longitude: formData.longitude ? Number(formData.longitude) : null,
        images,
        existingImages,
      });
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'envoi");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        maxWidth: "600px",
        margin: "0 auto",
        padding: "1rem",
        border: "1px solid #ccc",
        borderRadius: "8px",
      }}
    >
      <h2>{formData.id ? "Modifier un lieu" : "Créer un lieu"}</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <label>Nom *</label>
      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        required
      />

      <label>Description</label>
      <textarea
        name="description"
        value={formData.description}
        onChange={handleChange}
        rows="4"
      />

      <label>Prix *</label>
      <input
        type="number"
        name="price_by_night"
        value={formData.price_by_night}
        onChange={handleChange}
        required
      />

      <label>Adresse</label>
      <input
        type="text"
        name="location"
        value={formData.location}
        onChange={handleChange}
      />

      <label>Pays</label>
      <input
        type="text"
        name="country"
        value={formData.country}
        onChange={handleChange}
      />

      <label>Ville</label>
      <input
        type="text"
        name="town"
        value={formData.town}
        onChange={handleChange}
      />

      <label>Latitude</label>
      <input
        type="number"
        step="any"
        name="latitude"
        value={formData.latitude}
        onChange={handleChange}
      />

      <label>Longitude</label>
      <input
        type="number"
        step="any"
        name="longitude"
        value={formData.longitude}
        onChange={handleChange}
      />

      <fieldset style={{ marginTop: "1rem" }}>
        <legend>Amenities</legend>
        {["wifi", "parking", "piscine"].map((a) => (
          <label key={a} style={{ display: "block" }}>
            <input
              type="checkbox"
              value={a}
              checked={formData.amenities.includes(a)}
              onChange={handleAmenityChange}
            />
            {a.charAt(0).toUpperCase() + a.slice(1)}
          </label>
        ))}
      </fieldset>

      {/* Anciennes images */}
      {existingImages.length > 0 && (
        <div style={{ marginTop: "1rem" }}>
          <h4>Images existantes :</h4>
          <div
            style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}
          >
            {existingImages.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt="place"
                style={{
                  width: "100px",
                  height: "100px",
                  objectFit: "cover",
                  borderRadius: "8px",
                }}
              />
            ))}
          </div>
        </div>
      )}

      <label>Ajouter des images</label>
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileChange}
      />

      {images.length > 0 && (
        <div style={{ marginTop: "1rem" }}>
          <h4>Aperçu nouvelles images :</h4>
          <div
            style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}
          >
            {Array.from(images).map((file, idx) => (
              <img
                key={idx}
                src={URL.createObjectURL(file)}
                alt="preview"
                style={{
                  width: "100px",
                  height: "100px",
                  objectFit: "cover",
                  borderRadius: "8px",
                }}
              />
            ))}
          </div>
        </div>
      )}

      <button type="submit" style={{ marginTop: "1rem" }}>
        {formData.id ? "Mettre à jour" : "Créer"}
      </button>
    </form>
  );
}
