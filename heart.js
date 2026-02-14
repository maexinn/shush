// Lightweight heart animation implementation using a canvas overlay.
// Exposes spawnHearts(x, y, opts) globally. Works on desktop and mobile (Android/iOS).
(function(){
  const hearts = ['❤️', '💕', '💖', '💗', '💝'];
  const colors = [
    '#ff1744','#ff5252','#ff6e40','#ffab91','#ffccbc','#f8bbd0'
  ];

  const canvas = document.createElement('canvas');
  canvas.className = 'confetti-canvas';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  let DPR = Math.max(1, window.devicePixelRatio || 1);
  function resize(){
    DPR = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = Math.floor(window.innerWidth * DPR);
    canvas.height = Math.floor(window.innerHeight * DPR);
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(DPR,0,0,DPR,0,0);
  }
  window.addEventListener('resize', resize);
  resize();

  // Particle pool
  const particles = [];
  const maxParticles = 1000;

  function rand(min, max){ return Math.random()*(max-min)+min }

  function createParticle(x,y){
    return {
      x: x,
      y: y,
      vx: rand(-5,5),
      vy: rand(-15,-5),
      size: rand(16,32),
      life: rand(80,160),
      char: hearts[Math.floor(Math.random()*hearts.length)],
      color: colors[Math.floor(Math.random()*colors.length)],
      rotation: rand(0,Math.PI*2),
      angularVelocity: rand(-0.15,0.15),
      drag: 0.98,
      gravity: 0.25,
      scale: 1
    };
  }

  function spawnHearts(x, y, opts){
    opts = opts || {};
    const count = opts.count || Math.floor(rand(15,30));
    for(let i=0;i<count;i++){
      if(particles.length >= maxParticles) break;
      const p = createParticle(x, y);
      // give a directional bias based on optional angle
      if(opts.angle !== undefined){
        const speed = Math.sqrt(p.vx*p.vx + p.vy*p.vy);
        p.vx = Math.cos(opts.angle)*speed;
        p.vy = Math.sin(opts.angle)*speed;
      }
      particles.push(p);
    }
  }

  // Expose globally
  window.spawnHearts = spawnHearts;

  // Animation
  let last = performance.now();
  function step(now){
    const dt = Math.min(40, now - last);
    last = now;
    // clear
    ctx.clearRect(0,0,canvas.width, canvas.height);

    for(let i = particles.length-1; i >= 0; i--){
      const p = particles[i];
      // physics
      p.vx *= p.drag;
      p.vy *= p.drag;
      p.vy += p.gravity * (dt/16.67);
      p.x += p.vx * (dt/16.67);
      p.y += p.vy * (dt/16.67);
      p.rotation += p.angularVelocity * (dt/16.67);
      p.life -= dt/3;
      p.scale = Math.max(0.3, p.life/100);

      // draw heart emoji
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      const alpha = Math.max(0, Math.min(1, p.life/120));
      ctx.globalAlpha = alpha;
      ctx.font = `${p.size * p.scale}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = p.color;
      ctx.fillText(p.char, 0, 0);
      ctx.restore();

      // remove if dead
      if(p.life <= 0){
        particles.splice(i, 1);
      }
    }

    requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
})();
