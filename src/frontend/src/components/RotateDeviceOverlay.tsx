import { Smartphone } from 'lucide-react';

interface RotateDeviceOverlayProps {
  show: boolean;
}

export default function RotateDeviceOverlay({ show }: RotateDeviceOverlayProps) {
  if (!show) return null;

  return (
    <div 
      className="fixed top-0 left-0 right-0 z-[90] flex items-center justify-center bg-gradient-to-b from-space-dark/95 to-transparent backdrop-blur-sm pointer-events-none"
      style={{
        paddingTop: 'max(env(safe-area-inset-top), 1rem)',
        paddingBottom: '1rem',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)'
      }}
    >
      <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-space-dark/90 border border-neon-cyan/30 shadow-[0_0_20px_oklch(0.75_0.20_195/0.3)]">
        <Smartphone className="h-5 w-5 rotate-90 text-neon-cyan animate-pulse" />
        <p className="text-sm font-semibold text-neon-cyan">
          Rotate to landscape for best experience
        </p>
      </div>
    </div>
  );
}
