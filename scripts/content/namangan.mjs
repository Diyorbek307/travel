import { H, ALWAYS, PRICE } from "./_helpers.mjs";

export default {
  slug: "namangan",
  lat: 40.9983,
  lon: 71.6726,
  zoom: 13,
  tr: {
    ru: {
      name: "Наманган",
      description:
        "Город садов и цветов на севере Ферганской долины. Рядом — городище Аксикент, столица древней Ферганы, где ковали булатную сталь, которую вывозили до Багдада и Индии.",
    },
    uz: {
      name: "Namangan",
      description:
        "Farg'ona vodiysi shimolidagi bog'lar va gullar shahri. Yaqinida — Axsikent shahristoni, qadimgi Farg'ona poytaxti, u yerda Bag'dod va Hindistonga olib ketilgan po'lat quyilgan.",
    },
    en: {
      name: "Namangan",
      description:
        "A city of gardens and flowers in the north of the Fergana Valley. Nearby lies Akhsikent, capital of ancient Fergana, where the crucible steel exported as far as Baghdad and India was forged.",
    },
  },

  pois: [
    {
      slug: "mullah-kyrgyz-madrasah",
      category: "religious",
      themes: ["islamic", "architecture", "history"],
      lat: 40.9967,
      lon: 71.6706,
      price: PRICE.free,
      visit: 30,
      rating: 4.4,
      pop: 0.7,
      hours: H("08:00", "18:00"),
      qr: "NMG-01",
      tr: {
        ru: {
          n: "Медресе Мулла Кыргыз",
          s: "Медресе начала XX века с необычным для региона многоцветным фасадом.",
          f: `Медресе построил в 1910–1912 годах Мулла Кыргыз — местный богатый землевладелец, вложивший состояние в образование.

Здание выделяется отделкой. Фасад покрыт майоликой с необычно широкой палитрой: помимо привычных синего и бирюзового здесь много жёлтого, зелёного и оранжевого. Это ферганская манера, более яркая и цветистая, чем сдержанная бухарская или самаркандская.

В советское время медресе закрыли, здание использовалось под склад, затем под музей литературы. С 1990-х оно возвращено верующим и снова действует как учебное заведение.

Вход на территорию свободный. Внутрь учебных помещений посторонних не пускают, но двор и фасад доступны.`,
        },
        uz: {
          n: "Mulla Qirg'iz madrasasi",
          s: "XX asr boshidagi madrasa, mintaqa uchun noodatiy ko'p rangli peshtoq bilan.",
          f: `Madrasani 1910–1912 yillarda mahalliy boy yer egasi Mulla Qirg'iz qurdirgan.

Bino bezagi bilan ajralib turadi: peshtoq koshin bilan qoplangan, unda ko'k va feruzadan tashqari sariq, yashil va to'q sariq rang ko'p. Bu farg'ona uslubi — buxoro yoki samarqand uslubidan yorqinroq.

Sovet davrida madrasa yopilgan, 1990-yillardan qayta faoliyat yuritadi.

Hovliga kirish bepul.`,
        },
        en: {
          n: "Mullah Kyrgyz Madrasah",
          s: "An early 20th-century madrasah with a polychrome facade unusual for the region.",
          f: `The madrasah was built between 1910 and 1912 by Mullah Kyrgyz, a wealthy local landowner who put his fortune into education.

The building stands out for its decoration. The facade is faced in majolica with an unusually broad palette: beyond the customary blue and turquoise there is a great deal of yellow, green and orange. This is the Fergana manner — brighter and more florid than the restrained Bukharan or Samarkand styles.

The madrasah was closed in the Soviet period and used as a warehouse, then as a literature museum. Since the 1990s it has been returned to the community and functions again as a school.

Entry to the grounds is free. The teaching rooms are not open to visitors, but the courtyard and facade are.`,
        },
      },
    },

    {
      slug: "khoja-amin-mausoleum",
      category: "landmark",
      themes: ["islamic", "architecture", "history"],
      lat: 41.0028,
      lon: 71.6642,
      price: PRICE.free,
      visit: 20,
      rating: 4.2,
      pop: 0.4,
      hours: H("07:00", "19:00"),
      tr: {
        ru: {
          n: "Мавзолей Ходжа Амина",
          s: "Мавзолей XVIII века с резной терракотовой облицовкой.",
          f: "Мавзолей построен в XVIII веке над могилой почитаемого богослова. Портал облицован не изразцами, а резной неглазурованной терракотой — техника, к тому времени уже редкая, отсылающая к домонгольской традиции. Рядом — небольшое кладбище и действующая мечеть.",
        },
        uz: {
          n: "Xoja Amin maqbarasi",
          s: "XVIII asr maqbarasi, o'ymakor terrakota qoplamasi bilan.",
        },
        en: {
          n: "Khoja Amin Mausoleum",
          s: "An 18th-century mausoleum faced in carved terracotta.",
          f: "Built in the 18th century over the grave of a revered theologian. The portal is faced not in glazed tile but in carved unglazed terracotta — a technique already rare by then, harking back to the pre-Mongol tradition. A small cemetery and a working mosque stand alongside.",
        },
      },
    },

    {
      slug: "akhsikent",
      category: "landmark",
      themes: ["history", "free"],
      lat: 40.9256,
      lon: 71.4703,
      price: PRICE.free,
      visit: 50,
      rating: 4.3,
      pop: 0.35,
      hours: ALWAYS,
      qr: "NMG-02",
      tr: {
        ru: {
          n: "Городище Аксикент",
          s: "Столица древней Ферганы и центр производства булатной стали.",
          f: `Аксикент стоял на правом берегу Сырдарьи и был столицей Ферганы с III века до нашей эры до XIII века нашей эры.

Город славился металлургией. Здесь выплавляли тигельную сталь — ту самую, которую в Европе называли булатом или дамаском. Технология была сложной: железо с добавками выдерживали в закрытых глиняных тиглях при высокой температуре несколько дней, получая слиток с характерным узором и исключительной твёрдостью. Клинки из аксикентской стали вывозили в Багдад, Индию и дальше.

При раскопках нашли остатки печей, тигли и шлак — прямое подтверждение письменных источников.

Здесь родился и провёл детство отец Бабура, Умар-Шейх Мирза. В «Бабур-наме» описана его гибель в 1494 году: голубятня на краю обрыва обрушилась в овраг вместе с ним.

Город погиб при монгольском нашествии 1219–1220 годов и больше не возродился. Сегодня видны оплывшие валы городских стен и цитадели.`,
        },
        uz: {
          n: "Axsikent shahristoni",
          s: "Qadimgi Farg'ona poytaxti va po'lat ishlab chiqarish markazi.",
          f: `Axsikent Sirdaryoning o'ng qirg'og'ida joylashgan va eramizdan avvalgi III asrdan eramizning XIII asrigacha Farg'ona poytaxti bo'lgan.

Shahar metallurgiyasi bilan mashhur edi: bu yerda tigel po'lati quyilgan — Yevropada bulat yoki damashq deb atalgan. Axsikent po'latidan yasalgan qilichlar Bag'dod va Hindistonga olib ketilgan.

Bu yerda Boburning otasi Umarshayx Mirzo tug'ilgan. «Boburnoma»da uning 1494 yildagi halokati tasvirlangan: jar chekkasidagi kaptarxona u bilan birga qulagan.

Shahar 1219–1220 yillardagi mo'g'ul bosqinida halok bo'lgan.`,
        },
        en: {
          n: "Akhsikent",
          s: "Capital of ancient Fergana and a centre of crucible steel production.",
          f: `Akhsikent stood on the right bank of the Syr Darya and was the capital of Fergana from the 3rd century BCE to the 13th century CE.

The town was famous for metallurgy. Crucible steel was smelted here — the material Europe knew as bulat or Damascus steel. The process was demanding: iron with additives was held in sealed clay crucibles at high temperature for several days, yielding an ingot with a characteristic pattern and exceptional hardness. Blades of Akhsikent steel were exported to Baghdad, India and beyond.

Excavations found furnace remains, crucibles and slag — direct confirmation of the written sources.

Babur's father, Umar Shaykh Mirza, was born and raised here. The Baburnama describes his death in 1494: a dovecote on the edge of a ravine collapsed into the gully, taking him with it.

The city died in the Mongol invasion of 1219–1220 and was never rebuilt. Today you see the slumped ramparts of the walls and citadel.`,
        },
      },
    },

    {
      slug: "namangan-bazaar",
      category: "bazaar",
      themes: ["shopping", "food", "crafts", "free"],
      lat: 40.9994,
      lon: 71.6753,
      price: PRICE.free,
      visit: 40,
      rating: 4.2,
      pop: 0.35,
      hours: H("06:00", "18:00"),
      tr: {
        ru: {
          n: "Центральный базар Намангана",
          s: "Ножи-пчаки из Чуста, сухофрукты и наманганские яблоки.",
          f: "Главная местная покупка — чустский пчак, традиционный узбекский нож. Их куют в соседнем Чусте вручную, из подшипниковой стали, с наборной рукоятью из рога и латуни. Также здесь торгуют сухофруктами и знаменитыми наманганскими яблоками.",
        },
        uz: {
          n: "Namangan markaziy bozori",
          s: "Chust pichoqlari, quruq mevalar va namangan olmalari.",
        },
        en: {
          n: "Namangan Central Bazaar",
          s: "Chust pchak knives, dried fruit and Namangan apples.",
          f: "The local purchase is the Chust pchak, the traditional Uzbek knife. They are forged by hand in neighbouring Chust from bearing steel, with handles built up from horn and brass. Dried fruit and the famous Namangan apples are sold here too.",
        },
      },
    },

    {
      slug: "namangan-park",
      category: "nature",
      themes: ["nature", "family", "free"],
      lat: 41.0022,
      lon: 71.6819,
      price: PRICE.free,
      visit: 30,
      rating: 4.1,
      pop: 0.25,
      hours: ALWAYS,
      tr: {
        ru: {
          n: "Парк Бабура",
          s: "Городской парк с розариями — Наманган называют городом цветов не случайно.",
          f: "Наманган исторически был центром садоводства и цветоводства долины. Городской парк с розариями и старыми чинарами — самое тенистое место в центре и точка отдыха между поездками по региону.",
        },
        uz: { n: "Bobur bog'i", s: "Atirgulzorli shahar bog'i." },
        en: {
          n: "Babur Park",
          s: "A city park with rose gardens — Namangan is called the city of flowers for a reason.",
          f: "Namangan was historically the valley's centre of horticulture and flower growing. The city park, with its rose gardens and old plane trees, is the shadiest spot in the centre and a good place to rest between trips around the region.",
        },
      },
    },

    {
      slug: "namangan-restaurant",
      category: "restaurant",
      themes: ["food"],
      lat: 40.9975,
      lon: 71.6739,
      price: 50000,
      visit: 50,
      rating: 4.2,
      pop: 0.25,
      hours: H("10:00", "22:00"),
      tr: {
        ru: { n: "Ресторан «Наманган»", s: "Плов, шашлык и наманганская самса с тыквой." },
        uz: { n: "«Namangan» restorani", s: "Palov, shashlik va qovoqli somsa." },
        en: { n: "Namangan Restaurant", s: "Plov, shashlik and Namangan pumpkin samsa." },
      },
    },
  ],

  tours: [
    {
      slug: "namangan-day",
      mode: "taxi",
      sort: 1,
      tr: {
        ru: {
          title: "Наманган и Аксикент",
          description:
            "Медресе с самым цветным фасадом долины, мавзолей XVIII века и городище Аксикент, где ковали булат и где погиб отец Бабура.",
        },
        en: {
          title: "Namangan and Akhsikent",
          description:
            "The madrasah with the most colourful facade in the valley, an 18th-century mausoleum, and Akhsikent, where crucible steel was forged and Babur's father died.",
        },
        uz: {
          title: "Namangan va Axsikent",
          description:
            "Vodiydagi eng rangli peshtoqli madrasa, XVIII asr maqbarasi va Axsikent shahristoni.",
        },
      },
      stops: [
        ["mullah-kyrgyz-madrasah", 30],
        ["khoja-amin-mausoleum", 20],
        ["namangan-bazaar", 40],
        ["akhsikent", 50],
      ],
    },
  ],
};
