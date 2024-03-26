import axios from "axios";
 
const axiosConfig = {
  baseURL: process.env.MS_BOTURL,
  mode: "no-cors",
  headers: {
    "Content-type": "application/json",
    Accept: "application/json",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
 
    //Authorization: process.env.NEXT_PUBLIC_AUTH_TOKEN,
  },
};
 
const axiosInstance = axios.create(axiosConfig);
 
export default axiosInstance;