const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const agentRoutes = require("./routes/agentRoutes");
const messageRoute = require("./routes/messagesRoute");
const queueRoute = require("./routes/queueRoute");
const socket = require("socket.io");
const agentSessionModel = require("./models/agentSessionModel");

// Modelos temporales, puedes eliminar o comentar estas líneas si ya no son necesarios
const queueModel = require("./models/queueModel");
const messageModel = require("./models/messageModel");

dotenv.config();

// Configuración de CORS
app.use(cors({
  origin: "https://chatappclient-uqau.onrender.com", // URL de tu cliente React
  credentials: true,
}));
app.use(express.json());

// Variables globales, ajusta según sea necesario
global.onlineUser = new Map();
global.io = null;

// Rutas de la API
app.use("/api/auth", agentRoutes);
app.use("/api/message", messageRoute);
app.use("/api/chat", queueRoute);

// Conexión a MongoDB
mongoose.set('strictQuery', true);
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("DB Connection Successful!");
    // Limpieza inicial (esto es opcional, depende de tus requerimientos)
    agentSessionModel.deleteMany({}).then(() => console.log
