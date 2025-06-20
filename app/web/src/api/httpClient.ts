import axios from "axios";
// Para poder conectarse desde otros dispositivos que compartan red y poder hacer pruebas
const host = window.location.hostname;
export const httpClient = axios.create({
  baseURL: `http://${host}:8000/api/v1`,
});

// Añadir el token en cada request si existe
httpClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Manejo de errores globales
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('jwt');
      window.location.href = '/auth/login'; // Redirigir a login si está expirado o inválido
    }
    return Promise.reject(error);
  }
);