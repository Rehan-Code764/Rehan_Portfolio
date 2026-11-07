(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var target = 0, cur = 0, mx = 0, my = 0, warp = 0;
  document.addEventListener('entered', function () { warp = 1 });

  /* ---------- text choreography ---------- */
  gsap.registerPlugin(ScrollTrigger);
  var t = document.getElementById('title');
  t.innerHTML = t.textContent.split('').map(function (ch) { return '<span>' + ch + '</span>' }).join('');
  document.addEventListener('entered', function () { if (!reduce) gsap.from('#title span', { yPercent: 110, rotate: 8, duration: 1.3, stagger: .08, ease: 'expo.out', delay: .15 }) });
  document.documentElement.classList.add('js');
  var setVh = function () { document.documentElement.style.setProperty('--vh', Math.min(innerHeight, screen.height || innerHeight) + 'px') };
  setVh(); var lastW = innerWidth; addEventListener('resize', function () { if (innerWidth !== lastW) { lastW = innerWidth; setVh() } });
  var secs = document.querySelectorAll('section');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { e.target.querySelector('.in').classList.toggle('show', e.isIntersecting) }) }, { rootMargin: '-30% 0px -30% 0px' });
    secs.forEach(function (s) { io.observe(s) });
  } else { document.documentElement.classList.remove('js') }
  setTimeout(function () { if (!document.querySelector('.in.show')) document.documentElement.classList.remove('js') }, 1800);
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: function (s) { target = s.progress; document.getElementById('fill').style.transform = 'scaleY(' + s.progress + ')' } });
  var menuLinks = document.querySelectorAll('.menu a');
  document.querySelectorAll('section[id]').forEach(function (s) { ScrollTrigger.create({ trigger: s, start: 'top 55%', end: 'bottom 55%', onToggle: function (st) { if (st.isActive) menuLinks.forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') === '#' + s.id) }) } }) });

  /* ---------- 3D scene ---------- */
  var canvas = document.getElementById('c'), renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false }); } catch (e) { document.getElementById('fallback').style.display = 'block'; canvas.style.display = 'none'; return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  var scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0b0a22);
  scene.fog = new THREE.FogExp2(0x0b0a22, .03);
  var camera = new THREE.PerspectiveCamera(60, 1, .1, 300);

  var pts = [];
  for (var i = 0; i < 9; i++)pts.push(new THREE.Vector3(Math.sin(i * .9) * 7, Math.cos(i * 1.3) * 3.5, -i * 24));
  var curve = new THREE.CatmullRomCurve3(pts);

  var palette = [0x5ad1ff, 0x9a7bff, 0xff7ac6, 0xffb347, 0x5ad1ff].map(function (h) { return new THREE.Color(h) });
  var accent = palette[0].clone();

  /* gates the camera flies through */
  var gates = [], gateMats = [];
  [.1, .3, .5, .7, .92].forEach(function (u) {
    var g = new THREE.Group(), p = curve.getPoint(u), tg = curve.getTangent(u);
    [1, .68, .4].forEach(function (k, j) {
      var m = new THREE.LineBasicMaterial({ color: 0x5ad1ff, transparent: true, opacity: .9 - j * .2 });
      gateMats.push(m);
      g.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(11 * k, 11 * k, .5)), m));
      g.children[j].position.z = -j * 1.4;
    });
    g.position.copy(p); g.lookAt(p.clone().add(tg)); scene.add(g); gates.push(g);
  });

  /* floating blocks, linked into a chain */
  var blocks = [], blockMat = new THREE.MeshStandardMaterial({ color: 0x2a2670, metalness: .7, roughness: .28, emissive: 0x120f3a });
  var edgeMat = new THREE.LineBasicMaterial({ color: 0xeef1ff, transparent: true, opacity: .55 });
  for (var n = 0; n < 64; n++) {
    var u = n / 64 * .98 + .01, s = .6 + Math.random() * 1.8, a = Math.random() * 6.283, r = 4.5 + Math.random() * 7;
    var c = curve.getPoint(u), geo = new THREE.BoxGeometry(s, s, s);
    var b = new THREE.Mesh(geo, blockMat);
    b.position.set(c.x + Math.cos(a) * r, c.y + Math.sin(a) * r, c.z + (Math.random() - .5) * 8);
    b.rotation.set(Math.random() * 3, Math.random() * 3, 0);
    b.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), edgeMat));
    b.userData.s = .3 + Math.random(); scene.add(b); blocks.push(b);
  }
  var lp = []; blocks.forEach(function (b, i) { if (i) lp.push(blocks[i - 1].position.clone(), b.position.clone()) });
  var chainMat = new THREE.LineBasicMaterial({ color: 0x5ad1ff, transparent: true, opacity: .28 });
  scene.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(lp), chainMat));

  /* stars */
  var sp = new Float32Array(1800 * 3);
  for (var k = 0; k < 1800; k++) { var q = curve.getPoint(Math.random()); sp[k * 3] = q.x + (Math.random() - .5) * 70; sp[k * 3 + 1] = q.y + (Math.random() - .5) * 50; sp[k * 3 + 2] = q.z + (Math.random() - .5) * 30 }
  var sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
  scene.add(new THREE.Points(sg, new THREE.PointsMaterial({ size: .12, color: 0xeef1ff, transparent: true, opacity: .8, fog: false })));

  scene.add(new THREE.AmbientLight(0x6a64c8, .55));
  var cool = new THREE.PointLight(0x5ad1ff, 2.2, 40), warm = new THREE.PointLight(0xffb347, 1.6, 40);
  scene.add(cool, warm);

  function resize() { var w = innerWidth, h = Math.min(innerHeight, screen.height || innerHeight); renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix() }
  addEventListener('resize', resize); resize();
  addEventListener('pointermove', function (e) { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5 });

  var look = new THREE.Vector3(), fl = palette.length - 1;
  function frame() {
    requestAnimationFrame(frame);
    var vel = target - cur;
    cur += vel * (reduce ? 1 : .055);
    var u = Math.min(cur * .985, .985);
    var pos = curve.getPoint(u);
    camera.position.set(pos.x + mx * 1.2, pos.y - my * .8, pos.z);
    look.copy(curve.getPoint(Math.min(u + .02, 1)));
    camera.lookAt(look);
    camera.rotateZ(-vel * 9 + mx * .05);
    camera.fov = 60 + Math.min(Math.abs(vel) * 500, 20) + warp * 28; warp *= .94; camera.updateProjectionMatrix();

    var f = Math.min(cur * fl, fl - .0001), i = Math.floor(f);
    accent.copy(palette[i]).lerp(palette[i + 1], f - i);
    cool.color.copy(accent); cool.position.copy(camera.position).add(new THREE.Vector3(3, 2, -4));
    warm.position.copy(camera.position).add(new THREE.Vector3(-4, -2, -8));
    chainMat.color.copy(accent); gateMats.forEach(function (m) { m.color.copy(accent) });
    document.documentElement.style.setProperty('--glow', '#' + accent.getHexString());

    if (!reduce) {
      var tm = performance.now() * .001;
      blocks.forEach(function (b) { b.rotation.x += .003 * b.userData.s; b.rotation.y += .004 * b.userData.s });
      gates.forEach(function (g, j) { g.rotation.z = Math.sin(tm * .4 + j) * .05 });
    }
    renderer.render(scene, camera);
  }
  frame();
})();
