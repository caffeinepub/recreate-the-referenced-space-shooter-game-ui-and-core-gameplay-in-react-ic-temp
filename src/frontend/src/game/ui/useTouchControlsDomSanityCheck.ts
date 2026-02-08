import { useEffect, useRef } from 'react';

interface DomSanityCheckOptions {
  enabled: boolean;
  joystickRef: React.RefObject<HTMLDivElement | null>;
  shootRef: React.RefObject<HTMLDivElement | null>;
  debugMode?: boolean;
}

interface ElementMetrics {
  width: number;
  height: number;
  top: number;
  left: number;
  right: number;
  bottom: number;
  inViewport: boolean;
}

/**
 * Development-focused DOM sanity check for touch controls visibility.
 * Measures joystick and shoot button elements and logs warnings if they're
 * invisible (zero size) or outside viewport bounds.
 */
export function useTouchControlsDomSanityCheck({
  enabled,
  joystickRef,
  shootRef,
  debugMode = false,
}: DomSanityCheckOptions) {
  const hasLoggedRef = useRef(false);
  const metricsRef = useRef<{ joystick: ElementMetrics | null; shoot: ElementMetrics | null }>({
    joystick: null,
    shoot: null,
  });

  useEffect(() => {
    if (!enabled) {
      hasLoggedRef.current = false;
      metricsRef.current = { joystick: null, shoot: null };
      return;
    }

    // Small delay to ensure DOM is fully rendered
    const timeoutId = setTimeout(() => {
      const joystickEl = joystickRef.current;
      const shootEl = shootRef.current;

      if (!joystickEl || !shootEl) {
        if (debugMode) {
          console.warn('[TouchControls] DOM elements not found:', {
            joystick: !!joystickEl,
            shoot: !!shootEl,
          });
        }
        return;
      }

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      const joystickRect = joystickEl.getBoundingClientRect();
      const shootRect = shootEl.getBoundingClientRect();

      const joystickMetrics: ElementMetrics = {
        width: joystickRect.width,
        height: joystickRect.height,
        top: joystickRect.top,
        left: joystickRect.left,
        right: joystickRect.right,
        bottom: joystickRect.bottom,
        inViewport:
          joystickRect.width > 0 &&
          joystickRect.height > 0 &&
          joystickRect.top < viewportHeight &&
          joystickRect.bottom > 0 &&
          joystickRect.left < viewportWidth &&
          joystickRect.right > 0,
      };

      const shootMetrics: ElementMetrics = {
        width: shootRect.width,
        height: shootRect.height,
        top: shootRect.top,
        left: shootRect.left,
        right: shootRect.right,
        bottom: shootRect.bottom,
        inViewport:
          shootRect.width > 0 &&
          shootRect.height > 0 &&
          shootRect.top < viewportHeight &&
          shootRect.bottom > 0 &&
          shootRect.left < viewportWidth &&
          shootRect.right > 0,
      };

      metricsRef.current = { joystick: joystickMetrics, shoot: shootMetrics };

      // Log warnings for visibility issues
      const issues: string[] = [];

      if (joystickMetrics.width === 0 || joystickMetrics.height === 0) {
        issues.push('⚠️ Joystick has ZERO size');
      }
      if (!joystickMetrics.inViewport) {
        issues.push('⚠️ Joystick is OUTSIDE viewport bounds');
      }

      if (shootMetrics.width === 0 || shootMetrics.height === 0) {
        issues.push('⚠️ Shoot button has ZERO size');
      }
      if (!shootMetrics.inViewport) {
        issues.push('⚠️ Shoot button is OUTSIDE viewport bounds');
      }

      if (issues.length > 0 && !hasLoggedRef.current) {
        console.warn('[TouchControls] Visibility issues detected:', issues);
        console.warn('[TouchControls] Joystick metrics:', joystickMetrics);
        console.warn('[TouchControls] Shoot metrics:', shootMetrics);
        console.warn('[TouchControls] Viewport:', { width: viewportWidth, height: viewportHeight });
        hasLoggedRef.current = true;
      } else if (debugMode && issues.length === 0) {
        console.log('[TouchControls] ✓ Controls are visible and in viewport');
        console.log('[TouchControls] Joystick:', joystickMetrics);
        console.log('[TouchControls] Shoot:', shootMetrics);
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [enabled, joystickRef, shootRef, debugMode]);

  return metricsRef.current;
}
