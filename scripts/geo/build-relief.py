"""
Готовит рельеф Узбекистана для трёхмерной карты.

Высоты — SRTM, съёмка шаттла, public domain. Берутся плитками с открытого
зеркала AWS Terrain Tiles: без ключа, без регистрации. Спутниковые снимки
не используются вовсе — раскраска считается из самих высот классическим
приёмом гипсометрии, и вопрос лицензий на изображения не возникает.

Скрипт на Python, а не на Node, как остальные сборщики геоданных: здесь
нужна работа с растром, а в Node без внешних зависимостей нет даже
декодирования PNG. Это инструмент сборки, в приложение он не попадает.

На выходе три файла в public/relief:
    uz-height.png  — карта высот, серым, для смещения вершин;
    uz-color.png   — гипсометрическая раскраска с отмывкой и прозрачностью
                     за пределами страны;
    uz-relief.json — границы и диапазон высот, чтобы сцена знала масштаб.

Запуск:
    python scripts/geo/build-relief.py
"""

import io
import json
import math
import os
import urllib.request
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[2]
OUT_DIR = ROOT / "public" / "relief"
REGIONS = json.loads((ROOT / "src" / "data" / "uzbekistan-regions.json").read_text("utf-8"))
WATER = json.loads((ROOT / "src" / "data" / "uzbekistan-water.json").read_text("utf-8"))

ZOOM = 7
TILE = 256
UA = "UzbekistanTravelPlatform/0.1 (relief build script)"

# Ширина растра. Больше не нужно: на экране телефона страна занимает
# от силы тысячу точек, а вес файла попадает в офлайн-пакет.
WIDTH = 1024


def tile_x(lon: float, z: int) -> float:
    return (lon + 180.0) / 360.0 * (1 << z)


def tile_y(lat: float, z: int) -> float:
    r = math.radians(lat)
    return (1.0 - math.log(math.tan(r) + 1 / math.cos(r)) / math.pi) / 2.0 * (1 << z)


def bounds() -> dict:
    lons = [p[0] for r in REGIONS for p in r["ring"]]
    lats = [p[1] for r in REGIONS for p in r["ring"]]
    return {
        "minLon": min(lons), "maxLon": max(lons),
        "minLat": min(lats), "maxLat": max(lats),
    }


def fetch_mosaic(box: dict) -> tuple[Image.Image, int, int]:
    """Скачивает плитки высот и склеивает в один растр Меркатора."""
    x0, x1 = int(tile_x(box["minLon"], ZOOM)), int(tile_x(box["maxLon"], ZOOM))
    y0, y1 = int(tile_y(box["maxLat"], ZOOM)), int(tile_y(box["minLat"], ZOOM))

    mosaic = Image.new("RGB", ((x1 - x0 + 1) * TILE, (y1 - y0 + 1) * TILE))
    cache = ROOT / ".relief-cache"
    cache.mkdir(exist_ok=True)

    total = (x1 - x0 + 1) * (y1 - y0 + 1)
    done = 0
    for x in range(x0, x1 + 1):
        for y in range(y0, y1 + 1):
            local = cache / f"{ZOOM}_{x}_{y}.png"
            if local.exists():
                raw = local.read_bytes()
            else:
                url = f"https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{ZOOM}/{x}/{y}.png"
                req = urllib.request.Request(url, headers={"User-Agent": UA})
                raw = urllib.request.urlopen(req, timeout=60).read()
                local.write_bytes(raw)
            mosaic.paste(Image.open(io.BytesIO(raw)).convert("RGB"),
                         ((x - x0) * TILE, (y - y0) * TILE))
            done += 1
            print(f"\r  плиток: {done}/{total}", end="", flush=True)
    print()
    return mosaic, x0, y0


