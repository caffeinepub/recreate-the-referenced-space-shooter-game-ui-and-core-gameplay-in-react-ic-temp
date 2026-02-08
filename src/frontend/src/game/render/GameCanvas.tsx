import { useEffect, useRef } from 'react';
import type { GameState } from '../types';

interface GameCanvasProps {
  gameState: GameState;
}

export default function GameCanvas({ gameState }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw player ship (vector-based)
      const player = gameState.player;
      ctx.save();
      ctx.translate(player.x, player.y);
      ctx.rotate(player.rotation);

      // Ship body (triangle pointing right in local coords)
      ctx.beginPath();
      ctx.moveTo(player.radius, 0);
      ctx.lineTo(-player.radius * 0.6, -player.radius * 0.5);
      ctx.lineTo(-player.radius * 0.6, player.radius * 0.5);
      ctx.closePath();
      ctx.fillStyle = '#00ffff';
      ctx.fill();
      ctx.strokeStyle = '#00ffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Glow effect
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#00ffff';
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.restore();

      // Draw bullets (flame shape)
      gameState.bullets.forEach((bullet) => {
        ctx.save();
        ctx.translate(bullet.x, bullet.y);
        
        // Calculate rotation from velocity
        const angle = Math.atan2(bullet.vy, bullet.vx);
        ctx.rotate(angle);

        // Flame shape pointing right in local coords
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

      // Draw enemies
      gameState.enemies.forEach((enemy) => {
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
      gameState.explosions.forEach((explosion) => {
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
      gameState.sparks.forEach((spark) => {
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

      requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [gameState]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 bg-space-dark"
      style={{ width: '100%', height: '100%' }}
    />
  );
}
