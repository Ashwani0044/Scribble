const roomDrawings = {};

export const registerCanvasHandlers = (io, socket) => {
  // Store incoming strokes and broadcast to room
  socket.on('draw_stroke', ({ roomCode, drawData }) => {
    if (!roomDrawings[roomCode]) {
      roomDrawings[roomCode] = [];
    }
    roomDrawings[roomCode].push(drawData);
    socket.to(roomCode).emit('draw_stroke', drawData);
  });

  // Clear memory buffer and notify room
  socket.on('clear_canvas', ({ roomCode }) => {
    roomDrawings[roomCode] = [];
    io.to(roomCode).emit('clear_canvas');
  });

  // Provide canvas stroke history for mid-game sync
  socket.on('get_canvas_history', ({ roomCode }, callback) => {
    if (callback) {
      callback(roomDrawings[roomCode] || []);
    }
  });
};