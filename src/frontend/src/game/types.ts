export type BulletSize = 'small' | 'medium' | 'large';
export type BulletShape = 'circle' | 'diamond' | 'capsule' | 'flame';
export type EnemySize = 'small' | 'medium' | 'large';

export interface Player {
  x: number;
  y: number;
  rotation: number;
  health: number;
  radius: number;
}

export interface Bullet {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: BulletSize;
  shape: BulletShape;
  radius: number;
}

export interface Enemy {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  health: number;
  size: EnemySize;
  radius: number;
  color: string;
}

export interface Explosion {
  id: string;
  x: number;
  y: number;
  startTime: number;
  duration: number;
}

export interface Spark {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  startTime: number;
  duration: number;
  angle: number;
  length: number;
}

export interface GameState {
  player: Player;
  bullets: Bullet[];
  enemies: Enemy[];
  explosions: Explosion[];
  sparks: Spark[];
  score: number;
  level: number;
  progress: number;
  isPaused: boolean;
  isGameOver: boolean;
  levelCompleteMessage: string | null;
}

export interface Controls {
  x: number;
  y: number;
  shoot: boolean;
}
