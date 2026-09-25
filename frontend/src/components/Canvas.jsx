import { useRef, useEffect, useState } from 'react';
import { socket } from '../socket';
import { Eraser, Trash2 } from 'lucide-react';

const COLORS = [
  '#000000', '#ffffff', '#ef4444', '#f97316', '#eab308',
  '#22c55e', '#06b6d4', '#3b82f6', '#a855f7', '#ec4899', '#78350f'
];

export default function Canvas({ roomCode, isDrawer = true }) {
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const prevPointRef = useRef(null);

  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(4);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Handle high DPI crisp drawing
    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Socket listener for incoming remote strokes
    const handleRemoteDraw = ({ prevPoint, currentPoint, color, lineWidth }) => {
      drawSegment(prevPoint, currentPoint, color, lineWidth);
    };

    // Socket listener for clearing canvas
    const handleRemoteClear = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    socket.on('draw_stroke', handleRemoteDraw);
    socket.on('clear_canvas', handleRemoteClear);

    return () => {
      socket.off('draw_stroke', handleRemoteDraw);
      socket.off('clear_canvas', handleRemoteClear);
    };
  }, []);

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
      {/* HTML5 Canvas Element */}
      <div style={{ position: 'relative', width: '100%', background: '#ffffff', borderRadius: '8px', overflow: 'hidden' }}>
        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            cursor: isDrawer ? 'crosshair' : 'not-allowed',
            touchAction: 'none'
          }}
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
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justify: 'space-between',
          gap: '12px',
          background: '#1e293b',
          padding: '12px',
          borderRadius: '8px',
          flexWrap: 'wrap'
        }}>
          {/* Color Palette */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  backgroundColor: c,
                  border: color === c ? '3px solid #38bdf8' : '1px solid #475569',
                  cursor: 'pointer'
                }}
              />
            ))}
          </div>

          {/* Brush Size Slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Size</span>
            <input
              type="range"
              min="2"
              max="30"
              value={lineWidth}
              onChange={(e) => setLineWidth(Number(e.target.value))}
              style={{ width: '100px', cursor: 'pointer' }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn" style={{ background: '#334155', color: '#fff', padding: '8px 12px' }} onClick={() => setColor('#ffffff')} title="Eraser">
              <Eraser size={18} />
            </button>
            <button className="btn" style={{ background: '#ef4444', color: '#fff', padding: '8px 12px' }} onClick={clearCanvas} title="Clear Canvas">
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}