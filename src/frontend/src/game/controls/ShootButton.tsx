import { useEffect, useRef } from 'react';
import { Zap } from 'lucide-react';

interface ShootButtonProps {
  onShoot: (shooting: boolean) => void;
}

export default function ShootButton({ onShoot }: ShootButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const activePointerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!buttonRef.current) return;

    const button = buttonRef.current;

    const startShooting = () => {
      onShoot(true);
    };

    const stopShooting = () => {
      onShoot(false);
    };

    const handlePointerDown = (e: PointerEvent) => {
      // Only respond if no pointer is active
      if (activePointerRef.current !== null) return;
      
      e.preventDefault();
      activePointerRef.current = e.pointerId;
      button.setPointerCapture(e.pointerId);
      startShooting();
    };

    const handlePointerUp = (e: PointerEvent) => {
      // Only respond to the active pointer
      if (activePointerRef.current !== e.pointerId) return;
      
      e.preventDefault();
      if (button.hasPointerCapture(e.pointerId)) {
        button.releasePointerCapture(e.pointerId);
      }
      activePointerRef.current = null;
      stopShooting();
    };

    const handlePointerCancel = (e: PointerEvent) => {
      // Only respond to the active pointer
      if (activePointerRef.current !== e.pointerId) return;
      
      activePointerRef.current = null;
      stopShooting();
    };

    const handleLostPointerCapture = (e: PointerEvent) => {
      // Only respond to the active pointer
      if (activePointerRef.current !== e.pointerId) return;
      
      activePointerRef.current = null;
      stopShooting();
    };

    // Reset on visibility/orientation/resize/blur changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        activePointerRef.current = null;
        stopShooting();
      }
    };

    const handleOrientationChange = () => {
      activePointerRef.current = null;
      stopShooting();
    };

    const handleResize = () => {
      activePointerRef.current = null;
      stopShooting();
    };

    const handleBlur = () => {
      activePointerRef.current = null;
      stopShooting();
    };

    const handlePageHide = () => {
      activePointerRef.current = null;
      stopShooting();
    };

    // Attach pointer event listeners
    button.addEventListener('pointerdown', handlePointerDown);
    button.addEventListener('pointerup', handlePointerUp);
    button.addEventListener('pointercancel', handlePointerCancel);
    button.addEventListener('lostpointercapture', handleLostPointerCapture);

    // Attach lifecycle listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleResize);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('pagehide', handlePageHide);

    return () => {
      button.removeEventListener('pointerdown', handlePointerDown);
      button.removeEventListener('pointerup', handlePointerUp);
      button.removeEventListener('pointercancel', handlePointerCancel);
      button.removeEventListener('lostpointercapture', handleLostPointerCapture);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('pagehide', handlePageHide);
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
