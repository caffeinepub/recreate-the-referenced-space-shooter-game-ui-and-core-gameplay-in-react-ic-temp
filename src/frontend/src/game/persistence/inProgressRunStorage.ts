import type { GamePhase } from '../types';

export interface LocalRunData {
  currentScore: number;
  currentLevel: number;
  progress: number;
  isPaused: boolean;
  phase: GamePhase;
  destroyedNormalObstacles: number;
  bossProgressPct: number;
  timeRemainingSeconds: number;
}

interface InProgressRunData extends LocalRunData {
  timestamp: number;
  version: number;
}

const STORAGE_KEY = 'space-shooter-in-progress-run';
const CURRENT_VERSION = 2;

export function saveInProgressRun(data: LocalRunData): void {
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

export function loadInProgressRun(): LocalRunData | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const data = JSON.parse(stored) as InProgressRunData;
    
    // Validate version
    if (data.version !== CURRENT_VERSION) {
      clearInProgressRun();
      return null;
    }

    // Return without timestamp and version
    const { timestamp, version, ...localData } = data;
    return localData;
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
