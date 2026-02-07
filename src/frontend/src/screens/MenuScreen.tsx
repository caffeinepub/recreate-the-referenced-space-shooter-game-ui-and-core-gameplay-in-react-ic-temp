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
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-8">
        {/* Logo Mark */}
        <div className="mb-6 animate-float">
          <img
            src="/assets/generated/logo-mark.dim_512x512.png"
            alt="Space Shooter Logo"
            className="h-24 w-24 drop-shadow-neon-purple md:h-32 md:w-32"
          />
        </div>

        {/* Title */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-6xl font-black tracking-wider text-neon-purple drop-shadow-neon-purple md:text-8xl">
            SPACE
          </h1>
          <h1 className="text-6xl font-black tracking-wider text-neon-cyan drop-shadow-neon-cyan md:text-8xl">
            SHOOTER
          </h1>
        </div>

        {/* High Score Card */}
        <Card className="glass-card mb-8 w-full max-w-sm border-neon-cyan/30 bg-space-card/40 p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/assets/generated/icon-trophy.dim_128x128.png"
                alt="Trophy"
                className="h-10 w-10 drop-shadow-neon-magenta"
              />
              <span className="text-lg font-semibold text-muted-foreground">High Score</span>
            </div>
            <span className="text-3xl font-black text-neon-magenta drop-shadow-neon-magenta">
              {isLoadingStats ? '...' : highScore}
            </span>
          </div>
        </Card>

        {/* Start Button */}
        <Button
          onClick={onStartGame}
          size="lg"
          className="neon-button mb-8 h-16 w-full max-w-sm bg-gradient-to-r from-neon-magenta to-neon-purple text-xl font-black tracking-wide text-white shadow-neon-magenta transition-all hover:scale-105 hover:shadow-neon-magenta-lg"
        >
          START GAME
        </Button>

        {/* Instruction Panels */}
        <div className="mb-6 grid w-full max-w-2xl gap-4 md:grid-cols-2">
          {/* Desktop Controls */}
          <Card className="glass-card border-neon-cyan/20 bg-space-card/30 p-4 backdrop-blur-lg">
            <h3 className="mb-2 text-sm font-bold text-neon-cyan">Desktop:</h3>
            <p className="text-sm text-muted-foreground">Arrow Keys / WASD + Space to Shoot</p>
          </Card>

          {/* Mobile Controls */}
          <Card className="glass-card border-neon-magenta/20 bg-space-card/30 p-4 backdrop-blur-lg">
            <h3 className="mb-2 text-sm font-bold text-neon-magenta">Mobile:</h3>
            <p className="text-sm text-muted-foreground">Touch Joystick + Shoot Button</p>
          </Card>
        </div>

        {/* Auto-save Note */}
        <Card className="glass-card mb-4 w-full max-w-2xl border-neon-purple/20 bg-space-card/20 p-3 backdrop-blur-lg">
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs text-muted-foreground">
              Your progress is <span className="font-semibold text-neon-purple">auto-saved</span>
            </span>
          </div>
        </Card>

        {/* Login Button */}
        <div className="mt-4">
          <LoginButton />
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-xs text-muted-foreground/60">
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
