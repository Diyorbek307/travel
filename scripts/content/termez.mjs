import { H, ALWAYS, PRICE } from "./_helpers.mjs";

export default {
  slug: "termez",
  lat: 37.2242,
  lon: 67.2783,
  zoom: 12,
  tr: {
    ru: {
      name: "Термез и Сурхандарья",
      description:
        "Самый южный город Узбекистана, на границе с Афганистаном. Единственное место в стране, где сохранились буддийские монастыри — до прихода ислама здесь два столетия стояли ступы и вихары Кушанского царства.",
    },
    uz: {
      name: "Termiz va Surxondaryo",
      description:
        "O'zbekistonning eng janubiy shahri, Afg'oniston chegarasida. Mamlakatda buddaviy monastirlar saqlangan yagona joy — islomgacha bu yerda Kushon podsholigining stupalari turgan.",
    },
    en: {
      name: "Termez and Surkhandarya",
      description:
        "Uzbekistan's southernmost city, on the Afghan border. The only place in the country where Buddhist monasteries survive — before Islam, the stupas and viharas of the Kushan Empire stood here for two centuries.",
    },
  },

  pois: [
    {
      slug: "fayaz-tepa",
      category: "landmark",
      themes: ["history", "architecture"],
      lat: 37.2569,
      lon: 67.1936,
      price: PRICE.small,
      visit: 50,
      rating: 4.6,
      pop: 0.85,
      hours: H("09:00", "18:00"),
      qr: "TRM-01",
      tr: {
        ru: {
          n: "Буддийский монастырь Фаязтепа",
          s: "Монастырь I–III веков со ступой, накрытой защитным куполом.",
          f: `Фаязтепа — буддийский монастырь, действовавший в I–III веках нашей эры, во времена Кушанского царства.

Комплекс делился на три части: жилая для монахов, хозяйственная и святилище. Планировка обычная для буддийских вихар — кельи вокруг внутреннего двора.

Главное открытие сделали в 1968 году: скульптурная группа из известняка — Будда, сидящий под деревом бодхи, и два монаха по сторонам. Работа выполнена в гандхарском стиле, где индийская иконография соединяется с эллинистической пластикой — прямое следствие походов Александра Македонского. Оригинал хранится в Музее истории Узбекистана в Ташкенте, здесь стоит копия.

Ступа накрыта современным защитным куполом: сырцовая кладка возрастом почти две тысячи лет не переживает дождей.

Монастырь опустел в IV веке, когда сюда пришли Сасаниды и буддизм в регионе угас. Название «Фаязтепа» дано по имени археолога Р. Фаязова.

Это самая наглядная точка, чтобы понять: Узбекистан был буддийским задолго до того, как стал мусульманским.`,
        },
        uz: {
          n: "Fayoztepa buddaviy monastiri",
          s: "I–III asrlar monastiri, himoya gumbazi ostidagi stupa bilan.",
          f: `Fayoztepa — eramizning I–III asrlarida, Kushon podsholigi davrida faoliyat yuritgan buddaviy monastir.

Majmua uch qismga bo'lingan: rohiblar turar joyi, xo'jalik qismi va ibodatxona.

1968 yilda ohaktoshdan yasalgan haykal topilgan: bodhi daraxti ostida o'tirgan Budda va ikki rohib. Asar gandhara uslubida — hind ikonografiyasi ellinistik plastika bilan qo'shilgan. Asl nusxa Toshkentda saqlanadi.

Stupa zamonaviy himoya gumbazi bilan yopilgan: ikki ming yillik paxsa yomg'irga bardosh bermaydi.

Monastir IV asrda bo'shab qolgan.`,
        },
        en: {
          n: "Fayaz-Tepa Buddhist Monastery",
          s: "A 1st–3rd century monastery with a stupa under a protective dome.",
          f: `Fayaz-Tepa was a Buddhist monastery active in the 1st to 3rd centuries CE, in the time of the Kushan Empire.

The complex fell into three parts: living quarters for the monks, service buildings, and the sanctuary. The plan is the usual one for a Buddhist vihara — cells around an inner courtyard.

The great find came in 1968: a limestone sculptural group of the Buddha seated beneath the bodhi tree with two monks at his sides. The work is in the Gandharan style, where Indian iconography meets Hellenistic modelling — a direct consequence of Alexander's campaigns. The original is in the State Museum of History in Tashkent; a copy stands here.

The stupa is sheltered under a modern protective dome: mud brick almost two thousand years old does not survive rain.

The monastery emptied in the 4th century, when the Sasanians arrived and Buddhism faded from the region. The name Fayaz-Tepa comes from the archaeologist R. Fayazov.

This is the clearest place to grasp that Uzbekistan was Buddhist long before it was Muslim.`,
        },
      },
    },

    {
      slug: "kara-tepa",
      category: "landmark",
      themes: ["history"],
      lat: 37.2611,
      lon: 67.1794,
      price: PRICE.small,
      visit: 40,
      rating: 4.2,
      pop: 0.45,
      hours: H("09:00", "17:00"),
      tr: {
        ru: {
          n: "Пещерный монастырь Каратепа",
          s: "Буддийские кельи, вырубленные в песчаниковых холмах.",
          f: `Каратепа — буддийский комплекс II–IV веков, устроенный иначе, чем соседний Фаязтепа: часть помещений здесь вырублена прямо в песчаниковых холмах.

Наземные постройки и пещерные кельи соединялись переходами. На стенах сохранились фрагменты росписей и надписи на нескольких письменностях — брахми, кхароштхи, бактрийским письмом. По ним видно, что монастырь был международным: сюда приходили монахи из Индии, Бактрии, возможно из Китая.

Раскопки идут с 1961 года и не закончены. Часть территории закрыта — это приграничная зона, требуется соблюдать режим.`,
        },
        uz: {
          n: "Qoratepa g'or monastiri",
          s: "Qumtosh tepaliklarda o'yilgan buddaviy hujralar.",
          f: "Qoratepa — II–IV asrlarga oid buddaviy majmua. Xonalarning bir qismi to'g'ridan-to'g'ri qumtosh tepaliklarga o'yilgan. Devorlarda brahmi, kxaroshthi va baqtriya yozuvidagi bitiklar saqlangan. Qazishmalar 1961 yildan beri davom etadi.",
        },
        en: {
          n: "Kara-Tepa Cave Monastery",
          s: "Buddhist cells cut into sandstone hills.",
          f: `Kara-Tepa is a Buddhist complex of the 2nd–4th centuries, arranged differently from neighbouring Fayaz-Tepa: part of its rooms are cut directly into the sandstone hills.

Surface buildings and cave cells were joined by passages. Fragments of painting survive on the walls, along with inscriptions in several scripts — Brahmi, Kharosthi and Bactrian. They show the monastery was international: monks came from India, Bactria, perhaps China.

Excavation has continued since 1961 and is unfinished. Part of the site is closed — this is a border zone and the rules must be observed.`,
        },
      },
    },

    {
      slug: "hakim-at-termizi",
      category: "religious",
      themes: ["islamic", "architecture", "history"],
      lat: 37.2694,
      lon: 67.1889,
      price: PRICE.free,
      visit: 35,
      rating: 4.6,
      pop: 0.6,
      hours: H("07:00", "19:00"),
      qr: "TRM-02",
      tr: {
        ru: {
          n: "Мавзолей Хакима ат-Термези",
          s: "Гробница суфийского мыслителя IX века, покровителя Термеза.",
          f: `Абу Абдаллах Мухаммад ат-Термези по прозванию аль-Хаким, «Мудрец», жил в IX веке и был одним из ранних теоретиков суфизма. Его труд «Хатм аль-аулия» — «Печать святых» — ввёл в исламскую мысль понятие иерархии святости; идеи Термези позже развивал Ибн Араби.

Мавзолей строился в несколько приёмов с XI по XV век. Ядро — небольшая купольная камера над могилой; вокруг постепенно выросли ханака, мечеть и айван.

Внутри стоит мраморное надгробие XI века с резной надписью, выполненной куфическим письмом, — одна из лучших работ такого рода в Средней Азии.

Комплекс стоит на самом берегу Амударьи, за рекой видна территория Афганистана. Это действующее место паломничества.`,
        },
        uz: {
          n: "Hakim at-Termiziy maqbarasi",
          s: "IX asr so'fiy mutafakkiri, Termiz homiysining qabri.",
          f: `Abu Abdulloh Muhammad at-Termiziy, «Hakim» laqabi bilan mashhur, IX asrda yashagan va so'fiylikning dastlabki nazariyotchilaridan biri bo'lgan.

Maqbara XI asrdan XV asrgacha bir necha bosqichda qurilgan. Ichkarida XI asrga oid marmar qabrtosh saqlangan — kufiy yozuvli o'ymakorlik Markaziy Osiyodagi eng yaxshi namunalardan.

Majmua Amudaryo qirg'og'ida joylashgan, daryo ortida Afg'oniston ko'rinadi. Bu amaldagi ziyoratgoh.`,
        },
        en: {
          n: "Mausoleum of Hakim at-Termizi",
          s: "Tomb of a 9th-century Sufi thinker, patron of Termez.",
          f: `Abu Abdallah Muhammad at-Termizi, called al-Hakim, "the Sage", lived in the 9th century and was among the earliest theorists of Sufism. His work Khatm al-awliya — "The Seal of the Saints" — introduced the idea of a hierarchy of sanctity into Islamic thought; Ibn Arabi later developed his ideas.

The mausoleum was built in stages from the 11th to the 15th century. Its core is a small domed chamber over the grave; a khanaqa, a mosque and an iwan grew around it over time.

Inside stands an 11th-century marble gravestone with a carved Kufic inscription — one of the finest works of its kind in Central Asia.

The complex sits on the very bank of the Amu Darya, with Afghan territory visible across the water. It is an active place of pilgrimage.`,
        },
      },
    },

    {
      slug: "sultan-saodat",
      category: "landmark",
      themes: ["islamic", "architecture", "history"],
      lat: 37.2833,
      lon: 67.2611,
      price: PRICE.free,
      visit: 40,
      rating: 4.4,
      pop: 0.4,
      hours: H("08:00", "18:00"),
      tr: {
        ru: {
          n: "Ансамбль Султан-Саодат",
          s: "Родовой некрополь термезских сейидов, строившийся семь столетий.",
          f: `Султан-Саодат — усыпальница термезских сейидов, потомков пророка Мухаммада по линии Хусейна, правивших Термезом как духовные владыки.

Комплекс необычен тем, что рос непрерывно с X по XVII век: мавзолеи, ханаки и айваны пристраивались вдоль общей оси, образовав вытянутый двор длиной около 70 метров. По нему, как по срезу, читается смена архитектурных стилей — от строгой домонгольской кладки до изразцовых порталов темуридского времени.

Место тихое и почти без туристов, хотя по значению сопоставимо с Шахи-Зиндой.`,
        },
        uz: {
          n: "Sulton Saodat majmuasi",
          s: "Termiz sayyidlarining yetti asr davomida qurilgan xonadon nekropoli.",
          f: "Sulton Saodat — Termiz sayyidlari maqbarasi. Majmua X asrdan XVII asrgacha uzluksiz o'sgan: maqbaralar va xonaqohlar umumiy o'q bo'ylab qurilib, uzunligi 70 metrga yaqin hovli hosil qilgan. Unda me'moriy uslublar almashuvi kesim kabi o'qiladi.",
        },
        en: {
          n: "Sultan Saodat Ensemble",
          s: "The dynastic necropolis of the Termez sayyids, built over seven centuries.",
          f: `Sultan Saodat is the burial place of the Termez sayyids, descendants of the Prophet Muhammad through Husayn, who ruled Termez as spiritual lords.

The complex is unusual in having grown continuously from the 10th to the 17th century: mausoleums, khanaqas and iwans were added along a common axis, forming an elongated court some 70 metres long. Read along it, the changing architectural styles show like a cross-section — from austere pre-Mongol brickwork to tiled Timurid portals.

The place is quiet and nearly free of visitors, though in significance it stands comparison with Shah-i-Zinda.`,
        },
      },
    },

    {
      slug: "kyrk-kyz",
      category: "landmark",
      themes: ["history", "architecture"],
      lat: 37.2764,
      lon: 67.2394,
      price: PRICE.free,
      visit: 25,
      rating: 4.1,
      pop: 0.3,
      hours: ALWAYS,
      tr: {
        ru: {
          n: "Кырк-Киз",
          s: "Загадочная постройка IX–X веков: «сорок девушек».",
          f: `Квадратное здание со стороной около 54 метров построено при Саманидах в IX–X веках. Внутри — сложная система из более чем полусотни помещений, перекрытых кирпичными сводами, с крестообразным центральным двором.

Назначение неизвестно. Предполагают загородную резиденцию, караван-сарай, женскую обитель или укреплённое поместье. Народное название «Кырк-Киз» — «сорок девушек» — связано с легендой о царице Гулаим и сорока воительницах, оборонявших крепость.

Ценность постройки в конструкции: это редкий сохранившийся образец домонгольской сводчатой архитектуры без единого изразца — только фигурная кладка из жжёного кирпича.`,
        },
        uz: {
          n: "Qirq Qiz",
          s: "IX–X asrlarga oid sirli inshoot: «qirq qiz».",
          f: "Tomoni 54 metrga yaqin to'rtburchak bino Somoniylar davrida qurilgan. Ichkarida ellikdan ortiq xona va xochsimon markaziy hovli bor. Vazifasi noma'lum. Qiymati konstruksiyasida: bu mo'g'ullargacha bo'lgan gumbazli me'morchilikning noyob namunasi.",
        },
        en: {
          n: "Kyrk-Kyz",
          s: "An enigmatic 9th–10th century building: the forty girls.",
          f: `A square building some 54 metres to a side, raised under the Samanids in the 9th–10th centuries. Inside is a complex arrangement of more than fifty rooms under brick vaults, around a cruciform central court.

Its purpose is unknown. Suggestions include a country residence, a caravanserai, a women's retreat, or a fortified estate. The popular name Kyrk-Kyz — "forty girls" — attaches to a legend of Queen Gulaim and forty women warriors who defended the fortress.

The value of the building lies in its construction: a rare surviving example of pre-Mongol vaulted architecture without a single tile — only patterned fired brickwork.`,
        },
      },
    },

    {
      slug: "jarkurgan-minaret",
      category: "landmark",
      themes: ["architecture", "islamic", "history"],
      lat: 37.5019,
      lon: 67.4139,
      price: PRICE.free,
      visit: 25,
      rating: 4.3,
      pop: 0.3,
      hours: ALWAYS,
      tr: {
        ru: {
          n: "Джаркурганский минарет",
          s: "Минарет 1108 года, сложенный из шестнадцати кирпичных полуколонн.",
          f: `Минарет построен в 1108–1109 годах мастером Али ибн Мухаммадом из Серахса — его имя сохранилось в надписи.

Конструкция уникальна для Средней Азии: ствол собран из шестнадцати вертикальных полуколонн, идущих гофрой по всей окружности. Такая форма встречается в сельджукской архитектуре Хорасана, но здесь доведена до предела.

Сохранилось около 22 метров; первоначально минарет был вдвое выше. Верх обрушился, вероятно, при землетрясении.

Стоит в стороне от туристических маршрутов, в 40 километрах от Термеза.`,
        },
        uz: {
          n: "Jarqo'rg'on minorasi",
          s: "1108 yilda o'n oltita g'isht yarim ustundan terilgan minora.",
          f: "Minora 1108–1109 yillarda saraxslik usta Ali ibn Muhammad tomonidan qurilgan — uning ismi bitikda saqlangan. Tanasi o'n oltita vertikal yarim ustundan yig'ilgan. 22 metrga yaqini saqlangan, dastlab ikki barobar baland bo'lgan.",
        },
        en: {
          n: "Jarkurgan Minaret",
          s: "A minaret of 1108 built from sixteen brick half-columns.",
          f: `The minaret was built in 1108–1109 by the master Ali ibn Muhammad of Serakhs, whose name survives in an inscription.

Its construction is unique in Central Asia: the shaft is assembled from sixteen vertical half-columns running as a corrugation around the full circumference. The form appears in Seljuk architecture in Khorasan, but is taken to its limit here.

About 22 metres survive; the minaret was originally twice as tall. The upper part probably fell in an earthquake.

It stands off the tourist routes, 40 kilometres from Termez.`,
        },
      },
    },

    {
      slug: "termez-archaeology-museum",
      category: "museum",
      themes: ["museums", "history"],
      lat: 37.2264,
      lon: 67.2861,
      price: PRICE.small,
      visit: 60,
      rating: 4.5,
      pop: 0.5,
      hours: H("09:00", "17:00", [1]),
      qr: "TRM-03",
      tr: {
        ru: {
          n: "Термезский археологический музей",
          s: "Единственный в Средней Азии музей, целиком посвящённый археологии.",
          f: `Музей открыт в 2001 году к 2500-летию Термеза и остаётся единственным в Средней Азии музеем, полностью посвящённым археологии.

Экспозиция охватывает всё, что нашли на юге Узбекистана: каменный век, бактрийскую бронзу, греко-бактрийский период после походов Александра, кушанские буддийские древности, исламское средневековье.

Главная часть — буддийская: скульптура из Фаязтепы и Каратепы, фрагменты росписей, реликварии. Здесь понятно, каким был регион, когда через него шли и Шёлковый путь, и путь распространения буддизма из Индии в Китай.

Понедельник — выходной.`,
        },
        uz: {
          n: "Termiz arxeologiya muzeyi",
          s: "Markaziy Osiyoda arxeologiyaga to'liq bag'ishlangan yagona muzey.",
          f: "Muzey 2001 yilda Termizning 2500 yilligiga ochilgan. Ekspozitsiya tosh davridan islom o'rta asrlarigacha bo'lgan davrni qamraydi. Asosiy qismi buddaviy: Fayoztepa va Qoratepa haykallari. Dushanba — dam olish kuni.",
        },
        en: {
          n: "Termez Archaeological Museum",
          s: "The only museum in Central Asia devoted entirely to archaeology.",
          f: `The museum opened in 2001 for the 2,500th anniversary of Termez and remains the only one in Central Asia given over wholly to archaeology.

The display covers everything found in southern Uzbekistan: the Stone Age, Bactrian bronze, the Greco-Bactrian period after Alexander, Kushan Buddhist antiquities, the Islamic middle ages.

The Buddhist section is the heart of it: sculpture from Fayaz-Tepa and Kara-Tepa, fragments of wall painting, reliquaries. It makes clear what the region was when both the Silk Road and the route by which Buddhism travelled from India to China ran through it.

Closed Mondays.`,
        },
      },
    },

    {
      slug: "termez-restaurant",
      category: "restaurant",
      themes: ["food"],
      lat: 37.2278,
      lon: 67.2794,
      price: 65000,
      visit: 55,
      rating: 4.2,
      pop: 0.25,
      hours: H("10:00", "22:00"),
      tr: {
        ru: { n: "Ресторан «Сурхон»", s: "Южная кухня: тандыр-кабоб, димлама, дыни Сурхандарьи." },
        uz: { n: "«Surxon» restorani", s: "Janubiy taomlar: tandir kabob, dimlama, Surxondaryo qovunlari." },
        en: { n: "Surkhon Restaurant", s: "Southern cooking: tandyr kebab, dimlama, Surkhandarya melons." },
      },
    },
  ],

  tours: [
    {
      slug: "termez-buddhist",
      mode: "taxi",
      sort: 1,
      tr: {
        ru: {
          title: "Буддийский Термез",
          description:
            "Наследие Кушанского царства: монастыри Фаязтепа и Каратепа, где до прихода ислама два столетия жили буддийские монахи, и археологический музей с найденной там скульптурой. Часть объектов в приграничной зоне — берите паспорт.",
        },
        en: {
          title: "Buddhist Termez",
          description:
            "The legacy of the Kushan Empire: the Fayaz-Tepa and Kara-Tepa monasteries, where Buddhist monks lived for two centuries before Islam, and the archaeological museum holding the sculpture found there. Some sites lie in the border zone — bring your passport.",
        },
        uz: {
          title: "Buddaviy Termiz",
          description:
            "Kushon podsholigi merosi: Fayoztepa va Qoratepa monastirlari hamda arxeologiya muzeyi. Ba'zi obyektlar chegara hududida — pasport oling.",
        },
      },
      stops: [
        ["termez-archaeology-museum", 60],
        ["fayaz-tepa", 50],
        ["kara-tepa", 40],
        ["hakim-at-termizi", 35],
      ],
    },
  ],
};