def country_mask(box: dict, w: int, h: int) -> Image.Image:
    """Маска страны: за её пределами рельефа быть не должно."""
    mask = Image.new("L", (w, h), 0)
    draw = ImageDraw.Draw(mask)
    for region in REGIONS:
        pts = [
            (
                (lon - box["minLon"]) / (box["maxLon"] - box["minLon"]) * w,
                h - (lat - box["minLat"]) / (box["maxLat"] - box["minLat"]) * h,
            )
            for lon, lat in region["ring"]
        ]
        draw.polygon(pts, fill=255)
    # Область рисуется по каждому региону отдельно, и на стыках остаются
    # волосяные щели. Лёгкое размытие с последующим порогом их закрывает.
    return mask.filter(ImageFilter.GaussianBlur(1.2)).point(lambda v: 255 if v > 90 else 0)


# Гипсометрическая шкала под палитру приложения: пески Кызылкума переходят
# в охру предгорий и дальше в бурый и снежный Тянь-Шань.
TINTS = [
    (0,    (203, 192, 156)),
    (300,  (196, 174, 120)),
    (700,  (178, 148,  92)),
    (1200, (154, 120,  74)),
    (2000, (126,  95,  66)),
    (3000, (126, 116, 108)),
    (4000, (220, 220, 223)),
    (5000, (244, 245, 247)),
]


def tint(height: float) -> tuple[int, int, int]:
    if height <= TINTS[0][0]:
        return TINTS[0][1]
    for i in range(len(TINTS) - 1):
        a, b = TINTS[i], TINTS[i + 1]
        if height <= b[0]:
            t = (height - a[0]) / (b[0] - a[0])
            return tuple(round(a[1][c] + (b[1][c] - a[1][c]) * t) for c in range(3))
    return TINTS[-1][1]


