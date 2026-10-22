import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/* =====================================================================
   Osmonoro — Quyosh tizimi simulyatori (Three.js)
   Tashqi rasm, API kalit yoki server kerak emas: barcha teksturalar
   brauzerning oʻzida kod bilan chiziladi. Musiqa — musiqa.mp3 fayli.
   ===================================================================== */

const $ = (s) => document.querySelector(s);
const TAU = Math.PI * 2;
const Y_AXIS = new THREE.Vector3(0, 1, 0);
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------------------------------------------------------------
   1. Maʼlumotlar
   r      — sayyora radiusi (sahnadagi birlik)
   dist   — Quyoshdan masofa (sahnada siqilgan)
   period — Yer yili bilan oʻlchangan aylanish davri
   view   — kamera yaqinlashadigan masofa
   --------------------------------------------------------------------- */
const BODIES = [
  {
    id: 'sun', name: 'Quyosh', r: 6, dist: 0, period: 0, spin: 0.04, tilt: 0, view: 36, color: '#ffb347',
    desc: 'Tizimimizdagi yagona yulduz. Sayyoralarning hammasi uning atrofida aylanadi.',
    stats: [['Diametri', '1 392 700 km'], ['Sirt harorati', '≈ 5 500 °C'], ['Yoshi', '≈ 4,6 mlrd yil'],
            ['Massasi', 'tizim massasining 99,86%'], ['Turi', 'sariq mitti yulduz'], ['Yerdan kattaligi', '≈ 1,3 mln barobar hajm']],
  },
  {
    id: 'mercury', name: 'Merkuriy', r: 0.55, dist: 13, period: 0.24, spin: 0.25, tilt: 0.03, view: 4.2, color: '#b5aca2',
    desc: 'Quyoshga eng yaqin va eng kichik sayyora. Atmosferasi deyarli yoʻq.',
    stats: [['Diametri', '4 879 km'], ['Quyoshgacha', '57,9 mln km'], ['Yili', '88 Yer kuni'],
            ['Sutkasi', '58,6 Yer kuni'], ['Yoʻldoshlari', 'yoʻq'], ['Harorati', '−180 … 430 °C']],
  },
  {
    id: 'venus', name: 'Venera', r: 0.95, dist: 19, period: 0.62, spin: -0.12, tilt: 3.1, view: 6, color: '#e3c27e',
    desc: 'Eng issiq sayyora: qalin gaz qatlami issiqni ushlab turadi.',
    stats: [['Diametri', '12 104 km'], ['Quyoshgacha', '108,2 mln km'], ['Yili', '224,7 Yer kuni'],
            ['Sutkasi', '243 Yer kuni (teskari)'], ['Yoʻldoshlari', 'yoʻq'], ['Harorati', '≈ 465 °C']],
  },
  {
    id: 'earth', name: 'Yer', r: 1.0, dist: 26, period: 1, spin: 0.9, tilt: 0.41, view: 6.2, color: '#4f9be0',
    desc: 'Hayot maʼlum boʻlgan yagona sayyora. Yuzasining qariyb 71 foizi suv.',
    stats: [['Diametri', '12 742 km'], ['Quyoshgacha', '149,6 mln km'], ['Yili', '365,25 kun'],
            ['Sutkasi', '23 soat 56 daqiqa'], ['Yoʻldoshlari', '1 ta (Oy)'], ['Harorati', 'oʻrtacha ≈ 15 °C']],
  },
  {
    id: 'moon', name: 'Oy', r: 0.27, dist: 2.3, period: 0.35, spin: 0, tilt: 0.1, view: 2.2, color: '#c9c9c9', parent: 'earth',
    desc: 'Yerning yagona tabiiy yoʻldoshi. Doim bir tomoni bilan Yerga qaraydi.',
    stats: [['Diametri', '3 474 km'], ['Yergacha', '384 400 km'], ['Yer atrofida', '27,3 kun'],
            ['Sutkasi', '27,3 kun'], ['Tortishishi', 'Yernikining 1/6 qismi'], ['Harorati', '−173 … 127 °C']],
  },
  {
    id: 'mars', name: 'Mars', r: 0.72, dist: 33, period: 1.88, spin: 0.85, tilt: 0.44, view: 5, color: '#d1693f',
    desc: 'Qizil sayyora. Tuprogʻidagi temir oksidi unga qizil tus beradi.',
    stats: [['Diametri', '6 779 km'], ['Quyoshgacha', '227,9 mln km'], ['Yili', '687 Yer kuni'],
            ['Sutkasi', '24 soat 37 daqiqa'], ['Yoʻldoshlari', '2 ta (Fobos, Deymos)'], ['Harorati', 'oʻrtacha ≈ −63 °C']],
  },
  {
    id: 'jupiter', name: 'Yupiter', r: 2.9, dist: 52, period: 11.86, spin: 1.7, tilt: 0.05, view: 15, color: '#d8b48a',
    desc: 'Eng katta sayyora. Katta Qizil Dogʻ — asrlardan beri davom etayotgan boʻron.',
    stats: [['Diametri', '139 820 km'], ['Quyoshgacha', '778,5 mln km'], ['Yili', '11,9 Yer yili'],
            ['Sutkasi', '9 soat 56 daqiqa'], ['Yoʻldoshlari', '90 tadan ortiq'], ['Harorati', 'bulut usti ≈ −110 °C']],
  },
  {
    id: 'saturn', name: 'Saturn', r: 2.4, dist: 73, period: 29.4, spin: 1.6, tilt: 0.47, view: 15, color: '#e2cf9f', ring: true,
    desc: 'Muz va tosh boʻlaklaridan iborat goʻzal halqalari bilan mashhur.',
    stats: [['Diametri', '116 460 km'], ['Quyoshgacha', '1 433,5 mln km'], ['Yili', '29,4 Yer yili'],
            ['Sutkasi', '10 soat 34 daqiqa'], ['Yoʻldoshlari', '270 tadan ortiq'], ['Harorati', 'bulut usti ≈ −140 °C']],
  },
  {
    id: 'uranus', name: 'Uran', r: 1.6, dist: 93, period: 84, spin: -1.0, tilt: 1.71, view: 8.5, color: '#95dde3',
    desc: 'Yon tomoni bilan aylanadi: oʻqi deyarli orbita tekisligida yotadi.',
    stats: [['Diametri', '50 724 km'], ['Quyoshgacha', '2 872 mln km'], ['Yili', '84 Yer yili'],
            ['Sutkasi', '17 soat 14 daqiqa (teskari)'], ['Yoʻldoshlari', '29 ta'], ['Harorati', '≈ −195 °C']],
  },
  {
    id: 'neptune', name: 'Neptun', r: 1.55, dist: 111, period: 164.8, spin: 1.0, tilt: 0.49, view: 8.5, color: '#4a74e8',
    desc: 'Eng uzoq sayyora. Unda Quyosh tizimidagi eng kuchli shamollar esadi.',
    stats: [['Diametri', '49 244 km'], ['Quyoshgacha', '4 495 mln km'], ['Yili', '164,8 Yer yili'],
            ['Sutkasi', '16 soat 6 daqiqa'], ['Yoʻldoshlari', '16 ta'], ['Harorati', '≈ −200 °C']],
  },
];

