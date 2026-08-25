import { H, ALWAYS, PRICE } from "./_helpers.mjs";

export default {
  slug: "karshi",
  lat: 38.8606,
  lon: 65.7897,
  zoom: 13,
  tr: {
    ru: {
      name: "Карши",
      description:
        "Административный центр Кашкадарьинской области и один из старейших городов страны: под нынешним Карши лежит городище Нахшаб, известное с античности. Здесь сохранился кирпичный мост XVI века, по которому до недавнего времени шло движение.",
    },
    uz: {
      name: "Qarshi",
      description:
        "Qashqadaryo viloyati markazi va mamlakatning eng qadimiy shaharlaridan biri: hozirgi Qarshi ostida antik davrdan ma'lum Naxshab shahristoni yotadi. Bu yerda XVI asr g'isht ko'prigi saqlangan.",
    },
    en: {
      name: "Karshi",
      description:
        "Administrative centre of the Kashkadarya region and one of the country's oldest cities: beneath modern Karshi lies the settlement of Nakhshab, known since antiquity. A 16th-century brick bridge survives here, carrying traffic until recent times.",
    },
  },

  pois: [
    {
      slug: "karshi-bridge",
      category: "landmark",
      themes: ["history", "architecture", "free"],
      lat: 38.8617,
      lon: 65.7994,
      price: PRICE.free,
      visit: 25,
      rating: 4.3,
      pop: 0.7,
      hours: ALWAYS,
      qr: "QRS-01",
      tr: {
        ru: {
          n: "Каршинский мост",
          s: "Кирпичный мост XVI века через Кашкадарью — одиннадцать арок, 120 метров.",
          f: `Мост построен в конце XVI века при бухарском хане Абдулле II, когда через Карши шёл главный торговый путь из Бухары в Афганистан и Индию.

Длина сооружения около 120 метров, ширина восемь. Пролёты держат одиннадцать стрельчатых арок разного размера: центральные шире, чтобы пропускать паводок, боковые уже. Кладка из жжёного кирпича на ганчевом растворе.

Мост несколько раз ремонтировали, но конструкция осталась исходной. По нему шло автомобильное движение вплоть до второй половины XX века — четыреста лет непрерывной службы.

Сейчас он пешеходный. Лучший вид — с берега ниже по течению, где видны все арки разом.`,
        },
        uz: {
          n: "Qarshi ko'prigi",
          s: "Qashqadaryo ustidagi XVI asr g'isht ko'prigi — o'n bitta ravoq, 120 metr.",
          f: `Ko'prik XVI asr oxirida buxorolik Abdullaxon II davrida qurilgan.

Uzunligi 120 metrga yaqin, kengligi sakkiz metr. O'n bitta turli o'lchamdagi ravoq ko'taradi: markazdagilar keng, toshqinni o'tkazish uchun.

Ko'prik bir necha marta ta'mirlangan, ammo asosiy konstruksiya o'zgarmagan. XX asr ikkinchi yarmigacha undan avtomobil harakati o'tgan — to'rt yuz yillik xizmat.

Hozir piyodalar uchun.`,
        },
        en: {
          n: "Karshi Bridge",
          s: "A 16th-century brick bridge over the Kashkadarya — eleven arches, 120 metres.",
          f: `The bridge was built at the end of the 16th century under the Bukharan ruler Abdullah Khan II, when the main trade road from Bukhara to Afghanistan and India ran through Karshi.

It measures some 120 metres long and eight wide. Eleven pointed arches of varying size carry the span: the central ones are wider to pass the spring flood, the outer ones narrower. The masonry is fired brick laid in ganch mortar.

The bridge has been repaired several times, but the structure is original. Motor traffic crossed it until the second half of the 20th century — four hundred years of continuous service.

It is now pedestrian. The best view is from the bank downstream, where all the arches line up at once.`,
        },
      },
    },

    {
      slug: "kok-gumbaz-karshi",
      category: "religious",
      themes: ["islamic", "architecture"],
      lat: 38.8639,
      lon: 65.7869,
      price: PRICE.free,
      visit: 25,
      rating: 4.2,
      pop: 0.45,
      hours: H("07:00", "19:00"),
      tr: {
        ru: {
          n: "Мечеть Кок-Гумбаз",
          s: "Пятничная мечеть XVI века с бирюзовым куполом.",
          f: "Мечеть построена в 1580-х годах при Абдулле II. Купол на восьмигранном барабане облицован бирюзовыми изразцами — отсюда название. Здание невелико, но пропорции выдержаны точно: это образец бухарской школы, перенесённой в провинцию. Мечеть действующая.",
        },
        uz: {
          n: "Ko'k Gumbaz masjidi",
          s: "Feruza gumbazli XVI asr juma masjidi.",
        },
        en: {
          n: "Kok-Gumbaz Mosque",
          s: "A 16th-century Friday mosque with a turquoise dome.",
          f: "Built in the 1580s under Abdullah Khan II. The dome on its octagonal drum is faced in turquoise tile — hence the name. The building is small but exactly proportioned: an example of the Bukharan school carried into the provinces. The mosque is in use.",
        },
      },
    },

    {
      slug: "odina-mosque",
      category: "museum",
      themes: ["islamic", "architecture", "museums"],
      lat: 38.8625,
      lon: 65.7908,
      price: PRICE.small,
      visit: 30,
      rating: 4.1,
      pop: 0.35,
      hours: H("09:00", "17:00", [1]),
      tr: {
        ru: {
          n: "Мечеть Одина",
          s: "Мечеть XIV–XVI веков, сейчас музей истории Кашкадарьи.",
          f: "Здание заложено в XIV веке, перестроено в XVI. Портал сохранил фрагменты изразцовой мозаики темуридского времени. С советских лет здесь размещается краеведческий музей: находки с городища Нахшаб, керамика, монеты, этнография Кашкадарьи. Понедельник — выходной.",
        },
        uz: {
          n: "Odina masjidi",
          s: "XIV–XVI asrlar masjidi, hozir Qashqadaryo tarixi muzeyi.",
        },
        en: {
          n: "Odina Mosque",
          s: "A 14th–16th century mosque, now the Kashkadarya history museum.",
          f: "The building was founded in the 14th century and rebuilt in the 16th. The portal keeps fragments of Timurid tile mosaic. Since Soviet times it has housed the regional museum: finds from the Nakhshab settlement, ceramics, coins, and the ethnography of Kashkadarya. Closed Mondays.",
        },
      },
    },

    {
      slug: "karshi-bazaar",
      category: "bazaar",
      themes: ["shopping", "food", "free"],
      lat: 38.8583,
      lon: 65.7942,
      price: PRICE.free,
      visit: 35,
      rating: 4.0,
      pop: 0.3,
      hours: H("06:00", "18:00"),
      tr: {
        ru: {
          n: "Каршинский базар",
          s: "Каракулевые смушки, ковры и степная баранина.",
          f: "Кашкадарья — один из центров каракулеводства. На базаре торгуют смушками, изделиями из каракуля, коврами и шерстью. Отсюда же расходится каршинская баранина, которую ценят за счёт полынных пастбищ.",
        },
        uz: { n: "Qarshi bozori", s: "Qorako'l terisi, gilamlar va dasht qo'y go'shti." },
        en: {
          n: "Karshi Bazaar",
          s: "Karakul pelts, carpets and steppe mutton.",
          f: "Kashkadarya is one of the centres of karakul sheep breeding. The bazaar trades in pelts, karakul goods, carpets and wool. Karshi mutton also comes from here, prized for the wormwood pastures the flocks graze.",
        },
      },
    },

    {
      slug: "karshi-restaurant",
      category: "restaurant",
      themes: ["food"],
      lat: 38.8611,
      lon: 65.7925,
      price: 55000,
      visit: 50,
      rating: 4.1,
      pop: 0.22,
      hours: H("10:00", "22:00"),
      tr: {
        ru: { n: "Ресторан «Насаф»", s: "Каршинский шашлык из баранины, шурпа, тандыр-самса." },
        uz: { n: "«Nasaf» restorani", s: "Qarshi qo'y go'shti shashligi, sho'rva, tandir somsa." },
        en: { n: "Nasaf Restaurant", s: "Karshi mutton shashlik, shurpa, tandyr samsa." },
      },
    },
  ],

  tours: [
    {
      slug: "karshi-walk",
      mode: "walk",
      sort: 1,
      tr: {
        ru: {
          title: "Карши пешком",
          description:
            "Компактный центр обходится за пару часов: мост XVI века, мечеть Кок-Гумбаз, музей в мечети Одина и базар. Удобная остановка по дороге в Шахрисабз или Термез.",
        },
        en: {
          title: "Karshi on foot",
          description:
            "The compact centre takes a couple of hours: the 16th-century bridge, the Kok-Gumbaz mosque, the museum in the Odina mosque, and the bazaar. A convenient stop en route to Shakhrisabz or Termez.",
        },
        uz: {
          title: "Qarshi piyoda",
          description:
            "Ixcham markaz bir necha soatda aylaniladi: XVI asr ko'prigi, Ko'k Gumbaz, Odina masjidi muzeyi va bozor.",
        },
      },
      stops: [
        ["karshi-bridge", 25],
        ["kok-gumbaz-karshi", 25],
        ["odina-mosque", 30],
        ["karshi-bazaar", 35],
      ],
    },
  ],
};
