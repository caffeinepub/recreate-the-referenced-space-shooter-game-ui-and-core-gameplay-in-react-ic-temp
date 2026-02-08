import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Pause, Play, LogOut } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface HudProps {
  score: number;
  level: number;
  progress: number;
  isPaused: boolean;
  levelCompleteMessage?: string | null;
  onPause: () => void;
  onExit: () => void;
}

export default function Hud({ score, level, progress, isPaused, levelCompleteMessage, onPause, onExit }: HudProps) {
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
        {/* Score Card */}
        <Card className="glass-card pointer-events-auto border-neon-cyan/30 bg-space-card/90 backdrop-blur-xl">
          <CardContent style={{ padding: 'var(--hud-card-padding)' }}>
            <div 
              className="font-medium text-muted-foreground"
              style={{ fontSize: 'var(--hud-text-label)' }}
            >
              SCORE
            </div>
            <div 
              className="font-black text-neon-cyan drop-shadow-neon-cyan"
              style={{ fontSize: 'var(--hud-text-value)' }}
            >
              {score.toString().padStart(6, '0')}
            </div>
          </CardContent>
        </Card>

        {/* Level Card */}
        <Card className="glass-card pointer-events-auto border-neon-purple/30 bg-space-card/90 backdrop-blur-xl">
          <CardContent style={{ padding: 'var(--hud-card-padding)' }}>
            <div 
              className="font-medium text-muted-foreground"
              style={{ fontSize: 'var(--hud-text-label)' }}
            >
              LEVEL
            </div>
            <div 
              className="font-black text-neon-purple drop-shadow-neon-purple"
              style={{ fontSize: 'var(--hud-text-value)' }}
            >
              {level}
            </div>
          </CardContent>
        </Card>

        {/* Pause Button */}
        <Button
          onClick={onPause}
          size="icon"
          className="pointer-events-auto rounded-full border-2 border-neon-magenta/30 bg-space-card/90 backdrop-blur-xl hover:bg-neon-magenta/20"
          style={{ 
            width: 'var(--hud-pause-size)',
            height: 'var(--hud-pause-size)'
          }}
        >
          {isPaused ? (
            <Play style={{ width: 'var(--hud-pause-icon)', height: 'var(--hud-pause-icon)' }} className="text-neon-magenta" />
          ) : (
            <Pause style={{ width: 'var(--hud-pause-icon)', height: 'var(--hud-pause-icon)' }} className="text-neon-magenta" />
          )}
        </Button>
      </div>

      {/* Progress Bar */}
      <div 
        className="pointer-events-none absolute left-1/2 z-40 -translate-x-1/2"
        style={{ 
          bottom: 'var(--hud-gap)',
          width: 'var(--hud-progress-width)'
        }}
      >
        <div 
          className="glass-card rounded-full border-neon-cyan/30 bg-space-card/90 backdrop-blur-xl"
          style={{ padding: 'calc(var(--hud-gap) * 0.5)' }}
        >
          <Progress 
            value={progress} 
            style={{ height: 'var(--hud-progress-height)' }}
          >
            <div className="progress-indicator-neon h-full rounded-full transition-all" style={{ width: `${progress}%` }} />
          </Progress>
        </div>
      </div>

      {/* Level Complete Message */}
      {levelCompleteMessage && (
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2">
          <div className="glass-card animate-float rounded-2xl border-neon-purple/50 bg-space-card/95 px-6 py-4 backdrop-blur-xl sm:px-8 sm:py-6 md:px-12 md:py-8">
            <div className="text-center text-xl font-black text-neon-purple drop-shadow-neon-purple sm:text-2xl md:text-3xl lg:text-4xl">
              {levelCompleteMessage}
            </div>
          </div>
        </div>
      )}

      {/* Pause Overlay */}
      {isPaused && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <Card className="glass-card w-72 border-neon-magenta/30 bg-space-card/90 backdrop-blur-xl sm:w-80">
            <CardContent className="flex flex-col items-center gap-4 p-6 sm:gap-6 sm:p-8">
              <h2 className="text-2xl font-black text-neon-magenta drop-shadow-neon-magenta sm:text-3xl">
                PAUSED
              </h2>
              <div className="flex w-full flex-col gap-2 sm:gap-3">
                <Button
                  onClick={onPause}
                  className="w-full bg-gradient-to-r from-neon-cyan to-neon-purple font-bold text-white hover:scale-105"
                >
                  <Play className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  RESUME
                </Button>
                <Button
                  onClick={onExit}
                  variant="outline"
                  className="w-full border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10"
                >
                  <LogOut className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  EXIT TO MENU
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
