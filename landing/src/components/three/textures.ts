import * as THREE from "three";

/**
 * Текстуры рисуем в canvas прямо в браузере: ни одного файла, ни одного
 * запроса. Изразцы, кирпич и пояс «надписи» — узнаваемые мотивы
 * Самарканда в упрощённом виде.
 */

function холст(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return [c, c.getContext("2d")!] as const;
}

function вТекстуру(c: HTMLCanvasElement, повтор = [1, 1]) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(повтор[0], повтор[1]);
  t.anisotropy = 8;
  return t;
}

/** Бирюзовая глазурь купола: ромбы-«гирих» и светлые блики. */
export function текстураКупола() {
  const [c, g] = холст(512, 1024);
  const фон = g.createLinearGradient(0, 0, 0, 1024);
  фон.addColorStop(0, "#7fdcef");
  фон.addColorStop(0.5, "#2aa9cf");
  фон.addColorStop(1, "#13709a");
  g.fillStyle = фон;
  g.fillRect(0, 0, 512, 1024);
  // Ромбическая сетка кобальтом
  g.strokeStyle = "rgba(10,60,110,0.55)";
  g.lineWidth = 3;
  const шаг = 64;
  for (let x = -1024; x < 1536; x += шаг) {
    g.beginPath();
    g.moveTo(x, 0);
    g.lineTo(x + 1024, 1024);
    g.stroke();
    g.beginPath();
    g.moveTo(x, 1024);
    g.lineTo(x + 1024, 0);
    g.stroke();
  }
  // Точки-«звёздочки» в узлах
  g.fillStyle = "rgba(255,245,220,0.8)";
  for (let y = 0; y < 1024; y += шаг) {
    for (let x = 0; x < 512; x += шаг) {
      g.beginPath();
      g.arc(x + ((y / шаг) % 2) * (шаг / 2), y, 4, 0, Math.PI * 2);
      g.fill();
    }
  }
  // Лёгкая неровность глазури
  for (let i = 0; i < 4000; i++) {
    g.fillStyle = `rgba(255,255,255,${Math.random() * 0.05})`;
    g.fillRect(Math.random() * 512, Math.random() * 1024, 2, 2);
  }
  return вТекстуру(c, [8, 1]);
}

/** Кирпич сырцовой глины с тонкими швами. */
export function текстураКирпича(повтор: [number, number] = [6, 3]) {
  const [c, g] = холст(256, 256);
  g.fillStyle = "#d9b98d";
  g.fillRect(0, 0, 256, 256);
  const h = 32;
  for (let ряд = 0; ряд < 8; ряд++) {
    const сдвиг = ряд % 2 ? 32 : 0;
    for (let x = -64; x < 256; x += 64) {
      const тон = 200 + Math.random() * 25;
      g.fillStyle = `rgb(${тон + 20},${тон - 10},${тон - 60})`;
      g.fillRect(x + сдвиг + 2, ряд * h + 2, 60, h - 4);
    }
  }
  return вТекстуру(c, повтор);
}

/** Пояс барабана: кобальтовая лента со светлой «вязью» и бирюзовыми кантами. */
export function текстураПояса() {
  const [c, g] = холст(2048, 256);
  g.fillStyle = "#e3c9a0";
  g.fillRect(0, 0, 2048, 256);
  g.fillStyle = "#1d3f8f";
  g.fillRect(0, 50, 2048, 156);
  g.fillStyle = "#19a99e";
  g.fillRect(0, 36, 2048, 14);
  g.fillRect(0, 206, 2048, 14);
  // «Вязь» — плавные петли, не настоящий текст
  g.strokeStyle = "rgba(255,248,230,0.95)";
  g.lineWidth = 7;
  g.lineCap = "round";
  for (let x = 20; x < 2048; x += 90) {
    g.beginPath();
    g.moveTo(x, 170);
    g.bezierCurveTo(x + 10, 80, x + 40, 80, x + 45, 150);
    g.bezierCurveTo(x + 50, 190, x + 75, 190, x + 80, 110);
    g.stroke();
    g.beginPath();
    g.moveTo(x + 25, 175);
    g.lineTo(x + 70, 175);
    g.stroke();
  }
  return вТекстуру(c, [1, 1]);
}

/** Полосы минарета: кирпич с изразцовыми поясами. */
export function текстураМинарета() {
  const [c, g] = холст(256, 1024);
  g.fillStyle = "#d8b784";
  g.fillRect(0, 0, 256, 1024);
  for (let y = 0; y < 1024; y += 16) {
    g.fillStyle = `rgba(120,80,40,${0.12 + (y % 32 ? 0 : 0.08)})`;
    g.fillRect(0, y, 256, 2);
  }
  for (const y of [120, 420, 720]) {
    g.fillStyle = "#1d3f8f";
    g.fillRect(0, y, 256, 60);
    g.fillStyle = "#1fb3a8";
    for (let x = 0; x < 256; x += 32) {
      g.beginPath();
      g.moveTo(x, y + 30);
      g.lineTo(x + 16, y + 8);
      g.lineTo(x + 32, y + 30);
      g.lineTo(x + 16, y + 52);
      g.closePath();
      g.fill();
    }
  }
  return вТекстуру(c, [2, 1]);
}
