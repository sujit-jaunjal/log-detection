const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000", // Allow the React frontend to connect
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 4000;

app.get('/', (req, res) => {
    res.send('<h1>Log Detection Backend</h1>');
});

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 