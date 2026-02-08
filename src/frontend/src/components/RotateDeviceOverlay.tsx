import { Smartphone } from 'lucide-react';

interface RotateDeviceOverlayProps {
  show: boolean;
}

export default function RotateDeviceOverlay({ show }: RotateDeviceOverlayProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-space-dark/95 backdrop-blur-md">
      <div className="flex flex-col items-center gap-6 px-6 text-center">
        <div className="animate-bounce">
          <Smartphone className="h-16 w-16 rotate-90 text-neon-cyan drop-shadow-neon-cyan" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-neon-purple drop-shadow-neon-purple">
            Rotate Your Device
          </h2>
          <p className="text-sm text-muted-foreground">
            Please rotate your device to landscape mode to play
          </p>
        </div>
      </div>
    </div>
  );
}
