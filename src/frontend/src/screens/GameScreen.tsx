import { useState, useCallback, useEffect, useRef } from 'react';
import GameCanvas from '../game/render/GameCanvas';
import Hud from '../game/ui/Hud';
import Joystick from '../game/controls/Joystick';
import ShootButton from '../game/controls/ShootButton';
import TouchControlsDebugOverlay from '../game/ui/TouchControlsDebugOverlay';
import RotateDeviceOverlay from '../components/RotateDeviceOverlay';
import { useGameEngine } from '../game/useGameEngine';
import { useKeyboardControls } from '../game/controls/useKeyboardControls';
import { useCombinedControls } from '../game/controls/useCombinedControls';
import { useLandscapeOrientation } from '../hooks/useLandscapeOrientation';
import { useIsTouchCapable } from '../hooks/useIsTouchCapable';
import { useDynamicViewport } from '../hooks/useDynamicViewport';
import { useInProgressRun } from '../game/persistence/useInProgressRun';
import { getBooleanUrlParameter } from '../utils/urlParams';
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
  const isTouchCapable = useIsTouchCapable();
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
    initializeFromSnapshot,
  } = useGameEngine({ controls, resumeData });

  // Check for debug mode and force flags
  const debugControls = getBooleanUrlParameter('debugControls');
  const forceTouchControls = getBooleanUrlParameter('forceTouchControls');

  // Joystick callback
  const handleJoystickMove = useCallback((x: number, y: number) => {
    setJoystickInput({ x, y });
  }, []);

  // Shoot button callback
  const handleShootChange = useCallback((shooting: boolean) => {
    setTouchShooting(shooting);
  }, []);

  // Reset touch controls when they should be hidden
  useEffect(() => {
    if (isPortrait || isPaused || isGameOver) {
      setJoystickInput({ x: 0, y: 0 });
      setTouchShooting(false);
    }
  }, [isPortrait, isPaused, isGameOver]);

  // Attempt orientation lock on mount for touch-capable devices
  useEffect(() => {
    if (isTouchCapable) {
      lockLandscape();
    }

    return () => {
      if (isTouchCapable) {
        unlockOrientation();
      }
    };
  }, [isTouchCapable, lockLandscape, unlockOrientation]);

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

  // Handle game over with delay to show explosion VFX
  useEffect(() => {
    if (isGameOver && gameState.isGameOver) {
      // Delay game over transition to allow explosion VFX to be visible
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

  // Show touch controls when device is touch-capable and in landscape (not paused/game over)
  // OR when forceTouchControls is enabled (for debugging)
  const showTouchControls = (isTouchCapable || forceTouchControls) && !isPortrait && !isPaused && !isGameOver;

  return (
    <>
      {/* Rotate overlay for mobile portrait */}
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
          bossProgressPct={bossProgressPct}
          timeRemainingSeconds={timeRemainingSeconds}
          onPause={handlePause}
          onExit={handleExit}
        />

        {/* Touch Controls Overlay - SWAPPED: Shoot left, Joystick right */}
        {showTouchControls && (
          <div className="touch-controls-overlay">
            <div className="touch-control-left">
              <ShootButton onShoot={handleShootChange} />
            </div>
            <div className="touch-control-right">
              <Joystick onMove={handleJoystickMove} />
            </div>
          </div>
        )}

        {/* Debug Overlay (only when ?debugControls=1) */}
        {debugControls && (
          <TouchControlsDebugOverlay
            isTouchCapable={isTouchCapable}
            isPortrait={isPortrait}
            isMobile={isMobile}
            isPaused={isPaused}
            isGameOver={isGameOver}
            showTouchControls={showTouchControls}
            forceTouchControls={forceTouchControls}
            joystickX={joystickInput.x}
            joystickY={joystickInput.y}
            isShooting={touchShooting}
          />
        )}
      </div>
    </>
  );
}
