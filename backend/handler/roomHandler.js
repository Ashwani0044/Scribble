import { generateRoomCode } from '../utils/roomUtils.js';
import { rooms, createRoom, addPlayerToRoom, removePlayerFromRoom } from '../utils/rooms.js';
import { startNewTurn, clearRoomTimer } from '../utils/gameEngine.js';

export const registerRoomHandlers = (io, socket) => {
  
  // CREATE ROOM
  socket.on('create_room', ({ username }, callback) => {
    if (!username || !username.trim()) {
      if (callback) callback({ success: false, error: 'Username is required' });
      return;
    }
    let roomCode = generateRoomCode();
    while (rooms[roomCode]) {
      roomCode = generateRoomCode();
    }
    const room = createRoom(roomCode, socket.id, username.trim());
    socket.join(roomCode);

    if (callback) callback({ success: true, roomCode, room });
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

    socket.to(code).emit('player_joined', { player: newPlayer, players: room.players });

    if (callback) callback({ success: true, roomCode: code, room });
  });

  // START GAME
  socket.on('start_game', ({ roomCode }, callback) => {
    const code = roomCode ? roomCode.trim().toUpperCase() : '';
    const room = rooms[code];

    if (!room) {
      if (callback) callback({ success: false, error: 'Room does not exist' });
      return;
    }
    if (room.host !== socket.id) {
      if (callback) callback({ success: false, error: 'Only host can start game' });
      return;
    }
    if (room.players.length < 2) {
      if (callback) callback({ success: false, error: 'At least 2 players are required' });
      return;
    }

    // Initialize round tracker
    room.currentRound = 1;
    room.currentDrawerIndex = 0;
    room.players.forEach((p) => (p.score = 0));

    startNewTurn(io, code);

    if (callback) callback({ success: true, room });
  });

  // SELECT WORD (Fired when drawer picks word)
  socket.on('select_word', ({ roomCode, word }) => {
    const room = rooms[roomCode];
    if (room && room.currentDrawer === socket.id) {
      import('../utils/gameEngine.js').then((engine) => {
        engine.selectWord(io, roomCode, word);
      });
    }
  });

  // DISCONNECT HANDLER
  socket.on('disconnecting', () => {
    const { affectedRoomCode, roomDeleted, newHostId } = removePlayerFromRoom(socket.id);

    if (affectedRoomCode) {
      if (roomDeleted) {
        clearRoomTimer(affectedRoomCode);
      } else {
        const room = rooms[affectedRoomCode];
        io.to(affectedRoomCode).emit('player_left', {
          socketId: socket.id,
          players: room.players,
          newHostId,
        });
      }
    }
  });
};