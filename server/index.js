const express = require("express");
const app = express(); 
const cors  = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const agentRoutes = require("./routes/agentRoutes");
const messageRoute = require("./routes/messagesRoute");
const queueRoute = require("./routes/queueRoute");
const socket = require("socket.io");
const agentSessionModel = require("./models/agentSessionModel");

//temp
const queueModel = require("./models/queueModel");
const messageModel = require("./models/messageModel");
// const corsOptions = {
//     origin: "https://chatappclient-uqau.onrender.com", // Asegúrate de que esta URL coincide exactamente con la URL de tu cliente React
//     credentials: true, // Si estás utilizando cookies o autenticación basada en tokens
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Asegúrate de incluir todos los métodos que tu aplicación utiliza
//     allowedHeaders: ['Content-Type', 'Authorization'] // Incluye aquí otros headers que tu aplicación pueda enviar
//   };
dotenv.config();
//app.use(cors());
// app.use(cors(corsOptions));
app.use(cors({
    origin: "https://chatappclient-uqau.onrender.com", // El origen de tu cliente React
    credentials: true // Asegúrate de que las credenciales están permitidas si estás utilizando cookies o autenticación basada en cabeceras
  }));
  
app.use(express.json());

//store all online users inside this map
//global.onlineAgent =  new Map();
global.onlineUser =  new Map();
global.io = null;

app.use("/api/auth", agentRoutes);
app.use("/api/message", messageRoute);
app.use("/api/chat", queueRoute)

mongoose.set('strictQuery', true);
//mongoose connection
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
    }).then(() => {
        
        console.log("DB Connection Successful!");

        agentSessionModel.deleteMany({}).then(x => console.log('agentSessionModel ok'));
        queueModel.deleteMany({}).then(x => console.log('queueModel ok'));
        messageModel.deleteMany({}).then(x => console.log('messageModel ok'));

    }).catch((err) => console.log(err));



const server = app.listen(process.env.PORT, ()=>{
    console.log(`Server started on Port ${process.env.PORT}`);
});

// status
app.get('/status', (request, response) => {
    const status = {
       'Status': 'Running'
    };
    
    response.status(200).send(status);
});


// const io = socket(server,{
//     cors: {
//         origin: "https://chatappclient-uqau.onrender.com/",
//         credentials: true,
//     },
// });
const io = socket(server, {
    cors: {
      origin: "https://chatappclient-uqau.onrender.com", // El origen de tu cliente React
      methods: ["GET", "POST"],
      credentials: true
    }
  });
  
 
io.on("connection",(socket)=>{
    
    console.log(`socket.id: ${socket.id} - socket.sessionId: ${socket.sessionId} - socket.agent: ${socket.agent}`);
    
    // join the "sessionId" room
    socket.join(socket.sessionId);

});

// io middleware
io.use(async (socket, next) => {
    
    const userId = socket.handshake.auth.userId;
    if (!userId) return next(new Error("userId requerid"));

    const filter = { agent: userId }
    const agentSession = await agentSessionModel.findOne(filter);

    if (agentSession) {
        console.log(`Exist session session.agent: ${agentSession.agent} - session.connect: ${agentSession.connected}  - session._id: ${agentSession._id}`);
        socket.sessionId = agentSession._id.toString();
        socket.agent = agentSession.agent;
        socket.connected = agentSession.connected;
        return next();
    }

    // create new session
    const newSessionId = await createSession({
        agent: userId,
        connected: true,
    });

    if(! newSessionId) return next(new Error("error create session"));
    socket.sessionId = newSessionId.toString();
    socket.agent = userId;
    socket.connected = true;

    console.log(`New session session.agent: ${userId} - session.connect: ${true}  - session._id: ${newSessionId}`);

    next();
});

global.io = io;



async function createSession (data){
    const item = await agentSessionModel.create({
        connected: data.connected,
        agent:data.agent
    });

    if(!item) return null;

    return item._id
}

// Todo:
/*
queueContoller, add user to queue when no exist agent
what happends with the socket's sessions if server crash
chats.jsx emit new user also, get user when is the first connection
*/
