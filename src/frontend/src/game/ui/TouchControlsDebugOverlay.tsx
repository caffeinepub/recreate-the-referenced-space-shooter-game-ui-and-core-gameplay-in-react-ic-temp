interface TouchControlsDebugOverlayProps {
  touchDetected: boolean;
  touchControlsForced: boolean;
  isPaused: boolean;
}

export default function TouchControlsDebugOverlay({
  touchDetected,
  touchControlsForced,
  isPaused
}: TouchControlsDebugOverlayProps) {
  return (
    <div className="touch-debug-overlay">
      <div className="space-y-1 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Touch Detected:</span>
          <span className={touchDetected ? 'text-green-400' : 'text-red-400'}>
            {touchDetected ? 'YES' : 'NO'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Controls Forced:</span>
          <span className={touchControlsForced ? 'text-yellow-400' : 'text-gray-400'}>
            {touchControlsForced ? 'YES' : 'NO'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Paused:</span>
          <span className={isPaused ? 'text-orange-400' : 'text-green-400'}>
            {isPaused ? 'YES' : 'NO'}
          </span>
        </div>
      </div>
    </div>
  );
}
