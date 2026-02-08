import { useState, useEffect } from 'react';

/**
 * Hook to detect if the device has touch capability.
 * More reliable than user-agent sniffing for showing touch controls.
 */
export function useIsTouchCapable() {
  const [isTouchCapable, setIsTouchCapable] = useState(() => {
    // Initial check with multiple signals
    const hasOntouchstart = 'ontouchstart' in window;
    const hasMaxTouchPoints = navigator.maxTouchPoints > 0;
    const hasPointerCoarse = window.matchMedia?.('(pointer: coarse)').matches;
    const hasHoverNone = window.matchMedia?.('(hover: none)').matches;
    
    return hasOntouchstart || hasMaxTouchPoints || hasPointerCoarse || hasHoverNone;
  });

  useEffect(() => {
    const checkTouchCapability = () => {
      const hasOntouchstart = 'ontouchstart' in window;
      const hasMaxTouchPoints = navigator.maxTouchPoints > 0;
      const hasPointerCoarse = window.matchMedia?.('(pointer: coarse)').matches;
      const hasHoverNone = window.matchMedia?.('(hover: none)').matches;
      
      const hasTouch = hasOntouchstart || hasMaxTouchPoints || hasPointerCoarse || hasHoverNone;
      
      setIsTouchCapable(hasTouch);
    };

    // Re-check on resize and orientation change
    window.addEventListener('resize', checkTouchCapability);
    window.addEventListener('orientationchange', checkTouchCapability);

    // Also check on first touch event
    const handleFirstTouch = () => {
      setIsTouchCapable(true);
      window.removeEventListener('touchstart', handleFirstTouch);
    };
    window.addEventListener('touchstart', handleFirstTouch, { once: true, passive: true });

    return () => {
      window.removeEventListener('resize', checkTouchCapability);
      window.removeEventListener('orientationchange', checkTouchCapability);
      window.removeEventListener('touchstart', handleFirstTouch);
    };
  }, []);

  return isTouchCapable;
}
