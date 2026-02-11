import { useEffect, useRef, useState } from 'react';

interface JoystickProps {
  onMove: (x: number, y: number) => void;
  disabled?: boolean;
}

export default function Joystick({ onMove, disabled = false }: JoystickProps) {
  const baseRef = useRef<HTMLDivElement>(null);
  const [knobPosition, setKnobPosition] = useState({ x: 0, y: 0 });
  const activePointerRef = useRef<number | null>(null);
  const maxDistanceRef = useRef(40);

  useEffect(() => {
    if (!baseRef.current) return;

    const base = baseRef.current;

    const updateMaxDistance = () => {
      const rect = base.getBoundingClientRect();
      maxDistanceRef.current = rect.width * 0.35;
    };
    updateMaxDistance();

    const handleMove = (clientX: number, clientY: number) => {
      if (disabled) return;
      
      const rect = base.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      let deltaX = clientX - centerX;
      let deltaY = clientY - centerY;

      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const maxDistance = maxDistanceRef.current;
      
      if (distance > maxDistance) {
        deltaX = (deltaX / distance) * maxDistance;
        deltaY = (deltaY / distance) * maxDistance;
      }

      setKnobPosition({ x: deltaX, y: deltaY });
      onMove(deltaX / maxDistance, deltaY / maxDistance);
    };

    const handleEnd = () => {
      activePointerRef.current = null;
      setKnobPosition({ x: 0, y: 0 });
      onMove(0, 0);
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (disabled || activePointerRef.current !== null) return;
      
      e.preventDefault();
      activePointerRef.current = e.pointerId;
      base.setPointerCapture(e.pointerId);
      handleMove(e.clientX, e.clientY);
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (disabled || activePointerRef.current !== e.pointerId) return;
      
      e.preventDefault();
      handleMove(e.clientX, e.clientY);
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (activePointerRef.current !== e.pointerId) return;
      
      e.preventDefault();
      if (base.hasPointerCapture(e.pointerId)) {
        base.releasePointerCapture(e.pointerId);
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
      setTimeout(updateMaxDistance, 100);
    };

    const handleResize = () => {
      handleEnd();
      setTimeout(updateMaxDistance, 100);
    };

    const handleBlur = () => {
      handleEnd();
    };

    const handlePageHide = () => {
      handleEnd();
    };

    base.addEventListener('pointerdown', handlePointerDown);
    base.addEventListener('pointermove', handlePointerMove);
    base.addEventListener('pointerup', handlePointerUp);
    base.addEventListener('pointercancel', handlePointerCancel);
    base.addEventListener('lostpointercapture', handleLostPointerCapture);

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleResize);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('pagehide', handlePageHide);

    return () => {
      base.removeEventListener('pointerdown', handlePointerDown);
      base.removeEventListener('pointermove', handlePointerMove);
      base.removeEventListener('pointerup', handlePointerUp);
      base.removeEventListener('pointercancel', handlePointerCancel);
      base.removeEventListener('lostpointercapture', handleLostPointerCapture);

      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [onMove, disabled]);

  // Reset when disabled changes
  useEffect(() => {
    if (disabled) {
      setKnobPosition({ x: 0, y: 0 });
      onMove(0, 0);
    }
  }, [disabled, onMove]);

  return (
    <div className="joystick-container">
      <div ref={baseRef} className={`joystick-base ${disabled ? 'joystick-disabled' : ''}`}>
        <div
          className="joystick-knob"
          style={{
            transform: `translate(${knobPosition.x}px, ${knobPosition.y}px)`,
          }}
        />
      </div>
    </div>
  );
}
