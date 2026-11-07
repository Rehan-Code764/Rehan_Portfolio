(function () {
  var g = document.getElementById('gate'), btn = document.getElementById('portal'), cv = document.getElementById('warp'), ctx = cv.getContext('2d');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches, W, H, R = 1, stars = [], spd = { v: .35 }, run = true, done = false;
  function size() { R = Math.min(devicePixelRatio || 1, 2); W = cv.width = innerWidth * R; H = cv.height = Math.min(innerHeight, screen.height || innerHeight) * R }
  function mk(s) { s.x = (Math.random() - .5) * 2; s.y = (Math.random() - .5) * 2; s.z = Math.random(); s.c = ['#eef1ff', '#9fe3ff', '#c9b8ff', '#ffd6a0'][Math.random() * 4 | 0] }
  size(); addEventListener('resize', size);
  var N = innerWidth < 700 ? 420 : 700; for (var i = 0; i < N; i++) { var s = {}; mk(s); stars.push(s) }
  ctx.lineCap = 'round';
  function draw() {
    if (!run) return; requestAnimationFrame(draw);
    ctx.clearRect(0, 0, W, H); var cx = W / 2, cy = H / 2, k = Math.max(W, H) * .25;
    stars.forEach(function (s) {
      var z0 = s.z + spd.v * .009; s.z -= spd.v * .004; if (s.z <= .02) { mk(s); s.z = 1 }
      ctx.strokeStyle = s.c; ctx.globalAlpha = Math.min(1, (1 - s.z) * 1.4 + .15); ctx.lineWidth = 1.3 * R;
      ctx.beginPath(); ctx.moveTo(cx + s.x / z0 * k, cy + s.y / z0 * k); ctx.lineTo(cx + s.x / s.z * k, cy + s.y / s.z * k); ctx.stroke();
    });
  }
  draw();
  function open() { document.documentElement.classList.remove('lock'); document.dispatchEvent(new Event('entered')) }
  function finish() { g.style.display = 'none'; run = false; document.documentElement.classList.remove('lock') }
  function enter() {
    if (done) return; done = true; btn.disabled = true;
    if (reduce || !window.gsap) { open(); finish(); return }
    gsap.timeline({ onComplete: finish })
      .to('.gate-text,.cta,#skip', { opacity: 0, y: -18, duration: .5 }, 0)
      .to('#portal', { boxShadow: '0 0 70px rgba(160,140,255,1)', duration: .3 }, 0)
      .to(spd, { v: 70, duration: 1.9, ease: 'power2.in' }, .3)
      .to('.scene', { scale: 6.5, transformOrigin: '50% 38%', duration: 2.1, ease: 'power3.in' }, .2)
      .to('.mw', { scale: 3.4, duration: 2.3, ease: 'power2.in' }, .3)
      .to('#flash', { opacity: 1, duration: .4, ease: 'power1.in' }, 1.7)
      .add(open, 2.05)
      .to(g, { opacity: 0, duration: 1.1, ease: 'power1.out' }, 2.05);
  }
  btn.addEventListener('click', enter);
  document.getElementById('arch').addEventListener('click', enter);
  document.getElementById('skip').addEventListener('click', function () { if (done) return; done = true; open(); finish() });
  if (!reduce && window.gsap) {
    gsap.from('.gate-text>*', { y: 26, opacity: 0, stagger: .18, duration: 1.1, delay: .3, ease: 'power3.out' });
    gsap.from('.scene', { opacity: 0, y: 30, duration: 1.6, delay: .2, ease: 'power3.out' });
  }
})();
