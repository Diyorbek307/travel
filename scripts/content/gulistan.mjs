import { H, ALWAYS, PRICE } from "./_helpers.mjs";

export default {
  slug: "gulistan",
  lat: 40.4897,
  lon: 68.7842,
  zoom: 11,
  tr: {
    ru: {
      name: "Гулистан и Сырдарья",
      description:
        "Область на Голодной степи — равнине, которую орошали больше века и превратили в хлопковые поля. Туристических памятников здесь немного, зато отсюда начинается Айдар-Арнасайская система озёр и проходит дорога из Ташкента в Ферганскую долину.",
    },
    uz: {
      name: "Guliston va Sirdaryo",
      description:
        "Mirzacho'ldagi viloyat — bir asrdan ortiq sug'orilib, paxta dalalariga aylantirilgan tekislik. Sayyohlik yodgorliklari ko'p emas, ammo bu yerdan Aydar-Arnasoy ko'llar tizimi boshlanadi.",
    },
    en: {
      name: "Gulistan and Syrdarya",
      description:
        "A province on the Hungry Steppe — a plain irrigated for more than a century and turned into cotton fields. There are few monuments here, but the Aydar-Arnasay lake system begins from this side, and the road from Tashkent to the Fergana Valley passes through.",
    },
  },

  pois: [
    {
      slug: "arnasay-lakes",
      category: "nature",
      themes: ["nature", "family"],
      lat: 40.7028,
      lon: 68.0472,
      price: PRICE.free,
      visit: 120,
      rating: 4.4,
      pop: 0.55,
      hours: ALWAYS,
      qr: "SIR-01",
      tr: {
        ru: {
          n: "Арнасайские озёра",
          s: "Система озёр, возникшая от сброса паводковых вод — теперь место зимовки птиц.",
          f: `Айдар-Арнасайская система озёр появилась не по замыслу. В 1969 году на Сырдарье случился исключительный паводок; Чардарьинское водохранилище не выдержало, и воду сбросили в Арнасайскую низину. Сброс продолжался месяцами, и на месте солончаковой впадины возникло озеро.

Сегодня это водоём длиной около 250 километров и площадью более трёх тысяч квадратных километров — один из крупнейших искусственных водоёмов Средней Азии.

За полвека здесь сложилась своя экосистема. Озёра стали местом зимовки и остановки перелётных птиц на пути из Сибири: фламинго, пеликаны, бакланы, цапли, гуси. В сезон миграции орнитологи насчитывают больше двухсот видов.

В озере водится сазан, судак, сом — рыбалка здесь популярна у местных.

Инфраструктуры почти нет: несколько баз отдыха и юрточных лагерей со стороны Джизакской и Навоийской областей. Это место для тех, кто едет смотреть на природу, а не на памятники.`,
        },
        uz: {
          n: "Arnasoy ko'llari",
          s: "Toshqin suvlari to'kilishidan paydo bo'lgan ko'llar tizimi — hozir qushlar qishlaydigan joy.",
          f: `Aydar-Arnasoy ko'llar tizimi rejalashtirilmagan holda paydo bo'lgan. 1969 yilda Sirdaryoda kuchli toshqin bo'lgan va suv Arnasoy pastligiga to'kilgan.

Bugun bu uzunligi 250 kilometrga yaqin, maydoni uch ming kvadrat kilometrdan ortiq suv havzasi.

Yarim asrda o'ziga xos ekotizim shakllangan. Ko'llar Sibirdan uchib keladigan qushlar qishlaydigan joyga aylangan: qizilg'oz, saqoqush, baqlon, laylak. Migratsiya mavsumida ikki yuzdan ortiq tur qayd etiladi.

Ko'lda zog'ora baliq, sudak, laqqa bor.`,
        },
        en: {
          n: "Arnasay Lakes",
          s: "A lake system created by flood releases — now a wintering ground for birds.",
          f: `The Aydar-Arnasay lake system was not planned. In 1969 an exceptional flood struck the Syr Darya; the Chardara reservoir could not hold it, and the water was released into the Arnasay depression. The discharge went on for months, and a lake appeared where a salt flat had been.

Today it runs some 250 kilometres long and covers more than three thousand square kilometres — one of the largest artificial water bodies in Central Asia.

Over half a century an ecosystem of its own has formed. The lakes became a wintering and staging ground for migratory birds on the route from Siberia: flamingos, pelicans, cormorants, herons, geese. In migration season ornithologists count more than two hundred species.

Carp, pike-perch and catfish live in the lake, and fishing is popular locally.

There is almost no infrastructure: a few holiday bases and yurt camps on the Jizzakh and Navoi sides. This is a place for people who come to look at nature rather than monuments.`,
        },
      },
    },

    {
      slug: "gulistan-museum",
      category: "museum",
      themes: ["museums", "history"],
      lat: 40.4911,
      lon: 68.7856,
      price: PRICE.small,
      visit: 40,
      rating: 4.0,
      pop: 0.25,
      hours: H("09:00", "17:00", [1]),
      tr: {
        ru: {
          n: "Краеведческий музей Сырдарьи",
          s: "История освоения Голодной степи — от каналов XIX века до наших дней.",
          f: `Музей рассказывает историю, которая объясняет, как выглядит эта область сегодня.

Голодная степь — равнина между Сырдарьёй и предгорьями, до конца XIX века почти безлюдная из-за нехватки воды. Освоение началось в 1870-х с первых каналов; масштабные работы развернулись в советское время, когда сюда провели Северный и Южный Голодностепские каналы и переселили десятки тысяч человек.

В экспозиции — карты, инструменты, фотографии строительства, материалы о переселенцах. Отдельный раздел посвящён последствиям: засолению почв и обмелению Сырдарьи, вода которой уходила на поля.

Понедельник — выходной.`,
        },
        uz: {
          n: "Sirdaryo o'lkashunoslik muzeyi",
          s: "Mirzacho'lni o'zlashtirish tarixi — XIX asr kanallaridan bugungacha.",
        },
        en: {
          n: "Syrdarya Regional Museum",
          s: "The history of settling the Hungry Steppe — from 19th-century canals to today.",
          f: `The museum tells the story that explains how this province looks now.

The Hungry Steppe is the plain between the Syr Darya and the foothills, nearly uninhabited until the late 19th century for want of water. Development began in the 1870s with the first canals; large-scale work came in the Soviet period, when the Northern and Southern Hungry Steppe canals were cut and tens of thousands of people were resettled here.

The display holds maps, tools, construction photographs and material on the settlers. A separate section covers the consequences: soil salinisation and the shrinking of the Syr Darya, whose water went to the fields.

Closed Mondays.`,
        },
      },
    },

    {
      slug: "gulistan-bazaar",
      category: "bazaar",
      themes: ["shopping", "food", "free"],
      lat: 40.4872,
      lon: 68.7889,
      price: PRICE.free,
      visit: 30,
      rating: 3.9,
      pop: 0.2,
      hours: H("06:00", "18:00"),
      tr: {
        ru: {
          n: "Гулистанский базар",
          s: "Придорожный рынок на пути из Ташкента в Ферганскую долину.",
        },
        uz: { n: "Guliston bozori", s: "Toshkentdan Farg'ona vodiysiga yo'ldagi bozor." },
        en: {
          n: "Gulistan Bazaar",
          s: "A roadside market on the way from Tashkent to the Fergana Valley.",
        },
      },
    },

    {
      slug: "gulistan-restaurant",
      category: "restaurant",
      themes: ["food"],
      lat: 40.4889,
      lon: 68.7867,
      price: 45000,
      visit: 45,
      rating: 4.0,
      pop: 0.18,
      hours: H("08:00", "22:00"),
      tr: {
        ru: { n: "Ресторан «Сырдарё»", s: "Рыба из Сырдарьи, шурпа, плов." },
        uz: { n: "«Sirdaryo» restorani", s: "Sirdaryo baliqlari, sho'rva, palov." },
        en: { n: "Syrdarya Restaurant", s: "Fish from the Syr Darya, shurpa, plov." },
      },
    },
  ],

  tours: [
    {
      slug: "syrdarya-lakes",
      mode: "car",
      sort: 1,
      tr: {
        ru: {
          title: "Сырдарья и Арнасайские озёра",
          description:
            "Для тех, кто едет за природой, а не за памятниками: музей освоения Голодной степи и озёра, где зимуют фламинго и пеликаны. Лучшее время — весна и осень, в сезон миграции птиц.",
        },
        en: {
          title: "Syrdarya and the Arnasay Lakes",
          description:
            "For those who come for nature rather than monuments: the museum of the Hungry Steppe and the lakes where flamingos and pelicans winter. Best in spring and autumn, during the bird migration.",
        },
        uz: {
          title: "Sirdaryo va Arnasoy ko'llari",
          description:
            "Tabiat uchun keladiganlarga: Mirzacho'l muzeyi va qushlar qishlaydigan ko'llar.",
        },
      },
      stops: [
        ["gulistan-museum", 40],
        ["gulistan-bazaar", 30],
        ["arnasay-lakes", 120],
      ],
    },
  ],
};
