# Specification

## Summary
**Goal:** Rebuild the Space Shooter **2D game** so it compiles and runs end-to-end (frontend + Motoko backend), and make the on-screen joystick + shoot button always visible and usable across devices and orientations.

**Planned changes:**
- Rebuild/restore the project to compile and run without missing imports/files, including menu-to-game flow and core gameplay rendering on the canvas (movement + shooting).
- Ensure persistence hooks for stats and/or in-progress run do not throw runtime errors when starting, pausing, or exiting a run (Motoko backend remains a single actor).
- Update touch-control UI logic so the joystick and shoot button are always rendered and visible on desktop and mobile, in portrait/landscape, and during paused/game-over states (no URL gating and no toggle can hide them).
- Adjust or remove the rotate-to-landscape overlay behavior so it does not block or obscure controls in portrait mode and controls remain interactable.
- Make on-screen controls work with both touch and mouse/pointer input, and prevent stuck input states on blur/tab switch/orientation change/resize/visibility changes.

**User-visible outcome:** The app launches to a menu, starts a playable run with visible joystick + shoot button at all times, and players can move/shoot with touch or mouse in any orientation without controls disappearing or getting stuck; pause/game-over and persistence-related flows do not crash.