const YEAR_SECONDS = 40;   // 1× tezlikda Yer yili necha soniya davom etadi
const TOUR = ['sun', 'mercury', 'venus', 'earth', 'moon', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
const MAX_REC_SECONDS = 90;

/* ---------------------------------------------------------------------
   2. Protsedural shovqin va teksturalar
   --------------------------------------------------------------------- */
/* Tekstura yaratish kutubxonasi: bir xil kod ham asosiy oqimda, ham Web Worker ichida ishlaydi.
   Funksiya oʻzi toʻliq mustaqil (tashqi oʻzgaruvchilarga tayanmaydi). */
function textureKit() {
  const TAU = Math.PI * 2;
  function hash3(x, y, z) {
    let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(z, 1440662683);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  }
  const lerp = (a, b, t) => a + (b - a) * t;
  const fade = (t) => t * t * (3 - 2 * t);

  function noise3(x, y, z) {
    const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
    const xf = fade(x - xi), yf = fade(y - yi), zf = fade(z - zi);
    return lerp(
      lerp(
        lerp(hash3(xi, yi, zi), hash3(xi + 1, yi, zi), xf),
        lerp(hash3(xi, yi + 1, zi), hash3(xi + 1, yi + 1, zi), xf),
        yf
      ),
      lerp(
        lerp(hash3(xi, yi, zi + 1), hash3(xi + 1, yi, zi + 1), xf),
        lerp(hash3(xi, yi + 1, zi + 1), hash3(xi + 1, yi + 1, zi + 1), xf),
        yf
      ),
      zf
    );
  }

  function fbm(x, y, z, oct = 4) {
    let sum = 0, amp = 0.5, norm = 0;
    for (let i = 0; i < oct; i++) {
      sum += amp * noise3(x, y, z);
      norm += amp;
      x *= 2.03; y *= 2.03; z *= 2.03;
      amp *= 0.5;
    }
    return sum / norm;
  }

  const hex = (h) => [(h >> 16) & 255, (h >> 8) & 255, h & 255];
  const mix = (a, b, t) => {
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  };
  const smooth = (a, b, x) => {
    const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  };
  const WHITE = [255, 255, 255];

  const COL = {
    sunA: hex(0xff5a00), sunB: hex(0xffe27a), sunC: hex(0xfff2b8),
    merA: hex(0x6e675f), merB: hex(0xc7bfb4),
    venA: hex(0xb98a4b), venB: hex(0xf0dca8),
    deep: hex(0x0a2766), sea: hex(0x1d63b0), shallow: hex(0x46b0cc),
    grass: hex(0x2e7d3c), forest: hex(0x1f5e34), sand: hex(0xb39a5e), rock: hex(0x7c6f60), snow: hex(0xf2f6fb),
    marA: hex(0x8f3a1d), marB: hex(0xd68a52), marDark: hex(0x4a2418),
    jupA: hex(0xefe0c0), jupB: hex(0xa8633a), jupC: hex(0x7a4630), jupSpot: hex(0xb5442a),
    satA: hex(0xeadbb0), satB: hex(0xbf9f6c),
    uraA: hex(0x86d6dc), uraB: hex(0xaef0f2),
    nepA: hex(0x2849c2), nepB: hex(0x5a88f5),
    moonA: hex(0x5d5d5d), moonB: hex(0xc4c4c4),
    skyA: hex(0x1a2050), skyB: hex(0xd8b89a),
    city: hex(0xffc878),
  };

  // Somon yoʻli tekisligining normali
  const GAL = (() => {
    const x = 0.32, y = 0.82, z = 0.47, l = Math.hypot(x, y, z);
    return { x: x / l, y: y / l, z: z / l };
  })();

  // Quruqlik/dengiz chegarasi (Yer uchun)
  const earthHeight = (x, y, z) => fbm(x * 2 + 7, y * 2, z * 2, 5);
  const SEA_LEVEL = 0.54;

  const SHADERS = {
    sky(x, y, z) {
      const d = x * GAL.x + y * GAL.y + z * GAL.z;
      const band = Math.exp(-(d * d) / 0.03);
      const n1 = fbm(x * 3 + 5, y * 3, z * 3, 5);
      const n2 = fbm(x * 9, y * 9 + 3, z * 9, 4);
      const dust = smooth(0.45, 0.7, n2);
      const v = band * (0.25 + 0.9 * n1) * (1 - 0.55 * dust);
      const c = mix(COL.skyA, COL.skyB, smooth(0.2, 0.8, n1) * band);
      return [3 + c[0] * v * 0.55, 4 + c[1] * v * 0.55, 10 + c[2] * v * 0.55];
    },
    sun(x, y, z) {
      const n = fbm(x * 4, y * 4, z * 4, 5);
      const g = fbm(x * 14 + 3, y * 14, z * 14, 3);
      const spots = smooth(0.62, 0.7, fbm(x * 6 + 11, y * 6, z * 6, 3));
      let c = mix(COL.sunA, COL.sunB, n * 1.4 - 0.15 + (g - 0.5) * 0.3);
      c = mix(c, COL.sunC, smooth(0.62, 0.8, g) * 0.35);
      return mix(c, COL.sunA, spots * 0.45);
    },
    mercury(x, y, z) {
      const n = fbm(x * 3 + 1, y * 3, z * 3, 5);
      const c = fbm(x * 9, y * 9, z * 9 + 4, 3);
      return mix(COL.merA, COL.merB, n * 1.3 - 0.1 - Math.max(0, c - 0.6) * 1.2);
    },
    venus(x, y, z) {
      const w = fbm(x * 3, y * 3, z * 3, 3) * 1.5;
      const w2 = fbm(x * 2.2 + w, y * 4, z * 2.2, 4);
      const streak = Math.sin((y + w2 * 0.35) * 22) * 0.5 + 0.5;
      return mix(COL.venA, COL.venB, w2 * 1.1 - 0.05 + streak * 0.12);
    },
    earth(x, y, z) {
      const h = earthHeight(x, y, z);
      let c;
      if (h < SEA_LEVEL) {
        const d = h / SEA_LEVEL;
        c = d < 0.86 ? mix(COL.deep, COL.sea, d / 0.86) : mix(COL.sea, COL.shallow, (d - 0.86) / 0.14);
      } else {
        const e = (h - SEA_LEVEL) / 0.2;
        const dry = smooth(0, 0.5, 0.45 - Math.abs(y)) * fbm(x * 4 + 3, y * 4, z * 4, 3);
        c = mix(COL.forest, COL.grass, fbm(x * 6, y * 6, z * 6, 3) * 1.2);
        c = mix(c, COL.sand, dry * 1.3);
        c = mix(c, COL.rock, e * e * 1.2);
      }
      const ice = Math.abs(y) + (fbm(x * 5, y * 5, z * 5, 2) - 0.5) * 0.12;
      if (ice > 0.88) c = mix(c, COL.snow, smooth(0.88, 0.92, ice));
      return c;
    },
    earthClouds(x, y, z) {
      const w = fbm(x * 2, y * 3, z * 2, 3) * 0.8;
      const cl = smooth(0.54, 0.74, fbm(x * 3 + 20 + w, y * 5, z * 3, 5));
      return [255, 255, 255, cl * 235];
    },
    earthLights(x, y, z) {
      if (earthHeight(x, y, z) < SEA_LEVEL + 0.01 || Math.abs(y) > 0.78) return [0, 0, 0];
      const dense = smooth(0.46, 0.62, fbm(x * 5 + 2, y * 5, z * 5, 3));
      const dots = smooth(0.6, 0.76, fbm(x * 16 + 1, y * 16, z * 16, 3));
      const v = dense * dots;
      return [COL.city[0] * v, COL.city[1] * v, COL.city[2] * v];
    },
    moon(x, y, z) {
      const n = fbm(x * 3, y * 3, z * 3, 5);
      const maria = smooth(0.45, 0.6, fbm(x * 1.6 + 9, y * 1.6, z * 1.6, 3));
      const c = fbm(x * 12, y * 12, z * 12 + 2, 3);
      return mix(COL.moonA, COL.moonB, n * 1.2 - maria * 0.35 - Math.max(0, c - 0.62) * 1.0);
    },
    mars(x, y, z) {
      const n = fbm(x * 3, y * 3, z * 3, 5);
      const m = fbm(x * 7 + 5, y * 7, z * 7, 3);
      let c = mix(COL.marA, COL.marB, n * 1.3 - 0.1);
      if (m < 0.42) c = mix(c, COL.marDark, (0.42 - m) * 2.6);
      if (Math.abs(y) > 0.93) c = mix(c, WHITE, smooth(0.93, 0.97, Math.abs(y)) * 0.9);
      return c;
    },
    jupiter(x, y, z, lat, lon) {
      const warp = fbm(x * 2, y * 6, z * 2, 4);
      const band = Math.sin(lat * 16 + warp * 4) * 0.5 + 0.5;
      const fine = Math.sin(lat * 41 + warp * 9) * 0.5 + 0.5;
      const b2 = fbm(x * 1.5, y * 14, z * 1.5, 3);
      let c = mix(COL.jupA, COL.jupB, band * 0.75 + b2 * 0.45 - 0.15);
      c = mix(c, COL.jupC, smooth(0.6, 0.95, fine) * 0.28 * band);
      const dx = ((lon - 3.5) * Math.cos(lat)) / 0.3;
      const dy = (lat + 0.35) / 0.15;
      const d = Math.hypot(dx, dy);
      if (d < 1) c = mix(c, COL.jupSpot, (1 - d) * 1.1);
      else if (d < 1.5) c = mix(c, COL.jupC, (1.5 - d) * 0.25);
      return c;
    },
    saturn(x, y, z, lat) {
      const warp = fbm(x * 2, y * 5, z * 2, 3);
      const band = Math.sin(lat * 22 + warp * 3) * 0.5 + 0.5;
      return mix(COL.satA, COL.satB, band * 0.65 + fbm(x, y * 12, z, 3) * 0.3 - 0.1);
    },
    uranus(x, y, z, lat) {
      const band = Math.sin(lat * 10 + fbm(x * 2, y * 4, z * 2, 3) * 2) * 0.5 + 0.5;
      return mix(COL.uraA, COL.uraB, band * 0.7);
    },
    neptune(x, y, z, lat) {
      const warp = fbm(x * 2, y * 5, z * 2, 4);
      const band = Math.sin(lat * 12 + warp * 3) * 0.5 + 0.5;
      const c = mix(COL.nepA, COL.nepB, band * 0.75 + (warp - 0.5) * 0.4);
      const streak = smooth(0.68, 0.8, fbm(x * 5 + 9, y * 12, z * 5, 3));
      return mix(c, WHITE, streak * 0.35);
    },
  };

  function generate(name, w, h) {
    const shade = SHADERS[name];
    const out = new Uint8ClampedArray(w * h * 4);
    for (let j = 0; j < h; j++) {
      const lat = (0.5 - (j + 0.5) / h) * Math.PI;
      const y = Math.sin(lat), cl = Math.cos(lat);
      for (let i = 0; i < w; i++) {
        const lon = ((i + 0.5) / w) * TAU;
        const col = shade(cl * Math.cos(lon), y, cl * Math.sin(lon), lat, lon);
        const k = (j * w + i) * 4;
        out[k] = col[0];
        out[k + 1] = col[1];
        out[k + 2] = col[2];
        out[k + 3] = col.length > 3 ? col[3] : 255;
      }
    }
    return out;
  }

  return { generate, noise3 };
}

const kitMain = textureKit();

const TEXTURE_PLAN = [
  ['earth', 1024, 512],
  ['jupiter', 1024, 512],
  ['earthClouds', 768, 384],
  ['saturn', 640, 320],
  ['sky', 512, 256],
  ['sun', 512, 256],
  ['earthLights', 512, 256],
  ['venus', 512, 256],
  ['mars', 512, 256],
  ['neptune', 512, 256],
  ['mercury', 512, 256],
  ['moon', 512, 256],
  ['uranus', 512, 256],
];

const nextTick = () => new Promise((r) => setTimeout(r, 0));
const TEX_VERSION = 'v1';
const texKey = (name, w, h) => `${TEX_VERSION}:${name}:${w}x${h}`;

function toTexture(px, w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  c.getContext('2d').putImageData(new ImageData(px, w, h), 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

// Tayyor teksturalarni brauzer xotirasida (IndexedDB) saqlash: keyingi ochilishda darhol yuklanadi
const idb = {
  db: null,
  open() {
    return new Promise((res) => {
      try {
        const r = indexedDB.open('osmonoro-tex', 1);
        r.onupgradeneeded = () => r.result.createObjectStore('t');
        r.onsuccess = () => { idb.db = r.result; res(true); };
        r.onerror = () => res(false);
        r.onblocked = () => res(false);
      } catch (err) {
        res(false);
      }
    });
  },
  get(key) {
    return new Promise((res) => {
      if (!idb.db) return res(null);
      try {
        const q = idb.db.transaction('t').objectStore('t').get(key);
        q.onsuccess = () => res(q.result || null);
        q.onerror = () => res(null);
      } catch (err) {
        res(null);
      }
    });
  },
  put(key, val) {
    try {
      if (idb.db) idb.db.transaction('t', 'readwrite').objectStore('t').put(val, key);
    } catch (err) { /* muhim emas */ }
  },
};

function makeWorkerPool(n) {
  const src = `const kit = (${textureKit.toString()})();
    self.onmessage = (e) => {
      const { name, w, h } = e.data;
      const px = kit.generate(name, w, h);
      self.postMessage({ name, w, h, px }, [px.buffer]);
    };`;
  const url = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));
  const workers = [];
  try {
    for (let i = 0; i < n; i++) workers.push(new Worker(url));
  } catch (err) {
    workers.forEach((x) => x.terminate());
    URL.revokeObjectURL(url);
    throw err;
  }
  return { workers, url };
}

async function buildTextures(onProgress) {
  const out = {};
  const total = TEXTURE_PLAN.reduce((s, [, w, h]) => s + w * h, 0);
  let done = 0;
  const pending = [];

  await idb.open();
  for (const [name, w, h] of TEXTURE_PLAN) {
    const buf = await idb.get(texKey(name, w, h));
    if (buf && buf.byteLength === w * h * 4) {
      out[name] = toTexture(new Uint8ClampedArray(buf), w, h);
      done += w * h;
    } else {
      pending.push([name, w, h]);
    }
  }
  onProgress(done / total);

  if (pending.length) {
    pending.sort((a, b) => b[1] * b[2] - a[1] * a[2]);

    // 1) Web Worker lar bilan parallel yaratish (ekran qotmaydi)
    let pool = null;
    try {
      pool = makeWorkerPool(Math.min(4, Math.max(2, navigator.hardwareConcurrency || 2)));
    } catch (err) {
      pool = null;
    }
    if (pool) {
      try {
        await new Promise((resolve, reject) => {
          let next = 0, running = 0;
          const launch = (wk) => {
            if (next >= pending.length) {
              if (running === 0) resolve();
              return;
            }
            const [name, w, h] = pending[next++];
            running++;
            wk.onmessage = (e) => {
              const { name: nm, w: ww, h: hh, px } = e.data;
              idb.put(texKey(nm, ww, hh), px.buffer.slice(0));
              out[nm] = toTexture(px, ww, hh);
              done += ww * hh;
              onProgress(done / total);
              running--;
              launch(wk);
            };
            wk.onerror = (err) => reject(err);
            wk.postMessage({ name, w, h });
          };
          pool.workers.forEach(launch);
        });
      } catch (err) {
        console.warn('Worker ishlamadi, asosiy oqimda davom etamiz', err);
      }
      pool.workers.forEach((x) => x.terminate());
      URL.revokeObjectURL(pool.url);
    }

    // 2) Qolganini (yoki worker ishlamasa hammasini) asosiy oqimda yaratish
    for (const [name, w, h] of pending) {
      if (out[name]) continue;
      await nextTick();
      const px = kitMain.generate(name, w, h);
      idb.put(texKey(name, w, h), px.buffer.slice(0));
      out[name] = toTexture(px, w, h);
      done += w * h;
      onProgress(done / total);
    }
  }
  return out;
}

function makeRingTexture() {
  const w = 1024;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = 2;
  const g = c.getContext('2d');
  for (let i = 0; i < w; i++) {
    const t = i / (w - 1);
    let a = 0;
    if (t > 0.06) a = 0.35;
    if (t > 0.2) a = 0.8;
    if (t > 0.62 && t < 0.68) a = 0.06;
    if (t >= 0.68) a = 0.64;
    if (t > 0.92) a *= 1 - (t - 0.92) / 0.08;
    a *= 0.72 + 0.28 * kitMain.noise3(t * 70, 1.3, 2.7);
    const s = 0.8 + 0.2 * kitMain.noise3(t * 110, 0.5, 0.5);
    g.fillStyle = `rgba(${(226 * s) | 0},${(206 * s) | 0},${(166 * s) | 0},${a.toFixed(3)})`;
    g.fillRect(i, 0, 1, 2);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function glowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.18, 'rgba(255,255,255,0.65)');
  grad.addColorStop(0.45, 'rgba(255,255,255,0.18)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}

function dotTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 32;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(16, 16, 0, 16, 16, 16);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.5, 'rgba(255,255,255,0.7)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 32, 32);
  return new THREE.CanvasTexture(c);
}

/* ---------------------------------------------------------------------
   3. Sahna
   --------------------------------------------------------------------- */
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas: $('#scene'), antialias: true, powerPreference: 'high-performance' });
} catch (err) {
  $('#loaderText').textContent = 'Qurilmangiz WebGL ni qoʻllab-quvvatlamaydi.';
  throw err;
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x05060f);

