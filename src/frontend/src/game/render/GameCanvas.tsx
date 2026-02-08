import { useEffect, useRef } from 'react';
import type { GameState } from '../types';
import { drawPlayerShip } from './drawPlayerShip';

interface GameCanvasProps {
  gameState: GameState;
}

export default function GameCanvas({ gameState }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef<GameState>(gameState);
  const animationFrameRef = useRef<number | null>(null);

  // Update ref when gameState changes
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      ctx.scale(dpr, dpr);
      
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    };

    resizeCanvas();
    
    const handleResize = () => {
      resizeCanvas();
    };
    
    const handleOrientationChange = () => {
      setTimeout(resizeCanvas, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    window.visualViewport?.addEventListener('resize', handleResize);

    const render = () => {
      const state = gameStateRef.current;
      const canvasWidth = canvas.getBoundingClientRect().width;
      const canvasHeight = canvas.getBoundingClientRect().height;

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      // Draw playfield border (subtle neon frame)
      ctx.save();
      ctx.strokeStyle = '#00c8ff';
      ctx.lineWidth = 3;
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#00c8ff';
      
      // Draw border rectangle with rounded corners
      const borderInset = 10;
      const borderRadius = 8;
      const x = borderInset;
      const y = borderInset;
      const width = canvasWidth - borderInset * 2;
      const height = canvasHeight - borderInset * 2;
      
      ctx.beginPath();
      ctx.moveTo(x + borderRadius, y);
      ctx.lineTo(x + width - borderRadius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + borderRadius);
      ctx.lineTo(x + width, y + height - borderRadius);
      ctx.quadraticCurveTo(x + width, y + height, x + width - borderRadius, y + height);
      ctx.lineTo(x + borderRadius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - borderRadius);
      ctx.lineTo(x, y + borderRadius);
      ctx.quadraticCurveTo(x, y, x + borderRadius, y);
      ctx.closePath();
      ctx.stroke();
      
      ctx.shadowBlur = 0;
      ctx.restore();

      // Draw player ship (vector-only, no image)
      const player = state.player;
      drawPlayerShip(ctx, player.x, player.y, player.rotation, player.radius);

      // Draw bullets (flame shape)
      state.bullets.forEach((bullet) => {
        ctx.save();
        ctx.translate(bullet.x, bullet.y);
        
        const angle = Math.atan2(bullet.vy, bullet.vx);
        ctx.rotate(angle);

        const flameLength = bullet.radius * 3;
        const flameWidth = bullet.radius * 1.5;

        ctx.beginPath();
        ctx.moveTo(flameLength, 0);
        ctx.lineTo(-flameLength * 0.3, -flameWidth);
        ctx.lineTo(-flameLength, 0);
        ctx.lineTo(-flameLength * 0.3, flameWidth);
        ctx.closePath();

        const gradient = ctx.createLinearGradient(-flameLength, 0, flameLength, 0);
        gradient.addColorStop(0, '#ff8800');
        gradient.addColorStop(0.5, '#ffff00');
        gradient.addColorStop(1, '#ffffff');

        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ffff00';
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.restore();
      });

      // Draw enemies (no color flash on hit)
      state.enemies.forEach((enemy) => {
        ctx.save();
        ctx.translate(enemy.x, enemy.y);
        ctx.rotate(enemy.rotation);

        if (enemy.isBoss) {
          // Boss: larger hexagon with special effects
          const sides = 6;
          ctx.beginPath();
          for (let i = 0; i < sides; i++) {
            const angle = (Math.PI * 2 * i) / sides;
            const x = Math.cos(angle) * enemy.radius;
            const y = Math.sin(angle) * enemy.radius;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();

          ctx.fillStyle = enemy.color;
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 3;
          ctx.stroke();

          // Extra glow for boss
          ctx.shadowBlur = 25;
          ctx.shadowColor = enemy.color;
          ctx.fill();
          ctx.shadowBlur = 0;
        } else {
          // Normal enemy: hexagon
          const sides = 6;
          ctx.beginPath();
          for (let i = 0; i < sides; i++) {
            const angle = (Math.PI * 2 * i) / sides;
            const x = Math.cos(angle) * enemy.radius;
            const y = Math.sin(angle) * enemy.radius;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();

          ctx.fillStyle = enemy.color;
          ctx.fill();
          ctx.strokeStyle = enemy.color;
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.shadowBlur = 15;
          ctx.shadowColor = enemy.color;
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        ctx.restore();
      });

      // Draw explosions
      state.explosions.forEach((explosion) => {
        const elapsed = Date.now() - explosion.startTime;
        const progress = elapsed / explosion.duration;
        const radius = 30 + progress * 50;
        const alpha = 1 - progress;

        ctx.save();
        ctx.globalAlpha = alpha;

        const gradient = ctx.createRadialGradient(
          explosion.x, explosion.y, 0,
          explosion.x, explosion.y, radius
        );
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.3, '#ffff00');
        gradient.addColorStop(0.6, '#ff8800');
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(explosion.x, explosion.y, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });

      // Draw sparks
      state.sparks.forEach((spark) => {
        const elapsed = Date.now() - spark.startTime;
        const progress = elapsed / spark.duration;
        const alpha = 1 - progress;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(spark.x, spark.y);
        const endX = spark.x - Math.cos(spark.angle) * spark.length;
        const endY = spark.y - Math.sin(spark.angle) * spark.length;
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Glow
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#ffff00';
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.restore();
      });

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.visualViewport?.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 bg-space-dark"
      style={{ 
        width: '100%', 
        height: '100%',
        touchAction: 'none',
        pointerEvents: 'none'
      }}
    />
  );
}
