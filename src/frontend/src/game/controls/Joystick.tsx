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
    base.addEventListener('mousedown', handleMouseDown);
    
    // Global listeners for move and end events
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleEnd);
    document.addEventListener('touchcancel', handleEnd);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleEnd);
    
    // Lifecycle listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);

    return () => {
      base.removeEventListener('touchstart', handleTouchStart);
      base.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleEnd);
      document.removeEventListener('touchcancel', handleEnd);
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
      className="relative cursor-pointer select-none"
      style={{ 
        width: 'var(--control-size)',
        height: 'var(--control-size)',
        touchAction: 'none'
      }}
    >
      {/* Base - Outer ring with neon glow */}
      <div className="absolute inset-0 rounded-full border-2 border-neon-cyan bg-gradient-to-br from-neon-cyan/10 to-neon-purple/10 shadow-neon-cyan-lg backdrop-blur-sm pointer-events-none sm:border-3 md:border-4">
        {/* Inner ring */}
        <div className="absolute inset-2 rounded-full border border-neon-cyan/40 sm:inset-3 sm:border-2 md:inset-4" />
        {/* Center dot */}
        <div className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-neon-cyan shadow-neon-cyan sm:h-1.5 sm:w-1.5 md:h-2 md:w-2" />
        {/* Directional indicators */}
        <div className="absolute left-1/2 top-1 h-1 w-1 -translate-x-1/2 rounded-full bg-neon-cyan/50 sm:h-1.5 sm:w-1.5 md:top-2 md:h-2 md:w-2" />
        <div className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-neon-cyan/50 sm:h-1.5 sm:w-1.5 md:bottom-2 md:h-2 md:w-2" />
        <div className="absolute left-1 top-1/2 h-1 w-1 -translate-y-1/2 rounded-full bg-neon-cyan/50 sm:h-1.5 sm:w-1.5 md:left-2 md:h-2 md:w-2" />
        <div className="absolute right-1 top-1/2 h-1 w-1 -translate-y-1/2 rounded-full bg-neon-cyan/50 sm:h-1.5 sm:w-1.5 md:right-2 md:h-2 md:w-2" />
      </div>

      {/* Knob - Glowing gradient sphere */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-neon-magenta via-neon-purple to-neon-cyan shadow-neon-magenta-xl transition-transform pointer-events-none"
        style={{
          width: 'var(--joystick-knob-size)',
          height: 'var(--joystick-knob-size)',
          transform: `translate(calc(-50% + ${knobPosition.x}px), calc(-50% + ${knobPosition.y}px))`,
        }}
      >
        {/* Inner glow */}
        <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white/40 to-transparent" />
      </div>
    </div>
  );
}
