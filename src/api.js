import axios from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000";

const API_PREFIX = "/api";

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}${API_PREFIX}`,
  timeout: 15000,
  withCredentials: false,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const normalizedError = error;
    if (error.response?.data) {
      normalizedError.message =
        error.response.data.message ||
        error.response.data.error ||
        error.message;
      normalizedError.data = error.response.data;
      normalizedError.status = error.response.status;
    }
    return Promise.reject(normalizedError);
  }
);

const buildImageUrl = (value) => {
  if (!value) return "";
  if (value.startsWith("http")) return value;

  const normalized = value.replace(/\\/g, "/").replace(/^\/+/, "");
  return `${API_BASE_URL}/uploads/${normalized.startsWith("uploads/") ? normalized.replace(/^uploads\//, "") : normalized}`;
};

export const uploadMeal = async (file) => {
  const formData = new FormData();
  formData.append("image", file);

  const { data } = await apiClient.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data;
};

export const predictMeal = async (file) => {
  const formData = new FormData();
  formData.append("image", file);

  const { data } = await apiClient.post("/predict", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data;
};

export const getMeals = async () => {
  const { data } = await apiClient.get("/meals");
  return Array.isArray(data) ? data : [];
};

export const saveMeal = async (payload) => {
  const { data } = await apiClient.post("/save_meal", payload);
  return data;
};

export const login = async (credentials) => {
  const { data } = await apiClient.post("/login", credentials);
  return data;
};

export const getProfile = async () => {
  const { data } = await apiClient.get("/profile");
  return data;
};

export const resolveBackendImage = (value) => {
  const url = buildImageUrl(value);
  return url || "/img/home-decor-1.jpeg";
};

export default {
  API_BASE_URL,
  apiClient,
  uploadMeal,
  predictMeal,
  getMeals,
  saveMeal,
  login,
  getProfile,
  resolveBackendImage,
};
