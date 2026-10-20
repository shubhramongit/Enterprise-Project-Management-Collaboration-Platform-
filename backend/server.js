const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
require('dotenv').config();

const { connectDB } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

connectDB();

// Register Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);

app.set('io', io);

io.on('connection', (socket) => {
    console.log('🟢 Client connected via WebSocket:', socket.id);
    socket.on('disconnect', () => console.log('🔴 Client disconnected:', socket.id));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Enterprise API running on port ${PORT}`);
});