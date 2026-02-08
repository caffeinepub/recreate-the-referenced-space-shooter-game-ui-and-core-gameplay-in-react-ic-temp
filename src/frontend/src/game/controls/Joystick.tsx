import { useEffect, useRef, useState } from 'react';

interface JoystickProps {
  onMove: (x: number, y: number) => void;
}

export default function Joystick({ onMove }: JoystickProps) {
  const baseRef = useRef<HTMLDivElement>(null);
  const [knobPosition, setKnobPosition] = useState({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const maxDistanceRef = useRef(40); // Will be updated based on actual size

  useEffect(() => {
    if (!baseRef.current) return;

    const base = baseRef.current;
    // Calculate max distance based on actual rendered size
    const updateMaxDistance = () => {
      const rect = base.getBoundingClientRect();
      maxDistanceRef.current = rect.width * 0.35; // 35% of base width
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
      isDraggingRef.current = false;
      setKnobPosition({ x: 0, y: 0 });
      onMove(0, 0);
    };

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      isDraggingRef.current = true;
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current) return;
      e.preventDefault();
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    };

    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      isDraggingRef.current = true;
      handleMove(e.clientX, e.clientY);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      handleMove(e.clientX, e.clientY);
    };

    // Reset on visibility/orientation changes to prevent stuck state
    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleEnd();
      }
    };

    const handleOrientationChange = () => {
      handleEnd();
      setTimeout(updateMaxDistance, 100);
    };

    // Attach listeners
    base.addEventListener('touchstart', handleTouchStart, { passive: false });
    base.addEventListener('touchmove', handleTouchMove, { passive: false });
    base.addEventListener('touchend', handleEnd, { passive: false });
    base.addEventListener('touchcancel', handleEnd, { passive: false });
    base.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);

    return () => {
      base.removeEventListener('touchstart', handleTouchStart);
      base.removeEventListener('touchmove', handleTouchMove);
      base.removeEventListener('touchend', handleEnd);
      base.removeEventListener('touchcancel', handleEnd);
      base.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleOrientationChange);
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
