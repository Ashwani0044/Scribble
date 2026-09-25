import { rooms } from '../utils/rooms.js';
import { handleTurnEnd } from '../utils/gameEngine.js';

export const registerChatHandlers = (io, socket) => {
  socket.on('send_message', ({ roomCode, message }) => {
    const room = rooms[roomCode];
    if (!room || !message || !message.trim()) return;

    const sender = room.players.find((p) => p.id === socket.id);
    if (!sender) return;

    const trimmedMsg = message.trim();
    const isDrawer = room.currentDrawer === socket.id;

    if ((isDrawer || sender.hasGuessed) && room.gameState === 'DRAWING') {
      io.to(roomCode).emit('chat_message', {
        sender: sender.username,
        text: trimmedMsg,
        type: 'guessed',
      });
      return;
    }

    if (room.gameState === 'DRAWING' && room.currentWord) {
      const isCorrectGuess = trimmedMsg.toLowerCase() === room.currentWord.toLowerCase();

      if (isCorrectGuess) {
        sender.hasGuessed = true;
        const earnedPoints = Math.max(100, room.timer * 8);
        sender.score += earnedPoints;

        io.to(roomCode).emit('chat_message', {
          sender: 'System',
          text: `🎉 ${sender.username} guessed the word! (+${earnedPoints} pts)`,
          type: 'system-success',
        });

        io.to(roomCode).emit('update_players', { players: room.players });

        const nonDrawers = room.players.filter((p) => p.id !== room.currentDrawer);
        const allGuessed = nonDrawers.every((p) => p.hasGuessed);

        if (allGuessed) {
          handleTurnEnd(io, roomCode, 'All players guessed the word!');
        }
        return;
      }
    }

    io.to(roomCode).emit('chat_message', {
      sender: sender.username,
      text: trimmedMsg,
      type: 'user',
    });
  });
};