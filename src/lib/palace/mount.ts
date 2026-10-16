import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { PARTS, type PartInfo } from "@/lib/palace/parts";

export type PalaceHandle = {
  setView: (id: string) => void;
  setTime: (id: "morning" | "noon" | "evening" | string) => void;
  dispose: () => void;
};

export type PalaceHooks = {
  onHover?: (part: PartInfo | null) => void;
  onSelect?: (part: PartInfo | null) => void;
};

type V3 = [number, number, number];

const PRESETS: Record<string, { pos: V3; target: V3 }> = {
  approach: { pos: [46, 22, 44], target: [8, 14, 5] },
  gallery: { pos: [2, 15.2, 27], target: [8, 17.2, 6] },
  rani: { pos: [-9.7, 8.55, -3.35], target: [-1.7, 3.05, -0.15] },
  dome: { pos: [-7.55, 4.35, -8.95], target: [-7.6, 9.2, -9.55] },
  cliff: { pos: [-58, 32, -6], target: [10, 6, 78] },
  court: { pos: [2, 7.5, 16], target: [0, 3, -8] },
  diwan: { pos: [1, 3.4, -8], target: [0, 2.6, -16] },
  aerial: { pos: [28, 78, 62], target: [6, 8, -18] },
  sunrise: { pos: [28, 16, 48], target: [8, 12, 4] },
  zenana: { pos: [-2, 8, -24], target: [-4, 3, -34] },
  bastion: { pos: [42, 10, 40], target: [20, 8, 18] },
  stambh: { pos: [78, 24, -28], target: [53, 16, -48] },
};

const COURT = 1.55;
const ALPHA = 0.45;

function slopeY(z: number) {
  return -29 + (93 - z) * Math.tan(ALPHA);
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function canvasTex(draw: (g: CanvasRenderingContext2D, s: number) => void, size: number, repeat = true) {
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const g = c.getContext("2d");
  if (!g) throw new Error("canvas");
  draw(g, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  if (repeat) {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
  }
  return tex;
}

function makeMaps() {
  const rng = mulberry32(11);
  const plaster = canvasTex((g, s) => {
    g.fillStyle = "#f0e2c8";
    g.fillRect(0, 0, s, s);
    for (let i = 0; i < 80; i++) {
      g.globalAlpha = 0.18 + rng() * 0.25;
      g.fillStyle = rng() > 0.5 ? "#d7c4a4" : "#fff6e6";
      g.beginPath();
      g.ellipse(rng() * s, rng() * s, 20 + rng() * 70, 8 + rng() * 24, rng() * 3, 0, Math.PI * 2);
      g.fill();
    }
    g.globalAlpha = 0.35;
    g.strokeStyle = "#b9a488";
    g.lineWidth = 1;
    for (let i = 0; i < 18; i++) {
      g.beginPath();
      g.moveTo(rng() * s, rng() * s);
      g.lineTo(rng() * s, rng() * s);
      g.stroke();
    }
    g.globalAlpha = 1;
  }, 512);

  const ashlar = canvasTex((g, s) => {
    g.fillStyle = "#e7d7be";
    g.fillRect(0, 0, s, s);
    const rh = 36;
    for (let y = 0; y < s; y += rh) {
      const off = (y / rh) % 2 === 0 ? 0 : 28;
      for (let x = -40 + off; x < s; x += 78) {
        const shade = 210 + Math.floor(rng() * 30);
        g.fillStyle = `rgb(${shade}, ${shade - 18}, ${shade - 40})`;
        g.fillRect(x + 1, y + 1, 74, rh - 3);
      }
    }
  }, 512);

  const masonry = canvasTex((g, s) => {
    g.fillStyle = "#c4b49a";
    g.fillRect(0, 0, s, s);
    for (let i = 0; i < 110; i++) {
      const tone = rng();
      g.fillStyle = tone < 0.28 ? "#8e877c" : tone < 0.5 ? "#d2c3ae" : tone < 0.72 ? "#a88470" : "#b7a48e";
      const x = rng() * s;
      const y = rng() * s;
      const w = 26 + rng() * 74;
      const h = 14 + rng() * 32;
      g.fillRect(x, y, w, h);
      g.strokeStyle = "rgba(48,38,28,0.45)";
      g.strokeRect(x, y, w, h);
    }
  }, 512);

  const rubble = canvasTex((g, s) => {
    g.fillStyle = "#b7a48c";
    g.fillRect(0, 0, s, s);
    for (let i = 0; i < 70; i++) {
      const tone = rng();
      g.fillStyle = tone < 0.33 ? "#9a8b78" : tone < 0.66 ? "#cbb89a" : "#8d6d5c";
      g.beginPath();
      const x = rng() * s;
      const y = rng() * s;
      g.moveTo(x, y);
      for (let k = 0; k < 5; k++) g.lineTo(x + rng() * 80 - 10, y + rng() * 48 - 8);
      g.closePath();
      g.fill();
      g.strokeStyle = "rgba(40,32,24,0.4)";
      g.stroke();
    }
  }, 512);

  const floor = canvasTex((g, s) => {
    g.fillStyle = "#6e6a64";
    g.fillRect(0, 0, s, s);
    const rows = 4;
    for (let r = 0; r < rows; r++) {
      const y0 = (r * s) / rows + 4;
      const h = s / rows - 10;
      let x = r % 2 === 0 ? 2 : -70;
      while (x < s) {
        const w = s / 5 + (rng() * 44 - 14);
        const shade = 176 + Math.floor(rng() * 28);
        const warm = Math.floor(rng() * 18) - 4;
        g.fillStyle = `rgb(${Math.min(196, shade + warm)}, ${shade - 2}, ${shade - 14})`;
        const drawX = x + 5;
        const drawW = Math.min(w - 10, s - drawX - 2);
        if (drawW > 16 && drawX < s - 8) {
          g.fillRect(drawX, y0 + rng() * 5, drawW, h - rng() * 7);
        }
        x += w;
      }
    }
  }, 512);
  floor.anisotropy = 8;

  const courtRng = mulberry32(9);
  const court = canvasTex((g, s) => {
    g.fillStyle = "#8a8680";
    g.fillRect(0, 0, s, s);
    const palette = ["#b4bcc2", "#97a1a8", "#c8c2b4", "#7e8b92", "#d4cfc2", "#6d797f", "#a9b3b8", "#8c8478"];
    let y = 2;
    let row = 0;
    while (y < s - 4) {
      const h = s * (0.32 + courtRng() * 0.14);
      let x = -courtRng() * s * 0.35 - (row % 2) * s * (0.28 + courtRng() * 0.1);
      while (x < s) {
        const w = s * (0.34 + courtRng() * 0.28);
        const pad = 3 + courtRng() * 4;
        const x0 = x + pad;
        const y0 = y + pad * 0.45;
        const ww = w - pad * 1.35;
        const hh = h - pad;
        if (ww > 28 && hh > 24 && x0 < s - 4 && y0 < s - 4) {
          g.fillStyle = palette[Math.floor(courtRng() * palette.length)];
          g.fillRect(x0, y0, Math.min(ww, s - x0 - 2), Math.min(hh, s - y0 - 2));
          g.fillStyle = "rgba(255,255,255,0.08)";
          g.fillRect(x0, y0, Math.min(ww, s - x0 - 2) * 0.28, Math.min(hh, s - y0 - 2) * 0.55);
        }
        x += w;
      }
      y += h;
      row++;
    }
  }, 1024);
  court.anisotropy = 8;
  court.generateMipmaps = false;
  court.minFilter = THREE.LinearFilter;
  court.magFilter = THREE.LinearFilter;

  const jali = canvasTex((g, s) => {
    g.fillStyle = "#f3e6d0";
    g.fillRect(0, 0, s, s);
    g.globalCompositeOperation = "destination-out";
    for (let y = 10; y < s; y += 18) {
      for (let x = 10; x < s; x += 18) {
        g.beginPath();
        g.arc(x, y, 4.5, 0, Math.PI * 2);
        g.fill();
      }
    }
  }, 128);
  jali.repeat.set(2, 3);

  const frescoRng = mulberry32(17);
  const frescoCanvas = document.createElement("canvas");
  frescoCanvas.width = 1024;
  frescoCanvas.height = 1024;
  const fg = frescoCanvas.getContext("2d");
  if (!fg) throw new Error("fresco");
  const S = 1024;
  const cx = S / 2;
  const cy = S / 2;
  fg.fillStyle = "#c4a06a";
  fg.fillRect(0, 0, S, S);
  const rings = [470, 410, 340, 270, 200, 140, 80];
  const ringCols = ["#7a4e34", "#d9c298", "#9a6844", "#f0e0bc", "#8c5a3c", "#e7d3a8", "#a67c52"];
  rings.forEach((rad, i) => {
    fg.beginPath();
    fg.arc(cx, cy, rad, 0, Math.PI * 2);
    fg.fillStyle = ringCols[i];
    fg.fill();
  });
  fg.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 - Math.PI / 8;
    const x = cx + Math.cos(a) * 300;
    const y = cy + Math.sin(a) * 300;
    if (i === 0) fg.moveTo(x, y);
    else fg.lineTo(x, y);
  }
  fg.closePath();
  fg.strokeStyle = "#f3e6c8";
  fg.lineWidth = 10;
  fg.stroke();
  fg.strokeStyle = "#6b4228";
  fg.lineWidth = 4;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    fg.beginPath();
    fg.moveTo(cx + Math.cos(a) * 56, cy + Math.sin(a) * 56);
    fg.lineTo(cx + Math.cos(a) * 430, cy + Math.sin(a) * 430);
    fg.stroke();
  }
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    fg.save();
    fg.translate(cx + Math.cos(a) * 210, cy + Math.sin(a) * 210);
    fg.rotate(a);
    fg.beginPath();
    fg.ellipse(0, 0, 46, 28, 0, 0, Math.PI * 2);
    fg.fillStyle = "#e6d2a4";
    fg.fill();
    fg.strokeStyle = "#5c3a28";
    fg.lineWidth = 3;
    fg.stroke();
    fg.beginPath();
    fg.moveTo(0, -16);
    fg.lineTo(10, 0);
    fg.lineTo(0, 16);
    fg.lineTo(-10, 0);
    fg.closePath();
    fg.fillStyle = "#8c3d2a";
    fg.fill();
    fg.restore();
  }
  fg.beginPath();
  fg.arc(cx, cy, 54, 0, Math.PI * 2);
  fg.fillStyle = "#f3e6c8";
  fg.fill();
  fg.beginPath();
  fg.arc(cx, cy, 18, 0, Math.PI * 2);
  fg.fillStyle = "#c4a06a";
  fg.fill();
  fg.beginPath();
  fg.arc(cx, cy, 8, 0, Math.PI * 2);
  fg.fillStyle = "#f3e6c8";
  fg.fill();
  fg.globalAlpha = 0.28;
  for (let i = 0; i < 36; i++) {
    const x = frescoRng() * S;
    const y = frescoRng() * S;
    if (Math.hypot(x - cx, y - cy) < 70) continue;
    fg.fillStyle = frescoRng() > 0.5 ? "#6a5344" : "#efe6d4";
    fg.beginPath();
    fg.ellipse(x, y, 12 + frescoRng() * 36, 8 + frescoRng() * 16, frescoRng() * 3, 0, Math.PI * 2);
    fg.fill();
  }
  fg.globalAlpha = 1;
  const fresco = new THREE.CanvasTexture(frescoCanvas);
  fresco.colorSpace = THREE.SRGBColorSpace;
  fresco.anisotropy = 8;

  const carveRng = mulberry32(23);
  const carveCanvas = document.createElement("canvas");
  carveCanvas.width = 512;
  carveCanvas.height = 512;
  const cg = carveCanvas.getContext("2d");
  const heightCanvas = document.createElement("canvas");
  heightCanvas.width = 512;
  heightCanvas.height = 512;
  const hg = heightCanvas.getContext("2d");
  if (!cg || !hg) throw new Error("carve");
  const paintCarve = (g: CanvasRenderingContext2D, color: boolean) => {
    const s = 512;
    g.fillStyle = color ? "#e6d2b4" : "#b4b4b4";
    g.fillRect(0, 0, s, s);
    const rows = 4;
    for (let row = 0; row < rows; row++) {
      const band = s / rows;
      const y = row * band;
      g.fillStyle = color ? (row % 2 ? "#d9c4a4" : "#c9b08e") : row % 2 ? "#c8c8c8" : "#a0a0a0";
      g.fillRect(0, y + 2, s, band - 4);
      g.strokeStyle = color ? "#6d5340" : "#404040";
      g.lineWidth = 3;
      g.strokeRect(2, y + 3, s - 4, band - 6);
      for (let i = 0; i < 4; i++) {
        const x = (i + 0.5) * (s / 4);
        const nw = 78;
        const nh = band * 0.7;
        const y0 = y + band * 0.16;
        g.fillStyle = color ? "#a88462" : "#6a6a6a";
        g.fillRect(x - nw / 2, y0, nw, nh);
        g.fillStyle = color ? "#7a5a3c" : "#3a3a3a";
        g.beginPath();
        g.arc(x, y0 + nh * 0.62, 24, Math.PI, 0);
        g.fill();
        g.fillStyle = color ? "#f3e6d0" : "#f2f2f2";
        g.fillRect(x - 7, y0 + nh * 0.34, 14, nh * 0.4);
        g.beginPath();
        g.arc(x, y0 + nh * 0.28, 8, 0, Math.PI * 2);
        g.fill();
        if (color && carveRng() > 0.4) {
          g.strokeStyle = "rgba(90,60,40,0.35)";
          g.strokeRect(x - nw / 2 - 6, y0 - 4, nw + 12, nh + 8);
        }
      }
    }
  };
  paintCarve(cg, true);
  paintCarve(hg, false);
  const carve = new THREE.CanvasTexture(carveCanvas);
  carve.colorSpace = THREE.SRGBColorSpace;
  carve.wrapS = THREE.RepeatWrapping;
  carve.wrapT = THREE.RepeatWrapping;
  carve.anisotropy = 8;
  const hData = hg.getImageData(0, 0, 512, 512).data;
  const normalCanvas = document.createElement("canvas");
  normalCanvas.width = 512;
  normalCanvas.height = 512;
  const ng = normalCanvas.getContext("2d");
  if (!ng) throw new Error("normal");
  const nImg = ng.createImageData(512, 512);
  const sample = (x: number, y: number) => hData[(((y + 512) % 512) * 512 + ((x + 512) % 512)) * 4] / 255;
  for (let y = 0; y < 512; y++) {
    for (let x = 0; x < 512; x++) {
      const dx = sample(x + 1, y) - sample(x - 1, y);
      const dy = sample(x, y + 1) - sample(x, y - 1);
      const nx = -dx * 2.4;
      const ny = -dy * 2.4;
      const nz = 1;
      const len = Math.hypot(nx, ny, nz);
      const i = (y * 512 + x) * 4;
      nImg.data[i] = (nx / len) * 127 + 128;
      nImg.data[i + 1] = (ny / len) * 127 + 128;
      nImg.data[i + 2] = (nz / len) * 127 + 128;
      nImg.data[i + 3] = 255;
    }
  }
  ng.putImageData(nImg, 0, 0);
  const carveN = new THREE.CanvasTexture(normalCanvas);
  carveN.colorSpace = THREE.NoColorSpace;
  carveN.wrapS = THREE.RepeatWrapping;
  carveN.wrapT = THREE.RepeatWrapping;

  return { plaster, ashlar, masonry, rubble, floor, court, jali, fresco, carve, carveN };
}

