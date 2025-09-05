export default function StarRating({ rating, setRating }) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          onClick={() => setRating(n)}
          style={{
            cursor: "pointer",
            color: n <= rating ? "#FFD700" : "#CCC",
            fontSize: "1.8rem",
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}
