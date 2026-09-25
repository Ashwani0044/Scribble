export const rooms = {};

export const createRoom = (roomCode, hostSocketId, hostUsername) => {
    rooms[roomCode] = {
        roomCode,
        host: hostSocketId,
        gameState: 'LOBBY', // "LOBBY" | "CHOOSING" | "DRAWING" | "GAME_OVER"
        currentRound: 1,
        totalRounds: 3,
        currentWord: '',
        currentDrawer: null,
        timer: 60,
        timerInterval: null,
        players: [
          {
            id: hostSocketId,
            username: hostUsername,
            score: 0,
            hasGuessed: false,
            isHost: true,
          },
        ],
      };
      return rooms[roomCode];
};

export const addPlayerToRoom = (roomCode, socketId, username) => {
    const room = rooms[roomCode];
    if (!room) return null;
  
    const newPlayer = {
      id: socketId,
      username,
      score: 0,
      hasGuessed: false,
      isHost: false,
    };
  
    room.players.push(newPlayer);
    return newPlayer;
};

export const removePlayerFromRoom = (socketId) => {
    let affectedRoomCode = null;
    let roomDeleted = false;
    let newHostId = null;
  
    for (const code in rooms) {
      const room = rooms[code];
      const playerIndex = room.players.findIndex((p) => p.id === socketId);
  
      if (playerIndex !== -1) {
        affectedRoomCode = code;
        const [removedPlayer] = room.players.splice(playerIndex, 1);
  
        // If room is now empty, delete room state
        if (room.players.length === 0) {
          if (room.timerInterval) clearInterval(room.timerInterval);
          delete rooms[code];
          roomDeleted = true;
        } else {
          // If host left, reassign host role to the next player
          if (removedPlayer.isHost || room.host === socketId) {
            room.players[0].isHost = true;
            room.host = room.players[0].id;
            newHostId = room.host;
          }
        }
        break;
      }
    }
  
    return { affectedRoomCode, roomDeleted, newHostId };
  };