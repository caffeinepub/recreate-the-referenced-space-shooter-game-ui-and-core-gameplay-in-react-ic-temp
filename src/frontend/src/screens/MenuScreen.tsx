import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import LoginButton from '@/components/LoginButton';
import { Play, Gamepad2, Keyboard } from 'lucide-react';

interface MenuScreenProps {
  highScore: number;
  onStartGame: () => void;
  onContinueGame: () => void;
  hasSavedRun: boolean;
  isLoadingStats: boolean;
}

export default function MenuScreen({ highScore, onStartGame, onContinueGame, hasSavedRun, isLoadingStats }: MenuScreenProps) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(/assets/generated/space-bg.dim_1920x1080.png)' }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-space-dark/90 via-space-dark/70 to-space-dark/90" />

      {/* Animated stars overlay */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute h-1 w-1 animate-pulse rounded-full bg-white" style={{ top: '20%', left: '15%' }} />
        <div className="absolute h-1 w-1 animate-pulse rounded-full bg-white" style={{ top: '40%', left: '80%', animationDelay: '0.5s' }} />
        <div className="absolute h-1 w-1 animate-pulse rounded-full bg-white" style={{ top: '70%', left: '25%', animationDelay: '1s' }} />
        <div className="absolute h-1 w-1 animate-pulse rounded-full bg-white" style={{ top: '85%', left: '70%', animationDelay: '1.5s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-3 py-4 sm:px-4 sm:py-6">
        {/* Logo Mark */}
        <div className="mb-4 animate-float sm:mb-6">
          <img
            src="/assets/generated/logo-mark.dim_512x512.png"
            alt="Space Shooter Logo"
            className="drop-shadow-[0_0_40px_oklch(0.70_0.25_300/0.6)]"
            style={{ width: 'var(--logo-size)', height: 'var(--logo-size)' }}
          />
        </div>

        {/* Title */}
        <div className="mb-6 text-center sm:mb-8">
          <h1 
            className="mb-2 font-black tracking-widest text-neon-purple drop-shadow-[0_0_30px_oklch(0.70_0.25_300/0.9)]"
            style={{ fontSize: 'var(--title-size)' }}
          >
            SPACE
          </h1>
          <h1 
            className="font-black tracking-widest text-neon-cyan drop-shadow-[0_0_30px_oklch(0.75_0.20_195/0.9)]"
            style={{ fontSize: 'var(--title-size)' }}
          >
            SHOOTER
          </h1>
          <div className="mt-2 text-xs font-semibold uppercase tracking-widest text-neon-magenta/70 sm:text-sm">
            Defend the Galaxy
          </div>
        </div>

        {/* High Score Card */}
        <Card 
          className="menu-card mb-5 w-full border-2 border-neon-cyan/40 bg-gradient-to-br from-space-card/60 to-space-card/40 shadow-[0_0_30px_oklch(0.75_0.20_195/0.3)] backdrop-blur-xl transition-all hover:border-neon-cyan/60 hover:shadow-[0_0_40px_oklch(0.75_0.20_195/0.5)] sm:mb-7"
          style={{ 
            maxWidth: 'var(--menu-max-width)',
            padding: 'var(--menu-card-padding)'
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/assets/generated/icon-trophy.dim_128x128.png"
                alt="Trophy"
                className="h-7 w-7 drop-shadow-[0_0_15px_oklch(0.70_0.25_330/0.8)] sm:h-9 sm:w-9"
              />
              <span className="text-base font-bold uppercase tracking-wide text-foreground/90 sm:text-lg">High Score</span>
            </div>
            <span className="text-2xl font-black tabular-nums text-neon-magenta drop-shadow-[0_0_15px_oklch(0.70_0.25_330/0.9)] sm:text-3xl">
              {isLoadingStats ? '...' : highScore.toLocaleString()}
            </span>
          </div>
        </Card>

        {/* Continue Button (only if saved run exists) */}
        {hasSavedRun && (
          <Button
            onClick={onContinueGame}
            className="menu-button mb-4 w-full border-2 border-neon-cyan/50 bg-gradient-to-r from-neon-cyan/20 to-neon-purple/20 font-black tracking-widest text-white shadow-[0_0_30px_oklch(0.75_0.20_195/0.4)] backdrop-blur-sm transition-all hover:scale-[1.02] hover:border-neon-cyan/70 hover:from-neon-cyan/30 hover:to-neon-purple/30 hover:shadow-[0_0_45px_oklch(0.75_0.20_195/0.6)] active:scale-[0.98]"
            style={{ 
              maxWidth: 'var(--menu-max-width)',
              height: 'var(--menu-button-height)',
              fontSize: 'var(--menu-button-text)'
            }}
          >
            <Play className="mr-2 h-5 w-5 sm:h-6 sm:w-6" fill="currentColor" />
            CONTINUE
          </Button>
        )}

        {/* Start Button */}
        <Button
          onClick={onStartGame}
          className="menu-button mb-6 w-full border-2 border-neon-magenta/50 bg-gradient-to-r from-neon-magenta/20 to-neon-purple/20 font-black tracking-widest text-white shadow-[0_0_30px_oklch(0.70_0.25_330/0.4)] backdrop-blur-sm transition-all hover:scale-[1.02] hover:border-neon-magenta/70 hover:from-neon-magenta/30 hover:to-neon-purple/30 hover:shadow-[0_0_45px_oklch(0.70_0.25_330/0.6)] active:scale-[0.98] sm:mb-8"
          style={{ 
            maxWidth: 'var(--menu-max-width)',
            height: 'var(--menu-button-height)',
            fontSize: 'var(--menu-button-text)'
          }}
        >
          START GAME
        </Button>

        {/* Instruction Panels */}
        <div 
          className="mb-5 grid w-full gap-3 sm:mb-6 sm:gap-4 md:grid-cols-2"
          style={{ maxWidth: '34rem' }}
        >
          {/* Desktop Controls */}
          <Card 
            className="menu-card border-2 border-neon-cyan/30 bg-gradient-to-br from-space-card/50 to-space-card/30 shadow-[0_0_20px_oklch(0.75_0.20_195/0.2)] backdrop-blur-lg transition-all hover:border-neon-cyan/50 hover:shadow-[0_0_30px_oklch(0.75_0.20_195/0.3)]"
            style={{ padding: 'calc(var(--menu-card-padding) * 0.8)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Keyboard className="h-5 w-5 text-neon-cyan sm:h-6 sm:w-6" />
              <h3 className="text-sm font-black uppercase tracking-wide text-neon-cyan sm:text-base">Desktop</h3>
            </div>
            <p className="text-xs text-muted-foreground sm:text-sm">Arrow Keys / WASD + Space</p>
          </Card>

          {/* Mobile Controls */}
          <Card 
            className="menu-card border-2 border-neon-magenta/30 bg-gradient-to-br from-space-card/50 to-space-card/30 shadow-[0_0_20px_oklch(0.70_0.25_330/0.2)] backdrop-blur-lg transition-all hover:border-neon-magenta/50 hover:shadow-[0_0_30px_oklch(0.70_0.25_330/0.3)]"
            style={{ padding: 'calc(var(--menu-card-padding) * 0.8)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Gamepad2 className="h-5 w-5 text-neon-magenta sm:h-6 sm:w-6" />
              <h3 className="text-sm font-black uppercase tracking-wide text-neon-magenta sm:text-base">Mobile</h3>
            </div>
            <p className="text-xs text-muted-foreground sm:text-sm">Touch Joystick + Shoot Button</p>
          </Card>
        </div>

        {/* Auto-save Note */}
        <Card 
          className="menu-card mb-4 w-full border-2 border-neon-purple/30 bg-gradient-to-br from-space-card/40 to-space-card/20 shadow-[0_0_20px_oklch(0.70_0.25_300/0.2)] backdrop-blur-lg sm:mb-5"
          style={{ 
            maxWidth: '34rem',
            padding: 'calc(var(--menu-card-padding) * 0.7)'
          }}
        >
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs text-muted-foreground sm:text-sm">
              Progress <span className="font-black text-neon-purple">auto-saved</span> • Resume anytime
            </span>
          </div>
        </Card>

        {/* Login Button */}
        <div className="mt-3 sm:mt-4">
          <LoginButton />
        </div>

        {/* Footer */}
        <footer className="mt-6 text-center text-xs text-muted-foreground/60 sm:mt-8">
          © 2026. Built with ❤️ using{' '}
          <a
            href="https://caffeine.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neon-cyan transition-colors hover:text-neon-purple hover:underline"
          >
            caffeine.ai
          </a>
        </footer>
      </div>
    </div>
  );
}
