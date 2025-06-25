const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const Monitor = require('./monitor');
const rulesApi = require('./api/rules');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000", // Allow the React frontend to connect
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());
app.use('/api/rules', rulesApi);

const PORT = process.env.PORT || 4000;

app.get('/', (req, res) => {
    res.send('<h1>Log Detection Backend</h1>');
});

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);

    // Start the monitoring system and pass the io instance
    const monitor = new Monitor(io);
    monitor.start();
}); 