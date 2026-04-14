const path = require('path');
//configura las variable de entorno desde el archivo .env
require('dotenv').config({ path: path.join(__dirname, '.env') });const express = require('express');
//cors es un middleware para permitir solicitudes desde el cliente
//session es un middleware para manejar las sesiones del usuario atraves de cookies
const cors = require('cors');
const session = require('express-session');
const { initDB } = require('./config/database');
require('./config/passport');
//passport es el middleware de autenticacion para node.js
const passport = require('passport');
//express es el framework para crear el servidor, cors es un middleware para permitir solicitudes desde el cliente
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true}));
//configura la session para que el servidor pueda mantener la sesion del usuario a traves de cookies, esto es necesario para que el cliente pueda saber si el usuario esta autenticado o no
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie:{
    secure: false,
    maxAge: 1000*60*60*24
  }
}));

//passport se encarga de manejar la autenticacion del usuario, se inicializa y se configura para usar sesiones
app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', require('./routes/auth'));
app.use('/api/clients', require('./routes/clients'));
app.use('/api/calendar', require('./routes/calendar'));

app.get('/health', (req, res) => res.json({ status: 'ok'}));
//async function para iniciar el servidor, primero se inicializa la base de datos y luego se levanta el servidor en el puerto configurado
const start = async () => {
    try {
        await initDB();
        app.listen(PORT, () => {
            console.log('servidor corriendo en puerto', PORT);
        });

    } catch (err) {
        console.error('Error iniciando el servidor: ', err);
    }
};

start();