const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 6000);
camera.position.set(0, 230, 500);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.07;
controls.enablePan = false;
controls.rotateSpeed = 0.7;
controls.zoomSpeed = 0.8;
controls.minDistance = 12;
controls.maxDistance = 650;

scene.add(new THREE.AmbientLight(0x3a4170, 0.55));
scene.add(new THREE.PointLight(0xfff2dd, 3.2, 0, 0));

// Quyosh holati kamera fazosida (atmosfera va shahar chiroqlari uchun)
const SUN_V = { value: new THREE.Vector3() };

const SPHERE = new THREE.SphereGeometry(1, 96, 64);

/* Yulduzlar */
(function addStars() {
  const N = 2600;
  const pos = new Float32Array(N * 3);
  const col = new Float32Array(N * 3);
  const c = new THREE.Color();
  for (let i = 0; i < N; i++) {
    const u = Math.random() * 2 - 1;
    const a = Math.random() * TAU;
    const s = Math.sqrt(1 - u * u);
    const r = 2300 + Math.random() * 600;
    pos[i * 3] = r * s * Math.cos(a);
    pos[i * 3 + 1] = r * u;
    pos[i * 3 + 2] = r * s * Math.sin(a);
    const k = Math.random();
    c.setHSL(k < 0.6 ? 0.62 : k < 0.85 ? 0.1 : 0.0, 0.5, 0.65 + Math.random() * 0.3);
    col[i * 3] = c.r;
    col[i * 3 + 1] = c.g;
    col[i * 3 + 2] = c.b;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const mat = new THREE.PointsMaterial({
    size: 2.4, sizeAttenuation: false, vertexColors: true, map: dotTexture(),
    transparent: true, depthWrite: false, opacity: 0.95, toneMapped: false,
  });
  const stars = new THREE.Points(geo, mat);
  stars.renderOrder = -1;
  scene.add(stars);
})();

/* Asteroidlar belbogʻi (Mars va Yupiter orasida) */
const belt = (function addBelt() {
  const N = 2400;
  const pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const a = Math.random() * TAU;
    const r = 38.5 + ((Math.random() + Math.random()) / 2) * 8;
    pos[i * 3] = Math.cos(a) * r;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 1.6;
    pos[i * 3 + 2] = Math.sin(a) * r;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    size: 1.6, sizeAttenuation: false, color: 0xa39a8c, map: dotTexture(),
    transparent: true, depthWrite: false, opacity: 0.8, toneMapped: false,
  });
  const pts = new THREE.Points(geo, mat);
  scene.add(pts);
  return pts;
})();

