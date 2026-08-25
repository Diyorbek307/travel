import { H, ALWAYS, PRICE } from "./_helpers.mjs";

export default {
  slug: "jizzakh",
  lat: 40.1158,
  lon: 67.8422,
  zoom: 10,
  tr: {
    ru: {
      name: "Джизак и Зааминские горы",
      description:
        "Область между степью и Туркестанским хребтом. Через неё проходили «Тимуровы ворота» — ущелье, которым войска шли из Самарканда на север. В горах Заамина растёт арчовый лес, а летом там на десять градусов прохладнее, чем в долине.",
    },
    uz: {
      name: "Jizzax va Zomin tog'lari",
      description:
        "Dasht va Turkiston tizmasi orasidagi viloyat. Undan «Temur darvozasi» — Samarqanddan shimolga qo'shin o'tgan dara o'tgan. Zomin tog'larida archazor o'sadi, yozda u yerda vodiydan o'n daraja salqinroq.",
    },
    en: {
      name: "Jizzakh and the Zaamin Mountains",
      description:
        "A province between the steppe and the Turkestan range. Timur's Gate — the gorge through which armies marched north from Samarkand — passes through it. Juniper forest grows in the Zaamin mountains, and in summer it is ten degrees cooler there than in the valley.",
    },
  },

  pois: [
    {
      slug: "zaamin-national-park",
      category: "nature",
      themes: ["nature", "family", "entertainment"],
      lat: 39.6889,
      lon: 68.3956,
      price: PRICE.small,
      visit: 180,
      rating: 4.7,
      pop: 0.75,
      hours: ALWAYS,
      qr: "JIZ-01",
      tr: {
        ru: {
          n: "Зааминский национальный парк",
          s: "Арчовый лес на высоте 2000–3500 метров — «узбекская Швейцария».",
          f: `Зааминский национальный парк основан в 1976 году на северных склонах Туркестанского хребта. Площадь около 24 тысяч гектаров, высоты от 1000 до 3500 метров.

Главная ценность — арчовники. Арча, среднеазиатский можжевельник, растёт медленно: дереву в обхвате метр может быть шестьсот лет. Эти леса удерживают почву на склонах и питают родники, поэтому вырубка здесь запрещена.

Летом в горах на десять-пятнадцать градусов прохладнее, чем в Джизаке. Это делает Заамин местом, куда ездят спасаться от жары: температура в июле здесь около 20–25 градусов, тогда как в долине под сорок.

В парке есть маркированные тропы, водопады, смотровые площадки. Действуют санатории и базы отдыха — место популярно у местных, но иностранных туристов почти нет.

Зимой работает небольшая горнолыжная зона.

Дорога от Джизака — около двух часов, серпантин.`,
        },
        uz: {
          n: "Zomin milliy bog'i",
          s: "2000–3500 metr balandlikdagi archazor — «o'zbek Shveytsariyasi».",
          f: `Zomin milliy bog'i 1976 yilda Turkiston tizmasining shimoliy yon bag'irlarida tashkil etilgan. Maydoni 24 ming gektarga yaqin.

Asosiy boyligi — archazorlar. Archa sekin o'sadi: bir metr yo'g'onlikdagi daraxt olti yuz yoshda bo'lishi mumkin.

Yozda tog'larda Jizzaxdan o'n-o'n besh daraja salqinroq. Iyulda bu yerda 20–25 daraja, vodiyda esa qirqqa yaqin.

Bog'da belgilangan so'qmoqlar, sharsharalar, kuzatuv maydonchalari bor. Qishda kichik chang'i zonasi ishlaydi.

Jizzaxdan yo'l — ikki soatcha, serpantin.`,
        },
        en: {
          n: "Zaamin National Park",
          s: "Juniper forest at 2,000–3,500 metres — the Uzbek Switzerland.",
          f: `Zaamin National Park was founded in 1976 on the northern slopes of the Turkestan range. It covers some 24,000 hectares, from 1,000 to 3,500 metres.

Its chief value is the juniper woodland. Archa, the Central Asian juniper, grows slowly: a tree a metre round may be six hundred years old. These forests hold the soil on the slopes and feed the springs, so felling is banned.

In summer the mountains run ten to fifteen degrees cooler than Jizzakh. That makes Zaamin the place people go to escape the heat: July temperatures here are around 20–25 degrees, while the valley approaches forty.

The park has marked trails, waterfalls and viewpoints. Sanatoria and holiday bases operate — the place is popular with locals, though foreign visitors are almost unknown.

A small ski area works in winter.

The drive from Jizzakh takes about two hours on switchbacks.`,
        },
      },
    },

    {
      slug: "timur-gate",
      category: "landmark",
      themes: ["history", "nature", "free"],
      lat: 40.0764,
      lon: 67.2472,
      price: PRICE.free,
      visit: 30,
      rating: 4.3,
      pop: 0.45,
      hours: ALWAYS,
      qr: "JIZ-02",
      tr: {
        ru: {
          n: "Тимуровы ворота",
          s: "Узкое ущелье Санзара с надписями Улугбека и Абдулла-хана на скале.",
          f: `Тимуровы ворота — теснина, которую река Санзар пробила в отроге Туркестанского хребта. В самом узком месте ширина прохода около 120 метров при высоте скальных стен до 200.

Через эту щель проходил единственный удобный путь из Самарканда на север, к Ташкенту и дальше в степь. Кто держал ущелье, тот контролировал дорогу — поэтому здесь стояли заставы со времён античности.

На скале высечены две надписи. Первая оставлена в 1425 году по приказу Улугбека, возвращавшегося из похода на моголов: в ней перечислены его титулы и упомянут поход. Вторая — 1571 года, от бухарского хана Абдуллы II.

Надписи находятся на высоте нескольких метров, к ним ведёт тропа. Текст сильно выветрен, но контуры букв различимы.

Место стоит прямо у трассы Ташкент — Самарканд, заезд занимает минут двадцать.`,
        },
        uz: {
          n: "Temur darvozasi",
          s: "Sanzar darasi, qoyada Ulug'bek va Abdullaxon bitiklari bilan.",
          f: `Temur darvozasi — Sanzar daryosi Turkiston tizmasi tarmog'ida o'ygan tor dara. Eng tor joyida o'tish kengligi 120 metrga yaqin, qoya devorlari balandligi 200 metrgacha.

Bu tirqishdan Samarqanddan shimolga — Toshkentga va dashtga yagona qulay yo'l o'tgan.

Qoyada ikkita bitik o'yilgan. Birinchisi 1425 yilda Ulug'bek buyrug'i bilan qoldirilgan, ikkinchisi — 1571 yilda buxorolik Abdullaxon II tomonidan.

Joy Toshkent — Samarqand trassasi yonida.`,
        },
        en: {
          n: "Timur's Gate",
          s: "The narrow Sanzar gorge, with inscriptions of Ulugh Beg and Abdullah Khan on the rock.",
          f: `Timur's Gate is a defile cut by the Sanzar river through a spur of the Turkestan range. At its narrowest the passage is about 120 metres wide, with rock walls up to 200 metres high.

The only convenient road from Samarkand north — to Tashkent and out into the steppe — ran through this slot. Whoever held the gorge controlled the road, so guard posts stood here from antiquity onward.

Two inscriptions are cut into the rock. The first was left in 1425 by order of Ulugh Beg, returning from a campaign against the Moghuls: it lists his titles and records the expedition. The second dates from 1571 and belongs to the Bukharan ruler Abdullah Khan II.

The inscriptions sit several metres up, reached by a path. The text is badly weathered, but the outlines of the letters can be made out.

The site is right beside the Tashkent–Samarkand highway; the detour takes about twenty minutes.`,
        },
      },
    },

    {
      slug: "jizzakh-bazaar",
      category: "bazaar",
      themes: ["shopping", "food", "free"],
      lat: 40.1172,
      lon: 67.8394,
      price: PRICE.free,
      visit: 30,
      rating: 4.0,
      pop: 0.25,
      hours: H("06:00", "18:00"),
      tr: {
        ru: {
          n: "Джизакский базар",
          s: "Придорожный рынок на трассе Ташкент — Самарканд.",
          f: "Джизак стоит ровно посередине между Ташкентом и Самаркандом, и базар здесь живёт транзитом. Известен курутом, сушёными дынями и мёдом с зааминских пасек.",
        },
        uz: { n: "Jizzax bozori", s: "Toshkent — Samarqand trassasidagi yo'l bo'yi bozori." },
        en: {
          n: "Jizzakh Bazaar",
          s: "A roadside market on the Tashkent–Samarkand highway.",
          f: "Jizzakh sits exactly midway between Tashkent and Samarkand, and the bazaar lives off passing traffic. It is known for kurut, dried melon, and honey from the Zaamin apiaries.",
        },
      },
    },

    {
      slug: "jizzakh-restaurant",
      category: "restaurant",
      themes: ["food"],
      lat: 40.115,
      lon: 67.845,
      price: 50000,
      visit: 50,
      rating: 4.1,
      pop: 0.2,
      hours: H("08:00", "22:00"),
      tr: {
        ru: {
          n: "Придорожный ресторан «Зомин»",
          s: "Точка на полпути между Ташкентом и Самаркандом: шурпа, шашлык, тандыр-самса.",
        },
        uz: { n: "«Zomin» yo'l bo'yi restorani", s: "Sho'rva, shashlik, tandir somsa." },
        en: {
          n: "Zomin Roadside Restaurant",
          s: "The halfway stop between Tashkent and Samarkand: shurpa, shashlik, tandyr samsa.",
        },
      },
    },
  ],

  tours: [
    {
      slug: "jizzakh-mountains",
      mode: "car",
      sort: 1,
      tr: {
        ru: {
          title: "Зааминские горы",
          description:
            "Остановка по дороге между Ташкентом и Самаркандом: Тимуровы ворота с надписью Улугбека и арчовый лес Заамина, где летом на пятнадцать градусов прохладнее.",
        },
        en: {
          title: "The Zaamin Mountains",
          description:
            "A stop on the road between Tashkent and Samarkand: Timur's Gate with Ulugh Beg's inscription, and the juniper forest of Zaamin, fifteen degrees cooler in summer.",
        },
        uz: {
          title: "Zomin tog'lari",
          description:
            "Toshkent va Samarqand orasidagi to'xtash: Temur darvozasi va Zomin archazori.",
        },
      },
      stops: [
        ["timur-gate", 30],
        ["jizzakh-bazaar", 30],
        ["zaamin-national-park", 180],
      ],
    },
  ],
};
