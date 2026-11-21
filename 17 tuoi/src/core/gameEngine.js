import { MAP_CONFIG, BUILDINGS, STORY_NPCS } from '../data/mapData.js';
import { loadSprites } from '../data/sprites.js';

export class GameEngine {
  constructor(canvas, initialPos, onNearTargetChange, onPositionSave) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.onNearTargetChange = onNearTargetChange;
    this.onPositionSave = onPositionSave;

    this.player = {
      x: initialPos?.x ?? 570,
      y: initialPos?.y ?? 380,
      radius: 16,
      speed: 230,
      facingX: 0,
      facingY: 1,
      walkTime: 0,
      isMoving: false
    };

    this.input = { x: 0, y: 0 };
    this.keys = {};
    this.nearTarget = null;
    this.unlockedNpcs = { linh: false };
    this.running = false;
    this.rafId = null;
    this.lastTime = 0;
    this.saveTimer = 0;

    this.weather = 'clear';
    this.raindrops = Array.from({ length: 65 }, () => ({
      x: Math.random() * 1200,
      y: Math.random() * 900,
      len: 10 + Math.random() * 10,
      speed: 420 + Math.random() * 180
    }));

    // Xe cộ chạy trên đường
    this.cars = [
      { x: 100, y: 398, vx: 110, vy: 0, w: 34, h: 18, color: '#cbd5e1' },
      { x: 900, y: 362, vx: -125, vy: 0, w: 34, h: 18, color: '#64748b' },
      { x: 300, y: 748, vx: 95, vy: 0, w: 36, h: 18, color: '#94a3b8' },
      { x: 1050, y: 712, vx: -115, vy: 0, w: 34, h: 18, color: '#475569' },
      { x: 392, y: 150, vx: 0, vy: 105, w: 18, h: 34, color: '#e2e8f0' },
      { x: 748, y: 950, vx: 0, vy: -110, w: 18, h: 34, color: '#38bdf8' }
    ];

    // NPC nền: người đi bộ trên vỉa hè
    this.pedestrians = [
      { x: 120, y: 333, vx: 42, vy: 0, minX: 40, maxX: 340, color: '#e2e8f0', phase: 0 },
      { x: 860, y: 333, vx: -38, vy: 0, minX: 790, maxX: 1140, color: '#bae6fd', phase: 1.4 },
      { x: 220, y: 683, vx: 40, vy: 0, minX: 50, maxX: 340, color: '#fde68a', phase: 2.3 },
      { x: 920, y: 683, vx: -45, vy: 0, minX: 790, maxX: 1140, color: '#fca5a5', phase: 0.8 },
      { x: 363, y: 460, vx: 0, vy: 36, minY: 440, maxY: 660, color: '#c4b5fd', phase: 1.9 },
      { x: 683, y: 820, vx: 0, vy: -38, minY: 790, maxY: 1120, color: '#86efac', phase: 2.7 }
    ];

    this.floatingTexts = [];

    this.trees = [
      { x: 85, y: 90, r: 28 }, { x: 340, y: 100, r: 26 }, { x: 650, y: 95, r: 28 },
      { x: 1100, y: 110, r: 30 }, { x: 85, y: 310, r: 24 }, { x: 1100, y: 310, r: 26 },
      { x: 85, y: 710, r: 26 }, { x: 340, y: 720, r: 24 }, { x: 1100, y: 720, r: 28 },
      { x: 95, y: 1040, r: 30 }, { x: 350, y: 1050, r: 26 }, { x: 660, y: 965, r: 24 },
      { x: 1090, y: 1040, r: 28 }
    ];

    this.sprites = loadSprites();

    this.handleKeyDown = (e) => { if (e && e.key) this.keys[e.key.toLowerCase()] = true; };
this.handleKeyUp = (e) => { if (e && e.key) this.keys[e.key.toLowerCase()] = false; };
    this.handleResize = () => this.resize();
    this.handleKeyDown = (e) => { if (e && e.key) this.keys[e.key.toLowerCase()] = true; };
    this.handleKeyUp = (e) => { if (e && e.key) this.keys[e.key.toLowerCase()] = false; };
    this.handleResize = () => this.resize();

