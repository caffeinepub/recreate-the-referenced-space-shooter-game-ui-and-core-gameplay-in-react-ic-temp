import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Pause, Play, LogOut, Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import type { GamePhase } from '../types';

interface HudProps {
  score: number;
  level: number;
  progress: number;
  isPaused: boolean;
  levelCompleteMessage?: string | null;
  phase: GamePhase;
  bossProgressPct: number;
  timeRemainingSeconds: number;
  onPause: () => void;
  onExit: () => void;
}

export default function Hud({ 
  score, 
  level, 
  progress, 
  isPaused, 
  levelCompleteMessage, 
  phase,
  bossProgressPct,
  timeRemainingSeconds,
  onPause, 
  onExit 
}: HudProps) {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isLowTime = timeRemainingSeconds <= 10;

  return (
    <>
      {/* Top HUD */}
      <div 
        className="pointer-events-none absolute left-0 right-0 top-0 z-40 flex items-start justify-between"
        style={{ 
          gap: 'var(--hud-gap)',
          padding: 'var(--hud-gap)'
        }}
      >
        {/* Score Card - Transparent Background */}
        <Card className="glass-card-transparent pointer-events-auto border-neon-cyan/30 backdrop-blur-xl">
          <CardContent style={{ padding: 'var(--hud-card-padding)' }}>
            <div 
              className="font-medium text-muted-foreground"
              style={{ fontSize: 'var(--hud-text-label)' }}
            >
              SCORE
            </div>
            <div 
              className="font-bold text-neon-cyan"
              style={{ fontSize: 'var(--hud-text-value)' }}
            >
              {score}
            </div>
          </CardContent>
        </Card>

        {/* Timer Card - Transparent Background */}
        <Card className={`glass-card-transparent pointer-events-auto backdrop-blur-xl ${
          isLowTime ? 'border-destructive/50' : 'border-neon-yellow/30'
        }`}>
          <CardContent style={{ padding: 'var(--hud-card-padding)' }}>
            <div 
              className="flex items-center gap-1 font-medium text-muted-foreground"
              style={{ fontSize: 'var(--hud-text-label)' }}
            >
              <Clock style={{ width: 'var(--hud-text-label)', height: 'var(--hud-text-label)' }} />
              TIME
            </div>
            <div 
              className={`font-bold ${isLowTime ? 'text-destructive' : 'text-neon-yellow'}`}
              style={{ fontSize: 'var(--hud-text-value)' }}
            >
              {formatTime(timeRemainingSeconds)}
            </div>
          </CardContent>
        </Card>

        {/* Level Card - Transparent Background */}
        <Card className="glass-card-transparent pointer-events-auto border-neon-magenta/30 backdrop-blur-xl">
          <CardContent style={{ padding: 'var(--hud-card-padding)' }}>
            <div 
              className="font-medium text-muted-foreground"
              style={{ fontSize: 'var(--hud-text-label)' }}
            >
              LEVEL
            </div>
            <div 
              className="font-bold text-neon-magenta"
              style={{ fontSize: 'var(--hud-text-value)' }}
            >
              {level}
            </div>
          </CardContent>
        </Card>

        {/* Pause Button */}
        <Button
          onClick={onPause}
          variant="ghost"
          size="icon"
          className="pointer-events-auto border border-neon-purple/30 bg-transparent text-neon-purple backdrop-blur-xl hover:bg-neon-purple/10"
          style={{
            width: 'var(--hud-pause-size)',
            height: 'var(--hud-pause-size)'
          }}
        >
          {isPaused ? (
            <Play style={{ width: 'var(--hud-pause-icon)', height: 'var(--hud-pause-icon)' }} />
          ) : (
            <Pause style={{ width: 'var(--hud-pause-icon)', height: 'var(--hud-pause-icon)' }} />
          )}
        </Button>
      </div>

      {/* Bottom HUD - Progress Bar */}
      <div 
        className="pointer-events-none absolute bottom-0 left-0 right-0 z-40 flex flex-col items-center"
        style={{ 
          padding: 'var(--hud-gap)',
          gap: 'var(--hud-gap)'
        }}
      >
        {phase === 'normal' ? (
          // Normal phase: show obstacle progress
          <div 
            className="glass-card-transparent pointer-events-auto flex flex-col items-center border-neon-cyan/30 backdrop-blur-xl"
            style={{ 
              padding: 'var(--hud-card-padding)',
              width: 'var(--hud-progress-width)'
            }}
          >
            <div 
              className="mb-1 font-medium text-muted-foreground"
              style={{ fontSize: 'var(--hud-text-label)' }}
            >
              OBSTACLES
            </div>
            <Progress 
              value={progress} 
              className="h-2 w-full"
              style={{ height: 'var(--hud-progress-height)' }}
            />
          </div>
        ) : (
          // Boss phase: show smaller boss health bar
          <div 
            className="glass-card-transparent pointer-events-auto flex flex-col items-center border-neon-magenta/30 backdrop-blur-xl"
            style={{ 
              padding: 'var(--hud-card-padding)',
              width: 'var(--hud-boss-progress-width)'
            }}
          >
            <div 
              className="mb-1 font-medium text-neon-magenta"
              style={{ fontSize: 'var(--hud-text-label)' }}
            >
              BOSS
            </div>
            <Progress 
              value={bossProgressPct} 
              className="h-1.5 w-full"
              style={{ height: 'var(--hud-boss-progress-height)' }}
            />
          </div>
        )}
      </div>

      {/* Pause Overlay */}
      {isPaused && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <Card className="glass-card border-neon-purple/50 shadow-neon-magenta-lg">
            <CardContent className="flex flex-col items-center gap-4 p-8">
              <h2 className="text-3xl font-bold text-neon-purple">PAUSED</h2>
              <div className="flex gap-4">
                <Button
                  onClick={onPause}
                  variant="default"
                  className="neon-button bg-neon-purple/20 text-neon-purple hover:bg-neon-purple/30"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Resume
                </Button>
                <Button
                  onClick={onExit}
                  variant="outline"
                  className="border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10"
                >
                  <LogOut className="mr-2 h-5 w-5" />
                  Exit
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Level Complete Message */}
      {levelCompleteMessage && (
        <div className="absolute inset-0 z-50 flex items-center justify-center">
          <div className="animate-float text-center">
            <h2 className="drop-shadow-neon-magenta text-5xl font-bold text-neon-magenta md:text-7xl">
              {levelCompleteMessage}
            </h2>
          </div>
        </div>
      )}
    </>
  );
}
