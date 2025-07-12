// socket.js
let io;

module.exports = {
    init: (server) => {
        const { Server } = require('socket.io');
        io = new Server(server, {
            cors: {
                origin: "http://localhost:4000",
                methods: ["GET", "POST"],
                credentials: true
            }
        });

        

        io.on('connection', (socket) => {
    const user_id = socket.handshake.query.user_id;
    const role = socket.handshake.query.role;

    if (role === 'admin') {
        console.log(`🔵 Admin connected (socket ID: ${socket.id})`);
        socket.join('adminRoom');
        console.log('Admin joined adminRoom');
    } else if (user_id) {
        console.log(`🟢 User ${user_id} connected (socket ID: ${socket.id})`);
        socket.join(`user_${user_id}`);
        console.log(`User ${user_id} joined room user_${user_id}`);
    } else {
        console.log(`⚪ Unknown client connected (socket ID: ${socket.id})`);
    }

    socket.on('disconnect', () => {
        console.log(`❌ Disconnected (socket ID: ${socket.id}, role: ${role || 'unknown'}, user_id: ${user_id || 'N/A'})`);
    });
});


        return io;
    },
    getIO: () => {
        if (!io) {
            throw new Error('Socket.io not initialized!');
        }
        return io;
    }
};
