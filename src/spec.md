# Specification

## Summary
**Goal:** Improve combat feedback and visual variety by adding spark hit VFX, giving obstacles varied neon colors, and rendering bullets as equal-size fire-shaped projectiles.

**Planned changes:**
- Add a short-lived spark particle VFX at the bullet–obstacle collision point, distinct from the existing explosion/blast effect, and ensure it expires quickly.
- Render obstacles with varied neon colors (independent of size) so multiple obstacles can appear in different colors at the same time, with each obstacle’s color staying consistent for its lifetime.
- Update bullet rendering to a consistent-size flame/fire-shaped visual oriented along travel direction, while keeping bullet firing direction, origin point, and collision behavior unchanged.

**User-visible outcome:** Bullet hits show a brief spark at impact, obstacles appear in multiple neon colors on-screen, and bullets look like uniform flame-shaped projectiles without changing gameplay behavior.
