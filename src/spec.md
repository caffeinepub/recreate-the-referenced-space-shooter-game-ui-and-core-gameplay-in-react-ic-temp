# Specification

## Summary
**Goal:** Add a per-level normal-obstacle quota followed by a single giant-obstacle (boss) phase, plus a per-level countdown timer and improved hit VFX.

**Planned changes:**
- Update level progression so each level requires destroying 5 * level normal obstacles (L1=5, L2=10, L3=15, etc.) before any giant obstacle can spawn.
- Add a giant obstacle phase that spawns exactly one giant obstacle after the normal quota is met; defeat it by filling a dedicated progress bar to 100%, then trigger explosion VFX and show an English “Level Completed” message.
- Revise the HUD progress bar to reflect the current phase: normal-quota progress during the normal phase, and a smaller-sized progress bar for the giant obstacle during the boss phase.
- Add a per-level live countdown timer in the HUD (L1=30s, L2=35s, L3=35s, subsequent levels=35s), which pauses/resumes with the game pause state and resets on level start.
- Define timer failure: when the timer reaches 0 before level completion, trigger game over using the existing game-over flow (including clearing any in-progress saved run as currently done).
- Add spark/explosion impact VFX on bullet hits for both normal obstacles and the giant obstacle (including non-lethal hits on the giant obstacle).
- Update in-progress run persistence (localStorage) to save/restore the new quota/phase/boss-progress/timer state; bump saved-run version and auto-clear incompatible old saves.

**User-visible outcome:** Players must destroy a level-specific number of normal obstacles to trigger a single giant obstacle, defeat it by filling its progress bar, and finish each level before the countdown timer expires (with clear hit spark effects and correct “CONTINUE” restore behavior).
