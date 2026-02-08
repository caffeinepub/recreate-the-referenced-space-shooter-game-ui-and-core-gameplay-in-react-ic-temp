import { useState, useEffect, useRef, useCallback } from 'react';
import type { GameState, Controls, Bullet, Enemy, BulletSize, BulletShape, EnemySize, Explosion, Spark, GamePhase } from './types';

interface UseGameEngineProps {
  controls: Controls;
  resumeData?: { 
    score: number; 
    level: number; 
    progress: number;
    phase?: GamePhase;
    destroyedNormalObstacles?: number;
    bossProgressPct?: number;
    timeRemainingSeconds?: number;
  } | null;
}

const BULLET_SIZE_CONFIG = {
  small: { radius: 5, speed: 600 },
  medium: { radius: 5, speed: 500 },
  large: { radius: 5, speed: 400 }
};

const ENEMY_SIZE_CONFIG = {
  small: { radius: 15, score: 5 },
  medium: { radius: 25, score: 10 },
  large: { radius: 35, score: 15 }
};

const BOSS_CONFIG = {
  radius: 60,
  maxHealth: 10,
  speed: 80
};

const ENEMY_COLORS = [
  '#00ffff', // cyan
  '#ff00ff', // magenta
  '#ffff00', // yellow
  '#00ff88', // green-cyan
  '#ff0088', // pink
  '#88ff00', // lime
  '#ff8800', // orange
];

const PLAYER_RADIUS = 30;

function getTimeLimitForLevel(level: number): number {
  return level === 1 ? 30 : 35;
}

