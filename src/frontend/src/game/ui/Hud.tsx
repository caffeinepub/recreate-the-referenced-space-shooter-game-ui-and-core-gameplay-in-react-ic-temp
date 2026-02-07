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
      <div className="pointer-events-none absolute left-0 right-0 top-0 z-40 flex items-start justify-between gap-4 p-4">
        {/* Score Card */}
        <Card className="glass-card pointer-events-auto border-neon-cyan/30 bg-space-card/90 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">SCORE</div>
            <div className="text-3xl font-black text-neon-cyan drop-shadow-neon-cyan">
              {score.toString().padStart(6, '0')}
            </div>
          </CardContent>
        </Card>

        {/* Level Card */}
        <Card className="glass-card pointer-events-auto border-neon-purple/30 bg-space-card/90 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">LEVEL</div>
            <div className="text-3xl font-black text-neon-purple drop-shadow-neon-purple">
              {level}
            </div>
          </CardContent>
        </Card>

        {/* Pause Button */}
        <Button
          onClick={onPause}
          size="icon"
          className="pointer-events-auto h-14 w-14 rounded-full border-2 border-neon-magenta/30 bg-space-card/90 backdrop-blur-xl hover:bg-neon-magenta/20"
        >
          {isPaused ? (
            <Play className="h-6 w-6 text-neon-magenta" />
          ) : (
            <Pause className="h-6 w-6 text-neon-magenta" />
          )}
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="pointer-events-none absolute bottom-4 left-1/2 z-40 w-64 -translate-x-1/2">
        <div className="glass-card rounded-full border-neon-cyan/30 bg-space-card/90 p-2 backdrop-blur-xl">
          <Progress value={progress} className="h-3">
            <div className="progress-indicator-neon h-full rounded-full transition-all" style={{ width: `${progress}%` }} />
          </Progress>
        </div>
      </div>

      {/* Level Complete Message */}
      {levelCompleteMessage && (
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2">
          <div className="glass-card animate-float rounded-2xl border-neon-purple/50 bg-space-card/95 px-12 py-8 backdrop-blur-xl">
            <div className="text-center text-4xl font-black text-neon-purple drop-shadow-neon-purple">
              {levelCompleteMessage}
            </div>
          </div>
        </div>
      )}

      {/* Pause Overlay */}
      {isPaused && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <Card className="glass-card w-80 border-neon-magenta/30 bg-space-card/90 backdrop-blur-xl">
            <CardContent className="flex flex-col items-center gap-6 p-8">
              <h2 className="text-3xl font-black text-neon-magenta drop-shadow-neon-magenta">
                PAUSED
              </h2>
              <div className="flex w-full flex-col gap-3">
                <Button
                  onClick={onPause}
                  className="w-full bg-gradient-to-r from-neon-cyan to-neon-purple font-bold text-white hover:scale-105"
                >
                  <Play className="mr-2 h-5 w-5" />
                  RESUME
                </Button>
                <Button
                  onClick={onExit}
                  variant="outline"
                  className="w-full border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10"
                >
                  <LogOut className="mr-2 h-5 w-5" />
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
