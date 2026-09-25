
export const registerCanvasHandlers = (io, socket) => {
    // Broadcast drawing strokes to everyone in the room except sender
    socket.on('draw_stroke', ({ roomCode, drawData }) => {
      if (!roomCode || !drawData) return;
      socket.to(roomCode).emit('draw_stroke', drawData);
    });
  
    // Broadcast clear canvas signal to the entire room
    socket.on('clear_canvas', ({ roomCode }) => {
      if (!roomCode) return;
      io.to(roomCode).emit('clear_canvas');
    });
};