import { H, ALWAYS, PRICE } from "./_helpers.mjs";

export default {
  slug: "samarkand",
  lat: 39.6547,
  lon: 66.9758,
  zoom: 14,
  tr: {
    ru: {
      name: "Самарканд",
      description:
        "Один из древнейших городов мира, столица империи Амира Темура и жемчужина Великого шёлкового пути. Исторический центр внесён в список Всемирного наследия ЮНЕСКО.",
    },
    uz: {
      name: "Samarqand",
      description:
        "Dunyodagi eng qadimiy shaharlardan biri, Amir Temur imperiyasining poytaxti va Buyuk ipak yo'lining durdonasi. Tarixiy markazi YUNESKO Butunjahon merosi ro'yxatiga kiritilgan.",
    },
    en: {
      name: "Samarkand",
      description:
        "One of the oldest cities in the world, capital of Amir Timur's empire and a jewel of the Great Silk Road. Its historic centre is a UNESCO World Heritage site.",
    },
  },

  pois: [
    {
      slug: "registan",
      category: "landmark",
      themes: ["history", "architecture", "islamic"],
      lat: 39.6547,
      lon: 66.9758,
      price: PRICE.large,
      visit: 90,
      rating: 4.9,
      pop: 1.0,
      hours: H("08:00", "19:00"),
      qr: "SMR-01",
      tr: {
        ru: {
          n: "Регистан",
          s: "Главная площадь Самарканда, обрамлённая тремя медресе XV–XVII веков.",
          f: `Регистан — «песчаное место» — был главной площадью Самарканда со времён Амира Темура. Здесь оглашали указы, собирали войска и вели торговлю.

Ансамбль складывался два столетия и состоит из трёх медресе.

**Медресе Улугбека** (1417–1420) построено внуком Темура, астрономом и правителем Мирзо Улугбеком. Здесь преподавали математику, астрономию и философию — по преданию, лекции читал сам Улугбек. Портал украшен звёздным орнаментом, отсылающим к его занятиям астрономией.

**Медресе Шердор** (1619–1636) стоит напротив и почти зеркально повторяет первое. Его название означает «имеющее львов»: на портале изображены хищники, преследующие ланей, а над ними — солнца с человеческими лицами. Для исламской архитектуры изображение живых существ необычно, и мозаика Шердора остаётся одним из самых обсуждаемых памятников региона.

**Медресе Тилля-Кари** (1646–1660) замыкает площадь с севера. «Позолоченное» — так переводится его имя: интерьер главной мечети покрыт сусальным золотом, нанесённым техникой кундаль, при которой позолота ложится на рельефный орнамент и кажется объёмной.

Площадь была расчищена и отреставрирована в XX веке; сегодня это самый узнаваемый образ Узбекистана.`,
        },
        uz: {
          n: "Registon",
          s: "Samarqandning bosh maydoni, XV–XVII asrlarga oid uchta madrasa bilan o'ralgan.",
          f: `Registon — «qumli joy» — Amir Temur davridan beri Samarqandning bosh maydoni bo'lgan. Bu yerda farmonlar e'lon qilingan, qo'shin to'plangan va savdo qilingan.

Ansambl ikki asr davomida shakllangan va uchta madrasadan iborat.

**Ulug'bek madrasasi** (1417–1420) Temurning nabirasi, astronom va hukmdor Mirzo Ulug'bek tomonidan qurilgan. Bu yerda matematika, astronomiya va falsafa o'qitilgan.

**Sherdor madrasasi** (1619–1636) ro'parada joylashgan. Nomi «sherli» degani: peshtoqda kiyiklarni quvayotgan yirtqichlar va ular ustida inson yuzli quyoshlar tasvirlangan.

**Tillakori madrasasi** (1646–1660) maydonni shimoldan yopadi. «Zarhal qoplangan» degan nomi bejiz emas: masjid ichi kundal usulida oltin bilan qoplangan.`,
        },
        en: {
          n: "Registan",
          s: "Samarkand's main square, framed by three madrasahs from the 15th–17th centuries.",
          f: `Registan — "the sandy place" — was Samarkand's central square from the time of Amir Timur. Decrees were proclaimed here, armies assembled, and trade conducted.

The ensemble took two centuries to complete and consists of three madrasahs.

**Ulugh Beg Madrasah** (1417–1420) was built by Timur's grandson, the astronomer-ruler Mirzo Ulugh Beg. Mathematics, astronomy and philosophy were taught here, and tradition holds that Ulugh Beg lectured in person. Its portal carries a star pattern echoing his astronomical work.

**Sher-Dor Madrasah** (1619–1636) stands opposite and nearly mirrors the first. Its name means "having lions": the portal shows big cats pursuing deer, with human-faced suns above them. Depicting living creatures is unusual in Islamic architecture, and the Sher-Dor mosaic remains one of the region's most discussed monuments.

**Tilya-Kori Madrasah** (1646–1660) closes the square to the north. Its name means "gilded": the interior of its mosque is covered in gold leaf applied with the kundal technique, laid over relief ornament so it appears three-dimensional.

The square was cleared and restored during the 20th century and is today the most recognisable image of Uzbekistan.`,
        },
      },
    },

    {
      slug: "gur-e-amir",
      category: "landmark",
      themes: ["history", "architecture", "islamic"],
      lat: 39.6486,
      lon: 66.969,
      price: PRICE.medium,
      visit: 45,
      rating: 4.8,
      pop: 0.92,
      hours: H("08:00", "19:00"),
      qr: "SMR-02",
      tr: {
        ru: {
          n: "Гур-Эмир",
          s: "Мавзолей Амира Темура и его потомков под знаменитым ребристым куполом.",
          f: `Гур-Эмир — «могила эмира» — усыпальница Амира Темура, его сыновей и внуков.

Комплекс начинали строить в 1403 году как мавзолей для Мухаммад-Султана, любимого внука Темура, скончавшегося в военном походе. Через два года здесь похоронили и самого Темура: он умер зимой 1405 года в Отраре, готовясь к походу на Китай, и перевал был закрыт снегом — тело не смогли доставить в родной Шахрисабз, где для него была приготовлена гробница.

Ребристый бирюзовый купол диаметром около 15 метров и высотой 12,5 метра стал образцом, к которому позже обращались зодчие Индии — в том числе строители Тадж-Махала: Бабур, основатель империи Великих Моголов, был прямым потомком Темура.

Надгробия в зале — символические. Настоящие захоронения находятся в склепе под ними. В июне 1941 года советская экспедиция под руководством Михаила Герасимова вскрыла гробницу; по черепу был восстановлен облик Темура, а исследование подтвердило хромоту на правой ноге, о которой сообщали летописи.`,
        },
        uz: {
          n: "Go'ri Amir",
          s: "Amir Temur va uning avlodlari maqbarasi, mashhur qovurg'ali gumbaz ostida.",
          f: `Go'ri Amir — «amir qabri» — Amir Temur, uning o'g'illari va nabiralarining maqbarasi.

Majmua 1403 yilda Temurning sevimli nabirasi Muhammad Sultonga atab qurila boshlangan. Ikki yildan so'ng bu yerga Temurning o'zi ham dafn etilgan: u 1405 yil qishida O'tror shahrida vafot etgan.

Diametri 15 metrga yaqin bo'lgan qovurg'ali feruza gumbaz keyinchalik Hindiston me'morlari uchun namuna bo'lgan — Boburiylar sulolasi asoschisi Bobur Temurning bevosita avlodi edi.`,
        },
        en: {
          n: "Gur-e-Amir",
          s: "Mausoleum of Amir Timur and his descendants, under its famous ribbed dome.",
          f: `Gur-e-Amir — "tomb of the emir" — holds Amir Timur, his sons and his grandsons.

Construction began in 1403 as a mausoleum for Muhammad Sultan, Timur's favourite grandson, who died on campaign. Two years later Timur himself was buried here: he died in the winter of 1405 at Otrar while preparing to march on China, and with the mountain passes snowbound his body could not be carried to Shakhrisabz, where a tomb had been prepared for him.

The ribbed turquoise dome — some 15 metres across and 12.5 metres high — became a model that architects in India later drew on, including the builders of the Taj Mahal: Babur, founder of the Mughal Empire, was a direct descendant of Timur.

The gravestones in the hall are symbolic; the actual burials lie in a crypt beneath. In June 1941 a Soviet expedition led by Mikhail Gerasimov opened the tomb, reconstructed Timur's appearance from his skull, and confirmed the lameness of his right leg reported by the chronicles.`,
        },
      },
    },

    {
      slug: "shah-i-zinda",
      category: "religious",
      themes: ["history", "architecture", "islamic"],
      lat: 39.6636,
      lon: 66.9847,
      price: PRICE.small,
      visit: 60,
      rating: 4.9,
      pop: 0.9,
      hours: H("07:00", "19:00"),
      qr: "SMR-03",
      tr: {
        ru: {
          n: "Шахи-Зинда",
          s: "Улица-некрополь из полусотни мавзолеев, самый цельный ансамбль изразцов в Средней Азии.",
          f: `Шахи-Зинда — «живой царь» — некрополь на склоне древнего городища Афрасиаб. Название связано с Кусамом ибн Аббасом, двоюродным братом пророка Мухаммада: по преданию, он принёс ислам в эти края в VII веке и, будучи обезглавлен во время молитвы, ушёл с собственной головой в руках в подземный источник, где живёт до сих пор.

Ансамбль формировался с XI по XIX век и насчитывает более двадцати сохранившихся сооружений, выстроенных вдоль узкой поднимающейся улицы. Большинство мавзолеев XIV–XV веков возведены над могилами родственниц Амира Темура — сестёр, племянниц, кормилицы.

Шахи-Зинда ценят прежде всего за изразцы. Здесь можно проследить всю эволюцию среднеазиатской майолики: от резной терракоты через глазурованный кирпич к многоцветной мозаике из вырезанных вручную кусочков. Мастера подписывали работы — на портале мавзолея Шади-Мульк сохранилось имя Зайнуддина Бухари.

Лестница у входа называется «лестницей грешника»: считается, что нужно сосчитать ступени при подъёме и при спуске, и если числа совпали — помыслы чисты.`,
        },
        uz: {
          n: "Shohi Zinda",
          s: "Ellikka yaqin maqbaradan iborat ko'cha-nekropol, Markaziy Osiyodagi eng yaxlit koshin ansambli.",
          f: `Shohi Zinda — «tirik shoh» — qadimgi Afrosiyob shahristoni yonbag'ridagi nekropol. Nomi payg'ambar Muhammadning amakivachchasi Qusam ibn Abbos bilan bog'liq.

Ansambl XI asrdan XIX asrgacha shakllangan va yigirmadan ortiq inshootdan iborat. Aksariyat maqbaralar XIV–XV asrlarda Amir Temurning qarindosh ayollari qabri ustiga qurilgan.

Shohi Zinda avvalo koshinlari bilan qadrlanadi: bu yerda o'rta osiyo majolikasining butun rivoji — o'ymakor terrakotadan ko'p rangli mozaikagacha — kuzatiladi.`,
        },
        en: {
          n: "Shah-i-Zinda",
          s: "A street-necropolis of some fifty mausoleums — the most complete tilework ensemble in Central Asia.",
          f: `Shah-i-Zinda — "the living king" — is a necropolis on the slope of the ancient settlement of Afrasiab. The name refers to Kusam ibn Abbas, a cousin of the Prophet Muhammad: tradition holds that he brought Islam to this region in the 7th century and, beheaded while at prayer, walked into an underground spring carrying his own head, where he lives still.

The ensemble grew from the 11th to the 19th century and contains more than twenty surviving structures along a narrow ascending street. Most of the 14th- and 15th-century mausoleums were raised over the graves of Amir Timur's female relatives — sisters, nieces, his wet nurse.

Shah-i-Zinda is prized above all for its tilework. The whole evolution of Central Asian ceramics can be traced here: from carved terracotta through glazed brick to polychrome mosaic assembled from hand-cut pieces. The masters signed their work — the portal of the Shadi Mulk mausoleum still carries the name of Zainuddin Bukhari.

The stairway at the entrance is called "the sinner's staircase": you are meant to count the steps going up and coming down, and if the numbers match, your thoughts are pure.`,
        },
      },
    },

    {
      slug: "bibi-khanym",
      category: "religious",
      themes: ["history", "architecture", "islamic"],
      lat: 39.6608,
      lon: 66.9803,
      price: PRICE.small,
      visit: 40,
      rating: 4.6,
      pop: 0.82,
      hours: H("08:00", "19:00"),
      qr: "SMR-04",
      tr: {
        ru: {
          n: "Мечеть Биби-Ханым",
          s: "Грандиозная соборная мечеть Темура — на момент постройки крупнейшая в исламском мире.",
          f: `Мечеть Биби-Ханым Амир Темур начал строить в 1399 году после победоносного похода в Индию. Работали мастера из Персии, Азербайджана, Индии; камень возили девяносто слонов, приведённых из Дели.

Замысел был предельно амбициозен: главный портал достигал 35 метров, купол главного здания — более 40 метров в высоту. Мечеть должна была вместить весь мужской город на пятничную молитву.

Именно масштаб её и погубил. Строители работали в спешке — Темур торопил и, по свидетельству испанского посла Руи Гонсалеса де Клавихо, лично распоряжался ходом работ, спускаясь в котлован. Конструкции такого размера были на пределе возможностей эпохи: кирпичные своды начали трескаться ещё при жизни заказчика, а за столетия мечеть превратилась в руину. Землетрясение 1897 года довершило разрушение.

Реставрация велась с 1970-х годов и восстановила общий облик ансамбля, хотя часть кладки намеренно оставлена в руинированном виде.

Имя мечети — народное. Биби-Ханым, «старшая госпожа», — так называли Сарай-Мульк-ханым, старшую жену Темура. С ней связана легенда о зодчем, потребовавшем поцелуй в награду за работу; след поцелуя на щеке якобы и стал причиной, по которой женщинам было велено закрывать лицо. Историки считают эту легенду поздней.`,
        },
        uz: {
          n: "Bibixonim masjidi",
          s: "Temurning ulkan jome masjidi — qurilgan paytda islom olamidagi eng yirigi.",
          f: `Bibixonim masjidini Amir Temur 1399 yilda Hindistonga qilgan g'alabali yurishdan so'ng qurishni boshlagan. Fors, Ozarbayjon va Hindiston ustalari ishlagan, toshlarni Dehlidan keltirilgan to'qson fil tashigan.

Bosh peshtoq balandligi 35 metrga, gumbaz esa 40 metrdan oshgan. Masjid butun shahar erkaklarini juma namoziga sig'dirishi kerak edi.

Aynan shu ulkanlik uni halok qildi: g'ishtli gumbazlar Temur hayotligidayoq yorila boshlagan, 1897 yilgi zilzila esa vayronani yakunlagan. Qayta tiklash ishlari 1970-yillardan olib borilgan.`,
        },
        en: {
          n: "Bibi-Khanym Mosque",
          s: "Timur's colossal congregational mosque — the largest in the Islamic world when it was built.",
          f: `Amir Timur began the Bibi-Khanym Mosque in 1399, after his victorious campaign in India. Craftsmen came from Persia, Azerbaijan and India; ninety elephants brought from Delhi hauled the stone.

The ambition was extreme: the main portal rose 35 metres and the dome of the principal building more than 40. The mosque was meant to hold every man in the city for Friday prayer.

That scale destroyed it. The builders worked in haste — Timur pressed them and, according to the Spanish ambassador Ruy González de Clavijo, directed the work himself from the foundation pit. Structures this size were at the limit of what the age could do: the brick vaults began to crack while their patron still lived, and over the centuries the mosque fell into ruin. The earthquake of 1897 finished the work.

Restoration from the 1970s recovered the overall form of the ensemble, though some masonry was deliberately left ruined.

The mosque's name is popular usage. Bibi-Khanym, "the senior lady", was how people referred to Saray Mulk Khanum, Timur's principal wife. A legend attaches to her about an architect who demanded a kiss as his reward; the mark it left on her cheek is said to be why women were ordered to veil. Historians regard the story as a late invention.`,
        },
      },
    },

    {
      slug: "ulugbek-observatory",
      category: "museum",
      themes: ["history", "museums"],
      lat: 39.6752,
      lon: 66.9709,
      price: PRICE.small,
      visit: 45,
      rating: 4.6,
      pop: 0.75,
      hours: H("08:00", "18:00"),
      qr: "SMR-05",
      museum: [
        {
          number: "125",
          period: "1420-е годы",
          origin: "Обсерватория Улугбека, Самарканд",
          tr: {
            ru: {
              n: "Дуга секстанта Фахри",
              s: "Сохранившаяся подземная часть главного инструмента обсерватории.",
              f: "Секстант радиусом около 40 метров был вкопан в скалу вдоль линии меридиана — это защищало инструмент от ветра и температурных деформаций. Уцелела подземная часть дуги длиной 11 метров с двумя мраморными рельсами и делениями. С его помощью Улугбек и его коллеги определили продолжительность звёздного года с ошибкой менее минуты.",
            },
            en: {
              n: "Arc of the Fakhri sextant",
              s: "The surviving underground section of the observatory's main instrument.",
              f: "The sextant, roughly 40 metres in radius, was sunk into the bedrock along the meridian line, which protected it from wind and thermal distortion. Eleven metres of the arc survive underground, with two marble rails and their graduations. With this instrument Ulugh Beg and his colleagues measured the length of the sidereal year to within under a minute.",
            },
          },
        },
        {
          number: "126",
          period: "1437 год",
          origin: "Копия рукописи, оригинал — Оксфорд",
          tr: {
            ru: {
              n: "«Зидж-и Гурагани» — звёздный каталог",
              s: "Каталог 1018 звёзд, составленный в Самарканде.",
              f: "Итоговый труд обсерватории — таблицы положений 1018 звёзд, самый точный звёздный каталог со времён Птолемея и до эпохи телескопов. В Европе он был издан в Оксфорде в 1665 году и использовался астрономами более столетия.",
            },
            en: {
              n: "Zij-i Sultani — the star catalogue",
              s: "A catalogue of 1,018 stars compiled in Samarkand.",
              f: "The observatory's culminating work: tables giving the positions of 1,018 stars, the most accurate star catalogue between Ptolemy and the age of the telescope. It was printed in Oxford in 1665 and used by European astronomers for more than a century.",
            },
          },
        },
      ],
      tr: {
        ru: {
          n: "Обсерватория Улугбека",
          s: "Остатки астрономической обсерватории XV века и музей при ней.",
          f: `Обсерваторию построил в 1420-х годах Мирзо Улугбек — внук Амира Темура, правитель Самарканда и, прежде всего, серьёзный учёный.

Здание представляло собой трёхэтажный цилиндр диаметром около 46 метров. Главным инструментом был гигантский секстант радиусом порядка 40 метров, вкопанный в скалу по линии меридиана: чем больше радиус, тем точнее отсчёт углов.

Результаты работы поражают. Улугбек и его сотрудники — среди них Кази-заде Руми и Али Кушчи — измерили продолжительность звёздного года как 365 дней 6 часов 10 минут 8 секунд. Современное значение отличается менее чем на минуту. Наклон земной оси они определили с ошибкой в доли угловой минуты.

После убийства Улугбека в 1449 году обсерватория была заброшена и разобрана на кирпич. Её местоположение было утрачено на четыре с половиной столетия — пока в 1908 году самаркандский археолог-любитель Василий Вяткин не нашёл подземную часть секстанта, опираясь на указание в старинном вакуфном документе.

Рядом работает небольшой музей с копией звёздного каталога и материалами о самаркандской школе астрономии.`,
        },
        uz: {
          n: "Ulug'bek rasadxonasi",
          s: "XV asr astronomik rasadxonasi qoldiqlari va yonidagi muzey.",
          f: `Rasadxonani 1420-yillarda Mirzo Ulug'bek — Amir Temurning nabirasi, Samarqand hukmdori va jiddiy olim — qurdirgan.

Bino diametri 46 metrga yaqin uch qavatli silindr edi. Asosiy asbob meridian bo'ylab qoyaga ko'milgan, radiusi 40 metrga yaqin ulkan sekstant bo'lgan.

Ulug'bek va uning hamkasblari yulduz yilining davomiyligini 365 kun 6 soat 10 daqiqa 8 soniya deb o'lchagan — zamonaviy qiymatdan bir daqiqadan kam farq qiladi.

1449 yilda Ulug'bek o'ldirilgach, rasadxona tashlab qo'yilgan. Uning o'rni 1908 yilda arxeolog Vasiliy Vyatkin tomonidan topilgan.`,
        },
        en: {
          n: "Ulugh Beg Observatory",
          s: "Remains of a 15th-century astronomical observatory, with a museum on site.",
          f: `The observatory was built in the 1420s by Mirzo Ulugh Beg — grandson of Amir Timur, ruler of Samarkand and, above all, a serious scientist.

The building was a three-storey cylinder some 46 metres across. Its principal instrument was a vast sextant of about 40 metres radius, sunk into the bedrock along the meridian: the larger the radius, the finer the angular readings.

The results are remarkable. Ulugh Beg and his collaborators — among them Qadi Zada al-Rumi and Ali Qushji — measured the sidereal year at 365 days, 6 hours, 10 minutes and 8 seconds. The modern value differs by less than a minute. They determined the tilt of the Earth's axis to within a fraction of an arcminute.

After Ulugh Beg was murdered in 1449 the observatory was abandoned and stripped for brick. Its location was lost for four and a half centuries, until in 1908 the Samarkand amateur archaeologist Vasily Vyatkin found the underground portion of the sextant by following a reference in an old endowment document.

A small museum alongside holds a copy of the star catalogue and material on the Samarkand school of astronomy.`,
        },
      },
    },

    {
      slug: "afrosiyob-museum",
      category: "museum",
      themes: ["history", "museums"],
      lat: 39.669,
      lon: 66.9885,
      price: PRICE.small,
      visit: 50,
      rating: 4.4,
      pop: 0.6,
      hours: H("09:00", "18:00"),
      qr: "SMR-06",
      tr: {
        ru: {
          n: "Музей Афрасиаба",
          s: "Находки с городища домонгольского Самарканда, включая знаменитые согдийские фрески VII века.",
          f: `Афрасиаб — городище на северной окраине Самарканда, где город стоял до монгольского разорения 1220 года. Культурный слой здесь достигает нескольких метров и охватывает более двух тысяч лет.

Главный экспонат музея — «Послы»: настенная роспись VII века из парадного зала согдийского правителя Вархумана. На стенах изображены посольства из Китая, Кореи, Тюркского каганата и с берегов Ганга, охота на гепардов, свадебная процессия. Это редчайший источник по домусульманской культуре Средней Азии — согдийцы были торговым народом Шёлкового пути, и роспись показывает, каким они видели известный им мир.

Фрески были обнаружены в 1965 году при прокладке дороги через холм.`,
        },
        en: {
          n: "Afrasiab Museum",
          s: "Finds from the pre-Mongol city of Samarkand, including the famous 7th-century Sogdian murals.",
          f: `Afrasiab is the settlement mound on Samarkand's northern edge where the city stood until the Mongol destruction of 1220. The cultural layer here runs several metres deep and spans more than two thousand years.

The museum's centrepiece is "The Ambassadors": a 7th-century wall painting from the audience hall of the Sogdian ruler Varkhuman. Its walls show embassies from China, Korea, the Turkic Khaganate and the banks of the Ganges, a cheetah hunt, and a wedding procession. It is a rare source on pre-Islamic Central Asian culture — the Sogdians were the merchant people of the Silk Road, and the painting shows the world as they understood it.

The murals were found in 1965 during road construction across the hill.`,
        },
        uz: {
          n: "Afrosiyob muzeyi",
          s: "Mo'g'ullargacha bo'lgan Samarqand shahristoni topilmalari, jumladan VII asr sug'd devoriy suratlari.",
          f: `Afrosiyob — Samarqandning shimoliy chekkasidagi shahriston bo'lib, shahar 1220 yilgi mo'g'ul bosqinigacha shu yerda joylashgan edi.

Muzeyning asosiy eksponati — «Elchilar» devoriy surati: sug'd hukmdori Varxumanning qabul zalidan VII asrga oid rasm. Unda Xitoy, Koreya, Turk xoqonligi va Gang bo'ylaridan kelgan elchilar tasvirlangan. Suratlar 1965 yilda yo'l qurilishi vaqtida topilgan.`,
        },
      },
    },

    {
      slug: "hazrat-khizr",
      category: "religious",
      themes: ["islamic", "architecture", "free"],
      lat: 39.6626,
      lon: 66.9829,
      price: PRICE.free,
      visit: 25,
      rating: 4.6,
      pop: 0.55,
      hours: H("06:00", "21:00"),
      qr: "SMR-07",
      tr: {
        ru: {
          n: "Мечеть Хазрат-Хызр",
          s: "Мечеть на холме над Сиабским базаром с лучшим видом на город.",
          f: `Мечеть носит имя Хызра — святого-покровителя путников, который, по поверью, обрёл вечную жизнь, испив из источника жизни. Место считается древнейшей мусульманской святыней Самарканда: первая мечеть на этом холме появилась в VIII веке, вскоре после арабского завоевания.

Нынешнее здание построено в 1854 году и достраивалось до 1919-го. Оно небольшое, но выделяется резными деревянными колоннами айвана, расписным потолком и открытой террасой, с которой виден весь центр города — от Биби-Ханым до Регистана.

В 2016 году у восточной стены мечети был похоронен первый президент Узбекистана Ислам Каримов, уроженец Самарканда. Рядом построен мемориальный комплекс.

Вход свободный. Женщинам желательно покрыть голову, всем — снять обувь при входе в молитвенный зал.`,
        },
        en: {
          n: "Hazrat Khizr Mosque",
          s: "A mosque on the hill above Siab Bazaar, with the best view over the city.",
          f: `The mosque is named for Khizr, patron saint of travellers, who according to tradition gained eternal life by drinking from the spring of life. The site is held to be the oldest Muslim sanctuary in Samarkand: the first mosque on this hill appeared in the 8th century, soon after the Arab conquest.

The present building dates from 1854 and was extended until 1919. It is small but notable for the carved wooden columns of its iwan, its painted ceiling, and an open terrace looking out over the whole city centre — from Bibi-Khanym to the Registan.

In 2016 Islam Karimov, the first president of Uzbekistan and a native of Samarkand, was buried by the mosque's eastern wall, and a memorial complex was built alongside.

Entry is free. Women should cover their heads; everyone removes their shoes before entering the prayer hall.`,
        },
        uz: {
          n: "Hazrati Xizr masjidi",
          s: "Siyob bozori tepasidagi masjid, shaharning eng go'zal manzarasi shu yerdan ochiladi.",
          f: `Masjid yo'lovchilar homiysi Xizr nomi bilan atalgan. Bu joy Samarqandning eng qadimiy musulmon ziyoratgohi hisoblanadi: tepalikdagi birinchi masjid VIII asrda paydo bo'lgan.

Hozirgi bino 1854 yilda qurilgan. U kichik bo'lsa-da, ayvonining o'ymakor yog'och ustunlari va ochiq ayvonidan ochiladigan shahar manzarasi bilan ajralib turadi.

2016 yilda masjidning sharqiy devori yonida O'zbekiston birinchi prezidenti Islom Karimov dafn etilgan.`,
        },
      },
    },

    {
      slug: "siab-bazaar",
      category: "bazaar",
      themes: ["shopping", "food", "crafts", "free"],
      lat: 39.6614,
      lon: 66.9819,
      price: PRICE.free,
      visit: 45,
      rating: 4.5,
      pop: 0.78,
      hours: H("06:00", "19:00"),
      qr: "SMR-08",
      tr: {
        ru: {
          n: "Сиабский базар",
          s: "Главный рынок Самарканда рядом с мечетью Биби-Ханым.",
          f: `Сиабский базар работает на этом месте столетиями — он находится ровно там, где сходились торговые пути у стен соборной мечети.

Главная местная покупка — самаркандская лепёшка. Её пекут на закваске в тандыре, украшают штампом-чекичем, и она, если верить традиции, не черствеет месяцами; лепёшки увозят как сувенир. Кроме того: сухофрукты, орехи, восточные сладости (халва, нават, парварда), специи, курт — солёные шарики из сушёного творога.

Торговаться уместно, особенно при покупке нескольких позиций. Пробовать перед покупкой — обычная практика, продавцы предлагают сами.

Лучшее время — утро, до 10:00: свежий хлеб и меньше туристических групп.`,
        },
        en: {
          n: "Siab Bazaar",
          s: "Samarkand's main market, right beside the Bibi-Khanym Mosque.",
          f: `Siab Bazaar has traded on this spot for centuries — exactly where the caravan routes met at the walls of the congregational mosque.

The signature purchase is Samarkand bread. It is baked with a sourdough starter in a tandyr oven, stamped with a chekich, and by tradition keeps for months; people carry the loaves home as souvenirs. Beyond that: dried fruit, nuts, sweets (halva, navat, parvarda), spices, and kurt — salted balls of dried curd.

Haggling is expected, particularly when buying several items. Tasting before buying is normal practice, and sellers will offer.

Come in the morning, before 10:00: the bread is fresh and the tour groups have not arrived.`,
        },
        uz: {
          n: "Siyob bozori",
          s: "Samarqandning bosh bozori, Bibixonim masjidi yonida.",
          f: `Siyob bozori asrlar davomida shu yerda ishlab keladi — aynan savdo yo'llari jome masjid devorlari yonida tutashgan joyda.

Asosiy xarid — samarqand noni. U tandirda achitqi bilan yopiladi, chekich bilan bezatiladi va an'anaga ko'ra oylab qotmaydi.

Bundan tashqari: quritilgan mevalar, yong'oqlar, holva, navvot, parvarda, ziravorlar va qurt.

Eng yaxshi vaqt — ertalab, soat 10:00 gacha.`,
        },
      },
    },

    {
      slug: "rukhabad",
      category: "landmark",
      themes: ["history", "islamic", "free"],
      lat: 39.6503,
      lon: 66.9713,
      price: PRICE.free,
      visit: 15,
      rating: 4.2,
      pop: 0.35,
      hours: H("08:00", "19:00"),
      tr: {
        ru: {
          n: "Мавзолей Рухабад",
          s: "Скромный мавзолей XIV века на пути от Регистана к Гур-Эмиру.",
          f: `Рухабад — «обитель духа» — построен около 1380 года над могилой Бурханиддина Сагарджи, богослова и мистика, проповедовавшего ислам в Китае.

Мавзолей нарочито прост: кубическое здание, восьмигранный барабан, купол без изразцов. Считается, что в его основании замурована шкатулка с волосами пророка Мухаммада — поэтому Амир Темур, проезжая мимо, всегда спешивался и шёл пешком, а свой собственный мавзолей Гур-Эмир поставил неподалёку, ниже по улице.`,
        },
        en: {
          n: "Rukhabad Mausoleum",
          s: "A plain 14th-century mausoleum on the walk from the Registan to Gur-e-Amir.",
          f: `Rukhabad — "abode of the spirit" — was built around 1380 over the grave of Burhanuddin Sagardji, a theologian and mystic who preached Islam in China.

The mausoleum is deliberately austere: a cubic building, an octagonal drum, a dome without tilework. A casket holding hairs of the Prophet Muhammad is said to be sealed into its foundation — which is why Amir Timur always dismounted and continued on foot when passing, and why he placed his own mausoleum, Gur-e-Amir, just down the street.`,
        },
      },
    },

    {
      slug: "platan-restaurant",
      category: "restaurant",
      themes: ["food"],
      lat: 39.654,
      lon: 66.964,
      price: 120000,
      visit: 60,
      rating: 4.6,
      pop: 0.5,
      hours: H("11:00", "23:00"),
      tr: {
        ru: {
          n: "Ресторан «Платан»",
          s: "Европейская и узбекская кухня в тени старых платанов, средний чек 120 000 сум.",
        },
        en: {
          n: "Platan Restaurant",
          s: "European and Uzbek cooking in the shade of old plane trees; around 120,000 UZS per person.",
        },
        uz: {
          n: "«Platan» restorani",
          s: "Qadimiy chinorlar soyasida yevropa va o'zbek taomlari, o'rtacha chek 120 000 so'm.",
        },
      },
    },

    {
      slug: "bibikhanum-teahouse",
      category: "cafe",
      themes: ["food", "crafts"],
      lat: 39.6603,
      lon: 66.9795,
      price: 60000,
      visit: 45,
      rating: 4.5,
      pop: 0.45,
      // Платное размещение — ниже рейтинг и значимость, чем у
      // platan-restaurant, но выше в разделе «Рестораны и кафе».
      sponsoredPriority: 10,
      hours: H("09:00", "21:00"),
      tr: {
        ru: {
          n: "Чайхана «Бибиханум»",
          s: "Терраса напротив мечети: плов, самса, чай и мастерская сюзане при заведении.",
        },
        en: {
          n: "Bibikhanum Teahouse",
          s: "A terrace facing the mosque: plov, samsa, tea, and a suzani workshop on site.",
        },
        uz: {
          n: "«Bibixonim» choyxonasi",
          s: "Masjid ro'parasidagi ayvon: palov, somsa, choy va yonidagi so'zana ustaxonasi.",
        },
      },
    },

    {
      slug: "samarkand-silk-carpets",
      category: "craft",
      themes: ["crafts", "shopping"],
      lat: 39.6669,
      lon: 66.9752,
      price: PRICE.free,
      visit: 40,
      rating: 4.7,
      pop: 0.4,
      hours: H("09:00", "18:00", [0]),
      tr: {
        ru: {
          n: "Фабрика шёлковых ковров",
          s: "Ручное ткачество шёлковых ковров: можно наблюдать за работой мастериц.",
          f: "На фабрике сохраняют технологию ручного узелкового ткачества. Один квадратный метр ковра с плотностью около миллиона узлов две мастерицы делают несколько месяцев. Красители — только натуральные: марена, индиго, гранатовая кожура, скорлупа грецкого ореха. Экскурсия по цехам бесплатная.",
        },
        en: {
          n: "Silk carpet workshop",
          s: "Hand-knotted silk carpets — you can watch the weavers at work.",
          f: "The workshop keeps the hand-knotting tradition alive. A single square metre at around a million knots takes two weavers several months. Only natural dyes are used: madder, indigo, pomegranate rind, walnut husk. The tour of the workshops is free.",
        },
        uz: {
          n: "Ipak gilamlar fabrikasi",
          s: "Qo'lda to'qiladigan ipak gilamlar: ustalarning ishini kuzatish mumkin.",
        },
      },
    },

    {
      slug: "samarkand-station",
      category: "station",
      themes: [],
      lat: 39.6742,
      lon: 66.9294,
      price: PRICE.free,
      visit: 15,
      rating: 4.1,
      pop: 0.3,
      hours: ALWAYS,
      tr: {
        ru: {
          n: "Железнодорожный вокзал Самарканда",
          s: "Скоростные поезда «Афросиаб» в Ташкент (2 ч 10 мин), Бухару и Карши.",
        },
        en: {
          n: "Samarkand Railway Station",
          s: "Afrosiyob high-speed trains to Tashkent (2 h 10 min), Bukhara and Karshi.",
        },
        uz: {
          n: "Samarqand temir yo'l vokzali",
          s: "Toshkentga (2 soat 10 daqiqa), Buxoro va Qarshiga «Afrosiyob» tezyurar poyezdlari.",
        },
      },
    },

    {
      slug: "registan-wc",
      category: "toilet",
      themes: [],
      lat: 39.6538,
      lon: 66.9748,
      price: 2000,
      visit: 5,
      rating: 3.8,
      pop: 0.2,
      hours: H("08:00", "20:00"),
      tr: {
        ru: { n: "Общественный туалет у Регистана", s: "Платный, 2 000 сум." },
        en: { n: "Public restroom at the Registan", s: "Paid, 2,000 UZS." },
        uz: { n: "Registon yonidagi hojatxona", s: "Pullik, 2 000 so'm." },
      },
    },
  ],

  tours: [
    {
      slug: "samarkand-1-day",
      mode: "walk",
      sort: 1,
      tr: {
        ru: {
          title: "Самарканд за 1 день",
          description:
            "Классический маршрут по главным памятникам города: от Регистана через соборную мечеть и базар к некрополю Шахи-Зинда и обсерватории Улугбека.",
        },
        en: {
          title: "Samarkand in one day",
          description:
            "The classic route through the city's principal monuments: from the Registan via the congregational mosque and the bazaar to the Shah-i-Zinda necropolis and the Ulugh Beg Observatory.",
        },
        uz: {
          title: "Bir kunda Samarqand",
          description:
            "Shaharning asosiy yodgorliklari bo'ylab klassik marshrut: Registondan jome masjid va bozor orqali Shohi Zinda va Ulug'bek rasadxonasigacha.",
        },
      },
      stops: [
        ["registan", 90],
        ["bibi-khanym", 40],
        ["siab-bazaar", 40],
        ["shah-i-zinda", 60],
        ["afrosiyob-museum", 45],
        ["ulugbek-observatory", 45],
        ["gur-e-amir", 45],
      ],
    },
    {
      slug: "samarkand-6-hours",
      mode: "walk",
      sort: 2,
      tr: {
        ru: {
          title: "Самарканд за 6 часов",
          description:
            "Для тех, кто в городе проездом: только обязательное, пешком, с остановкой на обед у Биби-Ханым.",
        },
        en: {
          title: "Samarkand in six hours",
          description:
            "For travellers passing through: the essentials only, on foot, with a lunch stop by Bibi-Khanym.",
        },
        uz: {
          title: "6 soatda Samarqand",
          description:
            "Shahardan o'tib ketayotganlar uchun: faqat eng zaruri, piyoda, Bibixonim yonida tushlik bilan.",
        },
      },
      stops: [
        ["registan", 75],
        ["gur-e-amir", 40],
        ["bibi-khanym", 35],
        ["bibikhanum-teahouse", 45],
        ["shah-i-zinda", 55],
      ],
    },
    {
      slug: "samarkand-islamic",
      mode: "taxi",
      sort: 3,
      tr: {
        ru: {
          title: "Исламское наследие Самарканда",
          description: "Мечети, мавзолеи и святыни — от древнейшей Хазрат-Хызр до некрополя Шахи-Зинда.",
        },
        en: {
          title: "Islamic heritage of Samarkand",
          description:
            "Mosques, mausoleums and shrines — from the ancient Hazrat Khizr to the Shah-i-Zinda necropolis.",
        },
        uz: {
          title: "Samarqandning islom merosi",
          description: "Masjidlar, maqbaralar va ziyoratgohlar — Hazrati Xizrdan Shohi Zindagacha.",
        },
      },
      stops: [
        ["hazrat-khizr", 30],
        ["bibi-khanym", 40],
        ["shah-i-zinda", 60],
        ["gur-e-amir", 45],
        ["rukhabad", 15],
      ],
    },
  ],
};