/* Atmosfera nuri: faqat Quyosh tomonidagi chetda porlaydi */
function atmosphere(radius, color, power, intensity) {
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      c: { value: new THREE.Color(color) },
      p: { value: power },
      k: { value: intensity },
      sunV: SUN_V,
    },
    vertexShader: `
      varying vec3 vN; varying vec3 vP;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vP = mv.xyz;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      uniform vec3 c; uniform float p; uniform float k; uniform vec3 sunV;
      varying vec3 vN; varying vec3 vP;
      void main() {
        vec3 V = normalize(-vP);
        float rim = pow(1.0 - max(dot(vN, V), 0.0), p);
        vec3 S = normalize(sunV - vP);
        float lit = smoothstep(-0.25, 0.6, dot(vN, S));
        gl_FragColor = vec4(c * rim * k * lit, 1.0);
      }`,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const m = new THREE.Mesh(SPHERE, mat);
  m.scale.setScalar(radius * 1.14);
  return m;
}

const ATMOS = {
  venus: [0xffd28a, 2.6, 1.0],
  earth: [0x5aa8ff, 3.0, 1.45],
  mars: [0xff9b6a, 3.5, 0.6],
  jupiter: [0xe8c9a0, 4.0, 0.35],
  saturn: [0xe8d9a8, 4.0, 0.35],
  uranus: [0x9ff0ff, 3.0, 0.9],
  neptune: [0x5f8dff, 3.0, 1.0],
};

const BUMP = { mercury: 2.2, moon: 2.4, mars: 1.6, earth: 0.9 };

