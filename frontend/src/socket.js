import { io } from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || (
  import.meta.env.PROD ? undefined : 'http://localhost:5000'
);

export const socket = io(BACKEND_URL, {
  autoConnect: true,
  transports: ['polling', 'websocket'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// Diagnostic logs
socket.on('connect', () => {
  console.log('✅ Connected to backend socket with ID:', socket.id);
});

socket.on('connect_error', (err) => {
  console.error('❌ Socket connection error:', err.message);
});