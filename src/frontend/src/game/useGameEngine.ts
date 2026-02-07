import { useState, useEffect, useRef, useCallback } from 'react';
import type { GameState, Controls, Bullet, Enemy, BulletSize, EnemySize, Explosion } from './types';

interface UseGameEngineProps {
  controls: Controls;
}

const BULLET_SIZE_CONFIG = {
  small: { radius: 3, speed: 600 },
  medium: { radius: 5, speed: 500 },
  large: { radius: 7, speed: 400 }
};

const ENEMY_SIZE_CONFIG = {
  small: { radius: 15, score: 5 },
  medium: { radius: 25, score: 10 },
  large: { radius: 35, score: 15 }
};

const PLAYER_RADIUS = 30;
const POINTS_PER_LEVEL = 100;

export function useGameEngine({ controls }: UseGameEngineProps) {
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [levelCompleteMessage, setLevelCompleteMessage] = useState<string | null>(null);

  const gameStateRef = useRef<GameState>({
    player: {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      rotation: 0,
      health: 100,
      radius: PLAYER_RADIUS
    },
    bullets: [],
    enemies: [],
    explosions: [],
    score: 0,
    level: 1,
    progress: 0,
    isPaused: false,
    isGameOver: false,
    levelCompleteMessage: null
  });

  const lastShotTimeRef = useRef(0);
  const lastEnemySpawnRef = useRef(0);
  const shootingRef = useRef(false);

  const togglePause = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  const restartGame = useCallback(() => {
    gameStateRef.current = {
      player: {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        rotation: 0,
        health: 100,
        radius: PLAYER_RADIUS
      },
      bullets: [],
      enemies: [],
      explosions: [],
      score: 0,
      level: 1,
      progress: 0,
      isPaused: false,
      isGameOver: false,
      levelCompleteMessage: null
    };
    setScore(0);
    setLevel(1);
    setProgress(0);
    setIsPaused(false);
    setIsGameOver(false);
    setLevelCompleteMessage(null);
    lastShotTimeRef.current = 0;
    lastEnemySpawnRef.current = 0;
    shootingRef.current = false;
  }, []);

  useEffect(() => {
    shootingRef.current = controls.shoot;
  }, [controls.shoot]);

  useEffect(() => {
    let animationId: number;
    let lastTime = performance.now();

    const gameLoop = (currentTime: number) => {
      const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      if (isPaused || isGameOver) {
        animationId = requestAnimationFrame(gameLoop);
        return;
      }

      const state = gameStateRef.current;
      const playerSpeed = 300;
      const canvasWidth = window.innerWidth;
      const canvasHeight = window.innerHeight;

      // Update player position
      if (controls.x !== 0 || controls.y !== 0) {
        const magnitude = Math.sqrt(controls.x * controls.x + controls.y * controls.y);
        const normalizedX = controls.x / magnitude;
        const normalizedY = controls.y / magnitude;

        state.player.x += normalizedX * playerSpeed * deltaTime;
        state.player.y += normalizedY * playerSpeed * deltaTime;

        // Keep player in bounds
        state.player.x = Math.max(state.player.radius, Math.min(canvasWidth - state.player.radius, state.player.x));
        state.player.y = Math.max(state.player.radius, Math.min(canvasHeight - state.player.radius, state.player.y));

        // Update rotation
        state.player.rotation = Math.atan2(normalizedY, normalizedX) + Math.PI / 2;
      }

      // Continuous shooting while button held
      if (shootingRef.current && currentTime - lastShotTimeRef.current > 150) {
        // Determine bullet size (cycle through sizes)
        const bulletCount = state.bullets.length;
        let bulletSize: BulletSize;
        const sizeIndex = bulletCount % 3;
        if (sizeIndex === 0) bulletSize = 'small';
        else if (sizeIndex === 1) bulletSize = 'medium';
        else bulletSize = 'large';

        const config = BULLET_SIZE_CONFIG[bulletSize];
        
        // Spawn bullet from ship's nose
        const noseDistance = state.player.radius + 10;
        const noseX = state.player.x + Math.sin(state.player.rotation) * noseDistance;
        const noseY = state.player.y - Math.cos(state.player.rotation) * noseDistance;

        const bullet: Bullet = {
          id: `bullet-${Date.now()}-${Math.random()}`,
          x: noseX,
          y: noseY,
          vx: Math.sin(state.player.rotation) * config.speed,
          vy: -Math.cos(state.player.rotation) * config.speed,
          size: bulletSize,
          radius: config.radius
        };
        state.bullets.push(bullet);
        lastShotTimeRef.current = currentTime;
      }

      // Update bullets
      state.bullets = state.bullets.filter((bullet) => {
        bullet.x += bullet.vx * deltaTime;
        bullet.y += bullet.vy * deltaTime;
        return (
          bullet.x > -50 &&
          bullet.x < canvasWidth + 50 &&
          bullet.y > -50 &&
          bullet.y < canvasHeight + 50
        );
      });

      // Spawn enemies
      const spawnInterval = Math.max(500, 2000 - level * 100);
      if (currentTime - lastEnemySpawnRef.current > spawnInterval) {
        const side = Math.floor(Math.random() * 4);
        let x = 0, y = 0, vx = 0, vy = 0;

        // Random enemy size
        const sizeRand = Math.random();
        let enemySize: EnemySize;
        if (sizeRand < 0.5) enemySize = 'small';
        else if (sizeRand < 0.85) enemySize = 'medium';
        else enemySize = 'large';

        const enemyRadius = ENEMY_SIZE_CONFIG[enemySize].radius;

        switch (side) {
          case 0: // Top
            x = Math.random() * canvasWidth;
            y = -enemyRadius;
            vx = (Math.random() - 0.5) * 100;
            vy = 50 + level * 10;
            break;
          case 1: // Right
            x = canvasWidth + enemyRadius;
            y = Math.random() * canvasHeight;
            vx = -(50 + level * 10);
            vy = (Math.random() - 0.5) * 100;
            break;
          case 2: // Bottom
            x = Math.random() * canvasWidth;
            y = canvasHeight + enemyRadius;
            vx = (Math.random() - 0.5) * 100;
            vy = -(50 + level * 10);
            break;
          case 3: // Left
            x = -enemyRadius;
            y = Math.random() * canvasHeight;
            vx = 50 + level * 10;
            vy = (Math.random() - 0.5) * 100;
            break;
        }

        const enemy: Enemy = {
          id: `enemy-${Date.now()}-${Math.random()}`,
          x,
          y,
          vx,
          vy,
          rotation: 0,
          health: 1,
          size: enemySize,
          radius: enemyRadius
        };
        state.enemies.push(enemy);
        lastEnemySpawnRef.current = currentTime;
      }

      // Update enemies with border bouncing
      state.enemies.forEach((enemy) => {
        enemy.x += enemy.vx * deltaTime;
        enemy.y += enemy.vy * deltaTime;
        enemy.rotation += deltaTime * 2;

        // Border collision - bounce off edges
        if (enemy.x - enemy.radius < 0) {
          enemy.x = enemy.radius;
          enemy.vx = Math.abs(enemy.vx);
        } else if (enemy.x + enemy.radius > canvasWidth) {
          enemy.x = canvasWidth - enemy.radius;
          enemy.vx = -Math.abs(enemy.vx);
        }

        if (enemy.y - enemy.radius < 0) {
          enemy.y = enemy.radius;
          enemy.vy = Math.abs(enemy.vy);
        } else if (enemy.y + enemy.radius > canvasHeight) {
          enemy.y = canvasHeight - enemy.radius;
          enemy.vy = -Math.abs(enemy.vy);
        }
      });

      // Enemy-to-enemy collision
      for (let i = 0; i < state.enemies.length; i++) {
        for (let j = i + 1; j < state.enemies.length; j++) {
          const e1 = state.enemies[i];
          const e2 = state.enemies[j];
          
          const dx = e2.x - e1.x;
          const dy = e2.y - e1.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const minDistance = e1.radius + e2.radius;

          if (distance < minDistance && distance > 0) {
            // Separate overlapping enemies
            const overlap = minDistance - distance;
            const separationX = (dx / distance) * overlap * 0.5;
            const separationY = (dy / distance) * overlap * 0.5;

            e1.x -= separationX;
            e1.y -= separationY;
            e2.x += separationX;
            e2.y += separationY;

            // Reflect velocities
            const nx = dx / distance;
            const ny = dy / distance;

            const relVx = e2.vx - e1.vx;
            const relVy = e2.vy - e1.vy;
            const dotProduct = relVx * nx + relVy * ny;

            if (dotProduct < 0) {
              e1.vx += dotProduct * nx;
              e1.vy += dotProduct * ny;
              e2.vx -= dotProduct * nx;
              e2.vy -= dotProduct * ny;
            }
          }
        }
      }

      // Player-enemy collision (Game Over)
      for (const enemy of state.enemies) {
        const dx = enemy.x - state.player.x;
        const dy = enemy.y - state.player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < state.player.radius + enemy.radius) {
          setIsGameOver(true);
          state.isGameOver = true;
          animationId = requestAnimationFrame(gameLoop);
          return;
        }
      }

      // Bullet-enemy collision
      const bulletsToRemove = new Set<string>();
      const enemiesToRemove = new Set<string>();

      state.bullets.forEach((bullet) => {
        state.enemies.forEach((enemy) => {
          if (bulletsToRemove.has(bullet.id) || enemiesToRemove.has(enemy.id)) return;

          const dx = bullet.x - enemy.x;
          const dy = bullet.y - enemy.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < bullet.radius + enemy.radius) {
            bulletsToRemove.add(bullet.id);
            enemiesToRemove.add(enemy.id);

            // Create explosion
            const explosion: Explosion = {
              id: `explosion-${Date.now()}-${Math.random()}`,
              x: enemy.x,
              y: enemy.y,
              startTime: currentTime,
              duration: 500
            };
            state.explosions.push(explosion);

            // Award score based on enemy size
            const points = ENEMY_SIZE_CONFIG[enemy.size].score;
            const newScore = score + points;
            setScore(newScore);

            // Update progress (0-100%)
            const newProgress = (newScore % POINTS_PER_LEVEL) / POINTS_PER_LEVEL * 100;
            setProgress(newProgress);

            // Level up when progress fills
            if (newScore > 0 && newScore % POINTS_PER_LEVEL === 0) {
              const newLevel = Math.floor(newScore / POINTS_PER_LEVEL) + 1;
              setLevel(newLevel);
              const message = `Level ${newLevel - 1} completed`;
              setLevelCompleteMessage(message);
              state.levelCompleteMessage = message;
              
              // Clear message after 2 seconds
              setTimeout(() => {
                setLevelCompleteMessage(null);
                state.levelCompleteMessage = null;
              }, 2000);
            }
          }
        });
      });

      state.bullets = state.bullets.filter(b => !bulletsToRemove.has(b.id));
      state.enemies = state.enemies.filter(e => !enemiesToRemove.has(e.id));

      // Update explosions
      state.explosions = state.explosions.filter((explosion) => {
        return currentTime - explosion.startTime < explosion.duration;
      });

      animationId = requestAnimationFrame(gameLoop);
    };

    animationId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [controls.x, controls.y, isPaused, isGameOver, score, level]);

  return {
    score,
    level,
    progress,
    isPaused,
    isGameOver,
    levelCompleteMessage,
    gameState: gameStateRef.current,
    togglePause,
    restartGame
  };
}
