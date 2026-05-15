// three-viz.js  —  WebGL 3D Utility Surface via Three.js
// Loaded as <script type="module"> so we can use ES imports

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ── Color helpers ─────────────────────────────────────────────
// Berkeley blue → Berkeley gold gradient mapped to utility height
function utilityColor(t) {
  // t ∈ [0,1]  low=blue(0,50,98)  high=gold(253,181,21)
  return [
    t * (253/255) + (1-t) * (0/255),
    t * (181/255) + (1-t) * (50/255),
    t * (21/255)  + (1-t) * (98/255),
  ];
}

// ── Build the surface geometry for u(x,y) = x^α y^(1-α) ──────
function buildSurfaceGeometry(alpha, N = 55) {
  const xMin = 0.05, xMax = 7;
  const yMin = 0.05, yMax = 7;

  const count = (N + 1) * (N + 1);
  const positions = new Float32Array(count * 3);
  const colors    = new Float32Array(count * 3);
  const normals   = new Float32Array(count * 3); // will be computed
  const indices   = [];

  // First pass: collect z values for normalization
  const zVals = new Float32Array(count);
  let zMin = Infinity, zMax = -Infinity;
  for (let i = 0; i <= N; i++) {
    const x = xMin + (i / N) * (xMax - xMin);
    for (let j = 0; j <= N; j++) {
      const y = yMin + (j / N) * (yMax - yMin);
      const z = Math.pow(x, alpha) * Math.pow(y, 1 - alpha);
      const k = i * (N + 1) + j;
      zVals[k] = z;
      if (z < zMin) zMin = z;
      if (z > zMax) zMax = z;
    }
  }

  // Second pass: fill geometry
  for (let i = 0; i <= N; i++) {
    const x = xMin + (i / N) * (xMax - xMin);
    for (let j = 0; j <= N; j++) {
      const y = yMin + (j / N) * (yMax - yMin);
      const k = i * (N + 1) + j;
      const z = zVals[k];
      const t = (z - zMin) / (zMax - zMin);

      // Map to scene: x→x-axis, z→up, y→z-axis (depth)
      positions[k * 3 + 0] = x - (xMax + xMin) / 2;
      positions[k * 3 + 1] = t * 3.5;   // height scaled to [0, 3.5]
      positions[k * 3 + 2] = y - (yMax + yMin) / 2;

      const [r, g, b] = utilityColor(t);
      colors[k * 3 + 0] = r;
      colors[k * 3 + 1] = g;
      colors[k * 3 + 2] = b;
    }
  }

  // Build triangle indices
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      const a = i * (N + 1) + j;
      const b = a + 1;
      const c = a + (N + 1);
      const d = c + 1;
      indices.push(a, b, c, b, d, c);
    }
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geom.setAttribute('color',    new THREE.BufferAttribute(colors, 3));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  return geom;
}

// ── Build a budget-plane for p_x*x + p_y*y = m ───────────────
function buildBudgetPlane(px, py, m, N = 40) {
  // The plane lives in the (x, y) floor of our scene coordinate system.
  // We'll render it as a translucent mesh at a fixed z height, clipped to the box.
  const xMax = 7, yMax = 7;
  const bx = Math.min(m / px, xMax);   // x-intercept
  const by = Math.min(m / py, yMax);   // y-intercept

  // Create a filled triangle fan from origin → (bx,0) → (0,by)
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(bx - 3.5, 0);
  shape.lineTo(0, by - 3.5);
  shape.closePath();

  const geom = new THREE.ShapeGeometry(shape, 1);
  // Rotate flat shape to lie in the xz-plane (our "floor")
  geom.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI / 2));

  return geom;
}

// ── Build indifference level-curve lines at fixed u values ────
function buildLevelCurveLines(alpha, levels, scene, groupRef) {
  if (groupRef.current) scene.remove(groupRef.current);
  const group = new THREE.Group();
  const xMin = 0.05, xMax = 7, yMin = 0.05, yMax = 7;

  // Re-derive zMin/zMax quickly
  let zMin = Infinity, zMax = -Infinity;
  for (let i = 0; i <= 40; i++) {
    const x = xMin + (i / 40) * (xMax - xMin);
    for (let j = 0; j <= 40; j++) {
      const y = yMin + (j / 40) * (yMax - yMin);
      const z = Math.pow(x, alpha) * Math.pow(y, 1 - alpha);
      if (z < zMin) zMin = z;
      if (z > zMax) zMax = z;
    }
  }

  levels.forEach(u => {
    const pts = [];
    // Parametrize by x; solve y = (u / x^alpha)^(1/(1-alpha))
    for (let i = 0; i <= 120; i++) {
      const x = xMin + (i / 120) * (xMax - xMin);
      const y = Math.pow(u / Math.pow(x, alpha), 1 / (1 - alpha));
      if (y < yMin || y > yMax) continue;
      const z = Math.pow(x, alpha) * Math.pow(y, 1 - alpha);
      const t = (z - zMin) / (zMax - zMin);
      pts.push(new THREE.Vector3(
        x - (xMax + xMin) / 2,
        t * 3.5,
        y - (yMax + yMin) / 2
      ));
    }
    if (pts.length < 2) return;
    const geom = new THREE.BufferGeometry().setFromPoints(pts);
    const mat  = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 1.5, transparent: true, opacity: 0.5 });
    group.add(new THREE.Line(geom, mat));
  });

  scene.add(group);
  groupRef.current = group;
}

