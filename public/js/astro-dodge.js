
function rand(a,b){ return Math.random()*(b-a)+a; }

class AstroDodge {
  constructor(canvas, onGameOver, onTick) {
    this.c = canvas; this.x = canvas.width/2; this.y = canvas.height - 60;
    this.vx = 0; this.speed = 6; this.paused = false; this.dead = false;
    this.onGameOver = onGameOver; this.onTick = onTick;
    this.stars = Array.from({length:120},()=>({x:rand(0,canvas.width), y:rand(0,canvas.height), s:rand(0.5,1.8)}));
    this.meteors = []; this.spawnT = 0; this.score = 0; this.lastT = performance.now();
    this.keyL=false; this.keyR=false;
    this.handleKey = (e) => {
      const down = e.type === 'keydown';
      if (e.key==='ArrowLeft' || e.key==='a' || e.key==='A') { this.keyL = down; }
      if (e.key==='ArrowRight'|| e.key==='d' || e.key==='D') { this.keyR = down; }
      if (down && (e.key==='p' || e.key==='P')) this.togglePause();
    };
    window.addEventListener('keydown', this.handleKey);
    window.addEventListener('keyup', this.handleKey);
    this.blurH = () => { if (!this.paused) this.togglePause(true); };
    window.addEventListener('blur', this.blurH);
  }
  start(){ this.dead=false; this.loop(); }
  destroy(){ window.removeEventListener('keydown', this.handleKey); window.removeEventListener('keyup', this.handleKey); window.removeEventListener('blur', this.blurH); }
  togglePause(force){ this.paused = typeof force==='boolean' ? force : !this.paused; const btn=document.querySelector('#pause-btn'); if (btn) btn.textContent = this.paused ? 'Resume' : 'Pause'; if (!this.paused) this.loop(); }
  nudge(dir){ this.vx = dir * this.speed; this.x = clamp(this.x + this.vx, 20, this.c.width-20); }
  loop(){
    if (this.dead || this.paused) return;
    requestAnimationFrame(()=>this.loop());
    const now = performance.now();
    const dt = (now - this.lastT)/16.6667; this.lastT = now;

    this.vx = (this.keyL? -1 : 0) + (this.keyR? 1 : 0);
    this.x = Math.min(Math.max(this.x + this.vx * this.speed * dt, 20), this.c.width-20);

    for (const s of this.stars) { s.y += s.s * 0.8 * dt; if (s.y>this.c.height) { s.y = 0; s.x = rand(0,this.c.width);} }

    this.spawnT -= dt; if (this.spawnT <= 0) {
      this.spawnT = Math.min(Math.max(30 - Math.floor(this.score/150), 2), 30);
      this.meteors.push({ x: rand(20,this.c.width-20), y: -20, v: rand(2,6) + (this.score/400), r: rand(10,20) });
      if (this.meteors.length>80) this.meteors.shift();
    }
    for (const m of this.meteors) { m.y += m.v * dt * 3; }

    this.score += dt; const shown = Math.floor(this.score);
    this.onTick?.(shown);

    for (const m of this.meteors) { if (Math.hypot(m.x-this.x, m.y-this.y) < m.r + 14) { this.die(); return; } }

    this.draw();
  }
  draw(){
    const c=this.c, g=c.getContext('2d'); g.clearRect(0,0,c.width,c.height);
    g.fillStyle = '#061021'; g.fillRect(0,0,c.width,c.height);
    g.fillStyle = '#bfe7ff'; for (const s of this.stars) { g.globalAlpha = Math.min(Math.max(s.s/2, 0.2), 0.9); g.fillRect(s.x, s.y, 2, 2); }
    g.globalAlpha = 1;
    g.save(); g.translate(this.x, this.y);
    g.fillStyle = '#58c4ff'; g.beginPath(); g.moveTo(0,-14); g.lineTo(12,10); g.lineTo(-12,10); g.closePath(); g.fill();
    g.fillStyle = '#7affc6'; g.fillRect(-3,10,6,6);
    g.restore();
    for (const m of this.meteors) { g.fillStyle = '#b27b4b'; g.beginPath(); g.arc(m.x, m.y, m.r, 0, Math.PI*2); g.fill(); g.strokeStyle = '#723e1d'; g.lineWidth = 2; g.stroke(); }
    const grad = g.createRadialGradient(this.x, this.y, 10, this.x, this.y, 90); grad.addColorStop(0,'rgba(120,220,255,.08)'); grad.addColorStop(1,'transparent'); g.fillStyle = grad; g.beginPath(); g.arc(this.x, this.y, 120, 0, Math.PI*2); g.fill();
  }
  die(){ this.dead = true; this.onTick?.(Math.floor(this.score)); this.onGameOver?.(Math.floor(this.score)); }
}
