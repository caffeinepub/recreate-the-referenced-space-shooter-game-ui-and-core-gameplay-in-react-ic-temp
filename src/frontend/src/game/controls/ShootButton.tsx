import { useEffect, useRef, useState } from 'react';

interface ShootButtonProps {
  onShoot: (shooting: boolean) => void;
  disabled?: boolean;
}

export default function ShootButton({ onShoot, disabled = false }: ShootButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isPressed, setIsPressed] = useState(false);
  const activePointerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!buttonRef.current) return;

    const button = buttonRef.current;

    const handleStart = () => {
      if (disabled) return;
      setIsPressed(true);
      onShoot(true);
    };

    const handleEnd = () => {
      activePointerRef.current = null;
      setIsPressed(false);
      onShoot(false);
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (disabled || activePointerRef.current !== null) return;
      
      e.preventDefault();
      activePointerRef.current = e.pointerId;
      button.setPointerCapture(e.pointerId);
      handleStart();
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (activePointerRef.current !== e.pointerId) return;
      
      e.preventDefault();
      if (button.hasPointerCapture(e.pointerId)) {
        button.releasePointerCapture(e.pointerId);
      }
      handleEnd();
    };

    const handlePointerCancel = (e: PointerEvent) => {
      if (activePointerRef.current !== e.pointerId) return;
      handleEnd();
    };

    const handleLostPointerCapture = (e: PointerEvent) => {
      if (activePointerRef.current !== e.pointerId) return;
      handleEnd();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleEnd();
      }
    };

    const handleOrientationChange = () => {
      handleEnd();
    };

    const handleResize = () => {
      handleEnd();
    };

    const handleBlur = () => {
      handleEnd();
    };

    const handlePageHide = () => {
      handleEnd();
    };

    button.addEventListener('pointerdown', handlePointerDown);
    button.addEventListener('pointerup', handlePointerUp);
    button.addEventListener('pointercancel', handlePointerCancel);
    button.addEventListener('lostpointercapture', handleLostPointerCapture);

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
  }, [onShoot, disabled]);

  // Reset when disabled changes
  useEffect(() => {
    if (disabled) {
      setIsPressed(false);
      onShoot(false);
    }
  }, [disabled, onShoot]);

  return (
    <button
      ref={buttonRef}
      className={`shoot-button ${isPressed ? 'shoot-button-pressed' : ''} ${disabled ? 'shoot-button-disabled' : ''}`}
      aria-label="Shoot"
    >
      <span className="shoot-button-icon">⚡</span>
    </button>
  );
}
