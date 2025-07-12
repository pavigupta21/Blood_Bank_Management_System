// const cookieParser = require('cookie-parser');
// const express = require('express');
// require('dotenv').config();
// const app = express();
// const path = require('path');

// const http = require('http');
// const { Server } = require('socket.io');
// const server = http.createServer(app);
// const io = new Server(server, {
//     cors: {
//         origin: "http://localhost:4000",
//         methods: ["GET", "POST"],
//         credentials: true
//     }
// });



// const authRoutes = require('./routes/authRoutes');
// const stockRoutes = require('./routes/stockRoutes');
// const donorRoutes = require('./routes/donorRoutes');
// const patientRoutes = require('./routes/patientRoutes');
// const notificationRoutes = require('./routes/notificationRoutes');

// app.set('view engine', 'ejs');
// app.use(express.json());
// app.use(express.urlencoded({ extended:true }));
// app.use(express.static(path.join(__dirname, 'public')));
// app.use(cookieParser());
// app.use(authRoutes);
// app.use(stockRoutes);
// app.use(donorRoutes);
// app.use(patientRoutes);
// app.use(notificationRoutes);





// io.on('connection', (socket) => {
//     console.log('User connected:', socket.id);

//      const userId = socket.handshake.query.user_id;

//     if (userId) {
//         // Join a user-specific room
//         socket.join(`user_${userId}`);
//         console.log(`User ${userId} connected and joined room user_${userId}`);
//     }

//     socket.on('disconnect', () => {
//         console.log('User disconnected:', socket.id);
//     });
// });
// module.exports = { server, io };

// app.get('/', (req, res) => {
//     res.render('index');
// });

// server.listen(4000, () => {
//     console.log("Server running on http://localhost:4000");
// });
const express = require('express');
const cookieParser = require('cookie-parser');
const http = require('http');
require('dotenv').config();
const path = require('path');

const app = express();
const server = http.createServer(app);

const socket = require('./socket'); // ✅ NEW
const io = socket.init(server);     // ✅ Initialize socket.io

// Middlewares & routes
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

// Route imports AFTER socket initialized
const authRoutes = require('./routes/authRoutes');
const stockRoutes = require('./routes/stockRoutes');
const donorRoutes = require('./routes/donorRoutes');
const patientRoutes = require('./routes/patientRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
app.use(authRoutes, stockRoutes, donorRoutes, patientRoutes, notificationRoutes);

app.get('/', (req, res) => res.render('index'));
server.listen(4000, () => console.log("Server running on http://localhost:4000"));
