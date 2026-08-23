import { H, ALWAYS, PRICE } from "./_helpers.mjs";

export default {
  slug: "bukhara",
  lat: 39.7756,
  lon: 64.4143,
  zoom: 15,
  tr: {
    ru: {
      name: "Бухара",
      description:
        "Город-музей под открытым небом: более 140 памятников архитектуры на компактной территории. Крупнейший центр исламского богословия Средней Азии.",
    },
    uz: {
      name: "Buxoro",
      description:
        "Ochiq osmon ostidagi shahar-muzey: ixcham hududda 140 dan ortiq me'moriy yodgorlik. Markaziy Osiyoning eng yirik islom ilmi markazi.",
    },
    en: {
      name: "Bukhara",
      description:
        "An open-air museum city: over 140 architectural monuments within a compact area, and the greatest centre of Islamic scholarship in Central Asia.",
    },
  },

  pois: [
    {
      slug: "poi-kalyan",
      category: "religious",
      themes: ["history", "architecture", "islamic"],
      lat: 39.7758,
      lon: 64.4143,
      price: PRICE.small,
      visit: 60,
      rating: 4.9,
      pop: 1.0,
      hours: H("08:00", "19:00"),
      qr: "BUX-01",
      tr: {
        ru: {
          n: "Ансамбль Пои-Калян",
          s: "Минарет Калян, соборная мечеть и медресе Мири-Араб вокруг одной площади.",
          f: `Пои-Калян — «подножие великого» — главный архитектурный ансамбль Бухары.

**Минарет Калян** построен в 1127 году при караханидском правителе Арслан-хане. Высота 46,5 метра, в основании — фундамент глубиной около 10 метров на подушке из камыша, гасящей толчки землетрясений. Кладка из жжёного кирпича собрана в четырнадцать поясов, ни один из которых не повторяет соседний. Минарет служил и маяком для караванов: наверху зажигали огонь.

Чингисхан, взявший Бухару в 1220 году, приказал разрушить город, но минарет велел не трогать — по преданию, он запрокинул голову, чтобы разглядеть верх, и с него слетела шапка.

**Мечеть Калян** (1514) вмещает до 12 тысяч человек. Её двор окружён галереей из 288 куполов на массивных столбах.

**Медресе Мири-Араб** (1530-е) стоит напротив мечети. Это действующее медресе — одно из немногих, работавших даже в советские годы, — поэтому внутренний двор закрыт для посетителей, зато портал и бирюзовые купола видны с площади.`,
        },
        en: {
          n: "Poi-Kalyan Ensemble",
          s: "The Kalyan minaret, the congregational mosque and the Mir-i-Arab madrasah around a single square.",
          f: `Poi-Kalyan — "the foot of the great one" — is Bukhara's principal architectural ensemble.

**The Kalyan Minaret** was raised in 1127 under the Karakhanid ruler Arslan Khan. It stands 46.5 metres high on a foundation about 10 metres deep, set on a bed of reeds that damps earthquake shocks. Its fired brickwork is arranged in fourteen bands, no two alike. The minaret also served as a beacon for caravans, with a fire lit at the top.

Genghis Khan, who took Bukhara in 1220, ordered the city destroyed but the minaret spared — tradition says he tipped his head back to see the top and his cap fell off.

**The Kalyan Mosque** (1514) holds up to 12,000 people. Its courtyard is ringed by a gallery of 288 domes on massive piers.

**The Mir-i-Arab Madrasah** (1530s) faces the mosque. It is a working madrasah — one of the very few that continued through the Soviet period — so its courtyard is closed to visitors, though the portal and turquoise domes are visible from the square.`,
        },
        uz: {
          n: "Poi Kalon majmuasi",
          s: "Kalon minorasi, jome masjid va Mir Arab madrasasi bir maydon atrofida.",
          f: `Poi Kalon — «buyukning poyi» — Buxoroning bosh me'moriy majmuasi.

**Kalon minorasi** 1127 yilda qoraxoniy hukmdor Arslonxon davrida qurilgan. Balandligi 46,5 metr, poydevori esa zilzila zarbini yumshatuvchi qamish yostiq ustiga o'rnatilgan. Pishiq g'ishtdan o'n to'rtta belbog' terilgan, hech biri ikkinchisini takrorlamaydi.

1220 yilda Buxoroni olgan Chingizxon shaharni vayron qilishni buyurgan, lekin minoraga tegmaslikni aytgan.

**Kalon masjidi** (1514) 12 ming kishini sig'diradi. **Mir Arab madrasasi** (1530-yillar) esa hozir ham faoliyat yuritadi.`,
        },
      },
    },

    {
      slug: "ark-fortress",
      category: "landmark",
      themes: ["history", "architecture", "museums"],
      lat: 39.7756,
      lon: 64.4093,
      price: PRICE.medium,
      visit: 70,
      rating: 4.6,
      pop: 0.88,
      hours: H("09:00", "18:00"),
      qr: "BUX-02",
      museum: [
        {
          number: "212",
          period: "XIX век",
          origin: "Тронный зал Арка, Бухара",
          tr: {
            ru: {
              n: "Тронный зал (Куриниш-хона)",
              s: "Открытый двор, где эмиры принимали послов и оглашали указы.",
              f: "Мраморный трон в центре двора изготовлен в 1669 году мастерами из Хорезма. Здесь проходили коронации бухарских эмиров, приём иностранных посольств и оглашение указов. Последняя коронация состоялась в 1910 году — на престол взошёл Алимхан, последний эмир Бухары.",
            },
            en: {
              n: "Throne hall (Kurinish-khana)",
              s: "The open court where the emirs received envoys and proclaimed decrees.",
              f: "The marble throne at the centre of the court was made in 1669 by craftsmen from Khorezm. Coronations of the Bukharan emirs took place here, along with the reception of foreign embassies and the reading of decrees. The last coronation was in 1910, when Alim Khan, the final emir of Bukhara, took the throne.",
            },
          },
        },
        {
          number: "213",
          period: "X век",
          origin: "Библиотека Арка (утрачена)",
          tr: {
            ru: {
              n: "Библиотека Саманидов — реконструкция",
              s: "Зал, где, по свидетельству Ибн Сины, он читал труды по медицине.",
              f: "Ибн Сина (Авиценна) описывал библиотеку Арка как несколько комнат, где книги были расставлены по отраслям знания, с описью в каждой. Юный врач получил к ней доступ, вылечив саманидского эмира Нуха ибн Мансура. Библиотека сгорела, и её состав известен только по этому свидетельству.",
            },
            en: {
              n: "The Samanid library — reconstruction",
              s: "The hall where, by his own account, Ibn Sina read the medical literature.",
              f: "Ibn Sina (Avicenna) described the Ark's library as a suite of rooms with books arranged by field of knowledge, each room holding its own catalogue. The young physician gained access after curing the Samanid emir Nuh ibn Mansur. The library burned, and its contents are known only from this account.",
            },
          },
        },
      ],
      tr: {
        ru: {
          n: "Крепость Арк",
          s: "Резиденция бухарских правителей — древнейшее сооружение города.",
          f: `Арк — цитадель Бухары и одновременно самая старая часть города: культурный слой под ней уходит в IV век до нашей эры. Холм высотой около 20 метров — результат того, что каждый новый правитель строил поверх развалин предыдущего.

Внутри располагался целый город: дворец эмира, тронный зал, мечеть, монетный двор, казна, мастерские, тюрьма и жилища придворных. Здесь работала знаменитая библиотека, которой в юности пользовался Ибн Сина.

Пандус ведёт к воротам между двумя башнями — единственному входу. Слева от прохода находились камеры зиндана.

В 1920 году крепость была разрушена при штурме Бухары Красной армией: уцелело около 20% построек. Сегодня в сохранившейся части работают музеи — истории Бухары, природы, нумизматики.

Стоит подняться на стену: оттуда хорошо видна площадь Регистан и мечеть Боло-Хауз напротив.`,
        },
        en: {
          n: "The Ark Fortress",
          s: "Residence of the rulers of Bukhara and the oldest structure in the city.",
          f: `The Ark is Bukhara's citadel and its oldest ground: the cultural layer beneath it reaches back to the 4th century BCE. The mound stands some 20 metres high because each new ruler built over the rubble of the last.

An entire city sat inside: the emir's palace, the throne hall, a mosque, the mint, the treasury, workshops, a prison and the courtiers' quarters. The famous library that the young Ibn Sina used was here.

A ramp leads to the gate between two towers — the only way in. The cells of the zindan lay to the left of the passage.

In 1920 the fortress was wrecked during the Red Army's assault on Bukhara; roughly 20% of the buildings survived. Museums now occupy what remains — the history of Bukhara, natural history, numismatics.

Climb the wall: it gives a clear view of Registan Square and the Bolo Hauz Mosque opposite.`,
        },
        uz: {
          n: "Ark qal'asi",
          s: "Buxoro hukmdorlarining qarorgohi — shahardagi eng qadimiy inshoot.",
          f: `Ark — Buxoro qal'asi va shaharning eng qadimiy qismi: uning ostidagi madaniy qatlam eramizdan avvalgi IV asrga boradi.

Ichkarida butun bir shahar joylashgan edi: amir saroyi, taxt zali, masjid, zarbxona, xazina, ustaxonalar va zindon. Yosh Ibn Sino foydalangan mashhur kutubxona ham shu yerda bo'lgan.

1920 yilda qal'a Qizil Armiya hujumida vayron qilingan, binolarning taxminan 20 foizi saqlanib qolgan.`,
        },
      },
    },

    {
      slug: "lyabi-hauz",
      category: "landmark",
      themes: ["history", "architecture", "food", "free"],
      lat: 39.7742,
      lon: 64.4207,
      price: PRICE.free,
      visit: 40,
      rating: 4.7,
      pop: 0.85,
      hours: ALWAYS,
      qr: "BUX-03",
      tr: {
        ru: {
          n: "Ляби-Хауз",
          s: "Площадь вокруг старинного водоёма — сердце вечерней Бухары.",
          f: `Ляби-Хауз — «у водоёма» — ансамбль XVI–XVII веков вокруг прямоугольного бассейна со ступенями, спускающимися к воде.

До начала XX века такие хаузы были единственным источником воды в городе: их насчитывалось больше двухсот. Воду меняли редко, и Бухара платила за это эпидемиями — русские врачи в XIX веке связывали с хаузами вспышки ришты. В 1920-х годах большинство водоёмов засыпали; Ляби-Хауз сохранили как памятник.

Площадь обрамляют медресе Кукельдаш (1568, крупнейшее в Средней Азии), ханака и медресе Надира Диван-беги. Портал последнего украшен мозаикой с птицами Симург, несущими в когтях ланей, и солнцем с человеческим лицом — редкий для исламской архитектуры сюжет, родственный самаркандскому Шердору.

У воды растут тутовники, которым несколько сотен лет. Вечером здесь работают чайханы, а рядом стоит памятник Ходже Насреддину верхом на осле.`,
        },
        en: {
          n: "Lyabi-Hauz",
          s: "The square around an old reservoir — the heart of Bukhara in the evening.",
          f: `Lyabi-Hauz — "by the pool" — is a 16th- and 17th-century ensemble around a rectangular basin with steps descending to the water.

Until the early 20th century such hauz pools were the city's only water supply; there were more than two hundred. The water was changed rarely, and Bukhara paid in epidemics — 19th-century Russian doctors linked outbreaks of guinea worm to the pools. Most were filled in during the 1920s; Lyabi-Hauz was kept as a monument.

The square is framed by the Kukeldash Madrasah (1568, the largest in Central Asia), and the khanaka and madrasah of Nadir Divan-Begi. The portal of the latter carries a mosaic of Simurgh birds carrying deer in their talons beneath a human-faced sun — a subject rare in Islamic architecture and related to the Sher-Dor in Samarkand.

Mulberry trees several centuries old grow by the water. Teahouses work here in the evening, and a statue of Khoja Nasreddin on his donkey stands nearby.`,
        },
        uz: {
          n: "Labi Hovuz",
          s: "Qadimiy hovuz atrofidagi maydon — kechki Buxoroning yuragi.",
          f: `Labi Hovuz — XVI–XVII asrlarga oid majmua bo'lib, suvga tushadigan zinapoyali to'rtburchak hovuz atrofida joylashgan.

XX asr boshigacha bunday hovuzlar shahardagi yagona suv manbai edi — ularning soni ikki yuzdan ortiq bo'lgan. 1920-yillarda ko'pchiligi ko'mib tashlangan, Labi Hovuz esa yodgorlik sifatida saqlangan.

Maydonni Ko'kaldosh madrasasi (1568), Nodir Devonbegi xonaqohi va madrasasi o'rab turadi.`,
        },
      },
    },

    {
      slug: "samanid-mausoleum",
      category: "landmark",
      themes: ["history", "architecture", "islamic"],
      lat: 39.7772,
      lon: 64.4045,
      price: PRICE.free,
      visit: 25,
      rating: 4.8,
      pop: 0.7,
      hours: H("07:00", "21:00"),
      qr: "BUX-04",
      tr: {
        ru: {
          n: "Мавзолей Саманидов",
          s: "Кубическая гробница X века — старейшее исламское здание Средней Азии.",
          f: `Мавзолей Исмаила Самани построен на рубеже IX–X веков и остаётся самым ранним сохранившимся мусульманским зданием региона.

Здание — куб со стороной около 10 метров, увенчанный полусферическим куполом; по углам — четыре маленьких купола. Здесь нет ни изразцов, ни росписи: весь декор сделан одним материалом — жжёным кирпичом, уложенным так, что стены читаются по-разному в зависимости от времени суток. Утром рельеф даёт глубокие тени, в полдень фасад кажется почти плоским, к вечеру рисунок проступает снова.

Композиция сочетает доисламские мотивы с новой религиозной формой: куб с куполом восходит к зороастрийским чортакам, а четыре малых купола отсылают к четырём сторонам света.

Мавзолей уцелел при монгольском нашествии потому, что к XIII веку был занесён песком и наносами — Чингисхан просто не увидел его. Здание откопали в 1930-е годы.`,
        },
        en: {
          n: "Samanid Mausoleum",
          s: "A cubic 10th-century tomb — the oldest Islamic building in Central Asia.",
          f: `The mausoleum of Ismail Samani was built at the turn of the 9th and 10th centuries and remains the earliest surviving Muslim building in the region.

It is a cube about 10 metres to a side under a hemispherical dome, with four small domes at the corners. There is no tilework and no painting: the entire decoration is made from one material — fired brick, laid so that the walls read differently through the day. In the morning the relief throws deep shadows; at noon the facade looks almost flat; towards evening the pattern emerges again.

The composition joins pre-Islamic motifs to a new religious form: the cube-with-dome descends from Zoroastrian chortaqs, and the four small domes answer the four cardinal directions.

The mausoleum survived the Mongol invasion because by the 13th century it had been buried under sand and silt — Genghis Khan simply did not see it. It was dug out in the 1930s.`,
        },
        uz: {
          n: "Somoniylar maqbarasi",
          s: "X asrga oid kubsimon maqbara — Markaziy Osiyodagi eng qadimiy islomiy bino.",
          f: `Ismoil Somoniy maqbarasi IX–X asrlar chegarasida qurilgan va mintaqadagi eng erta saqlanib qolgan musulmon binosi hisoblanadi.

Bino tomoni 10 metrga yaqin kub bo'lib, yarim sharsimon gumbaz bilan yopilgan. Bu yerda koshin ham, naqsh ham yo'q: butun bezak faqat pishiq g'ishtdan terilgan va devorlar kun davomida turlicha ko'rinadi.

Maqbara mo'g'ul bosqinidan omon qolgan, chunki XIII asrga kelib qum ostida ko'milib qolgan edi. Bino 1930-yillarda qazib olingan.`,
        },
      },
    },

    {
      slug: "chor-minor",
      category: "landmark",
      themes: ["architecture", "history"],
      lat: 39.7757,
      lon: 64.4283,
      price: PRICE.free,
      visit: 20,
      rating: 4.4,
      pop: 0.55,
      hours: H("08:00", "19:00"),
      qr: "BUX-05",
      tr: {
        ru: {
          n: "Чор-Минор",
          s: "Ворота медресе с четырьмя разными башенками — самый узнаваемый силуэт Бухары.",
          f: `Чор-Минор — «четыре минарета» — построен в 1807 году туркменским купцом Халифом Ниязкулом как надвратная постройка его медресе. Само медресе не сохранилось, остались только ворота.

Четыре башни не являются минаретами в функциональном смысле: с них не призывали на молитву. Каждая отличается от остальных декором куполка, и распространённое объяснение — что они символизируют четыре мировые религии или четырёх дочерей заказчика — не имеет документального подтверждения, хотя и звучит в каждой экскурсии.

Внутри есть узкая лестница на крышу.`,
        },
        en: {
          n: "Chor Minor",
          s: "A madrasah gatehouse with four unmatched towers — Bukhara's most recognisable silhouette.",
          f: `Chor Minor — "four minarets" — was built in 1807 by the Turkmen merchant Khalif Niyazkul as the gatehouse of his madrasah. The madrasah itself is gone; only the gate remains.

The four towers are not minarets in any functional sense — no call to prayer was made from them. Each differs from the others in the decoration of its small dome, and the common explanation that they stand for four world religions, or for the patron's four daughters, has no documentary support, though every guided tour repeats it.

A narrow staircase inside leads to the roof.`,
        },
        uz: {
          n: "Chor Minor",
          s: "To'rtta har xil minorali madrasa darvozasi — Buxoroning eng tanish siluyeti.",
          f: `Chor Minor 1807 yilda turkman savdogari Xalif Niyozqul tomonidan o'z madrasasining darvozaxonasi sifatida qurilgan. Madrasaning o'zi saqlanmagan, faqat darvoza qolgan.

To'rt minora amalda minora emas — ulardan azon aytilmagan. Har birining gumbazchasi boshqasidan farq qiladi.`,
        },
      },
    },

    {
      slug: "trading-domes",
      category: "bazaar",
      themes: ["shopping", "crafts", "architecture", "free"],
      lat: 39.7752,
      lon: 64.4165,
      price: PRICE.free,
      visit: 45,
      rating: 4.6,
      pop: 0.72,
      hours: H("09:00", "19:00"),
      qr: "BUX-06",
      tr: {
        ru: {
          n: "Торговые купола",
          s: "Крытые перекрёстки-базары XVI века: Токи-Заргарон, Токи-Тельпакфурушон, Токи-Саррафон.",
          f: `Три купольных пассажа XVI века стоят на перекрёстках главной торговой улицы Бухары. Каждый специализировался на своём товаре, что и закреплено в названиях: Токи-Заргарон — ювелиры, Токи-Тельпакфурушон — продавцы головных уборов, Токи-Саррафон — менялы.

Конструкция решала климатическую задачу: купол с отверстиями создаёт тягу, воздух под сводом остаётся заметно прохладнее уличного даже в сорокаградусную жару.

Сегодня под куполами торгуют коврами, чеканкой, миниатюрой, керамикой, ножами и специями. Торг здесь — часть ритуала, начальная цена обычно завышена в полтора-два раза.`,
        },
        en: {
          n: "The trading domes",
          s: "16th-century covered crossroads bazaars: Toqi Zargaron, Toqi Telpak Furushon, Toqi Sarrafon.",
          f: `Three domed arcades from the 16th century stand at the crossings of Bukhara's main trading street. Each specialised in one trade, as the names record: Toqi Zargaron — jewellers, Toqi Telpak Furushon — hat sellers, Toqi Sarrafon — money changers.

The design solves a climate problem: a dome pierced with openings draws air through, and the space beneath stays noticeably cooler than the street even in forty-degree heat.

Today the domes sell carpets, metalwork, miniature painting, ceramics, knives and spices. Haggling is part of the ritual; the opening price is usually inflated by half again or more.`,
        },
        uz: {
          n: "Savdo gumbazlari",
          s: "XVI asr yopiq chorraha-bozorlari: Toqi Zargaron, Toqi Telpakfurushon, Toqi Sarrafon.",
          f: `XVI asrga oid uchta gumbazli savdo rastasi Buxoroning bosh savdo ko'chasi chorrahalarida joylashgan. Har biri o'z mollariga ixtisoslashgan.

Gumbazdagi teshiklar havo tortimini yaratadi va salqinlik saqlanadi. Bugun bu yerda gilam, kandakorlik, miniatyura, sopol va ziravorlar sotiladi.`,
        },
      },
    },

    {
      slug: "bolo-hauz",
      category: "religious",
      themes: ["architecture", "islamic", "free"],
      lat: 39.7757,
      lon: 64.4075,
      price: PRICE.free,
      visit: 20,
      rating: 4.6,
      pop: 0.5,
      hours: H("06:00", "20:00"),
      tr: {
        ru: {
          n: "Мечеть Боло-Хауз",
          s: "Пятничная мечеть эмиров с айваном на двадцати расписных колоннах.",
          f: `Боло-Хауз построена в 1712 году и служила официальной мечетью эмира: правитель переходил сюда из Арка по пятницам.

Главное в ней — айван, добавленный в 1917 году: двадцать деревянных колонн высотой около 12 метров с расписными сталактитовыми капителями. Колонны отражаются в водоёме перед мечетью, отчего их иногда называют «сорока колоннами».

Мечеть действующая, вход свободный.`,
        },
        en: {
          n: "Bolo Hauz Mosque",
          s: "The emirs' Friday mosque, with an iwan on twenty painted columns.",
          f: `Bolo Hauz was built in 1712 and served as the emir's official mosque; the ruler crossed here from the Ark on Fridays.

Its defining feature is the iwan added in 1917: twenty wooden columns some 12 metres tall with painted muqarnas capitals. They reflect in the pool in front, which is why the mosque is sometimes called "the forty columns".

The mosque is in use and entry is free.`,
        },
        uz: {
          n: "Bolo Hovuz masjidi",
          s: "Amirlarning juma masjidi, yigirmata naqshinkor ustunli ayvon bilan.",
          f: "Bolo Hovuz 1712 yilda qurilgan va amirning rasmiy masjidi bo'lgan. 1917 yilda qo'shilgan ayvon — balandligi 12 metrga yaqin yigirmata yog'och ustun — uning eng ko'zga tashlanadigan qismi.",
        },
      },
    },

    {
      slug: "sitorai-mokhi-khosa",
      category: "museum",
      themes: ["history", "museums", "architecture"],
      lat: 39.8194,
      lon: 64.4297,
      price: PRICE.medium,
      visit: 60,
      rating: 4.5,
      pop: 0.48,
      hours: H("09:00", "18:00"),
      tr: {
        ru: {
          n: "Ситораи Мохи-Хоса",
          s: "Загородная резиденция последних эмиров: смесь бухарского декора и русского модерна.",
          f: `«Дворец, подобный звёздам и луне» построен в конце XIX — начале XX века как летняя резиденция эмиров Бухары.

Здание интересно как документ эпохи: эмир Алимхан отправлял мастеров учиться в Петербург, и в результате европейские интерьеры — паркет, зеркала, изразцовые печи, венская мебель — соседствуют с традиционной ганчевой резьбой и росписью. Белый зал целиком покрыт резным ганчем на зеркальной подложке; работа заняла несколько лет.

В павильонах размещена коллекция сюзане и халатов, а в парке живут павлины.

Дворец находится в 4 км к северу от центра — потребуется такси.`,
        },
        en: {
          n: "Sitorai Mokhi-Khosa",
          s: "The last emirs' country residence: Bukharan decoration meets Russian Art Nouveau.",
          f: `"The palace like stars and the moon" was built in the late 19th and early 20th centuries as the summer residence of the emirs of Bukhara.

The building is interesting as a document of its moment: Emir Alim Khan sent craftsmen to train in St Petersburg, and the result sets European interiors — parquet, mirrors, tiled stoves, Viennese furniture — beside traditional carved ganch plaster and painting. The White Hall is covered entirely in carved ganch over a mirrored backing, work that took several years.

The pavilions hold a collection of suzani embroidery and robes, and peacocks live in the park.

The palace is 4 km north of the centre; you will need a taxi.`,
        },
        uz: {
          n: "Sitorai Mohi Xosa",
          s: "So'nggi amirlarning shahar tashqarisidagi qarorgohi: buxoro bezagi va rus modernining uyg'unligi.",
          f: "«Yulduz va oyga o'xshash saroy» XIX asr oxiri — XX asr boshida Buxoro amirlarining yozgi qarorgohi sifatida qurilgan. Yevropa interyerlari an'anaviy ganch o'ymakorligi bilan yonma-yon turadi. Saroy markazdan 4 km shimolda joylashgan.",
        },
      },
    },

    {
      slug: "magoki-attori",
      category: "religious",
      themes: ["history", "islamic", "museums"],
      lat: 39.7745,
      lon: 64.418,
      price: PRICE.small,
      visit: 20,
      rating: 4.3,
      pop: 0.35,
      hours: H("09:00", "18:00"),
      tr: {
        ru: {
          n: "Мечеть Магоки-Аттари",
          s: "Древнейшая мечеть Бухары, стоящая на месте зороастрийского храма.",
          f: `Магоки-Аттари — «яма травников» — построена в XII веке на месте, где до ислама стоял храм огня, а ещё раньше — рынок идолов. Название закрепилось из-за того, что здание оказалось ниже уровня улицы: культурный слой вокруг нарастал столетиями, и в мечеть спускаются на несколько метров.

Южный портал XII века — единственный в Бухаре образец домонгольского резного декора такого масштаба: терракота, фигурная кладка, шлифованный кирпич.

Сейчас внутри работает музей ковров.`,
        },
        en: {
          n: "Magoki-Attori Mosque",
          s: "Bukhara's oldest mosque, standing on the site of a Zoroastrian temple.",
          f: `Magoki-Attori — "the pit of the herbalists" — was built in the 12th century where a fire temple had stood before Islam, and before that a market for idols. The name stuck because the building ended up below street level: the surrounding ground rose over centuries, and you descend several metres into the mosque.

Its 12th-century southern portal is the only pre-Mongol carved decoration of this scale in Bukhara: terracotta, patterned brickwork, polished brick.

A carpet museum occupies the interior today.`,
        },
        uz: {
          n: "Magoki Attori masjidi",
          s: "Buxoroning eng qadimiy masjidi, zardushtiylik ibodatxonasi o'rnida qurilgan.",
          f: "Magoki Attori XII asrda islomgacha otashkada turgan joyda qurilgan. Bino ko'cha sathidan pastda qolgan, chunki atrofdagi madaniy qatlam asrlar davomida ko'tarilgan. Hozir ichida gilam muzeyi ishlaydi.",
        },
      },
    },

    {
      slug: "old-bukhara-restaurant",
      category: "restaurant",
      themes: ["food"],
      lat: 39.7748,
      lon: 64.4198,
      price: 90000,
      visit: 60,
      rating: 4.5,
      pop: 0.45,
      hours: H("10:00", "23:00"),
      tr: {
        ru: {
          n: "Ресторан «Старая Бухара»",
          s: "Бухарский плов, шурпа и манты в двух шагах от Ляби-Хауза.",
        },
        en: {
          n: "Old Bukhara Restaurant",
          s: "Bukharan plov, shurpa and manti a minute from Lyabi-Hauz.",
        },
        uz: {
          n: "«Eski Buxoro» restorani",
          s: "Labi Hovuzdan ikki qadam narida buxorocha palov, sho'rva va manti.",
        },
      },
    },

    {
      slug: "silk-road-teahouse",
      category: "cafe",
      themes: ["food"],
      lat: 39.7745,
      lon: 64.4213,
      price: 45000,
      visit: 40,
      rating: 4.4,
      pop: 0.38,
      hours: H("08:00", "22:00"),
      tr: {
        ru: { n: "Чайхана «Шёлковый путь»", s: "Чай, самса и сладости у водоёма Ляби-Хауз." },
        en: { n: "Silk Road Teahouse", s: "Tea, samsa and sweets by the Lyabi-Hauz pool." },
        uz: { n: "«Ipak yo'li» choyxonasi", s: "Labi Hovuz yonida choy, somsa va shirinliklar." },
      },
    },

    {
      slug: "bukhara-station",
      category: "station",
      themes: [],
      lat: 39.7167,
      lon: 64.5253,
      price: PRICE.free,
      visit: 15,
      rating: 4.0,
      pop: 0.25,
      hours: ALWAYS,
      tr: {
        ru: {
          n: "Вокзал Бухара-1 (Каган)",
          s: "Главный вокзал в 12 км от центра, в городе Каган. До города — такси около 20 минут.",
        },
        en: {
          n: "Bukhara-1 Station (Kagan)",
          s: "The main station is 12 km from the centre, in Kagan. About 20 minutes by taxi.",
        },
        uz: {
          n: "Buxoro-1 vokzali (Kogon)",
          s: "Bosh vokzal markazdan 12 km uzoqlikda, Kogon shahrida. Taksida taxminan 20 daqiqa.",
        },
      },
    },
  ],

  tours: [
    {
      slug: "bukhara-1-day",
      mode: "walk",
      sort: 1,
      tr: {
        ru: {
          title: "Бухара за 1 день",
          description:
            "Весь исторический центр пешком: от мавзолея Саманидов через Арк и Пои-Калян к торговым куполам и Ляби-Хаузу.",
        },
        en: {
          title: "Bukhara in one day",
          description:
            "The whole historic centre on foot: from the Samanid Mausoleum via the Ark and Poi-Kalyan to the trading domes and Lyabi-Hauz.",
        },
        uz: {
          title: "Bir kunda Buxoro",
          description:
            "Butun tarixiy markaz piyoda: Somoniylar maqbarasidan Ark va Poi Kalon orqali savdo gumbazlari va Labi Hovuzgacha.",
        },
      },
      stops: [
        ["samanid-mausoleum", 25],
        ["bolo-hauz", 20],
        ["ark-fortress", 70],
        ["poi-kalyan", 60],
        ["trading-domes", 45],
        ["magoki-attori", 20],
        ["lyabi-hauz", 40],
        ["chor-minor", 20],
      ],
    },
    {
      slug: "bukhara-4-hours",
      mode: "walk",
      sort: 2,
      tr: {
        ru: {
          title: "Бухара за 4 часа",
          description: "Только главное — для тех, у кого пересадка или полдня в городе.",
        },
        en: {
          title: "Bukhara in four hours",
          description: "The essentials only — for a layover or half a day in the city.",
        },
        uz: {
          title: "4 soatda Buxoro",
          description: "Faqat eng asosiysi — transfer yoki yarim kunlik tashrif uchun.",
        },
      },
      stops: [
        ["poi-kalyan", 55],
        ["ark-fortress", 55],
        ["trading-domes", 35],
        ["lyabi-hauz", 35],
      ],
    },
  ],
};
