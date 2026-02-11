import { Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { GamePhase } from '../types';

interface HudProps {
  score: number;
  level: number;
  progress: number;
  isPaused: boolean;
  levelCompleteMessage: string | null;
  phase: GamePhase;
  destroyedNormalObstacles: number;
  bossProgressPct: number;
  timeRemainingSeconds: number;
  onPause: () => void;
  onExit: () => void;
  touchControlsEnabled: boolean;
  onTouchControlsToggle: (enabled: boolean) => void;
}

export default function Hud({
  score,
  level,
  progress,
  isPaused,
  levelCompleteMessage,
  phase,
  destroyedNormalObstacles,
  bossProgressPct,
  timeRemainingSeconds,
  onPause,
  onExit,
  touchControlsEnabled,
  onTouchControlsToggle,
}: HudProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* Top HUD Bar */}
      <div className="hud-top">
        {/* Score */}
        <div className="glass-card hud-stat">
          <div className="hud-stat-icon">⊙</div>
          <div className="hud-stat-content">
            <div className="hud-stat-label">SCORE</div>
            <div className="hud-stat-value">{score}</div>
          </div>
        </div>

        {/* Timer */}
        <div className="glass-card hud-stat hud-stat-timer">
          <div className="hud-stat-icon">⏱</div>
          <div className="hud-stat-content">
            <div className="hud-stat-label">TIME</div>
            <div className="hud-stat-value">{formatTime(timeRemainingSeconds)}</div>
          </div>
        </div>

        {/* Phase Indicator */}
        <div className="glass-card hud-stat hud-stat-phase">
          <div className="hud-stat-icon">{phase === 'boss' ? '⚡' : '◈'}</div>
          <div className="hud-stat-content">
            <div className="hud-stat-label">{phase === 'boss' ? 'BOSS' : 'OBSTACLES'}</div>
            <div className="hud-stat-value">
              {phase === 'boss' ? `${Math.round(bossProgressPct)}%` : destroyedNormalObstacles}
            </div>
          </div>
        </div>

        {/* Level */}
        <div className="glass-card hud-stat hud-stat-level">
          <div className="hud-stat-icon">⚡</div>
          <div className="hud-stat-content">
            <div className="hud-stat-label">LEVEL</div>
            <div className="hud-stat-value">{level}</div>
          </div>
        </div>

        {/* Pause Button */}
        <Button
          onClick={onPause}
          variant="ghost"
          size="icon"
          className="hud-pause-button"
          aria-label="Pause game"
        >
          <Pause className="w-5 h-5" />
        </Button>
      </div>

      {/* Pause Dialog */}
      <Dialog open={isPaused} onOpenChange={onPause}>
        <DialogContent className="glass-card max-w-md pointer-events-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-neon-cyan">Game Paused</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Take a break. Your progress is saved.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Current Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card p-4 space-y-1">
                <div className="text-xs text-muted-foreground">Score</div>
                <div className="text-2xl font-bold text-neon-cyan">{score}</div>
              </div>
              <div className="glass-card p-4 space-y-1">
                <div className="text-xs text-muted-foreground">Level</div>
                <div className="text-2xl font-bold text-neon-purple">{level}</div>
              </div>
            </div>

            {/* Touch Controls Toggle */}
            <div className="glass-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="touch-controls-toggle" className="text-sm font-medium cursor-pointer">
                  Touch Controls
                </Label>
                <Switch
                  id="touch-controls-toggle"
                  checked={touchControlsEnabled}
                  onCheckedChange={onTouchControlsToggle}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Enable or disable on-screen joystick and shoot button
              </p>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              onClick={onPause}
              variant="default"
              className="w-full sm:w-auto bg-gradient-to-r from-neon-cyan to-neon-purple hover:opacity-90"
            >
              Resume
            </Button>
            <Button
              onClick={onExit}
              variant="outline"
              className="w-full sm:w-auto"
            >
              Exit to Menu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Level Complete Message */}
      {levelCompleteMessage && (
        <div className="hud-level-complete">
          <div className="glass-card hud-level-complete-card">
            <div className="text-2xl font-bold text-neon-cyan mb-2">
              {levelCompleteMessage}
            </div>
            <div className="text-sm text-muted-foreground">
              Get ready for the next challenge...
            </div>
          </div>
        </div>
      )}
    </>
  );
}
