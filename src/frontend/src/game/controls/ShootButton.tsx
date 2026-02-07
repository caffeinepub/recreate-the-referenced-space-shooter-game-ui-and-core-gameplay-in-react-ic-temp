import { useRef } from 'react';

interface ShootButtonProps {
  onShootStart: () => void;
  onShootEnd: () => void;
}

export default function ShootButton({ onShootStart, onShootEnd }: ShootButtonProps) {
  const isShootingRef = useRef(false);

  const handleShootStart = () => {
    if (!isShootingRef.current) {
      isShootingRef.current = true;
      onShootStart();
    }
  };

  const handleShootEnd = () => {
    if (isShootingRef.current) {
      isShootingRef.current = false;
      onShootEnd();
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    handleShootStart();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    handleShootEnd();
  };

  const handleTouchCancel = (e: React.TouchEvent) => {
    e.preventDefault();
    handleShootEnd();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleShootStart();
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    e.preventDefault();
    handleShootEnd();
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    e.preventDefault();
    handleShootEnd();
  };

  const handlePointerLeave = (e: React.PointerEvent) => {
    e.preventDefault();
    handleShootEnd();
  };

  return (
    <button
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onPointerLeave={handlePointerLeave}
      className="relative flex h-32 w-32 select-none items-center justify-center rounded-full border-4 border-neon-magenta bg-gradient-to-br from-neon-magenta via-neon-purple to-neon-magenta shadow-neon-magenta-lg transition-all active:scale-95 active:shadow-neon-magenta-xl"
      style={{ touchAction: 'none' }}
    >
      {/* Outer glow ring */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-neon-magenta/20 to-neon-purple/20 blur-xl pointer-events-none" />
      
      <div className="relative flex flex-col items-center gap-1 pointer-events-none">
        {/* Lightning bolt icon - code rendered */}
        <svg
          className="h-12 w-12 drop-shadow-neon-magenta"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="boltGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffff00" />
              <stop offset="50%" stopColor="#ffaa00" />
              <stop offset="100%" stopColor="#ff00ff" />
            </linearGradient>
            <filter id="boltGlow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <path
            d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"
            fill="url(#boltGradient)"
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeLinejoin="round"
            filter="url(#boltGlow)"
          />
        </svg>
        
        <span className="text-sm font-black tracking-wider text-white drop-shadow-neon-magenta">
          SHOOT
        </span>
      </div>
      
      {/* Inner ring decoration */}
      <div className="absolute inset-3 rounded-full border-2 border-white/20 pointer-events-none" />
    </button>
  );
}
