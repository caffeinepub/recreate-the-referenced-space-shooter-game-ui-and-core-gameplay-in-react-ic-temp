import { useEffect, useRef } from 'react';
import { Zap } from 'lucide-react';

interface ShootButtonProps {
  onShoot: (shooting: boolean) => void;
}

export default function ShootButton({ onShoot }: ShootButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const isShootingRef = useRef(false);

  useEffect(() => {
    if (!buttonRef.current) return;

    const button = buttonRef.current;

    const startShooting = () => {
      if (!isShootingRef.current) {
        isShootingRef.current = true;
        onShoot(true);
      }
    };

    const stopShooting = () => {
      if (isShootingRef.current) {
        isShootingRef.current = false;
        onShoot(false);
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      startShooting();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      stopShooting();
    };

    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      startShooting();
    };

    const handleMouseUp = () => {
      stopShooting();
    };

    const handleMouseLeave = () => {
      stopShooting();
    };

    // Reset on visibility/orientation changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopShooting();
      }
    };

    const handleOrientationChange = () => {
      stopShooting();
    };

    // Attach listeners
    button.addEventListener('touchstart', handleTouchStart, { passive: false });
    button.addEventListener('touchend', handleTouchEnd, { passive: false });
    button.addEventListener('touchcancel', handleTouchEnd, { passive: false });
    button.addEventListener('mousedown', handleMouseDown);
    button.addEventListener('mouseup', handleMouseUp);
    button.addEventListener('mouseleave', handleMouseLeave);

    // Global listeners for release detection
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);

    return () => {
      button.removeEventListener('touchstart', handleTouchStart);
      button.removeEventListener('touchend', handleTouchEnd);
      button.removeEventListener('touchcancel', handleTouchEnd);
      button.removeEventListener('mousedown', handleMouseDown);
      button.removeEventListener('mouseup', handleMouseUp);
      button.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleOrientationChange);
    };
  }, [onShoot]);

  return (
    <div
      ref={buttonRef}
      className="relative cursor-pointer select-none rounded-full bg-gradient-to-br from-neon-magenta via-neon-purple to-neon-cyan shadow-neon-magenta-xl transition-all active:scale-95"
      style={{ 
        width: 'var(--control-size)',
        height: 'var(--control-size)',
        touchAction: 'none'
      }}
    >
      {/* Outer glow ring */}
      <div className="absolute inset-0 rounded-full border-2 border-neon-magenta/50 sm:border-3 md:border-4" />
      
      {/* Inner content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <Zap 
          className="text-white drop-shadow-neon-cyan"
          style={{ 
            width: 'var(--shoot-icon-size)',
            height: 'var(--shoot-icon-size)'
          }}
          fill="currentColor"
        />
        <span className="mt-0.5 text-[0.5rem] font-bold text-white drop-shadow-neon-magenta sm:text-xs">
          SHOOT
        </span>
      </div>

      {/* Inner highlight */}
      <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/20 to-transparent pointer-events-none sm:inset-3 md:inset-4" />
    </div>
  );
}
