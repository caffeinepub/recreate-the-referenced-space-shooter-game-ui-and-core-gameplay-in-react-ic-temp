import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Pause, Play, LogOut, Clock, Target, Zap } from 'lucide-react';
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
      {/* Top HUD Row - Score, Timer, Level, Pause */}
      <div 
        className="pointer-events-none absolute left-0 right-0 top-0 z-40 flex items-start justify-between"
        style={{ 
          gap: 'var(--hud-gap)',
          padding: 'var(--hud-gap)',
          paddingTop: 'max(var(--hud-gap), env(safe-area-inset-top))',
          paddingLeft: 'max(var(--hud-gap), env(safe-area-inset-left))',
          paddingRight: 'max(var(--hud-gap), env(safe-area-inset-right))'
        }}
      >
        {/* Score Card */}
        <Card className="hud-card pointer-events-auto border-2 border-neon-cyan/60 bg-gradient-to-br from-space-card/70 to-space-card/50 shadow-[0_0_25px_oklch(0.75_0.20_195/0.4)] backdrop-blur-xl transition-all hover:shadow-[0_0_35px_oklch(0.75_0.20_195/0.6)]">
          <CardContent style={{ padding: 'var(--hud-card-padding)' }}>
            <div 
              className="flex items-center gap-1 font-black uppercase tracking-wider text-neon-cyan/90"
              style={{ fontSize: 'var(--hud-text-label)' }}
            >
              <Target style={{ width: 'var(--hud-text-label)', height: 'var(--hud-text-label)' }} />
              Score
            </div>
            <div 
              className="font-black tabular-nums text-neon-cyan drop-shadow-[0_0_12px_oklch(0.75_0.20_195/0.9)]"
              style={{ fontSize: 'var(--hud-text-value)' }}
            >
              {score.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        {/* Timer Card */}
        <Card className={`hud-card pointer-events-auto backdrop-blur-xl transition-all ${
          isLowTime 
            ? 'border-2 border-destructive/80 bg-gradient-to-br from-destructive/30 to-destructive/20 shadow-[0_0_30px_oklch(0.55_0.25_20/0.6)]' 
            : 'border-2 border-neon-yellow/60 bg-gradient-to-br from-space-card/70 to-space-card/50 shadow-[0_0_25px_oklch(0.85_0.20_90/0.4)]'
        }`}>
          <CardContent style={{ padding: 'var(--hud-card-padding)' }}>
            <div 
              className="flex items-center gap-1 font-black uppercase tracking-wider text-neon-yellow/90"
              style={{ fontSize: 'var(--hud-text-label)' }}
            >
              <Clock style={{ width: 'var(--hud-text-label)', height: 'var(--hud-text-label)' }} />
              Time
            </div>
            <div 
              className={`font-black tabular-nums transition-all ${
                isLowTime 
                  ? 'animate-pulse text-destructive drop-shadow-[0_0_15px_oklch(0.55_0.25_20/1)]' 
                  : 'text-neon-yellow drop-shadow-[0_0_12px_oklch(0.85_0.20_90/0.9)]'
              }`}
              style={{ fontSize: 'var(--hud-text-value)' }}
            >
              {formatTime(timeRemainingSeconds)}
            </div>
          </CardContent>
        </Card>

        {/* Level Card */}
        <Card className="hud-card pointer-events-auto border-2 border-neon-magenta/60 bg-gradient-to-br from-space-card/70 to-space-card/50 shadow-[0_0_25px_oklch(0.70_0.25_330/0.4)] backdrop-blur-xl transition-all hover:shadow-[0_0_35px_oklch(0.70_0.25_330/0.6)]">
          <CardContent style={{ padding: 'var(--hud-card-padding)' }}>
            <div 
              className="flex items-center gap-1 font-black uppercase tracking-wider text-neon-magenta/90"
              style={{ fontSize: 'var(--hud-text-label)' }}
            >
              <Zap style={{ width: 'var(--hud-text-label)', height: 'var(--hud-text-label)' }} />
              Level
            </div>
            <div 
              className="font-black tabular-nums text-neon-magenta drop-shadow-[0_0_12px_oklch(0.70_0.25_330/0.9)]"
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
          className="pointer-events-auto border-2 border-neon-purple/60 bg-gradient-to-br from-space-card/70 to-space-card/50 text-neon-purple shadow-[0_0_25px_oklch(0.70_0.25_300/0.4)] backdrop-blur-xl transition-all hover:scale-105 hover:border-neon-purple/80 hover:bg-neon-purple/20 hover:shadow-[0_0_35px_oklch(0.70_0.25_300/0.6)] active:scale-95"
          style={{
            width: 'var(--hud-pause-size)',
            height: 'var(--hud-pause-size)'
          }}
        >
          {isPaused ? (
            <Play style={{ width: 'var(--hud-pause-icon)', height: 'var(--hud-pause-icon)' }} fill="currentColor" />
          ) : (
            <Pause style={{ width: 'var(--hud-pause-icon)', height: 'var(--hud-pause-icon)' }} />
          )}
        </Button>
      </div>

      {/* Top Center - Progress Bar */}
      <div 
        className="pointer-events-none absolute left-1/2 top-0 z-40 flex -translate-x-1/2 flex-col items-center"
        style={{ 
          paddingTop: 'calc(var(--hud-gap) * 2 + var(--hud-pause-size) + max(0px, env(safe-area-inset-top)))',
          gap: 'var(--hud-gap)'
        }}
      >
        {phase === 'normal' ? (
          // Normal phase: show obstacle progress
          <Card 
            className="hud-card pointer-events-auto border-2 border-neon-cyan/60 bg-gradient-to-br from-space-card/70 to-space-card/50 shadow-[0_0_25px_oklch(0.75_0.20_195/0.4)] backdrop-blur-xl"
            style={{ 
              padding: 'var(--hud-card-padding)',
              minWidth: 'var(--hud-progress-width)'
            }}
          >
            <div 
              className="mb-2 text-center font-black uppercase tracking-wider text-neon-cyan/90"
              style={{ fontSize: 'var(--hud-text-label)' }}
            >
              Obstacles
            </div>
            <Progress 
              value={progress} 
              className="w-full"
              style={{ height: 'var(--hud-progress-height)' }}
            />
          </Card>
        ) : (
          // Boss phase: show boss health bar
          <Card 
            className="hud-card pointer-events-auto border-2 border-neon-magenta/60 bg-gradient-to-br from-space-card/70 to-space-card/50 shadow-[0_0_30px_oklch(0.70_0.25_330/0.5)] backdrop-blur-xl"
            style={{ 
              padding: 'var(--hud-card-padding)',
              minWidth: 'var(--hud-boss-progress-width)'
            }}
          >
            <div 
              className="mb-2 text-center font-black uppercase tracking-wider text-neon-magenta drop-shadow-[0_0_12px_oklch(0.70_0.25_330/0.9)]"
              style={{ fontSize: 'var(--hud-text-label)' }}
            >
              Boss
            </div>
            <Progress 
              value={bossProgressPct} 
              className="w-full"
              style={{ height: 'var(--hud-boss-progress-height)' }}
            />
          </Card>
        )}
      </div>

      {/* Pause Overlay */}
      {isPaused && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl">
          <Card className="border-2 border-neon-purple/70 bg-gradient-to-br from-space-card/80 to-space-card/60 shadow-[0_0_50px_oklch(0.70_0.25_300/0.7)] backdrop-blur-xl">
            <CardContent className="flex flex-col items-center gap-8 p-10">
              <h2 className="text-6xl font-black uppercase tracking-widest text-neon-purple drop-shadow-[0_0_20px_oklch(0.70_0.25_300/1)]">
                Paused
              </h2>
              <div className="flex gap-5">
                <Button
                  onClick={onPause}
                  variant="default"
                  className="border-2 border-neon-purple/60 bg-gradient-to-r from-neon-purple/30 to-neon-magenta/30 px-8 py-6 text-lg font-black text-white shadow-[0_0_25px_oklch(0.70_0.25_300/0.5)] backdrop-blur-sm transition-all hover:scale-105 hover:border-neon-purple/80 hover:from-neon-purple/40 hover:to-neon-magenta/40 hover:shadow-[0_0_40px_oklch(0.70_0.25_300/0.7)] active:scale-95"
                >
                  <Play className="mr-2 h-6 w-6" fill="currentColor" />
                  Resume
                </Button>
                <Button
                  onClick={onExit}
                  variant="outline"
                  className="border-2 border-neon-cyan/60 bg-gradient-to-r from-neon-cyan/10 to-transparent px-8 py-6 text-lg font-black text-neon-cyan shadow-[0_0_20px_oklch(0.75_0.20_195/0.4)] backdrop-blur-sm transition-all hover:scale-105 hover:border-neon-cyan/80 hover:from-neon-cyan/20 hover:shadow-[0_0_35px_oklch(0.75_0.20_195/0.6)] active:scale-95"
                >
                  <LogOut className="mr-2 h-6 w-6" />
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
            <h2 className="text-6xl font-black uppercase tracking-widest text-neon-magenta drop-shadow-[0_0_25px_oklch(0.70_0.25_330/1)] md:text-8xl">
              {levelCompleteMessage}
            </h2>
          </div>
        </div>
      )}
    </>
  );
}
