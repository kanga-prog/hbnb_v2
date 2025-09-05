import { useState } from "react";

export default function PlaceForm({ onSubmit, initialData = {} }) {
  const [formData, setFormData] = useState({
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

  const [images, setImages] = useState([]); // 🖼️ gestion des images
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAmenityChange = (e) => {
    const { value, checked } = e.target;
    let updatedAmenities = [...formData.amenities];

    if (checked) {
      updatedAmenities.push(value);
    } else {
      updatedAmenities = updatedAmenities.filter((a) => a !== value);
    }

    setFormData({ ...formData, amenities: updatedAmenities });
  };

  const handleFileChange = (e) => {
    setImages([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation minimale
    if (!formData.name.trim()) {
      setError("Le nom du lieu est obligatoire.");
      return;
    }

    if (!formData.price_by_night || isNaN(Number(formData.price_by_night))) {
      setError("Le prix par nuit doit être un nombre.");
      return;
    }

    try {
      await onSubmit({
        ...formData,
        price_by_night: Number(formData.price_by_night),
        latitude: formData.latitude ? Number(formData.latitude) : null,
        longitude: formData.longitude ? Number(formData.longitude) : null,
        images, // fichiers
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
      <h2>Créer / Modifier un lieu</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <label>Nom du lieu *</label>
      <input type="text" name="name" value={formData.name} onChange={handleChange} required />

      <label>Description</label>
      <textarea name="description" value={formData.description} onChange={handleChange} rows="4" />

      <label>Prix par nuit *</label>
      <input type="number" name="price_by_night" value={formData.price_by_night} onChange={handleChange} required />

      <label>Adresse / Localisation</label>
      <input type="text" name="location" value={formData.location} onChange={handleChange} />

      <label>Pays</label>
      <input type="text" name="country" value={formData.country} onChange={handleChange} />

      <label>Ville</label>
      <input type="text" name="town" value={formData.town} onChange={handleChange} />

      <label>Latitude</label>
      <input type="number" step="any" name="latitude" value={formData.latitude} onChange={handleChange} />

      <label>Longitude</label>
      <input type="number" step="any" name="longitude" value={formData.longitude} onChange={handleChange} />

      <fieldset style={{ marginTop: "1rem" }}>
        <legend>Amenities (facultatif)</legend>
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

      <label>Images du lieu</label>
      <input type="file" multiple accept="image/*" onChange={handleFileChange} />

      {images.length > 0 && (
        <div style={{ marginTop: "1rem" }}>
          <h4>Aperçu :</h4>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {Array.from(images).map((file, idx) => (
              <img
                key={idx}
                src={URL.createObjectURL(file)}
                alt="preview"
                style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "8px" }}
              />
            ))}
          </div>
        </div>
      )}

      <button type="submit" style={{ marginTop: "1rem" }}>
        Enregistrer le lieu
      </button>
    </form>
  );
}
