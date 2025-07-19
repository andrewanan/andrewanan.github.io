//taken from https://www.red3d.com/cwr/boids/

(function () {
  const CONFIG = {
    countScale: 12000,
    maxBoids: 150,
    size: 12,
    perception: 100,
    separationDist: 20,
    baseSpeed: 100,
    maxSpeed: 400,
    minSpeed: 35,
    maxAccel: 1000,
    alignStrength: 0.9,
    cohesionStrength: 0.35,
    separationStrength: 1.2,
    centeringStrength: 0.05,
    hashCell: 800,
    hoverRepelRadius: 300,
    hoverRepelForce: 550000,
    hoverSmoothing: 1,
    paletteLight: ["#FFB3BA","#FFDFBA","#FFFFBA","#BAFFC9","#BAE1FF"],
    paletteDark:  ["#ff6b6b","#feca57","#1dd1a1","#54a0ff","#5f27cd"]
  };

  function randAngleVec(speed){
    const a=Math.random()*Math.PI*2;
    return {x:Math.cos(a)*speed,y:Math.sin(a)*speed};
  }
  function limit(v,max){
    const m=Math.hypot(v.x,v.y);
    if(m>max&&m>0){v.x=v.x/m*max;v.y=v.y/m*max;}
  }

  class Boid {
    constructor(x,y,settings,colorIndex){
      this.pos={x,y};
      this.vel=randAngleVec(settings.baseSpeed*(0.5+Math.random()));
      this.acc={x:0,y:0};
      this.settings=settings;
      this.colorIndex=colorIndex;
    }
    addForce(fx,fy){ this.acc.x+=fx; this.acc.y+=fy; }
    integrate(dt){
      limit(this.acc,this.settings.maxAccel);
      this.vel.x+=this.acc.x*dt;
      this.vel.y+=this.acc.y*dt;
      const s=Math.hypot(this.vel.x,this.vel.y);
      if(s>this.settings.maxSpeed){
        this.vel.x=this.vel.x/s*this.settings.maxSpeed;
        this.vel.y=this.vel.y/s*this.settings.maxSpeed;
      } else if (s<this.settings.minSpeed){
        this.vel.x=this.vel.x/s*this.settings.minSpeed;
        this.vel.y=this.vel.y/s*this.settings.minSpeed;
      }
      this.pos.x+=this.vel.x*dt;
      this.pos.y+=this.vel.y*dt;
      this.acc.x=this.acc.y=0;
    }
    wrap(w,h){
      if(this.pos.x<0) this.pos.x+=w; else if(this.pos.x>=w) this.pos.x-=w;
      if(this.pos.y<0) this.pos.y+=h; else if(this.pos.y>=h) this.pos.y-=h;
    }
    draw(ctx,palette,size){
      const h=Math.atan2(this.vel.y,this.vel.x);
      ctx.save();
      ctx.translate(this.pos.x,this.pos.y);
      ctx.rotate(h);
      ctx.beginPath();
      ctx.moveTo(size,0);
      ctx.lineTo(-size*0.6,size*0.5);
      ctx.lineTo(-size*0.6,-size*0.5);
      ctx.closePath();
      ctx.fillStyle=palette[this.colorIndex%palette.length];
      ctx.fill();
      ctx.restore();
    }
  }

  const App = {
    canvas:null, ctx:null,
    boids:[], width:0, height:0,
    lastTime:performance.now(),
    settings:{}, hash:new Map(),
    palette:[], darkMode:false,
    mouse:null, smoothMouse:{x:0,y:0,active:false},
    initialized:false,
    running:false,
    mutationObserver:null,
    frameHandle:0
  };


  function init(opts = {}) {
    if (App.initialized) return;
    App.canvas = document.getElementById('boids-canvas');
    if (!App.canvas) return;
    if (App.canvas.offsetParent === null || App.canvas.clientWidth === 0) {
      return;
    }

    App.ctx = App.canvas.getContext('2d', { alpha:true });
    App.settings = Object.assign({}, CONFIG, opts);
    updateTheme(true);
    resize();
    createBoids();
    attachEvents();
    App.initialized = true;
    App.running = true;
    App.lastTime = performance.now();
    App.frameHandle = requestAnimationFrame(loop);
  }

  function attachEvents(){
    window.addEventListener('resize', onResize, { passive:true });
    window.addEventListener('mousemove', onMouseMove, { passive:true });
    window.addEventListener('mouseleave', clearMouse, { passive:true });
    window.addEventListener('mouseout', e => {
      if (!e.relatedTarget || e.relatedTarget.nodeName === 'HTML') clearMouse();
    });

    App.mutationObserver = new MutationObserver(() => updateTheme(false));
    App.mutationObserver.observe(document.body, { attributes:true, attributeFilter:['class'] });
  }

  function onResize(){
    const existed = App.width;
    resize();
    if (!existed && App.width && App.initialized && App.boids.length === 0){
      createBoids();
    }
  }

  function resize(){
    if (!App.canvas) return;
    const w = App.canvas.clientWidth;
    const h = App.canvas.clientHeight;
    if (!w || !h) return; // still hidden
    App.width  = App.canvas.width  = w;
    App.height = App.canvas.height = h;
  }

  function createBoids(){
    if (!App.width || !App.height) return;
    const area = App.width * App.height;
    const desired = Math.min(App.settings.maxBoids, Math.floor(area / App.settings.countScale));
    App.boids.length = 0;
    for (let i=0;i<desired;i++){
      App.boids.push(new Boid(Math.random()*App.width, Math.random()*App.height, App.settings, i));
    }
  }

  function updateTheme(first){
    const prev = App.darkMode;
    App.darkMode = document.body.classList.contains('dark-mode');
    App.palette = App.darkMode ? CONFIG.paletteDark : CONFIG.paletteLight;
    if (!first && prev !== App.darkMode) {
    }
  }


  function onMouseMove(e){
    if (!App.canvas) return;
    const rect = App.canvas.getBoundingClientRect();
    App.mouse = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    if (!App.smoothMouse.active){
      App.smoothMouse.x = App.mouse.x;
      App.smoothMouse.y = App.mouse.y;
      App.smoothMouse.active = true;
    }
  }
  function clearMouse(){
    App.mouse = null;
    App.smoothMouse.active = false;
  }


  function buildHash(){
    App.hash.clear();
    const cell=App.settings.hashCell;
    for(const b of App.boids){
      const key=((b.pos.x/cell)|0)+','+((b.pos.y/cell)|0);
      let bucket=App.hash.get(key);
      if(!bucket){ bucket=[]; App.hash.set(key,bucket); }
      bucket.push(b);
    }
  }
  function neighbors(b){
    const cell=App.settings.hashCell;
    const cx=(b.pos.x/cell)|0, cy=(b.pos.y/cell)|0;
    const res=[];
    for(let dx=-1;dx<=1;dx++){
      for(let dy=-1;dy<=1;dy++){
        const bucket=App.hash.get((cx+dx)+','+(cy+dy));
        if(bucket) res.push(...bucket);
      }
    }
    return res;
  }

  function flock(){
    const S=App.settings;
    let mouse=App.mouse;
    if(mouse && App.smoothMouse.active){
      App.smoothMouse.x += (mouse.x-App.smoothMouse.x)*S.hoverSmoothing;
      App.smoothMouse.y += (mouse.y-App.smoothMouse.y)*S.hoverSmoothing;
      mouse=App.smoothMouse;
    }

    const { perception,separationDist, alignStrength,cohesionStrength,separationStrength,centeringStrength } = S;

    for(const b of App.boids){
      let count=0, avgVX=0, avgVY=0, centerX=0, centerY=0, sepX=0, sepY=0;
      const neigh=neighbors(b);
      for(const o of neigh){
        if(o===b) continue;
        const dx=o.pos.x-b.pos.x;
        const dy=o.pos.y-b.pos.y;
        const d2=dx*dx+dy*dy;
        if(d2<perception*perception){
          count++;
          avgVX+=o.vel.x; avgVY+=o.vel.y;
          centerX+=o.pos.x; centerY+=o.pos.y;
          if(d2<separationDist*separationDist){
            const d=Math.sqrt(d2)||1;
            sepX-=dx/d; sepY-=dy/d;
          }
        }
      }

      if(count>0){
        avgVX/=count; avgVY/=count;
        const mag=Math.hypot(avgVX,avgVY)||1;
        avgVX/=mag; avgVY/=mag;
        b.addForce(avgVX*alignStrength, avgVY*alignStrength);

        centerX = centerX/count - b.pos.x;
        centerY = centerY/count - b.pos.y;
        const dC=Math.hypot(centerX,centerY)||1;
        b.addForce((centerX/dC)*cohesionStrength,(centerY/dC)*cohesionStrength);

        b.addForce(sepX*separationStrength, sepY*separationStrength);
      }

      const offX=(App.width*0.5)-b.pos.x;
      const offY=(App.height*0.5)-b.pos.y;
      b.addForce(offX*centeringStrength*0.0005, offY*centeringStrength*0.0005);

      if(mouse){
        const mdx=b.pos.x-mouse.x;
        const mdy=b.pos.y-mouse.y;
        const r2=mdx*mdx+mdy*mdy;
        const R=S.hoverRepelRadius;
        if(r2<R*R && r2>0.1){
          const d=Math.sqrt(r2);
          const falloff = 1 - d / R;
          const strength = falloff * S.hoverRepelForce;
          b.addForce((mdx/d)*strength,(mdy/d)*strength);
        }
      }
    }
  }

  function loop(ts){
    if(!App.running) return;
    const dt=Math.min(0.05,(ts-App.lastTime)/1000);
    App.lastTime=ts;

    buildHash();
    flock();
    for(const b of App.boids){
      b.integrate(dt);
      b.wrap(App.width,App.height);
    }
    draw();
    App.frameHandle=requestAnimationFrame(loop);
  }

  function draw(){
    if(!App.ctx) return;
    App.ctx.clearRect(0,0,App.width,App.height);
    for(const b of App.boids){
      b.draw(App.ctx,App.palette,App.settings.size);
    }
  }


  window.initBoids = function(opts){
    init(opts);
    if(!App.initialized){
      setTimeout(()=>init(opts), 100);
    }
  };

  window.boidsRespawn = function(){
    if(!App.initialized) return;
    resize();
    createBoids();
  };

})();
