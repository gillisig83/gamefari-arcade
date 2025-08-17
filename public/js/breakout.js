class NeonBreakout {
  constructor(canvas, onGameOver, onTick){
    this.c=canvas; this.g=canvas.getContext('2d'); this.onGameOver=onGameOver; this.onTick=onTick; this._raf=0; this.paused=false;
    this.reset();
    this.keyL=false; this.keyR=false;
    this.keyH=(e)=>{const d=e.type==='keydown'; if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A')this.keyL=d; if(e.key==='ArrowRight'||e.key==='d'||e.key==='D')this.keyR=d; if(d&&(e.key==='p'||e.key==='P'))this.togglePause();};
    window.addEventListener('keydown',this.keyH); window.addEventListener('keyup',this.keyH);
  }
  reset(){
    const w=this.c.width,h=this.c.height;
    this.px=w/2; this.pw=140; this.ps=12; this.ball={x:w/2,y:h*0.65,vx:6,vy:-6,r:9};
    this.score=0; this.rows=5; this.cols=10; this.bricks=[]; const bw= (w-100)/this.cols, bh=22;
    for(let r=0;r<this.rows;r++){for(let c=0;c<this.cols;c++){this.bricks.push({x:50+c*bw+2,y:60+r*(bh+8),w:bw-4,h:bh,hp:1});}}
  }
  start(){ this.loop(); }
  destroy(){ cancelAnimationFrame(this._raf); window.removeEventListener('keydown',this.keyH); window.removeEventListener('keyup',this.keyH); }
  togglePause(force){ this.paused= typeof force==='boolean'?force:!this.paused; const b=document.querySelector('#pause-btn'); if(b) b.textContent=this.paused?'Resume':'Pause'; if(!this.paused) this.loop(); }
  nudge(dir){ this.px=Math.min(Math.max(this.px+dir*this.ps*3, this.pw/2+10, this.c.width-this.pw/2-10)); }
  loop(){ if(this.paused) return; this._raf=requestAnimationFrame(()=>this.loop()); this.update(); this.draw(); }
  update(){
    const w=this.c.width,h=this.c.height; const padL=this.pw/2+10, padR=w-this.pw/2-10;
    if(this.keyL) this.px=Math.max(padL, this.px- this.ps);
    if(this.keyR) this.px=Math.min(padR, this.px+ this.ps);

    const b=this.ball; b.x+=b.vx; b.y+=b.vy;
    if(b.x<b.r||b.x>w-b.r) b.vx*=-1;
    if(b.y<b.r) b.vy*=-1;

    // paddle
    if(b.y>h-60 && Math.abs(b.x-this.px)<this.pw/2){ b.vy=-Math.abs(b.vy); b.vx += (b.x-this.px)/25; this.score+=1; this.onTick?.(this.score); }

    // bricks
    for(const brick of this.bricks){ if(brick.hp<=0) continue; if(b.x>brick.x && b.x<brick.x+brick.w && b.y>brick.y && b.y<brick.y+brick.h){ brick.hp=0; this.score+=5; this.onTick?.(this.score); // basic reflect
        if(Math.abs((brick.x+brick.w/2)-b.x) > Math.abs((brick.y+brick.h/2)-b.y)) b.vx*=-1; else b.vy*=-1; }
    }

    // lose
    if(b.y>h+40){ this.onGameOver?.(this.score); }

    // win -> new level
    if(this.bricks.every(bk=>bk.hp<=0)){ this.rows=Math.min(9,this.rows+1); this.reset(); this.score+=25; this.onTick?.(this.score); }
  }
  draw(){
    const w=this.c.width,h=this.c.height,g=this.g; g.clearRect(0,0,w,h);
    g.fillStyle='#061021'; g.fillRect(0,0,w,h);
    // paddle
    g.fillStyle='#58c4ff'; g.fillRect(this.px-this.pw/2,h-40,this.pw,14);
    // ball
    g.fillStyle='#7affc6'; g.beginPath(); g.arc(this.ball.x,this.ball.y,this.ball.r,0,Math.PI*2); g.fill();
    // bricks
    for(const bk of this.bricks){ if(bk.hp<=0) continue; g.fillStyle='#183055'; g.fillRect(bk.x,bk.y,bk.w,bk.h); g.strokeStyle='#58c4ff'; g.strokeRect(bk.x+0.5,bk.y+0.5,bk.w-1,bk.h-1); }
  }
}