    if (this.checkCollision(this.player.x, this.player.y)) {
      this.player.x = 410;
    }
  }

  setPlayerSpeed(newSpeed) {
    this.player.speed = newSpeed;
  }

  setWeather(type) {
    this.weather = type === 'rain' ? 'rain' : 'clear';
  }

  setNpcUnlocked(npcId, unlocked) {
    this.unlockedNpcs[npcId] = !!unlocked;
  }

  spawnFloatingText(text, color = '#34d399') {
    this.floatingTexts.push({
      text,
      color,
      x: this.player.x,
      y: this.player.y - 46,
      life: 1.4,
      maxLife: 1.4
    });
  }

  isSpriteReady(key) {
    const img = this.sprites[key];
    return img && img.complete && img.naturalWidth > 0;
  }

  resize() {
    const parent = this.canvas.parentElement;
    if (!parent) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = parent.clientWidth;
    this.height = parent.clientHeight;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  setJoystickInput(vx, vy) {
    this.input.x = vx;
    this.input.y = vy;
  }

  start() {
    this.resize();
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);

    this.running = true;
    this.lastTime = performance.now();
    const loop = (now) => {
      if (!this.running) return;
      const dt = Math.min((now - this.lastTime) / 1000, 0.05);
      this.lastTime = now;
      this.update(dt);
      this.render();
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  stop() {
    this.running = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  }

  update(dt) {
    // Cập nhật xe cộ
    for (const c of this.cars) {
      c.x += c.vx * dt;
      c.y += c.vy * dt;
      if (c.vx > 0 && c.x > MAP_CONFIG.width + 40) c.x = -40;
      if (c.vx < 0 && c.x < -40) c.x = MAP_CONFIG.width + 40;
      if (c.vy > 0 && c.y > MAP_CONFIG.height + 40) c.y = -40;
      if (c.vy < 0 && c.y < -40) c.y = MAP_CONFIG.height + 40;
    }

    // Cập nhật người đi bộ trên vỉa hè
    for (const p of this.pedestrians) {
      p.phase += dt * 10;
      if (p.vx !== 0) {
        p.x += p.vx * dt;
        if (p.x >= p.maxX) { p.x = p.maxX; p.vx = -Math.abs(p.vx); }
        if (p.x <= p.minX) { p.x = p.minX; p.vx = Math.abs(p.vx); }
      }
      if (p.vy !== 0) {
        p.y += p.vy * dt;
        if (p.y >= p.maxY) { p.y = p.maxY; p.vy = -Math.abs(p.vy); }
        if (p.y <= p.minY) { p.y = p.minY; p.vy = Math.abs(p.vy); }
      }
    }

    if (this.weather === 'rain') {
      for (const r of this.raindrops) {
        r.x -= 90 * dt;
        r.y += r.speed * dt;
        if (r.y > this.height + 20) {
          r.y = -20;
          r.x = Math.random() * (this.width + 120);
        }
      }
    }

    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y -= 34 * dt;
      ft.life -= dt;
      if (ft.life <= 0) this.floatingTexts.splice(i, 1);
    }

    let vx = this.input.x;
    let vy = this.input.y;

    if (this.keys['w'] || this.keys['arrowup']) vy -= 1;
    if (this.keys['s'] || this.keys['arrowdown']) vy += 1;
    if (this.keys['a'] || this.keys['arrowleft']) vx -= 1;
    if (this.keys['d'] || this.keys['arrowright']) vx += 1;

    const mag = Math.hypot(vx, vy);
    if (mag > 0.05) {
      if (mag > 1) { vx /= mag; vy /= mag; }
      this.player.isMoving = true;
      this.player.facingX = vx;
      this.player.facingY = vy;
      this.player.walkTime += dt * 14;

      const nextX = this.player.x + vx * this.player.speed * dt;
      const nextY = this.player.y + vy * this.player.speed * dt;

      if (!this.checkCollision(nextX, this.player.y)) {
        this.player.x = Math.max(24, Math.min(MAP_CONFIG.width - 24, nextX));
      }
      if (!this.checkCollision(this.player.x, nextY)) {
        this.player.y = Math.max(24, Math.min(MAP_CONFIG.height - 24, nextY));
      }

      this.saveTimer += dt;
      if (this.saveTimer >= 1) {
        this.saveTimer = 0;
        if (this.onPositionSave) {
          this.onPositionSave(Math.round(this.player.x), Math.round(this.player.y));
        }
      }
    } else {
      this.player.isMoving = false;
    }

    // Ưu tiên NPC cốt truyện nếu đứng sát, sau đó mới tới Tòa nhà
    let found = null;
    for (const npc of STORY_NPCS) {
      if (npc.requiresUnlocked && !this.unlockedNpcs[npc.id]) continue;
      if (Math.hypot(this.player.x - npc.x, this.player.y - npc.y) <= 44) {
        found = { kind: 'npc', data: npc };
        break;
      }
    }

    if (!found) {
      for (const b of BUILDINGS) {
        const pad = b.isWalkable ? 12 : 46;
        if (
          this.player.x >= b.x - pad &&
          this.player.x <= b.x + b.w + pad &&
          this.player.y >= b.y - pad &&
          this.player.y <= b.y + b.h + pad
        ) {
          found = { kind: 'building', data: b };
          break;
        }
      }
    }

    const prevKey = this.nearTarget ? `${this.nearTarget.kind}:${this.nearTarget.data.id}` : '';
    const nextKey = found ? `${found.kind}:${found.data.id}` : '';
    if (prevKey !== nextKey) {
      this.nearTarget = found;
      if (this.onNearTargetChange) this.onNearTargetChange(found);
    }
  }

  checkCollision(x, y) {
    const r = this.player.radius;
    for (const b of BUILDINGS) {
      if (b.isWalkable) continue;
      if (
        x + r > b.x &&
        x - r < b.x + b.w &&
        y + r > b.y &&
        y - r < b.y + b.h
      ) {
        return true;
      }
    }
    return false;
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    let camX = this.player.x - this.width / 2;
    let camY = this.player.y - this.height / 2;
    camX = Math.max(0, Math.min(MAP_CONFIG.width - this.width, camX));
    camY = Math.max(0, Math.min(MAP_CONFIG.height - this.height, camY));

    ctx.save();
    ctx.translate(-camX, -camY);

    this.drawGroundAndRoads(ctx);
    this.drawCars(ctx);
    this.drawPedestrians(ctx);

    const park = BUILDINGS.find(b => b.id === 'park');
    if (park) this.drawBuildingSprite(ctx, park);

    for (const b of BUILDINGS) {
      if (b.id !== 'park') this.drawBuildingSprite(ctx, b);
    }

    this.drawStoryNpcs(ctx);

    for (const t of this.trees) {
      this.drawTreeSprite(ctx, t.x, t.y, t.r);
    }

    this.drawPlayerSprite(ctx);
    this.drawFloatingTexts(ctx);

    ctx.restore();

    if (this.weather === 'rain') {
      this.drawRainOverlay(ctx);
    }
    this.drawMiniMap(ctx);
  }

  drawPedestrians(ctx) {
    for (const p of this.pedestrians) {
      const bob = Math.abs(Math.sin(p.phase)) * 2.5;
      ctx.fillStyle = 'rgba(15,23,42,0.22)';
      ctx.beginPath();
      ctx.ellipse(p.x, p.y + 9, 7, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y - 2 - bob, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(p.x, p.y - 8 - bob, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawStoryNpcs(ctx) {
    for (const npc of STORY_NPCS) {
      if (npc.requiresUnlocked && !this.unlockedNpcs[npc.id]) continue;
      const isNear = this.nearTarget?.kind === 'npc' && this.nearTarget.data.id === npc.id;

      ctx.fillStyle = 'rgba(15,23,42,0.28)';
      ctx.beginPath();
      ctx.ellipse(npc.x, npc.y + 13, 11, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Thân áo
      ctx.fillStyle = npc.shirt;
      this.roundRect(ctx, npc.x - 8, npc.y - 4, 16, 16, 5, true, false);
      // Đầu
      ctx.fillStyle = '#e5b899';
      ctx.beginPath();
      ctx.arc(npc.x, npc.y - 11, 7.5, 0, Math.PI * 2);
      ctx.fill();
      // Tóc / điểm nhấn
      ctx.fillStyle = npc.color;
      ctx.beginPath();
      ctx.arc(npc.x, npc.y - 13, 7.5, Math.PI, Math.PI * 2);
      ctx.fill();

      this.drawLabel(ctx, npc.x, npc.y - 28, npc.name, isNear);
    }
  }

  drawRainOverlay(ctx) {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.16)';
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.strokeStyle = 'rgba(186, 230, 253, 0.45)';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    for (const r of this.raindrops) {
      ctx.moveTo(r.x, r.y);
      ctx.lineTo(r.x - 4, r.y + r.len);
    }
    ctx.stroke();
  }

  drawMiniMap(ctx) {
    const size = 86;
    const padX = 12;
    const x = this.width - size - padX;
    const y = 178;
    const scale = size / MAP_CONFIG.width;

    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
    ctx.lineWidth = 1.5;
    this.roundRect(ctx, x, y, size, size, 10, true, true);

    ctx.fillStyle = 'rgba(100, 116, 139, 0.5)';
    ctx.fillRect(x, y + 340 * scale, size, 80 * scale);
    ctx.fillRect(x, y + 690 * scale, size, 80 * scale);
    ctx.fillRect(x + 370 * scale, y, 80 * scale, size);
    ctx.fillRect(x + 690 * scale, y, 80 * scale, size);

    for (const b of BUILDINGS) {
      ctx.fillStyle = b.id === 'park' ? '#22c55e' : (b.id === 'item_shop' ? '#f59e0b' : '#94a3b8');
      ctx.fillRect(x + b.x * scale, y + b.y * scale, b.w * scale, b.h * scale);
    }

    // Chấm NPC cốt truyện trên mini-map
    for (const npc of STORY_NPCS) {
      if (npc.requiresUnlocked && !this.unlockedNpcs[npc.id]) continue;
      ctx.fillStyle = npc.color;
      ctx.beginPath();
      ctx.arc(x + npc.x * scale, y + npc.y * scale, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    const px = x + this.player.x * scale;
    const py = y + this.player.y * scale;
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(px, py, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawGroundAndRoads(ctx) {
    ctx.fillStyle = '#4d6b53';
    ctx.fillRect(0, 0, MAP_CONFIG.width, MAP_CONFIG.height);

    ctx.fillStyle = '#46624b';
    for (let x = 0; x < MAP_CONFIG.width; x += 80) {
      for (let y = 0; y < MAP_CONFIG.height; y += 80) {
        if (((x + y) / 80) % 2 === 0) {
          ctx.fillRect(x, y, 80, 80);
        }
      }
    }

    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(0, 326, MAP_CONFIG.width, 108);
    ctx.fillRect(0, 676, MAP_CONFIG.width, 108);
    ctx.fillRect(356, 0, 108, MAP_CONFIG.height);
    ctx.fillRect(676, 0, 108, MAP_CONFIG.height);

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 340, MAP_CONFIG.width, 80);
    ctx.fillRect(0, 690, MAP_CONFIG.width, 80);
    ctx.fillRect(370, 0, 80, MAP_CONFIG.height);
    ctx.fillRect(690, 0, 80, MAP_CONFIG.height);

    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 3;
    ctx.setLineDash([18, 18]);
    ctx.beginPath();
    ctx.moveTo(0, 380); ctx.lineTo(MAP_CONFIG.width, 380);
    ctx.moveTo(0, 730); ctx.lineTo(MAP_CONFIG.width, 730);
    ctx.moveTo(410, 0); ctx.lineTo(410, MAP_CONFIG.height);
    ctx.moveTo(730, 0); ctx.lineTo(730, MAP_CONFIG.height);
    ctx.stroke();
    ctx.setLineDash([]);

    const crossings = [
      { x: 410, y: 380 }, { x: 730, y: 380 },
      { x: 410, y: 730 }, { x: 730, y: 730 }
    ];
    ctx.fillStyle = '#94a3b8';
    for (const c of crossings) {
      for (let i = -24; i <= 24; i += 12) {
        ctx.fillRect(c.x - 56, c.y + i - 2, 12, 5);
        ctx.fillRect(c.x + 44, c.y + i - 2, 12, 5);
      }
    }
  }

  drawCars(ctx) {
    for (const c of this.cars) {
      const x = c.x - c.w / 2;
      const y = c.y - c.h / 2;
      ctx.fillStyle = 'rgba(0,0,0,0.28)';
      this.roundRect(ctx, x + 2, y + 3, c.w, c.h, 5, true, false);
      ctx.fillStyle = c.color;
      this.roundRect(ctx, x, y, c.w, c.h, 5, true, false);
      ctx.fillStyle = '#0f172a';
      if (c.w > c.h) {
        ctx.fillRect(x + 8, y + 3, c.w - 16, c.h - 6);
      } else {
        ctx.fillRect(x + 3, y + 8, c.w - 6, c.h - 16);
      }
    }
  }

drawBuildingSprite(ctx, b) {
    const isNear = this.nearTarget?.kind === 'building' && this.nearTarget.data.id === b.id;

    if (isNear) {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 6]);
      this.roundRect(ctx, b.x - 6, b.y - 6, b.w + 12, b.h + 12, 12, false, true);
      ctx.setLineDash([]);
    }

    if (this.isSpriteReady(b.id)) {
      const pad = 14;
      ctx.drawImage(
        this.sprites[b.id],
        b.x - pad,
        b.y - pad - 10,
        b.w + pad * 2,
        b.h + pad * 2 + 8
      );
    } else {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.25)';
      this.roundRect(ctx, b.x + 5, b.y + 8, b.w, b.h, 8, true, false);

      ctx.fillStyle = '#e2e8f0';
      this.roundRect(ctx, b.x, b.y + 16, b.w, b.h - 16, 6, true, false);

      ctx.fillStyle = '#0284c7';
      this.roundRect(ctx, b.x - 4, b.y, b.w + 8, 24, 6, true, false);

      ctx.fillStyle = '#fbbf24';
      this.roundRect(ctx, b.x + 28, b.y + 7, b.w - 56, 10, 4, true, false);

      const stripeCount = 6;
      const stripeW = b.w / stripeCount;
      for (let i = 0; i < stripeCount; i++) {
        ctx.fillStyle = i % 2 === 0 ? '#38bdf8' : '#f8fafc';
        ctx.fillRect(b.x + i * stripeW, b.y + 24, stripeW, 14);
      }

      ctx.fillStyle = '#bae6fd';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      this.roundRect(ctx, b.x + 14, b.y + 48, b.w * 0.45, 42, 4, true, true);

      ctx.fillStyle = '#334155';
      this.roundRect(ctx, b.x + b.w * 0.65, b.y + 48, b.w * 0.24, b.h - 48, 3, true, false);
    }

    this.drawLabel(ctx, b.x + b.w / 2, b.y + b.h + 12, b.name, isNear);
  }

  drawTreeSprite(ctx, x, y, r) {
    if (this.isSpriteReady('tree')) {
      const size = r * 3.0;
      ctx.drawImage(this.sprites.tree, x - size / 2, y - size * 0.8, size, size);
    }
  }

  drawPlayerSprite(ctx) {
    const { x, y, isMoving, walkTime, facingX } = this.player;
    const bounce = isMoving ? Math.abs(Math.sin(walkTime)) * 4 : 0;
    const tilt = isMoving ? Math.sin(walkTime) * 0.06 : 0;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.3)';
    ctx.beginPath();
    ctx.ellipse(x, y + 16, 14, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    if (this.isSpriteReady('player')) {
      const spriteW = 46;
      const spriteH = 60;
      ctx.save();
      ctx.translate(x, y + 14 - bounce);
      ctx.rotate(tilt);
      if (facingX < -0.1) ctx.scale(-1, 1);
      ctx.drawImage(this.sprites.player, -spriteW / 2, -spriteH, spriteW, spriteH);
      ctx.restore();
    }
  }

  drawFloatingTexts(ctx) {
    for (const ft of this.floatingTexts) {
      const alpha = Math.max(0, ft.life / ft.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeText(ft.text, ft.x, ft.y);
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }
  }

  drawLabel(ctx, cx, cy, text, active) {
    ctx.font = '600 12px sans-serif';
    const w = ctx.measureText(text).width + 18;
    ctx.fillStyle = active ? 'rgba(37, 99, 235, 0.95)' : 'rgba(15, 23, 42, 0.86)';
    ctx.strokeStyle = active ? '#93c5fd' : 'rgba(148, 163, 184, 0.35)';
    ctx.lineWidth = 1.5;
    this.roundRect(ctx, cx - w / 2, cy - 11, w, 22, 6, true, true);

    ctx.fillStyle = '#f8fafc';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, cx, cy);
  }

  roundRect(ctx, x, y, w, h, r, fill, stroke) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  }
}