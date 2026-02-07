import { useEffect, useRef } from 'react';
import type { GameState } from '@/game/types';

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
      // Nose (pointing right in local coords)
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

      // Draw bullets with size variations
      gameState.bullets.forEach((bullet) => {
        const radius = bullet.radius;
        let color: string;
        
        if (bullet.size === 'small') {
          color = '#00ffff';
        } else if (bullet.size === 'medium') {
          color = '#00ff88';
        } else {
          color = '#0088ff';
        }

        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = radius * 2;
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, radius, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.shadowBlur = 0;

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
        ctx.fillStyle = '#ffff00';
        ctx.shadowColor = '#ffff00';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(explosion.x, explosion.y, radius * 0.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });
      ctx.shadowBlur = 0;

      // Draw enemies with size variations
      gameState.enemies.forEach((enemy) => {
        ctx.save();
        ctx.translate(enemy.x, enemy.y);
        ctx.rotate(enemy.rotation || 0);
        
        let color: string;
        let size: number;

        if (enemy.size === 'small') {
          color = '#ffff00';
          size = enemy.radius * 0.8;
        } else if (enemy.size === 'medium') {
          color = '#ff8800';
          size = enemy.radius * 0.9;
        } else {
          color = '#ff0088';
          size = enemy.radius;
        }

        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.shadowColor = color;
        ctx.shadowBlur = 15;
        
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i;
          const x = size * Math.cos(angle);
          const y = size * Math.sin(angle);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
        
        ctx.shadowBlur = 0;
        ctx.restore();
      });

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
      className="absolute inset-0 z-10 pointer-events-none"
      style={{ touchAction: 'none' }}
    />
  );
}
