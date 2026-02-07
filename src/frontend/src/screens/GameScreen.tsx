import { useState, useEffect, useCallback } from 'react';
import Hud from '@/game/ui/Hud';
import GameCanvas from '@/game/render/GameCanvas';
import Joystick from '@/game/controls/Joystick';
import ShootButton from '@/game/controls/ShootButton';
import { useGameEngine } from '@/game/useGameEngine';
import { useKeyboardControls } from '@/game/controls/useKeyboardControls';
import { useCombinedControls } from '@/game/controls/useCombinedControls';
import { useDynamicViewport } from '@/hooks/useDynamicViewport';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface GameScreenProps {
  onExitToMenu: () => void;
  onGameOver: (finalScore: number, finalLevel: number) => void;
}

export default function GameScreen({ onExitToMenu, onGameOver }: GameScreenProps) {
  const [joystickInput, setJoystickInput] = useState({ x: 0, y: 0 });
  const [touchShooting, setTouchShooting] = useState(false);

  // Get keyboard controls
  const keyboardControls = useKeyboardControls();

  // Combine keyboard and on-screen controls
  const combinedControls = useCombinedControls({
    keyboardControls,
    joystickInput,
    touchShooting,
  });

  // Use combined controls in game engine
  const gameEngine = useGameEngine({
    controls: combinedControls,
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
    restartGame,
  } = gameEngine;

  // Use dynamic viewport hook for mobile browser UI handling
  useDynamicViewport();

  // Reset on-screen controls when pausing to prevent stuck state
  useEffect(() => {
    if (isPaused) {
      setJoystickInput({ x: 0, y: 0 });
      setTouchShooting(false);
    }
  }, [isPaused]);

  // Prevent page scroll during gameplay
  useEffect(() => {
    const preventDefault = (e: TouchEvent) => {
      if (e.target instanceof HTMLElement && !e.target.closest('button, a')) {
        e.preventDefault();
      }
    };
    document.addEventListener('touchmove', preventDefault, { passive: false });
    return () => document.removeEventListener('touchmove', preventDefault);
  }, []);

  const handleGameOverConfirm = useCallback(() => {
    onGameOver(score, level);
  }, [score, level, onGameOver]);

  const handleRestart = useCallback(() => {
    restartGame();
  }, [restartGame]);

  return (
    <div className="gameplay-root relative w-full overflow-hidden bg-space-dark">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(/assets/generated/space-bg.dim_1920x1080.png)' }}
      />

      {/* Game Canvas */}
      <GameCanvas gameState={gameState} />

      {/* HUD */}
      <Hud
        score={score}
        level={level}
        progress={progress}
        isPaused={isPaused}
        levelCompleteMessage={levelCompleteMessage}
        onPause={togglePause}
        onExit={onExitToMenu}
      />

      {/* On-Screen Controls - Always visible during active gameplay, hidden when paused */}
      <div className={`touch-controls-overlay ${isPaused ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <div className="touch-control-left">
          <ShootButton
            onShootStart={() => setTouchShooting(true)}
            onShootEnd={() => setTouchShooting(false)}
          />
        </div>
        <div className="touch-control-right">
          <Joystick onMove={(x, y) => setJoystickInput({ x, y })} />
        </div>
      </div>

      {/* Game Over Dialog */}
      <Dialog open={isGameOver} onOpenChange={() => {}}>
        <DialogContent className="glass-card z-[100] border-neon-magenta/30 bg-space-card/90 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-center text-3xl font-black text-neon-magenta drop-shadow-neon-magenta">
              GAME OVER
            </DialogTitle>
            <DialogDescription className="text-center text-lg text-muted-foreground">
              Final Score: <span className="font-bold text-neon-cyan">{score}</span>
              <br />
              Level Reached: <span className="font-bold text-neon-purple">{level}</span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button
              onClick={handleRestart}
              className="w-full bg-gradient-to-r from-neon-cyan to-neon-purple font-bold text-white hover:scale-105"
            >
              PLAY AGAIN
            </Button>
            <Button
              onClick={handleGameOverConfirm}
              variant="outline"
              className="w-full border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10"
            >
              BACK TO MENU
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
