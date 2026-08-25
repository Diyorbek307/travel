import { H, ALWAYS, PRICE } from "./_helpers.mjs";

export default {
  slug: "shakhrisabz",
  lat: 39.0577,
  lon: 66.8281,
  zoom: 15,
  tr: {
    ru: {
      name: "Шахрисабз",
      description:
        "Родина Амира Темура и второй город его державы. Исторический центр внесён в список Всемирного наследия ЮНЕСКО. От дворца Ак-Сарай, который должен был превзойти всё построенное до него, уцелели только пилоны портала — но и они выше двадцатиэтажного дома.",
    },
    uz: {
      name: "Shahrisabz",
      description:
        "Amir Temurning vatani va davlatining ikkinchi shahri. Tarixiy markazi YUNESKO Butunjahon merosi ro'yxatiga kiritilgan. Oqsaroydan faqat peshtoq ustunlari qolgan, ammo ular ham yigirma qavatli uydan baland.",
    },
    en: {
      name: "Shakhrisabz",
      description:
        "Birthplace of Amir Timur and the second city of his empire. Its historic centre is a UNESCO World Heritage site. Of the Ak-Saray palace, meant to surpass everything built before it, only the portal pylons survive — and they still stand taller than a twenty-storey building.",
    },
  },

  pois: [
    {
      slug: "ak-saray",
      category: "landmark",
      themes: ["history", "architecture"],
      lat: 39.0631,
      lon: 66.8306,
      price: PRICE.small,
      visit: 45,
      rating: 4.7,
      pop: 1.0,
      hours: H("08:00", "19:00"),
      qr: "SHZ-01",
      tr: {
        ru: {
          n: "Дворец Ак-Сарай",
          s: "Руины «Белого дворца» Амира Темура: два пилона портала высотой 38 метров.",
          f: `Ак-Сарай — «белый дворец» — Амир Темур начал строить в 1380 году в родном Шахрисабзе, и работы шли двадцать четыре года, до самой его смерти.

Замысел был вызывающим даже по меркам Темура. Портал шириной около 22 метров перекрывала арка, которой не знала архитектура того времени; пилоны поднимались, по разным оценкам, на 50–70 метров. На стене была выложена надпись: «Если ты сомневаешься в нашем могуществе — взгляни на наши постройки».

Дворец служил не жильём, а приёмной для послов: сюда приводили посольства, чтобы они увидели масштаб державы прежде, чем увидят её правителя. Испанский посол Руй Гонсалес де Клавихо, побывавший здесь в 1404 году, описывал залы, отделанные золотом и лазуритом, и сады с проточной водой.

Разрушил дворец не время. В XVI веке бухарский хан Абдулла-хан II взял Шахрисабз и приказал срыть постройки Темуридов — уничтожение памяти о сопернике было частью политики. Уцелели только два пилона портала: сегодня они достигают 38 метров, между ними больше двадцати метров пустоты, где когда-то смыкалась арка.

На фрагментах сохранилась изразцовая мозаика: белый, голубой и золотой по синему фону. По ней видно, каким был дворец целиком.`,
        },
        uz: {
          n: "Oqsaroy",
          s: "Amir Temurning «Oq saroyi» xarobalari: balandligi 38 metrli ikkita peshtoq ustuni.",
          f: `Oqsaroyni Amir Temur 1380 yilda o'z vatani Shahrisabzda qurishni boshlagan, ish yigirma to'rt yil — uning vafotigacha davom etgan.

Peshtoq kengligi 22 metrga yaqin, ustunlari turli baholarga ko'ra 50–70 metrga ko'tarilgan. Devorga «Agar qudratimizga shubha qilsang — binolarimizga boq» degan yozuv bitilgan.

Saroy turar joy emas, elchilarni qabul qilish uchun xizmat qilgan. 1404 yilda bu yerda bo'lgan ispan elchisi Rui Gonsales de Klavixo oltin va lojuvard bilan bezatilgan zallarni tasvirlagan.

Saroyni vaqt emas, odam vayron qilgan: XVI asrda buxorolik Abdullaxon II Shahrisabzni olib, temuriylar binolarini buzishni buyurgan. Faqat ikkita peshtoq ustuni qolgan — bugun ular 38 metr balandlikda.`,
        },
        en: {
          n: "Ak-Saray Palace",
          s: "Ruins of Amir Timur's White Palace: two portal pylons standing 38 metres high.",
          f: `Ak-Saray — the White Palace — was begun by Amir Timur in 1380 in his native Shakhrisabz, and work continued for twenty-four years, until his death.

The ambition was audacious even by Timur's standards. An arch of a span unknown to the architecture of its day crossed a portal some 22 metres wide; the pylons rose, by various estimates, 50 to 70 metres. An inscription on the wall read: "If you doubt our power, look at our buildings."

The palace was not a residence but a reception hall for envoys: embassies were brought here to see the scale of the empire before they saw its ruler. The Spanish ambassador Ruy González de Clavijo, who came in 1404, described halls finished in gold and lapis lazuli, and gardens with running water.

It was not time that destroyed the palace. In the 16th century the Bukharan ruler Abdullah Khan II took Shakhrisabz and ordered the Timurid buildings levelled — erasing a rival's memory was a matter of policy. Only the two portal pylons survive: today they reach 38 metres, with more than twenty metres of empty air between them where the arch once closed.

Fragments of tile mosaic remain: white, pale blue and gold on a deep blue ground. From them you can read what the whole palace once looked like.`,
        },
      },
    },

    {
      slug: "dorus-siadat",
      category: "landmark",
      themes: ["history", "islamic", "architecture"],
      lat: 39.0512,
      lon: 66.8339,
      price: PRICE.small,
      visit: 35,
      rating: 4.5,
      pop: 0.7,
      hours: H("08:00", "18:00"),
      qr: "SHZ-02",
      tr: {
        ru: {
          n: "Комплекс Дорус-Сиадат",
          s: "Родовая усыпальница Темуридов и пустая гробница, приготовленная для самого Темура.",
          f: `Дорус-Сиадат — «вместилище власти» — Темур построил в 1380-х годах как родовую усыпальницу.

Первым здесь похоронили Джахангира, старшего и любимого сына Темура, погибшего в 1376 году в двадцать два года. Позже сюда положили и второго сына, Умар-Шейха.

Главное, что здесь есть, — склеп, приготовленный для самого Темура. Небольшая подземная камера, почти целиком занятая нефритовым надгробием, с нишей для чтения Корана. Темур в ней так и не упокоился: он умер зимой 1405 года в Отраре, перевалы засыпало снегом, и тело похоронили в Самарканде, в Гур-Эмире.

Склеп нашли только в 1943 году. Он остаётся пустым — редкий случай, когда можно увидеть замысел, который не осуществился.

Над комплексом возвышается мавзолей Джахангира с коническим шатровым куполом — форма, скорее свойственная Хорезму, чем Мавераннахру.`,
        },
        uz: {
          n: "Dorus Saodat majmuasi",
          s: "Temuriylar xonadon maqbarasi va Temurning o'zi uchun tayyorlangan bo'sh sag'ana.",
          f: `Dorus Saodatni Temur 1380-yillarda xonadon maqbarasi sifatida qurdirgan.

Bu yerga birinchi bo'lib Temurning to'ng'ich va sevimli o'g'li Jahongir dafn etilgan — u 1376 yilda yigirma ikki yoshida vafot etgan.

Eng muhimi — Temurning o'zi uchun tayyorlangan sag'ana. Kichik yerosti xonasi deyarli butunlay nefrit qabrtoshi bilan band. Temur unda dafn etilmagan: 1405 yil qishida O'tRorda vafot etgan va Samarqandda, Go'ri Amirda dafn qilingan.

Sag'ana 1943 yilda topilgan va bo'sh qolgan.`,
        },
        en: {
          n: "Dorus-Siadat Complex",
          s: "The Timurid family tomb, and an empty crypt prepared for Timur himself.",
          f: `Dorus-Siadat — "the seat of power" — was built by Timur in the 1380s as a dynastic mausoleum.

The first buried here was Jahangir, Timur's eldest and favourite son, who died in 1376 at the age of twenty-two. His second son, Umar Shaykh, was later laid here too.

The most striking thing on the site is the crypt prepared for Timur himself: a small underground chamber almost entirely filled by a jade gravestone, with a niche for reading the Quran. Timur never rested in it. He died in the winter of 1405 at Otrar, the mountain passes were snowbound, and he was buried in Samarkand instead, at Gur-e-Amir.

The crypt was found only in 1943. It remains empty — a rare chance to see an intention that was never carried out.

Above the complex rises the mausoleum of Jahangir with a conical tent dome, a form more typical of Khorezm than of Transoxiana.`,
        },
      },
    },

    {
      slug: "kok-gumbaz",
      category: "religious",
      themes: ["islamic", "architecture", "history"],
      lat: 39.0489,
      lon: 66.8317,
      price: PRICE.free,
      visit: 25,
      rating: 4.4,
      pop: 0.6,
      hours: H("07:00", "19:00"),
      qr: "SHZ-03",
      tr: {
        ru: {
          n: "Мечеть Кок-Гумбаз",
          s: "Пятничная мечеть 1435 года, построенная Улугбеком в память об отце.",
          f: `Кок-Гумбаз — «синий купол» — построил в 1435 году Мирзо Улугбек и посвятил её памяти отца, Шахруха.

Мечеть входит в ансамбль Дорут-Тиловат, «дом созерцания», где похоронены духовные наставники рода Темура — шейх Шамсиддин Куляль, учитель отца Темура, и представители рода Гумбази-Сейидан.

Купол диаметром около 46 метров был для своего времени очень крупным. Внутри сохранились фрагменты росписи и резного ганча.

Мечеть действующая, вход свободный. Женщинам нужен платок, обувь снимают при входе.`,
        },
        uz: {
          n: "Ko'k Gumbaz masjidi",
          s: "1435 yilda Ulug'bek otasi xotirasiga qurdirgan juma masjidi.",
          f: `Ko'k Gumbazni 1435 yilda Mirzo Ulug'bek qurdirgan va otasi Shohruh xotirasiga bag'ishlagan.

Masjid Dorut Tilovat majmuasiga kiradi — bu yerda Temur xonadonining ma'naviy ustozlari, jumladan Shayx Shamsiddin Kulol dafn etilgan.

Gumbaz diametri 46 metrga yaqin bo'lib, o'z davri uchun juda yirik hisoblangan. Masjid amalda, kirish bepul.`,
        },
        en: {
          n: "Kok-Gumbaz Mosque",
          s: "A Friday mosque of 1435, built by Ulugh Beg in memory of his father.",
          f: `Kok-Gumbaz — "the blue dome" — was built in 1435 by Mirzo Ulugh Beg and dedicated to the memory of his father, Shahrukh.

The mosque belongs to the Dorut-Tilovat ensemble, "the house of contemplation", where the spiritual mentors of Timur's line are buried — Sheikh Shamsuddin Kulal, teacher of Timur's father, and members of the Gumbazi-Seyidan family.

Its dome, roughly 46 metres across, was very large for its day. Fragments of painting and carved ganch survive inside.

The mosque is in use and entry is free. Women need a headscarf; shoes come off at the door.`,
        },
      },
    },

    {
      slug: "shakhrisabz-chorsu",
      category: "bazaar",
      themes: ["shopping", "crafts", "architecture", "free"],
      lat: 39.0553,
      lon: 66.8328,
      price: PRICE.free,
      visit: 30,
      rating: 4.2,
      pop: 0.45,
      hours: H("08:00", "18:00"),
      tr: {
        ru: {
          n: "Купольный базар Чорсу",
          s: "Торговый купол XVIII века на перекрёстке старых дорог.",
          f: "Шестигранное купольное здание конца XVIII века стоит на перекрёстке торговых путей — отсюда и название «чорсу», четыре воды или четыре дороги. Под куполом торговали тканями и головными уборами. Сейчас здесь работает ремесленная лавка и небольшая экспозиция.",
        },
        uz: {
          n: "Chorsu gumbazli bozori",
          s: "Eski yo'llar chorrahasidagi XVIII asr savdo gumbazi.",
        },
        en: {
          n: "Chorsu Domed Bazaar",
          s: "An 18th-century trading dome at the crossing of the old roads.",
          f: "A hexagonal domed building of the late 18th century stands where the trade routes crossed — hence chorsu, four waters or four roads. Textiles and headwear were sold beneath the dome. A craft shop and a small display occupy it today.",
        },
      },
    },

    {
      slug: "shakhrisabz-amir-timur-park",
      category: "landmark",
      themes: ["history", "family", "free"],
      lat: 39.0602,
      lon: 66.8298,
      price: PRICE.free,
      visit: 20,
      rating: 4.1,
      pop: 0.35,
      hours: ALWAYS,
      tr: {
        ru: {
          n: "Парк и памятник Амиру Темуру",
          s: "Площадь перед Ак-Сараем с памятником и видом на пилоны портала.",
          f: "Парк разбит в 1990-х перед руинами Ак-Сарая. Памятник поставлен так, что Темур смотрит на собственный дворец. Отсюда открывается лучший вид на пилоны — особенно ближе к закату, когда изразцы ловят низкое солнце.",
        },
        uz: {
          n: "Amir Temur bog'i va haykali",
          s: "Oqsaroy oldidagi maydon, haykal va peshtoq manzarasi bilan.",
        },
        en: {
          n: "Amir Timur Park and Monument",
          s: "The square before Ak-Saray, with the monument and a view of the portal pylons.",
          f: "The park was laid out in the 1990s in front of the Ak-Saray ruins. The monument is placed so that Timur faces his own palace. This is the best vantage point for the pylons, particularly towards sunset when the low light catches the tilework.",
        },
      },
    },

    {
      slug: "shakhrisabz-teahouse",
      category: "cafe",
      themes: ["food"],
      lat: 39.0566,
      lon: 66.8312,
      price: 50000,
      visit: 40,
      rating: 4.3,
      pop: 0.3,
      hours: H("09:00", "21:00"),
      tr: {
        ru: { n: "Чайхана «Шахрисабз»", s: "Плов, шурпа и чай в тени чинар недалеко от Ак-Сарая." },
        uz: { n: "«Shahrisabz» choyxonasi", s: "Oqsaroy yaqinida chinorlar soyasida palov va choy." },
        en: { n: "Shakhrisabz Teahouse", s: "Plov, shurpa and tea in the plane-tree shade near Ak-Saray." },
      },
    },
  ],

  tours: [
    {
      slug: "shakhrisabz-half-day",
      mode: "walk",
      sort: 1,
      tr: {
        ru: {
          title: "Шахрисабз за полдня",
          description:
            "Родина Темура целиком обходится пешком: от руин Ак-Сарая через купольный базар к родовой усыпальнице и мечети Кок-Гумбаз.",
        },
        en: {
          title: "Shakhrisabz in half a day",
          description:
            "Timur's birthplace is walkable end to end: from the Ak-Saray ruins via the domed bazaar to the dynastic tomb and the Kok-Gumbaz mosque.",
        },
        uz: {
          title: "Yarim kunda Shahrisabz",
          description:
            "Temur vatanini piyoda aylanish mumkin: Oqsaroy xarobalaridan gumbazli bozor orqali maqbara va Ko'k Gumbazgacha.",
        },
      },
      stops: [
        ["ak-saray", 45],
        ["shakhrisabz-amir-timur-park", 20],
        ["shakhrisabz-chorsu", 30],
        ["dorus-siadat", 35],
        ["kok-gumbaz", 25],
      ],
    },
  ],
};
