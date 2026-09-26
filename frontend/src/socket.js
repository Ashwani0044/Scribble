import { io } from 'socket.io-client';

const RENDER_BACKEND_URL = 'https://scribble-backend-u01h.onrender.com';

const URL = process.env.NODE_ENV === 'production' 
  ? RENDER_BACKEND_URL 
  : 'http://localhost:5000';

export const socket = io(URL, {
  autoConnect: true,
  transports: ['websocket', 'polling'], // Allow WebSocket upgrade
  reconnection: true,
  reconnectionAttempts: 5,
});

// Diagnostic logs
socket.on('connect', () => {
  console.log('✅ Connected to backend socket with ID:', socket.id);
});

socket.on('connect_error', (err) => {
  console.error('❌ Socket connection error:', err.message);
});

