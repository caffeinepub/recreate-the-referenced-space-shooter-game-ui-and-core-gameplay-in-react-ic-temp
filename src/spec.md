# Specification

## Summary
**Goal:** Match the in-game touch controls layout and styling (joystick + shoot button) to the provided reference image.

**Planned changes:**
- Swap the on-screen touch controls positions during gameplay so the **SHOOT** button is anchored bottom-left and the joystick is anchored bottom-right, respecting safe-area insets.
- Update the shoot button presentation to match the reference: label text **"SHOOT"** (not "FIRE") and a bright neon-magenta/pink circular button with clear icon/label contrast.
- Update the joystick presentation to match the reference: bright neon-cyan/teal circular base with a distinct inner knob, while preserving existing drag/clamp and recenter behavior and ensuring it remains above the game canvas.

**User-visible outcome:** On touch devices (and when touch controls are shown), players see a neon **SHOOT** button on the bottom-left and a neon-cyan joystick on the bottom-right, with the same movement and shooting behavior as before.