function planetMaterial(def, tex) {
  if (def.id === 'sun') return new THREE.MeshBasicMaterial({ map: tex.sun, toneMapped: false });
  const opts = { map: tex[def.id], roughness: 1, metalness: 0 };
  if (BUMP[def.id]) {
    opts.bumpMap = tex[def.id];
    opts.bumpScale = BUMP[def.id];
  }
  const m = new THREE.MeshStandardMaterial(opts);
  if (def.id === 'earth') {
    // Yerning tun tomonida shahar chiroqlari yonadi
    m.roughness = 0.8;
    m.emissive = new THREE.Color(0xffffff);
    m.emissiveMap = tex.earthLights;
    m.emissiveIntensity = 1.25;
    m.onBeforeCompile = (sh) => {
      sh.uniforms.sunV = SUN_V;
      sh.fragmentShader = 'uniform vec3 sunV;\n' + sh.fragmentShader.replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
         float nightDot = dot(normalize(normal), normalize(sunV + vViewPosition));
         totalEmissiveRadiance *= (1.0 - smoothstep(-0.12, 0.18, nightDot));`
      );
    };
  }
  return m;
}

/* ---------------------------------------------------------------------
   4. Jismlarni yaratish
   --------------------------------------------------------------------- */
const byId = {};
const list = [];
const hitMeshes = [];
const labelsEl = $('#labels');
const sunGlows = [];

function buildBodies(tex) {
  for (const def of BODIES) {
    const b = { ...def };
    b.phase = Math.random() * TAU;
    b.omega = def.period ? TAU / (YEAR_SECONDS * def.period) : 0;

    b.pivot = new THREE.Object3D();
    b.holder = new THREE.Object3D();
    b.holder.position.x = def.dist;
    b.pivot.add(b.holder);

    b.tiltGroup = new THREE.Group();
    b.tiltGroup.rotation.z = def.tilt;
    b.holder.add(b.tiltGroup);

    b.mesh = new THREE.Mesh(SPHERE, planetMaterial(def, tex));
    b.mesh.scale.setScalar(def.r);
    b.mesh.rotation.y = Math.random() * TAU;
    b.tiltGroup.add(b.mesh);

    if (def.id === 'earth') {
      b.clouds = new THREE.Mesh(SPHERE, new THREE.MeshStandardMaterial({
        map: tex.earthClouds, transparent: true, depthWrite: false, roughness: 1, metalness: 0,
      }));
      b.clouds.scale.setScalar(def.r * 1.012);
      b.tiltGroup.add(b.clouds);
    }

    if (ATMOS[def.id]) {
      const [color, power, k] = ATMOS[def.id];
      b.tiltGroup.add(atmosphere(def.r, color, power, k));
    }

    if (def.ring) {
      const inner = def.r * 1.35, outer = def.r * 2.45;
      const geo = new THREE.RingGeometry(inner, outer, 128, 1);
      const pos = geo.attributes.position, uv = geo.attributes.uv, v = new THREE.Vector3();
      for (let i = 0; i < pos.count; i++) {
        v.fromBufferAttribute(pos, i);
        uv.setXY(i, (v.length() - inner) / (outer - inner), 0.5);
      }
      const ringMat = new THREE.MeshStandardMaterial({
        map: tex.ring, transparent: true, side: THREE.DoubleSide, depthWrite: false,
        roughness: 1, emissive: 0xffffff, emissiveMap: tex.ring, emissiveIntensity: 0.22,
      });
      const ring = new THREE.Mesh(geo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      b.tiltGroup.add(ring);
    }

    // Bosish uchun koʻrinmas, ekranda kamida bir necha piksel boʻladigan sfera
    b.hit = new THREE.Mesh(SPHERE, new THREE.MeshBasicMaterial({ visible: false }));
    b.hit.userData.id = def.id;
    b.holder.add(b.hit);
    hitMeshes.push(b.hit);

    // Orbita chizigʻi (Oy uchun yoʻq)
    if (def.dist && !def.parent) {
      const pts = [];
      for (let i = 0; i <= 256; i++) {
        const a = (i / 256) * TAU;
        pts.push(new THREE.Vector3(Math.cos(a) * def.dist, 0, Math.sin(a) * def.dist));
      }
      b.orbit = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color: 0x7885c4, transparent: true, opacity: 0.3 })
      );
      scene.add(b.orbit);
    }

    // Nom yozuvi
    b.label = document.createElement('div');
    b.label.className = 'label';
    b.label.textContent = def.name;
    labelsEl.appendChild(b.label);

    byId[def.id] = b;
    list.push(b);
  }

  // Ierarxiya: Oy — Yer ichida, qolganlari sahnada
  for (const b of list) {
    if (b.parent) byId[b.parent].holder.add(b.pivot);
    else scene.add(b.pivot);
  }

  // Quyosh nuri (yorugʻlik halosi)
  const gt = glowTexture();
  const g1 = new THREE.Sprite(new THREE.SpriteMaterial({
    map: gt, color: 0xffb347, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, toneMapped: false,
  }));
  g1.scale.setScalar(36);
  const g2 = new THREE.Sprite(new THREE.SpriteMaterial({
    map: gt, color: 0xff7a2e, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.35, toneMapped: false,
  }));
  g2.scale.setScalar(100);
  scene.add(g1, g2);
  sunGlows.push(g1, g2);

  // Somon yoʻli bilan toʻldirilgan osmon
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(3500, 48, 32),
    new THREE.MeshBasicMaterial({ map: tex.sky, side: THREE.BackSide, depthWrite: false, toneMapped: false })
  );
  sky.renderOrder = -2;
  scene.add(sky);
}

/* ---------------------------------------------------------------------
   5. Holat va interfeys
   --------------------------------------------------------------------- */
let focus = null;
let settle = 0;
let settleDur = 1.8;
let desired = 210;
let speed = 4;
let simTime = 0;
let orbitsOn = true;
let labelsOn = true;
let musicOn = true;
let infoOpen = false;
let viewOffset = 0;

// Avto sayr
let tourOn = false;
let tourIdx = 0;
let tourT = 0;
let flyDir = null;

const chipsEl = $('#chips');
const infoEl = $('#info');
const hintEl = $('#hint');

function setPressed(sel, on) {
  const el = $(sel);
  el.setAttribute('aria-pressed', String(on));
  el.classList.toggle('on', on);
}

function toast(msg, ms = 3400) {
  const el = $('#toast');
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(toast.t);
  toast.t = setTimeout(() => { el.hidden = true; }, ms);
}

function buildChips() {
  const all = document.createElement('button');
  all.type = 'button';
  all.className = 'chip on';
  all.dataset.id = 'all';
  all.innerHTML = '<i class="all"></i>Umumiy';
  all.addEventListener('click', () => setFocus(null));
  chipsEl.appendChild(all);

  for (const b of list) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'chip';
    btn.dataset.id = b.id;
    btn.innerHTML = `<i style="background:${b.color}"></i>${b.name}`;
    btn.addEventListener('click', () => setFocus(focus && focus.id === b.id ? null : b.id));
    chipsEl.appendChild(btn);
  }
}

function computeFlyDir() {
  // Kamera Quyosh tomondan, biroz yon va yuqoridan yaqinlashadi (sayyora yoritilgan koʻrinadi)
  const P = focus.holder.getWorldPosition(new THREE.Vector3());
  const dir = P.lengthSq() < 1e-4 ? new THREE.Vector3(0.3, 0, 1) : P.clone().negate().normalize();
  dir.applyAxisAngle(Y_AXIS, 0.7);
  dir.y += 0.22;
  return dir.normalize();
}

function setFocus(id, fromTour = false) {
  if (!fromTour && tourOn) stopTour(true);
  focus = id ? byId[id] : null;
  settle = 0;
  settleDur = tourOn ? 2.6 : 1.8;
  desired = focus ? focus.view : 210;
  flyDir = tourOn && focus ? computeFlyDir() : null;
  controls.minDistance = focus ? focus.r * 1.8 : 12;

  chipsEl.querySelectorAll('.chip').forEach((el) => {
    const on = el.dataset.id === (id || 'all');
    el.classList.toggle('on', on);
    if (on) el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', inline: 'center', block: 'nearest' });
  });

  for (const b of list) {
    if (!b.orbit) continue;
    const active = focus && b.id === focus.id;
    b.orbit.material.color.set(active ? 0xffc46b : 0x7885c4);
    b.orbit.material.opacity = active ? 0.85 : 0.3;
  }

  if (focus) {
    $('#infoName').textContent = focus.name;
    $('#infoDesc').textContent = focus.desc;
    $('#infoStats').innerHTML = focus.stats
      .map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`)
      .join('');
    hideHint();
  }
  syncInfo();
}

// Maʼlumot kartasi: sayyora tanlangan va Avto sayr oʻchiq boʻlsagina koʻrinadi
function syncInfo() {
  const show = !!focus && !tourOn;
  infoEl.hidden = !show;
  if (show) {
    infoEl.style.animation = 'none';
    void infoEl.offsetWidth;
    infoEl.style.animation = '';
  }
  infoOpen = show;
}

function hideHint() {
  hintEl.classList.add('gone');
}
setTimeout(hideHint, 9000);

$('#infoClose').addEventListener('click', () => setFocus(null));

$('#speed').addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  speed = Number(btn.dataset.s);
  $('#speed').querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === btn));
});

function bindToggle(sel, onChange) {
  const el = $(sel);
  el.addEventListener('click', () => {
    const on = el.getAttribute('aria-pressed') !== 'true';
    setPressed(sel, on);
    onChange(on);
  });
}
bindToggle('#tglOrbits', (on) => {
  orbitsOn = on;
  for (const b of list) if (b.orbit) b.orbit.visible = on;
  belt.visible = on;
});
bindToggle('#tglLabels', (on) => {
  labelsOn = on;
});
bindToggle('#tglTour', (on) => (on ? startTour() : stopTour()));
bindToggle('#tglMusic', (on) => setMusic(on));

/* ---------------------------------------------------------------------
   6. Avto sayr: kamera har bir sayyora yonidan oʻtadi
   --------------------------------------------------------------------- */
function startTour() {
  tourOn = true;
  tourIdx = 0;
  setPressed('#tglTour', true);
  tourStep();
}

function tourStep() {
  tourT = 0;
  setFocus(TOUR[tourIdx], true);
}

function stopTour(skipSync = false) {
  if (!tourOn) return;
  tourOn = false;
  setPressed('#tglTour', false);
  if (!skipSync) syncInfo(); // sayr tugagach tanlangan sayyora kartasi qaytadi
}

function updateTour(dt) {
  if (!tourOn) return;
  tourT += dt;
  const hold = TOUR[tourIdx] === 'moon' ? 5.5 : 8;
  if (tourT < hold) return;
  tourIdx++;
  if (tourIdx >= TOUR.length) {
    stopTour();
    setFocus(null);
  } else {
    tourStep();
  }
}

/* ---------------------------------------------------------------------
   7. Bosish (tap) orqali sayyorani tanlash
   --------------------------------------------------------------------- */
const raycaster = new THREE.Raycaster();
const ndc = new THREE.Vector2();
const canvas = renderer.domElement;
const pointers = new Set();
let tap = null;

canvas.addEventListener('pointerdown', (e) => {
  pointers.add(e.pointerId);
  hideHint();
  closeShareMenu();
  tap = pointers.size === 1 ? { x: e.clientX, y: e.clientY, t: performance.now() } : null;
});
canvas.addEventListener('pointerup', (e) => {
  pointers.delete(e.pointerId);
  if (!tap) return;
  const moved = Math.hypot(e.clientX - tap.x, e.clientY - tap.y);
  const dt = performance.now() - tap.t;
  tap = null;
  if (moved > 8 || dt > 400) return;

  const rect = canvas.getBoundingClientRect();
  ndc.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
  raycaster.setFromCamera(ndc, camera);
  const hit = raycaster.intersectObjects(hitMeshes, false)[0];
  if (hit) setFocus(hit.object.userData.id);
});
canvas.addEventListener('pointercancel', (e) => {
  pointers.delete(e.pointerId);
  tap = null;
});

