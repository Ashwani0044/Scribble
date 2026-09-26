import { useRef, useEffect, useState } from 'react';
import { socket } from '../socket';
import { Eraser, Trash2 } from 'lucide-react';

const COLORS = [
  '#000000', '#7f7f7f', '#880015', '#ed1c24', '#ff7f27', '#fff200',
  '#22b14c', '#00a2e8', '#3f48cc', '#a349a4', '#ffffff', '#c3c3c3',
  '#b5e61d', '#99d9ea', '#7092be', '#ffaec9'
];

export default function Canvas({ roomCode, isDrawer = true }) {
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const prevPointRef = useRef(null);

  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(4);

  const clearLocalCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Fetch full canvas stroke history on load
      socket.emit('get_canvas_history', { roomCode }, (history) => {
        clearLocalCanvas();
        if (Array.isArray(history)) {
          history.forEach(({ prevPoint, currentPoint, color, lineWidth }) => {
            // The canvas renderer is intentionally stable across history callbacks.
            // eslint-disable-next-line react-hooks/immutability
            drawSegment(prevPoint, currentPoint, color, lineWidth);
          });
        }
      });

      // Socket listener for incoming remote strokes
      const handleRemoteDraw = ({ prevPoint, currentPoint, color, lineWidth }) => {
        drawSegment(prevPoint, currentPoint, color, lineWidth);
      };

      // Socket listener for clearing canvas
      const handleRemoteClear = () => {
        clearLocalCanvas();
      };

      socket.on('draw_stroke', handleRemoteDraw);
      socket.on('clear_canvas', handleRemoteClear);

      return () => {
        socket.off('draw_stroke', handleRemoteDraw);
        socket.off('clear_canvas', handleRemoteClear);
      };
  }, [roomCode]);

  // Normalizes coordinates to ratios (0.0 to 1.0) so all screens align
  const getNormalizedPoint = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    return {
      x: (clientX - rect.left) / rect.width,
      y: (clientY - rect.top) / rect.height,
    };
  };

  // Raw segment render function converting ratios back to pixel values
  const drawSegment = (p1, p2, strokeColor, strokeWidth) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const x1 = p1.x * canvas.width;
    const y1 = p1.y * canvas.height;
    const x2 = p2.x * canvas.width;
    const y2 = p2.y * canvas.height;

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  };

  const startDrawing = (e) => {
    if (!isDrawer) return;
    isDrawingRef.current = true;
    prevPointRef.current = getNormalizedPoint(e);
  };

  const draw = (e) => {
    if (!isDrawer || !isDrawingRef.current) return;

    const currentPoint = getNormalizedPoint(e);
    const prevPoint = prevPointRef.current;

    if (prevPoint) {
      // 1. Draw locally
      drawSegment(prevPoint, currentPoint, color, lineWidth);

      // 2. Emit stroke data to socket room
      socket.emit('draw_stroke', {
        roomCode,
        drawData: { prevPoint, currentPoint, color, lineWidth },
      });
    }

    prevPointRef.current = currentPoint;
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
    prevPointRef.current = null;
  };

  const clearCanvas = () => {
    if (!isDrawer) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    socket.emit('clear_canvas', { roomCode });
  };

  return (
    <div className="canvas-panel">
      {/* HTML5 Canvas Element */}
      <div className="canvas-frame">
        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          className={isDrawer ? 'drawing-canvas is-drawer' : 'drawing-canvas'}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>

      {/* Toolbar - Active only for the designated drawer */}
      {isDrawer && (
        <div className="canvas-toolbar">
          {/* Color Palette */}
          <div className="color-palette" aria-label="Color palette">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                style={{ backgroundColor: c }}
                className={`color-swatch ${color === c ? 'is-selected' : ''}`}
                aria-label={`Choose ${c}`}
              />
            ))}
          </div>

          {/* Brush Size Slider */}
          <div className="brush-size">
            <span className="toolbar-label">Size</span>
            <input
              type="range"
              min="2"
              max="30"
              value={lineWidth}
              onChange={(e) => setLineWidth(Number(e.target.value))}
              className="brush-slider"
            />
          </div>

          {/* Actions */}
          <div className="canvas-actions">
            <button className="btn btn-tool" onClick={() => setColor('#ffffff')} title="Eraser">
              <Eraser color="#4e4c4c" size={18} />
            </button>
            <button className="btn btn-danger btn-tool" onClick={clearCanvas} title="Clear Canvas">
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}