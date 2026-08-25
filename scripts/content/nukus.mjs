import { H, ALWAYS, PRICE } from "./_helpers.mjs";

export default {
  slug: "nukus",
  lat: 42.4531,
  lon: 59.6103,
  zoom: 12,
  tr: {
    ru: {
      name: "Нукус и Каракалпакстан",
      description:
        "Столица Каракалпакстана и место, где хранится второе в мире собрание русского авангарда. Вокруг — крепости древнего Хорезма, которым больше двух тысяч лет, и высохшее дно Аральского моря.",
    },
    uz: {
      name: "Nukus va Qoraqalpog'iston",
      description:
        "Qoraqalpog'iston poytaxti va dunyodagi ikkinchi rus avangardi to'plami saqlanadigan joy. Atrofda ikki ming yildan ortiq yoshdagi qadimgi Xorazm qal'alari va qurib qolgan Orol dengizi tubi.",
    },
    en: {
      name: "Nukus and Karakalpakstan",
      description:
        "Capital of Karakalpakstan and home to the world's second-largest collection of Russian avant-garde art. Around it stand the fortresses of ancient Khorezm, more than two thousand years old, and the dried bed of the Aral Sea.",
    },
  },

  pois: [
    {
      slug: "savitsky-museum",
      category: "museum",
      themes: ["museums", "history"],
      lat: 42.4614,
      lon: 59.6169,
      price: PRICE.large,
      visit: 120,
      rating: 4.9,
      pop: 1.0,
      hours: H("09:00", "18:00", [1]),
      qr: "NKS-01",
      museum: [
        {
          number: "401",
          period: "1916 год",
          origin: "Собрание И. В. Савицкого, Нукус",
          tr: {
            ru: {
              n: "«Бык» Василия Лысенко",
              s: "Символ музея: полотно, за которое художник поплатился свободой.",
              f: "Огромный красный бык с горящими глазами написан в 1916 году. В 1930-е картину сочли аллегорией сопротивления, а её автор Василий Лысенко был арестован и исчез в лагерях — о нём почти ничего не известно, кроме этой работы. Савицкий вывез полотно в Нукус, где оно пролежало нетронутым десятилетия. Сегодня «Бык» — визитная карточка музея.",
            },
            en: {
              n: "The Bull by Vasily Lysenko",
              s: "The museum's emblem: a canvas that cost its painter his freedom.",
              f: "A huge red bull with burning eyes, painted in 1916. In the 1930s the picture was read as an allegory of resistance; its author Vasily Lysenko was arrested and vanished into the camps — almost nothing is known of him beyond this work. Savitsky brought the canvas to Nukus, where it lay untouched for decades. The Bull is now the museum's calling card.",
            },
          },
        },
        {
          number: "402",
          period: "IV–III век до н. э.",
          origin: "Городище Топрак-Кала, Хорезм",
          tr: {
            ru: {
              n: "Древнехорезмийская коллекция",
              s: "Находки с городищ Топрак-Кала и Койкрылган-Кала.",
              f: "Отдел древнего искусства собирает материал с хорезмийских городищ: расписную керамику, оссуарии — костехранилища зороастрийцев, терракотовые статуэтки, фрагменты настенных росписей дворца Топрак-Кала. Это одно из немногих мест, где можно увидеть искусство Хорезма до прихода ислама.",
            },
            en: {
              n: "The ancient Khorezm collection",
              s: "Finds from the Toprak-Kala and Koy-Krylgan-Kala settlements.",
              f: "The antiquities department gathers material from the Khorezmian sites: painted ceramics, ossuaries — the bone containers of Zoroastrian burial — terracotta figurines, and fragments of wall painting from the Toprak-Kala palace. It is one of the few places to see the art of Khorezm before Islam.",
            },
          },
        },
        {
          number: "403",
          period: "1920–1930-е годы",
          origin: "Собрание И. В. Савицкого, Нукус",
          tr: {
            ru: {
              n: "Русский авангард",
              s: "Около 15 тысяч работ художников, запрещённых в СССР.",
              f: "Основа собрания — живопись и графика 1920–1930-х годов: Александр Волков, Урал Тансыкбаев, Роберт Фальк, Любовь Попова, Климент Редько. Многие из этих художников были репрессированы, их работы полагалось уничтожить. Савицкий скупал их у вдов и наследников — иногда за собственные деньги, иногда обещая заплатить позже, — и увозил в Нукус, за две тысячи километров от Москвы. Расчёт был точен: до окраины пустыни проверяющие не доезжали.",
            },
            en: {
              n: "The Russian avant-garde",
              s: "Some 15,000 works by artists banned in the USSR.",
              f: "The core of the collection is painting and graphics of the 1920s and 1930s: Alexander Volkov, Ural Tansykbaev, Robert Falk, Lyubov Popova, Kliment Redko. Many of these artists were repressed and their work was meant to be destroyed. Savitsky bought it from widows and heirs — sometimes with his own money, sometimes on a promise to pay later — and carried it to Nukus, two thousand kilometres from Moscow. The calculation was sound: inspectors did not travel to the edge of the desert.",
            },
          },
        },
      ],
      tr: {
        ru: {
          n: "Музей имени И. В. Савицкого",
          s: "Второе в мире собрание русского авангарда — в городе на краю пустыни.",
          f: `Государственный музей искусств Каракалпакстана называют «Лувром в песках», и это редкий случай, когда прозвище не преувеличение.

Игорь Савицкий приехал в Каракалпакию в 1950 году художником археологической экспедиции и остался. Сначала он собирал каракалпакское прикладное искусство — ковры, украшения, юрточные детали, — которое в те годы просто выбрасывали как пережиток.

Потом началось главное. Савицкий стал скупать живопись 1920–1930-х годов: работы художников, объявленных формалистами, запрещённых, репрессированных, забытых. Их полотна лежали у вдов на антресолях и подлежали уничтожению. Он вывозил их в Нукус — за две тысячи километров от Москвы, в столицу автономной республики на краю пустыни, куда проверяющие не доезжали.

К моменту его смерти в 1984 году собрание насчитывало около 90 тысяч предметов. Сегодня это второе в мире по объёму собрание русского авангарда после Русского музея.

На осмотр закладывайте не меньше двух часов. Понедельник — выходной. Фотосъёмка платная, в некоторых залах запрещена.`,
        },
        uz: {
          n: "I. V. Savitskiy nomidagi muzey",
          s: "Cho'l chekkasidagi shaharda — dunyodagi ikkinchi rus avangardi to'plami.",
          f: `Qoraqalpog'iston davlat san'at muzeyini «qumdagi Luvr» deb atashadi.

Igor Savitskiy 1950 yilda arxeologik ekspeditsiya rassomi sifatida kelgan va shu yerda qolgan. Avval qoraqalpoq amaliy san'atini — gilamlar, taqinchoqlar, o'tov qismlarini yig'gan.

So'ng asosiysi boshlangan: u 1920–1930-yillar rangtasvirini sotib ola boshladi — taqiqlangan, qatag'on qilingan, unutilgan rassomlar asarlarini. U ularni Nukusga, Moskvadan ikki ming kilometr uzoqlikka olib kelgan.

1984 yilda vafot etganida to'plam 90 mingga yaqin buyumdan iborat edi.

Ko'rish uchun kamida ikki soat ajrating. Dushanba — dam olish kuni.`,
        },
        en: {
          n: "Savitsky Museum",
          s: "The world's second-largest Russian avant-garde collection, in a town at the desert's edge.",
          f: `The Karakalpakstan State Museum of Arts is called "the Louvre in the sands", and for once the nickname is not an exaggeration.

Igor Savitsky came to Karakalpakia in 1950 as the artist of an archaeological expedition, and stayed. At first he collected Karakalpak applied art — carpets, jewellery, yurt fittings — which in those years was simply thrown away as a relic.

Then came the real work. Savitsky began buying painting of the 1920s and 1930s: work by artists declared formalists, banned, repressed, forgotten. Their canvases lay in widows' attics and were slated for destruction. He carried them to Nukus — two thousand kilometres from Moscow, to the capital of an autonomous republic on the edge of the desert, where inspectors did not travel.

By his death in 1984 the collection numbered some 90,000 items. It is today the second-largest holding of Russian avant-garde art in the world, after the Russian Museum.

Allow at least two hours. Closed Mondays. Photography is charged, and forbidden in some halls.`,
        },
      },
    },

    {
      slug: "mizdakhan",
      category: "landmark",
      themes: ["history", "islamic", "free"],
      lat: 42.4139,
      lon: 59.4553,
      price: PRICE.free,
      visit: 60,
      rating: 4.6,
      pop: 0.6,
      hours: H("07:00", "19:00"),
      qr: "NKS-02",
      tr: {
        ru: {
          n: "Некрополь Миздакхан",
          s: "Город мёртвых на трёх холмах: захоронения от IV века до н. э. до наших дней.",
          f: `Миздакхан — один из крупнейших некрополей Средней Азии. Он раскинулся на трёх холмах в 20 километрах от Нукуса и хоронить здесь начали ещё в зороастрийское время, около IV века до нашей эры.

Здесь всё смешано. Зороастрийские оссуарии соседствуют с мусульманскими мавзолеями, среди них — Мазлумхан-Слу, наполовину подземный мавзолей XIV века с изразцовым порталом, куда спускаются по лестнице.

Главная местная легенда связана с постройкой Эрназар-Алакоз: считается, что каждый год от неё осыпается один кирпич, и когда упадёт последний, наступит конец света. Паломники складывают из семи камешков пирамидки и загадывают желание.

Рядом — руины крепости Гяур-Кала IV века до нашей эры, с оплывшими глинобитными стенами.

Место действующее: сюда приезжают хоронить и поминать. Ведите себя соответственно.`,
        },
        uz: {
          n: "Mizdaxkan nekropoli",
          s: "Uchta tepalikdagi o'liklar shahri: eramizdan avvalgi IV asrdan bugungacha.",
          f: `Mizdaxkan — Markaziy Osiyodagi eng yirik nekropollardan biri. Nukusdan 20 kilometr uzoqlikda uchta tepalikka yoyilgan, dafn etish zardushtiylik davridan boshlangan.

Bu yerda hammasi aralash: zardushtiy ossuariylar musulmon maqbaralari bilan yonma-yon. Ular orasida Mazlumxon Sulu — XIV asrga oid yarim yerosti maqbara.

Mashhur rivoyat Ernazar Alakoz inshootiga bog'liq: har yili undan bitta g'isht tushadi, oxirgisi tushganda dunyo tugaydi. Ziyoratchilar yettita toshdan piramida yasab, tilak tilaydilar.

Bu amaldagi ziyoratgoh — o'zingizni tegishlicha tuting.`,
        },
        en: {
          n: "Mizdakhan Necropolis",
          s: "A city of the dead on three hills: burials from the 4th century BCE to the present.",
          f: `Mizdakhan is one of the largest necropolises in Central Asia. It spreads over three hills some 20 kilometres from Nukus, and burial began here in Zoroastrian times, around the 4th century BCE.

Everything is mixed together. Zoroastrian ossuaries stand beside Muslim mausoleums, among them Mazlumkhan-Slu, a half-underground 14th-century tomb with a tiled portal, reached down a stair.

The local legend attaches to the Ernazar-Alakoz structure: one brick is said to fall from it each year, and when the last one falls the world will end. Pilgrims build small pyramids of seven pebbles and make a wish.

Nearby are the ruins of the Gyaur-Kala fortress of the 4th century BCE, its mud-brick walls slumped with age.

The site is in use — people still come to bury and to remember. Behave accordingly.`,
        },
      },
    },

    {
      slug: "ayaz-kala",
      category: "landmark",
      themes: ["history", "nature", "architecture"],
      lat: 41.9317,
      lon: 61.0281,
      price: PRICE.small,
      visit: 70,
      rating: 4.7,
      pop: 0.65,
      hours: ALWAYS,
      qr: "NKS-03",
      tr: {
        ru: {
          n: "Крепость Аяз-Кала",
          s: "Три крепости IV века до н. э. на холмах над пустыней Кызылкум.",
          f: `Аяз-Кала — комплекс из трёх крепостей на границе Кызылкума, часть системы укреплений древнего Хорезма.

Самая ранняя, Аяз-Кала I, построена в IV–III веках до нашей эры и стоит на вершине холма высотой около 60 метров. Стены из сырцового кирпича сохранились на высоту до 10 метров; в них — стрелковые галереи с бойницами, устроенные так, что лучники били вдоль стены, а не только вперёд.

Крепость никогда не была городом: это гарнизонное укрепление, куда окрестное население уходило при набеге кочевников.

Аяз-Кала II — небольшая, овальная, на отдельном холме. Аяз-Кала III — самая крупная по площади, но ниже.

Подъём на первую крепость занимает минут пятнадцать по тропе. Сверху видно на десятки километров: пустыня, солончаки и озеро Аязкуль. Лучшее время — раннее утро или закат, днём тени нет совсем.

Рядом работает юрточный лагерь — здесь принято ночевать, чтобы увидеть рассвет над крепостью.`,
        },
        uz: {
          n: "Ayozqal'a",
          s: "Qizilqum ustidagi tepaliklarda eramizdan avvalgi IV asrga oid uchta qal'a.",
          f: `Ayozqal'a — Qizilqum chegarasidagi uchta qal'adan iborat majmua, qadimgi Xorazm mudofaa tizimining bir qismi.

Eng qadimgisi — Ayozqal'a I eramizdan avvalgi IV–III asrlarda qurilgan va balandligi 60 metrga yaqin tepalik ustida turadi. Paxsa devorlar 10 metr balandlikkacha saqlangan.

Qal'a hech qachon shahar bo'lmagan: bu ko'chmanchilar bosqinida aholi panoh topadigan harbiy istehkom edi.

Birinchi qal'aga chiqish taxminan o'n besh daqiqa. Tepadan o'nlab kilometr masofa ko'rinadi. Eng yaxshi vaqt — erta tong yoki quyosh botishi.

Yonida o'tov lageri ishlaydi.`,
        },
        en: {
          n: "Ayaz-Kala Fortress",
          s: "Three fortresses of the 4th century BCE on hills above the Kyzylkum desert.",
          f: `Ayaz-Kala is a group of three fortresses on the edge of the Kyzylkum, part of the defensive system of ancient Khorezm.

The earliest, Ayaz-Kala I, was built in the 4th–3rd centuries BCE and crowns a hill about 60 metres high. Its mud-brick walls survive to 10 metres, pierced by archery galleries arranged so that bowmen could shoot along the wall, not only outward.

The fortress was never a town: it was a garrison refuge where the surrounding population sheltered during nomad raids.

Ayaz-Kala II is smaller and oval, on its own hill. Ayaz-Kala III covers the largest area but sits lower.

The climb to the first fortress takes about fifteen minutes on a path. From the top you can see for tens of kilometres: desert, salt flats and Lake Ayazkul. Come early or late — there is no shade at all in the middle of the day.

A yurt camp works nearby; staying the night to catch sunrise over the fortress is the usual thing to do.`,
        },
      },
    },

    {
      slug: "toprak-kala",
      category: "landmark",
      themes: ["history", "architecture"],
      lat: 41.9269,
      lon: 60.8236,
      price: PRICE.small,
      visit: 45,
      rating: 4.4,
      pop: 0.45,
      hours: ALWAYS,
      tr: {
        ru: {
          n: "Городище Топрак-Кала",
          s: "Столица Хорезма I–III веков с трёхбашенным дворцом царей.",
          f: `Топрак-Кала — «глиняная крепость» — была столицей Хорезма в первые века нашей эры. Город стоял по строгой прямоугольной сетке: улицы под прямым углом, кварталы одинакового размера — редкий для региона пример регулярной планировки.

В северо-западном углу возвышался дворец на трёхбашенном основании высотой около 25 метров. При раскопках 1938–1950 годов там нашли «Зал царей» со скульптурными портретами правителей, «Зал воинов», «Зал оленей» — и архив документов на коже и дереве, написанных хорезмийским письмом.

Сегодня видны оплывшие стены и башни. Чтобы понять, что здесь было, стоит сначала зайти в музей Савицкого: находки и реконструкции хранятся там.`,
        },
        uz: {
          n: "Tuproqqal'a shahristoni",
          s: "I–III asrlar Xorazm poytaxti, uch minorali shohlar saroyi bilan.",
          f: "Tuproqqal'a eramizning dastlabki asrlarida Xorazm poytaxti bo'lgan. Shahar qat'iy to'g'ri burchakli reja bo'yicha qurilgan. Shimoli-g'arbiy burchakda balandligi 25 metrga yaqin uch minorali asosdagi saroy turgan. 1938–1950 yillardagi qazishmalarda «Shohlar zali» va xorazmiy yozuvidagi hujjatlar arxivi topilgan.",
        },
        en: {
          n: "Toprak-Kala",
          s: "Capital of Khorezm in the 1st–3rd centuries, with a palace on three towers.",
          f: `Toprak-Kala — "the clay fortress" — was the capital of Khorezm in the early centuries CE. The town followed a strict rectangular grid: streets at right angles, blocks of equal size — a rare example of regular planning in the region.

In the north-west corner rose a palace on a three-towered platform some 25 metres high. Excavations between 1938 and 1950 found there a "Hall of Kings" with sculpted portraits of rulers, a "Hall of Warriors", a "Hall of Deer" — and an archive of documents on leather and wood written in the Khorezmian script.

Today you see slumped walls and towers. To understand what stood here, visit the Savitsky Museum first: the finds and reconstructions are kept there.`,
        },
      },
    },

    {
      slug: "chilpyk",
      category: "landmark",
      themes: ["history", "nature"],
      lat: 42.2350,
      lon: 59.9333,
      price: PRICE.free,
      visit: 40,
      rating: 4.5,
      pop: 0.4,
      hours: ALWAYS,
      tr: {
        ru: {
          n: "Башня молчания Чильпык",
          s: "Зороастрийская дакма I века на холме над Амударьёй.",
          f: `Чильпык — дакма, «башня молчания». Круглое сооружение диаметром около 65 метров стоит на конусообразном холме высотой 40 метров над долиной Амударьи.

Зороастрийцы считали землю, огонь и воду священными и не могли осквернять их мёртвым телом. Умерших оставляли внутри такой башни, под открытым небом: птицы очищали кости, которые затем собирали в оссуарии — глиняные ящики — и помещали в семейные склепы. Именно такие оссуарии выставлены в музее Савицкого.

Дакма построена в I веке до нашей эры — I веке нашей эры и использовалась несколько столетий, а позже, уже в мусульманское время, служила сигнальной башней.

Подъём крутой, минут десять. Сверху видна излучина Амударьи — одна из лучших панорам в Каракалпакстане.`,
        },
        uz: {
          n: "Chilpiq daxmasi",
          s: "Amudaryo ustidagi tepalikda I asrga oid zardushtiylik daxmasi.",
          f: `Chilpiq — daxma, «sukunat minorasi». Diametri 65 metrga yaqin doiraviy inshoot Amudaryo vodiysi ustida 40 metrlik tepalikda turadi.

Zardushtiylar yer, olov va suvni muqaddas deb bilgan va ularni jasad bilan bulg'ay olmagan. Marhumlar shunday minora ichida ochiq osmon ostida qoldirilgan; suyaklar keyin ossuariylarga yig'ilgan.

Daxma eramizdan avvalgi I — eramizning I asrida qurilgan. Chiqish tik, o'n daqiqacha. Tepadan Amudaryo manzarasi ochiladi.`,
        },
        en: {
          n: "Chilpyk Tower of Silence",
          s: "A 1st-century Zoroastrian dakhma on a hill above the Amu Darya.",
          f: `Chilpyk is a dakhma, a "tower of silence". The circular structure, some 65 metres across, stands on a conical hill 40 metres above the Amu Darya valley.

Zoroastrians held earth, fire and water sacred and could not defile them with a corpse. The dead were left inside such a tower under the open sky; birds cleaned the bones, which were then gathered into ossuaries — clay boxes — and placed in family vaults. Those ossuaries are on display in the Savitsky Museum.

The dakhma was built between the 1st century BCE and the 1st century CE and served for several centuries; later, in Islamic times, it worked as a signal tower.

The climb is steep, about ten minutes. From the top you see the bend of the Amu Darya — one of the finest panoramas in Karakalpakstan.`,
        },
      },
    },

    {
      slug: "moynaq-ship-cemetery",
      category: "landmark",
      themes: ["history", "nature"],
      lat: 43.7683,
      lon: 59.0292,
      price: PRICE.free,
      visit: 60,
      rating: 4.6,
      pop: 0.55,
      hours: ALWAYS,
      qr: "NKS-04",
      tr: {
        ru: {
          n: "Кладбище кораблей в Муйнаке",
          s: "Ржавые сейнеры на песке там, где полвека назад было Аральское море.",
          f: `Муйнак был портом. В 1960-е здесь работал рыбоконсервный комбинат, в море выходили сотни судов, а население города превышало сорок тысяч человек.

Потом воду Амударьи и Сырдарьи забрали на хлопковые поля. Море начало отступать — сначала на километры, потом на десятки километров. Сегодня берег Аральского моря находится более чем в ста километрах отсюда, а на бывшем дне лежит солончак.

На песке в бывшей гавани стоят несколько десятков рыболовных судов — их оставили там, где они последний раз сели на грунт. Рядом открыт музей, где собраны фотографии города, когда он ещё был портом.

Это не памятник архитектуры. Это самая наглядная в мире иллюстрация того, что происходит, когда реку разбирают на орошение — и поэтому сюда едут исследователи и журналисты со всего света.

Дорога от Нукуса занимает около трёх часов в одну сторону.`,
        },
        uz: {
          n: "Mo'ynoqdagi kemalar qabristoni",
          s: "Yarim asr avval Orol dengizi bo'lgan joyda qumdagi zanglagan kemalar.",
          f: `Mo'ynoq port bo'lgan. 1960-yillarda bu yerda baliq konserva zavodi ishlagan, dengizga yuzlab kema chiqqan, shahar aholisi qirq mingdan oshgan.

So'ng Amudaryo va Sirdaryo suvi paxta dalalariga olingan. Dengiz chekina boshlagan. Bugun Orol qirg'og'i yuz kilometrdan uzoqda, sobiq tubda esa sho'rxok yotibdi.

Sobiq bandargohdagi qumda o'nlab baliqchi kemalari turibdi. Yonida muzey ochilgan.

Nukusdan yo'l bir tomonga uch soatcha.`,
        },
        en: {
          n: "Moynaq Ship Cemetery",
          s: "Rusting trawlers on sand where the Aral Sea stood half a century ago.",
          f: `Moynaq was a port. In the 1960s a fish cannery worked here, hundreds of boats put out to sea, and the town held more than forty thousand people.

Then the water of the Amu Darya and Syr Darya was taken for cotton fields. The sea began to retreat — first by kilometres, then by tens of kilometres. Today the shore of the Aral lies more than a hundred kilometres away, and salt flats cover the former seabed.

Several dozen fishing vessels stand on the sand of the old harbour, left where they last grounded. A museum alongside gathers photographs of the town from when it was still a port.

This is not an architectural monument. It is the world's clearest illustration of what happens when a river is drawn off for irrigation — which is why researchers and journalists come here from everywhere.

The drive from Nukus takes about three hours each way.`,
        },
      },
    },

    {
      slug: "nukus-bazaar",
      category: "bazaar",
      themes: ["shopping", "food", "free"],
      lat: 42.4567,
      lon: 59.6089,
      price: PRICE.free,
      visit: 40,
      rating: 4.1,
      pop: 0.3,
      hours: H("07:00", "18:00"),
      tr: {
        ru: {
          n: "Центральный базар Нукуса",
          s: "Каракалпакские ковры, сушёная рыба и местные сладости.",
        },
        uz: { n: "Nukus markaziy bozori", s: "Qoraqalpoq gilamlari, quritilgan baliq va shirinliklar." },
        en: {
          n: "Nukus Central Bazaar",
          s: "Karakalpak carpets, dried fish and local sweets.",
        },
      },
    },

    {
      slug: "nukus-restaurant",
      category: "restaurant",
      themes: ["food"],
      lat: 42.4598,
      lon: 59.6142,
      price: 70000,
      visit: 60,
      rating: 4.2,
      pop: 0.28,
      hours: H("10:00", "22:00"),
      tr: {
        ru: {
          n: "Ресторан «Каракалпакстан»",
          s: "Местная кухня: бесбармак, шивит-оши, рыба из Амударьи.",
        },
        uz: { n: "«Qoraqalpog'iston» restorani", s: "Mahalliy taomlar: beshbarmoq, shivit oshi, baliq." },
        en: {
          n: "Karakalpakstan Restaurant",
          s: "Local cooking: beshbarmak, shivit oshi, fish from the Amu Darya.",
        },
      },
    },

    {
      slug: "nukus-airport",
      category: "airport",
      themes: [],
      lat: 42.4884,
      lon: 59.6233,
      price: PRICE.free,
      visit: 15,
      rating: 3.8,
      pop: 0.25,
      hours: ALWAYS,
      tr: {
        ru: {
          n: "Аэропорт Нукуса",
          s: "Рейсы в Ташкент. Самый быстрый способ добраться — лететь, дорога занимает сутки.",
        },
        uz: { n: "Nukus aeroporti", s: "Toshkentga reyslar. Eng tez yo'l — samolyot." },
        en: {
          n: "Nukus Airport",
          s: "Flights to Tashkent. Flying is the practical option: the drive takes a full day.",
        },
      },
    },
  ],

  tours: [
    {
      slug: "nukus-fortresses",
      mode: "car",
      sort: 1,
      tr: {
        ru: {
          title: "Крепости древнего Хорезма",
          description:
            "Однодневная поездка на машине по укреплениям, которым больше двух тысяч лет: Аяз-Кала, Топрак-Кала и зороастрийская башня молчания Чильпык. Между объектами — пустыня, воду и головной убор берите с собой.",
        },
        en: {
          title: "Fortresses of ancient Khorezm",
          description:
            "A day by car among fortifications more than two thousand years old: Ayaz-Kala, Toprak-Kala and the Zoroastrian tower of silence at Chilpyk. Desert lies between them — bring water and cover your head.",
        },
        uz: {
          title: "Qadimgi Xorazm qal'alari",
          description:
            "Ikki ming yildan ortiq yoshdagi istehkomlar bo'ylab bir kunlik avtomobil sayohati: Ayozqal'a, Tuproqqal'a va Chilpiq daxmasi.",
        },
      },
      stops: [
        ["chilpyk", 40],
        ["toprak-kala", 45],
        ["ayaz-kala", 70],
      ],
    },
    {
      slug: "nukus-city-day",
      mode: "taxi",
      sort: 2,
      tr: {
        ru: {
          title: "Нукус за один день",
          description:
            "Музей Савицкого, некрополь Миздакхан и базар. На музей закладывайте не меньше двух часов — это главное, ради чего сюда едут.",
        },
        en: {
          title: "Nukus in one day",
          description:
            "The Savitsky Museum, the Mizdakhan necropolis and the bazaar. Allow at least two hours for the museum — it is what people come for.",
        },
        uz: {
          title: "Bir kunda Nukus",
          description: "Savitskiy muzeyi, Mizdaxkan nekropoli va bozor.",
        },
      },
      stops: [
        ["savitsky-museum", 120],
        ["nukus-bazaar", 40],
        ["mizdakhan", 60],
      ],
    },
  ],
};
