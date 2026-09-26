import { io } from 'socket.io-client';

// When running inside Docker / Production, empty string forces connection to current origin
const URL = process.env.NODE_ENV === 'production' 
  ? '' 
  : 'http://localhost:5000';

export const socket = io(URL, {
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