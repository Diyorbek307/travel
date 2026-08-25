import { H, ALWAYS, PRICE } from "./_helpers.mjs";

export default {
  slug: "navoi",
  lat: 40.5619,
  lon: 65.7947,
  zoom: 10,
  tr: {
    ru: {
      name: "Навои и Нурата",
      description:
        "Область на краю Кызылкума. Здесь стоит крепость, заложенная Александром Македонским, бьёт источник со священными рыбами, а на скалах Сармышсая выбиты рисунки, которым несколько тысяч лет. Отсюда же начинаются юрточные лагеря на озере Айдаркуль.",
    },
    uz: {
      name: "Navoiy va Nurota",
      description:
        "Qizilqum chekkasidagi viloyat. Bu yerda Aleksandr Makedonskiy asos solgan qal'a, muqaddas baliqlari bo'lgan buloq va Sarmishsoy qoyalaridagi bir necha ming yillik suratlar bor. Aydarko'ldagi o'tov lagerlari ham shu yerdan boshlanadi.",
    },
    en: {
      name: "Navoi and Nurata",
      description:
        "A province at the edge of the Kyzylkum. Here stand a fortress founded by Alexander the Great, a spring with sacred fish, and rock carvings at Sarmyshsay several thousand years old. The yurt camps on Lake Aydarkul start from here too.",
    },
  },

  pois: [
    {
      slug: "nurata-chashma",
      category: "religious",
      themes: ["islamic", "nature", "history", "free"],
      lat: 40.5628,
      lon: 65.6889,
      price: PRICE.free,
      visit: 45,
      rating: 4.7,
      pop: 0.85,
      hours: H("06:00", "20:00"),
      qr: "NVI-01",
      tr: {
        ru: {
          n: "Источник Чашма",
          s: "Священный родник с форелью, которую здесь не ловят уже тысячу лет.",
          f: `Чашма — родник, вокруг которого вырос религиозный комплекс: мечеть Джума XVI века, купольная баня и мавзолей.

Вода выходит из-под земли с постоянной температурой около 19 градусов круглый год и не замерзает зимой. По составу она минеральная, с высоким содержанием йода и брома; местные считают её целебной.

В бассейне живёт маранка — рыба из семейства карповых. Её здесь называют священной и не ловят: по преданию, это потомство рыб, которых оставил сам Али. Кормить можно, ловить нельзя — запрет соблюдается неукоснительно уже много столетий.

Легенда о происхождении источника: с неба упал огненный камень, и на месте его падения забил родник. Отсюда и название местности — Нур-ата, «отец света».

Место действующее и людное, особенно по пятницам и в выходные. Женщинам нужен платок.`,
        },
        uz: {
          n: "Chashma buloqi",
          s: "Ming yildan beri baliq tutilmaydigan muqaddas buloq.",
          f: `Chashma — atrofida diniy majmua o'sgan buloq: XVI asr Jome masjidi, gumbazli hammom va maqbara.

Suv yer ostidan yil davomida taxminan 19 daraja haroratda chiqadi va qishda muzlamaydi. Tarkibi minerallashgan, yod va brom ko'p.

Hovuzda marinka baliqlari yashaydi. Ularni muqaddas deb bilishadi va tutmaydilar: rivoyatga ko'ra, bu Alining o'zi qoldirgan baliqlar avlodi.

Buloq paydo bo'lishi haqidagi rivoyat: osmondan olovli tosh tushgan va o'sha joyda buloq otilib chiqqan. Joy nomi ham shundan — Nur ota, «nur otasi».

Ziyoratgoh gavjum, ayniqsa juma va dam olish kunlari.`,
        },
        en: {
          n: "Chashma Spring",
          s: "A sacred spring whose trout have gone uncaught for a thousand years.",
          f: `Chashma is a spring around which a religious complex grew: a 16th-century Juma mosque, a domed bathhouse and a mausoleum.

The water rises at a constant temperature of about 19 degrees year round and does not freeze in winter. It is mineral in composition, high in iodine and bromine; locals hold it to be healing.

Marinka, a fish of the carp family, lives in the pool. They are called sacred here and are never caught: tradition holds them descendants of fish left by Ali himself. Feeding is allowed, fishing is not — and the prohibition has been kept strictly for many centuries.

The legend of the spring's origin: a stone of fire fell from the sky, and where it struck a spring broke out. The name of the place comes from that — Nur-ata, "father of light".

The site is active and busy, particularly on Fridays and at weekends. Women need a headscarf.`,
        },
      },
    },

    {
      slug: "nurata-fortress",
      category: "landmark",
      themes: ["history", "architecture", "free"],
      lat: 40.5636,
      lon: 65.6875,
      price: PRICE.free,
      visit: 35,
      rating: 4.3,
      pop: 0.55,
      hours: ALWAYS,
      qr: "NVI-02",
      tr: {
        ru: {
          n: "Крепость Нур",
          s: "Оплывшие стены форта, заложенного Александром Македонским в 327 году до н. э.",
          f: `Крепость Нур заложена в 327 году до нашей эры при Александре Македонском как северный форпост на границе оседлых земель и степи кочевников. Это была часть цепи укреплений, прикрывавших Согдиану.

От крепости остались оплывшие глинобитные стены и башни на холме над источником Чашма. Сохранились следы подземного водовода — кяриза, по которому вода из родника подавалась внутрь укрепления: крепость могла держать осаду.

Подъём на холм занимает минут десять. Сверху хорошо видно и комплекс Чашма внизу, и линию Нуратинского хребта, за которым начинается пустыня.

Раскопки подтверждают, что жизнь здесь не прерывалась с античности до XVIII века.`,
        },
        uz: {
          n: "Nur qal'asi",
          s: "Eramizdan avvalgi 327 yilda Aleksandr Makedonskiy asos solgan qal'a devorlari.",
          f: `Nur qal'asiga eramizdan avvalgi 327 yilda Aleksandr Makedonskiy davrida asos solingan — o'troq yerlar va ko'chmanchilar dashti chegarasidagi shimoliy istehkom sifatida.

Qal'adan tepalikdagi paxsa devorlar va minoralar qolgan. Yerosti suv yo'li — koriz izlari saqlangan: qal'a qamalga bardosh bera olgan.

Tepalikka chiqish o'n daqiqacha. Yuqoridan Chashma majmuasi va Nurota tizmasi ko'rinadi.`,
        },
        en: {
          n: "Nur Fortress",
          s: "The slumped walls of a fort founded by Alexander the Great in 327 BCE.",
          f: `The Nur fortress was founded in 327 BCE under Alexander the Great as a northern outpost on the frontier between settled land and the nomads' steppe. It formed part of a chain of forts screening Sogdiana.

What remains are slumped mud-brick walls and towers on the hill above the Chashma spring. Traces survive of an underground water channel — a kariz — that carried spring water inside the walls: the fortress could withstand a siege.

The climb takes about ten minutes. From the top you see both the Chashma complex below and the line of the Nuratau range, beyond which the desert begins.

Excavation confirms that life here continued unbroken from antiquity to the 18th century.`,
        },
      },
    },

    {
      slug: "sarmyshsay-petroglyphs",
      category: "nature",
      themes: ["history", "nature"],
      lat: 40.2864,
      lon: 65.5031,
      price: PRICE.small,
      visit: 90,
      rating: 4.6,
      pop: 0.5,
      hours: ALWAYS,
      qr: "NVI-03",
      tr: {
        ru: {
          n: "Петроглифы Сармышсая",
          s: "Больше четырёх тысяч наскальных рисунков в горном ущелье.",
          f: `Сармышсай — ущелье в отрогах Нуратинского хребта, где на скалах выбито больше четырёх тысяч изображений. Это одно из крупнейших скоплений петроглифов в Средней Азии.

Самые ранние рисунки относят к эпохе бронзы, около III–II тысячелетия до нашей эры, самые поздние — к средневековью. То есть люди приходили сюда рисовать на протяжении четырёх тысяч лет.

Сюжеты: охота на быков и оленей, всадники, колесницы, фигуры в масках и головных уборах, которых интерпретируют как шаманов. Есть изображения животных, которые в этих местах давно не водятся, — это данные о том, каким был климат.

Техника — выбивка каменным или бронзовым орудием по покрытой пустынным загаром поверхности: скол светлее фона, поэтому рисунок читается.

Ущелье живописно само по себе: ручей, деревья, скальные стены. Дорога от Навои занимает около часа, последний участок — по грунтовке.`,
        },
        uz: {
          n: "Sarmishsoy petrogliflari",
          s: "Tog' darasidagi to'rt mingdan ortiq qoyatosh suratlari.",
          f: `Sarmishsoy — Nurota tizmasi etaklaridagi dara, qoyalarda to'rt mingdan ortiq tasvir o'yilgan. Bu Markaziy Osiyodagi eng yirik petroglif to'plamlaridan biri.

Eng qadimgi suratlar bronza davriga — eramizdan avvalgi III–II ming yillikka oid, eng kechkilari o'rta asrlarga. Ya'ni odamlar bu yerga to'rt ming yil davomida rasm chizgani kelgan.

Mavzular: buqa va bug'u ovi, otliqlar, aravalar, niqobli figuralar.

Navoiydan yo'l bir soatcha, oxirgi qismi tuproq yo'l.`,
        },
        en: {
          n: "Sarmyshsay Petroglyphs",
          s: "More than four thousand rock carvings in a mountain gorge.",
          f: `Sarmyshsay is a gorge in the spurs of the Nuratau range where more than four thousand images are cut into the rock. It is one of the largest concentrations of petroglyphs in Central Asia.

The earliest carvings are placed in the Bronze Age, around the 3rd–2nd millennium BCE; the latest are medieval. People came here to carve for four thousand years.

The subjects: hunts for bulls and deer, riders, chariots, figures in masks and headdresses interpreted as shamans. Some animals depicted have long since vanished from these parts — evidence of what the climate once was.

The technique is pecking with a stone or bronze tool through the desert varnish on the rock surface: the fresh chip is lighter than the ground, so the image reads.

The gorge is beautiful in itself: a stream, trees, rock walls. The drive from Navoi takes about an hour, the last stretch on a dirt road.`,
        },
      },
    },

    {
      slug: "aydarkul-yurt-camp",
      category: "hotel",
      themes: ["nature", "family", "entertainment"],
      lat: 40.7419,
      lon: 66.5347,
      price: 350000,
      visit: 120,
      rating: 4.5,
      pop: 0.45,
      hours: ALWAYS,
      tr: {
        ru: {
          n: "Юрточный лагерь на Айдаркуле",
          s: "Ночёвка в юрте на берегу озера посреди степи Кызылкум.",
          f: `Айдаркуль — озеро, которого не должно было быть. Оно образовалось в 1969 году, когда паводок на Сырдарье переполнил Чардарьинское водохранилище и воду сбросили в Арнасайскую впадину. Сегодня это водоём длиной около 250 километров.

На берегу работают юрточные лагеря. Ночёвка в юрте, ужин у костра, прогулка на верблюдах, купание в озере летом. Вечером здесь одно из самых тёмных небес в стране — Млечный путь виден невооружённым глазом.

Это не историческая достопримечательность, а способ увидеть степь и пустыню изнутри. Обычно комбинируют с Нуратой в двухдневной поездке.

Цена ориентировочная — за ночь с питанием. Бронировать нужно заранее, особенно весной и осенью.`,
        },
        uz: {
          n: "Aydarko'ldagi o'tov lageri",
          s: "Qizilqum dashti o'rtasidagi ko'l bo'yida o'tovda tunash.",
          f: "Aydarko'l 1969 yilda Sirdaryodagi toshqin natijasida paydo bo'lgan. Bugun bu uzunligi 250 kilometrga yaqin suv havzasi. Qirg'oqda o'tov lagerlari ishlaydi: o'tovda tunash, gulxan yonida kechki ovqat, tuya sayri. Kechqurun osmon juda qorong'i — Somon yo'li yalang'och ko'z bilan ko'rinadi.",
        },
        en: {
          n: "Aydarkul Yurt Camp",
          s: "A night in a yurt on the lakeshore in the middle of the Kyzylkum steppe.",
          f: `Aydarkul is a lake that should not exist. It formed in 1969 when floods on the Syr Darya overfilled the Chardara reservoir and the water was released into the Arnasay depression. Today it stretches some 250 kilometres.

Yurt camps work along the shore. A night in a yurt, dinner by the fire, a camel ride, swimming in summer. The night sky here is among the darkest in the country — the Milky Way is visible to the naked eye.

This is not a historical monument but a way to see the steppe and desert from inside. It is usually combined with Nurata in a two-day trip.

The price is indicative, for a night with meals. Book ahead, particularly in spring and autumn.`,
        },
      },
    },

    {
      slug: "nurata-suzani",
      category: "craft",
      themes: ["crafts", "shopping"],
      lat: 40.5606,
      lon: 65.6917,
      price: PRICE.free,
      visit: 35,
      rating: 4.4,
      pop: 0.3,
      hours: H("09:00", "18:00"),
      tr: {
        ru: {
          n: "Мастерские сюзане в Нурате",
          s: "Вышивка нуратинской школы — самая тонкая работа в стране.",
          f: `Сюзане — вышитое панно, которое в Средней Азии готовили к свадьбе: мать начинала работу, когда дочь была ребёнком, и заканчивала к её замужеству.

Нуратинская школа отличается от бухарской и шахрисабзской. Здесь работают мелким стежком по светлому фону, оставляя много воздуха; композиция строится вокруг центральной розетки с расходящимися ветвями. Основные мотивы — гранат, миндаль, тюльпан, солнечный круг.

Красители традиционно натуральные: марена, индиго, гранатовая кожура.

В мастерских можно посмотреть на работу и купить напрямую у вышивальщиц. Крупное сюзане делается несколько месяцев, поэтому и стоит соответственно.`,
        },
        uz: {
          n: "Nurota so'zana ustaxonalari",
          s: "Nurota maktabi kashtasi — mamlakatdagi eng nozik ish.",
        },
        en: {
          n: "Nurata Suzani Workshops",
          s: "Embroidery of the Nurata school — the finest work in the country.",
          f: `Suzani is an embroidered panel prepared in Central Asia for a wedding: the mother began the work when her daughter was a child and finished it by the marriage.

The Nurata school differs from those of Bukhara and Shakhrisabz. The stitch is fine, worked on a light ground with a great deal of air left around it; the composition builds around a central rosette with branches radiating out. The main motifs are pomegranate, almond, tulip and the solar disc.

Dyes are traditionally natural: madder, indigo, pomegranate rind.

The workshops let you watch the work and buy directly from the embroiderers. A large suzani takes months, and is priced accordingly.`,
        },
      },
    },

    {
      slug: "navoi-restaurant",
      category: "restaurant",
      themes: ["food"],
      lat: 40.0844,
      lon: 65.3792,
      price: 55000,
      visit: 50,
      rating: 4.1,
      pop: 0.22,
      hours: H("10:00", "22:00"),
      tr: {
        ru: { n: "Ресторан «Навоий»", s: "Степная кухня: баранина, казан-кабоб, шурпа." },
        uz: { n: "«Navoiy» restorani", s: "Dasht taomlari: qo'y go'shti, qozon kabob, sho'rva." },
        en: { n: "Navoi Restaurant", s: "Steppe cooking: mutton, kazan kebab, shurpa." },
      },
    },
  ],

  tours: [
    {
      slug: "nurata-aydarkul",
      mode: "car",
      sort: 1,
      tr: {
        ru: {
          title: "Нурата и Айдаркуль",
          description:
            "Двухдневная поездка: крепость Александра Македонского, священный источник, мастерские сюзане и ночёвка в юрте на берегу озера. Классический маршрут для тех, кто хочет увидеть не только города.",
        },
        en: {
          title: "Nurata and Aydarkul",
          description:
            "Two days: Alexander's fortress, the sacred spring, the suzani workshops, and a night in a yurt by the lake. The standard route for anyone who wants more than cities.",
        },
        uz: {
          title: "Nurota va Aydarko'l",
          description:
            "Ikki kunlik sayohat: Aleksandr qal'asi, muqaddas buloq, so'zana ustaxonalari va ko'l bo'yida o'tovda tunash.",
        },
      },
      stops: [
        ["nurata-chashma", 45],
        ["nurata-fortress", 35],
        ["nurata-suzani", 35],
        ["aydarkul-yurt-camp", 120],
      ],
    },
  ],
};
