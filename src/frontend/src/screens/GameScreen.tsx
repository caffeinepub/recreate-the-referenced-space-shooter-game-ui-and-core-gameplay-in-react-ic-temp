import { useState, useCallback, useEffect, useRef } from 'react';
import GameCanvas from '../game/render/GameCanvas';
import Hud from '../game/ui/Hud';
import Joystick from '../game/controls/Joystick';
import ShootButton from '../game/controls/ShootButton';
import TouchControlsDebugOverlay from '../game/ui/TouchControlsDebugOverlay';
import TouchControlsHints from '../game/ui/TouchControlsHints';
import RotateDeviceOverlay from '../components/RotateDeviceOverlay';
import { useGameEngine } from '../game/useGameEngine';
import { useKeyboardControls } from '../game/controls/useKeyboardControls';
import { useCombinedControls } from '../game/controls/useCombinedControls';
import { useLandscapeOrientation } from '../hooks/useLandscapeOrientation';
import { useIsTouchCapable } from '../hooks/useIsTouchCapable';
import { useDynamicViewport } from '../hooks/useDynamicViewport';
import { useInProgressRun } from '../game/persistence/useInProgressRun';
import { useTouchControlsDomSanityCheck } from '../game/ui/useTouchControlsDomSanityCheck';
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
  const [touchControlsEnabled, setTouchControlsEnabled] = useState(true);

  // Refs for DOM sanity check
  const joystickWrapperRef = useRef<HTMLDivElement>(null);
  const shootWrapperRef = useRef<HTMLDivElement>(null);

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

  // Centralized reset function for touch controls
  const resetTouchControls = useCallback(() => {
    setJoystickInput({ x: 0, y: 0 });
    setTouchShooting(false);
  }, []);

  // Toggle handler for pause menu
  const handleTouchControlsToggle = useCallback((enabled: boolean) => {
    setTouchControlsEnabled(enabled);
    if (!enabled) {
      resetTouchControls();
    }
  }, [resetTouchControls]);

  // Show touch controls when:
  // 1. Session toggle is enabled AND
  // 2. (Touch capable OR mobile device OR force flag) AND
  // 3. In landscape AND
  // 4. Not paused AND
  // 5. Not game over
  const showTouchControls = touchControlsEnabled && 
    (isTouchCapable || isMobile || forceTouchControls) && 
    !isPortrait && 
    !isPaused && 
    !isGameOver;

  // DOM sanity check for touch controls visibility
  const controlsMetrics = useTouchControlsDomSanityCheck({
    enabled: showTouchControls,
    joystickRef: joystickWrapperRef,
    shootRef: shootWrapperRef,
    debugMode: debugControls,
  });

  // Reset touch controls when they should be hidden
  useEffect(() => {
    if (!showTouchControls) {
      resetTouchControls();
    }
  }, [showTouchControls, resetTouchControls]);

  // Reset touch controls on orientation change, resize, and visibility change
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

    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [resetTouchControls]);

  // Attempt orientation lock on mount for touch-capable devices
  useEffect(() => {
    if (isTouchCapable || isMobile) {
      lockLandscape();
    }

    return () => {
      if (isTouchCapable || isMobile) {
        unlockOrientation();
      }
    };
  }, [isTouchCapable, isMobile, lockLandscape, unlockOrientation]);

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
          destroyedNormalObstacles={destroyedNormalObstacles}
          bossProgressPct={bossProgressPct}
          timeRemainingSeconds={timeRemainingSeconds}
          onPause={handlePause}
          onExit={handleExit}
          touchControlsEnabled={touchControlsEnabled}
          onTouchControlsToggle={handleTouchControlsToggle}
        />

        {/* Touch Controls Overlay - Joystick left, Shoot right */}
        {showTouchControls && (
          <>
            <div className="touch-controls-overlay">
              {/* Joystick - Bottom Left */}
              <div 
                ref={joystickWrapperRef}
                className="touch-control-left"
                data-control="joystick"
              >
                <Joystick onMove={handleJoystickMove} />
              </div>

              {/* Shoot Button - Bottom Right */}
              <div 
                ref={shootWrapperRef}
                className="touch-control-right"
                data-control="shoot"
              >
                <ShootButton onShoot={handleShootChange} />
              </div>
            </div>

            {/* Touch Controls Hints */}
            <TouchControlsHints />
          </>
        )}

        {/* Debug Overlay */}
        {debugControls && (
          <TouchControlsDebugOverlay
            isTouchCapable={isTouchCapable}
            isMobile={isMobile}
            isPortrait={isPortrait}
            isPaused={isPaused}
            isGameOver={isGameOver}
            touchControlsEnabled={touchControlsEnabled}
            showTouchControls={showTouchControls}
            forceTouchControls={forceTouchControls}
            joystickX={joystickInput.x}
            joystickY={joystickInput.y}
            isShooting={touchShooting}
            controlsMetrics={controlsMetrics}
          />
        )}
      </div>
    </>
  );
}
