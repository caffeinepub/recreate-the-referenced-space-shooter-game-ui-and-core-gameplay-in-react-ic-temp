import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import LoginButton from '@/components/LoginButton';

interface MenuScreenProps {
  highScore: number;
  onStartGame: () => void;
  isLoadingStats: boolean;
}

export default function MenuScreen({ highScore, onStartGame, isLoadingStats }: MenuScreenProps) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(/assets/generated/space-bg.dim_1920x1080.png)' }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-space-dark/80 via-space-dark/60 to-space-dark/80" />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-3 py-4 sm:px-4 sm:py-6">
        {/* Logo Mark */}
        <div className="mb-3 animate-float sm:mb-4">
          <img
            src="/assets/generated/logo-mark.dim_512x512.png"
            alt="Space Shooter Logo"
            className="drop-shadow-neon-purple"
            style={{ width: 'var(--logo-size)', height: 'var(--logo-size)' }}
          />
        </div>

        {/* Title */}
        <div className="mb-4 text-center sm:mb-6">
          <h1 
            className="mb-1 font-black tracking-wider text-neon-purple drop-shadow-neon-purple"
            style={{ fontSize: 'var(--title-size)' }}
          >
            SPACE
          </h1>
          <h1 
            className="font-black tracking-wider text-neon-cyan drop-shadow-neon-cyan"
            style={{ fontSize: 'var(--title-size)' }}
          >
            SHOOTER
          </h1>
        </div>

        {/* High Score Card */}
        <Card 
          className="glass-card mb-4 w-full border-neon-cyan/30 bg-space-card/40 backdrop-blur-xl sm:mb-6"
          style={{ 
            maxWidth: 'var(--menu-max-width)',
            padding: 'var(--menu-card-padding)'
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img
                src="/assets/generated/icon-trophy.dim_128x128.png"
                alt="Trophy"
                className="h-6 w-6 drop-shadow-neon-magenta sm:h-8 sm:w-8"
              />
              <span className="text-sm font-semibold text-muted-foreground sm:text-base">High Score</span>
            </div>
            <span className="text-xl font-black text-neon-magenta drop-shadow-neon-magenta sm:text-2xl">
              {isLoadingStats ? '...' : highScore}
            </span>
          </div>
        </Card>

        {/* Start Button */}
        <Button
          onClick={onStartGame}
          className="neon-button mb-4 w-full bg-gradient-to-r from-neon-magenta to-neon-purple font-black tracking-wide text-white shadow-neon-magenta transition-all hover:scale-105 hover:shadow-neon-magenta-lg sm:mb-6"
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
          className="mb-3 grid w-full gap-2 sm:mb-4 sm:gap-3 md:grid-cols-2"
          style={{ maxWidth: '32rem' }}
        >
          {/* Desktop Controls */}
          <Card 
            className="glass-card border-neon-cyan/20 bg-space-card/30 backdrop-blur-lg"
            style={{ padding: 'calc(var(--menu-card-padding) * 0.75)' }}
          >
            <h3 className="mb-1 text-xs font-bold text-neon-cyan sm:text-sm">Desktop:</h3>
            <p className="text-xs text-muted-foreground">Arrow Keys / WASD + Space</p>
          </Card>

          {/* Mobile Controls */}
          <Card 
            className="glass-card border-neon-magenta/20 bg-space-card/30 backdrop-blur-lg"
            style={{ padding: 'calc(var(--menu-card-padding) * 0.75)' }}
          >
            <h3 className="mb-1 text-xs font-bold text-neon-magenta sm:text-sm">Mobile:</h3>
            <p className="text-xs text-muted-foreground">Touch Joystick + Shoot</p>
          </Card>
        </div>

        {/* Auto-save Note */}
        <Card 
          className="glass-card mb-3 w-full border-neon-purple/20 bg-space-card/20 backdrop-blur-lg sm:mb-4"
          style={{ 
            maxWidth: '32rem',
            padding: 'calc(var(--menu-card-padding) * 0.6)'
          }}
        >
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs text-muted-foreground">
              Progress <span className="font-semibold text-neon-purple">auto-saved</span>
            </span>
          </div>
        </Card>

        {/* Login Button */}
        <div className="mt-2 sm:mt-3">
          <LoginButton />
        </div>

        {/* Footer */}
        <footer className="mt-4 text-center text-xs text-muted-foreground/60 sm:mt-6">
          © 2026. Built with ❤️ using{' '}
          <a
            href="https://caffeine.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neon-cyan hover:underline"
          >
            caffeine.ai
          </a>
        </footer>
      </div>
    </div>
  );
}
