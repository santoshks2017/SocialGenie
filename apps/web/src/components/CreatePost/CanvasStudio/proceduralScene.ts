import type { CarPose } from './types';

export interface SceneStyle {
  preset: 'golden-hour-urban' | 'blue-hour-plaza' | 'studio-cyc' | 'festive-night' | 'cinematic-warm' | 'editorial-clean';
  warmth: number;
  brightness: number;
}

export function pickSceneStyle(brief: string): SceneStyle {
  const b = brief.toLowerCase();
  if (/diwali|festive|holi|navratri/.test(b)) return { preset: 'festive-night',    warmth: 0.55,  brightness: 0.40 };
  if (/golden|sunset|warm|adventure/.test(b))  return { preset: 'golden-hour-urban', warmth: 0.45, brightness: 0.55 };
  if (/premium|luxury|night/.test(b))           return { preset: 'blue-hour-plaza',  warmth: -0.35, brightness: 0.35 };
  if (/showroom|studio|test drive/.test(b))     return { preset: 'studio-cyc',       warmth: 0.0,   brightness: 0.78 };
  if (/sport|energetic|cinematic/.test(b))      return { preset: 'cinematic-warm',   warmth: 0.30,  brightness: 0.50 };
  return { preset: 'editorial-clean', warmth: 0.05, brightness: 0.65 };
}

export async function generateProceduralScene(pose: CarPose, style: SceneStyle): Promise<string> {
  const W = 1080, H = 1440;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  const horizonY = pose === 'hero-low-angle' ? H * 0.45 : pose === 'side-profile' ? H * 0.55 : H * 0.50;
  drawSky(ctx, W, horizonY, style);
  drawMidground(ctx, W, H, horizonY, style);
  drawGround(ctx, W, H, horizonY, style);
  drawAtmosphere(ctx, W, H, horizonY);
  await new Promise((r) => setTimeout(r, 300 + Math.random() * 300));
  return canvas.toDataURL('image/jpeg', 0.92);
}

function drawSky(ctx: CanvasRenderingContext2D, W: number, horizonY: number, style: SceneStyle) {
  const g = ctx.createLinearGradient(0, 0, 0, horizonY);
  switch (style.preset) {
    case 'golden-hour-urban':  g.addColorStop(0,'#3a2a4a'); g.addColorStop(0.4,'#a05a3c'); g.addColorStop(0.8,'#e89c5e'); g.addColorStop(1,'#f7c98a'); break;
    case 'blue-hour-plaza':    g.addColorStop(0,'#0a1428'); g.addColorStop(0.5,'#1f3a5c'); g.addColorStop(1,'#3a5a7c'); break;
    case 'studio-cyc':         g.addColorStop(0,'#e8e8e8'); g.addColorStop(1,'#fafafa'); break;
    case 'festive-night':      g.addColorStop(0,'#1a0a20'); g.addColorStop(0.5,'#3a1530'); g.addColorStop(1,'#7a3a4a'); break;
    case 'cinematic-warm':     g.addColorStop(0,'#2a1818'); g.addColorStop(0.5,'#5a3838'); g.addColorStop(1,'#9a6858'); break;
    case 'editorial-clean':    g.addColorStop(0,'#c8d4e0'); g.addColorStop(1,'#e0e8f0'); break;
  }
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, horizonY);
}

function silhouetteColor(style: SceneStyle, d: number): string {
  switch (style.preset) {
    case 'golden-hour-urban': return `rgba(40,28,38,${d})`;
    case 'blue-hour-plaza':   return `rgba(15,24,40,${d})`;
    case 'festive-night':     return `rgba(20,8,22,${d})`;
    case 'cinematic-warm':    return `rgba(22,14,14,${d})`;
    case 'editorial-clean':   return `rgba(160,175,195,${d * 0.6})`;
    default:                  return `rgba(50,50,50,${d})`;
  }
}

