/**
 * Draws a polished vector-based player ship on the canvas.
 * High-contrast design with consistent glow styling.
 */
export function drawPlayerShip(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rotation: number,
  radius: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);

  // Create ship path (sleek fighter jet silhouette)
  const path = new Path2D();
  
  // Nose (sharp point)
  path.moveTo(radius * 1.4, 0);
  
  // Top wing sweep
  path.lineTo(radius * 0.3, -radius * 0.7);
  path.lineTo(-radius * 0.2, -radius * 0.5);
  
  // Top tail fin
  path.lineTo(-radius * 0.7, -radius * 0.8);
  path.lineTo(-radius * 0.85, -radius * 0.6);
  
  // Body connection
  path.lineTo(-radius * 0.6, -radius * 0.15);
  path.lineTo(-radius * 0.9, 0);
  path.lineTo(-radius * 0.6, radius * 0.15);
  
  // Bottom tail fin
  path.lineTo(-radius * 0.85, radius * 0.6);
  path.lineTo(-radius * 0.7, radius * 0.8);
  
  // Bottom wing sweep
  path.lineTo(-radius * 0.2, radius * 0.5);
  path.lineTo(radius * 0.3, radius * 0.7);
  
  path.closePath();

  // Main body gradient (cyan to white)
  const bodyGradient = ctx.createLinearGradient(-radius, 0, radius * 1.4, 0);
  bodyGradient.addColorStop(0, 'oklch(0.65 0.20 195)'); // Deep cyan
  bodyGradient.addColorStop(0.4, 'oklch(0.75 0.18 200)'); // Bright cyan
  bodyGradient.addColorStop(0.7, 'oklch(0.85 0.15 205)'); // Light cyan
  bodyGradient.addColorStop(1, 'oklch(0.95 0.08 210)'); // Near white

  // Fill with gradient
  ctx.fillStyle = bodyGradient;
  ctx.fill(path);

  // Outer glow
  ctx.shadowBlur = 20;
  ctx.shadowColor = 'oklch(0.75 0.20 195 / 0.8)';
  ctx.fill(path);
  ctx.shadowBlur = 0;

  // High-contrast outline
  ctx.strokeStyle = 'oklch(0.95 0.10 200)';
  ctx.lineWidth = 2.5;
  ctx.stroke(path);

  // Inner highlight accent (top edge)
  ctx.beginPath();
  ctx.moveTo(radius * 1.4, 0);
  ctx.lineTo(radius * 0.3, -radius * 0.7);
  ctx.lineTo(-radius * 0.2, -radius * 0.5);
  ctx.strokeStyle = 'oklch(0.98 0.05 210 / 0.6)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Engine glow (rear thrusters)
  const engineGradient = ctx.createRadialGradient(-radius * 0.75, 0, 0, -radius * 0.75, 0, radius * 0.3);
  engineGradient.addColorStop(0, 'oklch(0.85 0.25 60 / 0.9)'); // Bright yellow-orange
  engineGradient.addColorStop(0.5, 'oklch(0.70 0.22 40 / 0.6)'); // Orange
  engineGradient.addColorStop(1, 'transparent');

  ctx.fillStyle = engineGradient;
  ctx.beginPath();
  ctx.arc(-radius * 0.75, 0, radius * 0.35, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
