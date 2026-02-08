import { useEffect, useRef, useState } from 'react';

interface JoystickProps {
  onMove: (x: number, y: number) => void;
}

export default function Joystick({ onMove }: JoystickProps) {
  const baseRef = useRef<HTMLDivElement>(null);
  const [knobPosition, setKnobPosition] = useState({ x: 0, y: 0 });
  const activePointerRef = useRef<number | null>(null);
  const maxDistanceRef = useRef(40);

  useEffect(() => {
    if (!baseRef.current) return;

    const base = baseRef.current;

    // Calculate max distance based on actual rendered size
    const updateMaxDistance = () => {
      const rect = base.getBoundingClientRect();
      maxDistanceRef.current = rect.width * 0.35;
    };
    updateMaxDistance();

    const handleMove = (clientX: number, clientY: number) => {
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
      // Only respond if no pointer is active
      if (activePointerRef.current !== null) return;
      
      e.preventDefault();
      activePointerRef.current = e.pointerId;
      base.setPointerCapture(e.pointerId);
      handleMove(e.clientX, e.clientY);
    };

    const handlePointerMove = (e: PointerEvent) => {
      // Only respond to the active pointer
      if (activePointerRef.current !== e.pointerId) return;
      
      e.preventDefault();
      handleMove(e.clientX, e.clientY);
    };

    const handlePointerUp = (e: PointerEvent) => {
      // Only respond to the active pointer
      if (activePointerRef.current !== e.pointerId) return;
      
      e.preventDefault();
      if (base.hasPointerCapture(e.pointerId)) {
        base.releasePointerCapture(e.pointerId);
      }
      handleEnd();
    };

    const handlePointerCancel = (e: PointerEvent) => {
      // Only respond to the active pointer
      if (activePointerRef.current !== e.pointerId) return;
      
      handleEnd();
    };

    const handleLostPointerCapture = (e: PointerEvent) => {
      // Only respond to the active pointer
      if (activePointerRef.current !== e.pointerId) return;
      
      handleEnd();
    };

    // Reset on visibility/orientation/resize/blur changes to prevent stuck state
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

    // Attach pointer event listeners
    base.addEventListener('pointerdown', handlePointerDown);
    base.addEventListener('pointermove', handlePointerMove);
    base.addEventListener('pointerup', handlePointerUp);
    base.addEventListener('pointercancel', handlePointerCancel);
    base.addEventListener('lostpointercapture', handleLostPointerCapture);

    // Attach lifecycle listeners
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
  }, [onMove]);

  return (
    <div
      ref={baseRef}
      className="joystick-base"
      style={{ 
        width: 'var(--control-size)',
        height: 'var(--control-size)',
        touchAction: 'none'
      }}
    >
      {/* Center dot indicator */}
      <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-neon-cyan/40" />
      
      {/* Directional guides (subtle) */}
      <div className="pointer-events-none absolute inset-0">
        {[0, 90, 180, 270].map((angle) => (
          <div
            key={angle}
            className="absolute left-1/2 top-1/2 h-[2px] w-[25%] origin-left bg-gradient-to-r from-neon-cyan/30 to-transparent"
            style={{
              transform: `translate(-50%, -50%) rotate(${angle}deg)`
            }}
          />
        ))}
      </div>

      {/* Knob */}
      <div
        className="joystick-knob"
        style={{
          width: 'var(--joystick-knob-size)',
          height: 'var(--joystick-knob-size)',
          transform: `translate(calc(-50% + ${knobPosition.x}px), calc(-50% + ${knobPosition.y}px))`,
          touchAction: 'none'
        }}
      >
        {/* Inner highlight */}
        <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white/50 to-transparent" />
      </div>
    </div>
  );
}
