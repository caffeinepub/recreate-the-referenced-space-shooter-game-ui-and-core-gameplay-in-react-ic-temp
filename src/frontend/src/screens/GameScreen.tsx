import { useState, useCallback } from 'react';
import GameCanvas from '../game/render/GameCanvas';
import Hud from '../game/ui/Hud';
import Joystick from '../game/controls/Joystick';
import ShootButton from '../game/controls/ShootButton';
import { useGameEngine } from '../game/useGameEngine';
import { useKeyboardControls } from '../game/controls/useKeyboardControls';
import { useCombinedControls } from '../game/controls/useCombinedControls';

interface GameScreenProps {
  onExit: () => void;
  onGameOver: (score: number, level: number) => void;
}

export default function GameScreen({ onExit, onGameOver }: GameScreenProps) {
  const [joystickInput, setJoystickInput] = useState({ x: 0, y: 0 });
  const [touchShooting, setTouchShooting] = useState(false);

  const keyboardControls = useKeyboardControls();
  const controls = useCombinedControls({
    keyboardControls,
    joystickInput,
    touchShooting,
  });

  const {
    score,
    level,
    progress,
    isPaused,
    isGameOver,
    levelCompleteMessage,
    gameState,
    togglePause,
  } = useGameEngine({ controls });

  // Handle game over
  if (isGameOver && gameState.isGameOver) {
    setTimeout(() => {
      onGameOver(score, level);
    }, 100);
  }

  const handlePause = () => {
    togglePause();
  };

  const handleExit = () => {
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
    </div>
  );
}
