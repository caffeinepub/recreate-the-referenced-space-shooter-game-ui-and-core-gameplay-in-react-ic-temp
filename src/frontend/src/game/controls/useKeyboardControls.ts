import { useEffect, useState } from 'react';

interface Controls {
  x: number;
  y: number;
  shoot: boolean;
}

export function useKeyboardControls(): Controls {
  const [keys, setKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key)) {
        e.preventDefault();
        setKeys((prev) => new Set(prev).add(key));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      setKeys((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const x =
    (keys.has('d') || keys.has('arrowright') ? 1 : 0) -
    (keys.has('a') || keys.has('arrowleft') ? 1 : 0);
  const y =
    (keys.has('s') || keys.has('arrowdown') ? 1 : 0) -
    (keys.has('w') || keys.has('arrowup') ? 1 : 0);
  const shoot = keys.has(' ');

  return { x, y, shoot };
}
