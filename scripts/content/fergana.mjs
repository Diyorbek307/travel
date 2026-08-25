import { H, ALWAYS, PRICE } from "./_helpers.mjs";

export default {
  slug: "fergana",
  lat: 40.5286,
  lon: 70.9425,
  zoom: 10,
  tr: {
    ru: {
      name: "Ферганская долина",
      description:
        "Самая густонаселённая и плодородная часть Узбекистана, зажатая между горными хребтами. Здесь до сих пор ткут шёлк вручную по технологии абрбанди и обжигают риштанскую керамику на природных красителях — это живые ремёсла, а не музейные реконструкции.",
    },
    uz: {
      name: "Farg'ona vodiysi",
      description:
        "O'zbekistonning eng gavjum va unumdor qismi, tog' tizmalari orasida. Bu yerda hanuz abrbandi usulida qo'lda ipak to'qiladi va Rishton sopoli tabiiy bo'yoqlarda pishiriladi.",
    },
    en: {
      name: "The Fergana Valley",
      description:
        "The most densely populated and fertile part of Uzbekistan, hemmed in by mountain ranges. Silk is still woven here by hand using the abrbandi technique, and Rishtan pottery is still fired with natural pigments — living crafts, not museum reconstructions.",
    },
  },

  pois: [
    {
      slug: "khudayar-khan-palace",
      category: "museum",
      themes: ["history", "architecture", "museums"],
      lat: 40.5228,
      lon: 70.9422,
      price: PRICE.small,
      visit: 60,
      rating: 4.6,
      pop: 0.95,
      hours: H("09:00", "18:00"),
      qr: "FRG-01",
      museum: [
        {
          number: "501",
          period: "1871 год",
          origin: "Дворец Худояр-хана, Коканд",
          tr: {
            ru: {
              n: "Изразцовый фасад дворца",
              s: "Сто метров майолики, набранной вручную из вырезанных кусочков.",
              f: "Фасад длиной около 100 метров и высотой 20 метров покрыт майоликой сплошь. Орнамент набирался из отдельно вырезанных и обожжённых кусочков — техника мозаичной майолики, а не роспись по готовой плитке. Над отделкой работали шестнадцать мастеров, имена которых сохранились в надписи над входным порталом. Это последний крупный памятник кокандской школы декора, оборвавшейся вместе с ханством в 1876 году.",
            },
            en: {
              n: "The tiled facade",
              s: "A hundred metres of majolica assembled by hand from cut pieces.",
              f: "The facade, about 100 metres long and 20 metres high, is faced entirely in majolica. The ornament was assembled from individually cut and fired pieces — mosaic majolica, not painting on ready-made tile. Sixteen masters worked on the decoration, and their names survive in the inscription above the entrance portal. It is the last major monument of the Kokand school of decoration, which ended with the khanate in 1876.",
            },
          },
        },
        {
          number: "502",
          period: "XIX век",
          origin: "Кокандское ханство",
          tr: {
            ru: {
              n: "Тронный зал",
              s: "Один из девятнадцати уцелевших залов дворца.",
              f: "Из 113 комнат и семи дворов дворца сохранилось девятнадцать помещений и два двора. В тронном зале уцелели резной ганч и расписной потолок с наборным деревянным орнаментом. Здесь Худояр-хан принимал посольства — в том числе российские, незадолго до того, как ханство было упразднено.",
            },
            en: {
              n: "The throne hall",
              s: "One of nineteen surviving rooms of the palace.",
              f: "Of the palace's 113 rooms and seven courtyards, nineteen rooms and two courtyards survive. The throne hall keeps its carved ganch and a painted ceiling with inlaid wooden ornament. Here Khudayar Khan received embassies — Russian ones among them, shortly before the khanate was abolished.",
            },
          },
        },
      ],
      tr: {
        ru: {
          n: "Дворец Худояр-хана",
          s: "Резиденция последнего кокандского хана: сто метров изразцового фасада.",
          f: `Дворец построен в 1863–1873 годах для Худояр-хана, последнего правителя Кокандского ханства. Народное имя — «Урда».

Первоначально это был город в городе: 113 комнат, семь дворов, гарем, монетный двор, казна. Фасад длиной около ста метров и высотой двадцать метров покрыт майоликой сплошь — по площади изразцов это один из самых насыщенных памятников Средней Азии.

Пандус ведёт к высокому порталу; над входом сохранилась надпись с именами шестнадцати мастеров, работавших над отделкой.

Судьба хозяина сложилась быстро. В 1875 году против Худояр-хана вспыхнуло восстание, он бежал; в 1876-м ханство было упразднено и вошло в состав Российской империи. Дворец лишился большей части построек — сегодня уцелели девятнадцать комнат и два двора, в них размещён краеведческий музей.

Дворец в Коканде, это около 90 километров от города Ферганы.`,
        },
        uz: {
          n: "Xudoyorxon o'rdasi",
          s: "So'nggi qo'qon xoni qarorgohi: yuz metrlik koshin peshtoq.",
          f: `O'rda 1863–1873 yillarda Qo'qon xonligining so'nggi hukmdori Xudoyorxon uchun qurilgan.

Dastlab bu shahar ichidagi shahar edi: 113 xona, yettita hovli, harom, zarbxona. Uzunligi yuz metr, balandligi yigirma metrli peshtoq butunlay koshin bilan qoplangan.

Kirish tepasida bezak ustalari — o'n olti kishining ismi bitilgan.

1875 yilda Xudoyorxonga qarshi qo'zg'olon ko'tarilgan, 1876 yilda xonlik tugatilgan. Bugun o'n to'qqiz xona va ikki hovli saqlangan, ularda o'lkashunoslik muzeyi joylashgan.

O'rda Qo'qonda, Farg'ona shahridan 90 kilometr uzoqlikda.`,
        },
        en: {
          n: "Khudayar Khan Palace",
          s: "Residence of the last Kokand khan: a hundred metres of tiled facade.",
          f: `The palace was built between 1863 and 1873 for Khudayar Khan, the last ruler of the Kokand Khanate. Locally it is called the Urda.

It began as a city within a city: 113 rooms, seven courtyards, a harem, a mint, a treasury. The facade, some hundred metres long and twenty high, is faced in majolica throughout — by area of tilework it is among the most densely decorated monuments in Central Asia.

A ramp leads to a tall portal; above the entrance an inscription preserves the names of the sixteen masters who did the decoration.

Its owner's fortunes turned quickly. A revolt broke out against Khudayar Khan in 1875 and he fled; in 1876 the khanate was abolished and absorbed into the Russian Empire. Most of the palace was lost — nineteen rooms and two courtyards survive today, housing a local history museum.

The palace is in Kokand, about 90 kilometres from the city of Fergana.`,
        },
      },
    },

    {
      slug: "yodgorlik-silk-factory",
      category: "craft",
      themes: ["crafts", "shopping", "history"],
      lat: 40.4711,
      lon: 71.7242,
      price: PRICE.free,
      visit: 60,
      rating: 4.7,
      pop: 0.8,
      hours: H("08:00", "18:00", [0]),
      qr: "FRG-02",
      tr: {
        ru: {
          n: "Шёлковая фабрика «Ёдгорлик»",
          s: "Маргилан: единственное производство, где хан-атлас делают полностью вручную.",
          f: `Маргилану больше двух тысяч лет, и шёлк здесь ткут почти столько же — город стоял на Шёлковом пути и был одним из его узлов.

Фабрика «Ёдгорлик» основана в 1972 году и осталась единственным предприятием, где весь цикл идёт вручную. Экскурсия проводит по нему целиком:

**Коконы** разваривают в котлах и разматывают — с одного кокона сходит нить длиной до километра.

**Абрбанди** — то, ради чего сюда едут. Пучки нитей перевязывают в нужных местах хлопковой нитью и опускают в краску; под перевязкой цвет не берётся. Операцию повторяют для каждого цвета. Мастер держит рисунок в голове — схем не существует. Из-за того, что краска слегка затекает под перевязку, границы узора получаются размытыми: отсюда «абр» — облако.

**Красители** натуральные: гранатовая кожура даёт жёлтый, марена — красный, индиго — синий, скорлупа грецкого ореха — коричневый.

**Ткачество** на ручных станках. Опытная мастерица делает несколько метров в день.

В 2017 году узбекская технология абрбанди внесена в список нематериального наследия ЮНЕСКО.

При фабрике магазин — здесь ткань дешевле, чем на базарах Самарканда, и точно ручная.`,
        },
        uz: {
          n: "«Yodgorlik» ipak fabrikasi",
          s: "Marg'ilon: xonatlas to'liq qo'lda tayyorlanadigan yagona korxona.",
          f: `Marg'ilon ikki ming yildan ortiq yoshda va bu yerda ipak deyarli shuncha vaqtdan beri to'qiladi.

«Yodgorlik» fabrikasi 1972 yilda tashkil etilgan va butun jarayon qo'lda bajariladigan yagona korxona bo'lib qolgan.

**Pillalar** qozonlarda qaynatilib, chuvilodi — bitta pilladan bir kilometrgacha ip chiqadi.

**Abrbandi** — asosiy jarayon. Ip dastalari kerakli joylarda paxta ipi bilan bog'lanib, bo'yoqqa tushiriladi; bog'lam ostiga rang o'tmaydi. Usta naqshni yodda saqlaydi — chizma yo'q. Bo'yoq bog'lam ostiga bir oz o'tgani uchun naqsh chegaralari xira chiqadi: shundan «abr» — bulut.

**Bo'yoqlar** tabiiy: anor po'sti sariq, ro'yan qizil, indigo ko'k rang beradi.

2017 yilda abrbandi texnologiyasi YUNESKO nomoddiy merosi ro'yxatiga kiritilgan.`,
        },
        en: {
          n: "Yodgorlik Silk Factory",
          s: "Margilan: the only workshop where khan-atlas is made entirely by hand.",
          f: `Margilan is more than two thousand years old, and silk has been woven here almost as long — the town stood on the Silk Road and was one of its knots.

The Yodgorlik factory was founded in 1972 and remains the only enterprise where the whole cycle is done by hand. The tour walks you through all of it:

**Cocoons** are boiled in vats and unwound — a single cocoon yields a thread up to a kilometre long.

**Abrbandi** is what people come to see. Bundles of thread are tied off with cotton at chosen points and dipped in dye; the colour does not reach beneath the ties. The operation repeats for every colour. The master holds the pattern in memory — no drawings exist. Because dye seeps slightly under the ties, the edges of the pattern come out blurred: hence abr, cloud.

**Dyes** are natural: pomegranate rind gives yellow, madder red, indigo blue, walnut husk brown.

**Weaving** is on hand looms. An experienced weaver makes a few metres a day.

In 2017 the Uzbek abrbandi technique was added to the UNESCO list of intangible heritage.

There is a shop on site — the cloth is cheaper than in the Samarkand bazaars, and certainly handmade.`,
        },
      },
    },

    {
      slug: "rishtan-ceramics",
      category: "craft",
      themes: ["crafts", "shopping"],
      lat: 40.3572,
      lon: 71.2836,
      price: PRICE.free,
      visit: 50,
      rating: 4.7,
      pop: 0.7,
      hours: H("09:00", "18:00"),
      qr: "FRG-03",
      tr: {
        ru: {
          n: "Керамические мастерские Риштана",
          s: "Бирюзовая керамика на природной глазури ишкор — промыслу больше восьмисот лет.",
          f: `Риштан — керамический центр Ферганской долины, работающий не меньше восьмисот лет. В городе больше двух тысяч гончаров: керамикой здесь занимается едва ли не каждая вторая семья.

Узнаваемый цвет риштанской посуды — бирюзово-синий. Его даёт глазурь ишкор, которую варят из золы горного растения гульхайри с добавлением окиси меди и кобальта. Такую глазурь готовят вручную, и рецепт в каждой мастерской свой.

Глина местная, из карьера у города: она достаточно пластична, чтобы работать без добавок.

Роспись наносят кистью из козьей шерсти без предварительного рисунка. Основные мотивы — гранат как символ плодородия, нож-пчак, чайник, растительные плетения, реже птицы.

В мастерских показывают весь цикл: гончарный круг, сушка, роспись, обжиг. Купить можно прямо у мастера — дешевле, чем в туристических лавках, и с гарантией, что это Риштан, а не подделка.`,
        },
        uz: {
          n: "Rishton sopol ustaxonalari",
          s: "Ishqor sirida feruza sopol — hunar sakkiz asrdan ortiq yoshda.",
          f: `Rishton — Farg'ona vodiysining sopol markazi, kamida sakkiz yuz yildan beri ishlaydi. Shaharda ikki mingdan ortiq kulol bor.

Rishton sopolining tanish rangi — feruza-ko'k. Uni ishqor siri beradi: tog' o'simligi gulxayri kulidan mis va kobalt oksidi qo'shib qaynatiladi. Retsept har ustaxonada o'ziga xos.

Loy mahalliy, shahar yonidagi konidan.

Naqsh echki juni cho'tkasi bilan oldindan chizmasdan tushiriladi. Asosiy naqshlar — anor, pichoq, choynak, o'simlik naqshlari.

Ustaxonalarda butun jarayon ko'rsatiladi. Sotib olish to'g'ridan-to'g'ri ustadan mumkin.`,
        },
        en: {
          n: "Rishtan Ceramic Workshops",
          s: "Turquoise pottery under natural ishkor glaze — a craft more than eight centuries old.",
          f: `Rishtan is the ceramic centre of the Fergana Valley and has worked for at least eight hundred years. More than two thousand potters live in the town: close to every second family works in clay.

The recognisable colour of Rishtan ware is turquoise-blue. It comes from ishkor glaze, boiled from the ash of the mountain plant gulkhayri with copper and cobalt oxide added. The glaze is made by hand and every workshop keeps its own recipe.

The clay is local, from a pit beside the town: plastic enough to work without additives.

Painting is done with a goat-hair brush, freehand, with no preliminary drawing. The main motifs are the pomegranate as a symbol of fertility, the pchak knife, the teapot, vegetal interlace, and less often birds.

The workshops show the whole cycle: wheel, drying, painting, firing. You can buy directly from the maker — cheaper than in tourist shops, and certainly Rishtan rather than an imitation.`,
        },
      },
    },

    {
      slug: "jami-mosque-kokand",
      category: "religious",
      themes: ["islamic", "architecture", "history"],
      lat: 40.5289,
      lon: 70.9394,
      price: PRICE.small,
      visit: 30,
      rating: 4.4,
      pop: 0.5,
      hours: H("08:00", "18:00"),
      tr: {
        ru: {
          n: "Мечеть Джума в Коканде",
          s: "Айван на 98 колоннах из карагача — самая длинная колоннада региона.",
          f: `Соборная мечеть построена в 1809–1812 годах при Умар-хане.

Главное здесь — айван длиной около ста метров, кровлю которого держат 98 деревянных колонн. Их привезли из Индии; резьба на капителях выполнена местными мастерами. Такой длины открытая колоннада в Средней Азии больше нигде не сохранилась.

Во дворе стоит минарет высотой 22 метра.

Мечеть закрыли в 1930-е, в советское время в ней размещался музей. Сейчас часть здания используется как музей деревянной резьбы.`,
        },
        uz: {
          n: "Qo'qon Jome masjidi",
          s: "Qorayog'ochdan 98 ustunli ayvon — mintaqadagi eng uzun ustunlar qatori.",
          f: "Jome masjid 1809–1812 yillarda Umarxon davrida qurilgan. Asosiysi — uzunligi yuz metrga yaqin ayvon, tomini 98 yog'och ustun ko'taradi. Ustunlar Hindistondan keltirilgan. Hovlida balandligi 22 metrli minora turadi.",
        },
        en: {
          n: "Juma Mosque in Kokand",
          s: "An iwan on 98 elm columns — the longest colonnade in the region.",
          f: `The congregational mosque was built between 1809 and 1812 under Umar Khan.

Its defining feature is an iwan about a hundred metres long, its roof carried on 98 wooden columns. They were brought from India; the carving on the capitals is local work. No open colonnade of that length survives anywhere else in Central Asia.

A minaret 22 metres high stands in the courtyard.

The mosque was closed in the 1930s and held a museum in the Soviet period. Part of the building now serves as a museum of wood carving.`,
        },
      },
    },

    {
      slug: "modari-khan-mausoleum",
      category: "landmark",
      themes: ["islamic", "architecture", "history"],
      lat: 40.5256,
      lon: 70.9367,
      price: PRICE.free,
      visit: 20,
      rating: 4.2,
      pop: 0.3,
      hours: H("08:00", "18:00"),
      tr: {
        ru: {
          n: "Мавзолей Модари-хан",
          s: "Усыпальница матери Умар-хана, 1825 год.",
          f: "Мавзолей построен в 1825 году для матери Умар-хана. Портал облицован майоликой с растительным орнаментом; внутри — резной ганч. Рядом находится Дахма-и-Шахон, родовое кладбище кокандских правителей, где похоронен и сам Умар-хан.",
        },
        uz: {
          n: "Modarixon maqbarasi",
          s: "Umarxon onasining maqbarasi, 1825 yil.",
        },
        en: {
          n: "Modari Khan Mausoleum",
          s: "Tomb of Umar Khan's mother, 1825.",
          f: "Built in 1825 for the mother of Umar Khan. The portal is faced in majolica with vegetal ornament; carved ganch decorates the interior. Nearby lies Dakhma-i-Shakhon, the dynastic cemetery of the Kokand rulers, where Umar Khan himself is buried.",
        },
      },
    },

    {
      slug: "kumtepa-bazaar",
      category: "bazaar",
      themes: ["shopping", "crafts", "food", "free"],
      lat: 40.4489,
      lon: 71.7156,
      price: PRICE.free,
      visit: 60,
      rating: 4.5,
      pop: 0.55,
      hours: H("06:00", "15:00"),
      tr: {
        ru: {
          n: "Базар Кумтепа",
          s: "Крупнейший текстильный рынок долины. Работает по четвергам и воскресеньям.",
          f: `Кумтепа под Маргиланом — главный текстильный базар Ферганской долины. Полноценно работает два дня в неделю, по четвергам и воскресеньям, и в эти дни сюда съезжаются со всей долины.

Здесь продают хан-атлас и адрас метрами, готовую одежду, тюбетейки, платки. Цены заметно ниже туристических: это рынок для местных, а не для приезжих.

Приходить нужно рано — торговля начинается в шесть утра и к полудню сворачивается. Наличные обязательны, торг уместен.`,
        },
        uz: {
          n: "Qumtepa bozori",
          s: "Vodiydagi eng yirik to'qimachilik bozori. Payshanba va yakshanba kunlari ishlaydi.",
        },
        en: {
          n: "Kumtepa Bazaar",
          s: "The valley's largest textile market. Trades on Thursdays and Sundays.",
          f: `Kumtepa near Margilan is the main textile bazaar of the Fergana Valley. It works properly two days a week, Thursday and Sunday, and on those days people come from across the valley.

Khan-atlas and adras are sold by the metre, along with ready-made clothing, skullcaps and scarves. Prices are markedly below tourist level: this is a market for locals, not for visitors.

Come early — trading starts at six and winds down by midday. Cash is essential and haggling is expected.`,
        },
      },
    },

    {
      slug: "fergana-park",
      category: "nature",
      themes: ["nature", "family", "free"],
      lat: 40.3833,
      lon: 71.7833,
      price: PRICE.free,
      visit: 30,
      rating: 4.0,
      pop: 0.25,
      hours: ALWAYS,
      tr: {
        ru: {
          n: "Парк Аль-Фергани",
          s: "Центральный парк Ферганы с прудом и старыми чинарами.",
          f: "Парк назван в честь Ахмада аль-Фергани — астронома IX века, уроженца долины, чьи труды по астрономии переводились в Европе под именем Alfraganus. Тенистое место в центре города, удобная точка отдыха между поездками по долине.",
        },
        uz: { n: "Al-Farg'oniy bog'i", s: "Farg'onaning markaziy bog'i, hovuz va qadimiy chinorlar bilan." },
        en: {
          n: "Al-Fergani Park",
          s: "Fergana's central park, with a pond and old plane trees.",
          f: "The park is named for Ahmad al-Fergani, a 9th-century astronomer born in the valley, whose works were translated in Europe under the name Alfraganus. A shaded spot in the town centre and a convenient place to rest between trips around the valley.",
        },
      },
    },

    {
      slug: "fergana-restaurant",
      category: "restaurant",
      themes: ["food"],
      lat: 40.3856,
      lon: 71.7869,
      price: 60000,
      visit: 55,
      rating: 4.3,
      pop: 0.3,
      hours: H("10:00", "22:00"),
      tr: {
        ru: {
          n: "Ресторан «Фаргона»",
          s: "Ферганский плов, ханум и самса из тандыра.",
          f: "Ферганский плов отличается от ташкентского: рис девзира, морковь красная и жёлтая, готовится в одном казане без разделения слоёв. Считается родоначальником всех узбекских разновидностей плова.",
        },
        uz: { n: "«Farg'ona» restorani", s: "Farg'ona palovi, xonim va tandir somsa." },
        en: {
          n: "Fargona Restaurant",
          s: "Fergana plov, khanum and tandyr samsa.",
          f: "Fergana plov differs from the Tashkent kind: devzira rice, both red and yellow carrot, cooked in a single cauldron without separating the layers. It is considered the ancestor of all Uzbek varieties of plov.",
        },
      },
    },
  ],

  tours: [
    {
      slug: "fergana-crafts",
      mode: "car",
      sort: 1,
      tr: {
        ru: {
          title: "Ремёсла Ферганской долины",
          description:
            "Живые промыслы, а не музейные реконструкции: ручное шелкоткачество в Маргилане, керамика Риштана и дворец последнего кокандского хана. Расстояния между городами — до 90 километров, нужна машина на день.",
        },
        en: {
          title: "Crafts of the Fergana Valley",
          description:
            "Living trades rather than museum reconstructions: hand silk weaving in Margilan, Rishtan ceramics, and the palace of the last Kokand khan. The towns lie up to 90 kilometres apart — you need a car for the day.",
        },
        uz: {
          title: "Farg'ona vodiysi hunarmandchiligi",
          description:
            "Tirik hunarlar: Marg'ilonda qo'lda ipak to'qish, Rishton sopoli va so'nggi qo'qon xoni o'rdasi.",
        },
      },
      stops: [
        ["khudayar-khan-palace", 60],
        ["jami-mosque-kokand", 30],
        ["rishtan-ceramics", 50],
        ["yodgorlik-silk-factory", 60],
      ],
    },
  ],
};
