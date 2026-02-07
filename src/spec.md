# Specification

## Summary
**Goal:** Replace the joystick UI, shoot button UI, and player ship visuals with fully code-rendered neon/glow designs while preserving existing gameplay/control behavior.

**Planned changes:**
- Update `frontend/src/game/controls/Joystick.tsx` to render the joystick entirely with code (no `<img>` assets) while keeping the current input behavior, normalized x/y output, and lifecycle resets intact.
- Update `frontend/src/game/controls/ShootButton.tsx` to render the SHOOT button entirely with code (no `<img>` assets) while keeping press/hold/release behavior and touch/mouse event handling intact.
- Update `frontend/src/game/render/GameCanvas.tsx` to draw the player ship via Canvas 2D code (no image loading/drawing), preserving rotation behavior and readability across player sizes.
- Remove/stop using joystick/shoot/ship generated image assets without affecting other existing generated assets (space background, logo mark, trophy icon), and ensure no missing-asset runtime errors.

**User-visible outcome:** During gameplay, the on-screen joystick, SHOOT button, and player ship appear as bright neon/glow code-rendered designs, while controls and gameplay behavior remain the same.
