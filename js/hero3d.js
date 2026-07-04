/* ─── Navixar Hero — Gaussian-Splat-Style Point Cloud (Three.js r128) ───
   A procedural Indian street scene rendered as ~60k points that
   "reconstructs" itself from noise on load — the visual argument for
   splat-based simulation, made before a single word is read.        */

(function () {
  'use strict';

  var container = document.getElementById('hero3d');
  if (!container || typeof THREE === 'undefined') return;

  // WebGL support check
  try {
    var testCanvas = document.createElement('canvas');
    if (!(testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl'))) return;
  } catch (e) { return; }

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000003, 0.0055);

  var camera = new THREE.PerspectiveCamera(58, 1, 0.1, 600);
  camera.position.set(0, 9, 46);

  var renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  // ──────────────────────────────────────────────
  // Build the point cloud
  // ──────────────────────────────────────────────
  var positions = [], starts = [], colors = [], sizes = [], offsets = [];
  var ROAD_LEN = 480, ROAD_HALF = ROAD_LEN / 2;

  function rand(a, b) { return a + Math.random() * (b - a); }

  function push(x, y, z, r, g, b, size) {
    positions.push(x, y, z);
    // Scattered origin: a loose cloud around the target
    var th = Math.random() * Math.PI * 2, ph = Math.acos(rand(-1, 1)), rad = rand(30, 130);
    starts.push(
      x + rad * Math.sin(ph) * Math.cos(th),
      y + rad * Math.sin(ph) * Math.sin(th) * 0.6 + 20,
      z + rad * Math.cos(ph)
    );
    colors.push(r, g, b);
    sizes.push(size);
    offsets.push(Math.random());
  }

  // 1 — Road surface (lane-less, worn asphalt with pothole voids)
  var potholes = [];
  for (var i = 0; i < 26; i++) potholes.push({ x: rand(-11, 11), z: rand(-ROAD_HALF, ROAD_HALF), r: rand(1.2, 3.2) });

  for (var x = -14; x <= 14; x += 0.85) {
    for (var z = -ROAD_HALF; z <= ROAD_HALF; z += 0.85) {
      var jx = x + rand(-0.35, 0.35), jz = z + rand(-0.35, 0.35);
      var inHole = false;
      for (var p = 0; p < potholes.length; p++) {
        var dx = jx - potholes[p].x, dz = jz - potholes[p].z;
        if (dx * dx + dz * dz < potholes[p].r * potholes[p].r) { inHole = true; break; }
      }
      if (inHole && Math.random() > 0.25) continue; // mostly missing points = pothole
      var shade = rand(0.10, 0.22);
      var warm = rand(0.0, 0.03);
      push(jx, inHole ? rand(-0.5, -0.15) : rand(-0.08, 0.08), jz, shade + warm, shade, shade + rand(0, 0.05), rand(1.4, 2.4));
    }
  }

  // 2 — Dirt shoulders
  for (var s = 0; s < 7000; s++) {
    var side = Math.random() > 0.5 ? 1 : -1;
    var sx = side * rand(14.5, 19), sz = rand(-ROAD_HALF, ROAD_HALF);
    var d = rand(0.12, 0.2);
    push(sx, rand(-0.05, 0.25), sz, d + 0.08, d + 0.04, d * 0.7, rand(1.2, 2.2));
  }

  // 3 — Buildings, both sides (dense low-rise Indian streetscape)
  function building(cx, cz, w, dpt, h, warmth) {
    var density = Math.max(60, Math.floor(w * dpt * h * 0.55));
    for (var k = 0; k < density; k++) {
      // points on the faces, not inside
      var face = Math.random();
      var bx, by, bz;
      if (face < 0.42) { bx = cx + rand(-w / 2, w / 2); by = rand(0, h); bz = cz + (cx > 0 ? -dpt / 2 : dpt / 2); } // street face
      else if (face < 0.7) { bx = cx + (Math.random() > 0.5 ? w / 2 : -w / 2); by = rand(0, h); bz = cz + rand(-dpt / 2, dpt / 2); }
      else { bx = cx + rand(-w / 2, w / 2); by = h; bz = cz + rand(-dpt / 2, dpt / 2); } // roofline
      var lum = rand(0.06, 0.16) + (by / h) * 0.05;
      // occasional lit window
      if (Math.random() < 0.045) push(bx, by, bz, rand(0.9, 1.0), rand(0.55, 0.75), 0.25, rand(2.2, 3.4));
      else push(bx, by, bz, lum + warmth, lum + warmth * 0.55, lum, rand(1.3, 2.3));
    }
  }
  for (var bz2 = -ROAD_HALF; bz2 < ROAD_HALF; bz2 += rand(9, 16)) {
    building(rand(24, 34), bz2, rand(7, 13), rand(6, 10), rand(6, 26), rand(0.01, 0.06));
    building(-rand(24, 34), bz2 + rand(0, 6), rand(7, 13), rand(6, 10), rand(6, 30), rand(0.01, 0.06));
  }

  // 4 — Street poles + sagging wires (signature Indian street detail)
  for (var pz = -ROAD_HALF; pz < ROAD_HALF; pz += 34) {
    var px = 16.5;
    for (var py = 0; py < 11; py += 0.28) push(px, py, pz + rand(-0.1, 0.1), 0.16, 0.16, 0.18, 1.6);
    push(px, 11, pz, 1.0, 0.78, 0.35, 5.0); // lamp
    // catenary wire to next pole
    for (var t = 0; t <= 1; t += 0.02) {
      var wy = 10.6 - Math.sin(t * Math.PI) * 1.7;
      push(px + rand(-0.05, 0.05), wy, pz + t * 34, 0.14, 0.14, 0.16, 1.2);
    }
  }

  // 5 — Vehicles: scattered clusters (autos, bikes, cars) on the road
  function vehicleCluster(vx, vz, kind) {
    var col = kind === 'auto' ? [0.95, 0.62, 0.08] : (kind === 'car' ? [0.25, 0.45, 0.85] : [0.6, 0.62, 0.66]);
    var w = kind === 'car' ? 1.9 : (kind === 'auto' ? 1.4 : 0.6);
    var l = kind === 'car' ? 4.2 : (kind === 'auto' ? 2.6 : 1.9);
    var h = kind === 'auto' ? 1.9 : (kind === 'car' ? 1.5 : 1.3);
    var n = kind === 'bike' ? 90 : 240;
    for (var k = 0; k < n; k++) {
      push(vx + rand(-w / 2, w / 2), rand(0.1, h), vz + rand(-l / 2, l / 2),
        col[0] * rand(0.55, 1), col[1] * rand(0.55, 1), col[2] * rand(0.55, 1), rand(1.6, 2.6));
    }
  }
  var kinds = ['auto', 'bike', 'car', 'auto', 'bike', 'bike'];
  for (var v = 0; v < 34; v++) {
    vehicleCluster(rand(-11, 11), rand(-ROAD_HALF + 10, ROAD_HALF - 10), kinds[Math.floor(Math.random() * kinds.length)]);
  }

  // ──────────────────────────────────────────────
  // Geometry + shader
  // ──────────────────────────────────────────────
  var geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('aStart', new THREE.Float32BufferAttribute(starts, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geo.setAttribute('aSize', new THREE.Float32BufferAttribute(sizes, 1));
  geo.setAttribute('aOffset', new THREE.Float32BufferAttribute(offsets, 1));

  var uniforms = {
    uProgress: { value: reduceMotion ? 1 : 0 },
    uScatter: { value: 0 },
    uTime: { value: 0 },
    uPR: { value: Math.min(window.devicePixelRatio || 1, 2) }
  };

  var material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    transparent: true,
    depthWrite: false,
    vertexShader: [
      'attribute vec3 aStart;',
      'attribute float aSize;',
      'attribute float aOffset;',
      'varying vec3 vColor;',
      'varying float vSweep;',
      'uniform float uProgress;',
      'uniform float uScatter;',
      'uniform float uTime;',
      'uniform float uPR;',
      'float easeOut(float t){ return 1.0 - pow(1.0 - t, 3.0); }',
      'void main(){',
      '  vColor = color;',
      '  float t = clamp(uProgress * 1.35 - aOffset * 0.35, 0.0, 1.0);',
      '  vec3 pos = mix(aStart, position, easeOut(t));',
      '  pos = mix(pos, aStart, uScatter * 0.55);',
      '  pos.y += sin(uTime * 0.6 + aOffset * 6.2831) * 0.05;',
      // lidar-style sweep travelling down the road
      '  float band = mod(uTime * 55.0, 560.0) - 280.0;',
      '  vSweep = smoothstep(9.0, 0.0, abs(pos.z - band)) * step(0.95, uProgress);',
      '  vec4 mv = modelViewMatrix * vec4(pos, 1.0);',
      '  gl_PointSize = aSize * uPR * (52.0 / -mv.z) * (1.0 + vSweep * 0.9);',
      '  gl_Position = projectionMatrix * mv;',
      '}'
    ].join('\n'),
    fragmentShader: [
      'varying vec3 vColor;',
      'varying float vSweep;',
      'void main(){',
      '  vec2 uv = gl_PointCoord - 0.5;',
      '  float d = length(uv);',
      '  if (d > 0.5) discard;',
      '  float alpha = smoothstep(0.5, 0.12, d);',
      '  vec3 col = mix(vColor, vec3(0.15, 0.85, 1.0), vSweep * 0.85);',
      '  gl_FragColor = vec4(col, alpha * 0.95);',
      '}'
    ].join('\n'),
    vertexColors: true
  });

  var points = new THREE.Points(geo, material);
  scene.add(points);

  // ──────────────────────────────────────────────
  // Animation loop
  // ──────────────────────────────────────────────
  var mouseX = 0, mouseY = 0, camX = 0, camY = 0;
  window.addEventListener('mousemove', function (e) {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  var clock = new THREE.Clock();
  var running = true, inView = true;

  document.addEventListener('visibilitychange', function () { running = !document.hidden; });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) { inView = entries[0].isIntersecting; }, { threshold: 0 })
      .observe(container);
  }

  function resize() {
    var w = container.clientWidth, h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener('resize', resize);
  resize();

  function frame() {
    requestAnimationFrame(frame);
    if (!running || !inView) return;
    var t = clock.getElapsedTime();
    uniforms.uTime.value = t;

    if (!reduceMotion) {
      // Reconstruction: 0 → 1 over ~3.2s after a short beat
      uniforms.uProgress.value = Math.min(1, Math.max(0, (t - 0.4) / 3.2));
      // Slow dolly through the scene
      camera.position.z = 46 - ((t * 2.2) % 90);
      camX += (mouseX * 2.4 - camX) * 0.04;
      camY += (-mouseY * 1.4 - camY) * 0.04;
      camera.position.x = camX;
      camera.position.y = 9 + camY;
      camera.lookAt(camX * 0.4, 4.5, camera.position.z - 60);
    } else {
      camera.lookAt(0, 4.5, camera.position.z - 60);
    }
    renderer.render(scene, camera);
  }
  frame();

  // Hook for main.js: scatter the cloud as the hero scrolls away
  window.NavixarHero = {
    setScroll: function (p) { uniforms.uScatter.value = Math.max(0, Math.min(1, p)); }
  };
})();
