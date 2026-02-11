import { useState, useCallback, useEffect, useRef } from 'react';
import GameCanvas from '../game/render/GameCanvas';
import Hud from '../game/ui/Hud';
import Joystick from '../game/controls/Joystick';
import ShootButton from '../game/controls/ShootButton';
import TouchControlsHints from '../game/ui/TouchControlsHints';
import RotateDeviceOverlay from '../components/RotateDeviceOverlay';
import { useGameEngine } from '../game/useGameEngine';
import { useKeyboardControls } from '../game/controls/useKeyboardControls';
import { useCombinedControls } from '../game/controls/useCombinedControls';
import { useLandscapeOrientation } from '../hooks/useLandscapeOrientation';
import { useDynamicViewport } from '../hooks/useDynamicViewport';
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
  const [touchControlsEnabled, setTouchControlsEnabled] = useState(true);

  const keyboardControls = useKeyboardControls();
  const controls = useCombinedControls({
    keyboardControls,
    joystickInput,
    touchShooting,
  });

  const { isMobile, isPortrait, lockLandscape, unlockOrientation } = useLandscapeOrientation();
  useDynamicViewport();
  const { saveRun } = useInProgressRun();
  const saveIntervalRef = useRef<number | undefined>(undefined);
  const gameOverTimeoutRef = useRef<number | undefined>(undefined);

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
  } = useGameEngine({ controls, resumeData });

  const handleJoystickMove = useCallback((x: number, y: number) => {
    if (touchControlsEnabled) {
      setJoystickInput({ x, y });
    }
  }, [touchControlsEnabled]);

  const handleShootChange = useCallback((shooting: boolean) => {
    if (touchControlsEnabled) {
      setTouchShooting(shooting);
    }
  }, [touchControlsEnabled]);

  const resetTouchControls = useCallback(() => {
    setJoystickInput({ x: 0, y: 0 });
    setTouchShooting(false);
  }, []);

  const handleTouchControlsToggle = useCallback((enabled: boolean) => {
    setTouchControlsEnabled(enabled);
    if (!enabled) {
      resetTouchControls();
    }
  }, [resetTouchControls]);

  // Reset touch controls on orientation change, resize, visibility change, and blur
  useEffect(() => {
    const handleOrientationChange = () => {
      resetTouchControls();
    };

    const handleResize = () => {
      resetTouchControls();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        resetTouchControls();
      }
    };

    const handlePageHide = () => {
      resetTouchControls();
    };

    const handleBlur = () => {
      resetTouchControls();
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('blur', handleBlur);
    };
  }, [resetTouchControls]);

  // Attempt orientation lock on mount for mobile devices
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

    saveIntervalRef.current = window.setInterval(() => {
      if (!isPaused && !isGameOver) {
        saveCurrentRun();
      }
    }, 5000);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        saveCurrentRun();
      }
    };

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

  // Handle game over with delay to show explosion VFX
  useEffect(() => {
    if (isGameOver && gameState.isGameOver) {
      gameOverTimeoutRef.current = window.setTimeout(() => {
        onGameOver(score, level);
      }, 500);
    }

    return () => {
      if (gameOverTimeoutRef.current) {
        clearTimeout(gameOverTimeoutRef.current);
      }
    };
  }, [isGameOver, gameState.isGameOver, score, level, onGameOver]);

  const handlePause = () => {
    togglePause();
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

  return (
    <>
      {/* Non-blocking rotate hint for mobile portrait */}
      <RotateDeviceOverlay show={isMobile && isPortrait} />

      {/* Gameplay container */}
      <div className="gameplay-root">
        {/* Game Canvas */}
        <GameCanvas gameState={gameState} />

        {/* HUD */}
        <Hud
          score={score}
          level={level}
          progress={progress}
          isPaused={isPaused}
          levelCompleteMessage={levelCompleteMessage}
          phase={phase}
          destroyedNormalObstacles={destroyedNormalObstacles}
          bossProgressPct={bossProgressPct}
          timeRemainingSeconds={timeRemainingSeconds}
          onPause={handlePause}
          onExit={handleExit}
          touchControlsEnabled={touchControlsEnabled}
          onTouchControlsToggle={handleTouchControlsToggle}
        />

        {/* Touch Controls Overlay - Always visible */}
        <div className={`touch-controls-overlay ${!touchControlsEnabled ? 'touch-controls-disabled' : ''}`}>
          {/* Joystick - Bottom Left */}
          <div className="touch-control-left" data-control="joystick">
            <Joystick onMove={handleJoystickMove} disabled={!touchControlsEnabled} />
          </div>

          {/* Shoot Button - Bottom Right */}
          <div className="touch-control-right" data-control="shoot">
            <ShootButton onShoot={handleShootChange} disabled={!touchControlsEnabled} />
          </div>
        </div>

        {/* Touch Controls Hints */}
        <TouchControlsHints />
      </div>
    </>
  );
}
