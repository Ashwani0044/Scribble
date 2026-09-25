import { io } from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export const socket = io(BACKEND_URL, {
  transports: ['websocket', 'polling'],
  autoConnect: true,
});

// Diagnostic logs
socket.on('connect', () => {
  console.log('✅ Connected to backend socket with ID:', socket.id);
});

socket.on('connect_error', (err) => {
  console.error('❌ Socket connection error:', err.message);
});