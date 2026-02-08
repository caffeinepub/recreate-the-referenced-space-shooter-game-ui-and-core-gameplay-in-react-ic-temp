import { useEffect, useRef } from 'react';
import type { GameState, Bullet } from '@/game/types';

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

    // Set canvas size using visual viewport when available for better mobile support
    const resizeCanvas = () => {
      const width = window.visualViewport?.width || window.innerWidth;
      const height = window.visualViewport?.height || window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    
    resizeCanvas();
    
    // Listen to both resize and visual viewport changes
    window.addEventListener('resize', resizeCanvas);
    window.visualViewport?.addEventListener('resize', resizeCanvas);
    window.addEventListener('orientationchange', resizeCanvas);

    // Helper function to draw the player ship as a neon vector graphic
    const drawPlayerShip = (x: number, y: number, rotation: number, radius: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);

      const size = radius;
      
      // Ship body - triangular with neon glow
      ctx.strokeStyle = '#00ffff';
      ctx.fillStyle = '#0088ff';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#00ffff';
      ctx.shadowBlur = 15;
      
      ctx.beginPath();
      // Nose (pointing right in local coords, matching rotation direction)
      ctx.moveTo(size * 1.2, 0);
      // Bottom wing
      ctx.lineTo(-size * 0.8, size * 0.8);
      // Engine indent
      ctx.lineTo(-size * 0.4, 0);
      // Top wing
      ctx.lineTo(-size * 0.8, -size * 0.8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Cockpit window
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(size * 0.3, 0, size * 0.25, 0, Math.PI * 2);
      ctx.fill();

      // Engine glow
      ctx.fillStyle = '#ff6600';
      ctx.shadowColor = '#ff6600';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(-size * 0.4, 0, size * 0.3, 0, Math.PI * 2);
      ctx.fill();

      // Wing details
      ctx.strokeStyle = '#00ffff';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(size * 0.2, size * 0.4);
      ctx.lineTo(-size * 0.3, size * 0.6);
      ctx.moveTo(size * 0.2, -size * 0.4);
      ctx.lineTo(-size * 0.3, -size * 0.6);
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.restore();
    };

    // Helper function to draw flame-shaped bullets
    const drawBullet = (bullet: Bullet) => {
      const radius = 5; // Fixed size for all bullets
      const color = '#ff6600'; // Flame color (orange-red)

      ctx.save();
      ctx.translate(bullet.x, bullet.y);

      // Calculate bullet direction for orientation
      const angle = Math.atan2(bullet.vy, bullet.vx);
      ctx.rotate(angle);

      // Draw flame shape (teardrop pointing forward)
      ctx.fillStyle = color;
      ctx.strokeStyle = '#ffaa00';
      ctx.shadowColor = color;
      ctx.shadowBlur = 15;
      ctx.lineWidth = 1.5;

      const flameLength = radius * 3;
      const flameWidth = radius * 1.5;

      ctx.beginPath();
      // Tip of the flame (front)
      ctx.moveTo(flameLength, 0);
      // Curve to top
      ctx.quadraticCurveTo(flameLength * 0.3, -flameWidth, -flameLength * 0.3, -flameWidth * 0.6);
      // Back of flame (rounded)
      ctx.quadraticCurveTo(-flameLength * 0.5, 0, -flameLength * 0.3, flameWidth * 0.6);
      // Curve to bottom
      ctx.quadraticCurveTo(flameLength * 0.3, flameWidth, flameLength, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Inner bright core
      ctx.fillStyle = '#ffff00';
      ctx.shadowColor = '#ffff00';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.ellipse(flameLength * 0.2, 0, flameLength * 0.4, flameWidth * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
      ctx.shadowBlur = 0;
    };

    // Animation loop
    let animationId: number;
    const render = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw visible border
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
      ctx.lineWidth = 4;
      ctx.shadowColor = 'rgba(0, 255, 255, 0.5)';
      ctx.shadowBlur = 10;
      ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);
      ctx.shadowBlur = 0;

      // Draw player ship with code-rendered vector graphics
      if (gameState.player) {
        drawPlayerShip(
          gameState.player.x,
          gameState.player.y,
          gameState.player.rotation,
          gameState.player.radius
        );
      }

      // Draw bullets as flame shapes
      gameState.bullets.forEach((bullet) => {
        drawBullet(bullet);
      });

      // Draw explosions
      gameState.explosions.forEach((explosion) => {
        const age = Date.now() - explosion.startTime;
        const progress = age / explosion.duration;
        const radius = 10 + progress * 30;
        const alpha = 1 - progress;

        ctx.save();
        ctx.globalAlpha = alpha;
        
        // Outer ring
        ctx.strokeStyle = '#ff6600';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#ff6600';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(explosion.x, explosion.y, radius, 0, Math.PI * 2);
        ctx.stroke();

        // Inner glow
        ctx.fillStyle = '#ffaa00';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(explosion.x, explosion.y, radius * 0.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });
      ctx.shadowBlur = 0;

      // Draw spark particles
      gameState.sparks.forEach((spark) => {
        const age = Date.now() - spark.startTime;
        const progress = age / spark.duration;
        const alpha = 1 - progress;

        ctx.save();
        ctx.globalAlpha = alpha;
        
        // Bright white/yellow spark streaks
        const gradient = ctx.createLinearGradient(
          spark.x,
          spark.y,
          spark.x - Math.cos(spark.angle) * spark.length,
          spark.y - Math.sin(spark.angle) * spark.length
        );
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.5, '#ffff00');
        gradient.addColorStop(1, 'rgba(255, 200, 0, 0)');

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2 + (1 - progress) * 2;
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 8;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(spark.x, spark.y);
        ctx.lineTo(
          spark.x - Math.cos(spark.angle) * spark.length * (1 - progress * 0.5),
          spark.y - Math.sin(spark.angle) * spark.length * (1 - progress * 0.5)
        );
        ctx.stroke();

        ctx.restore();
      });
      ctx.shadowBlur = 0;

      // Draw enemies with per-instance colors
      gameState.enemies.forEach((enemy) => {
        const color = enemy.color;

        ctx.save();
        ctx.translate(enemy.x, enemy.y);
        ctx.rotate(enemy.rotation);

        // Hexagonal enemy shape
        ctx.strokeStyle = color;
        ctx.fillStyle = color + '44';
        ctx.lineWidth = 3;
        ctx.shadowColor = color;
        ctx.shadowBlur = 15;

        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i;
          const x = Math.cos(angle) * enemy.radius;
          const y = Math.sin(angle) * enemy.radius;
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Inner detail
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(0, 0, enemy.radius * 0.5, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
      });
      ctx.shadowBlur = 0;

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
      window.visualViewport?.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('orientationchange', resizeCanvas);
    };
  }, [gameState]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ touchAction: 'none' }}
    />
  );
}
