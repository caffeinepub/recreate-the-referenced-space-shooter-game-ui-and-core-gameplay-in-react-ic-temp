import { useMemo } from 'react';

interface Controls {
  x: number;
  y: number;
  shoot: boolean;
}

interface UseCombinedControlsProps {
  keyboardControls: Controls;
  joystickInput: { x: number; y: number };
  touchShooting: boolean;
}

const JOYSTICK_DEADZONE = 0.1;

/**
 * Combines keyboard and on-screen controls into a single control state.
 * Movement: Uses the input source with the stronger magnitude (above deadzone).
 * Shooting: Logical OR of keyboard Space and on-screen SHOOT button.
 */
export function useCombinedControls({
  keyboardControls,
  joystickInput,
  touchShooting,
}: UseCombinedControlsProps): Controls {
  return useMemo(() => {
    // Calculate magnitudes
    const keyboardMagnitude = Math.sqrt(
      keyboardControls.x * keyboardControls.x + keyboardControls.y * keyboardControls.y
    );
    const joystickMagnitude = Math.sqrt(
      joystickInput.x * joystickInput.x + joystickInput.y * joystickInput.y
    );

    // Determine which movement input to use
    let x = 0;
    let y = 0;

    // Apply deadzone to joystick
    const joystickActive = joystickMagnitude > JOYSTICK_DEADZONE;

    if (joystickActive && joystickMagnitude > keyboardMagnitude) {
      // Use joystick input
      x = joystickInput.x;
      y = joystickInput.y;
    } else if (keyboardMagnitude > 0) {
      // Use keyboard input
      x = keyboardControls.x;
      y = keyboardControls.y;
    }

    // Combine shooting inputs (logical OR)
    const shoot = keyboardControls.shoot || touchShooting;

    return { x, y, shoot };
  }, [keyboardControls, joystickInput, touchShooting]);
}