// ── Main init ─────────────────────────────────────────────────
export function initUtilitySurface(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const W = container.clientWidth || 620;
  const H = 380;

  // Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x001020, 1);
  renderer.shadowMap.enabled = false;
  container.appendChild(renderer.domElement);

  // Scene
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x001020, 0.045);

  // Camera
  const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 60);
  camera.position.set(9, 8, 10);
  camera.lookAt(0, 1.5, 0);

  // Controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.minDistance = 6;
  controls.maxDistance = 24;
  controls.target.set(0, 1.5, 0);

  // Lighting
  scene.add(new THREE.AmbientLight(0xaaccff, 0.45));
  const sun = new THREE.DirectionalLight(0xffffff, 0.9);
  sun.position.set(5, 12, 6);
  scene.add(sun);
  const goldLight = new THREE.PointLight(0xFDB515, 1.2, 18);
  goldLight.position.set(-4, 6, -3);
  scene.add(goldLight);

  // Grid (floor)
  const grid = new THREE.GridHelper(14, 14, 0x1a3355, 0x112244);
  grid.position.y = -0.05;
  scene.add(grid);

  // Axis labels (simple lines)
  const axMat = new THREE.LineBasicMaterial({ color: 0x88aacc });
  const makeAxis = (from, to) => {
    const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...from), new THREE.Vector3(...to)]);
    return new THREE.Line(g, axMat);
  };
  scene.add(makeAxis([-3.5, -0.05, -3.5], [4, -0.05, -3.5]));  // x-axis
  scene.add(makeAxis([-3.5, -0.05, -3.5], [-3.5, -0.05, 4]));  // y-axis (z in scene)
  scene.add(makeAxis([-3.5, -0.05, -3.5], [-3.5, 4, -3.5]));   // z-axis (utility)

  // State
  let alpha = 0.5, px = 2, py = 1, m = 10;
  const meshRef   = { current: null };
  const budgetRef = { current: null };
  const optRef    = { current: null };
  const lcRef     = { current: null };

  function rebuild() {
    // Surface
    if (meshRef.current) scene.remove(meshRef.current);
    const geom = buildSurfaceGeometry(alpha);
    const mat  = new THREE.MeshPhongMaterial({
      vertexColors: true,
      side: THREE.DoubleSide,
      shininess: 80,
      transparent: true,
      opacity: 0.82,
    });
    meshRef.current = new THREE.Mesh(geom, mat);
    scene.add(meshRef.current);

    // Budget plane
    if (budgetRef.current) scene.remove(budgetRef.current);
    const bGeom = buildBudgetPlane(px, py, m);
    const bMat  = new THREE.MeshBasicMaterial({ color: 0x00ff88, transparent: true, opacity: 0.18, side: THREE.DoubleSide });
    budgetRef.current = new THREE.Mesh(bGeom, bMat);
    budgetRef.current.position.y = -0.02;
    scene.add(budgetRef.current);

    // Optimal point
    if (optRef.current) scene.remove(optRef.current);
    const xStar = alpha * m / px;
    const yStar = (1 - alpha) * m / py;
    const uStar = Math.pow(xStar, alpha) * Math.pow(yStar, 1 - alpha);
    // Find scene y-coordinate for uStar by re-deriving normalization
    const uMin  = Math.pow(0.05, alpha) * Math.pow(0.05, 1 - alpha);
    const uMax  = Math.pow(7, alpha) * Math.pow(7, 1 - alpha);
    const tOpt  = (uStar - uMin) / (uMax - uMin);
    const sx = xStar - 3.525, sz = yStar - 3.525, sy = tOpt * 3.5;
    const sGeom = new THREE.SphereGeometry(0.14, 16, 16);
    const sMat  = new THREE.MeshPhongMaterial({ color: 0xff4444, emissive: 0x661111, shininess: 120 });
    optRef.current = new THREE.Mesh(sGeom, sMat);
    optRef.current.position.set(sx, sy, sz);
    scene.add(optRef.current);

    // Vertical line from optimal point to floor
    const vGeom = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(sx, -0.02, sz),
      new THREE.Vector3(sx, sy, sz),
    ]);
    const vLine = new THREE.Line(vGeom, new THREE.LineBasicMaterial({ color: 0xff4444, transparent: true, opacity: 0.5 }));
    scene.add(vLine);

    // Level curves at u = uStar * [0.3, 0.55, 0.75, 1.0, 1.3, 1.6]
    const levels = [0.3, 0.55, 0.75, 1.0, 1.3, 1.6].map(f => uStar * f).filter(u => u > 0.01 && u < uMax * 0.98);
    buildLevelCurveLines(alpha, levels, scene, lcRef);
  }

  rebuild();

  // Expose update function to window for slider wiring
  window._three_updateSurface = (a, p_x, p_y, inc) => {
    alpha = a; px = p_x; py = p_y; m = inc;
    rebuild();
  };

  // Animate
  let raf;
  function animate() {
    raf = requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  // Resize
  const ro = new ResizeObserver(() => {
    const W2 = container.clientWidth;
    renderer.setSize(W2, H);
    camera.aspect = W2 / H;
    camera.updateProjectionMatrix();
  });
  ro.observe(container);
}

// Auto-init when DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initUtilitySurface('three-canvas');
});
