import type { GamePhase } from '../types';

interface InProgressRunData {
  currentScore: number;
  currentLevel: number;
  progress: number;
  isPaused: boolean;
  phase: GamePhase;
  destroyedNormalObstacles: number;
  bossProgressPct: number;
  timeRemainingSeconds: number;
  timestamp: number;
  version: number;
}

const STORAGE_KEY = 'space-shooter-in-progress-run';
const CURRENT_VERSION = 2;

export function saveInProgressRun(data: Omit<InProgressRunData, 'timestamp' | 'version'>): void {
  try {
    const payload: InProgressRunData = {
      ...data,
      timestamp: Date.now(),
      version: CURRENT_VERSION
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.error('Failed to save in-progress run:', error);
  }
}

export function loadInProgressRun(): InProgressRunData | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const data = JSON.parse(stored) as InProgressRunData;
    
    // Validate version
    if (data.version !== CURRENT_VERSION) {
      clearInProgressRun();
      return null;
    }

    return data;
  } catch (error) {
    console.error('Failed to load in-progress run:', error);
    return null;
  }
}

export function clearInProgressRun(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear in-progress run:', error);
  }
}

export function hasInProgressRun(): boolean {
  return loadInProgressRun() !== null;
}
