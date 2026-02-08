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
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      button.removeEventListener('touchstart', handleTouchStart);
      button.removeEventListener('touchend', handleTouchEnd);
      button.removeEventListener('touchcancel', handleTouchEnd);
      button.removeEventListener('mousedown', handleMouseDown);
      button.removeEventListener('mouseup', handleMouseUp);
      button.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [onShoot]);

  return (
    <div
      ref={buttonRef}
      className="shoot-button flex items-center justify-center"
      style={{ 
        width: 'var(--control-size)',
        height: 'var(--control-size)',
        touchAction: 'none'
      }}
    >
      <div className="flex flex-col items-center gap-1">
        <Zap 
          className="shoot-icon-glow"
          style={{ 
            width: 'var(--shoot-icon-size)',
            height: 'var(--shoot-icon-size)',
            color: 'oklch(0.96 0.05 200)',
            strokeWidth: 2.5
          }}
          fill="oklch(0.75 0.25 330)"
        />
        <span 
          className="shoot-icon-glow font-bold tracking-wider"
          style={{ 
            fontSize: 'clamp(0.625rem, 2vw, 0.875rem)',
            color: 'oklch(0.96 0.05 200)',
            textShadow: '0 0 8px oklch(0.75 0.25 330 / 0.8)'
          }}
        >
          SHOOT
        </span>
      </div>
    </div>
  );
}
