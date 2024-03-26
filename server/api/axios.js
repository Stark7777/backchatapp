const axios = require("axios");

const axiosConfig = {
  baseURL: process.env.MS_BOTURL,
  // mode: "no-cors", // Esta línea no es necesaria para el backend y puede ser eliminada
  headers: {
    "Content-type": "application/json",
    Accept: "application/json",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
    // Authorization: process.env.NEXT_PUBLIC_AUTH_TOKEN, // Descomenta si necesitas autorización
  },
};

const axiosInstance = axios.create(axiosConfig);

module.exports = axiosInstance;
