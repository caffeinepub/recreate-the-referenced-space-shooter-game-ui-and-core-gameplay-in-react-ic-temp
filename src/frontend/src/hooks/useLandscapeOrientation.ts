import { useState, useEffect } from 'react';

interface OrientationState {
  isMobile: boolean;
  isPortrait: boolean;
  isLandscape: boolean;
}

export function useLandscapeOrientation() {
  const [orientation, setOrientation] = useState<OrientationState>(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isPortrait = window.innerHeight > window.innerWidth;
    return {
      isMobile,
      isPortrait,
      isLandscape: !isPortrait
    };
  });

  useEffect(() => {
    const checkOrientation = () => {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isPortrait = window.innerHeight > window.innerWidth;
      setOrientation({
        isMobile,
        isPortrait,
        isLandscape: !isPortrait
      });
    };

    // Check on resize and orientation change
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  const lockLandscape = async () => {
    try {
      // Use type assertion to access lock method which may not be in all TypeScript definitions
      if (screen.orientation && typeof (screen.orientation as any).lock === 'function') {
        await (screen.orientation as any).lock('landscape');
      }
    } catch (error) {
      // Silently fail - not all browsers support orientation lock
      console.debug('Orientation lock not supported or failed:', error);
    }
  };

  const unlockOrientation = async () => {
    try {
      // Use type assertion to access unlock method
      if (screen.orientation && typeof (screen.orientation as any).unlock === 'function') {
        (screen.orientation as any).unlock();
      }
    } catch (error) {
      // Silently fail
      console.debug('Orientation unlock failed:', error);
    }
  };

  return {
    ...orientation,
    lockLandscape,
    unlockOrientation
  };
}