function drawSkyline(ctx: CanvasRenderingContext2D, W: number, baseY: number, maxH: number, count: number, range: number) {
  const wPer = W / count;
  ctx.beginPath(); ctx.moveTo(0, baseY);
  for (let i = 0; i < count; i++) {
    const x = i * wPer;
    const h = maxH * (0.4 + Math.random() * range);
    const w = wPer * (0.7 + Math.random() * 0.3);
    ctx.lineTo(x, baseY - h); ctx.lineTo(x + w, baseY - h); ctx.lineTo(x + w, baseY);
  }
  ctx.lineTo(W, baseY); ctx.closePath(); ctx.fill();
}

function drawMidground(ctx: CanvasRenderingContext2D, W: number, H: number, horizonY: number, style: SceneStyle) {
  if (style.preset === 'studio-cyc') return;
  const skyH = H * 0.18;
  ctx.save();
  ctx.fillStyle = silhouetteColor(style, 0.4);  drawSkyline(ctx, W, horizonY, skyH * 0.7,  18, 0.5);
  ctx.fillStyle = silhouetteColor(style, 0.65); drawSkyline(ctx, W, horizonY, skyH * 0.85, 12, 0.7);
  ctx.fillStyle = silhouetteColor(style, 0.85); drawSkyline(ctx, W, horizonY, skyH,         8, 0.9);
  if (style.preset === 'festive-night') {
    for (const strand of [{ y: horizonY * 0.55, n: 14 }, { y: horizonY * 0.75, n: 18 }]) {
      for (let i = 0; i < strand.n; i++) {
        const x = (i + 0.5) * (W / strand.n) + (Math.random() - 0.5) * 30;
        const r = 4 + Math.random() * 6;
        const gr = ctx.createRadialGradient(x, strand.y, 0, x, strand.y, r * 3);
        gr.addColorStop(0, 'rgba(255,220,130,0.95)'); gr.addColorStop(1, 'rgba(255,180,90,0)');
        ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(x, strand.y, r * 3, 0, Math.PI * 2); ctx.fill();
      }
    }
  }
  ctx.restore();
}

function drawGround(ctx: CanvasRenderingContext2D, W: number, H: number, horizonY: number, style: SceneStyle) {
  const g = ctx.createLinearGradient(0, horizonY, 0, H);
  switch (style.preset) {
    case 'golden-hour-urban': case 'cinematic-warm': g.addColorStop(0,'#2a1f25'); g.addColorStop(0.5,'#1f1518'); g.addColorStop(1,'#181012'); break;
    case 'blue-hour-plaza':   g.addColorStop(0,'#1a2438'); g.addColorStop(0.5,'#0f1a2c'); g.addColorStop(1,'#08111c'); break;
    case 'studio-cyc':        g.addColorStop(0,'#d8d8d8'); g.addColorStop(0.6,'#c0c0c0'); g.addColorStop(1,'#a8a8a8'); break;
    case 'festive-night':     g.addColorStop(0,'#1a0e18'); g.addColorStop(0.5,'#0e0610'); g.addColorStop(1,'#06030a'); break;
    case 'editorial-clean':   g.addColorStop(0,'#a8b0bc'); g.addColorStop(1,'#7a8290'); break;
  }
  ctx.fillStyle = g; ctx.fillRect(0, horizonY, W, H - horizonY);
}

function drawAtmosphere(ctx: CanvasRenderingContext2D, W: number, H: number, horizonY: number) {
  ctx.save();
  ctx.globalAlpha = 0.22;
  const haze = ctx.createLinearGradient(0, horizonY - 60, 0, horizonY + 30);
  haze.addColorStop(0, 'rgba(255,255,255,0)'); haze.addColorStop(0.5, 'rgba(255,220,180,0.4)'); haze.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = haze; ctx.fillRect(0, horizonY - 60, W, 90);
  ctx.restore();
  ctx.save();
  const vig = ctx.createRadialGradient(W/2,H/2,Math.min(W,H)*0.4, W/2,H/2,Math.max(W,H)*0.7);
  vig.addColorStop(0,'rgba(0,0,0,0)'); vig.addColorStop(1,'rgba(0,0,0,0.45)');
  ctx.fillStyle = vig; ctx.fillRect(0,0,W,H);
  ctx.restore();
}
