/* =========================================================
   The Year Journey: a low-poly coastline from November to June.
   One lighthouse per unit; finished units shine, the next one turns its beam.
   Loaded lazily by index.html only when WebGL is available.
   ========================================================= */
import * as THREE from "../vendor/three.module.min.js";

export function startJourney(host, labelsHost, opts) {
  const units = opts.units, progress = opts.progress || {};
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  host.appendChild(renderer.domElement);
  renderer.domElement.setAttribute("aria-hidden", "true");

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 400);

  /* ---- palette by theme: dawn (light) or night (dark) ---- */
  const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const dark = () => getComputedStyle(document.documentElement).colorScheme === "dark";
  const hemi = new THREE.HemisphereLight(0xffffff, 0x334455, 1.0);
  const sun = new THREE.DirectionalLight(0xffffff, 1.2);
  sun.position.set(-30, 40, 20);
  scene.add(hemi, sun);

  /* ---- the coast: x = coastX(z); land to the east (x > coast), sea to the west ---- */
  const L = 150; // length of the coast along z
  const coastX = (z) => 6 * Math.sin(z * 0.045) + 3 * Math.sin(z * 0.13 + 1.3);
  const noise = (x, z) => Math.sin(x * 0.21) * Math.cos(z * 0.17) + 0.5 * Math.sin(x * 0.53 + z * 0.31);

  const landGeo = new THREE.PlaneGeometry(70, L + 40, 70, 120);
  landGeo.rotateX(-Math.PI / 2);
  const lp = landGeo.attributes.position;
  for (let i = 0; i < lp.count; i++) {
    const x = lp.getX(i) + 20, z = lp.getZ(i);
    const d = x - coastX(z);
    const h = d < 0 ? -2.5 : Math.min(14, 0.5 + d * 0.32 + Math.max(0, d - 8) * 0.35 + noise(x, z) * (0.4 + d * 0.06));
    lp.setX(i, x); lp.setY(i, h);
  }
  landGeo.computeVertexNormals();
  const landColors = [];
  for (let i = 0; i < lp.count; i++) {
    const y = lp.getY(i), c = new THREE.Color();
    if (y < 0.9) c.set(0xe8d6a8); else if (y < 6) c.set(0x7fa36a).lerp(new THREE.Color(0x5d8350), (y - 0.9) / 5); else c.set(0x8b8f7a).lerp(new THREE.Color(0xeeeeee), Math.min(1, (y - 6) / 8));
    landColors.push(c.r, c.g, c.b);
  }
  landGeo.setAttribute("color", new THREE.Float32BufferAttribute(landColors, 3));
  const land = new THREE.Mesh(landGeo, new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true }));
  scene.add(land);

  const seaGeo = new THREE.PlaneGeometry(160, L + 60, 60, 80);
  seaGeo.rotateX(-Math.PI / 2);
  const sp = seaGeo.attributes.position; const base = Float32Array.from(sp.array);
  const seaMat = new THREE.MeshPhongMaterial({ color: 0x2a8a96, flatShading: true, shininess: 60, transparent: true, opacity: 0.94 });
  const sea = new THREE.Mesh(seaGeo, seaMat); sea.position.set(-30, 0, 0); scene.add(sea);

  /* ---- stations: lighthouses along the coast, south (Nov) to north (May), harbour for June ---- */
  const stations = [];
  const firstOpen = units.find((u) => !((progress[u.id] || {}).s1 && (progress[u.id] || {}).s2));
  const n = units.length;
  units.forEach((u, i) => {
    const z = -L / 2 + 10 + (i * (L - 30)) / n;
    const x = coastX(z) + 1.2;
    const p = progress[u.id] || {};
    const state = p.s1 && p.s2 ? "done" : u === firstOpen ? "next" : (p.s1 || p.s2) ? "half" : "soon";
    const g = new THREE.Group(); g.position.set(x, 0.6, z);
    const white = new THREE.MeshLambertMaterial({ color: 0xf5f5f0 });
    const stripe = new THREE.MeshLambertMaterial({ color: 0x1c6b74 });
    for (let k = 0; k < 4; k++) {
      const seg = new THREE.Mesh(new THREE.CylinderGeometry(0.9 - k * 0.12 - 0.12, 0.9 - k * 0.12, 1.4, 12), k % 2 ? stripe : white);
      seg.position.y = 0.7 + k * 1.4; g.add(seg);
    }
    const lit = state === "done" || state === "next";
    const lampMat = new THREE.MeshBasicMaterial({ color: lit ? 0xffc04d : state === "half" ? 0xc9a462 : 0x55606a });
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.5, 14, 10), lampMat); lamp.position.y = 6.3; g.add(lamp);
    const cap = new THREE.Mesh(new THREE.ConeGeometry(0.62, 0.8, 12), stripe); cap.position.y = 7.1; g.add(cap);
    let beam = null;
    if (state === "next") {
      const bg = new THREE.ConeGeometry(1.7, 15, 20, 1, true); bg.translate(0, -7.5, 0); bg.rotateZ(Math.PI / 2);
      beam = new THREE.Mesh(bg, new THREE.MeshBasicMaterial({ color: 0xffd36b, transparent: true, opacity: 0.22, depthWrite: false, side: THREE.DoubleSide }));
      beam.position.y = 6.3; g.add(beam);
    }
    if (lit) { const pl = new THREE.PointLight(0xffc04d, state === "next" ? 6 : 3, 14, 1.6); pl.position.y = 6.3; g.add(pl); }
    scene.add(g);
    stations.push({ u, g, beam, state, pos: new THREE.Vector3(x, 7.6, z) });
  });
  // June: the harbour
  const zJ = L / 2 - 6, xJ = coastX(zJ) + 1;
  const harbour = new THREE.Group(); harbour.position.set(xJ, 0.4, zJ);
  const pier = new THREE.Mesh(new THREE.BoxGeometry(9, 0.6, 1.6), new THREE.MeshLambertMaterial({ color: 0x8a6d4b })); pier.position.set(-4.5, 0, 0); harbour.add(pier);
  const hall = new THREE.Mesh(new THREE.BoxGeometry(3, 2.4, 3), new THREE.MeshLambertMaterial({ color: 0xe9e2d0 })); hall.position.set(1.5, 1.2, 0); harbour.add(hall);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(2.4, 1.4, 4), new THREE.MeshLambertMaterial({ color: 0xb4442f })); roof.position.set(1.5, 3.1, 0); roof.rotation.y = Math.PI / 4; harbour.add(roof);
  const boat = new THREE.Group();
  const hull = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.6, 1), new THREE.MeshLambertMaterial({ color: 0x1c6b74 })); boat.add(hull);
  const sail = new THREE.Mesh(new THREE.ConeGeometry(0.8, 2.2, 3), new THREE.MeshLambertMaterial({ color: 0xffffff })); sail.position.y = 1.4; boat.add(sail);
  scene.add(harbour, boat);
  stations.push({ u: { id: "exam", title: "Official exam", month: "Jun", n: 11 }, g: harbour, state: "exam", pos: new THREE.Vector3(xJ + 1.5, 4.5, zJ) });

  // the boat sails ahead of the student's progress
  const doneCount = stations.filter((s) => s.state === "done").length;
  const target = stations[Math.min(doneCount, n - 1)];
  boat.position.set(target.g.position.x - 8, 0.4, target.g.position.z - 3);

  /* ---- stars at night ---- */
  const starGeo = new THREE.BufferGeometry(); const st = [];
  for (let i = 0; i < 400; i++) st.push((Math.random() - 0.5) * 300, 40 + Math.random() * 60, (Math.random() - 0.5) * 300);
  starGeo.setAttribute("position", new THREE.Float32BufferAttribute(st, 3));
  const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.6, sizeAttenuation: true }));
  scene.add(stars);

  function applyTheme() {
    const night = dark();
    scene.background = new THREE.Color(night ? 0x0b1624 : 0xcfe6ea);
    scene.fog = new THREE.Fog(night ? 0x0b1624 : 0xcfe6ea, 70, 170);
    hemi.color.set(night ? 0x6a7fa8 : 0xffffff); hemi.groundColor.set(night ? 0x0b1624 : 0x6b7c88); hemi.intensity = night ? 0.85 : 1.0;
    sun.color.set(night ? 0x9fb4d8 : 0xffe2b8); sun.intensity = night ? 0.6 : 1.25;
    seaMat.color.set(night ? 0x1f5873 : 0x2a8a96);
    stars.visible = night;
  }
  applyTheme();
  window.addEventListener("egp-theme", applyTheme);
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", applyTheme);

  /* ---- labels: HTML, positioned by projection, clickable ---- */
  const labels = stations.map((s) => {
    const live = s.u.status === "live" || s.state === "exam";
    const a = document.createElement(s.u.href ? "a" : "span");
    a.className = "jl jl-" + s.state; if (s.u.href) a.href = s.u.href;
    a.innerHTML = '<b>' + (s.state === "exam" ? "June" : s.u.month + " " + s.u.n) + '</b><span class="full"> ' + (s.state === "exam" ? "Official exam" : s.u.title) + "</span>" + (s.state === "done" ? " ✓" : "");
    if (!live) a.setAttribute("aria-disabled", "true");
    a.title = s.state === "exam" ? "Official exam, June" : s.u.n + ". " + s.u.title;
    a.tabIndex = -1; // keyboard users get the list below; labels are visual
    labelsHost.appendChild(a); return a;
  });

  /* ---- camera: glide along the coast; drag or arrow keys to travel ---- */
  const focusIdx = Math.max(0, stations.indexOf(target));
  let camZ = stations[focusIdx].pos.z + 8, goalZ = camZ;
  const minZ = stations[0].pos.z + 10, maxZ = stations[stations.length - 1].pos.z - 8;
  const clampZ = (z) => Math.max(minZ, Math.min(maxZ, z));
  let dragging = false, lastX = 0, lastY = 0;
  const el = renderer.domElement;
  el.style.touchAction = "pan-y";
  el.addEventListener("pointerdown", (e) => { dragging = true; lastX = e.clientX; lastY = e.clientY; });
  window.addEventListener("pointerup", () => (dragging = false));
  window.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX; lastX = e.clientX; lastY = e.clientY;
    goalZ = clampZ(goalZ - dx * 0.12);
  });
  host.addEventListener("wheel", (e) => { if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) { goalZ = clampZ(goalZ + e.deltaX * 0.05); e.preventDefault(); } }, { passive: false });
  opts.onTravel && opts.onTravel((dir) => { goalZ = clampZ(goalZ + dir * 18); });

  function resize() {
    const w = host.clientWidth, h = host.clientHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h;
    camera.fov = w < 600 ? 55 : 42; camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(host); resize();

  let visible = true;
  new IntersectionObserver((en) => (visible = en[0].isIntersecting)).observe(host);
  const v = new THREE.Vector3(); const clock = new THREE.Clock();
  function frame() {
    requestAnimationFrame(frame);
    if (!visible || document.hidden) return;
    const t = clock.getElapsedTime();
    camZ += (goalZ - camZ) * 0.08;
    const narrow = host.clientWidth < 600;
    camera.position.set(narrow ? -40 : -46, narrow ? 26 : 24, camZ);
    camera.lookAt(coastX(camZ) + (narrow ? 6 : 9), 1, camZ);
    if (!reduce) {
      for (let i = 0; i < sp.count; i++) {
        const x = base[i * 3], z = base[i * 3 + 2];
        sp.setY(i, 0.35 * Math.sin(x * 0.25 + t * 1.1) + 0.25 * Math.cos(z * 0.3 + t * 0.8));
      }
      sp.needsUpdate = true;
      stations.forEach((s) => { if (s.beam) s.beam.rotation.y = t * 0.9; });
      boat.position.y = 0.4 + Math.sin(t * 1.5) * 0.15; boat.rotation.z = Math.sin(t * 1.2) * 0.05;
    }
    renderer.render(scene, camera);
    const w = host.clientWidth, h = host.clientHeight;
    stations.forEach((s, i) => {
      v.copy(s.pos).project(camera);
      const lab = labels[i];
      const on = v.z < 1 && v.x > -1.1 && v.x < 1.1 && v.y > -1 && v.y < 1.1;
      lab.style.display = on ? "" : "none";
      if (on) lab.style.transform = "translate(" + ((v.x * 0.5 + 0.5) * w).toFixed(1) + "px," + ((-v.y * 0.5 + 0.5) * h).toFixed(1) + "px) translate(-50%,-100%)";
    });
  }
  frame();
}
