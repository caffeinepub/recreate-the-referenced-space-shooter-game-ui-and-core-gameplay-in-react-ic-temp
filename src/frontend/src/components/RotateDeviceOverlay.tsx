import { Smartphone } from 'lucide-react';

interface RotateDeviceOverlayProps {
  show: boolean;
}

export default function RotateDeviceOverlay({ show }: RotateDeviceOverlayProps) {
  if (!show) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-space-dark/98 backdrop-blur-lg"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)'
      }}
    >
      <div className="flex flex-col items-center gap-8 px-6 text-center">
        <div className="animate-bounce">
          <Smartphone className="h-20 w-20 rotate-90 text-neon-cyan drop-shadow-neon-cyan" />
        </div>
        <div className="space-y-3">
          <h2 className="text-3xl font-black uppercase tracking-wider text-neon-purple drop-shadow-neon-purple">
            Rotate Your Device
          </h2>
          <p className="text-base font-medium text-muted-foreground">
            Please rotate your device to landscape mode to play
          </p>
        </div>
      </div>
    </div>
  );
}
