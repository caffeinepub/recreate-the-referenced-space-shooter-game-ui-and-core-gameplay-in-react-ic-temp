interface ElementMetrics {
  width: number;
  height: number;
  top: number;
  left: number;
  right: number;
  bottom: number;
  inViewport: boolean;
}

interface TouchControlsDebugOverlayProps {
  isTouchCapable: boolean;
  isPortrait: boolean;
  isMobile: boolean;
  isPaused: boolean;
  isGameOver: boolean;
  showTouchControls: boolean;
  forceTouchControls: boolean;
  touchControlsEnabled: boolean;
  joystickX: number;
  joystickY: number;
  isShooting: boolean;
  controlsMetrics?: {
    joystick: ElementMetrics | null;
    shoot: ElementMetrics | null;
  };
}

export default function TouchControlsDebugOverlay({
  isTouchCapable,
  isPortrait,
  isMobile,
  isPaused,
  isGameOver,
  showTouchControls,
  forceTouchControls,
  touchControlsEnabled,
  joystickX,
  joystickY,
  isShooting,
  controlsMetrics,
}: TouchControlsDebugOverlayProps) {
  // Determine why controls are shown/hidden
  let visibilityReason = '';
  if (showTouchControls) {
    if (forceTouchControls) {
      visibilityReason = 'Forced by URL param';
    } else if (isTouchCapable) {
      visibilityReason = 'Touch capable detected';
    } else if (isMobile) {
      visibilityReason = 'Mobile fallback active';
    } else {
      visibilityReason = 'All conditions met';
    }
  } else {
    if (!touchControlsEnabled) visibilityReason = 'Disabled by user toggle';
    else if (isPortrait) visibilityReason = 'Portrait mode';
    else if (isPaused) visibilityReason = 'Game paused';
    else if (isGameOver) visibilityReason = 'Game over';
    else if (!isTouchCapable && !isMobile && !forceTouchControls) visibilityReason = 'Not touch capable or mobile';
    else visibilityReason = 'Unknown';
  }

  const joystickMetrics = controlsMetrics?.joystick;
  const shootMetrics = controlsMetrics?.shoot;

  const joystickVisible = joystickMetrics && joystickMetrics.width > 0 && joystickMetrics.height > 0 && joystickMetrics.inViewport;
  const shootVisible = shootMetrics && shootMetrics.width > 0 && shootMetrics.height > 0 && shootMetrics.inViewport;

  return (
    <div className="touch-debug-overlay">
      <div className="space-y-1 text-xs font-mono">
        <div className="font-bold text-neon-cyan mb-2">Touch Controls Debug</div>
        
        <div className="space-y-0.5">
          <div className="text-muted-foreground">Detection:</div>
          <div className="pl-2">
            <div>Touch Capable: <span className={isTouchCapable ? 'text-green-400' : 'text-red-400'}>{isTouchCapable ? 'YES' : 'NO'}</span></div>
            <div>Max Touch Points: {navigator.maxTouchPoints}</div>
            <div>Has ontouchstart: {('ontouchstart' in window) ? 'YES' : 'NO'}</div>
            <div>Pointer Coarse: {window.matchMedia?.('(pointer: coarse)').matches ? 'YES' : 'NO'}</div>
            <div>Hover None: {window.matchMedia?.('(hover: none)').matches ? 'YES' : 'NO'}</div>
          </div>
        </div>

        <div className="space-y-0.5 mt-2">
          <div className="text-muted-foreground">State:</div>
          <div className="pl-2">
            <div>Mobile: <span className={isMobile ? 'text-green-400' : 'text-red-400'}>{isMobile ? 'YES' : 'NO'}</span></div>
            <div>Portrait: <span className={isPortrait ? 'text-yellow-400' : 'text-green-400'}>{isPortrait ? 'YES' : 'NO'}</span></div>
            <div>Paused: <span className={isPaused ? 'text-yellow-400' : 'text-green-400'}>{isPaused ? 'YES' : 'NO'}</span></div>
            <div>Game Over: <span className={isGameOver ? 'text-yellow-400' : 'text-green-400'}>{isGameOver ? 'YES' : 'NO'}</span></div>
            <div>Force Controls: <span className={forceTouchControls ? 'text-yellow-400' : 'text-muted-foreground'}>{forceTouchControls ? 'YES' : 'NO'}</span></div>
            <div>User Toggle: <span className={touchControlsEnabled ? 'text-green-400' : 'text-red-400'}>{touchControlsEnabled ? 'ON' : 'OFF'}</span></div>
          </div>
        </div>

        <div className="space-y-0.5 mt-2">
          <div className="text-muted-foreground">Visibility:</div>
          <div className="pl-2">
            <div>Controls Shown: <span className={showTouchControls ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>{showTouchControls ? 'YES' : 'NO'}</span></div>
            <div className="text-xs text-muted-foreground">Reason: {visibilityReason}</div>
          </div>
        </div>

        {showTouchControls && controlsMetrics && (
          <div className="space-y-0.5 mt-2">
            <div className="text-muted-foreground">DOM Metrics:</div>
            <div className="pl-2">
              <div>Joystick: <span className={joystickVisible ? 'text-green-400' : 'text-red-400 font-bold'}>{joystickVisible ? '✓ VISIBLE' : '✗ HIDDEN'}</span></div>
              {joystickMetrics && (
                <div className="text-xs text-muted-foreground pl-2">
                  {joystickMetrics.width.toFixed(0)}×{joystickMetrics.height.toFixed(0)}px at ({joystickMetrics.left.toFixed(0)}, {joystickMetrics.top.toFixed(0)})
                </div>
              )}
              <div>Shoot: <span className={shootVisible ? 'text-green-400' : 'text-red-400 font-bold'}>{shootVisible ? '✓ VISIBLE' : '✗ HIDDEN'}</span></div>
              {shootMetrics && (
                <div className="text-xs text-muted-foreground pl-2">
                  {shootMetrics.width.toFixed(0)}×{shootMetrics.height.toFixed(0)}px at ({shootMetrics.left.toFixed(0)}, {shootMetrics.top.toFixed(0)})
                </div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-0.5 mt-2">
          <div className="text-muted-foreground">Input:</div>
          <div className="pl-2">
            <div>Joystick X: {joystickX.toFixed(2)}</div>
            <div>Joystick Y: {joystickY.toFixed(2)}</div>
            <div>Shooting: <span className={isShooting ? 'text-neon-magenta font-bold' : 'text-muted-foreground'}>{isShooting ? 'YES' : 'NO'}</span></div>
          </div>
        </div>

        <div className="mt-2 pt-2 border-t border-border text-xs text-muted-foreground">
          URL params: ?debugControls=1 ?forceTouchControls=1
        </div>
      </div>
    </div>
  );
}
