import { useEffect } from 'react';

/**
 * Hook that tracks visualViewport changes and sets a CSS variable
 * for reliable dynamic viewport height on mobile browsers.
 * This ensures touch controls remain anchored correctly as the browser UI shows/hides.
 */
export function useDynamicViewport() {
  useEffect(() => {
    const updateViewportHeight = () => {
      // Use visualViewport when available (better for mobile), fallback to window
      const height = window.visualViewport?.height || window.innerHeight;
      document.documentElement.style.setProperty('--app-dvh', `${height}px`);
    };

    // Set initial value
    updateViewportHeight();

    // Listen to viewport changes
    window.addEventListener('resize', updateViewportHeight);
    window.visualViewport?.addEventListener('resize', updateViewportHeight);
    window.visualViewport?.addEventListener('scroll', updateViewportHeight);
    window.addEventListener('orientationchange', updateViewportHeight);

    return () => {
      window.removeEventListener('resize', updateViewportHeight);
      window.visualViewport?.removeEventListener('resize', updateViewportHeight);
      window.visualViewport?.removeEventListener('scroll', updateViewportHeight);
      window.removeEventListener('orientationchange', updateViewportHeight);
    };
  }, []);
}
