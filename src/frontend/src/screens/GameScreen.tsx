import { useState, useCallback, useEffect, useRef } from 'react';
import GameCanvas from '../game/render/GameCanvas';
import Hud from '../game/ui/Hud';
import Joystick from '../game/controls/Joystick';
import ShootButton from '../game/controls/ShootButton';
import RotateDeviceOverlay from '../components/RotateDeviceOverlay';
import { useGameEngine } from '../game/useGameEngine';
import { useKeyboardControls } from '../game/controls/useKeyboardControls';
import { useCombinedControls } from '../game/controls/useCombinedControls';
import { useLandscapeOrientation } from '../hooks/useLandscapeOrientation';
import { useInProgressRun } from '../game/persistence/useInProgressRun';
import type { GamePhase } from '../game/types';

interface GameScreenProps {
  onExit: () => void;
  onGameOver: (score: number, level: number) => void;
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

export default function GameScreen({ onExit, onGameOver, resumeData }: GameScreenProps) {
  const [joystickInput, setJoystickInput] = useState({ x: 0, y: 0 });
  const [touchShooting, setTouchShooting] = useState(false);

  const keyboardControls = useKeyboardControls();
  const controls = useCombinedControls({
    keyboardControls,
    joystickInput,
    touchShooting,
  });

  const { isMobile, isPortrait, lockLandscape, unlockOrientation } = useLandscapeOrientation();
  const { saveRun } = useInProgressRun();
  const saveIntervalRef = useRef<number | undefined>(undefined);

  const {
    score,
    level,
    progress,
    isPaused,
    isGameOver,
    levelCompleteMessage,
    phase,
    destroyedNormalObstacles,
    bossProgressPct,
    timeRemainingSeconds,
    gameState,
    togglePause,
    initializeFromSnapshot,
  } = useGameEngine({ controls, resumeData });

  // Attempt orientation lock on mount
  useEffect(() => {
    if (isMobile) {
      lockLandscape();
    }

    return () => {
      if (isMobile) {
        unlockOrientation();
      }
    };
  }, [isMobile, lockLandscape, unlockOrientation]);

  // Auto-save periodically and on key events
  useEffect(() => {
    const saveCurrentRun = () => {
      if (!isGameOver && score > 0) {
        saveRun({
          currentScore: score,
          currentLevel: level,
          progress,
          isPaused,
          phase,
          destroyedNormalObstacles,
          bossProgressPct,
          timeRemainingSeconds
        });
      }
    };

    // Save every 5 seconds during gameplay
    saveIntervalRef.current = window.setInterval(() => {
      if (!isPaused && !isGameOver) {
        saveCurrentRun();
      }
    }, 5000);

    // Save on visibility change
    const handleVisibilityChange = () => {
      if (document.hidden) {
        saveCurrentRun();
      }
    };

    // Save before unload
    const handleBeforeUnload = () => {
      saveCurrentRun();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [score, level, progress, isPaused, isGameOver, phase, destroyedNormalObstacles, bossProgressPct, timeRemainingSeconds, saveRun]);

  // Handle game over
  if (isGameOver && gameState.isGameOver) {
    setTimeout(() => {
      onGameOver(score, level);
    }, 100);
  }

  const handlePause = () => {
    togglePause();
    // Save when pausing
    if (!isPaused && score > 0) {
      saveRun({
        currentScore: score,
        currentLevel: level,
        progress,
        isPaused: true,
        phase,
        destroyedNormalObstacles,
        bossProgressPct,
        timeRemainingSeconds
      });
    }
  };

  const handleExit = () => {
    // Save before exiting
    if (score > 0 && !isGameOver) {
      saveRun({
        currentScore: score,
        currentLevel: level,
        progress,
        isPaused: true,
        phase,
        destroyedNormalObstacles,
        bossProgressPct,
        timeRemainingSeconds
      });
    }
    onExit();
  };

  const handleJoystickMove = useCallback((x: number, y: number) => {
    setJoystickInput({ x, y });
  }, []);

  const handleShoot = useCallback((shooting: boolean) => {
    setTouchShooting(shooting);
  }, []);

  // Show controls during active play (not paused)
  const showControls = !isPaused;

  // Show rotate overlay on mobile portrait
  const showRotateOverlay = isMobile && isPortrait;

  return (
    <div className="gameplay-root relative w-full overflow-hidden bg-space-dark">
      {/* Game Canvas */}
      <GameCanvas gameState={gameState} />

      {/* HUD Overlay */}
      <Hud
        score={score}
        level={level}
        progress={progress}
        isPaused={isPaused}
        levelCompleteMessage={levelCompleteMessage}
        phase={phase}
        bossProgressPct={bossProgressPct}
        timeRemainingSeconds={timeRemainingSeconds}
        onPause={handlePause}
        onExit={handleExit}
      />

      {/* Touch Controls Overlay */}
      <div
        className="touch-controls-overlay"
        style={{ opacity: showControls ? 1 : 0 }}
      >
        {/* Joystick */}
        <div className="touch-control-left">
          <Joystick onMove={handleJoystickMove} />
        </div>

        {/* Shoot Button */}
        <div className="touch-control-right">
          <ShootButton onShoot={handleShoot} />
        </div>
      </div>

      {/* Rotate Device Overlay */}
      <RotateDeviceOverlay show={showRotateOverlay} />
    </div>
  );
}
