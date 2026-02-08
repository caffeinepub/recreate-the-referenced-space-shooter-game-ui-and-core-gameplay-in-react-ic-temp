# Specification

## Summary
**Goal:** Make the on-screen touch controls (joystick and SHOOT button) reliably visible in production on top of the gameplay view when `showTouchControls` is enabled.

**Planned changes:**
- Adjust frontend layout/CSS for the touch-controls overlay to ensure correct positioning (bottom-left joystick, bottom-right SHOOT), sizing, safe-area padding, and stacking order so it renders above the gameplay canvas/HUD.
- Fix any styling/class/stacking-context issues that can leave controls in the DOM but not visibly rendered (e.g., opacity/visibility, off-screen positioning, zero-size, clipping, z-index).
- Add a minimal regression check/manual verification path to confirm that when `showTouchControls` is true the controls render with non-zero size and are visible in-viewport (including a simple debug path such as `?debugControls=1`).

**User-visible outcome:** On touch-capable mobile devices in landscape during active gameplay, the joystick and SHOOT button appear on-screen (without special forcing), stay on top of the game view, and remain tappable near screen edges including safe-area regions.
