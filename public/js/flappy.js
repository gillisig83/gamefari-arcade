class FlappyComet {
  constructor(canvas,onGameOver,onTick){ this.c=canvas; this.g=canvas.getContext('2d'); this.onGameOver=onGameOver; this.onTick=onTick; this._raf=0; this.paused=false; this.reset(); this.clickH=(e)=>{e.preventDefault(); this.jump();}; this.keyH=(e)=>{if(e.type==='keydown'&&(e.key===' '||e.key==='ArrowUp')){e.preventDefault(); this.jump();} if(e.type==='keydown'&&(e.key==='p'||e.key==='P')) this.togglePause();}; window.addEventListener('pointerdown',this.clickH); window.addEventListener('keydown',this.keyH); window.addEventListener('keyup',this.keyH); }
  reset(){ const w=this.c.width,h=this.c.height; this.x=w*0.35; this.y=h*0.5; this.vy=0; this.gap=160; this.pipes=[]; this.t=0; this.score=0; this.spawn(); }
  destroy(){ cancelAnimationFrame(this._raf); window.removeEventListener('pointerdown',this.clickH); window.removeEventListener('keydown',this.keyH); window.removeEventListener('keyup',this.keyH); }
  start(){ this.loop(); }
  togglePause(force){ this.paused= typeof force==='boolean'?force:!this.paused; const b=document.querySelector('#pause-btn'); if(b) b.textContent=this.paused?'Resume':'Pause'; if(!this.paused) this.loop(); }
  nudge(){} // not used
  jump(){ this.vy=-9; }
  spawn(){ const w=this.c.width,h=this.c.height; const top= Math.random()*(h-this.gap-120)+60; this.pipes.push({x:w+40, top:top, bottom: top+this.gap, w:70, passed:false}); }
  loop(){ if(this.paused) return; this._raf=requestAnimationFrame(()=>this.loop()); this.update(); this.draw(); }
  update(){ const w=this.c.width,h=this.c.height; this.t++; if(this.t%90===0) this.spawn(); this.vy+=0.6; this.y+=this.vy; for(const p of this.pipes){ p.x-=4; }
    this.pipes = this.pipes.filter(p=>p.x+p.w>-80);
    // score
    for(const p of this.pipes){ if(!p.passed && p.x+ p.w < this.x){ p.passed=true; this.score++; this.onTick?.(this.score); } }
    // collisions
    if(this.y<0 || this.y>h) return this.onGameOver?.(this.score);
    for(const p of this.pipes){ if(this.x>p.x-20 && this.x<p.x+p.w+20){ if(this.y<p.top || this.y>p.bottom) return this.onGameOver?.(this.score); } }
  }
  draw(){ const w=this.c.width,h=this.c.height,g=this.g; g.clearRect(0,0,w,h); g.fillStyle='#061021'; g.fillRect(0,0,w,h); // comet
    g.fillStyle='#7affc6'; g.beginPath(); g.arc(this.x,this.y,14,0,Math.PI*2); g.fill(); // pipes
    for(const p of this.pipes){ g.fillStyle='#183055'; g.fillRect(p.x,0,p.w,p.top); g.fillRect(p.x,p.bottom,p.w,h-p.bottom); g.strokeStyle='#58c4ff'; g.strokeRect(p.x+0.5,0.5,p.w-1,p.top-1); g.strokeRect(p.x+0.5,p.bottom+0.5,p.w-1,h-p.bottom-1); }
  }
}