type Col = { x: number; y: number; z: number; s: number; h: number };
type Mer = { x: number; y: number; z: number };

export function mountPalace(
  canvas: HTMLCanvasElement,
  onReady: () => void,
  hooks: PalaceHooks = {},
): PalaceHandle {
  const maps = makeMaps();
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x9ec8e4);
  scene.fog = new THREE.Fog(0xb5d0de, 120, 420);

  const camera = new THREE.PerspectiveCamera(48, 1, 0.25, 520);
  camera.position.set(52, 18, 46);
  camera.lookAt(4, 8, 6);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.04;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.BasicShadowMap;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  const hemi = new THREE.HemisphereLight(0x9ec8e4, 0xc4a06a, 0.62);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff1d6, 2.05);
  sun.position.set(42, 52, 18);
  sun.castShadow = true;
  sun.shadow.mapSize.set(512, 512);
  sun.shadow.camera.near = 2;
  sun.shadow.camera.far = 180;
  sun.shadow.camera.left = -80;
  sun.shadow.camera.right = 80;
  sun.shadow.camera.top = 80;
  sun.shadow.camera.bottom = -80;
  sun.shadow.bias = -0.00035;
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0xfff4e0, 0.32);
  fill.position.set(-28, 22, -16);
  scene.add(fill);
  const well = new THREE.DirectionalLight(0xfff6e8, 1.65);
  well.position.set(-6, 40, -1);
  well.target.position.set(-6, 0, -1);
  well.castShadow = false;
  scene.add(well);
  scene.add(well.target);
  const courtFill = new THREE.DirectionalLight(0xfff6e8, 0.55);
  courtFill.position.set(-18, 11, 0);
  courtFill.target.position.set(2, 5, 0);
  courtFill.castShadow = false;
  scene.add(courtFill);
  scene.add(courtFill.target);
  const southFill = new THREE.DirectionalLight(0xfff4e0, 0.55);
  southFill.position.set(8, 20, 40);
  southFill.target.position.set(8, 14, 8);
  southFill.castShadow = false;
  scene.add(southFill);
  scene.add(southFill.target);

  const matPlaster = new THREE.MeshStandardMaterial({ map: maps.plaster, roughness: 0.92, metalness: 0 });
  const matAshlar = new THREE.MeshStandardMaterial({ map: maps.ashlar, roughness: 0.86, metalness: 0 });
  const matMasonry = new THREE.MeshStandardMaterial({ map: maps.masonry, roughness: 0.94, metalness: 0 });
  const matMasonryFlat = matMasonry.clone();
  matMasonryFlat.flatShading = true;
  const matRubble = new THREE.MeshStandardMaterial({ map: maps.rubble, roughness: 1, metalness: 0 });
  const matFloor = new THREE.MeshStandardMaterial({ map: maps.floor, roughness: 0.96, metalness: 0 });
  const matCourt = new THREE.MeshStandardMaterial({ map: maps.court, roughness: 0.93, metalness: 0 });
  matCourt.emissive = new THREE.Color(0x6a6660);
  matCourt.emissiveIntensity = 0.07;
  const matField = new THREE.MeshStandardMaterial({ color: 0x9a8658, roughness: 1 });
  const matFoliage = new THREE.MeshStandardMaterial({ color: 0x4e6738, roughness: 1 });
  const matLawn = new THREE.MeshStandardMaterial({
    color: 0x4caf3a,
    roughness: 0.9,
    metalness: 0,
    emissive: 0x1a4c16,
    emissiveIntensity: 0.22,
  });
  const matTownA = new THREE.MeshStandardMaterial({ color: 0xc4b49a, roughness: 1 });
  const matTownB = new THREE.MeshStandardMaterial({ color: 0xa36a52, roughness: 1 });
  const matTownC = new THREE.MeshStandardMaterial({ color: 0x8e8a86, roughness: 1 });
  const matEarth = new THREE.MeshStandardMaterial({ color: 0xa24b32, roughness: 1 });
  const matValley = new THREE.MeshStandardMaterial({ color: 0x6a7a4a, roughness: 1 });
  const matLoggia = new THREE.MeshStandardMaterial({ color: 0x7a624c, roughness: 1 });
  const matDark = new THREE.MeshStandardMaterial({ color: 0x2c241c, roughness: 1 });
  const matDado = new THREE.MeshStandardMaterial({ color: 0x8c3d2a, roughness: 0.78 });
  const matWood = new THREE.MeshStandardMaterial({ color: 0x6b4226, roughness: 0.8 });
  const matJali = new THREE.MeshStandardMaterial({
    map: maps.jali,
    alphaTest: 0.45,
    roughness: 0.7,
    side: THREE.DoubleSide,
    color: 0xf3e6d0,
  });
  const matCarve = new THREE.MeshStandardMaterial({
    map: maps.carve,
    normalMap: maps.carveN,
    normalScale: new THREE.Vector2(1.15, 1.15),
    roughness: 0.74,
    metalness: 0,
  });
  const matFresco = new THREE.MeshBasicMaterial({
    map: maps.fresco,
    side: THREE.DoubleSide,
    toneMapped: false,
  });
  const matSky = new THREE.MeshBasicMaterial({ color: 0xc5def0, side: THREE.DoubleSide });

  const cols: Col[] = [];
  const merlons: Mer[] = [];

  function bakeBox(w: number, h: number, d: number, ox = 0, oy = 0, oz = 0) {
    const geo = new THREE.BoxGeometry(w, h, d).toNonIndexed();
    const pos = geo.getAttribute("position") as THREE.BufferAttribute;
    const uv = geo.getAttribute("uv") as THREE.BufferAttribute;
    for (let f = 0; f < 6; f++) {
      for (let i = 0; i < 6; i++) {
        const vi = f * 6 + i;
        const px = pos.getX(vi);
        const py = pos.getY(vi);
        const pz = pos.getZ(vi);
        let u = px;
        let v = py;
        if (f < 2) {
          u = py + oy;
          v = pz + oz;
        } else if (f < 4) {
          u = px + ox;
          v = pz + oz;
        } else {
          u = px + ox;
          v = py + oy;
        }
        uv.setXY(vi, u / 2.4, v / 2.4);
      }
    }
    return geo;
  }

  function addBox(x: number, y: number, z: number, w: number, h: number, d: number, mat: THREE.Material) {
    const mesh = new THREE.Mesh(bakeBox(w, h, d, x, y, z), mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = w * h * d > 40;
    mesh.receiveShadow = true;
    scene.add(mesh);
    return mesh;
  }

  function localBox(mat: THREE.Material, x: number, y: number, z: number, w: number, h: number, d: number) {
    const mesh = new THREE.Mesh(bakeBox(w, h, d), mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = false;
    mesh.receiveShadow = true;
    return mesh;
  }

  function addFloor(x: number, y: number, z: number, w: number, d: number, mat: THREE.Material) {
    const geo = new THREE.PlaneGeometry(w, d);
    const uv = geo.getAttribute("uv") as THREE.BufferAttribute;
    for (let i = 0; i < uv.count; i++) {
      uv.setXY(i, (uv.getX(i) - 0.5) * (w / 6.4), (uv.getY(i) - 0.5) * (d / 6.4));
    }
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(x, y, z);
    mesh.receiveShadow = true;
    scene.add(mesh);
    return mesh;
  }

  function addDome(
    x: number,
    y: number,
    z: number,
    r: number,
    mat: THREE.Material,
    crenel = true,
    pierce = true,
  ) {
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 14, 0, Math.PI * 2, 0, Math.PI * 0.48), mat);
    bulb.scale.set(r * 0.9, r * 0.78, r * 0.9);
    bulb.position.set(x, y + r * 0.42, z);
    bulb.castShadow = true;
    scene.add(bulb);
    const drum = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.98, r * 1.02, 1, 20, 1, false), mat);
    drum.scale.set(1, r * 0.42, 1);
    drum.position.set(x, y + r * 0.21, z);
    drum.castShadow = true;
    drum.receiveShadow = true;
    scene.add(drum);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r * 1.02, Math.max(0.06, r * 0.045), 6, 28), matAshlar);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(x, y + r * 0.42, z);
    scene.add(ring);
    if (pierce) {
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2;
        const rad = r * 0.99;
        const opening = new THREE.Mesh(new THREE.BoxGeometry(r * 0.32, r * 0.24, 0.22), matDark);
        opening.position.set(x + Math.sin(a) * rad, y + r * 0.26, z + Math.cos(a) * rad);
        opening.lookAt(x, opening.position.y, z);
        scene.add(opening);
      }
    }
    const fin = new THREE.Mesh(new THREE.SphereGeometry(Math.max(0.08, r * 0.07), 8, 6), mat);
    fin.position.set(x, y + r * 0.42 + r * 0.78, z);
    scene.add(fin);
    if (crenel) {
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2;
        merlons.push({ x: x + Math.cos(a) * r * 0.95, y: y + r * 0.42, z: z + Math.sin(a) * r * 0.95 });
      }
    }
  }

  function addChhatri(x: number, y: number, z: number, r: number) {
    const span = r * 0.9;
    const h = r * 1.05;
    const s = Math.max(0.45, r * 0.72);
    cols.push(
      { x: x - span, y, z: z - span, s, h },
      { x: x + span, y, z: z - span, s, h },
      { x: x - span, y, z: z + span, s, h },
      { x: x + span, y, z: z + span, s, h },
    );
    addDome(x, y + h, z, r, matPlaster, false);
  }

  function addRectWin(x: number, y: number, z: number, rotY: number, w = 0.72, h = 1.05) {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    g.rotation.y = rotY;
    const t = 0.08;
    g.add(localBox(matAshlar, 0, h / 2 + t / 2, 0, w + t * 2, t, 0.2));
    g.add(localBox(matAshlar, 0, -h / 2 - t / 2, 0, w + t * 2, t, 0.2));
    g.add(localBox(matAshlar, -w / 2 - t / 2, 0, 0, t, h, 0.2));
    g.add(localBox(matAshlar, w / 2 + t / 2, 0, 0, t, h, 0.2));
    g.add(localBox(matAshlar, 0, -h / 2 - 0.1, 0.12, w + 0.28, 0.1, 0.32));
    const jali = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.92, h * 0.92), matJali);
    jali.position.z = -0.02;
    g.add(jali);
    const recess = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.7, h * 0.7), matDark);
    recess.position.z = -0.12;
    g.add(recess);
    scene.add(g);
  }

  function addNiche(x: number, y: number, z: number, rotY: number, w = 0.78, h = 0.92) {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    g.rotation.y = rotY;
    g.add(localBox(matDark, 0, -0.02, -0.06, w * 0.62, h * 0.7, 0.1));
    g.add(localBox(matAshlar, -w / 2, 0, 0, 0.1, h, 0.16));
    g.add(localBox(matAshlar, w / 2, 0, 0, 0.1, h, 0.16));
    g.add(localBox(matAshlar, 0, -h / 2, 0.06, w, 0.08, 0.18));
    g.add(localBox(matAshlar, 0, h / 2 + 0.05, 0, w, 0.1, 0.18));
    g.add(localBox(matAshlar, 0, h / 2 + 0.16, 0.02, w * 0.72, 0.1, 0.14));
    g.add(localBox(matAshlar, 0, h / 2 + 0.27, 0.04, w * 0.46, 0.1, 0.12));
    g.add(localBox(matAshlar, 0, h / 2 + 0.38, 0.05, w * 0.22, 0.12, 0.1));
    const j = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.36, 0.14), matJali);
    j.position.set(0, h / 2 + 0.16, 0.1);
    g.add(j);
    scene.add(g);
  }

  function archFrame(w: number, h: number) {
    const shape = new THREE.Shape();
    const t = 0.28;
    shape.moveTo(-w / 2 - t, 0);
    shape.lineTo(-w / 2 - t, h + t * 0.4);
    shape.lineTo(w / 2 + t, h + t * 0.4);
    shape.lineTo(w / 2 + t, 0);
    shape.lineTo(-w / 2 - t, 0);
    const hole = new THREE.Path();
    const n = 6;
    hole.moveTo(-w / 2, 0);
    hole.lineTo(w / 2, 0);
    hole.lineTo(w / 2, h * 0.58);
    for (let i = n; i >= 0; i--) {
      const u = i / n;
      const cusp = i % 2 === 0 ? 0 : -h * 0.07;
      hole.lineTo(-w / 2 + u * w, h * 0.58 + Math.sin(u * Math.PI) * h * 0.4 + cusp);
    }
    hole.lineTo(-w / 2, h * 0.58);
    hole.lineTo(-w / 2, 0);
    shape.holes.push(hole);
    const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.85, bevelEnabled: false, curveSegments: 2 });
    geo.translate(0, 0, -0.42);
    return geo;
  }

  function addArch(group: THREE.Group, x: number, w: number, h: number) {
    const mesh = new THREE.Mesh(archFrame(w, h), matAshlar);
    mesh.position.set(x, 0, 0);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
  }

  function addJharokha(x: number, y: number, z: number, rotY: number) {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    g.rotation.y = rotY;
    g.add(localBox(matAshlar, 0, 0, 0.45, 1.5, 0.12, 0.9));
    g.add(localBox(matAshlar, -0.55, 0.55, 0.45, 0.1, 0.9, 0.1));
    g.add(localBox(matAshlar, 0, 0.55, 0.45, 0.1, 0.9, 0.1));
    g.add(localBox(matAshlar, 0.55, 0.55, 0.45, 0.1, 0.9, 0.1));
    g.add(localBox(matCarve, 0, 1.05, 0.45, 1.6, 0.1, 0.95));
    g.add(localBox(matCarve, 0, 1.22, 0.62, 1.85, 0.08, 0.42));
    g.add(localBox(matRubble, -0.45, -0.15, 0.2, 0.16, 0.28, 0.28));
    g.add(localBox(matRubble, 0.45, -0.15, 0.2, 0.16, 0.28, 0.28));
    scene.add(g);
    const lift = y + 1.15;
    const dx = Math.sin(rotY);
    const dz = Math.cos(rotY);
    addChhatri(x + dx * 0.45, lift, z + dz * 0.45, 0.42);
  }

  function addSpire(x: number, z: number, h: number, base = 0) {
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 1.35, h, 7), matAshlar);
    shaft.position.set(x, base + h / 2, z);
    shaft.castShadow = true;
    scene.add(shaft);
  }

  function addPalm(x: number, z: number) {
    const gy = z < 35 ? 0 : slopeY(z);
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.22, 3.4, 5), matWood);
    trunk.position.set(x, gy + 1.7, z);
    scene.add(trunk);
    const crown = new THREE.Mesh(new THREE.SphereGeometry(1.15, 6, 4), matFoliage);
    crown.scale.set(1, 0.45, 1);
    crown.position.set(x, gy + 3.6, z);
    scene.add(crown);
  }

  function addTree(x: number, z: number, s = 1) {
    const gy = z < 34 ? 0 : slopeY(z);
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18 * s, 0.28 * s, 1.8 * s, 5), matWood);
    trunk.position.set(x, gy + 0.9 * s, z);
    scene.add(trunk);
    const crown = new THREE.Mesh(new THREE.SphereGeometry(1.5 * s, 7, 5), matFoliage);
    crown.position.set(x, gy + 2.4 * s, z);
    scene.add(crown);
  }

  function curtain(x1: number, z1: number, x2: number, z2: number, h: number) {
    const y1 = z1 < 35 ? 0 : slopeY(z1);
    const y2 = z2 < 35 ? 0 : slopeY(z2);
    const along = new THREE.Vector3(x2 - x1, y2 - y1, z2 - z1);
    const len = along.length();
    if (len < 0.2) return;
    along.multiplyScalar(1 / len);
    const side = new THREE.Vector3().crossVectors(along, new THREE.Vector3(0, 1, 0));
    if (side.lengthSq() < 1e-8) side.set(1, 0, 0);
    side.normalize();
    const up = new THREE.Vector3().crossVectors(side, along).normalize();
    const mid = new THREE.Vector3((x1 + x2) / 2, (y1 + y2) / 2, (z1 + z2) / 2);
    const mesh = new THREE.Mesh(bakeBox(1.15, h, len + 0.35), matMasonry);
    mesh.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(side, up, along));
    mesh.position.copy(mid).addScaledVector(up, h / 2).add(new THREE.Vector3(0, -0.5, 0));
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    const nMer = Math.max(2, Math.floor(len / 2.1));
    for (let k = 0; k < nMer; k++) {
      const t = (k + 0.5) / nMer;
      const px = x1 + (x2 - x1) * t;
      const pz = z1 + (z2 - z1) * t;
      const py = y1 + (y2 - y1) * t;
      merlons.push({ x: px + up.x * h, y: py + up.y * h - 0.5, z: pz + up.z * h });
    }
  }

  const wallH = 10.6;
  const wallY = COURT + wallH / 2;

  addFloor(0, -0.02, -28, 210, 122, matField);
  addFloor(0, 0.04, 31.4, 70, 5.4, matEarth);
  addFloor(10, 0.07, 30.2, 34, 4.6, matFloor);

  addBox(0, 0.78, -2, 72, 1.56, 66, matMasonry);

  addBox(-2, wallY, 27.2, 62, wallH, 3.3, matMasonry);
  addBox(-33.4, wallY, -4, 3.1, wallH, 58, matMasonry);
  addBox(33.2, wallY, 16, 3.1, wallH, 24, matMasonry);
  addBox(33.2, wallY, -20, 3.1, wallH, 30, matMasonry);
  addBox(0, wallY, -36.2, 68, wallH, 3.2, matMasonry);
  addBox(0, COURT + 6.4, 27.2, 62.4, 0.55, 3.6, matRubble);
  addBox(-33.4, COURT + 6.2, -4, 3.4, 0.5, 58, matRubble);

  for (let x = -28; x <= 8; x += 1.55) merlons.push({ x, y: COURT + wallH, z: 28.75 });
  for (let z = -30; z <= 22; z += 1.7) merlons.push({ x: -34.7, y: COURT + wallH, z });
  for (let z = 8; z <= 22; z += 1.7) merlons.push({ x: 34.6, y: COURT + wallH, z });
  for (let z = -28; z <= -8; z += 1.7) merlons.push({ x: 34.6, y: COURT + wallH, z });

  const bastion = new THREE.Mesh(new THREE.CylinderGeometry(4.4, 4.8, 9.2, 8), matMasonryFlat);
  bastion.position.set(29, COURT + 4.4, 26);
  bastion.castShadow = true;
  bastion.receiveShadow = true;
  scene.add(bastion);
  addDome(29, COURT + 9.1, 26, 2.15, matPlaster, true);

  addBox(16.5, COURT + 4.4, 25.4, 5.4, 8.8, 5.4, matPlaster);
  addBox(16.5, COURT + 3.2, 25.4, 5.7, 0.48, 5.7, matRubble);
  addDome(16.5, COURT + 8.85, 25.4, 2.5, matPlaster, false);
  addRectWin(16.5, COURT + 5.2, 28.2, 0, 0.7, 1.15);
  addRectWin(19.3, COURT + 5.4, 25.4, Math.PI / 2, 0.6, 1);

  const T = { x: 8, z: 5, w: 14, d: 12.2, h: 15.4 };
  const domeY = COURT + T.h + 0.08;
  const colonnadeFloor = domeY - 2.38;
  const lowerH = colonnadeFloor - COURT - 0.12;
  const notchX1 = 4.7;
  const notchZ0 = T.z - T.d / 2;
  const notchZ1 = 3.15;
  const notchTop = 10.3;
  const tY0 = COURT;
  const tY1 = COURT + lowerH;
  const tX0 = T.x - T.w / 2;
  const tX1 = T.x + T.w / 2;
  const tZ1 = T.z + T.d / 2;
  addBox((notchX1 + tX1) / 2, (tY0 + tY1) / 2, T.z, tX1 - notchX1, lowerH, T.d, matPlaster);
  addBox(
    (tX0 + notchX1) / 2,
    (notchTop + tY1) / 2,
    (notchZ0 + notchZ1) / 2,
    notchX1 - tX0,
    tY1 - notchTop,
    notchZ1 - notchZ0,
    matPlaster,
  );
  addBox(
    (tX0 + notchX1) / 2,
    (tY0 + tY1) / 2,
    (notchZ1 + tZ1) / 2,
    notchX1 - tX0,
    lowerH,
    tZ1 - notchZ1,
    matPlaster,
  );
  const splitBand = (yc: number, bh: number, bw: number, bd: number) => {
    const x0 = T.x - bw / 2;
    const x1 = T.x + bw / 2;
    const z0 = T.z - bd / 2;
    const z1 = T.z + bd / 2;
    addBox((notchX1 + x1) / 2, yc, T.z, x1 - notchX1, bh, bd, matRubble);
    if (notchZ1 < z1) {
      addBox((x0 + notchX1) / 2, yc, (notchZ1 + z1) / 2, notchX1 - x0, bh, z1 - notchZ1, matRubble);
    }
    if (z0 < notchZ0) {
      addBox((x0 + notchX1) / 2, yc, (z0 + notchZ0) / 2, notchX1 - x0, bh, notchZ0 - z0, matRubble);
    }
  };
  splitBand(COURT + 4.3, 0.58, T.w + 0.35, T.d + 0.35);
  splitBand(COURT + 8.5, 0.5, T.w + 0.28, T.d + 0.28);
  addBox(T.x, COURT + 1.55, 13.65, 15, 3.1, 4.7, matPlaster);
  addBox(T.x, 4.78, 13.65, 15.35, 0.26, 4.95, matRubble);
  const upperH = COURT + T.h - colonnadeFloor;
  addBox(T.x, colonnadeFloor + upperH / 2, T.z - 0.85, T.w - 1.4, upperH, T.d - 1.7, matPlaster);
  addBox(T.x, 16.95, 6.2, 10.2, 0.28, 10.4, matAshlar);
  addBox(T.x, colonnadeFloor + 1.12, 10.35, 8.4, 2.15, 0.85, matAshlar);
  addBox(T.x, colonnadeFloor - 0.08, 11.45, 9.6, 0.24, 2.5, matAshlar);
  for (let i = 0; i < 6; i++) {
    cols.push({ x: T.x - 3.15 + i * 1.26, y: colonnadeFloor, z: 11.22, s: 1.62, h: 2.38 });
  }
  for (let i = 0; i < 8; i++) {
    addBox(T.x - 4 + i * 1.15, colonnadeFloor + 0.42, 12.62, 0.12, 0.62, 0.12, matAshlar);
  }
  addDome(T.x, domeY, 7.15, 3.55, matPlaster, false);
  for (const a of [0, (2 * Math.PI) / 10, (-2 * Math.PI) / 10]) {
    const r = 3.55;
    const drumArch = new THREE.Group();
    drumArch.position.set(T.x + Math.sin(a) * r * 1.1, domeY + r * 0.12, 7.15 + Math.cos(a) * r * 1.1);
    drumArch.lookAt(T.x, drumArch.position.y, 7.15);
    drumArch.scale.setScalar(0.36);
    addArch(drumArch, 0, 1.55, 2.15);
    scene.add(drumArch);
  }
  addChhatri(T.x - 5.2, COURT + T.h + 0.08, T.z + 2.55, 0.82);

  const upperFacade = new THREE.Group();
  upperFacade.position.set(T.x, COURT + 8.55, 11.32);
  for (const lx of [-4.5, -1.5, 1.5, 4.5]) {
    addArch(upperFacade, lx, 1.7, 2.85);
    upperFacade.add(localBox(matDark, lx, 1.22, -0.5, 1.22, 2.15, 0.26));
  }
  scene.add(upperFacade);
  const lowerFacade = new THREE.Group();
  lowerFacade.position.set(T.x, COURT + 4.95, 11.32);
  for (const lx of [-4.65, -1.55, 1.55, 4.65]) {
    addArch(lowerFacade, lx, 1.55, 2.45);
    lowerFacade.add(localBox(matDark, lx, 1.05, -0.5, 1.12, 1.85, 0.26));
  }
  scene.add(lowerFacade);
  addBox(T.x, COURT + 7.55, 11.38, 13.6, 0.42, 0.55, matRubble);
  addRectWin(T.x + T.w / 2 + 0.05, COURT + 6.5, T.z + 1, Math.PI / 2, 0.7, 1.2);
  addRectWin(T.x + T.w / 2 + 0.05, COURT + 6.5, T.z - 2.2, Math.PI / 2, 0.7, 1.2);
  addJharokha(T.x + T.w / 2, COURT + 10.2, T.z + 2.2, Math.PI / 2);
  addJharokha(T.x - T.w / 2, COURT + 10.6, T.z - 1.6, -Math.PI / 2);
  addJharokha(T.x - T.w / 2, COURT + 10.6, T.z + 2.5, -Math.PI / 2);
  addJharokha(T.x - 2.2, COURT + 11.4, T.z + T.d / 2, 0);
  for (const lx of [-4.2, -1.4, 1.4, 4.2]) addJharokha(T.x + lx, COURT + 12.4, 11.55, 0);

  const W = { x: -18, z: 17, w: 9.4, d: 9.2, h: 10.4 };
  addBox(W.x, COURT + W.h / 2, W.z, W.w, W.h, W.d, matPlaster);
  addBox(W.x, COURT + 3.5, W.z, W.w + 0.3, 0.5, W.d + 0.3, matRubble);
  addBox(W.x, COURT + 6.8, W.z, W.w + 0.24, 0.42, W.d + 0.24, matRubble);
  addDome(W.x, COURT + W.h + 0.1, W.z, 3.15, matPlaster, false);
  addRectWin(W.x, COURT + 4.2, W.z + W.d / 2 + 0.05, 0, 0.8, 1.3);
  addRectWin(W.x + W.w / 2 + 0.04, COURT + 5, W.z, Math.PI / 2, 0.7, 1.1);
  addChhatri(W.x + 3.6, COURT + W.h + 0.1, W.z - 2.4, 0.62);

  addBox(0, COURT + 3.2, -22, 18, 6.4, 10.6, matPlaster);
  addBox(0, COURT + 4.6, -22, 18.4, 0.4, 11, matRubble);
  addBox(0, COURT + 6.55, -21.2, 16, 0.28, 8.4, matAshlar);
  for (let i = 0; i < 7; i++) cols.push({ x: -6 + i * 2, y: COURT, z: -14.4, s: 1.15, h: 3.3 });
  addRectWin(0, COURT + 3.6, -16.55, 0, 1.1, 1.5);
  addRectWin(-3.2, COURT + 3.4, -16.55, 0, 0.7, 1.1);
  addRectWin(3.2, COURT + 3.4, -16.55, 0, 0.7, 1.1);
  addJharokha(-4.2, COURT + 6.5, -16.55, 0);
  addJharokha(4.2, COURT + 6.5, -16.55, 0);

  addBox(-4, COURT + 3.4, -33, 16, 6.8, 8, matPlaster);
  addBox(8, COURT + 2.6, -31, 10, 5.2, 7, matMasonry);
  addChhatri(-8, COURT + 6.9, -33, 0.7);
  addFloor(-2, COURT + 0.04, -8, 22, 16, matFloor);
  addFloor(-6, COURT + 0.03, 8, 10, 8, matFloor);
  const courtTree = (x: number, z: number, s = 1) => {
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.15 * s, 0.26 * s, 2.1 * s, 6), matWood);
    trunk.position.set(x, COURT + 1.05 * s, z);
    scene.add(trunk);
    const crown = new THREE.Mesh(new THREE.SphereGeometry(1.25 * s, 8, 6), matFoliage);
    crown.position.set(x, COURT + 2.35 * s, z);
    scene.add(crown);
  };
  courtTree(4.2, -9.2, 0.85);
  courtTree(11.2, 16.5, 0.9);
  addFigure(-0.8, COURT + 0.06, -0.6, 0.5, "stand", 0x6e3b2a);
  addFigure(3.6, COURT + 0.06, 2.1, -0.8, "stand", 0xd7c4a2);
  addFigure(6.8, COURT + 0.06, -3.8, 1.4, "stand", 0x243e32);

  addBox(24.5, COURT + 2.3, 6, 7.4, 4.6, 15, matMasonry);
  addBox(24.5, COURT + 2.4, 6, 7.7, 0.4, 15.3, matRubble);
  const stables = new THREE.Group();
  stables.position.set(20.65, COURT, 6);
  stables.rotation.y = -Math.PI / 2;
  addArch(stables, -4.2, 1.35, 2.15);
  addArch(stables, 0, 1.35, 2.15);
  addArch(stables, 4.2, 1.35, 2.15);
  scene.add(stables);

  const gate = new THREE.Group();
  gate.position.set(33.1, COURT, -1.2);
  gate.rotation.y = Math.PI / 2;
  addArch(gate, -2.3, 1.45, 2.7);
  addArch(gate, 0, 1.85, 3.25);
  addArch(gate, 2.3, 1.45, 2.7);
  gate.add(localBox(matMasonry, -3.35, 2, 0, 0.7, 4, 1.3));
  gate.add(localBox(matMasonry, 3.35, 2, 0, 0.7, 4, 1.3));
  gate.add(localBox(matAshlar, 0, 3.7, 0, 8.2, 0.35, 1.4));
  scene.add(gate);
  addChhatri(33.1, COURT + 4.05, -1.2, 0.62);
  addChhatri(33.1, COURT + 3.7, 1.05, 0.48);
  addChhatri(33.1, COURT + 3.7, -3.45, 0.48);

  const pol = new THREE.Group();
  pol.position.set(40.2, 0, -1.2);
  pol.rotation.y = Math.PI / 2;
  addArch(pol, 0, 2.3, 3.5);
  pol.add(localBox(matMasonry, -2.1, 2, 0, 0.8, 4.2, 1.5));
  pol.add(localBox(matMasonry, 2.1, 2, 0, 0.8, 4.2, 1.5));
  scene.add(pol);
  for (let i = 0; i < 4; i++) {
    const h = 0.42 + i * 0.38;
    addBox(38.6 - i * 0.95, h / 2, -1.2, 0.95, h, 5.4, matAshlar);
  }

  addBox(-22, COURT + 1.5, 6, 3.4, 3, 3.4, matAshlar);
  addSpire(-22, 6, 6.5, COURT + 2.8);
  addNiche(-22, COURT + 1.6, 7.75, 0, 0.7, 0.9);

  const shivaX = -15.6;
  const shivaZ = -16.4;
  addBox(shivaX, 1.6, shivaZ, 7.2, 3.2, 7.2, matCarve);
  addBox(shivaX, 3.35, shivaZ, 7.6, 0.35, 7.6, matRubble);
  addBox(shivaX, 4.5, shivaZ + 3.15, 3.2, 2.4, 0.7, matCarve);
  for (let i = 0; i < 7; i++) {
    const w = 4.6 - i * 0.48;
    addBox(shivaX, 5.3 + i * 1.05, shivaZ - 0.4, w, 1.05, w, matCarve);
  }
  addSpire(shivaX, shivaZ - 0.4, 2.4, 12.4);

  const vx = 53;
  const vz = -48;
  addBox(vx, 1.15, vz, 10.4, 2.3, 10.4, matCarve);
  addBox(vx, 2.45, vz, 11.2, 0.4, 11.2, matRubble);
  let storeyY = 2.6;
  for (let s = 0; s < 9; s++) {
    const w = 8.4 * (1 - s * 0.042);
    const h = s === 0 ? 4.1 : 3.25;
    addBox(vx, storeyY + h / 2, vz, w, h, w, matCarve);
    addBox(vx, storeyY + h - 0.16, vz, w + 1.25, 0.28, w + 1.25, matAshlar);
    const o = w / 2;
    for (const [sx, sz] of [
      [-1, -1],
      [-1, 1],
      [1, -1],
      [1, 1],
    ] as const) {
      addBox(vx + sx * o, storeyY + h / 2, vz + sz * o, 0.62, h + 0.15, 0.62, matAshlar);
    }
    storeyY += h;
  }
  addDome(vx, storeyY, vz, 2.15, matPlaster, false, false);

  addBox(-8, COURT + 0.9, 22, 4, 1.8, 2.2, matDark);
  addBox(6, 0.45, 24.5, 2.2, 0.9, 1.4, matDark);

  addBox(-55, 14, -88, 3.6, 28, 3.6, matAshlar);
  addBox(-55, 22, -88, 4.4, 0.4, 4.4, matRubble);
  addDome(-55, 28.2, -88, 2.4, matPlaster, false);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    cols.push({
      x: -55 + Math.sin(a) * 1.7,
      y: 24.2,
      z: -88 + Math.cos(a) * 1.7,
      s: 0.55,
      h: 3.2,
    });
  }
  addSpire(-68, -74, 9, 0);
  addSpire(-42, -96, 7, 0);

  const northRng = mulberry32(4);
  for (let i = 0; i < 28; i++) {
    const bw = 4 + northRng() * 8;
    const bd = 4 + northRng() * 7;
    const bh = 3 + northRng() * 11;
    addBox(-80 + northRng() * 150, bh / 2, -78 - northRng() * 36, bw, bh, bd, i % 2 ? matTownA : matTownB);
  }

  buildRani();
  buildDomeRoom();
  buildCliff();

  const townMats = [matTownA, matTownB, matTownC];
  const townMeshes = townMats.map((m) => new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), m, 96));
  const townRng = mulberry32(21);
  const dummyTown = new THREE.Object3D();
  const townCounts = [0, 0, 0];
  for (let i = 0; i < 288; i++) {
    const mi = i % 3;
    const w = 3.2 + townRng() * 7;
    const d = 3.2 + townRng() * 7;
    const tall = townRng() > 0.92;
    const h = 3 + townRng() * (tall ? 16 : 8);
    dummyTown.position.set(-70 + townRng() * 180, -72 + h / 2, 178 + townRng() * 80);
    dummyTown.scale.set(w, h, d);
    dummyTown.rotation.set(0, 0, 0);
    dummyTown.updateMatrix();
    townMeshes[mi].setMatrixAt(townCounts[mi]++, dummyTown.matrix);
  }
  for (const mesh of townMeshes) {
    mesh.count = 96;
    mesh.instanceMatrix.needsUpdate = true;
    scene.add(mesh);
  }

  const pts = [
    new THREE.Vector2(0.16, 0),
    new THREE.Vector2(0.22, 0.04),
    new THREE.Vector2(0.18, 0.1),
    new THREE.Vector2(0.11, 0.16),
    new THREE.Vector2(0.09, 0.78),
    new THREE.Vector2(0.13, 0.86),
    new THREE.Vector2(0.2, 0.93),
    new THREE.Vector2(0.12, 1),
  ];
  const lathe = new THREE.LatheGeometry(pts, 10);
  const colMesh = new THREE.InstancedMesh(lathe, matAshlar, cols.length);
  const dummy = new THREE.Object3D();
  cols.forEach((c, i) => {
    dummy.position.set(c.x, c.y, c.z);
    dummy.scale.set(c.s, c.h, c.s);
    dummy.rotation.set(0, 0, 0);
    dummy.updateMatrix();
    colMesh.setMatrixAt(i, dummy.matrix);
  });
  colMesh.castShadow = false;
  colMesh.receiveShadow = true;
  scene.add(colMesh);

  const merGeo = new THREE.BoxGeometry(0.62, 0.9, 0.48);
  const merMesh = new THREE.InstancedMesh(merGeo, matMasonry, Math.max(merlons.length, 1));
  merlons.forEach((m, i) => {
    dummy.position.set(m.x, m.y + 0.45, m.z);
    dummy.scale.set(1, 1, 1);
    dummy.rotation.set(0, 0, 0);
    dummy.updateMatrix();
    merMesh.setMatrixAt(i, dummy.matrix);
  });
  merMesh.count = merlons.length;
  merMesh.instanceMatrix.needsUpdate = true;
  merMesh.castShadow = false;
  scene.add(merMesh);

  function addFigure(
    x: number,
    y: number,
    z: number,
    rotY: number,
    pose: "stand" | "sit",
    color: number,
  ) {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    g.rotation.y = rotY;
    const cloth = new THREE.MeshStandardMaterial({ color, roughness: 0.82 });
    const skin = new THREE.MeshStandardMaterial({ color: 0xc48a62, roughness: 0.7 });
    const box = (mat: THREE.Material, px: number, py: number, pz: number, w: number, h: number, d: number) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      m.position.set(px, py, pz);
      m.castShadow = true;
      g.add(m);
    };
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 6), skin);
    if (pose === "sit") {
      box(cloth, 0, 0.46, 0.02, 0.42, 0.48, 0.28);
      box(cloth, 0, 0.16, 0.28, 0.4, 0.16, 0.42);
      head.position.set(0, 0.86, 0);
    } else {
      box(cloth, 0, 0.78, 0, 0.36, 0.62, 0.22);
      box(cloth, -0.09, 0.28, 0, 0.14, 0.52, 0.14);
      box(cloth, 0.09, 0.28, 0, 0.14, 0.52, 0.14);
      head.position.set(0, 1.24, 0);
    }
    g.add(head);
    scene.add(g);
  }

  function buildRani() {
    const cx = -6;
    const cz = -1;
    const h = 11.2;
    const half = 6.3;
    const t = 2.2;
    const iHalf = 4.1;
    const y = COURT + h / 2;
    const westX = cx - half + t / 2;
    const southZ = cz + half - t / 2;
    const northZ = cz - half + t / 2;
    addBox(westX, y, cz, t, h, half * 2, matAshlar);
    addBox(cx, y, northZ, iHalf * 2, h, t, matAshlar);
    const doorZ0 = -1.4;
    const doorZ1 = 0.35;
    const doorY0 = 1.9;
    const doorY1 = 4.9;
    const winZ0 = 1.08;
    const winZ1 = 2.32;
    const winY0 = 2.02;
    const winY1 = 4.42;
    const skyZ0 = -0.9;
    const skyZ1 = 0.5;
    const skyY0 = 7.7;
    const skyY1 = 10.15;
    const eastZ0 = -7.3;
    const eastZ1 = 5.3;
    const wallTop = COURT + h;
    const innerX = -1.88;
    const innerT = 0.34;
    const outerX = -0.55;
    const outerT = 1.85;
    const fillLeaf = (x: number, tw: number, z0: number, z1: number, y0: number, y1: number) => {
      if (z1 - z0 < 0.04 || y1 - y0 < 0.04) return;
      addBox(x, (y0 + y1) / 2, (z0 + z1) / 2, tw, y1 - y0, z1 - z0, matAshlar);
    };
    fillLeaf(innerX, innerT, eastZ0, doorZ0, COURT, wallTop);
    fillLeaf(innerX, innerT, doorZ0, skyZ0, COURT, doorY0);
    fillLeaf(innerX, innerT, doorZ0, skyZ0, doorY1, wallTop);
    fillLeaf(innerX, innerT, skyZ0, doorZ1, COURT, doorY0);
    fillLeaf(innerX, innerT, skyZ0, doorZ1, doorY1, skyY0);
    fillLeaf(innerX, innerT, skyZ0, doorZ1, skyY1, wallTop);
    fillLeaf(innerX, innerT, doorZ1, winZ0, COURT, wallTop);
    fillLeaf(innerX, innerT, winZ0, winZ1, COURT, winY0);
    fillLeaf(innerX, innerT, winZ0, winZ1, winY1, wallTop);
    fillLeaf(innerX, innerT, winZ1, eastZ1, COURT, wallTop);
    const chaseZ0 = -1.62;
    const chaseZ1 = 2.58;
    const chaseY0 = COURT;
    const chaseY1 = 5.25;
    const skyChaseZ0 = -1.08;
    const skyChaseZ1 = 0.7;
    fillLeaf(outerX, outerT, eastZ0, chaseZ0, COURT, wallTop);
    fillLeaf(outerX, outerT, chaseZ0, chaseZ1, COURT, chaseY0);
    fillLeaf(outerX, outerT, chaseZ0, skyChaseZ0, chaseY1, wallTop);
    fillLeaf(outerX, outerT, skyChaseZ0, skyChaseZ1, chaseY1, skyY0);
    fillLeaf(outerX, outerT, skyChaseZ0, skyChaseZ1, skyY1, wallTop);
    fillLeaf(outerX, outerT, skyChaseZ1, chaseZ1, chaseY1, wallTop);
    fillLeaf(outerX, outerT, chaseZ1, eastZ1, COURT, wallTop);
    const doorMidZ = (doorZ0 + doorZ1) / 2;
    const seatW = (doorZ1 - doorZ0) * 0.72;
    addBox(-2.08, doorY0 - 0.06, doorMidZ, 0.42, 0.2, seatW, matAshlar);
    const winMidZ = (winZ0 + winZ1) / 2;
    addBox(-2.02, winY0 - 0.04, winMidZ, 0.32, 0.12, (winZ1 - winZ0) * 0.78, matAshlar);
    const frameX = -1.97;
    const dress = (z0: number, z1: number, y0: number, y1: number) => {
      const zc = (z0 + z1) / 2;
      const yc = (y0 + y1) / 2;
      const zw = z1 - z0;
      const yh = y1 - y0;
      const fw = 0.16;
      addBox(frameX, yc, z0 - fw / 2, 0.18, yh + fw, fw, matAshlar);
      addBox(frameX, yc, z1 + fw / 2, 0.18, yh + fw, fw, matAshlar);
      addBox(frameX, y1 + fw / 2, zc, 0.18, fw, zw + fw, matAshlar);
    };
    dress(doorZ0, doorZ1, doorY0, doorY1);
    dress(winZ0, winZ1, winY0, winY1);
    dress(skyZ0, skyZ1, skyY0, skyY1);
    addBox(frameX, doorY1 + 0.24, doorMidZ, 0.16, 0.16, (doorZ1 - doorZ0) * 0.92, matAshlar);
    addBox(frameX, doorY1 + 0.42, doorMidZ, 0.14, 0.14, (doorZ1 - doorZ0) * 0.55, matAshlar);
    addBox(frameX, doorY1 + 0.58, doorMidZ, 0.12, 0.14, (doorZ1 - doorZ0) * 0.28, matAshlar);
    addBox(frameX, winY1 + 0.28, winMidZ, 0.16, 0.16, (winZ1 - winZ0) * 0.95, matAshlar);
    addBox(frameX, winY1 + 0.46, winMidZ, 0.14, 0.14, (winZ1 - winZ0) * 0.62, matAshlar);
    addBox(frameX, winY1 + 0.62, winMidZ, 0.12, 0.14, (winZ1 - winZ0) * 0.32, matAshlar);
    const pedW = winZ1 - winZ0;
    addBox(frameX - 0.02, winY1 + 0.4, winMidZ - pedW * 0.34, 0.14, 0.22, pedW * 0.2, matAshlar);
    addBox(frameX - 0.02, winY1 + 0.4, winMidZ + pedW * 0.34, 0.14, 0.22, pedW * 0.2, matAshlar);
    const pier = (z: number, y1: number) => {
      addBox(-2.14, (COURT + 0.35 + y1) / 2, z, 0.46, y1 - (COURT + 0.35), 0.26, matAshlar);
      addBox(-2.2, COURT + 0.48, z, 0.56, 0.22, 0.38, matAshlar);
      addBox(-2.18, y1 - 0.06, z, 0.5, 0.14, 0.34, matAshlar);
    };
    pier(doorZ0 - 0.28, doorY1 + 0.08);
    pier((doorZ1 + winZ0) / 2, 5.9);
    pier(winZ1 + 0.26, winY1 + 0.7);
    addBox(-2.28, skyY0 - 0.02, (skyZ0 + skyZ1) / 2, 0.72, 0.26, skyZ1 - skyZ0 + 0.55, matAshlar);
    addBox(cx, y, southZ, half * 2, h, t, matAshlar);
    const lawn = addFloor(2.55, COURT + 0.2, 0.45, 3.5, 3.2, matLawn);
    lawn.receiveShadow = false;
    const garden = new THREE.DirectionalLight(0xe7ffd4, 1.35);
    garden.position.set(7.5, 7.2, 0.4);
    garden.target.position.set(-3.2, 3.2, 0.2);
    scene.add(garden);
    scene.add(garden.target);
    addFigure(-2.32, doorY0, doorMidZ, -Math.PI / 2, "sit", 0x2a4f86);
    addFigure(-7.15, COURT + 0.06, -1.7, 0.6, "stand", 0x8d3a32);
    addFigure(-5.35, COURT + 0.06, 1.35, -0.4, "stand", 0xc4a574);
    for (const [sx, sz, sc] of [
      [1.2, 0.35, 0.9],
      [2.6, 1.35, 1.05],
      [1.7, 2.15, 0.75],
    ] as const) {
      const bush = new THREE.Mesh(new THREE.SphereGeometry(0.42, 8, 6), matLawn);
      bush.position.set(sx, COURT + 0.42, sz);
      bush.scale.set(sc, 0.55, sc);
      scene.add(bush);
    }
    cols.push({ x: 2.8, y: 7.15, z: 0.68, s: 0.85, h: 2.7 });
    const skyPane = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 3.1), matSky);
    skyPane.rotation.y = -Math.PI / 2;
    skyPane.position.set(3.9, 8.75, 0.75);
    scene.add(skyPane);
    for (const [fx, fy, fz, fs] of [
      [3.15, 9.1, 0.35, 1.15],
      [3.35, 8.6, 1.15, 0.85],
    ] as const) {
      const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.7, 8, 6), matFoliage);
      leaf.position.set(fx, fy, fz);
      leaf.scale.set(fs, 0.85, fs);
      scene.add(leaf);
    }

    addBox(cx, COURT + h * 0.46, cz + iHalf - 0.2, iHalf * 2 - 0.4, 1.35, 0.95, matRubble);
    addBox(cx, COURT + h * 0.46, cz - iHalf + 0.2, iHalf * 2 - 0.4, 1.35, 0.95, matRubble);
    addBox(cx - iHalf + 0.2, COURT + h * 0.46, cz, 0.95, 1.35, iHalf * 2 - 0.4, matRubble);
    addBox(cx + iHalf - 0.2, COURT + h * 0.46, cz, 0.95, 1.35, iHalf * 2 - 0.4, matRubble);
    addBox(cx, COURT + h * 0.74, cz + iHalf - 0.15, iHalf * 2 - 0.2, 0.85, 0.62, matRubble);
    addBox(cx, COURT + h * 0.74, cz - iHalf + 0.15, iHalf * 2 - 0.2, 0.85, 0.62, matRubble);

    addBox(cx - iHalf + 0.15, COURT + 0.7, cz, 0.12, 1.3, iHalf * 1.6, matDado);
    const dadoZ0 = cz - (iHalf * 1.6) / 2;
    const dadoZ1 = Math.min(cz + (iHalf * 1.6) / 2, winZ0 - 0.05);
    addBox(cx + iHalf - 0.15, COURT + 0.7, (dadoZ0 + doorZ0) / 2, 0.12, 1.3, doorZ0 - dadoZ0, matDado);
    addBox(cx + iHalf - 0.15, COURT + 0.7, (doorZ1 + dadoZ1) / 2, 0.12, 1.3, dadoZ1 - doorZ1, matDado);
    addBox(cx, COURT + 0.7, cz - iHalf + 0.15, iHalf * 1.7, 1.3, 0.12, matDado);
    addBox(-7.55, 3.42, -5.28, 1.2, 2.4, 0.42, matDark);
    addBox(-8.28, 3.45, -5.02, 0.16, 2.75, 0.2, matAshlar);
    addBox(-6.82, 3.45, -5.02, 0.16, 2.75, 0.2, matAshlar);
    addBox(-7.55, 4.72, -5.02, 1.55, 0.16, 0.22, matAshlar);

    const cw = iHalf * 2 - 0.3;
    const courtGeo = new THREE.PlaneGeometry(cw, cw);
    const courtUv = courtGeo.getAttribute("uv") as THREE.BufferAttribute;
    const repeats = cw / 3.05;
    for (let i = 0; i < courtUv.count; i++) {
      courtUv.setXY(i, courtUv.getX(i) * repeats, courtUv.getY(i) * repeats);
    }
    const courtFloor = new THREE.Mesh(courtGeo, matCourt);
    courtFloor.rotation.x = -Math.PI / 2;
    courtFloor.position.set(cx, COURT + 0.05, cz);
    courtFloor.receiveShadow = true;
    scene.add(courtFloor);

    const py = COURT + h + 0.4;
    addBox(cx, py, cz + half - 0.28, half * 2, 0.75, 0.55, matMasonry);
    addBox(cx, py, cz - half + 0.28, half * 2, 0.75, 0.55, matMasonry);
    addBox(cx - half + 0.28, py, cz, 0.55, 0.75, half * 2, matMasonry);
    addBox(cx + half - 0.28, py, cz, 0.55, 0.75, half * 2, matMasonry);

    addDome(cx - iHalf + 0.15, COURT + h, cz - iHalf + 1.4, 2.45, matPlaster, false, false);
    addBox(cx - iHalf + 0.9, COURT + h * 0.62, cz - 1.6, 0.35, 1.7, 1.5, matDark);

    for (let i = 0; i < 3; i++) {
      cols.push({
        x: cx + iHalf - 0.15,
        y: COURT + h - 2.55,
        z: cz + 0.35 + i * 0.72,
        s: 0.55,
        h: 2.15,
      });
    }
    addChhatri(cx + iHalf - 0.2, COURT + h + 0.05, cz + 1.05, 0.62);
    addRectWin(cx + iHalf - 0.2, COURT + h * 0.78, cz - 2.55, -Math.PI / 2, 0.95, 1.15);

    const niches: [number, number, number, number][] = [
      [cx - iHalf + 0.08, COURT + 1.7, cz - 2.2, Math.PI / 2],
      [cx - iHalf + 0.08, COURT + 1.7, cz + 0.4, Math.PI / 2],
      [cx - iHalf + 0.08, COURT + 1.7, cz + 2.4, Math.PI / 2],
      [cx + iHalf - 0.08, COURT + 1.7, cz - 2.4, -Math.PI / 2],
      [cx + iHalf - 0.08, COURT + 1.7, 3.7, -Math.PI / 2],
      [cx - 3.2, COURT + 1.7, cz - iHalf + 0.08, 0],
      [cx + 0.2, COURT + 1.7, cz - iHalf + 0.08, 0],
      [cx + 2.8, COURT + 1.7, cz - iHalf + 0.08, 0],
      [cx - 3.4, COURT + 1.6, cz + iHalf - 0.08, Math.PI],
      [cx + iHalf - 0.08, COURT + h * 0.62, cz - 0.8, -Math.PI / 2],
      [cx - 1.2, COURT + h * 0.62, cz - iHalf + 0.08, 0],
    ];
    for (const n of niches) addNiche(n[0], n[1], n[2], n[3]);

    addRectWin(cx - 2.2, COURT + h * 0.62, cz + iHalf - 0.05, Math.PI, 0.9, 1.15);
    addRectWin(cx + 2.6, COURT + h * 0.55, cz - iHalf + 0.05, 0, 0.85, 1.2);
    addRectWin(cx - iHalf + 0.05, COURT + 4.6, cz + 1.8, Math.PI / 2, 0.7, 0.9);
  }

  function buildDomeRoom() {
    const rx = -7.6;
    const rz = -9.55;
    const rw = 5.1;
    const rd = 4.5;
    const rh = 7.4;
    const wt = 0.42;
    addFloor(rx, COURT + 0.02, rz, rw - 0.3, rd - 0.3, matFloor);
    addBox(rx - rw / 2, COURT + rh / 2, rz, wt, rh, rd, matPlaster);
    addBox(rx + rw / 2, COURT + rh / 2, rz, wt, rh, rd, matPlaster);
    addBox(rx, COURT + rh / 2, rz - rd / 2, rw, rh, wt, matPlaster);
    addBox(rx - rw / 2 + 0.24, COURT + 0.65, rz, 0.08, 1.25, rd - 0.5, matDado);
    addBox(rx + rw / 2 - 0.24, COURT + 0.65, rz, 0.08, 1.25, rd - 0.5, matDado);
    addBox(rx, COURT + 0.65, rz - rd / 2 + 0.24, rw - 0.5, 1.25, 0.08, matDado);
    addDome(rx, COURT + rh + 1.02, rz, 2.2, matPlaster, false);
    const soffit = new THREE.Mesh(new THREE.CircleGeometry(1, 64), matFresco);
    soffit.name = "fresco";
    soffit.rotation.x = Math.PI / 2;
    soffit.scale.set(1.85, 1.85, 1);
    soffit.position.set(rx, 9.2, rz);
    scene.add(soffit);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const q = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 0.4), matSky);
      q.position.set(rx + Math.cos(a) * 2.15, 8.85, rz + Math.sin(a) * 2.15);
      q.lookAt(rx, 8.85, rz);
      scene.add(q);
      addBox(rx + Math.cos(a + 0.22) * 1.95, 8.55, rz + Math.sin(a + 0.22) * 1.95, 0.28, 0.18, 0.42, matAshlar);
    }
    const cornice = new THREE.Mesh(new THREE.TorusGeometry(2.05, 0.08, 6, 8), matAshlar);
    cornice.rotation.x = Math.PI / 2;
    cornice.position.set(rx, 9.12, rz);
    scene.add(cornice);
    const corniceLow = cornice.clone();
    corniceLow.position.y = 8.52;
    scene.add(corniceLow);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
      const pier = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.7, 0.42), matAshlar);
      pier.position.set(rx + Math.cos(a) * 2.08, 8.85, rz + Math.sin(a) * 2.08);
      pier.lookAt(rx, 8.85, rz);
      scene.add(pier);
    }
    addWindowSeat(rx - rw / 2 + 0.28, COURT + 1.35, rz + 0.35, Math.PI / 2);
    addWindowSeat(rx + rw / 2 - 0.28, COURT + 1.35, rz - 0.15, -Math.PI / 2);
    addNiche(rx, COURT + 2.4, rz - rd / 2 + 0.24, 0, 0.7, 0.85);
  }

  function addWindowSeat(x: number, y: number, z: number, rotY: number) {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    g.rotation.y = rotY;
    g.add(localBox(matAshlar, 0, -0.35, 0.15, 1.15, 0.16, 0.55));
    g.add(localBox(matAshlar, -0.48, 0.15, 0, 0.12, 1.15, 0.16));
    g.add(localBox(matAshlar, 0.48, 0.15, 0, 0.12, 1.15, 0.16));
    g.add(localBox(matAshlar, 0, 0.78, 0, 1.15, 0.12, 0.18));
    g.add(localBox(matAshlar, 0, 1.05, 0.02, 0.7, 0.28, 0.16));
    g.add(localBox(matAshlar, 0, 1.28, 0.04, 0.4, 0.16, 0.12));
    const j = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.85), matJali);
    j.position.set(0, 0.15, -0.02);
    g.add(j);
    g.add(localBox(matDado, 0, -0.7, 0, 1.3, 0.45, 0.08));
    scene.add(g);
  }

  function buildCliff() {
    const slopeSheet = (z0: number, z1: number, x0: number, x1: number, mat: THREE.Material, lift: number) => {
      const segZ = 16;
      const segX = 8;
      const row = segX + 1;
      const pos: number[] = [];
      const uv: number[] = [];
      const idx: number[] = [];
      for (let iz = 0; iz <= segZ; iz++) {
        const z = z0 + ((z1 - z0) * iz) / segZ;
        const y = slopeY(z) + lift;
        for (let ix = 0; ix <= segX; ix++) {
          const x = x0 + ((x1 - x0) * ix) / segX;
          pos.push(x, y, z);
          uv.push((ix / segX) * 5, (iz / segZ) * 8);
        }
      }
      for (let iz = 0; iz < segZ; iz++) {
        for (let ix = 0; ix < segX; ix++) {
          const a = iz * row + ix;
          idx.push(a, a + row, a + 1, a + 1, a + row, a + row + 1);
        }
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
      geo.setIndex(idx);
      geo.computeVertexNormals();
      const mesh = new THREE.Mesh(geo, mat);
      mesh.receiveShadow = true;
      scene.add(mesh);
    };
    slopeSheet(34, 178, -90, 80, matEarth, -0.2);
    slopeSheet(34, 172, -86, 76, matFoliage, 0.08);
    const valley = new THREE.Mesh(new THREE.PlaneGeometry(420, 180), matValley);
    valley.rotation.x = -Math.PI / 2;
    valley.position.set(10, -72, 310);
    scene.add(valley);

    curtain(-22, 38, -2, 50, 5.0);
    curtain(-2, 50, -40, 62, 4.8);
    curtain(-40, 62, 0, 76, 4.8);
    curtain(0, 76, -46, 92, 4.6);
    curtain(-46, 92, -4, 110, 4.6);
    curtain(-4, 110, -50, 128, 4.4);

    addPalm(-12, 44);
    addPalm(-22, 56);
    addPalm(-20, 70);
    addPalm(-24, 88);
    addTree(-32, 48, 1.5);
    addTree(6, 58, 1.6);
    addTree(-52, 80, 1.4);
    addTree(8, 100, 1.7);
    addTree(-20, 18, 1.1);
    addTree(36, 22, 0.9);
    addTree(-48, 8, 1.4);
    addPalm(18, 26);
    addPalm(-10, 24);
  }

  const controls = new OrbitControls(camera, canvas);
  controls.target.set(4, 8, 6);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 2.4;
  controls.maxDistance = 240;
  controls.maxPolarAngle = Math.PI * 0.985;
  controls.update();

  const timer = new THREE.Timer();
  timer.connect(document);
  const fromPos = new THREE.Vector3();
  const toPos = new THREE.Vector3();
  const fromTgt = new THREE.Vector3();
  const toTgt = new THREE.Vector3();
  let fly = 1;
  let locked = false;
  let activeView = "";
  let alive = true;
  let readySent = false;

  controls.addEventListener("start", () => {
    locked = false;
    fly = 1;
    camera.up.set(0, 1, 0);
    if (camera.fov !== 48) {
      camera.fov = 48;
      camera.updateProjectionMatrix();
    }
  });

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const hint = new THREE.Box3Helper(new THREE.Box3(), 0xc4a06a);
  hint.visible = false;
  hint.raycast = () => {};
  scene.add(hint);
  const partById = new Map(PARTS.map((part) => [part.id, part]));
  const pickables: THREE.Mesh[] = PARTS.map((part) => {
    const w = part.max[0] - part.min[0];
    const h = part.max[1] - part.min[1];
    const d = part.max[2] - part.min[2];
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshBasicMaterial());
    mesh.position.set((part.min[0] + part.max[0]) / 2, (part.min[1] + part.max[1]) / 2, (part.min[2] + part.max[2]) / 2);
    mesh.visible = false;
    mesh.userData.partId = part.id;
    scene.add(mesh);
    return mesh;
  });
  let hovered = "";
  let downX = 0;
  let downY = 0;
  let pickQueued = false;
  let lastX = 0;
  let lastY = 0;

  function partAt(clientX: number, clientY: number): PartInfo | null {
    const rect = canvas.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return null;
    pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(pickables, false)[0];
    const id = hit?.object.userData.partId as string | undefined;
    return id ? (partById.get(id) ?? null) : null;
  }

  function showHint(part: PartInfo | null) {
    if (!part) {
      hint.visible = false;
      return;
    }
    hint.box.set(
      new THREE.Vector3(part.min[0], part.min[1], part.min[2]),
      new THREE.Vector3(part.max[0], part.max[1], part.max[2]),
    );
    hint.visible = true;
  }

  function onMove(event: PointerEvent) {
    lastX = event.clientX;
    lastY = event.clientY;
    if (pickQueued) return;
    pickQueued = true;
    requestAnimationFrame(() => {
      pickQueued = false;
      const part = partAt(lastX, lastY);
      const id = part?.id ?? "";
      canvas.style.cursor = part ? "pointer" : "";
      if (id === hovered) return;
      hovered = id;
      showHint(part);
      hooks.onHover?.(part);
    });
  }

  function onDown(event: PointerEvent) {
    downX = event.clientX;
    downY = event.clientY;
  }

  function onUp(event: PointerEvent) {
    if (Math.hypot(event.clientX - downX, event.clientY - downY) > 8) return;
    const part = partAt(event.clientX, event.clientY);
    showHint(part);
    hovered = part?.id ?? "";
    hooks.onSelect?.(part);
  }

  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointerup", onUp);

  function resize() {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    if (w < 2 || h < 2) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }
  resize();
  const ro = new ResizeObserver(() => resize());
  ro.observe(canvas);

  function applyTime(id: string) {
    if (id === "noon") {
      scene.fog = new THREE.Fog(0x8eb4c8, 90, 260);
      scene.background = new THREE.Color(0x8ec4e4);
      sun.intensity = 2.35;
      sun.color.set(0xfff6e4);
      sun.position.set(12, 70, 8);
      renderer.toneMappingExposure = 1.08;
    } else if (id === "evening") {
      scene.fog = new THREE.Fog(0xb07050, 60, 200);
      scene.background = new THREE.Color(0xc4846a);
      sun.intensity = 1.45;
      sun.color.set(0xff8844);
      sun.position.set(-30, 18, 40);
      renderer.toneMappingExposure = 0.92;
    } else {
      scene.fog = new THREE.Fog(0xb5d0de, 120, 420);
      scene.background = new THREE.Color(0x9ec8e4);
      sun.intensity = 2.05;
      sun.color.set(0xfff1d6);
      sun.position.set(42, 52, 18);
      renderer.toneMappingExposure = 1.04;
    }
  }

  renderer.setAnimationLoop(() => {
    if (!alive) return;
    timer.update();
    const dt = Math.min(timer.getDelta(), 0.05);
    if (fly < 1) {
      fly = Math.min(1, fly + dt * 1.35);
      const k = 1 - (1 - fly) ** 3;
      camera.position.lerpVectors(fromPos, toPos, k);
      controls.target.lerpVectors(fromTgt, toTgt, k);
    }
    if (!locked) controls.update();
    if (locked) {
      const k = fly >= 1 ? 1 : 1 - (1 - fly) ** 3;
      camera.position.lerpVectors(fromPos, toPos, k);
      controls.target.lerpVectors(fromTgt, toTgt, k);
      if (activeView === "dome") camera.up.set(1, 0, 0);
      else camera.up.set(0, 1, 0);
      camera.lookAt(controls.target);
    }
    renderer.render(scene, camera);
    if (!readySent) {
      readySent = true;
      onReady();
    }
  });

  return {
    setView(id: string) {
      const preset = PRESETS[id];
      if (!preset) return;
      fromPos.copy(camera.position);
      fromTgt.copy(controls.target);
      toPos.set(preset.pos[0], preset.pos[1], preset.pos[2]);
      toTgt.set(preset.target[0], preset.target[1], preset.target[2]);
      fly = 0;
      locked = true;
      activeView = id;
      const fov = id === "rani" ? 58 : 48;
      if (camera.fov !== fov) {
        camera.fov = fov;
        camera.updateProjectionMatrix();
      }
    },
    setTime: applyTime,
    dispose() {
      alive = false;
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointerup", onUp);
      renderer.setAnimationLoop(null);
      controls.dispose();
      timer.disconnect();
      ro.disconnect();
      renderer.dispose();
    },
  };
}
