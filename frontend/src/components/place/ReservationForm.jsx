// src/components/place/ReservationForm.jsx
import { useState } from "react";
import API from "../../services/api";

export default function ReservationForm({ place_Id, onReservationAdded }) {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const formatDateTime = (dt) => dt?.length === 16 ? `${dt}:00` : dt;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Vous devez être connecté pour réserver ce lieu.");
        return;
      }

      const res = await API.post(
        `/reservations/`,
        {
          place_id: place_Id,
          start_datetime: formatDateTime(start),
          end_datetime: formatDateTime(end),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setStart("");
      setEnd("");
      setSuccess("Réservation créée avec succès !");
      if (onReservationAdded) onReservationAdded(res.data);
    } catch (err) {
      console.error(err);
      const backendError = err.response?.data?.message || err.response?.data?.error || err.response?.data;
      setError(typeof backendError === "string" ? backendError : "Erreur côté serveur.");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{
      marginTop: "2rem",
      padding: "1.5rem",
      border: "1px solid #333",
      borderRadius: "8px",
      backgroundColor: "#fafafa",
      maxWidth: "600px"
    }}>
      <h3 style={{ color: "#000" }}>Réserver ce lieu :</h3>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      <div style={{ margin: "1rem 0" }}>
        <label style={{ display: "block", color: "#000", marginBottom: "0.5rem" }}>Début :</label>
        <input
          type="datetime-local"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          style={{ padding: "0.5rem", width: "100%", borderRadius: "5px", border: "1px solid #333" }}
        />
      </div>

      <div style={{ margin: "1rem 0" }}>
        <label style={{ display: "block", color: "#000", marginBottom: "0.5rem" }}>Fin :</label>
        <input
          type="datetime-local"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          style={{ padding: "0.5rem", width: "100%", borderRadius: "5px", border: "1px solid #333" }}
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
          fontWeight: "500"
        }}
        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#555")}
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#333")}
      >
        Réserver
      </button>
    </form>
  );
}