/* ---------------------------------------------------------------------
   8. Musiqa (musiqa.mp3)
   --------------------------------------------------------------------- */
const audio = { el: null, ctx: null, gain: null, dest: null, ready: false };

function ensureAudio() {
  if (!musicOn) return;
  if (audio.ready) {
    if (audio.ctx.state === 'suspended') audio.ctx.resume();
    if (audio.el.paused && !document.hidden) audio.el.play().catch(() => {});
    return;
  }
  try {
    const el = new Audio('musiqa.mp3');
    el.loop = true;
    el.preload = 'auto';
    el.addEventListener('error', () => {
      toast('Musiqa fayli topilmadi: musiqa.mp3 ni index.html yoniga qoʻying.', 5000);
      musicOn = false;
      setPressed('#tglMusic', false);
    }, { once: true });
    const AC = window.AudioContext || window.webkitAudioContext;
    const ctx = new AC();
    const src = ctx.createMediaElementSource(el);
    const gain = ctx.createGain();
    gain.gain.value = 0;
    src.connect(gain);
    gain.connect(ctx.destination);
    let dest = null;
    if (ctx.createMediaStreamDestination) {
      dest = ctx.createMediaStreamDestination();
      gain.connect(dest);
    }
    Object.assign(audio, { el, ctx, gain, dest, ready: true });
    el.play().catch(() => {});
    gain.gain.setTargetAtTime(0.8, ctx.currentTime, 0.8);
  } catch (err) {
    console.warn('Audio ishga tushmadi', err);
  }
}

function setMusic(on) {
  musicOn = on;
  if (!audio.ready) {
    if (on) ensureAudio();
    return;
  }
  audio.gain.gain.setTargetAtTime(on ? 0.8 : 0, audio.ctx.currentTime, 0.15);
  if (on) {
    audio.ctx.resume();
    audio.el.play().catch(() => {});
  } else {
    setTimeout(() => { if (!musicOn && !REC.recorder) audio.el.pause(); }, 600);
  }
}

['pointerup', 'touchend', 'click', 'keydown'].forEach((ev) => window.addEventListener(ev, ensureAudio, { passive: true }));

document.addEventListener('visibilitychange', () => {
  if (!audio.ready || REC.recorder) return;
  if (document.hidden) audio.el.pause();
  else if (musicOn) audio.el.play().catch(() => {});
});

/* ---------------------------------------------------------------------
   9. Rasm / video uchun qoplama (nomlar, sarlavha, belgi)
   --------------------------------------------------------------------- */
const tmpV = new THREE.Vector3();
const tmpD = new THREE.Vector3();
const camDir = new THREE.Vector3();
const FOV_K = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
const FONT = '"Bricolage Grotesque", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
const FONT_SVG = "'Bricolage Grotesque', system-ui, 'Segoe UI', Roboto, sans-serif";
const mctx = document.createElement('canvas').getContext('2d');
const wrapCache = new Map();

function wrapText(text, maxW, font) {
  const key = `${text}|${Math.round(maxW)}|${font}`;
  if (wrapCache.has(key)) return wrapCache.get(key);
  mctx.font = font;
  const words = text.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    const t = cur ? `${cur} ${w}` : w;
    if (mctx.measureText(t).width > maxW && cur) {
      lines.push(cur);
      cur = w;
    } else {
      cur = t;
    }
  }
  if (cur) lines.push(cur);
  wrapCache.set(key, lines);
  return lines;
}

// Jismning nom yozuvi ekrandagi oʻrni (CSS piksellarda) yoki null
function labelInfo(b, w, h) {
  const hideMoon = b.id === 'moon' && !(focus && (focus.id === 'earth' || focus.id === 'moon'));
  if (!labelsOn || hideMoon || (focus && focus.id === b.id)) return null;
  b.holder.getWorldPosition(tmpV);
  tmpD.copy(tmpV).sub(camera.position);
  const dist = tmpD.length();
  if (tmpD.dot(camDir) <= 0) return null;
  tmpV.project(camera);
  const sx = (tmpV.x * 0.5 + 0.5) * w;
  const sy = (-tmpV.y * 0.5 + 0.5) * h;
  if (sx < -40 || sx > w + 40 || sy < -40 || sy > h + 40) return null;
  const rpx = (b.r * h) / (dist * FOV_K);
  return { x: sx, y: sy - rpx - 6 };
}

function buildOverlay(W, H) {
  const cw = window.innerWidth, ch = window.innerHeight;
  const s = W / cw;
  camera.getWorldDirection(camDir);

  const o = { W, H, s, labels: [], brand: { x: 20 * s, cy: 34 * s, size: 30 * s }, caption: null };
  for (const b of list) {
    const p = labelInfo(b, cw, ch);
    if (p) o.labels.push({ text: b.name, x: p.x * s, y: p.y * s, size: 12.5 * s });
  }

  const padX = 20 * s;
  const nameSize = 32 * s, descSize = 15 * s, statSize = 13.5 * s;
  const title = focus ? focus.name : 'Quyosh tizimi';
  const desc = focus ? focus.desc : 'Sayyoralarni 3D da kashf eting.';
  const stat = focus ? `${focus.stats[0][0]}: ${focus.stats[0][1]}     ${focus.stats[2][0]}: ${focus.stats[2][1]}` : '';
  const descLines = wrapText(desc, W - 2 * padX, `500 ${descSize}px ${FONT}`);

  let y = H - 26 * s;
  const cap = { padX, title, nameSize, descSize, statSize, descLines, stat };
  if (stat) {
    cap.statY = y;
    y -= statSize * 1.8;
  }
  cap.descY = descLines.map((_, i) => y - (descLines.length - 1 - i) * descSize * 1.35);
  cap.nameY = cap.descY[0] - descSize * 1.6;
  cap.gradTop = cap.nameY - nameSize * 2;
  o.caption = cap;
  return o;
}

function drawOverlay(ctx, o) {
  const { W, H, s, caption: c } = o;
  ctx.save();
  ctx.textBaseline = 'alphabetic';

  // Pastki qorayish
  const g = ctx.createLinearGradient(0, c.gradTop, 0, H);
  g.addColorStop(0, 'rgba(5,6,15,0)');
  g.addColorStop(1, 'rgba(5,6,15,0.82)');
  ctx.fillStyle = g;
  ctx.fillRect(0, c.gradTop, W, H - c.gradTop);

  // Nomlar
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0,0,0,0.9)';
  ctx.shadowBlur = 6 * s;
  ctx.fillStyle = '#eef1ff';
  for (const l of o.labels) {
    ctx.font = `600 ${l.size}px ${FONT}`;
    ctx.fillText(l.text, l.x, l.y);
  }
  ctx.shadowBlur = 0;

  // Sarlavha va tavsif
  ctx.textAlign = 'left';
  ctx.fillStyle = '#eef1ff';
  ctx.font = `700 ${c.nameSize}px ${FONT}`;
  ctx.fillText(c.title, c.padX, c.nameY);
  ctx.fillStyle = '#c3caf0';
  ctx.font = `500 ${c.descSize}px ${FONT}`;
  c.descLines.forEach((line, i) => ctx.fillText(line, c.padX, c.descY[i]));
  if (c.stat) {
    ctx.fillStyle = '#ffb347';
    ctx.font = `600 ${c.statSize}px ${FONT}`;
    ctx.fillText(c.stat, c.padX, c.statY);
  }

  // Belgi (logo + nom)
  const b = o.brand, u = b.size / 32, cx = b.x + 16 * u, cy = b.cy;
  ctx.shadowColor = 'rgba(0,0,0,0.7)';
  ctx.shadowBlur = 6 * s;
  ctx.fillStyle = '#ffb347';
  ctx.strokeStyle = '#ffb347';
  ctx.lineWidth = 1.5 * u;
  ctx.beginPath();
  ctx.arc(cx, cy, 5 * u, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx, cy, 14 * u, 6 * u, (-28 * Math.PI) / 180, 0, TAU);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx + 11.3 * u, cy - 1.6 * u, 2 * u, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#eef1ff';
  ctx.font = `700 ${22 * s}px ${FONT}`;
  ctx.fillText('Osmonoro', b.x + 38 * u, cy + 7 * s);
  ctx.restore();
}

