import { generateRoomCode } from '../utils/roomUtils.js';
import { rooms, createRoom, addPlayerToRoom, removePlayerFromRoom } from '../utils/rooms.js';

export const registerRoomHandlers = (io, socket) => {
  
  // CREATE ROOM
  socket.on('create_room', ({ username }, callback) => {
    if (!username || !username.trim()) {
      if (callback) callback({ success: false, error: 'Username is required' });
      return;
    }

    // Generate unique room code
    let roomCode = generateRoomCode();
    while (rooms[roomCode]) {
      roomCode = generateRoomCode();
    }

    const room = createRoom(roomCode, socket.id, username.trim());
    socket.join(roomCode);

    console.log(`Room Created: ${roomCode} by ${username} (${socket.id})`);

    // Respond back to creator with room details
    if (callback) {
      callback({
        success: true,
        roomCode,
        room,
      });
    }
  });

  // JOIN ROOM
  socket.on('join_room', ({ roomCode, username }, callback) => {
    const code = roomCode ? roomCode.trim().toUpperCase() : '';
    const room = rooms[code];

    if (!room) {
      if (callback) callback({ success: false, error: 'Room does not exist' });
      return;
    }

    if (!username || !username.trim()) {
      if (callback) callback({ success: false, error: 'Username is required' });
      return;
    }

    if (room.gameState !== 'LOBBY') {
      if (callback) callback({ success: false, error: 'Game has already started in this room' });
      return;
    }

    const newPlayer = addPlayerToRoom(code, socket.id, username.trim());
    socket.join(code);

    console.log(`${username} joined room ${code}`);

    // Notify other players in room that a new player joined
    socket.to(code).emit('player_joined', {
      player: newPlayer,
      players: room.players,
    });

    if (callback) {
      callback({
        success: true,
        roomCode: code,
        room,
      });
    }
  });

  // DISCONNECT HANDLER
  socket.on('disconnecting', () => {
    const { affectedRoomCode, roomDeleted, newHostId } = removePlayerFromRoom(socket.id);

    if (affectedRoomCode) {
      if (roomDeleted) {
        console.log(`Room ${affectedRoomCode} deleted (all players left)`);
      } else {
        const room = rooms[affectedRoomCode];
        console.log(`Player ${socket.id} left room ${affectedRoomCode}`);

        // Broadcast player left and updated room state
        io.to(affectedRoomCode).emit('player_left', {
          socketId: socket.id,
          players: room.players,
          newHostId,
        });
      }
    }
  });
};