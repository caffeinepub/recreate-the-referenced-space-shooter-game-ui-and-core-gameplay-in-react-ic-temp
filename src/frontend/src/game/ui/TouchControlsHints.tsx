import { useEffect, useState } from 'react';

export default function TouchControlsHints() {
  const [showHints, setShowHints] = useState(true);

  useEffect(() => {
    // Auto-hide hints after 4 seconds
    const timer = setTimeout(() => {
      setShowHints(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  if (!showHints) return null;

  return (
    <div className="touch-controls-hints">
      {/* Left hint - Shoot button */}
      <div className="touch-hint touch-hint-left">
        <div className="touch-hint-label">SHOOT</div>
        <div className="touch-hint-arrow">←</div>
      </div>

      {/* Right hint - Joystick */}
      <div className="touch-hint touch-hint-right">
        <div className="touch-hint-arrow">→</div>
        <div className="touch-hint-label">MOVE</div>
      </div>

      {/* Center hint */}
      <div className="touch-hint touch-hint-center">
        <div className="touch-hint-label-center">
          Use touch controls to play
        </div>
      </div>
    </div>
  );
}
