import { H, ALWAYS, PRICE } from "./_helpers.mjs";

export default {
  slug: "andijan",
  lat: 40.7821,
  lon: 72.3442,
  zoom: 13,
  tr: {
    ru: {
      name: "Андижан",
      description:
        "Родина Захириддина Мухаммада Бабура — правителя, поэта и основателя империи Великих Моголов. Изгнанный отсюда в семнадцать лет, он завоевал Индию, но до конца жизни писал о дынях и виноградниках Андижана.",
    },
    uz: {
      name: "Andijon",
      description:
        "Zahiriddin Muhammad Boburning vatani — hukmdor, shoir va Boburiylar saltanati asoschisi. O'n yetti yoshida bu yerdan quvilgan, Hindistonni zabt etgan, ammo umrining oxirigacha Andijon qovunlari haqida yozgan.",
    },
    en: {
      name: "Andijan",
      description:
        "Birthplace of Zahiriddin Muhammad Babur — ruler, poet and founder of the Mughal Empire. Driven out at seventeen, he conquered India, yet wrote about the melons and vineyards of Andijan to the end of his life.",
    },
  },

  pois: [
    {
      slug: "babur-memorial-park",
      category: "landmark",
      themes: ["history", "nature", "free"],
      lat: 40.7594,
      lon: 72.3697,
      price: PRICE.free,
      visit: 50,
      rating: 4.6,
      pop: 0.9,
      hours: H("07:00", "21:00"),
      qr: "AND-01",
      tr: {
        ru: {
          n: "Парк и мемориал Бабура",
          s: "Символическая усыпальница «Бог-и Бабур» на холме Богишамол.",
          f: `Захириддин Мухаммад Бабур родился в Андижане в 1483 году и стал правителем Ферганы в двенадцать лет, после гибели отца. В семнадцать он потерял всё: не удержал Самарканд, лишился и Ферганы, ушёл в Афганистан, а оттуда в 1526 году — в Индию, где основал империю Великих Моголов, правившую три столетия.

Похоронен он в Кабуле, по собственному завещанию. Здесь, на холме Богишамол, стоит символическая усыпальница «Бог-и Бабур», открытая в 1993 году: в неё привезли горсть земли с его настоящей могилы.

Бабур был не только полководцем. Его «Бабур-наме» — автобиография, написанная на чагатайском языке с редкой для средневековья прямотой: он описывает собственные поражения, страхи и ошибки так же подробно, как победы. Книга остаётся одним из главных источников по истории региона.

В воспоминаниях он постоянно возвращается к Андижану — к его дыням, винограду и охоте в предгорьях. Империю он построил в Индии, но родиной считал эту долину.

При мемориале работает музей с изданиями «Бабур-наме» на разных языках.`,
        },
        uz: {
          n: "Bobur bog'i va yodgorligi",
          s: "Bog'ishamol tepaligidagi ramziy «Bog'i Bobur» maqbarasi.",
          f: `Zahiriddin Muhammad Bobur 1483 yilda Andijonda tug'ilgan va otasi halok bo'lgach, o'n ikki yoshida Farg'ona hukmdori bo'lgan. O'n yettida hammasini yo'qotgan, Afg'onistonga ketgan, 1526 yilda esa Hindistonga borib, uch asr hukmronlik qilgan Boburiylar saltanatiga asos solgan.

U o'z vasiyatiga ko'ra Kobulda dafn etilgan. Bu yerda, Bog'ishamol tepaligida 1993 yilda ochilgan ramziy maqbara turadi — unga asl qabridan bir hovuch tuproq keltirilgan.

Bobur faqat sarkarda emas edi. Uning «Boburnoma»si — chig'atoy tilida yozilgan tarjimai hol, o'rta asrlar uchun noyob samimiylik bilan: u o'z mag'lubiyatlari va xatolarini g'alabalari kabi batafsil tasvirlaydi.

Xotiralarida u doim Andijonga qaytadi — uning qovunlari va uzumiga.`,
        },
        en: {
          n: "Babur Memorial Park",
          s: "The symbolic Bogh-i Babur tomb on Bogishamol hill.",
          f: `Zahiriddin Muhammad Babur was born in Andijan in 1483 and became ruler of Fergana at twelve, after his father's death. At seventeen he lost everything: he could not hold Samarkand, forfeited Fergana too, withdrew to Afghanistan, and from there in 1526 into India, where he founded the Mughal Empire that ruled for three centuries.

He is buried in Kabul, by his own wish. Here on Bogishamol hill stands the symbolic tomb Bogh-i Babur, opened in 1993, to which a handful of earth from his real grave was brought.

Babur was not only a commander. His Baburnama is an autobiography written in Chagatai with a directness rare for the middle ages: he sets down his own defeats, fears and mistakes as fully as his victories. The book remains a principal source for the history of the region.

Through those memoirs he returns again and again to Andijan — to its melons, its grapes, its hunting in the foothills. He built his empire in India, but this valley was home.

A museum at the memorial holds editions of the Baburnama in many languages.`,
        },
      },
    },

    {
      slug: "jami-complex-andijan",
      category: "religious",
      themes: ["islamic", "architecture", "museums"],
      lat: 40.7842,
      lon: 72.3389,
      price: PRICE.small,
      visit: 45,
      rating: 4.4,
      pop: 0.65,
      hours: H("09:00", "18:00", [1]),
      qr: "AND-02",
      tr: {
        ru: {
          n: "Комплекс Джами",
          s: "Соборная мечеть и медресе XIX века с минаретом 32 метра.",
          f: `Комплекс построен в 1883–1890 годах по инициативе местного правителя Ахмадбека Хаджи и включает соборную мечеть, медресе и минарет.

Айван мечети держат резные деревянные колонны; потолок расписан растительным орнаментом в ферганской манере — более цветной и плотной, чем бухарская.

Минарет высотой 32 метра стоит отдельно.

Комплекс пережил разрушительное землетрясение 1902 года, когда Андижан был почти стёрт: погибли тысячи людей, рухнула большая часть города. Мечеть устояла и была восстановлена.

Сейчас в медресе размещён Андижанский областной краеведческий музей.`,
        },
        uz: {
          n: "Jome majmuasi",
          s: "XIX asr jome masjidi va madrasasi, 32 metrli minora bilan.",
          f: `Majmua 1883–1890 yillarda mahalliy hukmdor Ahmadbek Hoji tashabbusi bilan qurilgan: jome masjid, madrasa va minora.

Masjid ayvonini o'ymakor yog'och ustunlar ko'taradi, shift farg'ona uslubidagi o'simlik naqshi bilan bo'yalgan.

Minora balandligi 32 metr.

Majmua 1902 yilgi vayronkor zilzilani boshdan kechirgan — o'shanda Andijon deyarli butunlay vayron bo'lgan. Hozir madrasada o'lkashunoslik muzeyi joylashgan.`,
        },
        en: {
          n: "Jami Complex",
          s: "A 19th-century congregational mosque and madrasah with a 32-metre minaret.",
          f: `The complex was built between 1883 and 1890 at the initiative of the local ruler Ahmadbek Hajji, comprising a congregational mosque, a madrasah and a minaret.

Carved wooden columns carry the mosque's iwan; the ceiling is painted with vegetal ornament in the Fergana manner — more colourful and denser than the Bukharan style.

The minaret, 32 metres high, stands separately.

The complex survived the devastating earthquake of 1902, when Andijan was all but erased: thousands died and most of the town collapsed. The mosque held and was restored.

The madrasah now houses the Andijan Regional Museum of Local History.`,
        },
      },
    },

    {
      slug: "andijan-bazaar",
      category: "bazaar",
      themes: ["shopping", "food", "free"],
      lat: 40.7869,
      lon: 72.3364,
      price: PRICE.free,
      visit: 45,
      rating: 4.2,
      pop: 0.4,
      hours: H("06:00", "18:00"),
      tr: {
        ru: {
          n: "Андижанский базар",
          s: "Дыни, виноград и сухофрукты долины — те самые, о которых писал Бабур.",
          f: "Один из старейших рынков долины. Андижанские дыни и виноград Бабур описывал в мемуарах как лучшие, что он знал; сорта сохранились. Осенью здесь горы дынь, летом — черешня и абрикосы, круглый год — сухофрукты и орехи.",
        },
        uz: {
          n: "Andijon bozori",
          s: "Vodiy qovunlari, uzumi va quruq mevalari — Bobur yozgan o'shalar.",
        },
        en: {
          n: "Andijan Bazaar",
          s: "The valley's melons, grapes and dried fruit — the ones Babur wrote about.",
          f: "One of the oldest markets in the valley. Babur described Andijan's melons and grapes in his memoirs as the best he knew; the varieties survive. Autumn brings mountains of melons, summer cherries and apricots, and dried fruit and nuts are there all year.",
        },
      },
    },

    {
      slug: "andijan-teahouse",
      category: "cafe",
      themes: ["food"],
      lat: 40.7833,
      lon: 72.3411,
      price: 45000,
      visit: 40,
      rating: 4.2,
      pop: 0.25,
      hours: H("08:00", "21:00"),
      tr: {
        ru: { n: "Чайхана «Бобур»", s: "Андижанский плов, шурпа и зелёный чай." },
        uz: { n: "«Bobur» choyxonasi", s: "Andijon palovi, sho'rva va ko'k choy." },
        en: { n: "Bobur Teahouse", s: "Andijan plov, shurpa and green tea." },
      },
    },
  ],

  tours: [
    {
      slug: "andijan-babur",
      mode: "taxi",
      sort: 1,
      tr: {
        ru: {
          title: "Андижан Бабура",
          description:
            "Родина основателя империи Великих Моголов: мемориал на холме Богишамол, комплекс Джами и базар с теми самыми дынями, о которых он писал в изгнании.",
        },
        en: {
          title: "Babur's Andijan",
          description:
            "The birthplace of the founder of the Mughal Empire: the memorial on Bogishamol hill, the Jami complex, and the bazaar with the very melons he wrote about in exile.",
        },
        uz: {
          title: "Boburning Andijoni",
          description:
            "Boburiylar saltanati asoschisining vatani: Bog'ishamol yodgorligi, Jome majmuasi va bozor.",
        },
      },
      stops: [
        ["babur-memorial-park", 50],
        ["jami-complex-andijan", 45],
        ["andijan-bazaar", 45],
      ],
    },
  ],
};