const esc = (t) => String(t).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));

function makeSvg(dataUrl, o) {
  const { W, H, s, caption: c } = o;
  const f = (n) => n.toFixed(1);
  let x = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">`;
  x += '<defs><linearGradient id="fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#05060f" stop-opacity="0"/><stop offset="1" stop-color="#05060f" stop-opacity="0.82"/></linearGradient></defs>';
  x += `<image xlink:href="${dataUrl}" x="0" y="0" width="${W}" height="${H}"/>`;
  x += `<rect x="0" y="${f(c.gradTop)}" width="${W}" height="${f(H - c.gradTop)}" fill="url(#fade)"/>`;

  for (const l of o.labels) {
    x += `<text x="${f(l.x)}" y="${f(l.y)}" font-size="${f(l.size)}" font-weight="600" text-anchor="middle" fill="#eef1ff" stroke="#05060f" stroke-opacity="0.85" stroke-width="${f(l.size * 0.22)}" paint-order="stroke" font-family="${FONT_SVG}">${esc(l.text)}</text>`;
  }

  x += `<text x="${f(c.padX)}" y="${f(c.nameY)}" font-size="${f(c.nameSize)}" font-weight="700" fill="#eef1ff" font-family="${FONT_SVG}">${esc(c.title)}</text>`;
  c.descLines.forEach((line, i) => {
    x += `<text x="${f(c.padX)}" y="${f(c.descY[i])}" font-size="${f(c.descSize)}" font-weight="500" fill="#c3caf0" font-family="${FONT_SVG}">${esc(line)}</text>`;
  });
  if (c.stat) {
    x += `<text x="${f(c.padX)}" y="${f(c.statY)}" font-size="${f(c.statSize)}" font-weight="600" fill="#ffb347" xml:space="preserve" font-family="${FONT_SVG}">${esc(c.stat)}</text>`;
  }

  const b = o.brand, u = b.size / 32, cx = b.x + 16 * u, cy = b.cy;
  x += `<g fill="#ffb347" stroke="none"><circle cx="${f(cx)}" cy="${f(cy)}" r="${f(5 * u)}"/><circle cx="${f(cx + 11.3 * u)}" cy="${f(cy - 1.6 * u)}" r="${f(2 * u)}"/></g>`;
  x += `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(14 * u)}" ry="${f(6 * u)}" fill="none" stroke="#ffb347" stroke-width="${f(1.5 * u)}" transform="rotate(-28 ${f(cx)} ${f(cy)})"/>`;
  x += `<text x="${f(b.x + 38 * u)}" y="${f(cy + 7 * s)}" font-size="${f(22 * s)}" font-weight="700" fill="#eef1ff" font-family="${FONT_SVG}">Osmonoro</text>`;
  x += '</svg>';
  return x;
}

/* ---------------------------------------------------------------------
   10. Natija oynasi, rasm olish va ulashish
   --------------------------------------------------------------------- */
const REC = { recorder: null, chunks: [], canvas: null, ctx: null, last: 0, t0: 0, iv: null, mime: '', prevPR: 1 };
let pendingCapture = null;
let resultUrl = null;
let resultFile = null;

const stamp = () => new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);

function setRenderPR(pr) {
  renderer.setPixelRatio(pr);
  renderer.setSize(window.innerWidth, window.innerHeight, false);
}

const shareBtn = $('#btnShare');
const shareMenu = $('#shareMenu');

function closeShareMenu() {
  shareMenu.hidden = true;
  shareBtn.setAttribute('aria-expanded', 'false');
}

shareBtn.addEventListener('click', () => {
  const open = shareMenu.hidden;
  shareMenu.hidden = !open;
  shareBtn.setAttribute('aria-expanded', String(open));
});
document.addEventListener('click', (e) => {
  if (!shareMenu.hidden && !shareMenu.contains(e.target) && !shareBtn.contains(e.target)) closeShareMenu();
});
shareMenu.addEventListener('click', (e) => {
  const b = e.target.closest('button[data-fmt]');
  if (!b) return;
  closeShareMenu();
  if (REC.recorder) {
    toast('Avval video yozishni toʻxtating.');
    return;
  }
  pendingCapture = b.dataset.fmt;
});

function showResult(blob, filename, kind) {
  closeResult();
  resultUrl = URL.createObjectURL(blob);
  resultFile = new File([blob], filename, { type: blob.type });

  const media = $('#resultMedia');
  media.innerHTML = '';
  if (kind === 'video') {
    const v = document.createElement('video');
    v.src = resultUrl;
    v.controls = true;
    v.muted = true;
    v.loop = true;
    v.playsInline = true;
    media.appendChild(v);
  } else {
    const img = new Image();
    img.src = resultUrl;
    img.alt = 'Tayyor rasm';
    media.appendChild(img);
  }
  $('#resultName').textContent = `${filename} (${(blob.size / 1048576).toFixed(1)} MB)`;
  const canShare = !!(navigator.canShare && navigator.canShare({ files: [resultFile] }));
  $('#resultShare').hidden = !canShare;
  $('#result').hidden = false;
}

function closeResult() {
  $('#result').hidden = true;
  $('#resultMedia').innerHTML = '';
  if (resultUrl) {
    const u = resultUrl;
    setTimeout(() => URL.revokeObjectURL(u), 1500);
  }
  resultUrl = null;
  resultFile = null;
}

$('#resultClose').addEventListener('click', closeResult);
$('#result').addEventListener('click', (e) => {
  if (e.target.id === 'result') closeResult();
});
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeResult();
});

$('#resultSave').addEventListener('click', () => {
  if (!resultUrl) return;
  const a = document.createElement('a');
  a.href = resultUrl;
  a.download = resultFile.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
});

$('#resultShare').addEventListener('click', () => {
  if (!resultFile) return;
  navigator
    .share({ files: [resultFile], title: 'Osmonoro', text: 'Osmonoro — Quyosh tizimi simulyatori' })
    .catch((err) => {
      if (err && err.name !== 'AbortError') toast('Ulashib boʻlmadi. “Saqlash” tugmasini bosing.');
    });
});

function doCapture(fmt) {
  const w = window.innerWidth, h = window.innerHeight;
  const prev = renderer.getPixelRatio();
  const target = Math.min(3.5, Math.max(prev, (h >= w ? 1440 : 1920) / w));

  setRenderPR(target);
  renderer.render(scene, camera);
  const src = renderer.domElement;
  const c = document.createElement('canvas');
  c.width = src.width;
  c.height = src.height;
  const ctx = c.getContext('2d');
  ctx.drawImage(src, 0, 0);
  const ov = buildOverlay(c.width, c.height);
  setRenderPR(prev);
  renderer.render(scene, camera);

  const name = `osmonoro-${stamp()}`;
  if (fmt === 'svg') {
    const svg = makeSvg(c.toDataURL('image/jpeg', 0.92), ov);
    showResult(new Blob([svg], { type: 'image/svg+xml' }), `${name}.svg`, 'image');
  } else {
    drawOverlay(ctx, ov);
    const jpg = fmt === 'jpg';
    c.toBlob((blob) => {
      if (blob) showResult(blob, `${name}.${jpg ? 'jpg' : 'png'}`, 'image');
      else toast('Rasm yaratib boʻlmadi.');
    }, jpg ? 'image/jpeg' : 'image/png', 0.95);
  }
}

/* ---------------------------------------------------------------------
   11. Video yozish (MP4, yuqori sifat)
   --------------------------------------------------------------------- */
function pickMime() {
  const tries = [
    'video/mp4;codecs=avc1.640033,mp4a.40.2',
    'video/mp4;codecs=avc1.4d0033,mp4a.40.2',
    'video/mp4;codecs=avc1,mp4a.40.2',
    'video/mp4',
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
  ];
  for (const t of tries) {
    try {
      if (MediaRecorder.isTypeSupported(t)) return t;
    } catch (err) { /* keyingisiga oʻtamiz */ }
  }
  return '';
}

