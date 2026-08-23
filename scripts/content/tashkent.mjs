import { H, ALWAYS, PRICE } from "./_helpers.mjs";

export default {
  slug: "tashkent",
  lat: 41.3111,
  lon: 69.2797,
  zoom: 12,
  tr: {
    ru: {
      name: "Ташкент",
      description:
        "Столица Узбекистана и крупнейший город Средней Азии. Точка прилёта большинства туристов: международный аэропорт, вокзал скоростных поездов и метро с самыми красивыми станциями региона.",
    },
    uz: {
      name: "Toshkent",
      description:
        "O'zbekiston poytaxti va Markaziy Osiyodagi eng yirik shahar. Aksariyat sayyohlar shu yerga uchib keladi: xalqaro aeroport, tezyurar poyezdlar vokzali va mintaqadagi eng go'zal metro bekatlari.",
    },
    en: {
      name: "Tashkent",
      description:
        "The capital of Uzbekistan and the largest city in Central Asia. Most visitors arrive here: an international airport, the high-speed rail terminal, and a metro with the finest stations in the region.",
    },
  },

  pois: [
    {
      slug: "khast-imam",
      category: "religious",
      themes: ["islamic", "history", "architecture", "free"],
      lat: 41.3358,
      lon: 69.24,
      price: PRICE.free,
      visit: 60,
      rating: 4.7,
      pop: 0.9,
      hours: H("08:00", "19:00"),
      qr: "TAS-01",
      museum: [
        {
          number: "301",
          period: "VII–VIII век",
          origin: "Библиотека Муйи Муборак, Ташкент",
          tr: {
            ru: {
              n: "Коран Усмана",
              s: "Одна из старейших сохранившихся рукописей Корана в мире.",
              f: "Рукопись на пергаменте, написанная куфическим письмом. По преданию, это тот самый список, который читал третий халиф Усман в момент убийства в 656 году — на страницах есть тёмные пятна, которые традиция считает следами его крови. Датировка спорна: исследователи относят рукопись к VII–VIII векам, что делает её в любом случае одной из древнейших. Из 706 сохранившихся листов около трети текста утрачено. Рукопись прошла путь из Медины через Багдад и Самарканд, была вывезена в Петербург в 1869 году и возвращена в Ташкент в 1924-м. Фотографировать запрещено.",
            },
            en: {
              n: "The Uthman Quran",
              s: "One of the oldest surviving Quran manuscripts in the world.",
              f: "A parchment manuscript in Kufic script. Tradition holds it is the very copy the third caliph Uthman was reading when he was killed in 656 — the pages carry dark stains said to be his blood. The dating is disputed; researchers place the manuscript in the 7th or 8th century, which makes it among the oldest in any case. Of its 706 surviving leaves, about a third of the text is lost. The manuscript travelled from Medina via Baghdad to Samarkand, was taken to St Petersburg in 1869, and returned to Tashkent in 1924. Photography is not permitted.",
            },
          },
        },
      ],
      tr: {
        ru: {
          n: "Комплекс Хазрати Имам",
          s: "Религиозный центр Ташкента; здесь хранится Коран Усмана VII века.",
          f: `Хазрати Имам (Хастимом) — главный исламский комплекс столицы, сложившийся вокруг могилы Абу Бакра Мухаммада Каффаля аш-Шаши, богослова и поэта X века, одного из первых проповедников ислама в Ташкенте.

В ансамбль входят мечеть Хазрати Имам с двумя минаретами по 53 метра (построена в 2007 году), медресе Барак-хана XVI века, медресе Муйи Муборак и мавзолей Каффаля аш-Шаши 1541 года.

Главная ценность — библиотека в медресе Муйи Муборак, где хранится Коран Усмана: пергаментная рукопись куфическим письмом, одна из старейших в мире. Она выставлена в отдельном зале за стеклом, фотографировать запрещено.

Вход на территорию и в музей свободный. Женщинам нужен платок, всем — закрытые плечи и колени.`,
        },
        en: {
          n: "Khast Imam Complex",
          s: "Tashkent's religious centre, home to the 7th-century Uthman Quran.",
          f: `Khast Imam (Hastimom) is the capital's principal Islamic complex, grown up around the grave of Abu Bakr Muhammad Kaffal al-Shashi, a 10th-century theologian and poet and one of the first to preach Islam in Tashkent.

The ensemble includes the Khast Imam Mosque with two 53-metre minarets (built in 2007), the 16th-century Barak Khan Madrasah, the Muyi Muborak Madrasah, and the 1541 mausoleum of Kaffal al-Shashi.

Its greatest treasure is the library in the Muyi Muborak Madrasah, which holds the Uthman Quran: a parchment manuscript in Kufic script, among the oldest in the world. It is displayed in its own hall behind glass; photography is not allowed.

Entry to the grounds and the museum is free. Women need a headscarf; everyone should have shoulders and knees covered.`,
        },
        uz: {
          n: "Hazrati Imom majmuasi",
          s: "Toshkentning diniy markazi; bu yerda VII asrga oid Usmon Qur'oni saqlanadi.",
          f: `Hazrati Imom — poytaxtning bosh islomiy majmuasi bo'lib, X asr ilohiyotshunosi va shoiri Abu Bakr Muhammad Qaffol Shoshiy qabri atrofida shakllangan.

Majmuaga Hazrati Imom masjidi (2007), XVI asr Baroqxon madrasasi, Mo'yi Muborak madrasasi va Qaffol Shoshiy maqbarasi (1541) kiradi.

Eng qimmatli boylik — Mo'yi Muborak madrasasidagi kutubxonada saqlanayotgan Usmon Qur'oni. Suratga olish taqiqlanadi.`,
        },
      },
    },

    {
      slug: "chorsu-bazaar",
      category: "bazaar",
      themes: ["shopping", "food", "crafts", "free"],
      lat: 41.3262,
      lon: 69.2345,
      price: PRICE.free,
      visit: 60,
      rating: 4.5,
      pop: 0.85,
      hours: H("06:00", "19:00"),
      qr: "TAS-02",
      tr: {
        ru: {
          n: "Базар Чорсу",
          s: "Главный рынок столицы под бирюзовым куполом диаметром 300 метров.",
          f: `Чорсу — «четыре пути» — стоит на перекрёстке торговых дорог в старом городе больше тысячи лет.

Нынешнее сооружение построено в 1980 году: купол диаметром около 300 метров, разделённый на секторы. Под ним — мясные и молочные ряды, специи, соленья, курт, орехи и сухофрукты. Овощи, фрукты, посуда, ткани и одежда торгуются снаружи, вокруг купола.

На втором ярусе под куполом работают точки с готовой едой: плов, лагман, самса из тандыра, шашлык. Это самый дешёвый способ пообедать в центре Ташкента.

Рядом — станция метро «Чорсу», медресе Кукельдаш XVI века и мечеть Ходжа Ахрар Вали.

Практично: приходить утром, брать наличные (карты принимают не везде), торговаться при покупке от килограмма.`,
        },
        en: {
          n: "Chorsu Bazaar",
          s: "The capital's main market, under a turquoise dome some 300 metres across.",
          f: `Chorsu — "four ways" — has stood at the crossing of trade roads in the old city for over a thousand years.

The present structure was built in 1980: a dome roughly 300 metres in diameter, divided into sectors. Beneath it are the meat and dairy rows, spices, pickles, kurt, nuts and dried fruit. Vegetables, fruit, tableware, textiles and clothing trade outside, around the dome.

Cooked-food stalls work on the upper level under the dome: plov, lagman, samsa from the tandyr, shashlik. It is the cheapest lunch in central Tashkent.

Chorsu metro station is next door, along with the 16th-century Kukeldash Madrasah and the Khoja Ahrar Vali Mosque.

Practical notes: come in the morning, bring cash (cards are not accepted everywhere), and haggle when buying by the kilo.`,
        },
        uz: {
          n: "Chorsu bozori",
          s: "Poytaxtning bosh bozori, diametri 300 metrli feruza gumbaz ostida.",
          f: `Chorsu — «to'rt yo'l» — eski shahardagi savdo yo'llari chorrahasida ming yildan ortiq turibdi.

Hozirgi bino 1980 yilda qurilgan. Gumbaz ostida go'sht va sut rastalari, ziravorlar, qurt, yong'oq va quruq mevalar sotiladi.

Ikkinchi qavatda tayyor taomlar: palov, lag'mon, tandir somsa, shashlik. Bu Toshkent markazidagi eng arzon tushlik.`,
        },
      },
    },

    {
      slug: "amir-timur-square",
      category: "landmark",
      themes: ["history", "free", "family"],
      lat: 41.3111,
      lon: 69.2797,
      price: PRICE.free,
      visit: 25,
      rating: 4.5,
      pop: 0.7,
      hours: ALWAYS,
      qr: "TAS-03",
      tr: {
        ru: {
          n: "Сквер Амира Темура",
          s: "Центральная площадь города с конным памятником и старыми чинарами.",
          f: `Сквер разбит в 1882 году как центр новой, построенной после присоединения к Российской империи части Ташкента. От него радиально расходятся главные улицы города.

Памятник в центре менялся вслед за эпохами: сначала здесь стоял генерал Кауфман, затем — серп и молот, затем Сталин, затем Маркс. С 1993 года — конная статуя Амира Темура с надписью «Сила в справедливости».

Вокруг сквера сложился архитектурный ансамбль разных эпох: гостиница «Узбекистан» (1974), Дворец форумов, здание Законодательной палаты, куранты 1947 года.

Старые чинары дают густую тень — летом это одно из немногих прохладных мест в центре.`,
        },
        en: {
          n: "Amir Timur Square",
          s: "The city's central square, with the equestrian monument and old plane trees.",
          f: `The square was laid out in 1882 as the centre of the new part of Tashkent built after the Russian annexation. The city's main streets radiate from it.

The monument at its centre changed with each era: first General Kaufman, then the hammer and sickle, then Stalin, then Marx. Since 1993 it has held an equestrian statue of Amir Timur, inscribed "Strength is in justice".

An architectural ensemble of several periods surrounds the square: the Hotel Uzbekistan (1974), the Palace of Forums, the Legislative Chamber, and a chiming clock tower from 1947.

The old plane trees give dense shade — in summer this is one of the few cool spots in the centre.`,
        },
        uz: {
          n: "Amir Temur xiyoboni",
          s: "Shaharning markaziy maydoni, otliq haykal va qadimiy chinorlar bilan.",
          f: `Xiyobon 1882 yilda Toshkentning yangi qismi markazi sifatida barpo etilgan. Shaharning bosh ko'chalari undan radial tarqaladi.

Markazdagi haykal davrlar bilan birga o'zgargan. 1993 yildan beri bu yerda Amir Temurning otliq haykali turadi — «Kuch adolatdadir» yozuvi bilan.`,
        },
      },
    },

    {
      slug: "history-museum",
      category: "museum",
      themes: ["history", "museums"],
      lat: 41.3116,
      lon: 69.276,
      price: PRICE.small,
      visit: 90,
      rating: 4.4,
      pop: 0.55,
      hours: H("10:00", "17:00", [1]),
      qr: "TAS-04",
      tr: {
        ru: {
          n: "Государственный музей истории Узбекистана",
          s: "Главное собрание страны: от каменного века до XX столетия.",
          f: `Старейший музей Средней Азии — основан в 1876 году как Туркестанский народный музей.

Экспозиция выстроена хронологически. Ключевые экспонаты: находки из грота Тешик-Таш (стоянка неандертальцев возрастом около 70 тысяч лет), буддийские статуи из Фаяз-Тепе и Дальверзин-Тепе кушанского времени, согдийские артефакты, коллекции по эпохе Темуридов и материалы по истории XX века.

Стоит выделить не меньше полутора часов. Подписи в основном на узбекском и русском; английские есть не везде — аудиогид или экскурсия помогут.

Понедельник — выходной.`,
        },
        en: {
          n: "State Museum of History of Uzbekistan",
          s: "The country's principal collection, from the Stone Age to the 20th century.",
          f: `The oldest museum in Central Asia, founded in 1876 as the Turkestan People's Museum.

The display runs chronologically. Key holdings: finds from the Teshik-Tash cave (a Neanderthal site around 70,000 years old), Buddhist sculpture from Fayaz-Tepe and Dalverzin-Tepe of the Kushan period, Sogdian material, the Timurid collections, and 20th-century history.

Allow at least an hour and a half. Labels are mostly in Uzbek and Russian; English is not universal, so an audio guide or a tour helps.

Closed on Mondays.`,
        },
        uz: {
          n: "O'zbekiston tarixi davlat muzeyi",
          s: "Mamlakatning bosh to'plami: tosh davridan XX asrgacha.",
          f: `Markaziy Osiyodagi eng qadimiy muzey — 1876 yilda tashkil etilgan.

Asosiy eksponatlar: Teshiktosh g'oridan topilmalar, Fayoztepa va Dalvarzintepadan buddaviy haykallar, sug'd artefaktlari va temuriylar davri to'plamlari.

Dushanba — dam olish kuni.`,
        },
      },
    },

    {
      slug: "applied-arts-museum",
      category: "museum",
      themes: ["crafts", "museums", "architecture"],
      lat: 41.2952,
      lon: 69.2723,
      price: PRICE.small,
      visit: 45,
      rating: 4.5,
      pop: 0.45,
      hours: H("09:00", "18:00"),
      qr: "TAS-05",
      tr: {
        ru: {
          n: "Музей прикладного искусства",
          s: "Сюзане, керамика, чеканка и резьба в доме дипломата XIX века.",
          f: `Музей интересен вдвойне: и собранием, и самим зданием.

Дом построен в 1890-х годах для русского дипломата Александра Половцева, увлечённого среднеазиатским искусством. Он собрал лучших мастеров региона — резчиков по ганчу, живописцев, столяров — и позволил каждому оформить помещение по-своему. В результате комнаты не повторяются: где-то резной ганч на зеркалах, где-то расписной потолок, где-то наборные деревянные панели.

Коллекция охватывает все основные ремёсла: сюзане из Нураты, Бухары и Шахрисабза, риштанская керамика, чеканка, ювелирные украшения, ковры, национальные костюмы, музыкальные инструменты.

При музее работает магазин с изделиями современных мастеров.`,
        },
        en: {
          n: "Museum of Applied Arts",
          s: "Suzani, ceramics, metalwork and carving in a 19th-century diplomat's house.",
          f: `The museum is worth visiting twice over: for the collection and for the building.

The house was built in the 1890s for the Russian diplomat Alexander Polovtsev, a keen collector of Central Asian art. He gathered the region's best craftsmen — ganch carvers, painters, joiners — and let each decorate a room in their own way. No two rooms repeat: carved ganch over mirrors here, a painted ceiling there, inlaid wooden panels elsewhere.

The collection covers the main crafts: suzani embroidery from Nurata, Bukhara and Shakhrisabz, Rishtan ceramics, metalwork, jewellery, carpets, national dress and musical instruments.

A shop on site sells the work of living craftsmen.`,
        },
        uz: {
          n: "Amaliy san'at muzeyi",
          s: "XIX asr diplomati uyida so'zana, sopol, kandakorlik va o'ymakorlik.",
          f: `Muzey ham to'plami, ham binosi bilan qiziq.

Uy 1890-yillarda rus diplomati Aleksandr Polovtsev uchun qurilgan. U mintaqaning eng yaxshi ustalarini to'plagan va har biriga xonani o'z uslubida bezashga ruxsat bergan — shuning uchun xonalar takrorlanmaydi.

To'plamda Nurota, Buxoro va Shahrisabz so'zanalari, Rishton sopoli, kandakorlik va milliy liboslar bor.`,
        },
      },
    },

    {
      slug: "minor-mosque",
      category: "religious",
      themes: ["islamic", "architecture", "free"],
      lat: 41.3448,
      lon: 69.2856,
      price: PRICE.free,
      visit: 25,
      rating: 4.6,
      pop: 0.5,
      hours: H("06:00", "21:00"),
      tr: {
        ru: {
          n: "Мечеть Минор",
          s: "Белая мраморная мечеть 2014 года на берегу Анхора.",
          f: `Мечеть Минор построена в 2014 году и выделяется среди узбекских мечетей цветом: она облицована белым мрамором, а не традиционной охристой глиной и изразцами. Бирюзовый купол и два минарета по 25 метров хорошо видны с набережной канала Анхор.

Внутри — резной михраб, роспись по ганчу и люстра из чешского стекла. Зал вмещает около 2400 человек.

Мечеть открыта для посетителей вне времени молитв. Вход свободный, обувь снимают у входа, женщинам выдают платок.`,
        },
        en: {
          n: "Minor Mosque",
          s: "A white marble mosque of 2014 on the bank of the Ankhor canal.",
          f: `The Minor Mosque, built in 2014, stands out among Uzbek mosques for its colour: it is faced in white marble rather than the traditional ochre clay and tile. Its turquoise dome and two 25-metre minarets are clearly visible from the Ankhor canal embankment.

Inside are a carved mihrab, painted ganch work and a Czech glass chandelier. The hall holds about 2,400 people.

The mosque is open to visitors outside prayer times. Entry is free, shoes come off at the door, and headscarves are provided for women.`,
        },
        uz: {
          n: "Minor masjidi",
          s: "Anhor bo'yidagi 2014 yilda qurilgan oq marmar masjid.",
          f: "Minor masjidi 2014 yilda qurilgan va oq marmar bilan qoplangani bilan ajralib turadi. Feruza gumbaz va 25 metrli ikki minora Anhor qirg'og'idan yaqqol ko'rinadi. Zal 2400 ga yaqin kishini sig'diradi.",
        },
      },
    },

    {
      slug: "tashkent-tv-tower",
      category: "landmark",
      themes: ["entertainment", "family"],
      lat: 41.3459,
      lon: 69.2874,
      price: PRICE.medium,
      visit: 50,
      rating: 4.3,
      pop: 0.45,
      hours: H("09:00", "20:00"),
      tr: {
        ru: {
          n: "Ташкентская телебашня",
          s: "375 метров, смотровая площадка и вращающийся ресторан на высоте 100 метров.",
          f: `Башня построена в 1985 году и до сих пор остаётся одним из самых высоких сооружений Средней Азии — 375 метров.

Конструкция рассчитана на девятибалльное землетрясение: Ташкент был разрушен подземными толчками в 1966 году, и после этого сейсмостойкость закладывалась во всё капитальное строительство.

Смотровая площадка находится на высоте около 100 метров, лифт поднимается за 45 секунд. Оттуда виден весь город, а в ясную погоду — предгорья Тянь-Шаня. На том же уровне работает вращающийся ресторан: полный оборот занимает около часа.

Для входа нужен паспорт — режимный объект. Фото- и видеосъёмка с площадки разрешена.`,
        },
        en: {
          n: "Tashkent TV Tower",
          s: "375 metres, with an observation deck and a revolving restaurant at 100 metres.",
          f: `Built in 1985, the tower is still among the tallest structures in Central Asia at 375 metres.

It is engineered for a magnitude-9 earthquake: Tashkent was destroyed by a quake in 1966, and seismic resistance was designed into all major construction afterwards.

The observation deck sits at about 100 metres and the lift reaches it in 45 seconds. The whole city is visible from there, and in clear weather the foothills of the Tien Shan. A revolving restaurant works on the same level; one full turn takes about an hour.

Bring your passport — this is a restricted facility. Photography from the deck is permitted.`,
        },
        uz: {
          n: "Toshkent teleminorasi",
          s: "375 metr, 100 metr balandlikda kuzatuv maydonchasi va aylanuvchi restoran.",
          f: "Minora 1985 yilda qurilgan va 375 metr balandligi bilan Markaziy Osiyodagi eng baland inshootlardan biri. Kuzatuv maydonchasi 100 metr balandlikda, lift 45 soniyada ko'taradi. Kirish uchun pasport kerak.",
        },
      },
    },

    {
      slug: "kosmonavtlar-metro",
      category: "transport",
      themes: ["architecture", "history"],
      lat: 41.3005,
      lon: 69.2707,
      price: 2000,
      visit: 20,
      rating: 4.8,
      pop: 0.6,
      hours: H("05:00", "24:00"),
      qr: "TAS-06",
      tr: {
        ru: {
          n: "Станция метро «Космонавтлар»",
          s: "Синие своды и медальоны с портретами космонавтов — самая красивая станция сети.",
          f: `Станция открыта в 1984 году и посвящена освоению космоса.

Стены облицованы стеклом глубокого синего цвета, имитирующим космическое пространство. Вдоль платформы — керамические медальоны с портретами: Икар, Улугбек, Юрий Гагарин, Валентина Терешкова и Владимир Джанибеков, уроженец Узбекистана.

До 2018 года ташкентское метро было режимным объектом и фотографировать в нём запрещалось. Сейчас съёмка разрешена, и станции стали самостоятельной достопримечательностью — почти каждая оформлена по своей теме: «Алишер Навоий» напоминает средневековую мечеть, «Пахтакор» украшена хлопковыми мозаиками, «Мустакиллик майдони» отделана мрамором.

Проезд стоит 2 000 сум, оплата жетоном или картой на входе.`,
        },
        en: {
          n: "Kosmonavtlar Metro Station",
          s: "Blue vaults and medallions of cosmonauts — the finest station on the network.",
          f: `Opened in 1984, the station is devoted to space exploration.

The walls are clad in deep blue glass standing in for outer space. Along the platform run ceramic medallions with portraits: Icarus, Ulugh Beg, Yuri Gagarin, Valentina Tereshkova, and Vladimir Dzhanibekov, a native of Uzbekistan.

Until 2018 the Tashkent metro was a restricted facility and photography was forbidden. It is now allowed, and the stations have become an attraction in their own right — nearly every one is designed around a theme: Alisher Navoi echoes a medieval mosque, Pakhtakor carries cotton mosaics, Mustakillik Maydoni is finished in marble.

A ride costs 2,000 UZS, paid by token or card at the entrance.`,
        },
        uz: {
          n: "«Kosmonavtlar» metro bekati",
          s: "Ko'k gumbazlar va kosmonavtlar portretlari — tarmoqdagi eng go'zal bekat.",
          f: `Bekat 1984 yilda ochilgan va kosmosni o'zlashtirishga bag'ishlangan.

Devorlar chuqur ko'k rangli shisha bilan qoplangan. Platforma bo'ylab Ikar, Ulug'bek, Yuriy Gagarin, Valentina Tereshkova va o'zbekistonlik Vladimir Djanibekov portretlari joylashgan.

2018 yilgacha metroda suratga olish taqiqlangan edi. Yo'l haqi — 2 000 so'm.`,
        },
      },
    },

    {
      slug: "plov-centre",
      category: "restaurant",
      themes: ["food"],
      lat: 41.3453,
      lon: 69.2864,
      price: 45000,
      visit: 50,
      rating: 4.6,
      pop: 0.75,
      hours: H("11:00", "16:00"),
      qr: "TAS-07",
      tr: {
        ru: {
          n: "Центральноазиатский центр плова",
          s: "Плов из казанов на 1000 порций. Приходить до 13:00 — потом заканчивается.",
          f: `Заведение у телебашни, где плов готовят в огромных казанах прямо на глазах у посетителей. Каждый казан вмещает до тысячи порций.

Здесь подают ташкентский плов: рис девзира, жёлтая морковь, баранина, нут, изюм, перепелиное яйцо и конская колбаса казы как добавка.

Главное правило — приходить рано. Казаны открывают около 11 утра, и к 13–14 часам плов заканчивается; вечером заведение не работает.

Порция стоит около 45 000 сум. Наличные предпочтительнее.`,
        },
        en: {
          n: "Central Asian Plov Centre",
          s: "Plov from cauldrons holding a thousand portions. Come before 13:00 — it runs out.",
          f: `A place by the TV tower where plov is cooked in enormous cauldrons in full view of the customers. Each cauldron holds up to a thousand portions.

They serve Tashkent-style plov: devzira rice, yellow carrot, mutton, chickpeas, raisins, a quail egg, and kazy horse sausage as an extra.

The main rule is to come early. The cauldrons open around 11:00 and the plov is gone by 13:00 or 14:00; the place does not work in the evening.

A portion costs about 45,000 UZS. Cash is preferred.`,
        },
        uz: {
          n: "Markaziy Osiyo palov markazi",
          s: "Ming porsiyalik qozonlarda palov. Soat 13:00 gacha kelish kerak — keyin tugaydi.",
          f: `Teleminora yonidagi joy, bu yerda palov ulkan qozonlarda mehmonlar ko'z o'ngida pishiriladi.

Toshkent palovi beriladi: devzira guruch, sariq sabzi, qo'y go'shti, no'xat, mayiz, bedana tuxumi va qazi.

Qozonlar soat 11 da ochiladi, 13–14 ga borib palov tugaydi. Porsiya taxminan 45 000 so'm.`,
        },
      },
    },

    {
      slug: "tashkent-airport",
      category: "airport",
      themes: [],
      lat: 41.2579,
      lon: 69.2812,
      price: PRICE.free,
      visit: 20,
      rating: 3.9,
      pop: 0.5,
      hours: ALWAYS,
      qr: "TAS-08",
      tr: {
        ru: {
          n: "Международный аэропорт Ташкента имени Ислама Каримова",
          s: "Главные воздушные ворота страны, 12 км от центра. Терминал 2 — международный.",
          f: "Аэропорт находится в черте города, примерно в 20 минутах езды от центра. Международные рейсы обслуживает терминал 2, внутренние — терминал 3. В зале прилёта работают обменники и офисы мобильных операторов: местную SIM-карту дешевле купить сразу здесь, потребуется паспорт. Официальное такси — по счётчику или через приложения Yandex Go и MyTaxi.",
        },
        en: {
          n: "Islam Karimov Tashkent International Airport",
          s: "The country's main air gateway, 12 km from the centre. Terminal 2 handles international flights.",
          f: "The airport lies within the city, about 20 minutes from the centre. International flights use Terminal 2, domestic flights Terminal 3. Currency exchange desks and mobile operator offices work in the arrivals hall: a local SIM is cheaper bought here, and you will need your passport. Official taxis run on the meter, or use the Yandex Go and MyTaxi apps.",
        },
        uz: {
          n: "Islom Karimov nomidagi Toshkent xalqaro aeroporti",
          s: "Mamlakatning asosiy havo darvozasi, markazdan 12 km. 2-terminal — xalqaro.",
        },
      },
    },

    {
      slug: "tashkent-station",
      category: "station",
      themes: [],
      lat: 41.2874,
      lon: 69.2735,
      price: PRICE.free,
      visit: 15,
      rating: 4.2,
      pop: 0.45,
      hours: ALWAYS,
      tr: {
        ru: {
          n: "Северный вокзал Ташкента",
          s: "Скоростные «Афросиаб» в Самарканд (2 ч 10 мин), Бухару (3 ч 50 мин) и Хиву.",
          f: "Билеты на «Афросиаб» лучше покупать заранее на сайте или в приложении Узбекистон темир йуллари — на популярные направления места заканчиваются за несколько дней. При посадке проверяют паспорт. Рядом станция метро «Ташкент».",
        },
        en: {
          n: "Tashkent North Railway Station",
          s: "Afrosiyob high-speed trains to Samarkand (2 h 10), Bukhara (3 h 50) and Khiva.",
          f: "Book Afrosiyob tickets in advance on the Uzbekistan Railways site or app — popular routes sell out days ahead. Passports are checked at boarding. Tashkent metro station is next door.",
        },
        uz: {
          n: "Toshkent shimoliy vokzali",
          s: "Samarqandga (2 soat 10 daq), Buxoroga (3 soat 50 daq) va Xivaga «Afrosiyob».",
        },
      },
    },
  ],

  tours: [
    {
      slug: "tashkent-1-day",
      mode: "taxi",
      sort: 1,
      tr: {
        ru: {
          title: "Ташкент за 1 день",
          description:
            "От старого города к новому: Хазрати Имам, Чорсу, музеи и обед в центре плова. Расстояния большие — нужно такси или метро.",
        },
        en: {
          title: "Tashkent in one day",
          description:
            "From the old city to the new: Khast Imam, Chorsu, the museums, and lunch at the plov centre. Distances are long — use taxis or the metro.",
        },
        uz: {
          title: "Bir kunda Toshkent",
          description:
            "Eski shahardan yangisiga: Hazrati Imom, Chorsu, muzeylar va palov markazida tushlik.",
        },
      },
      stops: [
        ["khast-imam", 60],
        ["chorsu-bazaar", 50],
        ["plov-centre", 50],
        ["tashkent-tv-tower", 45],
        ["minor-mosque", 25],
        ["amir-timur-square", 25],
        ["applied-arts-museum", 45],
      ],
    },
    {
      slug: "tashkent-metro-tour",
      mode: "walk",
      sort: 2,
      tr: {
        ru: {
          title: "Метро Ташкента: подземный музей",
          description:
            "Маршрут по самым красивым станциям метро. Стоимость — один жетон за 2 000 сум, пересадки бесплатны.",
        },
        en: {
          title: "Tashkent metro: the underground museum",
          description:
            "A route through the network's finest stations. One 2,000 UZS token covers it; transfers are free.",
        },
        uz: {
          title: "Toshkent metrosi: yer ostidagi muzey",
          description: "Eng go'zal bekatlar bo'ylab marshrut. Bitta jeton — 2 000 so'm.",
        },
      },
      stops: [
        ["kosmonavtlar-metro", 20],
        ["amir-timur-square", 20],
        ["chorsu-bazaar", 40],
      ],
    },
  ],
};
