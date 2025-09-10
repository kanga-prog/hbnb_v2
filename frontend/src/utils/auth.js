import { jwtDecode } from "jwt-decode";

export function saveToken(token) {
  localStorage.setItem("token", token);
}

export function getToken() {
  return localStorage.getItem("token");
}

export function logout() {
  localStorage.removeItem("token");
}

export function getCurrentUser() {
  const token = getToken();
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);

    // Normalisation pour éviter les undefined
    return {
      id: decoded.sub,             // ✅ l’ID est dans "sub"
      email: decoded.email || "",  // si tu ajoutes plus tard
      name: decoded.username || "", // si tu ajoutes plus tard
      ...decoded                   // on garde le reste (exp, iat…)
    };
  } catch (err) {
    console.error("Erreur décodage JWT :", err);
    return null;
  }
}