def main() -> None:
    box = bounds()
    print("рамка: %.2f..%.2f по долготе, %.2f..%.2f по широте"
          % (box["minLon"], box["maxLon"], box["minLat"], box["maxLat"]))

    mosaic, x0, y0 = fetch_mosaic(box)
    mpx = mosaic.load()

    # Пропорции считаем в проекции приложения: долгота сжимается на широте
    # страны, иначе рельеф вытянется поперёк вслед за самой картой.
    mid_lat = (box["minLat"] + box["maxLat"]) / 2
    squeeze = math.cos(math.radians(mid_lat))
    aspect = ((box["maxLon"] - box["minLon"]) * squeeze) / (box["maxLat"] - box["minLat"])
    w = WIDTH
    h = round(WIDTH / aspect)
    print(f"растр: {w} на {h}")

    # Плитки лежат в Меркаторе, наша сетка — равнопромежуточная.
    # Пересчитываем каждую точку выходной сетки в исходный растр.
    grid = [[0.0] * w for _ in range(h)]
    lo, hi = 1e9, -1e9
    for j in range(h):
        lat = box["maxLat"] - (j + 0.5) / h * (box["maxLat"] - box["minLat"])
        sy = (tile_y(lat, ZOOM) - y0) * TILE
        sy = min(max(sy, 0), mosaic.height - 1)
        for i in range(w):
            lon = box["minLon"] + (i + 0.5) / w * (box["maxLon"] - box["minLon"])
            sx = (tile_x(lon, ZOOM) - x0) * TILE
            sx = min(max(sx, 0), mosaic.width - 1)
            r, g, b = mpx[int(sx), int(sy)]
            value = (r * 256 + g + b / 256) - 32768
            grid[j][i] = value
            lo = min(lo, value)
            hi = max(hi, value)

    mask = country_mask(box, w, h)
    mpix = mask.load()

    # Диапазон считаем только внутри страны. В рамку попадают Каспийская
    # впадина и памирские вершины: по ним размах выходит от -419 до 6873 м,
    # и восемь бит карты высот тратятся на чужие крайности, а рельеф
    # Узбекистана сминается в узкую полосу значений.
    lo, hi = 1e9, -1e9
    for j in range(h):
        for i in range(w):
            if mpix[i, j]:
                lo = min(lo, grid[j][i])
                hi = max(hi, grid[j][i])
    print(f"высоты внутри страны: от {lo:.0f} до {hi:.0f} м")

    height_img = Image.new("L", (w, h))
    hpix = height_img.load()
    color_img = Image.new("RGBA", (w, h))
    cpix = color_img.load()

    # Отмывка: свет с северо-запада под 45°, как принято на рельефных картах.
    az = math.radians(315.0)
    alt = math.radians(45.0)
    # Шаг сетки в метрах — нужен, чтобы наклон не зависел от разрешения.
    step_m = (box["maxLat"] - box["minLat"]) / h * 111_320

    for j in range(h):
        for i in range(w):
            value = grid[j][i] if mpix[i, j] else lo
            hpix[i, j] = max(0, min(255, round((value - lo) / (hi - lo) * 255)))

            if mpix[i, j] == 0:
                cpix[i, j] = (0, 0, 0, 0)
                continue

            value = grid[j][i]
            left = grid[j][max(0, i - 1)]
            right = grid[j][min(w - 1, i + 1)]
            up = grid[max(0, j - 1)][i]
            down = grid[min(h - 1, j + 1)][i]

            dzdx = (right - left) / (2 * step_m)
            dzdy = (down - up) / (2 * step_m)
            slope = math.atan(math.hypot(dzdx, dzdy))
            aspect_a = math.atan2(dzdy, -dzdx)
            shade = (
                math.sin(alt) * math.cos(slope)
                + math.cos(alt) * math.sin(slope) * math.cos(az - aspect_a)
            )
            shade = max(0.28, min(1.38, 0.5 + shade * 0.92))

            r, g, b = tint(value)
            cpix[i, j] = (
                max(0, min(255, round(r * shade))),
                max(0, min(255, round(g * shade))),
                max(0, min(255, round(b * shade))),
                255,
            )

    def to_px(lon: float, lat: float) -> tuple[float, float]:
        return (
            (lon - box["minLon"]) / (box["maxLon"] - box["minLon"]) * w,
            h - (lat - box["minLat"]) / (box["maxLat"] - box["minLat"]) * h,
        )

    # Реки и озёра тоже уходят в текстуру. Трубками поверх настоящего рельефа
    # они бы висели над склонами или тонули в них: русло идёт по низу долины,
    # а трубка — по прямой между точками.
    water = ImageDraw.Draw(color_img)
    for lake in WATER["lakes"]:
        water.polygon([to_px(lon, lat) for lon, lat in lake["ring"]], fill=(122, 162, 184, 255))
    for river in WATER["rivers"]:
        pts = [to_px(lon, lat) for lon, lat in river["path"]]
        if len(pts) >= 2:
            water.line(pts, fill=(122, 162, 184, 235), width=2, joint="curve")

    # Границы областей рисуем прямо в раскраске. В сцене их провести негде:
    # рельеф — сплошная поверхность, и линия поверх неё либо утонет в склоне,
    # либо повиснет над ним. В текстуре она ложится точно по месту.
    borders = ImageDraw.Draw(color_img)
    for region in REGIONS:
        pts = [to_px(lon, lat) for lon, lat in region["ring"]]
        borders.line(pts + [pts[0]], fill=(92, 74, 46, 150), width=2)

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    height_img.save(OUT_DIR / "uz-height.png", optimize=True)
    color_img.save(OUT_DIR / "uz-color.png", optimize=True)
    (OUT_DIR / "uz-relief.json").write_text(
        json.dumps(
            {
                "box": box,
                "minMeters": round(lo),
                "maxMeters": round(hi),
                "width": w,
                "height": h,
            },
            ensure_ascii=False,
        ),
        "utf-8",
    )

    total = sum(
        os.path.getsize(OUT_DIR / name)
        for name in ("uz-height.png", "uz-color.png", "uz-relief.json")
    )
    print(f"готово: {total / 1024:.0f} КБ в public/relief")


if __name__ == "__main__":
    main()
