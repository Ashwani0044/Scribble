import { rooms } from './rooms.js';
import { getRandomWords } from './words.js';

const TOTAL_ROUNDS = 3;
const WORD_CHOICE_TIME = 15;
const DRAWING_TIME = 60;

const roomTimers = {};

export const startNewTurn = (io, roomCode) => {
  const room = rooms[roomCode];
  if (!room) return;

  // Clear existing timer if any
  if (roomTimers[roomCode]) {
    clearInterval(roomTimers[roomCode]);
  }

  // Check if round or game ended
  if (room.currentDrawerIndex >= room.players.length) {
    room.currentDrawerIndex = 0;
    room.currentRound += 1;
  }

  if (room.currentRound > TOTAL_ROUNDS) {
    endGame(io, roomCode);
    return;
  }

  // Set active drawer
  const currentDrawerPlayer = room.players[room.currentDrawerIndex];
  if (!currentDrawerPlayer) {
    endGame(io, roomCode);
    return;
  }

  room.currentDrawer = currentDrawerPlayer.id;
  room.gameState = 'CHOOSING';
  room.wordOptions = getRandomWords(3);
  room.currentWord = null;
  room.timer = WORD_CHOICE_TIME;

  // Reset guessing status for all players
  room.players.forEach((p) => (p.hasGuessed = false));

  io.to(roomCode).emit('turn_started', {
    gameState: room.gameState,
    currentDrawer: room.currentDrawer,
    wordOptions: room.wordOptions,
    timer: room.timer,
    currentRound: room.currentRound,
    totalRounds: TOTAL_ROUNDS,
    players: room.players,
  });

  // Start Choice Countdown
  roomTimers[roomCode] = setInterval(() => {
    room.timer -= 1;
    io.to(roomCode).emit('timer_tick', { timer: room.timer });

    if (room.timer <= 0) {
      clearInterval(roomTimers[roomCode]);
      // Auto-select first word if drawer didn't choose in time
      selectWord(io, roomCode, room.wordOptions[0]);
    }
  }, 1000);
};

export const selectWord = (io, roomCode, word) => {
  const room = rooms[roomCode];
  if (!room || room.gameState !== 'CHOOSING') return;

  if (roomTimers[roomCode]) {
    clearInterval(roomTimers[roomCode]);
  }

  room.currentWord = word;
  room.gameState = 'DRAWING';
  room.timer = DRAWING_TIME;

  io.to(roomCode).emit('word_selected', {
    gameState: room.gameState,
    timer: room.timer,
    wordLength: word.length,
    drawerId: room.currentDrawer,
  });

  // Send word only to drawer privately
  io.to(room.currentDrawer).emit('secret_word', { word: room.currentWord });

  // Start Drawing Countdown
  roomTimers[roomCode] = setInterval(() => {
    room.timer -= 1;
    io.to(roomCode).emit('timer_tick', { timer: room.timer });

    if (room.timer <= 0) {
      clearInterval(roomTimers[roomCode]);
      handleTurnEnd(io, roomCode, 'Time is up!');
    }
  }, 1000);
};

export const handleTurnEnd = (io, roomCode, reason) => {
  const room = rooms[roomCode];
  if (!room) return;

  if (roomTimers[roomCode]) {
    clearInterval(roomTimers[roomCode]);
  }

  room.gameState = 'TURN_END';

  io.to(roomCode).emit('turn_ended', {
    reason,
    word: room.currentWord,
    players: room.players,
  });

  // Advance drawer index for next turn
  room.currentDrawerIndex += 1;

  // Short delay before beginning next turn
  setTimeout(() => {
    startNewTurn(io, roomCode);
  }, 4000);
};

export const endGame = (io, roomCode) => {
  const room = rooms[roomCode];
  if (!room) return;

  if (roomTimers[roomCode]) {
    clearInterval(roomTimers[roomCode]);
  }

  room.gameState = 'GAME_OVER';

  const sortedPlayers = [...room.players].sort((a, b) => b.score - a.score);

  io.to(roomCode).emit('game_over', {
    podium: sortedPlayers,
  });
};

export const clearRoomTimer = (roomCode) => {
  if (roomTimers[roomCode]) {
    clearInterval(roomTimers[roomCode]);
    delete roomTimers[roomCode];
  }
};