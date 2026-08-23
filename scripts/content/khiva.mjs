import { H, ALWAYS, PRICE } from "./_helpers.mjs";

export default {
  slug: "khiva",
  lat: 41.3783,
  lon: 60.3639,
  zoom: 16,
  tr: {
    ru: {
      name: "Хива",
      description:
        "Город-крепость в Хорезме. Внутренний город Ичан-Кала целиком внесён в список ЮНЕСКО — это был первый объект Всемирного наследия на территории Узбекистана.",
    },
    uz: {
      name: "Xiva",
      description:
        "Xorazmdagi qal'a-shahar. Ichan qal'a butunligicha YUNESKO ro'yxatiga kiritilgan — bu O'zbekistondagi birinchi Butunjahon merosi obyekti edi.",
    },
    en: {
      name: "Khiva",
      description:
        "A fortress city in Khorezm. The inner town of Ichan-Kala is a UNESCO site in its entirety — the first World Heritage property in Uzbekistan.",
    },
  },

  pois: [
    {
      slug: "ichan-kala",
      category: "landmark",
      themes: ["history", "architecture", "islamic"],
      lat: 41.3785,
      lon: 60.3639,
      price: PRICE.large,
      visit: 120,
      rating: 4.9,
      pop: 1.0,
      hours: H("08:00", "19:00"),
      qr: "KHV-01",
      tr: {
        ru: {
          n: "Ичан-Кала",
          s: "Внутренний город Хивы: 26 гектаров глинобитных стен, минаретов и медресе.",
          f: `Ичан-Кала — «внутренняя крепость» — обнесённый стеной центр Хивы. Территория около 26 гектаров, стены длиной больше двух километров и высотой до 10 метров сложены из сырцового кирпича на глиняном растворе.

Внутри сохранилось более полусотни памятников и около 250 старых жилых домов. Существенная часть застройки относится к XVIII–XIX векам: Хива была разорена персидским правителем Надир-шахом в 1740 году, и город отстраивали заново.

Ичан-Кала уникальна цельностью. В Самарканде и Бухаре памятники стоят посреди современного города, здесь же средневековая городская ткань сохранилась целиком — с улицами, воротами, караван-сараями и жилыми кварталами. Именно поэтому в 1990 году она стала первым объектом ЮНЕСКО в Узбекистане.

Четверо ворот ведут внутрь по сторонам света. Главные — западные, Ота-Дарваза. Единый билет действует два дня и покрывает большинство музеев внутри; отдельно оплачивается подъём на минарет Ислам-Ходжа.

Практический совет: летом осматривать город лучше до 11 утра и после 17 часов — тени в Ичан-Кале почти нет.`,
        },
        en: {
          n: "Ichan-Kala",
          s: "Khiva's inner town: 26 hectares of mud-brick walls, minarets and madrasahs.",
          f: `Ichan-Kala — "the inner fortress" — is the walled centre of Khiva. It covers about 26 hectares, and its walls run over two kilometres and stand up to 10 metres high, built of mud brick laid in clay mortar.

More than fifty monuments survive inside, along with some 250 old houses. Much of the fabric dates from the 18th and 19th centuries: Khiva was sacked by the Persian ruler Nader Shah in 1740 and rebuilt afterwards.

What makes Ichan-Kala exceptional is its completeness. In Samarkand and Bukhara the monuments stand within a modern city; here the medieval urban fabric survives whole — streets, gates, caravanserais and residential quarters. That is why it became Uzbekistan's first UNESCO site in 1990.

Four gates lead in, one to each cardinal direction. The main one is the western Ota-Darvoza. A single ticket is valid for two days and covers most museums inside; climbing the Islam Khoja minaret is charged separately.

A practical note: in summer, visit before 11:00 or after 17:00 — there is almost no shade in Ichan-Kala.`,
        },
        uz: {
          n: "Ichan qal'a",
          s: "Xivaning ichki shahri: 26 gektar paxsa devorlar, minoralar va madrasalar.",
          f: `Ichan qal'a — devor bilan o'ralgan Xiva markazi. Maydoni 26 gektarga yaqin, devorlari ikki kilometrdan uzun va 10 metrgacha baland.

Ichkarida ellikdan ortiq yodgorlik va 250 ga yaqin eski turar joy saqlanib qolgan. Ko'p qismi XVIII–XIX asrlarga oid: Xiva 1740 yilda Nodirshoh tomonidan vayron qilingan va qaytadan qurilgan.

Ichan qal'aning noyobligi — yaxlitligida. 1990 yilda u O'zbekistondagi birinchi YUNESKO obyekti bo'lgan.`,
        },
      },
    },

    {
      slug: "kalta-minor",
      category: "landmark",
      themes: ["architecture", "history"],
      lat: 41.3789,
      lon: 60.361,
      price: PRICE.free,
      visit: 20,
      rating: 4.7,
      pop: 0.9,
      hours: ALWAYS,
      qr: "KHV-02",
      tr: {
        ru: {
          n: "Минарет Кальта-Минор",
          s: "Недостроенный минарет, целиком покрытый бирюзовыми изразцами.",
          f: `Кальта-Минор — «короткий минарет» — начал строить в 1852 году хивинский хан Мухаммад Амин. Замысел был грандиозным: минарет высотой около 70 метров, с которого была бы видна Бухара.

Работы остановились в 1855 году: хан погиб в сражении с туркменами, и никто не взялся продолжать. Минарет остался высотой 29 метров при диаметре основания 14,2 метра — единственный в Средней Азии, где ширина сопоставима с высотой, отчего он и выглядит так необычно.

Уникален он и облицовкой: обычно изразцами покрывали только пояса, здесь же глазурь идёт по всей поверхности от земли до верха. Бирюзовый, синий, белый и зелёный складываются в горизонтальные полосы орнамента.

Подъём внутрь невозможен — лестница не была достроена.`,
        },
        en: {
          n: "Kalta Minor Minaret",
          s: "An unfinished minaret sheathed entirely in turquoise tile.",
          f: `Kalta Minor — "the short minaret" — was begun in 1852 by the Khivan khan Muhammad Amin. The plan was vast: a minaret some 70 metres tall, from which Bukhara would be visible.

Work stopped in 1855 when the khan was killed fighting the Turkmens, and no one took it up again. The minaret stands 29 metres high on a base 14.2 metres across — the only one in Central Asia whose width approaches its height, which is why it looks so strange.

Its cladding is unique too: tilework normally covered only bands, but here glaze runs over the whole surface from ground to top. Turquoise, blue, white and green form horizontal bands of ornament.

You cannot climb it — the staircase was never finished.`,
        },
        uz: {
          n: "Kalta minor",
          s: "Tugallanmagan minora, butunlay feruza koshin bilan qoplangan.",
          f: `Kalta minorni 1852 yilda Xiva xoni Muhammad Amin qurishni boshlagan. Reja ulkan edi — balandligi 70 metrga yaqin minora.

1855 yilda xon halok bo'lgach, ish to'xtagan. Minora 29 metr balandlikda, asos diametri 14,2 metr bo'lib qolgan.

Uning yana bir noyobligi — koshin butun sirtni yerdan tepagacha qoplaydi.`,
        },
      },
    },

    {
      slug: "kunya-ark",
      category: "museum",
      themes: ["history", "museums", "architecture"],
      lat: 41.3792,
      lon: 60.3603,
      price: PRICE.small,
      visit: 50,
      rating: 4.6,
      pop: 0.75,
      hours: H("09:00", "18:00"),
      qr: "KHV-03",
      tr: {
        ru: {
          n: "Куня-Арк",
          s: "Старая крепость — резиденция хивинских ханов с тронным двором и монетным двором.",
          f: `Куня-Арк — «старая крепость» — заложен в конце XVII века как отдельная цитадель внутри Ичан-Калы, со своей стеной, воротами и всем необходимым для осады.

Внутри: приёмный двор с айваном, где стояла юрта хана (хивинские правители принимали послов именно в юрте, а не в зале — так подчёркивалась связь с кочевой традицией), летняя и зимняя мечети, гарем, монетный двор, пороховой склад и зиндан.

Изразцы летней мечети — работа мастера Абдуллы Джина, лучший образец хивинской майолики: белый растительный орнамент по синему фону.

С площадки Ак-Шейх-бобо открывается вид на всю Ичан-Калу — это лучшая точка для фотографии, особенно на закате.`,
        },
        en: {
          n: "Kunya-Ark",
          s: "The old fortress — residence of the khans, with a throne court and a mint.",
          f: `Kunya-Ark — "the old fortress" — was founded in the late 17th century as a separate citadel inside Ichan-Kala, with its own wall, gate and everything needed to withstand a siege.

Inside: the reception court with an iwan where the khan's yurt stood (Khivan rulers received envoys in a yurt rather than a hall, asserting their nomadic descent), summer and winter mosques, the harem, the mint, a powder store and the zindan.

The tilework of the summer mosque is by the master Abdullah Jin and is the finest Khivan majolica: white vegetal ornament on a blue ground.

The Ak-Sheikh-Bobo bastion gives a view over the whole of Ichan-Kala — the best vantage point for photographs, particularly at sunset.`,
        },
        uz: {
          n: "Ko'hna Ark",
          s: "Eski qal'a — Xiva xonlarining qarorgohi, taxt hovlisi va zarbxonasi bilan.",
          f: `Ko'hna Ark XVII asr oxirida Ichan qal'a ichida alohida qal'a sifatida qurilgan.

Ichkarida: xon o'tovi turgan qabul hovlisi, yozgi va qishki masjidlar, harom, zarbxona va zindon.

Oq Shayx bobo tepaligidan butun Ichan qal'a manzarasi ochiladi.`,
        },
      },
    },

    {
      slug: "tash-hauli",
      category: "museum",
      themes: ["history", "architecture", "museums"],
      lat: 41.3785,
      lon: 60.3663,
      price: PRICE.small,
      visit: 45,
      rating: 4.7,
      pop: 0.68,
      hours: H("09:00", "18:00"),
      qr: "KHV-04",
      tr: {
        ru: {
          n: "Дворец Таш-Хаули",
          s: "«Каменный двор» Аллакули-хана: 163 комнаты и самые красивые айваны Хивы.",
          f: `Таш-Хаули построен в 1830–1838 годах по приказу Аллакули-хана. Хан требовал закончить работу за два года; первый архитектор, объявивший это невозможным, был казнён.

Дворец состоит из трёх дворов: гарем, приёмный двор ишрат-хаули и судебный двор арз-хаули. В гареме — пять айванов: один для хана и по одному для четырёх жён, разрешённых шариатом. Айваны выходят на север: летом это давало тень и сквозняк.

Резные деревянные колонны, изразцы и расписные потолки здесь плотнее и разнообразнее, чем где-либо ещё в Хиве. Ни одна панель майолики не повторяет другую.`,
        },
        en: {
          n: "Tash-Hauli Palace",
          s: "Allakuli Khan's \"stone court\": 163 rooms and the finest iwans in Khiva.",
          f: `Tash-Hauli was built between 1830 and 1838 on the orders of Allakuli Khan. The khan demanded the work be finished in two years; the first architect, who said it was impossible, was executed.

The palace has three courts: the harem, the reception court (ishrat-hauli) and the court of justice (arz-hauli). The harem has five iwans — one for the khan and one for each of the four wives permitted under sharia. They face north, which gave shade and a through-draught in summer.

Carved wooden columns, tilework and painted ceilings are denser and more varied here than anywhere else in Khiva. No two majolica panels repeat.`,
        },
        uz: {
          n: "Tosh Hovli saroyi",
          s: "Olloqulixonning «tosh hovlisi»: 163 xona va Xivadagi eng go'zal ayvonlar.",
          f: `Tosh Hovli 1830–1838 yillarda Olloqulixon buyrug'i bilan qurilgan. Saroy uch hovlidan iborat: harom, qabul hovlisi va sud hovlisi.

Haromda beshta ayvon bor: biri xon uchun, to'rttasi xotinlari uchun. O'ymakor yog'och ustunlar va koshinlar bu yerda Xivadagi eng xilma-xil hisoblanadi.`,
        },
      },
    },

    {
      slug: "islam-khoja",
      category: "landmark",
      themes: ["architecture", "history"],
      lat: 41.3765,
      lon: 60.3634,
      price: PRICE.small,
      visit: 30,
      rating: 4.7,
      pop: 0.7,
      hours: H("09:00", "18:00"),
      qr: "KHV-05",
      tr: {
        ru: {
          n: "Минарет и медресе Ислам-Ходжа",
          s: "Самый высокий минарет Узбекистана — 57 метров, с подъёмом наверх.",
          f: `Комплекс построен в 1908–1910 годах Ислам-Ходжой, визирем последнего хивинского хана и реформатором: он открывал в Хиве светские школы, больницу, почту и телеграф.

Минарет высотой 57 метров — самый высокий в Узбекистане. Он сужается кверху заметно резче обычного, отчего кажется ещё выше. Изразцовые пояса чередуются с полосами открытой кирпичной кладки.

Наверх ведут 118 ступеней. Лестница узкая, тёмная и крутая — фонарик пригодится. С площадки видна вся Ичан-Кала и пустыня за стенами.

Медресе рядом — наоборот, самое маленькое в Хиве. Сейчас в нём музей прикладного искусства.

Судьба заказчика сложилась трагически: после смерти хана Ислам-Ходжа был убит противниками реформ.`,
        },
        en: {
          n: "Islam Khoja Minaret and Madrasah",
          s: "Uzbekistan's tallest minaret at 57 metres, open to climb.",
          f: `The complex was built in 1908–1910 by Islam Khoja, vizier to the last khan of Khiva and a reformer: he opened secular schools, a hospital, a post office and a telegraph in the city.

The minaret is 57 metres tall, the highest in Uzbekistan. It tapers more sharply than usual, which makes it look taller still. Bands of tile alternate with strips of bare brickwork.

118 steps lead to the top. The staircase is narrow, dark and steep — bring a torch. The platform looks out over all of Ichan-Kala and the desert beyond the walls.

The madrasah beside it is, by contrast, the smallest in Khiva. It now houses a museum of applied art.

Its patron came to a bad end: after the khan's death, Islam Khoja was murdered by opponents of his reforms.`,
        },
        uz: {
          n: "Islomxo'ja minorasi va madrasasi",
          s: "O'zbekistondagi eng baland minora — 57 metr, tepasiga chiqish mumkin.",
          f: `Majmua 1908–1910 yillarda so'nggi Xiva xonining vaziri va islohotchi Islomxo'ja tomonidan qurilgan.

57 metrlik minora O'zbekistondagi eng balandi. Tepaga 118 zinapoya olib chiqadi — zinapoya tor va qorong'i, fonar asqotadi.

Yonidagi madrasa esa Xivadagi eng kichigi. Hozir unda amaliy san'at muzeyi joylashgan.`,
        },
      },
    },

    {
      slug: "pahlavan-mahmud",
      category: "religious",
      themes: ["islamic", "architecture", "history"],
      lat: 41.3777,
      lon: 60.363,
      price: PRICE.small,
      visit: 25,
      rating: 4.8,
      pop: 0.65,
      hours: H("08:00", "19:00"),
      qr: "KHV-06",
      tr: {
        ru: {
          n: "Мавзолей Пахлавана Махмуда",
          s: "Усыпальница поэта и борца, покровителя Хивы — самые красивые изразцы города.",
          f: `Пахлаван Махмуд (1247–1326) был скорняком, поэтом-суфием и непобедимым борцом, ездившим состязаться в Индию и Иран. После смерти его почитали как покровителя Хивы, и над могилой во дворе его мастерской вырос мемориальный комплекс.

Нынешнее здание построено в 1810-х годах и позже расширено: хивинские ханы стали хоронить себя рядом со святым.

Внутренний интерьер — вершина хивинской майолики. Стены и купол покрыты изразцами с бело-синим растительным орнаментом; в надписях приведены строки самого Пахлавана Махмуда.

Это действующая святыня, а не только памятник: сюда приходят молиться. Ведите себя тихо, женщинам нужен платок.`,
        },
        en: {
          n: "Pahlavan Mahmud Mausoleum",
          s: "Tomb of the poet-wrestler and patron of Khiva — the city's finest tilework.",
          f: `Pahlavan Mahmud (1247–1326) was a furrier, a Sufi poet and an unbeaten wrestler who travelled to India and Iran to compete. After his death he was venerated as the patron of Khiva, and a memorial complex grew over his grave in the yard of his workshop.

The present building dates from the 1810s and was later enlarged, as the khans of Khiva began burying themselves beside the saint.

The interior is the summit of Khivan majolica: walls and dome are sheathed in white-and-blue vegetal tilework, and the inscriptions quote Pahlavan Mahmud's own verse.

This is a working shrine, not only a monument — people come here to pray. Keep quiet, and women should cover their hair.`,
        },
        uz: {
          n: "Pahlavon Mahmud maqbarasi",
          s: "Shoir va pahlavon, Xiva homiysining maqbarasi — shahardagi eng go'zal koshinlar.",
          f: `Pahlavon Mahmud (1247–1326) mo'ynado'z, so'fiy shoir va yengilmas pahlavon bo'lgan. Vafotidan keyin Xiva homiysi sifatida ulug'langan.

Hozirgi bino 1810-yillarda qurilgan. Ichki bezak — xiva majolikasining cho'qqisi. Bu faqat yodgorlik emas, amaldagi ziyoratgoh.`,
        },
      },
    },

    {
      slug: "juma-mosque-khiva",
      category: "religious",
      themes: ["islamic", "architecture", "history"],
      lat: 41.3781,
      lon: 60.3625,
      price: PRICE.small,
      visit: 25,
      rating: 4.6,
      pop: 0.6,
      hours: H("09:00", "18:00"),
      qr: "KHV-07",
      tr: {
        ru: {
          n: "Джума-мечеть",
          s: "Зал без куполов и арок, где кровлю держат 213 резных деревянных колонн.",
          f: `Джума-мечеть не похожа ни на одну другую в Узбекистане. Здесь нет ни портала, ни купола, ни двора: это просто крытый гипостильный зал 55 на 46 метров, кровлю которого держат 213 деревянных колонн, расставленных с шагом около 3,5 метра.

Свет попадает внутрь через два световых люка в потолке, отчего в зале постоянный полумрак — и это самое прохладное место в Хиве в летнюю жару.

Колонны собирались веками. Часть из них — резные, XI–XII веков, привезены из старой столицы Хорезма Кята и других разрушенных построек; они старше самой мечети на семьсот лет. Каждая колонна отличается орнаментом, и по ним можно проследить смену резных стилей.

Нынешнее здание построено в 1788 году на месте более старой мечети X века.`,
        },
        en: {
          n: "Juma Mosque",
          s: "A hall with no domes and no arches, its roof carried on 213 carved wooden columns.",
          f: `The Juma Mosque resembles nothing else in Uzbekistan. There is no portal, no dome, no courtyard: simply a covered hypostyle hall 55 by 46 metres, its roof carried on 213 wooden columns set about 3.5 metres apart.

Light enters through two openings in the ceiling, so the hall stays in permanent half-darkness — and it is the coolest place in Khiva during the summer heat.

The columns were gathered over centuries. Some are carved work of the 11th and 12th centuries, brought from Kyat, the old Khorezmian capital, and from other ruined buildings; they are seven hundred years older than the mosque itself. Every column differs in its ornament, and together they trace the changing styles of carving.

The present building dates from 1788, on the site of an older 10th-century mosque.`,
        },
        uz: {
          n: "Juma masjidi",
          s: "Gumbaz va ravoqsiz zal, tomini 213 ta o'ymakor yog'och ustun ko'taradi.",
          f: `Juma masjidi O'zbekistondagi boshqa hech bir masjidga o'xshamaydi. Bu 55 ga 46 metrlik yopiq zal bo'lib, tomini 213 ta yog'och ustun ko'taradi.

Yorug'lik shiftdagi ikkita tuynukdan tushadi. Ustunlarning bir qismi XI–XII asrlarga oid va Xorazmning eski poytaxti Kotdan keltirilgan — ular masjidning o'zidan yetti asr qadimiyroq.

Hozirgi bino 1788 yilda qurilgan.`,
        },
      },
    },

    {
      slug: "khiva-craft-workshops",
      category: "craft",
      themes: ["crafts", "shopping"],
      lat: 41.3782,
      lon: 60.3645,
      price: PRICE.free,
      visit: 30,
      rating: 4.5,
      pop: 0.4,
      hours: H("09:00", "18:00"),
      tr: {
        ru: {
          n: "Ремесленные мастерские Ичан-Калы",
          s: "Резьба по дереву, ковроткачество и хивинская школа миниатюры.",
          f: "В медресе внутри Ичан-Калы работают действующие мастерские. Хива известна резьбой по карагачу — из него делают колонны, двери, шкатулки; узор наносится без предварительного рисунка. Отдельная традиция — ковры из верблюжьей и овечьей шерсти с хорезмским геометрическим орнаментом.",
        },
        en: {
          n: "Ichan-Kala craft workshops",
          s: "Wood carving, carpet weaving and the Khivan school of miniature painting.",
          f: "Working workshops occupy the madrasahs inside Ichan-Kala. Khiva is known for carving in elm — columns, doors and caskets, with the pattern cut freehand without a drawing. A separate tradition is carpets of camel and sheep wool in Khorezmian geometric ornament.",
        },
        uz: {
          n: "Ichan qal'a hunarmandchilik ustaxonalari",
          s: "Yog'och o'ymakorligi, gilamdo'zlik va xiva miniatyura maktabi.",
        },
      },
    },

    {
      slug: "khorezm-art-restaurant",
      category: "restaurant",
      themes: ["food"],
      lat: 41.3779,
      lon: 60.3648,
      price: 80000,
      visit: 60,
      rating: 4.4,
      pop: 0.4,
      hours: H("10:00", "22:00"),
      tr: {
        ru: {
          n: "Ресторан «Хорезм Арт»",
          s: "Хорезмская кухня: шивит-оши (зелёная лапша с укропом), тухум-барак, шурпа.",
        },
        en: {
          n: "Khorezm Art Restaurant",
          s: "Khorezmian cooking: shivit oshi (green dill noodles), tuhum barak, shurpa.",
        },
        uz: {
          n: "«Xorazm Art» restorani",
          s: "Xorazm taomlari: shivit oshi, tuxum barak, sho'rva.",
        },
      },
    },

    {
      slug: "terrassa-cafe-khiva",
      category: "cafe",
      themes: ["food"],
      lat: 41.3787,
      lon: 60.3618,
      price: 55000,
      visit: 40,
      rating: 4.6,
      pop: 0.42,
      hours: H("09:00", "23:00"),
      tr: {
        ru: {
          n: "Кафе «Терраса»",
          s: "Крыша с видом на Кальта-Минор — лучшее место встретить закат.",
        },
        en: {
          n: "Terrassa Café",
          s: "A rooftop facing Kalta Minor — the best place to catch the sunset.",
        },
        uz: {
          n: "«Terrassa» kafesi",
          s: "Kalta minorga qaragan tom — quyosh botishini kutish uchun eng yaxshi joy.",
        },
      },
    },

    {
      slug: "ichan-kala-wc",
      category: "toilet",
      themes: [],
      lat: 41.3791,
      lon: 60.3616,
      price: 2000,
      visit: 5,
      rating: 3.7,
      pop: 0.15,
      hours: H("08:00", "19:00"),
      tr: {
        ru: { n: "Туалет у западных ворот", s: "Рядом с Ота-Дарваза, 2 000 сум." },
        en: { n: "Restroom at the west gate", s: "By Ota-Darvoza, 2,000 UZS." },
        uz: { n: "G'arbiy darvoza yonidagi hojatxona", s: "Ota darvoza yonida, 2 000 so'm." },
      },
    },
  ],

  tours: [
    {
      slug: "khiva-1-day",
      mode: "walk",
      sort: 1,
      tr: {
        ru: {
          title: "Хива за 1 день",
          description:
            "Ичан-Кала целиком: от западных ворот через Кальта-Минор и Куня-Арк к дворцу Таш-Хаули и самому высокому минарету страны.",
        },
        en: {
          title: "Khiva in one day",
          description:
            "All of Ichan-Kala: from the west gate via Kalta Minor and Kunya-Ark to the Tash-Hauli palace and the country's tallest minaret.",
        },
        uz: {
          title: "Bir kunda Xiva",
          description:
            "Butun Ichan qal'a: g'arbiy darvozadan Kalta minor va Ko'hna Ark orqali Tosh Hovli va mamlakatdagi eng baland minoragacha.",
        },
      },
      stops: [
        ["kalta-minor", 20],
        ["kunya-ark", 50],
        ["juma-mosque-khiva", 25],
        ["pahlavan-mahmud", 25],
        ["islam-khoja", 30],
        ["tash-hauli", 45],
        ["khiva-craft-workshops", 30],
      ],
    },
  ],
};