function startRecording() {
  if (REC.recorder) return;
  if (typeof MediaRecorder === 'undefined' || !HTMLCanvasElement.prototype.captureStream) {
    toast('Bu brauzer video yozishni qoʻllab-quvvatlamaydi.');
    return;
  }
  ensureAudio();

  const w = window.innerWidth, h = window.innerHeight;
  const outW = h >= w ? 1080 : 1920;
  const outH = Math.round(((outW * h) / w) / 2) * 2;

  REC.canvas = document.createElement('canvas');
  REC.canvas.width = outW;
  REC.canvas.height = outH;
  REC.ctx = REC.canvas.getContext('2d', { alpha: false });
  REC.prevPR = renderer.getPixelRatio();
  setRenderPR(Math.min(3.5, outW / w));

  const stream = REC.canvas.captureStream(30);
  let hasAudio = false;
  if (audio.ready && audio.dest) {
    const t = audio.dest.stream.getAudioTracks()[0];
    if (t) {
      stream.addTrack(t);
      hasAudio = true;
    }
  }

  REC.mime = pickMime();
  const opts = { videoBitsPerSecond: 16000000 };
  if (REC.mime) opts.mimeType = REC.mime;
  if (hasAudio) opts.audioBitsPerSecond = 192000;

  let recorder;
  try {
    recorder = new MediaRecorder(stream, opts);
  } catch (err) {
    try {
      recorder = new MediaRecorder(stream);
    } catch (err2) {
      setRenderPR(REC.prevPR);
      toast('Video yozishni boshlab boʻlmadi.');
      return;
    }
  }

  REC.chunks = [];
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) REC.chunks.push(e.data);
  };
  recorder.onstop = () => {
    clearInterval(REC.iv);
    const type = (recorder.mimeType || REC.mime || 'video/webm').split(';')[0];
    const blob = new Blob(REC.chunks, { type });
    REC.recorder = null;
    REC.chunks = [];
    setRenderPR(REC.prevPR);
    $('#btnRec').classList.remove('rec');
    $('#recTime').hidden = true;
    $('#btnRec').setAttribute('aria-label', 'Videoga yozish');
    const ext = type.includes('mp4') ? 'mp4' : 'webm';
    if (ext === 'webm') toast('Bu qurilma MP4 yozmaydi, video WebM formatda saqlandi.', 5000);
    if (blob.size > 0) showResult(blob, `osmonoro-${stamp()}.${ext}`, 'video');
  };

  REC.recorder = recorder;
  REC.last = 0;
  REC.t0 = performance.now();
  recorder.start(1000);

  $('#btnRec').classList.add('rec');
  $('#btnRec').setAttribute('aria-label', 'Yozishni toʻxtatish');
  $('#recTime').hidden = false;
  $('#recTime').textContent = '0:00';
  REC.iv = setInterval(() => {
    const sec = Math.floor((performance.now() - REC.t0) / 1000);
    $('#recTime').textContent = `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
    if (sec >= MAX_REC_SECONDS) stopRecording();
  }, 250);
}

function stopRecording() {
  if (!REC.recorder) return;
  try {
    REC.recorder.stop();
  } catch (err) { /* allaqachon toʻxtagan */ }
}

$('#btnRec').addEventListener('click', () => (REC.recorder ? stopRecording() : startRecording()));

function composeRec(now) {
  if (now - REC.last < 30) return;
  REC.last = now;
  const { canvas: c, ctx } = REC;
  ctx.drawImage(renderer.domElement, 0, 0, c.width, c.height);
  drawOverlay(ctx, buildOverlay(c.width, c.height));
}

/* ---------------------------------------------------------------------
   12. Asosiy sikl
   --------------------------------------------------------------------- */
const clock = new THREE.Clock();

function resize() {
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  viewOffset = -1;
}
window.addEventListener('resize', resize);
if (window.visualViewport) window.visualViewport.addEventListener('resize', resize);

function applyViewOffset(dt, w, h) {
  // Maʼlumot kartasi ochiq boʻlsa, jism ekranning yuqori qismiga siljiydi
  const target = infoOpen ? h * 0.17 : 0;
  const next = viewOffset < 0 ? target : viewOffset + (target - viewOffset) * (1 - Math.exp(-dt * 6));
  if (Math.abs(next - viewOffset) > 0.3 || viewOffset < 0) {
    viewOffset = next;
    if (Math.abs(viewOffset) > 0.5) camera.setViewOffset(w, h, 0, viewOffset, w, h);
    else camera.clearViewOffset();
  }
}

function updateHits(h) {
  for (const b of list) {
    b.holder.getWorldPosition(tmpV);
    const d = tmpV.distanceTo(camera.position);
    const px = b.id === 'moon' ? 12 : 20;
    b.hit.scale.setScalar(Math.max(b.r * 1.1, (px * d * FOV_K) / h));
  }
}

function updateLabels(w, h) {
  camera.getWorldDirection(camDir);
  for (const b of list) {
    const p = labelInfo(b, w, h);
    if (!p) {
      b.label.style.opacity = 0;
      continue;
    }
    b.label.style.transform = `translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px) translate(-50%, -100%)`;
    b.label.style.opacity = 1;
  }
}

function tick(now = performance.now()) {
  requestAnimationFrame(tick);
  const dt = Math.min(clock.getDelta(), 0.05);
  const sdt = dt * speed;
  simTime += sdt;

  for (const b of list) {
    if (b.omega) b.pivot.rotation.y = b.phase + simTime * b.omega;
    b.mesh.rotation.y += sdt * b.spin * 0.6;
    if (b.clouds) b.clouds.rotation.y += sdt * b.spin * 0.6 * 1.08;
  }
  belt.rotation.y += sdt * 0.02;

  if (!reduceMotion) {
    const pulse = 1 + 0.03 * Math.sin(now * 0.0022);
    sunGlows[0].scale.setScalar(36 * pulse);
    sunGlows[1].scale.setScalar(100 * (2 - pulse));
  }

  updateTour(dt);

  // Kamera fokusini silliq yangilash
  const p = focus ? focus.holder.getWorldPosition(tmpV) : tmpV.set(0, 0, 0);
  const k = settle < 1 ? 1 - Math.exp(-dt * 5) : 1;
  tmpD.copy(p).sub(controls.target).multiplyScalar(k);
  controls.target.add(tmpD);
  camera.position.add(tmpD);

  if (settle < 1) {
    settle = Math.min(1, settle + dt / settleDur);
    tmpD.copy(camera.position).sub(controls.target);
    const len = tmpD.length();
    const newLen = len + (desired - len) * (1 - Math.exp(-dt * 4));
    if (flyDir) tmpD.normalize().lerp(flyDir, 1 - Math.exp(-dt * 3)).normalize();
    tmpD.setLength(newLen);
    camera.position.copy(controls.target).add(tmpD);
  } else if (tourOn && focus) {
    // Sayyora yonidan oʻtayotgandek asta aylanish
    tmpD.copy(camera.position).sub(controls.target).applyAxisAngle(Y_AXIS, -0.12 * dt);
    camera.position.copy(controls.target).add(tmpD);
  }

  controls.update();
  camera.updateMatrixWorld();
  SUN_V.value.set(0, 0, 0).applyMatrix4(camera.matrixWorldInverse);

  const w = window.innerWidth, h = window.innerHeight;
  applyViewOffset(dt, w, h);
  updateHits(h);
  renderer.render(scene, camera);

  if (REC.recorder) composeRec(now);
  if (pendingCapture) {
    const fmt = pendingCapture;
    pendingCapture = null;
    doCapture(fmt);
  }
  updateLabels(w, h);
}

/* ---------------------------------------------------------------------
   13. Ishga tushirish
   --------------------------------------------------------------------- */
async function init() {
  const tex = await buildTextures((p) => {
    $('#loaderText').textContent = `Sayyoralar yaratilmoqda… ${Math.round(p * 100)}%`;
  });
  tex.ring = makeRingTexture();

  buildBodies(tex);
  buildChips();
  resize();

  if (reduceMotion) {
    speed = 1;
    $('#speed').querySelectorAll('button').forEach((x) => x.classList.toggle('on', x.dataset.s === '1'));
    camera.position.set(0, 120, 190);
    settle = 1;
  }

  window.__osmonoroReady = true;
  $('#loader').classList.add('done');
  clock.start();
  tick();
}

init();
