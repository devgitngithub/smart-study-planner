// Particle background
const canvas = document.getElementById('particles-canvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let w, h, particles = [];
  let particleColor = '232, 184, 75'; // gold by default
  
  window.updateParticlesTheme = function(theme) {
    particleColor = theme === 'light' ? '148, 163, 184' : '232, 184, 75'; // slate in light mode, gold in dark mode
  };
  
  function resize() {
    w = canvas.width = innerWidth;
    h = canvas.height = innerHeight;
  }
  
  function Particle() {
    this.x = Math.random() * w;
    this.y = Math.random() * h;
    this.r = Math.random() * 2 + 0.5;
    this.dx = (Math.random() - 0.5) * 0.4;
    this.dy = (Math.random() - 0.5) * 0.4;
    this.a = Math.random() * 0.3 + 0.1;
  }
  
  function draw() {
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => {
      p.x += p.dx;
      p.y += p.dy;
      if (p.x < 0 || p.x > w) p.dx *= -1;
      if (p.y < 0 || p.y > h) p.dy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = \`rgba(\${particleColor}, \${p.a})\`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  
  resize();
  for (let i = 0; i < 60; i++) particles.push(new Particle());
  draw();
  addEventListener('resize', resize);
  
  // Set initial theme
  const initialTheme = localStorage.getItem('sf_theme') || 'dark';
  window.updateParticlesTheme(initialTheme);
}
