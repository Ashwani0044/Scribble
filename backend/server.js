import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

// Middleware
app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

// Creating server and attaching Socket.io
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: CLIENT_ORIGIN,
        methods: ['GET', 'POST']
    },
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Scribble Backend Running' });
});

// Socket.io connection handler
io.on('connnection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on('disconnect', () => {
        console.log(`Client Disconnected: ${socket.id}`);
    });
});

httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});