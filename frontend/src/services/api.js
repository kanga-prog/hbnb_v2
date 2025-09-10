import axios from 'axios';

const API = axios.create({
  baseURL: 'http://127.0.0.1:5000/api/',
});

// Ajouter automatiquement le token à chaque requête
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Crée un nouveau lieu (place)
 * @param {Object} placeData - { name, description, price_by_night, location, country, town, latitude, longitude, amenities }
 * @returns {Promise} - Résultat de la requête POST
 */
export const createPlace = async (placeData) => {
  try {
    const response = await API.post('/places', placeData);
    return response.data;
  } catch (error) {
    console.error('Erreur création du lieu :', error.response?.data || error.message);
    throw error;
  }
};

export const uploadAvatar = async (userId, file) => {
  const formData = new FormData();
  formData.append("avatar", file);
  const token = localStorage.getItem("token");
  const res = await API.post(`/users/${userId}/avatar`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export default API;