export function useGameEngine({ controls, resumeData }: UseGameEngineProps) {
  const [score, setScore] = useState(resumeData?.score ?? 0);
  const [level, setLevel] = useState(resumeData?.level ?? 1);
  const [progress, setProgress] = useState(resumeData?.progress ?? 0);
  const [isPaused, setIsPaused] = useState(!!resumeData);
  const [isGameOver, setIsGameOver] = useState(false);
  const [levelCompleteMessage, setLevelCompleteMessage] = useState<string | null>(null);
  const [phase, setPhase] = useState<GamePhase>(resumeData?.phase ?? 'normal');
  const [destroyedNormalObstacles, setDestroyedNormalObstacles] = useState(resumeData?.destroyedNormalObstacles ?? 0);
  const [requiredNormalObstacles, setRequiredNormalObstacles] = useState((resumeData?.level ?? 1) * 5);
  const [bossProgressPct, setBossProgressPct] = useState(resumeData?.bossProgressPct ?? 0);
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(
    resumeData?.timeRemainingSeconds ?? getTimeLimitForLevel(resumeData?.level ?? 1)
  );

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
    sparks: [],
    score: resumeData?.score ?? 0,
    level: resumeData?.level ?? 1,
    progress: resumeData?.progress ?? 0,
    isPaused: !!resumeData,
    isGameOver: false,
    levelCompleteMessage: null,
    phase: resumeData?.phase ?? 'normal',
    destroyedNormalObstacles: resumeData?.destroyedNormalObstacles ?? 0,
    requiredNormalObstacles: (resumeData?.level ?? 1) * 5,
    bossProgressPct: resumeData?.bossProgressPct ?? 0,
    timeRemainingSeconds: resumeData?.timeRemainingSeconds ?? getTimeLimitForLevel(resumeData?.level ?? 1)
  });

  const lastShotTimeRef = useRef(0);
  const lastEnemySpawnRef = useRef(0);
  const lastTimerTickRef = useRef(0);
  const shootingRef = useRef(false);
  const controlsRef = useRef(controls);
  const scoreRef = useRef(resumeData?.score ?? 0);
  const levelRef = useRef(resumeData?.level ?? 1);
  const phaseRef = useRef<GamePhase>(resumeData?.phase ?? 'normal');
  const destroyedNormalObstaclesRef = useRef(resumeData?.destroyedNormalObstacles ?? 0);
  const bossHealthRef = useRef(0);

  const togglePause = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  const restartGame = useCallback(() => {
    const initialLevel = 1;
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
      sparks: [],
      score: 0,
      level: initialLevel,
      progress: 0,
      isPaused: false,
      isGameOver: false,
      levelCompleteMessage: null,
      phase: 'normal',
      destroyedNormalObstacles: 0,
      requiredNormalObstacles: initialLevel * 5,
      bossProgressPct: 0,
      timeRemainingSeconds: getTimeLimitForLevel(initialLevel)
    };
    setScore(0);
    setLevel(initialLevel);
    setProgress(0);
    setIsPaused(false);
    setIsGameOver(false);
    setLevelCompleteMessage(null);
    setPhase('normal');
    setDestroyedNormalObstacles(0);
    setRequiredNormalObstacles(initialLevel * 5);
    setBossProgressPct(0);
    setTimeRemainingSeconds(getTimeLimitForLevel(initialLevel));
    lastShotTimeRef.current = 0;
    lastEnemySpawnRef.current = 0;
    lastTimerTickRef.current = 0;
    shootingRef.current = false;
    scoreRef.current = 0;
    levelRef.current = initialLevel;
    phaseRef.current = 'normal';
    destroyedNormalObstaclesRef.current = 0;
    bossHealthRef.current = 0;
  }, []);

  const initializeFromSnapshot = useCallback((snapshot: { 
    score: number; 
    level: number; 
    progress: number;
    phase?: GamePhase;
    destroyedNormalObstacles?: number;
    bossProgressPct?: number;
    timeRemainingSeconds?: number;
  }) => {
    const snapshotPhase = snapshot.phase ?? 'normal';
    const snapshotDestroyed = snapshot.destroyedNormalObstacles ?? 0;
    const snapshotBossPct = snapshot.bossProgressPct ?? 0;
    const snapshotTime = snapshot.timeRemainingSeconds ?? getTimeLimitForLevel(snapshot.level);
    
    gameStateRef.current.score = snapshot.score;
    gameStateRef.current.level = snapshot.level;
    gameStateRef.current.progress = snapshot.progress;
    gameStateRef.current.phase = snapshotPhase;
    gameStateRef.current.destroyedNormalObstacles = snapshotDestroyed;
    gameStateRef.current.requiredNormalObstacles = snapshot.level * 5;
    gameStateRef.current.bossProgressPct = snapshotBossPct;
    gameStateRef.current.timeRemainingSeconds = snapshotTime;
    
    setScore(snapshot.score);
    setLevel(snapshot.level);
    setProgress(snapshot.progress);
    setPhase(snapshotPhase);
    setDestroyedNormalObstacles(snapshotDestroyed);
    setRequiredNormalObstacles(snapshot.level * 5);
    setBossProgressPct(snapshotBossPct);
    setTimeRemainingSeconds(snapshotTime);
    
    scoreRef.current = snapshot.score;
    levelRef.current = snapshot.level;
    phaseRef.current = snapshotPhase;
    destroyedNormalObstaclesRef.current = snapshotDestroyed;
  }, []);

  // Update refs when controls change
  useEffect(() => {
    controlsRef.current = controls;
    shootingRef.current = controls.shoot;
  }, [controls]);

  // Update refs when score/level/phase change
  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    levelRef.current = level;
  }, [level]);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    destroyedNormalObstaclesRef.current = destroyedNormalObstacles;
  }, [destroyedNormalObstacles]);

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
      const currentControls = controlsRef.current;
      const currentScore = scoreRef.current;
      const currentLevel = levelRef.current;
      const currentPhase = phaseRef.current;
      const currentDestroyed = destroyedNormalObstaclesRef.current;
      const playerSpeed = 300;
      const canvasWidth = window.innerWidth;
      const canvasHeight = window.innerHeight;

      // Timer countdown (1Hz tick)
      if (currentTime - lastTimerTickRef.current >= 1000) {
        lastTimerTickRef.current = currentTime;
        const newTime = Math.max(0, state.timeRemainingSeconds - 1);
        state.timeRemainingSeconds = newTime;
        setTimeRemainingSeconds(newTime);

        // Game over if timer reaches 0
        if (newTime === 0) {
          setIsGameOver(true);
          state.isGameOver = true;
          animationId = requestAnimationFrame(gameLoop);
          return;
        }
      }

      // Update player position
      if (currentControls.x !== 0 || currentControls.y !== 0) {
        const magnitude = Math.sqrt(currentControls.x * currentControls.x + currentControls.y * currentControls.y);
        const normalizedX = currentControls.x / magnitude;
        const normalizedY = currentControls.y / magnitude;

        state.player.x += normalizedX * playerSpeed * deltaTime;
        state.player.y += normalizedY * playerSpeed * deltaTime;

        // Keep player in bounds
        state.player.x = Math.max(state.player.radius, Math.min(canvasWidth - state.player.radius, state.player.x));
        state.player.y = Math.max(state.player.radius, Math.min(canvasHeight - state.player.radius, state.player.y));

        // Update rotation - ship nose points in direction of movement
        state.player.rotation = Math.atan2(normalizedY, normalizedX);
      }

      // Continuous shooting while button held
      if (shootingRef.current && currentTime - lastShotTimeRef.current > 150) {
        const bulletSize: BulletSize = 'medium';
        const bulletShape: BulletShape = 'flame';

        const config = BULLET_SIZE_CONFIG[bulletSize];
        
        const noseDistance = state.player.radius + 10;
        const noseX = state.player.x + Math.cos(state.player.rotation) * noseDistance;
        const noseY = state.player.y + Math.sin(state.player.rotation) * noseDistance;

        const bullet: Bullet = {
          id: `bullet-${Date.now()}-${Math.random()}`,
          x: noseX,
          y: noseY,
          vx: Math.cos(state.player.rotation) * config.speed,
          vy: Math.sin(state.player.rotation) * config.speed,
          size: bulletSize,
          shape: bulletShape,
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

      // Spawn enemies (only in normal phase)
      if (currentPhase === 'normal') {
        const spawnInterval = Math.max(500, 2000 - currentLevel * 100);
        if (currentTime - lastEnemySpawnRef.current > spawnInterval) {
          const side = Math.floor(Math.random() * 4);
          let x = 0, y = 0, vx = 0, vy = 0;

          const sizeRand = Math.random();
          let enemySize: EnemySize;
          if (sizeRand < 0.5) enemySize = 'small';
          else if (sizeRand < 0.85) enemySize = 'medium';
          else enemySize = 'large';

          const enemyRadius = ENEMY_SIZE_CONFIG[enemySize].radius;
          const enemyColor = ENEMY_COLORS[Math.floor(Math.random() * ENEMY_COLORS.length)];

          switch (side) {
            case 0: // Top
              x = Math.random() * canvasWidth;
              y = -enemyRadius;
              vx = (Math.random() - 0.5) * 100;
              vy = 50 + currentLevel * 10;
              break;
            case 1: // Right
              x = canvasWidth + enemyRadius;
              y = Math.random() * canvasHeight;
              vx = -(50 + currentLevel * 10);
              vy = (Math.random() - 0.5) * 100;
              break;
            case 2: // Bottom
              x = Math.random() * canvasWidth;
              y = canvasHeight + enemyRadius;
              vx = (Math.random() - 0.5) * 100;
              vy = -(50 + currentLevel * 10);
              break;
            case 3: // Left
              x = -enemyRadius;
              y = Math.random() * canvasHeight;
              vx = 50 + currentLevel * 10;
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
            radius: enemyRadius,
            color: enemyColor,
            isBoss: false
          };
          state.enemies.push(enemy);
          lastEnemySpawnRef.current = currentTime;
        }
      }

      // Check if we should spawn boss
      if (currentPhase === 'normal' && currentDestroyed >= state.requiredNormalObstacles && state.enemies.filter(e => !e.isBoss).length === 0) {
        // Transition to boss phase
        const boss: Enemy = {
          id: `boss-${Date.now()}`,
          x: canvasWidth / 2,
          y: -BOSS_CONFIG.radius - 50,
          vx: 0,
          vy: BOSS_CONFIG.speed,
          rotation: 0,
          health: BOSS_CONFIG.maxHealth,
          maxHealth: BOSS_CONFIG.maxHealth,
          size: 'large',
          radius: BOSS_CONFIG.radius,
          color: '#ff00ff',
          isBoss: true
        };
        state.enemies.push(boss);
        bossHealthRef.current = BOSS_CONFIG.maxHealth;
        state.phase = 'boss';
        setPhase('boss');
        phaseRef.current = 'boss';
      }

      // Update enemies
      state.enemies.forEach((enemy) => {
        if (enemy.isBoss) {
          // Boss movement: enter from top, then move horizontally
          if (enemy.y < canvasHeight / 3) {
            enemy.y += enemy.vy * deltaTime;
          } else {
            enemy.vy = 0;
            // Horizontal movement
            if (!enemy.vx) {
              enemy.vx = BOSS_CONFIG.speed * (Math.random() > 0.5 ? 1 : -1);
            }
            enemy.x += enemy.vx * deltaTime;
            
            // Bounce off edges
            if (enemy.x - enemy.radius < 0) {
              enemy.x = enemy.radius;
              enemy.vx = Math.abs(enemy.vx);
            } else if (enemy.x + enemy.radius > canvasWidth) {
              enemy.x = canvasWidth - enemy.radius;
              enemy.vx = -Math.abs(enemy.vx);
            }
          }
          enemy.rotation += deltaTime * 1;
        } else {
          // Normal enemy movement
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
        }
      });

      // Enemy-to-enemy collision (only non-boss)
      const normalEnemies = state.enemies.filter(e => !e.isBoss);
      for (let i = 0; i < normalEnemies.length; i++) {
        for (let j = i + 1; j < normalEnemies.length; j++) {
          const e1 = normalEnemies[i];
          const e2 = normalEnemies[j];
          
          const dx = e2.x - e1.x;
          const dy = e2.y - e1.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const minDistance = e1.radius + e2.radius;

          if (distance < minDistance && distance > 0) {
            const overlap = minDistance - distance;
            const separationX = (dx / distance) * overlap * 0.5;
            const separationY = (dy / distance) * overlap * 0.5;

            e1.x -= separationX;
            e1.y -= separationY;
            e2.x += separationX;
            e2.y += separationY;

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
          if (bulletsToRemove.has(bullet.id)) return;

          const dx = bullet.x - enemy.x;
          const dy = bullet.y - enemy.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < bullet.radius + enemy.radius) {
            bulletsToRemove.add(bullet.id);

            // Create spark particles at collision point
            const sparkCount = 6 + Math.floor(Math.random() * 4);
            for (let i = 0; i < sparkCount; i++) {
              const angle = (Math.PI * 2 * i) / sparkCount + (Math.random() - 0.5) * 0.5;
              const speed = 100 + Math.random() * 150;
              const spark: Spark = {
                id: `spark-${Date.now()}-${Math.random()}-${i}`,
                x: bullet.x,
                y: bullet.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                startTime: currentTime,
                duration: 200 + Math.random() * 150,
                angle: angle,
                length: 8 + Math.random() * 12
              };
              state.sparks.push(spark);
            }

            if (enemy.isBoss) {
              // Boss hit
              enemy.health -= 1;
              bossHealthRef.current = enemy.health;
              const bossPct = ((BOSS_CONFIG.maxHealth - enemy.health) / BOSS_CONFIG.maxHealth) * 100;
              state.bossProgressPct = bossPct;
              setBossProgressPct(bossPct);

              if (enemy.health <= 0) {
                // Boss defeated
                enemiesToRemove.add(enemy.id);

                // Large explosion
                const explosion: Explosion = {
                  id: `explosion-${Date.now()}-${Math.random()}`,
                  x: enemy.x,
                  y: enemy.y,
                  startTime: currentTime,
                  duration: 800
                };
                state.explosions.push(explosion);

                // Level completed
                const message = 'Level Completed';
                setLevelCompleteMessage(message);
                state.levelCompleteMessage = message;

                // Advance to next level after delay
                setTimeout(() => {
                  const nextLevel = currentLevel + 1;
                  setLevel(nextLevel);
                  levelRef.current = nextLevel;
                  setPhase('normal');
                  phaseRef.current = 'normal';
                  state.phase = 'normal';
                  setDestroyedNormalObstacles(0);
                  destroyedNormalObstaclesRef.current = 0;
                  state.destroyedNormalObstacles = 0;
                  setRequiredNormalObstacles(nextLevel * 5);
                  state.requiredNormalObstacles = nextLevel * 5;
                  setBossProgressPct(0);
                  state.bossProgressPct = 0;
                  bossHealthRef.current = 0;
                  setProgress(0);
                  state.progress = 0;
                  
                  // Reset timer for new level
                  const newTimeLimit = getTimeLimitForLevel(nextLevel);
                  setTimeRemainingSeconds(newTimeLimit);
                  state.timeRemainingSeconds = newTimeLimit;
                  lastTimerTickRef.current = currentTime;

                  setLevelCompleteMessage(null);
                  state.levelCompleteMessage = null;
                }, 2000);
              }
            } else {
              // Normal enemy hit
              enemiesToRemove.add(enemy.id);

              // Explosion
              const explosion: Explosion = {
                id: `explosion-${Date.now()}-${Math.random()}`,
                x: enemy.x,
                y: enemy.y,
                startTime: currentTime,
                duration: 500
              };
              state.explosions.push(explosion);

              // Award score
              const points = ENEMY_SIZE_CONFIG[enemy.size].score;
              const newScore = currentScore + points;
              setScore(newScore);
              scoreRef.current = newScore;

              // Increment destroyed count
              const newDestroyed = currentDestroyed + 1;
              setDestroyedNormalObstacles(newDestroyed);
              destroyedNormalObstaclesRef.current = newDestroyed;
              state.destroyedNormalObstacles = newDestroyed;

              // Update progress bar (normal phase only)
              if (currentPhase === 'normal') {
                const progressPct = (newDestroyed / state.requiredNormalObstacles) * 100;
                setProgress(progressPct);
                state.progress = progressPct;
              }
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

      // Update sparks
      state.sparks = state.sparks.filter((spark) => {
        if (currentTime - spark.startTime >= spark.duration) {
          return false;
        }
        spark.x += spark.vx * deltaTime;
        spark.y += spark.vy * deltaTime;
        spark.vx *= 0.98;
        spark.vy *= 0.98;
        return true;
      });

      animationId = requestAnimationFrame(gameLoop);
    };

    animationId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isPaused, isGameOver]);

  return {
    score,
    level,
    progress,
    isPaused,
    isGameOver,
    levelCompleteMessage,
    phase,
    destroyedNormalObstacles,
    requiredNormalObstacles,
    bossProgressPct,
    timeRemainingSeconds,
    gameState: gameStateRef.current,
    togglePause,
    restartGame,
    initializeFromSnapshot
  };
}
