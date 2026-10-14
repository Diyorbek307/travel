/**
 * Подробные рассказы о местах Самарканда (data/samarkand-stories.ts) на
 * английском и узбекском. Порядок — как у разделов в русском рассказе:
 * i-й перевод — i-й раздел. Остальные языки получают английский (см.
 * переведиКонтент), пока автоперевод в панели их не заполнит.
 */
export const ЗАГОЛОВКИ_РАССКАЗА: Record<string, { en: string; uz: string }> = {
  История: { en: "History", uz: "Tarix" },
  "Архитектура и убранство": { en: "Architecture and decoration", uz: "Meʼmorchilik va bezaklar" },
  "Что посмотреть": { en: "What to see", uz: "Nimani koʻrish kerak" },
  "Легенды и предания": { en: "Legends and tales", uz: "Afsona va rivoyatlar" },
  "Интересные факты": { en: "Interesting facts", uz: "Qiziqarli faktlar" },
  Советы: { en: "Tips", uz: "Maslahatlar" },
};

export const РАССКАЗЫ_ПЕРЕВОД: Record<string, { en: string[]; uz: string[] }> = {
  reg: {
    en: [
      "In Persian, “registan” means “sandy place”. That was the name of Samarkand's main square, where six large streets met, the bazaar bustled, rulers' decrees were read out and executions were held. The square began to take its present shape under Amir Timur's grandson Mirzo Ulugh Beg: in 1417–1420 he built a madrasa here, with a khanaka and a caravanserai next to it.\n\nIn the 17th century the ruler of Samarkand, Yalangtush Bahadur, pulled down Ulugh Beg's decaying buildings and put up a mirror image of his madrasa opposite it — Sher-Dor (1619–1636) — and between them the Tilla-Kori madrasa (1646–1660), which became the city's main Friday mosque. This is how the ensemble of three portals took shape, today regarded as the symbol of Uzbekistan.",
      "The Ulugh Beg Madrasa is the oldest of the three. Its portal is decorated with star patterns: Ulugh Beg himself was an astronomer and, according to tradition, taught mathematics and astronomy here. It was one of the best universities of the 15th-century Islamic world.\n\nSher-Dor means “having tigers”. Its portal shows tigers chasing does, with a sun with a human face rising behind their backs. Depicting living creatures on mosques and madrasas was not customary, so the Sher-Dor mosaic is a rarity.\n\nTilla-Kori means “gilded”. Inside its mosque the walls and the dome are painted in gold using the kundal technique: a relief pattern is covered with gold leaf. From inside the dome looks high, although in fact it is flat — an optical illusion created by the painting.",
      "Step into the courtyards of all three madrasas: the former students' cells now house workshops and shops selling suzani, ceramics, knives, miniatures and musical instruments.\n\nIn Tilla-Kori, be sure to look up inside the mosque — the golden dome and the mihrab look best in the morning light. One of the halls shows photographs of the square before restoration, which make an interesting comparison.\n\nNotice the minarets of the Ulugh Beg Madrasa: one of them tilted badly over the centuries, and in 1932 it was straightened following a design by the engineer Vladimir Shukhov. In the evening the square is lit up, and on holidays it hosts concerts and light shows.",
      "People say that with the tigers of Sher-Dor, Yalangtush wanted to show his power and was not afraid to break the ban on depicting living beings. According to one legend, the master who made the mosaic paid for his daring. Historians consider this a tale, and the sun with a face an ancient image going back to pre-Islamic times.\n\nIt is also said that Ulugh Beg chose the best students for his madrasa himself and examined them in astronomy.",
      "Together with the city's other monuments, the Registan is part of the UNESCO World Heritage site “Samarkand – Crossroad of Cultures” (2001).\n\nSince 1997 the square has hosted the international music festival “Sharq Taronalari” (“Melodies of the East”).\n\nThe gold of Tilla-Kori took several years to restore: restorers covered the patterns anew with the thinnest sheets of gold leaf.",
      "Entry to the madrasa courtyards is by ticket; the ticket office is by the square. Come at opening time, when there are few people and the light is soft, and return in the evening to see the illumination — you can watch it for free from the edge of the square.\n\nDress modestly in the Tilla-Kori mosque. Bargaining is normal in the shops. Allow 1–2 hours for the Registan, then walk along the pedestrian Tashkent Street to Bibi-Khanym and the Siab Bazaar.",
    ],
    uz: [
      "Fors tilida “registon” — “qumloq joy” degani. Samarqandning bosh maydoni shunday atalgan: bu yerda oltita katta koʻcha tutashgan, bozor gavjum boʻlgan, hukmdorlarning farmonlari oʻqilgan va jazolar ijro etilgan. Maydon hozirgi qiyofasini Amir Temurning nabirasi Mirzo Ulugʻbek davrida ola boshlagan: u 1417–1420-yillarda bu yerda madrasa, yonida esa xonaqoh va karvonsaroy qurdirgan.\n\nXVII asrda Samarqand hokimi Yalangtoʻsh Bahodir Ulugʻbekning eskirgan binolarini buzdirib, uning madrasasi qarshisida unga oʻxshash Sherdor madrasasini (1619–1636), ular oʻrtasida esa shaharning bosh juma masjidiga aylangan Tillakori madrasasini (1646–1660) qurdirdi. Shu tariqa bugun Oʻzbekistonning ramzi sanaladigan uch peshtoqli ansambl shakllandi.",
      "Ulugʻbek madrasasi — uchalasining eng qadimgisi. Uning peshtoqi yulduzsimon naqshlar bilan bezatilgan: Ulugʻbekning oʻzi astronom boʻlgan va rivoyatlarga koʻra, bu yerda matematika va ilmi nujumdan dars bergan. Bu XV asr islom olamidagi eng yaxshi oliy oʻquv yurtlaridan biri edi.\n\nSherdor — “sherlari bor” degani. Uning peshtoqida ohularni quvayotgan yoʻlbarslar, ularning ortidan esa odam yuzli quyosh koʻtarilayotgani tasvirlangan. Masjid va madrasalarda jonzotlarni tasvirlash odat boʻlmagan, shuning uchun Sherdor koshinlari — noyob hodisa.\n\nTillakori — “oltin bilan qoplangan”. Uning masjidi ichida devor va gumbaz kundal uslubida oltin bilan bezatilgan: boʻrtma naqsh varaqa oltin bilan qoplanadi. Gumbaz ichkaridan baland koʻrinadi, aslida esa u yassi — bu naqsh yaratgan koʻz aldovi.",
      "Uchala madrasaning hovlisiga kiring: talabalarning sobiq hujralarida endi ustaxona va doʻkonlar joylashgan — soʻzana, sopol buyumlar, pichoqlar, miniatyuralar, musiqa asboblari.\n\nTillakorida masjid ichida albatta boshingizni koʻtaring — oltin gumbaz va mehrob ertalabki yorugʻda ayniqsa goʻzal. Zallardan birida maydonning taʼmirdan oldingi suratlari koʻrsatiladi — solishtirish qiziq.\n\nUlugʻbek madrasasining minoralariga eʼtibor bering: ulardan biri asrlar davomida ancha qiyshaygan va 1932-yilda muhandis Vladimir Shuxov loyihasi asosida toʻgʻrilangan. Kechqurun maydon yoritiladi, bayramlarda bu yerda konsertlar va yorugʻlik shoulari boʻladi.",
      "Sherdor yoʻlbarslari haqida aytishlaricha, Yalangtoʻsh oʻz qudratini koʻrsatmoqchi boʻlgan va jonzotlarni tasvirlash taqiqini buzishdan qoʻrqmagan. Bir afsonaga koʻra, koshinni yasagan usta bu jurʼati uchun jazolangan. Tarixchilar buni rivoyat deb hisoblaydi, odam yuzli quyoshni esa islomdan oldingi davrlarga borib taqaladigan qadimiy timsol deb biladi.\n\nShuningdek, Ulugʻbek oʻz madrasasiga eng yaxshi talabalarni oʻzi tanlagan va ulardan ilmi nujum boʻyicha imtihon olgan, deyishadi.",
      "Registon shaharning boshqa yodgorliklari bilan birga YuNESKOning “Samarqand — madaniyatlar chorrahasi” Jahon merosi obyektiga kiradi (2001).\n\n1997-yildan beri maydonda “Sharq taronalari” xalqaro musiqa festivali oʻtkaziladi.\n\nTillakori oltinini tiklash bir necha yil davom etgan: taʼmirchilar naqshlarni eng yupqa varaqa oltin bilan qaytadan qoplashgan.",
      "Madrasalar hovlisiga kirish — chipta bilan, kassa maydon yonida. Odam kam va yorugʻlik yumshoq boʻlgan ochilish vaqtida keling, kechqurun esa yoritishni koʻrish uchun qayting — uni maydon chetidan bepul tomosha qilish mumkin.\n\nTillakori masjidida kamtarona kiyining. Doʻkonlarda savdolashish odatiy hol. Registonni 1–2 soatda aylanib chiqish qulay, keyin piyodalar koʻchasi boʻylab Bibixonim va Siyob bozoriga boring.",
    ],
  },

  shah: {
    en: [
      "Shah-i-Zinda means “the Living King”. This is what people call Qusam ibn Abbas, a cousin of the Prophet Muhammad, who according to tradition came to Sogdiana in the 7th century to preach Islam and died here. His grave became a shrine, and noble people began to be buried around it on the slope of ancient Afrasiab.\n\nMausoleums of the 11th–12th centuries already stood here before the Mongol invasion. But most of what we see today was built under Amir Timur and Ulugh Beg in the 14th–15th centuries: the tombs of Timur's sisters, wives, nieces and commanders. In 1434–1435 Ulugh Beg added a grand entrance portal. Over several centuries a “street” of some twenty mausoleums took shape.",
      "Shah-i-Zinda holds the finest collection of tilework in Central Asia. Almost every mausoleum has its own facing: carved glazed terracotta, mosaic, painted majolica, glazes in every shade of turquoise and blue. The craftsmen competed with each other, which is why neighbouring portals look so different.\n\nTake a close look at the mausoleum of Shadi Mulk Aka (1372), Timur's niece: its carved terracotta is considered among the finest. Next to it is the mausoleum of Timur's sister Shirin Bika Aka (1385), with mosaic inside. The octagonal double-domed mausoleum in the middle of the street is associated with the astronomer Qazi-zade Rumi, Ulugh Beg's teacher.",
      "The ensemble has three parts: the lower one with the entrance portal and the staircase, the middle one with the most ornate mausoleums, and the upper one with the oldest part at the grave of Qusam ibn Abbas. A carved wooden door and a tiled tombstone survive there.\n\nTake your time: look inside every mausoleum, study the domes and patterns up close. At the far end you will see the old cemetery and Afrasiab — it is a working cemetery, so keep your voice down.",
      "Tradition says that Qusam ibn Abbas was beheaded while praying but did not die: he picked up his head and went down into a well, into an underground garden, where he lives to this day. That is why he is called the Living King.\n\nA second legend concerns the staircase at the entrance. People say you should count its steps on the way up and on the way down: if the numbers match, your heart is pure, and if not, you should come again.",
      "The ensemble contains more than twenty buildings from the 11th–19th centuries, and almost all of them date from different times.\n\nMany of the mausoleums were built for women of Timur's family — a rarity in medieval architecture.\n\nIn the 2000s the ensemble was heavily restored; some specialists argued that the tilework had been renewed too much. That is why the genuine old tiles are especially precious — you can tell them by their soft, slightly faded colour.",
      "The best light is in the morning: the sun lights up the portals and there are still few people. This is a place of worship: dress modestly, women may want a headscarf, keep quiet inside the mausoleums and don't photograph people at prayer.\n\nEntry is paid. The Siab Bazaar and the Bibi-Khanym Mosque are close by — easy to combine in one walk.",
    ],
    uz: [
      "Shohi Zinda — “Tirik shoh” degani. Paygʻambar Muhammadning amakivachchasi Qusam ibn Abbosni shunday atashadi: rivoyatlarga koʻra, u VII asrda Soʻgʻdga islomni targʻib qilish uchun kelgan va shu yerda halok boʻlgan. Uning qabri ziyoratgohga aylangan va qadimgi Afrosiyob yonbagʻrida uning atrofiga zodagonlarni dafn eta boshlashgan.\n\nMoʻgʻullar bosqinidan oldin bu yerda XI–XII asrlarga oid maqbaralar bor edi. Ammo bugun koʻrayotganimizning asosiy qismi Amir Temur va Ulugʻbek davrida, XIV–XV asrlarda qurilgan: Temurning opa-singillari, xotinlari, jiyanlari va sarkardalari maqbaralari. Ulugʻbek 1434–1435-yillarda kirish joyiga hashamatli peshtoq qurdirgan. Shu tariqa bir necha asr davomida yigirmaga yaqin maqbaradan iborat “koʻcha” shakllangan.",
      "Shohi Zinda — Markaziy Osiyodagi eng yaxshi koshinlar toʻplami. Deyarli har bir maqbaraning oʻz qoplamasi bor: oʻymakor sirlangan terrakota, mozaika, naqshli mayolika, firuza va koʻkning barcha tuslaridagi sir. Ustalar oʻzaro bellashgan, shuning uchun qoʻshni peshtoqlar bir-biriga umuman oʻxshamaydi.\n\nTemurning jiyani Shodi Mulk oqo maqbarasiga (1372) diqqat bilan qarang: uning oʻymakor terrakotasi eng nafislaridan sanaladi. Yonida — Temurning singlisi Shirinbeka oqo maqbarasi (1385), ichkarisi mozaika bilan bezatilgan. Koʻchaning oʻrtasidagi sakkiz qirrali, ikki gumbazli maqbara Ulugʻbekning ustozi, astronom Qozizoda Rumiy nomi bilan bogʻlanadi.",
      "Ansambl uch qismga boʻlinadi: kirish peshtoqi va zinapoyali pastki qism, eng bezakli maqbaralar joylashgan oʻrta qism va Qusam ibn Abbos qabri yonidagi eng qadimiy yuqori qism. U yerda oʻymakor yogʻoch eshik va koshinli qabr toshi saqlanib qolgan.\n\nShoshilmang: har bir maqbaraning ichiga kiring, gumbaz va naqshlarni yaqindan koʻring. Ansambl oxirida eski qabriston va Afrosiyob manzarasi ochiladi — bu amaldagi qabriston, sokin boʻling.",
      "Rivoyatga koʻra, Qusam ibn Abbosning namoz paytida boshi kesilgan, ammo u oʻlmagan: boshini olib, quduqqa, yer ostidagi bogʻga kirib ketgan va hozirgacha oʻsha yerda yashaydi. Shuning uchun uni Tirik shoh deb atashadi.\n\nIkkinchi afsona kirishdagi zinapoya haqida. Aytishlaricha, uning zinalarini chiqishda ham, tushishda ham sanash kerak: sonlar mos kelsa, qalb pok, mos kelmasa — yana bir bor kelish kerak.",
      "Ansamblda XI–XIX asrlarga oid yigirmadan ortiq bino bor va ularning deyarli barchasi turli davrlarga mansub.\n\nKoʻplab maqbaralar Temur oilasidagi ayollar uchun qurilgan — bu oʻrta asrlar meʼmorchiligida kamyob hol.\n\n2000-yillarda ansambl jiddiy taʼmirlangan; baʼzi mutaxassislar qoplama haddan tashqari yangilanib yuborilmadimi, deb bahslashgan. Shuning uchun asl eski koshinlar ayniqsa qadrli — ularni yumshoq, biroz xiralashgan rangidan ajratish mumkin.",
      "Eng yaxshi yorugʻlik — ertalab: quyosh peshtoqlarni yoritadi, odam esa hali kam. Bu ibodat joyi: kamtarona kiyining, ayollarga roʻmol qulay, maqbaralar ichida shovqin qilmang va namoz oʻqiyotganlarni suratga olmang.\n\nKirish pullik. Yaqinida Siyob bozori va Bibixonim masjidi bor — ularni bitta sayrda aylanish qulay.",
    ],
  },

  gur: {
    en: [
      "Gur-e Amir is Persian for “the tomb of the Amir”. The mausoleum was begun in 1403 for Timur's favourite grandson, Muhammad Sultan, who died on campaign. Amir Timur himself died in 1405 in Otrar, at the start of a winter campaign against China; his body was brought to Samarkand and buried here.\n\nLater Timur's grandson Ulugh Beg turned the mausoleum into the family tomb of the Timurids: here lie Timur's sons Shahrukh and Miranshah, his grandson Muhammad Sultan, Ulugh Beg himself and Timur's mentor, Sheikh Mir Said Baraka — at whose head, by his will, Timur was buried.",
      "Outside, the mausoleum is crowned by a ribbed turquoise dome on a tall drum — this is how Gur-e Amir is recognised from afar. A huge Kufic inscription runs around the drum.\n\nInside is a tall hall with onyx panels and gold painting. Above it rises a dome painted inside with gold and blue patterns. The cenotaphs stand in the centre; Timur's is made of dark green nephrite (jade), one of the largest jade slabs in the world, brought on Ulugh Beg's orders. The actual burials are below, in the crypt, directly beneath the cenotaphs.",
      "Walk through the portal into the courtyard and look at the dome from different sides. Inside, notice Timur's jade cenotaph, the marble screen around the cenotaphs and the gold painting, restored in the 1970s.\n\nIn the evening the mausoleum is lit up — one of the most beautiful sights in Samarkand. Nearby are the Ak-Saray and Rukhabad mausoleums and the Amir Timur monument.",
      "The best-known legend is the “curse of Timur”. It is said the tomb bore the words: “When I rise from the dead, the world shall tremble.” In June 1941 scientists led by the anthropologist Mikhail Gerasimov opened the tomb, and a few days later the war began. In November 1942 Timur's remains were reburied according to Muslim custom — and soon afterwards, as the story goes, the tide of the war turned at Stalingrad. Historians regard it as coincidence, but every guide knows the legend.\n\nAnother tale: in the 18th century the Persian ruler Nadir Shah carried off the jade slab, but it cracked and misfortunes began to haunt him — so the slab was returned to Samarkand.",
      "The 1941 study confirmed the chronicles: Timur was tall and lame — hence his nickname “Timur the Lame”, in Persian “Timur-i lang”, which gave the European “Tamerlane”. Signs of execution were found on Ulugh Beg's remains: the chronicles say he was killed in 1449 on his son's orders.\n\nFrom Timur's skull Gerasimov reconstructed his face — the reconstruction is still printed in textbooks.\n\nGur-e Amir became a model for the great Mughal mausoleums in India, such as Humayun's Tomb in Delhi.",
      "Come twice: in the daytime to study the painting, in the evening for the lights. Photography is allowed inside, but keep quiet: many people come here to pray. Dress modestly.\n\nThe ticket office is at the entrance; a visit takes 45–75 minutes. The Registan is about 15 minutes' walk away.",
    ],
    uz: [
      "Goʻri Amir fors tilida “amir qabri” degani. Maqbara 1403-yilda Temurning yurishda halok boʻlgan sevimli nabirasi Muhammad Sulton uchun qurila boshlagan. Amir Temurning oʻzi 1405-yilda Xitoyga qishki yurish boshida Oʻtrorda vafot etgan, jasadi Samarqandga keltirilib, shu yerga dafn etilgan.\n\nKeyinchalik Temurning nabirasi Ulugʻbek maqbarani Temuriylarning oilaviy dahmasiga aylantirgan: bu yerda Temurning oʻgʻillari Shohrux va Mironshoh, nabirasi Muhammad Sulton, Ulugʻbekning oʻzi va Temurning piri Mir Sayyid Baraka yotadi — vasiyatiga koʻra, Temur aynan uning bosh tomoniga dafn etilgan.",
      "Tashqaridan maqbara baland gardishdagi qovurgʻali firuza gumbaz bilan tojlangan — Goʻri Amirni uzoqdan aynan shundan tanishadi. Gardishni ulkan kufiy yozuv oʻrab turadi.\n\nIchkarida — oniks panellar va oltin naqshlar bilan bezatilgan baland zal. Uning ustida ichkaridan oltin va koʻk naqshlar bilan bezatilgan gumbaz. Markazda sagʻanalar turadi; Temurning sagʻanasi toʻq yashil nefritdan — bu dunyodagi eng yirik nefrit plitalardan biri boʻlib, Ulugʻbek buyrugʻi bilan keltirilgan. Haqiqiy qabrlar pastda, sagʻanalarning aynan ostidagi dahmada joylashgan.",
      "Peshtoqdan hovliga oʻting va gumbazni turli tomondan tomosha qiling. Ichkarida Temurning nefrit sagʻanasi, sagʻanalar atrofidagi marmar panjara va 1970-yillarda tiklangan oltin naqshlarga eʼtibor bering.\n\nKechqurun maqbara yoritiladi — bu Samarqanddagi eng goʻzal manzaralardan biri. Yaqinida Oqsaroy va Ruhobod maqbaralari hamda Amir Temur haykali bor.",
      "Eng mashhur afsona — “Temur laʼnati”. Aytishlaricha, sagʻanada: “Men oʻlimdan turganimda, dunyo larzaga keladi”, deb yozilgan ekan. 1941-yil iyunida antropolog Mixail Gerasimov boshchiligidagi olimlar qabrni ochishgan va bir necha kundan keyin urush boshlangan. 1942-yil noyabrida Temurning xoki musulmon odatiga koʻra qayta dafn etilgan — va rivoyatlarga koʻra, koʻp oʻtmay Stalingrad ostida urush burilish yasagan. Tarixchilar buni tasodif deb biladi, ammo bu afsonani har bir gid biladi.\n\nYana bir rivoyat: XVIII asrda Eron shohi Nodirshoh nefrit plitani olib ketgan, ammo u yorilib ketgan va shohni baxtsizliklar taʼqib qila boshlagan — shunda plita Samarqandga qaytarilgan.",
      "1941-yilgi tadqiqot solnomalarni tasdiqlagan: Temur baland boʻyli va oqsoq boʻlgan — “Temur Lang” laqabi shundan, Yevropadagi “Tamerlan” ham shundan kelib chiqqan. Ulugʻbek xokida qatl izlari topilgan: solnomalarga koʻra, u 1449-yilda oʻgʻlining buyrugʻi bilan oʻldirilgan.\n\nGerasimov Temurning bosh suyagi boʻyicha uning qiyofasini tiklagan — bu rekonstruksiya hozirgacha darsliklarda bosiladi.\n\nGoʻri Amir Hindistondagi Boburiylarning buyuk maqbaralari — masalan, Dehlidagi Humoyun maqbarasi uchun namuna boʻlgan.",
      "Ikki marta keling: kunduzi — naqshlarni koʻrish uchun, kechqurun — yoritish uchun. Ichkarida suratga olish mumkin, ammo shovqin qilmang: koʻpchilik bu yerga duo qilgani keladi. Kamtarona kiyining.\n\nKassa kirishda; tomosha 45–75 daqiqa davom etadi. Registongacha piyoda 15 daqiqacha.",
    ],
  },

  bibi: {
    en: [
      "Having returned from his Indian campaign in 1399, Amir Timur decided to build a congregational mosque in Samarkand that would have no equal. It was built in great haste: chroniclers write of hundreds of craftsmen from all over the empire and of war elephants brought from India to haul stone. The Spanish envoy Ruy González de Clavijo, who visited Samarkand in 1404, saw the construction with his own eyes.\n\nBecause of the haste and the unprecedented size, the mosque began to crumble soon after it was built. It suffered most in the earthquake of 1897. Restoration has been under way since the 1970s; the main dome and portal were rebuilt.",
      "The ensemble is a vast courtyard once surrounded by galleries on hundreds of marble columns, with three domed mosques: the main one opposite the entrance and two side ones. The main portal was one of the tallest in the Islamic world of its day.\n\nThe dome of the main mosque is faced with turquoise tiles, and inscriptions encircle the drum. Even as a ruin it shows how boldly Timur's builders worked: the walls, vaults and domes are breathtaking in scale.",
      "In the courtyard stands a huge marble Quran stand — a lauh. It was made under Ulugh Beg for a giant Quran and once stood inside the main mosque.\n\nWalk around the courtyard, look into the side mosques and at the domes from below. Across the street is the mausoleum of Bibi-Khanym herself, and the Siab Bazaar is a few steps away.",
      "The best-known legend: while Timur was away on campaign, his wife Bibi-Khanym urged the architect to finish the mosque before her husband's return. The architect, in love with the queen, demanded a kiss. She agreed, and the kiss left a mark on her cheek. When Timur learned of it, he ordered the master executed and from then on told women to wear veils. Historians consider it a fairy tale, but it is told on every tour.\n\nOf the Quran stand people say: if a woman who longs for a child crawls under it, her wish will come true.",
      "Bibi-Khanym is Saray Mulk Khanum, Timur's senior wife and the daughter of a khan of Genghisid descent. Marriage to her gave Timur the right to call himself guregen — “the khan's son-in-law”.\n\nThe mosque was one of the largest in the 15th-century Islamic world, and its dome was a landmark visible from afar.",
      "Entry is paid. A visit takes 45–75 minutes. Mornings are quieter and the soft light is good for photos. Dress modestly.\n\nA handy route: Registan → pedestrian street → Bibi-Khanym → Siab Bazaar → Shah-i-Zinda.",
    ],
    uz: [
      "1399-yilda Hindiston yurishidan qaytgan Amir Temur Samarqandda tengi yoʻq jome masjidi qurishga qaror qilgan. U katta shoshilinch bilan qurilgan: solnomachilar butun saltanatdan kelgan yuzlab ustalar va tosh tashish uchun Hindistondan keltirilgan jangovar fillar haqida yozadi. 1404-yilda Samarqandda boʻlgan ispan elchisi Rui Gonsales de Klavixo qurilishni oʻz koʻzi bilan koʻrgan.\n\nShoshilinch va gʻoyat katta oʻlchamlar tufayli masjid qurilganidan koʻp oʻtmay buzila boshlagan. Unga eng koʻp 1897-yilgi zilzila zarar yetkazgan. 1970-yillardan beri masjid tiklanmoqda; bosh gumbaz va peshtoq qaytadan qurilgan.",
      "Ansambl — bir vaqtlar yuzlab marmar ustunlardagi ravoqlar bilan oʻralgan ulkan hovli va uchta gumbazli masjid: kirish qarshisidagi bosh masjid va ikkita yon masjid. Bosh peshtoq oʻz davridagi islom olamining eng baland peshtoqlaridan biri boʻlgan.\n\nBosh masjid gumbazi firuza koshin bilan qoplangan, gardishini yozuvlar oʻrab turadi. Hatto vayronaga aylangan holida ham Temur ustalarining naqadar dadil qurganini koʻrish mumkin: devorlar, gumbaz va ravoqlar hayratlanarli darajada ulkan.",
      "Hovlida ulkan marmar Qurʼon lavhi turadi. U Ulugʻbek davrida ulkan Qurʼon uchun yasalgan va avval bosh masjid ichida turgan.\n\nHovlini aylanib chiqing, yon masjidlarga kiring, gumbazlarga pastdan qarang. Qarshisida, koʻchaning narigi tomonida — Bibixonimning oʻz maqbarasi. Ikki qadamda esa Siyob bozori.",
      "Eng mashhur afsona: Temur yurishda boʻlganida, xotini Bibixonim meʼmorni masjidni eri qaytishiga qadar tugatishga shoshiltirgan. Malikaga oshiq boʻlgan meʼmor oʻpich talab qilgan. U rozi boʻlgan va oʻpich uning yuzida iz qoldirgan. Buni bilgan Temur ustani qatl qilishni buyurgan, ayollarga esa shundan buyon yuzni yopib yurishni amr qilgan. Tarixchilar buni ertak deb hisoblaydi, ammo uni har bir sayohatda aytib berishadi.\n\nQurʼon lavhi haqida aytishlaricha, farzand orzu qilgan ayol uning ostidan emaklab oʻtsa, tilagi ijobat boʻlarmish.",
      "Bibixonim — Temurning katta xotini, Chingiziylar avlodidan boʻlgan xonning qizi Saroy Mulk xonim. U bilan nikoh Temurga “koʻragon” — “xonning kuyovi” deb atalish huquqini bergan.\n\nMasjid XV asr islom olamidagi eng katta masjidlardan biri boʻlgan, gumbazi esa uzoqdan koʻrinadigan moʻljal edi.",
      "Kirish pullik. Tomosha 45–75 daqiqa davom etadi. Ertalab bu yerda odam kamroq, yumshoq yorugʻlik esa suratga olish uchun qulay. Kamtarona kiyining.\n\nQulay yoʻnalish: Registon → piyodalar koʻchasi → Bibixonim → Siyob bozori → Shohi Zinda.",
    ],
  },

  ulug: {
    en: [
      "Mirzo Ulugh Beg (1394–1449), grandson of Amir Timur, ruled Samarkand for almost forty years and was more scholar than warrior. In the 1420s he built an observatory on Kuhak Hill — one of the finest in the medieval world. Astronomers and mathematicians worked around him, among them Qazi-zade Rumi and Ali Qushji.\n\nAfter Ulugh Beg's death in 1449 the observatory was destroyed and forgotten for centuries. In 1908 the archaeologist Vasily Vyatkin found its site from an old land document and excavated the underground part of the main instrument.",
      "The observatory was a round three-storey building about 30 metres high. Its heart was the huge Fakhri sextant — an arc that ran through the whole building and went underground. It was used to follow the movement of the Sun, the Moon and the planets.\n\nOnly the underground part of the arc has survived: cut into the rock and faced with marble, with degree marks. A protective vault has been built over it.",
      "Go down to the arc of the sextant — it is a real 15th-century instrument. Then visit the Ulugh Beg Museum: it has a model of the observatory, copies of manuscripts, star maps and the story of the astronomers of his school. In front of the museum stands a monument to Ulugh Beg.\n\nThe hill offers a view of Samarkand and Afrasiab.",
      "It is said that Ulugh Beg's son Abdal-Latif, incited by his father's enemies, ordered him killed when he set out on pilgrimage. According to tradition, Ulugh Beg had read his own fate in the stars. A few months later Abdal-Latif himself was killed — the chroniclers saw it as retribution.",
      "The “Zij-i Gurgani”, the observatory's main work, describes 1,018 stars. It was the first catalogue since Ptolemy compiled from new observations.\n\nUlugh Beg calculated the length of the sidereal year with an error of about a minute — astonishing accuracy for the 15th century.\n\nA crater on the Moon and an asteroid are named after Ulugh Beg.",
      "The observatory is 10–15 minutes by taxi from the Registan; the Afrasiab Museum and the Khoja Daniyar mausoleum are nearby and easy to combine. Entry is paid; a visit takes 45–75 minutes. In summer come in the morning: there is little shade on the hill.",
    ],
    uz: [
      "Amir Temurning nabirasi Mirzo Ulugʻbek (1394–1449) Samarqandni qariyb qirq yil boshqargan va jangchidan koʻra koʻproq olim boʻlgan. 1420-yillarda u Kohak tepaligida rasadxona qurdirgan — bu oʻrta asrlar dunyosidagi eng yaxshi rasadxonalardan biri edi. Uning atrofida astronom va matematiklar, jumladan, Qozizoda Rumiy va Ali Qushchi ishlagan.\n\n1449-yilda Ulugʻbek halok boʻlgach, rasadxona vayron qilingan va asrlar davomida unutilgan. 1908-yilda arxeolog Vasiliy Vyatkin eski yer hujjati boʻyicha uning oʻrnini topib, asosiy asbobning yer osti qismini qazib ochgan.",
      "Rasadxona balandligi 30 metrga yaqin, uch qavatli dumaloq bino boʻlgan. Uning yuragi — butun binodan oʻtib, yer ostiga tushib ketgan ulkan Faxriy sekstanti edi. U orqali Quyosh, Oy va sayyoralarning harakati kuzatilgan.\n\nBugungacha yoyning faqat qoyaga oʻyib ishlangan, marmar bilan qoplangan va daraja belgilari bor yer osti qismi yetib kelgan. Uning ustiga himoya gumbazi qurilgan.",
      "Sekstant yoyiga tushing — bu XV asrning haqiqiy asbobi. Keyin Ulugʻbek muzeyiga kiring: unda rasadxona maketi, qoʻlyozmalar nusxalari, yulduz xaritalari va uning maktabi astronomlari haqida hikoya bor. Muzey oldida Ulugʻbek haykali turibdi.\n\nTepalikdan Samarqand va Afrosiyob manzarasi ochiladi.",
      "Aytishlaricha, Ulugʻbekning oʻgʻli Abdullatif otasining dushmanlari gʻiyvasi bilan uni hajga ketayotganida oʻldirishni buyurgan. Rivoyatga koʻra, Ulugʻbek oʻz taqdirini yulduzlardan bilgan ekan. Bir necha oydan soʻng Abdullatifning oʻzi ham oʻldirilgan — solnomachilar buni qasos deb bilgan.",
      "Rasadxonaning asosiy asari — “Ziji Koʻragoniy”da 1018 ta yulduz tasvirlangan. Bu Ptolemeydan keyin yangi kuzatishlar asosida tuzilgan birinchi katalog edi.\n\nUlugʻbek yulduz yilining uzunligini taxminan bir daqiqa xato bilan hisoblagan — XV asr uchun aql bovar qilmas aniqlik.\n\nUlugʻbek sharafiga Oydagi krater va asteroid nomlangan.",
      "Rasadxona Registondan taksida 10–15 daqiqa; yaqinida Afrosiyob muzeyi va Xoja Doniyor maqbarasi bor — ularni birga koʻrish qulay. Kirish pullik, tomosha 45–75 daqiqa. Yozda ertalab keling: tepalikda soya kam.",
    ],
  },

  afros: {
    en: [
      "The Afrasiab Museum of the History of Samarkand opened in 1970, for the city's 2,500th anniversary, right next to the ancient settlement. It was built for the sake of a single find: in 1965, while a road was being laid across the Afrasiab hills, archaeologists came upon the remains of a palace with wall paintings.\n\nThe murals date from the 7th century, the time of Varkhuman, ruler of Samarkand. They were removed from the walls and moved to the museum, where a special hall was made for them.",
      "The highlight is the “Hall of Ambassadors”. The west wall shows foreign envoys received by the ruler of Samarkand: people in different dress bearing different gifts. The south wall shows a wedding or festive procession with elephants, camels and riders. The north wall has a Chinese scene: a boat with a princess, and a hunt.\n\nBesides the murals the museum has ossuaries (Zoroastrian bone vessels), ceramics, coins, weapons, jewellery and everyday objects of ancient Marakanda, from the first settlements to the Mongol invasion.",
      "Among the envoys in the mural are two men in feathered caps. Many scholars believe they are envoys of the Korean kingdom of Goguryeo — which is why the museum is so loved by visitors from Korea.\n\nA Sogdian inscription on one of the walls names Varkhuman and tells of an embassy — a rare case of a “signed” painting.\n\nThe murals survived almost 1,300 years underground but have partly faded; restorers carefully preserve what remains.",
      "Allow 1–1.5 hours for the museum, then climb the hills of the settlement itself — from there you can see how huge the ancient city was. The Hazrat Khizr Mosque and the Khoja Daniyar mausoleum are nearby. Entry is paid; opening hours are on the museum-reserve website.",
    ],
    uz: [
      "Samarqand tarixi “Afrosiyob” muzeyi 1970-yilda, shaharning 2500 yilligiga atab, qadimiy shahar xarobasi yonida ochilgan. U bitta topilma tufayli qurilgan: 1965-yilda Afrosiyob tepaliklari orqali yoʻl yotqizilayotganda arxeologlar devoriy suratlari bor saroy qoldiqlariga duch kelishgan.\n\nSuratlar VII asrga, Samarqand hukmdori Varxuman davriga oid. Ular devorlardan koʻchirib olinib, muzeyga keltirilgan va ular uchun alohida zal qurilgan.",
      "Asosiysi — “Elchilar zali”. Gʻarbiy devorda Samarqand hukmdorining xorijiy elchilarni qabul qilishi tasvirlangan: turli kiyimdagi, turli sovgʻalar koʻtargan odamlar. Janubiy devorda fillar, tuyalar va chavandozlar bilan toʻy yoki bayram yurishi. Shimoliy devorda xitoycha sahna: malika oʻtirgan qayiq va ov.\n\nSuratlardan tashqari muzeyda ostadonlar (zardushtiylarning suyak saqlaydigan idishlari), sopol buyumlar, tangalar, qurollar, zargarlik buyumlari va qadimgi Marakandaning ilk manzilgohlardan moʻgʻullar bosqinigacha boʻlgan davrdagi roʻzgʻor buyumlari bor.",
      "Suratdagi elchilar orasida patli qalpoq kiygan ikki kishi bor. Koʻplab olimlar ularni Koreyaning Koguryo podshohligi elchilari deb hisoblaydi — shuning uchun muzeyni koreyalik sayyohlar juda yaxshi koʻradi.\n\nDevorlardan biridagi soʻgʻd tilidagi yozuv Varxumanning ismini aytadi va elchilik haqida hikoya qiladi — bu suratning “imzolangan” noyob holati.\n\nSuratlar qariyb 1300 yil yer ostida saqlangan, ammo qisman xiralashgan; taʼmirchilar qolganini ehtiyotkorlik bilan asrab kelmoqda.",
      "Muzeyga 1–1,5 soat ajrating, keyin shahar xarobasining tepaliklariga chiqing — u yerdan qadimiy shaharning naqadar ulkan boʻlgani koʻrinadi. Yaqinida Hazrati Xizr masjidi va Xoja Doniyor maqbarasi bor. Kirish pullik, ish vaqti — muzey-qoʻriqxona saytida.",
    ],
  },

  savsav: {
    en: [
      "The bazaar at the foot of the Bibi-Khanym Mosque has existed since time immemorial: Samarkand stood on the Great Silk Road, and trade here never stopped for centuries. The name “Siab” (Siyob) comes from the Siab stream that flows nearby — Persian for “black water”.\n\nToday it is the city's main market: locals buy their food here every day, and visitors buy sweets, spices and dried fruit for the road.",
      "Samarkand non — round flatbreads with a pattern in the centre, heavy and slow to go stale. They are baked in tandoors and stacked in piles.\n\nRows of dried fruit and nuts: dried apricots, dozens of kinds of raisins, almonds, walnuts, pistachios, roasted apricot kernels. Spices, cumin for plov, navat — crystallised sugar for tea — halva, parvarda. In summer and autumn: mountains of melons, grapes, pomegranates and peaches.",
      "They say the Emir of Bukhara loved Samarkand non so much that he brought the best bakers, the flour and even the water from Samarkand. But the bread still didn't come out right. The bakers explained: “We are missing the air of Samarkand.” Since then it has been believed that real non exists only here.",
      "Bargaining is normal and expected — start at about half the asking price. Sellers are happy to let you taste. Bring cash in som; small notes are handier.\n\nAsk before photographing the sellers. The liveliest time is the morning. Bibi-Khanym and Shah-i-Zinda are close by.",
    ],
    uz: [
      "Bibixonim masjidi etagidagi bozor qadim zamonlardan beri mavjud: Samarqand Buyuk ipak yoʻlida joylashgan va bu yerda savdo asrlar davomida toʻxtamagan. “Siyob” nomi yaqinidan oqib oʻtadigan Siyob ariqidan olingan — fors tilida “qora suv” degani.\n\nBugun bu shaharning bosh bozori: mahalliy aholi bu yerdan har kuni oziq-ovqat oladi, sayyohlar esa yoʻlga shirinlik, ziravor va quruq meva xarid qiladi.",
      "Samarqand noni — markazida naqshi bor, ogʻir va uzoq qotmaydigan dumaloq nonlar. Ular tandirda yopiladi va taxlab qoʻyiladi.\n\nQuruq meva va yongʻoq rastalari: turshak, oʻnlab navdagi mayiz, bodom, yongʻoq, pista, qovurilgan oʻrik danagi. Ziravorlar, palov uchun zira, choyga nabot, holva, parvarda. Yozu kuzda — tepa-tepa qovun, uzum, anor va shaftoli.",
      "Aytishlaricha, Buxoro amiri Samarqand nonini shunchalik yaxshi koʻrganki, Samarqanddan eng yaxshi novvoylarni, unni va hatto suvni ham olib kelgan. Ammo non baribir chiqmagan. Novvoylar tushuntirishgan: “Bizga Samarqand havosi yetishmayapti”. Shundan beri haqiqiy non faqat shu yerda boʻladi, deb hisoblanadi.",
      "Savdolashish odatiy va kutilgan hol — aytilgan narxning yarmidan boshlang. Sotuvchilar bajonidil tatib koʻrishga beradi. Soʻm naqd pul oling, mayda pullar qulayroq.\n\nSotuvchilarni suratga olishdan oldin ruxsat soʻrang. Eng gavjum vaqt — ertalab. Yaqinida Bibixonim va Shohi Zinda bor.",
    ],
  },

  meros: {
    en: [
      "In the Middle Ages Samarkand paper was famous throughout the Islamic world: smooth and durable, it was used for books and decrees from Baghdad to India. According to tradition, the people of Samarkand learned the secret of making it from Chinese craftsmen taken prisoner after the Battle of Talas in 751.\n\nBy the 19th century the craft had died out, displaced by factory paper. In the 1990s the master Zarif Mukhtarov and his brothers set out to revive the old technique, and the Meros (“heritage”) workshop appeared in the village of Konigil on the outskirts of Samarkand.",
      "The whole life of a sheet: young mulberry branches are stripped of bark, the bast is soaked and boiled, then pounded by wooden hammers driven by a water wheel. Sheets are scooped from the fibrous pulp, dried and polished to a shine with a stone or a shell.\n\nBesides the paper workshop, Konigil has an old oil mill, potters, and teahouses by the water under the trees.",
      "Mulberry paper can last for centuries and is not damaged by insects. Today it is used by manuscript restorers, miniature painters and calligraphers.\n\nA similar craft is known in Japan and Korea, where paper is also made from the bark of trees of the mulberry family.",
      "Allow 1–2 hours and come by taxi — about 15 minutes from the centre. You can try making a sheet yourself. The shop sells notebooks, postcards, dolls and miniatures on this paper — a good gift from Samarkand. There is a small entry fee; check on site.",
    ],
    uz: [
      "Oʻrta asrlarda Samarqand qogʻozi butun islom olamida mashhur boʻlgan: silliq, mustahkam, Bagʻdoddan Hindistongacha unga kitob va farmonlar yozilgan. Rivoyatga koʻra, samarqandliklar uni tayyorlash sirini 751-yildagi Talas jangidan keyin asirga tushgan xitoylik ustalardan oʻrganishgan.\n\nXIX asrga kelib bu hunar fabrika qogʻozi tufayli soʻnib ketgan. 1990-yillarda usta Zarif Muxtorov akalari bilan eski texnologiyani tiklashga kirishgan va Samarqand chekkasidagi Konigil qishlogʻida “Meros” ustaxonasi paydo boʻlgan.",
      "Varaqning butun yoʻli: yosh tut novdalari poʻstlogʻidan tozalanadi, poʻstloq ivitiladi va qaynatiladi, soʻng uni suv gʻildiragi harakatga keltiradigan yogʻoch toʻqmoqlar tuyadi. Tolali massadan varaqlar olinadi, quritiladi va tosh yoki chigʻanoq bilan yaltiroq boʻlguncha silliqlanadi.\n\nKonigilda qogʻoz ustaxonasidan tashqari eski moyjuvoz, kulollar va daraxtlar ostida suv boʻyidagi choyxonalar bor.",
      "Tut qogʻozi asrlar davomida saqlanishi mumkin va hasharotlardan qoʻrqmaydi. Bugun undan qoʻlyozma taʼmirchilari, miniatyurachi rassomlar va xattotlar foydalanadi.\n\nShunga oʻxshash hunar Yaponiya va Koreyada ham maʼlum — u yerda ham qogʻoz tutdoshlar oilasiga mansub daraxtlar poʻstlogʻidan tayyorlanadi.",
      "1–2 soat ajrating va taksida keling — markazdan 15 daqiqacha. Varaqni oʻzingiz yasab koʻrishingiz mumkin. Doʻkonda shu qogʻozdan bloknot, otkritka, qoʻgʻirchoq va miniatyuralar sotiladi — Samarqanddan yaxshi sovgʻa. Kirish uchun kichik toʻlov bor, joyida aniqlang.",
    ],
  },

  smafr: {
    en: [
      "Afrasiab is ancient Samarkand. A city already stood on these hills in the 8th–7th centuries BC, and in classical sources it is known as Marakanda, the capital of Sogdiana. In 329 BC it was taken by Alexander the Great.\n\nIn the Middle Ages it was ruled by Sogdian kings, then by the Arabs (from 712), the Samanids and the Karakhanids. In 1220 the city was destroyed by the army of Genghis Khan. Life never returned to the hills: Samarkand was rebuilt to the south, where it stands now.",
      "The settlement is huge — more than 200 hectares of hills, ravines and excavation trenches. Remains of fortress walls, the citadel, streets and quarters can be seen, though to the untrained eye it looks more like green hills.\n\nIt is best to start with the Afrasiab Museum: after its murals, coins and ceramics, a walk across the hills comes alive. From the tops you can see the domes of Bibi-Khanym and Shah-i-Zinda.",
      "The hills are named after Afrasiab, the legendary king of Turan from Ferdowsi's epic “Shahnameh”. Tradition credits him with founding the city, although archaeologists link the name rather to a later tradition.",
      "There is no shade on the hills — take water and a hat, and walk in the morning or towards evening. Comfortable shoes are a must. The Afrasiab Museum, the Hazrat Khizr Mosque and the Khoja Daniyar mausoleum are nearby.",
    ],
    uz: [
      "Afrosiyob — qadimgi Samarqand. Bu tepaliklarda shahar miloddan avvalgi VIII–VII asrlardayoq mavjud boʻlgan, antik manbalarda esa u Soʻgʻdiyona poytaxti Marakanda nomi bilan maʼlum. Miloddan avvalgi 329-yilda uni Aleksandr Makedonskiy egallagan.\n\nOʻrta asrlarda bu yerda soʻgʻd podsholari, keyin arablar (712-yildan), Somoniylar va Qoraxoniylar hukmronlik qilgan. 1220-yilda shaharni Chingizxon qoʻshini vayron qilgan. Tepaliklarda hayot boshqa tiklanmagan: Samarqand janubroqda, hozir turgan joyida qayta qurilgan.",
      "Shahar xarobasi ulkan — 200 gektardan ortiq tepalik, jarlik va qazishma. Qalʼa devorlari, ark, koʻcha va mahallalarning qoldiqlari koʻrinadi, garchi tayyorgarliksiz koʻzga bu koʻproq yashil tepaliklardek tuyulsa ham.\n\nAfrosiyob muzeyidan boshlash eng yaxshisi: uning suratlari, tangalari va sopol buyumlaridan keyin tepaliklar boʻylab sayr jonlanadi. Tepalardan Bibixonim va Shohi Zinda gumbazlari koʻrinadi.",
      "Tepaliklar Firdavsiyning “Shohnoma” dostonidagi afsonaviy Turon shohi Afrosiyob nomi bilan atalgan. Rivoyat shahar asos solinishini unga bogʻlaydi, ammo arxeologlar bu nomni koʻproq keyingi anʼana bilan bogʻlaydi.",
      "Tepaliklarda soya yoʻq — suv va bosh kiyim oling, ertalab yoki kechga yaqin sayr qilgan maʼqul. Qulay poyabzal shart. Yaqinida Afrosiyob muzeyi, Hazrati Xizr masjidi va Xoja Doniyor maqbarasi bor.",
    ],
  },

  smahrar: {
    en: [
      "Khoja Ubaydullah Ahrar (1404–1490) was one of the most influential sheikhs of the Naqshbandi Sufi order. He was not only a spiritual teacher but also an extremely wealthy landowner, and Timurid rulers listened to his word.\n\nAfter the sheikh's death he was buried in the south of Samarkand, and the place became venerated. In the 1630s the Nodir Divan-Begi madrasa was built next to it, and later mosques and a minaret.",
      "Khoja Ahrar's tombstone is a massive marble slab with fine carved calligraphy. The portal of the Nodir Divan-Begi madrasa is decorated with mosaic in the spirit of Sher-Dor, which is why it is called the “mirror of Sher-Dor”.\n\nThe ensemble suffered badly in earthquakes and was restored in the 20th century, partly from old photographs. Huge plane trees grow in the courtyard and give deep shade.",
      "This is a working place of worship: modest dress and quiet. The ensemble is far from the tourist centre, so a taxi is the easiest way to get here. A good place to see Samarkand without the crowds.",
    ],
    uz: [
      "Xoja Ubaydulloh Ahror (1404–1490) — Naqshbandiya soʻfiylik tariqatining eng nufuzli shayxlaridan biri. U nafaqat maʼnaviy ustoz, balki gʻoyat boy yer egasi ham boʻlgan, Temuriy hukmdorlar uning soʻziga quloq solgan.\n\nShayx vafotidan keyin Samarqandning janubida dafn etilgan va bu joy ziyoratgohga aylangan. 1630-yillarda uning yonida Nodir Devonbegi madrasasi, keyinroq masjidlar va minora qurilgan.",
      "Xoja Ahror qabr toshi — nafis oʻymakor xat bitilgan ulkan marmar plita. Nodir Devonbegi madrasasining peshtoqi Sherdor uslubidagi koshinlar bilan bezatilgan, shuning uchun uni “Sherdorning koʻzgusi” deb atashadi.\n\nAnsambl zilzilalardan jiddiy zarar koʻrgan va XX asrda, jumladan, eski suratlar asosida tiklangan. Hovlida quyuq soya beradigan ulkan chinorlar oʻsadi.",
      "Bu amaldagi ibodat joyi: kamtarona kiyim va sukunat. Ansambl sayyohlik markazidan uzoqda, bu yerga taksida kelish qulay. Samarqandni olomonsiz koʻrish uchun yaxshi joy.",
    ],
  },

  smaksr: {
    en: [
      "Ak-Saray means “white palace”. This small mausoleum stands a few steps behind Gur-e Amir. It was built in the 1470s, in the reign of Abu Said, Timur's great-grandson; it is believed to be a tomb for young Timurids. Who exactly lies in the crypt is not reliably known.",
      "From outside the mausoleum is unremarkable, and its portal was never finished. But inside is one of the most beautiful paintings in Samarkand: the walls and dome are covered with a gold pattern in the kundal technique, with blue and red tones.\n\nDuring the 2007 restoration part of the wall was deliberately left untouched to show the original 15th-century painting.",
      "Drop in after Gur-e Amir — it is a 2–3 minute walk, and there is hardly anyone here. If the mausoleum is closed, ask the caretaker at Gur-e Amir.",
    ],
    uz: [
      "Oqsaroy — “oq saroy” degani. Bu kichik maqbara Goʻri Amir ortida, bir necha qadamda turadi. U 1470-yillarda, Temurning chevarasi Abusaid hukmronligi davrida qurilgan; yosh Temuriylar uchun dahma boʻlgan deb hisoblanadi. Dahmada aynan kim yotgani aniq maʼlum emas.",
      "Tashqaridan maqbara koʻzga tashlanmaydi, peshtoqi esa tugallanmay qolgan. Buning oʻrniga ichkarida Samarqanddagi eng goʻzal naqshlardan biri bor: devor va gumbaz kundal uslubida, koʻk va qizil tuslar bilan oltin naqsh bilan qoplangan.\n\n2007-yilgi taʼmirda devorning bir qismi XV asrning asl naqshi koʻrinib turishi uchun ataylab tegmasdan qoldirilgan.",
      "Goʻri Amirdan keyin bu yerga kiring — piyoda 2–3 daqiqa, odam esa deyarli yoʻq. Agar maqbara yopiq boʻlsa, Goʻri Amirdagi nazoratchidan soʻrang.",
    ],
  },

  smishr: {
    en: [
      "The mausoleum was built around 1464 in the south-east of Samarkand. According to tradition, it was erected by Habiba Sultan Begim, wife of Abu Said, over the grave of her daughter. Later women and children of the Timurid family were buried here: excavations in 1940 found their burials in the crypt.\n\nIn 1903 an earthquake brought down the dome. Since then the mausoleum has stood as a majestic ruin.",
      "Even without its dome you can see how complex the building was: a tall portal, remains of muqarnas vaults, traces of painting and mosaic. Ishratkhana is often called one of the peaks of Timurid architecture — precisely because in its ruined state the whole structure can be seen “from the inside”.",
      "The name is translated as “house of pleasure”. It is said that Timur had a pleasure palace here which was later turned into a tomb. In fact the building was put up after Timur's death, so this is just a pretty story.",
      "Entry into the interior is not allowed — the ruins are dangerous, so view them from outside. The Khoja Abdi Darun ensemble is nearby and easy to combine. The best light for photos is in the afternoon.",
    ],
    uz: [
      "Maqbara taxminan 1464-yilda Samarqandning janubi-sharqida qurilgan. Rivoyatga koʻra, uni Abusaidning xotini Habiba Sulton begim qizining qabri ustiga qurdirgan. Keyinchalik bu yerda Temuriylar sulolasiga mansub ayollar va bolalar dafn etilgan: 1940-yilgi qazishmalarda dahmadan ularning qabrlari topilgan.\n\n1903-yilda zilzila gumbazni qulatgan. Shundan beri maqbara salobatli xaroba holida turibdi.",
      "Gumbazsiz holida ham binoning naqadar murakkab boʻlgani koʻrinadi: baland peshtoq, muqarnas ravoqlar qoldiqlari, naqsh va koshin izlari. Ishratxonani koʻpincha Temuriylar meʼmorchiligining choʻqqilaridan biri deb atashadi — chunki aynan xarobada butun qurilma “ichkaridan” koʻrinadi.",
      "Nomini “ishrat uyi” deb tarjima qilishadi. Aytishlaricha, bu yerda Temurning koʻngilochar saroyi boʻlgan, keyin u dahmaga aylantirilgan. Aslida bino Temur vafotidan keyin qurilgan, shuning uchun bu shunchaki chiroyli hikoya.",
      "Ichkariga kirish mumkin emas — xaroba xavfli, tashqaridan tomosha qiling. Yaqinida Xoja Abdi Darun ansambli bor, ularni birga koʻrish qulay. Suratga olish uchun eng yaxshi yorugʻlik — kunning ikkinchi yarmida.",
    ],
  },
  smrukh: {
    en: [
      "Rukhabad means “abode of the spirit”. The mausoleum was built around 1380, under Amir Timur, over the grave of Sheikh Burhaniddin Sagarji — a Sufi preacher who lived a long life, travelled as far as China and was greatly revered in Samarkand. It is one of the oldest surviving mausoleums in the city.",
      "The building is deliberately austere: a brick cube with a dome on an octagonal drum, with no tall portal and no coloured facing. This ascetic look matched the teaching of the sheikh, who preached simplicity.\n\nIn the 19th century cells and a small mosque appeared around the mausoleum; some of them now house craft shops.",
      "According to tradition, a casket with hairs of the Prophet Muhammad is walled up in the dome — hence the special reverence for this place.\n\nIt is also said that Timur respected the sheikh so much that he had the mausoleum built near the spot where his own tomb would later stand.",
      "The mausoleum stands between Gur-e Amir and the Registan — you can drop in on the way for 15–20 minutes. It is a place of worship: modest dress, quiet.",
    ],
    uz: [
      "Ruhobod — “ruh maskani” degani. Maqbara taxminan 1380-yilda, Amir Temur davrida, uzoq umr koʻrgan, Xitoygacha sayohat qilgan va Samarqandda katta hurmatga sazovor boʻlgan soʻfiy voiz shayx Burhoniddin Sagʻarjiy qabri ustiga qurilgan. Bu shahardagi saqlanib qolgan eng qadimiy maqbaralardan biri.",
      "Bino ataylab sodda: sakkiz qirrali gardishdagi gumbazli gʻisht kub, baland peshtoqsiz va rangli qoplamasiz. Bunday zohidona qiyofa soddalikni targʻib qilgan shayx taʼlimotiga mos edi.\n\nXIX asrda maqbara atrofida hujralar va kichik masjid paydo boʻlgan; hozir ularning ayrimlarida hunarmandlar doʻkonlari bor.",
      "Rivoyatga koʻra, maqbara gumbaziga paygʻambar Muhammadning sochlari solingan quticha joylangan — bu joyning alohida hurmat qilinishi shundan.\n\nAytishlaricha, Temur shayxni shunchalik hurmat qilganki, maqbarani keyinchalik oʻzining dahmasi quriladigan joy yaqinida qurdirgan.",
      "Maqbara Goʻri Amir bilan Registon oraligʻida joylashgan — yoʻl-yoʻlakay 15–20 daqiqaga kirish mumkin. Bu ibodat joyi: kamtarona kiyim, sukunat.",
    ],
  },

  smdani: {
    en: [
      "The mausoleum stands on a hill above the Siab stream, at the northern edge of Afrasiab. According to the best-known tradition, here lie the remains of the Prophet Daniel (Doniyor), which Amir Timur brought to Samarkand from the ancient city of Susa so that the saint would protect his capital.\n\nThere is another version: that Khoja Doniyor, a companion of Qusam ibn Abbas, is buried here. Either way, the place is revered by Muslims, Christians and Jews. The present building dates from the early 20th century and was renovated in the 1990s.",
      "Inside is a tomb about 18 metres long, covered with green cloth. Five domes rise above the narrow, long building.\n\nA spring flows at the foot of the hill; its water is considered healing, and people drink it and take it away. From the hill there is a view of the Siab valley and the hills of the ancient city.",
      "People say the saint's body keeps growing — half an inch a year — and that is why the tomb has to be lengthened. Hence its unusual 18 metres.\n\nThey also tell of a pistachio tree by the mausoleum: it withered but, according to tradition, came back to life after the prayers of pilgrims. Local guides love to show this tree.",
      "This is a holy place for three religions: dress modestly, women may want a headscarf, shoes are taken off at the entrance. A staircase leads down to the spring. The Afrasiab Museum is nearby, easy to combine.",
    ],
    uz: [
      "Maqbara Afrosiyobning shimoliy chekkasida, Siyob ariqi ustidagi tepalikda joylashgan. Eng mashhur rivoyatga koʻra, bu yerda Amir Temur avliyo poytaxtini asrasin deb qadimiy Suza shahridan Samarqandga keltirgan Doniyor paygʻambarning xoki yotadi.\n\nBoshqa bir talqin ham bor: bu yerda Qusam ibn Abbosning safdoshi Xoja Doniyor dafn etilgan. Nima boʻlganda ham, bu joyni musulmonlar, nasroniylar va yahudiylar ziyorat qiladi. Hozirgi bino XX asr boshida qurilgan va 1990-yillarda yangilangan.",
      "Ichkarida yashil mato bilan yopilgan, uzunligi 18 metrga yaqin qabr bor. Tor va uzun bino ustida beshta gumbaz qad rostlagan.\n\nTepalik etagida buloq qaynab chiqadi; uning suvini shifobaxsh deb hisoblashadi, ichishadi va oʻzlari bilan olib ketishadi. Tepalikdan Siyob vodiysi va qadimiy shahar tepaliklari manzarasi ochiladi.",
      "Aytishlaricha, avliyoning jasadi oʻsib borarmish — yiliga yarim dyuymdan — shuning uchun qabrni uzaytirishga toʻgʻri kelarmish. Uning gʻayrioddiy 18 metrlik uzunligi shundan.\n\nYana maqbara yonidagi pista daraxti haqida hikoya qilishadi: u qurib qolgan, ammo rivoyatga koʻra, ziyoratchilarning duosidan keyin qayta jonlangan. Mahalliy gidlar bu daraxtni zavq bilan koʻrsatishadi.",
      "Bu uch din uchun muqaddas joy: kamtarona kiyining, ayollarga roʻmol qulay, kirishda poyabzal yechiladi. Buloqqa zinapoya olib tushadi. Yaqinida Afrosiyob muzeyi bor, ularni birga koʻrish qulay.",
    ],
  },

  smkhizr: {
    en: [
      "The hill on which the mosque stands is one of the most ancient places in Samarkand. Archaeologists believe a Zoroastrian temple stood here, and after the Arabs came in the 8th century, one of the city's first mosques. It was destroyed by the Mongols in 1220.\n\nThe present building dates from 1854, and the portal and minaret were added in the early 20th century. The mosque is named after Khizr, the eternal wanderer and patron of travellers who, as people believe, comes to the aid of those who are lost.",
      "Hazrat Khizr is one of the most ornate mosques in the city in the “new” 19th-century style. It has a summer aivan with carved wooden columns and a painted ceiling, bright painted ganch and multicoloured decoration, rare in Samarkand.",
      "The main thing here is the view. From the hill you can see the domes of Bibi-Khanym, the Siab Bazaar, Shah-i-Zinda and the hills of Afrasiab. Next door is the memorial complex of Uzbekistan's first president, Islam Karimov.",
      "This is a working mosque: modest dress, shoes off at the entrance. Better not to get in the way at prayer times. It is handy to come here after the Siab Bazaar — a few minutes' walk uphill.",
    ],
    uz: [
      "Masjid joylashgan tepalik — Samarqanddagi eng qadimiy joylardan biri. Arxeologlarning fikricha, bu yerda zardushtiylar ibodatxonasi, VIII asrda arablar kelgach esa shahardagi ilk masjidlardan biri turgan. 1220-yilda uni moʻgʻullar vayron qilgan.\n\nHozirgi bino 1854-yilda qurilgan, peshtoq va minora esa XX asr boshida qoʻshilgan. Masjid mangu sayyoh, adashganlarga yordamga keladi deb ishoniladigan yoʻlovchilar homiysi Xizr nomi bilan atalgan.",
      "Hazrati Xizr — shahardagi XIX asrning “yangi” uslubidagi eng bezakli masjidlardan biri. Uning oʻymakor yogʻoch ustunli va naqshli shiftli yozgi ayvoni, yorqin naqshli ganch va Samarqand uchun kamyob boʻlgan rang-barang bezaklari bor.",
      "Bu yerda eng asosiysi — manzara. Tepalikdan Bibixonim gumbazlari, Siyob bozori, Shohi Zinda va Afrosiyob tepaliklari koʻrinadi. Yonida Oʻzbekistonning birinchi Prezidenti Islom Karimovning yodgorlik majmuasi joylashgan.",
      "Bu amaldagi masjid: kamtarona kiyim, kirishda poyabzal yechiladi. Namoz vaqtida xalaqit bermagan maʼqul. Bu yerga Siyob bozoridan keyin kelish qulay — tepaga piyoda bir necha daqiqa.",
    ],
  },

  smkarim: {
    en: [
      "Islam Abduganievich Karimov (1938–2016) was born in Samarkand and became the first president of independent Uzbekistan, leading the country from 1990 until his death. He was buried in his home city, on the hill next to the Hazrat Khizr Mosque and the Shah-i-Zinda necropolis.\n\nA memorial complex in the traditional style has been built over the grave: a domed mausoleum, galleries, carved stone and ornaments.",
      "This is a place of remembrance, visited both by Uzbeks and by official delegations. Speak quietly and dress modestly; check the rules on photography with the attendants. Entry is free. Easy to combine with Hazrat Khizr and Shah-i-Zinda.",
    ],
    uz: [
      "Islom Abdugʻaniyevich Karimov (1938–2016) Samarqandda tugʻilgan va mustaqil Oʻzbekistonning birinchi Prezidenti boʻlgan — u mamlakatni 1990-yildan umrining oxirigacha boshqargan. U ona shahrida, Hazrati Xizr masjidi va Shohi Zinda majmuasi yonidagi tepalikda dafn etilgan.\n\nQabr ustida anʼanaviy uslubdagi yodgorlik majmuasi qurilgan: gumbazli maqbara, ayvonlar, oʻymakor tosh va naqshlar.",
      "Bu xotira maskani, bu yerga oʻzbekistonliklar ham, rasmiy delegatsiyalar ham keladi. Sekin gapiring va kamtarona kiyining; suratga olish qoidalarini nazoratchilardan aniqlang. Kirish bepul. Hazrati Xizr va Shohi Zinda bilan birga koʻrish qulay.",
    ],
  },

  smmuz: {
    en: [
      "The museum was founded in 1896 as the Samarkand Regional Museum and is considered one of the oldest in Central Asia. It was built up by archaeologists, local historians and lovers of antiquity, and today its collections hold tens of thousands of objects. The museum is part of the Samarkand State Museum-Reserve.",
      "The exhibition runs chronologically: the Stone and Bronze Ages, ancient Marakanda, Sogdian ossuaries, medieval glazed Afrasiab ceramics with inscriptions, weapons and jewellery.\n\nThe numismatic collection — about 30,000 coins of different eras — and the ethnography section with textiles, carpets, suzani and costumes are well worth seeing. The picture gallery has works by Vasily Vereshchagin, Nikolai Karazin and Usto Mumin.",
      "Allow 1–1.5 hours. It is a good museum for grasping the history of the whole region in one go — best visited early in your trip. Tickets follow the museum-reserve price list.",
    ],
    uz: [
      "Muzey 1896-yilda Samarqand viloyat muzeyi sifatida tashkil etilgan va Markaziy Osiyodagi eng qadimiy muzeylardan biri hisoblanadi. Uni arxeologlar, oʻlkashunoslar va qadimiyat ixlosmandlari toʻplagan, bugun fondlarida oʻn minglab buyumlar bor. Muzey Samarqand davlat muzey-qoʻriqxonasi tarkibiga kiradi.",
      "Ekspozitsiya davrlar boʻyicha joylashgan: tosh va bronza davri, antik Marakanda, soʻgʻd ostadonlari, yozuvli sirlangan oʻrta asr Afrosiyob sopol buyumlari, qurollar, zargarlik buyumlari.\n\nAlohida eʼtiborga loyiq boʻlimlar — numizmatika (turli davrlarga oid 30 mingga yaqin tanga) va etnografiya: matolar, gilamlar, soʻzanalar, liboslar. Rasmlar galereyasida Vasiliy Vereshchagin, Nikolay Karazin va Usto Moʻmin asarlari bor.",
      "1–1,5 soat ajrating. Butun oʻlka tarixini bir martada tushunish uchun yaxshi muzey — sayohat boshida kelgan maʼqul. Chiptalar — muzey-qoʻriqxona narxnomasi boʻyicha.",
    ],
  },

  smkray: {
    en: [
      "The museum occupies an early 20th-century mansion built for the merchant Abram Kalantarov, one of the richest men in Samarkand and a leader of the Bukharan Jewish community. The architect combined a European facade with rich Eastern interiors.",
      "The interiors are an exhibit in themselves: carved and painted ceilings, ganch, stained glass, tiled stoves, mirrors. The halls tell the history of the region from the Stone Age to the 20th century, everyday life and crafts, folk costume and jewellery.\n\nThe natural history section tells about the landscapes of the Zarafshan valley, its mountains, animals and birds.",
      "45–60 minutes is enough. If you are short of time, focus on the mansion's state rooms — hardly any such interiors are left in Samarkand.",
    ],
    uz: [
      "Muzey XX asr boshida Samarqandning eng boy kishilaridan biri, buxorolik yahudiylar jamoasi yetakchisi savdogar Abram Kalantarov uchun qurilgan qasrda joylashgan. Meʼmor yevropacha fasadni boy sharqona ichki bezaklar bilan uygʻunlashtirgan.",
      "Ichki bezaklarning oʻzi koʻrgazma: oʻymakor naqshli shiftlar, ganch, vitrajlar, koshinli pechlar, oynalar. Zallarda oʻlka tarixi tosh davridan XX asrgacha, turmush tarzi va hunarmandchilik, xalq liboslari va taqinchoqlar haqida hikoya qilinadi.\n\nTabiat boʻlimi Zarafshon vodiysi landshaftlari, oʻlkaning togʻlari, hayvonlari va qushlari haqida soʻzlaydi.",
      "45–60 daqiqa yetarli. Agar vaqt kam boʻlsa, qasrning tantanali zallariga eʼtibor qarating — Samarqandda bunday ichki bezaklar deyarli qolmagan.",
    ],
  },

  smbehb: {
    en: [
      "Mahmudkhoja Behbudi (1875–1919) was an enlightener, journalist and playwright, one of the leaders of the Jadids — a movement for the renewal of education and society in Turkestan. He opened “new-method” schools that taught not only religion but also mathematics, geography and languages.\n\nIn 1911 he wrote the play “Padarkush” (“The Patricide”), considered the first Uzbek drama; it was staged in 1914. Behbudi published the newspaper “Samarqand” and the magazine “Oyina” (“The Mirror”). In 1919 he was seized and executed in Karshi on the orders of the Emir of Bukhara.",
      "The house museum has documents, photographs, books and newspapers of the time, and materials on the new schools and the first local press. The exhibition tells of people who, a hundred years before us, dreamed of a literate and open Turkestan.",
      "30–45 minutes is enough. The museum is small and quiet — a good place to understand 20th-century Samarkand, not just the age of Timur.",
    ],
    uz: [
      "Mahmudxoʻja Behbudiy (1875–1919) — maʼrifatparvar, publitsist va dramaturg, Turkistonda taʼlim va jamiyatni yangilash harakati — jadidchilikning yetakchilaridan biri. U nafaqat din, balki matematika, geografiya va tillar oʻqitiladigan “usuli jadid” maktablarini ochgan.\n\n1911-yilda u ilk oʻzbek dramasi hisoblanadigan “Padarkush” pyesasini yozgan; u 1914-yilda sahnalashtirilgan. Behbudiy “Samarqand” gazetasi va “Oyina” jurnalini nashr etgan. 1919-yilda Buxoro amiri buyrugʻi bilan Qarshida qoʻlga olinib, qatl etilgan.",
      "Uy-muzeyda oʻsha davr hujjatlari, suratlari, kitob va gazetalari, yangi maktablar va ilk mahalliy matbuot haqidagi materiallar bor. Ekspozitsiya bizdan yuz yil oldin savodli va ochiq Turkistonni orzu qilgan insonlar haqida hikoya qiladi.",
      "Tomosha uchun 30–45 daqiqa yetarli. Muzey kichik va sokin — faqat Temur davrini emas, XX asr Samarqandini tushunish uchun yaxshi joy.",
    ],
  },

  smayni: {
    en: [
      "Sadriddin Ayni (1878–1954) was a writer, poet and scholar, a classic of Tajik literature who also wrote in Uzbek. He was born near Bukhara, studied at Bukhara madrasas and later became one of the first Soviet writers of Central Asia and the first president of the Tajik Academy of Sciences.\n\nFrom 1923 to 1954 Ayni lived and worked in this house in Samarkand. The museum opened in 1967.",
      "His study, living rooms and personal belongings are preserved. The halls tell of his childhood, education and books — among them “Bukhara”, “Dokhunda”, “Slaves” and “The Death of the Moneylender” — and of the Samarkand of his time. The house itself is a fine example of a town residence with a courtyard.",
      "The museum is on Registan Street, a few minutes from the square. A visit takes 30–60 minutes. Especially interesting for those who have read Ayni or want to understand how Samarkand's intelligentsia lived in the 20th century.",
    ],
    uz: [
      "Sadriddin Ayniy (1878–1954) — yozuvchi, shoir va olim, oʻzbek tilida ham ijod qilgan tojik adabiyoti klassigi. U Buxoro yaqinida tugʻilgan, Buxoro madrasalarida oʻqigan, keyinchalik Oʻrta Osiyoning ilk sovet yozuvchilaridan biri va Tojikiston Fanlar akademiyasining birinchi prezidenti boʻlgan.\n\nAyniy 1923-yildan 1954-yilgacha Samarqanddagi shu uyda yashab, ijod qilgan. Muzey 1967-yilda ochilgan.",
      "Yozuvchining ish xonasi, yashash xonalari va shaxsiy buyumlari saqlangan. Zallarda uning bolaligi, tahsili, kitoblari — jumladan, “Buxoro”, “Doxunda”, “Qullar”, “Sudxoʻrning oʻlimi” — va oʻz davridagi Samarqand haqida hikoya qilinadi. Uyning oʻzi hovlili shahar qoʻrgʻonining yaxshi namunasi.",
      "Muzey Registon koʻchasida, maydondan bir necha daqiqa narida. Tomosha 30–60 daqiqa davom etadi. Ayniyni oʻqiganlar yoki XX asrda Samarqand ziyolilari qanday yashaganini bilmoqchi boʻlganlar uchun ayniqsa qiziq.",
    ],
  },

  smabdu: {
    en: [
      "Hoji Abdulaziz Abdurasulov was a celebrated Samarkand hafiz singer and musician, a master of the classical music of shashmaqom, which lived for centuries at courts and in the homes of connoisseurs. His performance was regarded as a model, and many musicians learned from him.\n\nThe memorial museum in his house in the Kokmachit mahalla was established in 2020.",
      "Photographs, documents, musical instruments and the story of the shashmaqom tradition — the “six maqoms”, complex cycles of songs and instrumental pieces. If you are lucky, the caretaker will play recordings of old performers.",
      "The museum is small; 30–45 minutes is enough. It is not far from the Registan — you can drop in on the way, especially if you are interested in Eastern music.",
    ],
    uz: [
      "Hoji Abdulaziz Abdurasulov — mashhur samarqandlik hofiz va sozanda, saroylarda va ixlosmandlar xonadonlarida asrlar davomida yashab kelgan mumtoz musiqa — shashmaqom ustasi. Uning ijrosi namuna sanalgan, koʻplab sozandalar undan saboq olgan.\n\nKoʻkmachit mahallasidagi uyida yodgorlik muzeyi 2020-yilda tashkil etilgan.",
      "Suratlar, hujjatlar, musiqa asboblari va shashmaqom — “olti maqom”, qoʻshiq va cholgʻu kuylarining murakkab turkumlari anʼanasi haqida hikoya. Omadingiz kelsa, nazoratchi eski ijrochilarning yozuvlarini qoʻyib beradi.",
      "Muzey kichik, 30–45 daqiqa yetarli. U Registondan uzoq emas — ayniqsa Sharq musiqasiga qiziqsangiz, yoʻl-yoʻlakay kirish mumkin.",
    ],
  },

  smabdi: {
    en: [
      "Abdi Darun means “the inner Abdi” — that is, located inside the old city walls. This is the name of a revered 9th-century theologian and judge buried here. There was also an “outer” one — Abdi Berun, outside the city walls.\n\nA mausoleum stands over the grave, and over the centuries a mosque, a khanaka and a courtyard with a hauz — a pool under old trees — grew up around it.",
      "The shady courtyard with its hauz and huge trees is one of the calmest places in Samarkand. People pray, rest and drink tea here. Notice the carved doors and columns of the mosque.",
      "This is a working place of worship: modest dress and quiet. The ruins of Ishratkhana are nearby. Don't confuse it with the Khoja Ahrar ensemble — that is a different place in the south of the city.",
    ],
    uz: [
      "Abdi Darun — “ichkaridagi Abdi”, yaʼni eski shahar devorlari ichida joylashgan degani. Bu yerda dafn etilgan IX asrning hurmatli ilohiyotchisi va qozisini shunday atashadi. Shahar devorlari tashqarisida “tashqaridagi” — Abdi Berun ham boʻlgan.\n\nQabr ustida maqbara turadi, uning atrofida asrlar davomida masjid, xonaqoh va eski daraxtlar soyasidagi hovuzli hovli paydo boʻlgan.",
      "Hovuzli va ulkan daraxtli soya-salqin hovli — Samarqanddagi eng sokin joylardan biri. Bu yerda ibodat qilishadi, dam olishadi va choy ichishadi. Masjidning oʻymakor eshik va ustunlariga eʼtibor bering.",
      "Bu amaldagi ibodat joyi: kamtarona kiyim va sukunat. Yaqinida Ishratxona xarobalari bor. Xoja Ahror ansambli bilan adashtirmang — u shaharning janubidagi boshqa joy.",
    ],
  },

  smmatu: {
    en: [
      "Abu Mansur al-Maturidi (died around 944) was a theologian from Samarkand, the founder of one of the two main schools of Sunni creed — Maturidism. His teaching spread among the Turkic peoples, in Central Asia, Turkey, the Balkans and South Asia.\n\nHe is buried in Samarkand's old Chokardiza cemetery, where many scholars of that time lie. A modern mausoleum stands over the grave, with a garden around it.",
      "The place is quiet and venerated; pilgrims come here from Turkey and other countries. Modest dress. Samarkand's old Jewish quarter with its synagogue is not far away.",
    ],
    uz: [
      "Abu Mansur al-Moturidiy (taxminan 944-yilda vafot etgan) — samarqandlik ilohiyotchi, sunniy aqidaning ikki asosiy maktabidan biri — moturidiylik asoschisi. Uning taʼlimoti turkiy xalqlar orasida, Markaziy Osiyo, Turkiya, Bolqon va Janubiy Osiyoda keng tarqalgan.\n\nU Samarqandning qadimiy Chokardiza qabristonida dafn etilgan, u yerda oʻsha davrning koʻplab olimlari yotadi. Qabr ustida zamonaviy maqbara qurilgan, atrofida xiyobon barpo etilgan.",
      "Joy sokin va muqaddas, bu yerga Turkiya va boshqa mamlakatlardan ziyoratchilar keladi. Kamtarona kiyim. Yaqinida Samarqandning sinagogali eski yahudiylar mahallasi bor.",
    ],
  },

  smtemur: {
    en: [
      "The monument was unveiled in 1996, for the 660th anniversary of Amir Timur (1336–1405). Timur founded a vast state stretching from Asia Minor to India and made Samarkand his capital — the “pearl” of the world, to which the best craftsmen were brought. In independent Uzbekistan he has become a symbol of statehood.",
      "The bronze Timur sits on a throne, wearing a crown and holding a sword. The monument stands at the start of University Boulevard, opposite Gur-e Amir with its turquoise dome. In the evening the square is lit up and townspeople stroll around.",
      "Uzbekistan has three large monuments to Timur: in Tashkent he is on horseback, in Shahrisabz he stands, and in Samarkand he sits on a throne, as a ruler in his capital.",
      "The best photo is in the evening, when the lights come on. From here it is 5 minutes to Gur-e Amir and 15 minutes to the Registan.",
    ],
    uz: [
      "Haykal 1996-yilda, Amir Temur (1336–1405) tavalludining 660 yilligiga bagʻishlab ochilgan. Temur Kichik Osiyodan Hindistongacha choʻzilgan ulkan saltanat barpo etgan va Samarqandni oʻz poytaxti — eng yaxshi ustalar toʻplangan dunyo “gavhari”ga aylantirgan. Mustaqil Oʻzbekistonda u davlatchilik ramziga aylangan.",
      "Bronza Temur toj kiygan va qilich tutgan holda taxtda oʻtiribdi. Haykal Universitet xiyobonining boshida, firuza gumbazli Goʻri Amir qarshisida turibdi. Kechqurun maydon yoritiladi, atrofda shahar ahli sayr qiladi.",
      "Oʻzbekistonda Temurning uchta katta haykali bor: Toshkentda u otda, Shahrisabzda tik turgan holda, Samarqandda esa oʻz poytaxtidagi hukmdor sifatida taxtda oʻtirgan holda tasvirlangan.",
      "Eng yaxshi surat — yoritish yoqilgan kechqurun. Bu yerdan Goʻri Amirgacha 5 daqiqa, Registongacha 15 daqiqa.",
    ],
  },

  smbulv: {
    en: [
      "After 1868, when Samarkand became part of the Russian Empire, a “new” European town with straight streets and boulevards began to be built west of the old city. Its main avenue was a boulevard long known as Abramovsky — after General Alexander Abramov, the first head of the Zarafshan district. Today it is University Boulevard: the main building of Samarkand State University stands on it.",
      "A shady avenue of old plane trees, benches and mansions of the late 19th and early 20th centuries with brick facades and wrought-iron balconies — among them the elegant former Russo-Chinese Bank. At the start of the boulevard is the Amir Timur monument, with Gur-e Amir nearby. In the evening families and students stroll here.",
      "A good place for an evening walk after Gur-e Amir. The Registan is about 15 minutes' walk away. On summer days it is noticeably cooler in the shade of the plane trees than on the open squares.",
    ],
    uz: [
      "1868-yildan keyin, Samarqand Rossiya imperiyasi tarkibiga kirgach, eski shaharning gʻarbida toʻgʻri koʻcha va xiyobonli “yangi” yevropacha shahar qurila boshlangan. Uning bosh xiyoboni uzoq vaqt Zarafshon okrugining birinchi boshligʻi general Aleksandr Abramov nomi bilan Abramov xiyoboni deb atalgan. Bugun bu Universitet xiyoboni: unda Samarqand davlat universitetining bosh binosi joylashgan.",
      "Keksa chinorlar soyasidagi xiyobon, oʻrindiqlar, gʻisht fasadli va temir panjarali balkonli XIX asr oxiri — XX asr boshlariga oid qasrlar, jumladan, nafis sobiq Rus-Xitoy banki binosi. Xiyobon boshida Amir Temur haykali, yaqinida Goʻri Amir. Kechqurun bu yerda oilalar va talabalar sayr qiladi.",
      "Goʻri Amirdan keyin kechki sayr uchun yaxshi joy. Registongacha piyoda 15 daqiqacha. Yoz kunlari chinorlar soyasida ochiq maydonlarga qaraganda ancha salqin.",
    ],
  },

  smchrs: {
    en: [
      "Chorsu — “four roads” — was the name given in Central Asian cities to covered trading domes at crossroads. Samarkand's Chorsu was built in the 18th century, under the Bukharan ruler Shahmurad, right behind the Sher-Dor madrasa. Under its hexagonal dome headgear was sold — skullcaps and turbans.\n\nIn 2005 the dome was restored and an art gallery opened inside.",
      "A round hall under the dome, now used to show paintings, graphics, ceramics and embroidery by artists from Samarkand and all over Uzbekistan. Exhibitions change, and master classes are sometimes held. The dome itself is beautifully lit in the evening from the Registan side.",
      "Drop in right after the Registan — it is two steps behind Sher-Dor. 20–45 minutes is enough. Some of the works are for sale.",
    ],
    uz: [
      "Chorsu — “toʻrt yoʻl” — Oʻrta Osiyo shaharlarida chorrahalardagi yopiq savdo gumbazlari shunday atalgan. Samarqand Chorsusi XVIII asrda, Buxoro hukmdori Shohmurod davrida, Sherdor madrasasining naq ortida qurilgan. Uning olti qirrali gumbazi ostida bosh kiyimlar — doʻppi va sallalar sotilgan.\n\n2005-yilda gumbaz taʼmirlanib, ichida badiiy galereya ochilgan.",
      "Gumbaz ostidagi dumaloq zal, bu yerda endi Samarqand va butun Oʻzbekiston rassomlarining rangtasvir, grafika, kulolchilik va kashtachilik asarlari namoyish etiladi. Koʻrgazmalar almashib turadi, baʼzan mahorat darslari oʻtkaziladi. Gumbazning oʻzi kechqurun Registon tomondan chiroyli yoritiladi.",
      "Registondan keyin darhol kiring — u Sherdor ortida, ikki qadamda. Tomosha uchun 20–45 daqiqa yetarli. Asarlarning bir qismini sotib olish mumkin.",
    ],
  },

  smhudj: {
    en: [
      "The workshop's name refers to “Hujum” — the 1920s movement for the emancipation of women. Mostly women work here: they hand-weave silk and wool carpets to old patterns from Samarkand, Bukhara and other cities.",
      "The whole life of a carpet: how silk cocoons are unwound, how threads are dyed with natural dyes — pomegranate peel, walnut shells, indigo, madder — and how the knots are tied. A medium-sized silk carpet takes months: a square centimetre can hold hundreds of knots.\n\nThe showroom has carpets, suzani and other textiles.",
      "It is best to arrange a tour in advance. You don't have to buy a carpet — it is interesting just to watch. If you do buy one, ask for an export certificate: handmade carpets may require documents when taken out of the country.",
    ],
    uz: [
      "Ustaxona nomi 1920-yillardagi ayollar ozodligi uchun harakat — “Hujum”ga ishora qiladi. Bu yerda asosan ayollar ishlaydi: ular Samarqand, Buxoro va boshqa shaharlarning qadimiy naqshlari asosida qoʻlda ipak va jun gilamlar toʻqiydi.",
      "Gilamning butun yoʻli: pilla qanday chuvaladi, iplar tabiiy boʻyoqlar — anor poʻsti, yongʻoq poʻchogʻi, indigo, roʻyan bilan qanday boʻyaladi va tugunlar qanday bogʻlanadi. Oʻrtacha kattalikdagi ipak gilamga oylar ketadi: bir kvadrat santimetrda yuzlab tugun boʻladi.\n\nShourumda gilamlar, soʻzanalar va boshqa matolar bor.",
      "Ekskursiyani oldindan kelishib olgan maʼqul. Gilam sotib olish shart emas — shunchaki tomosha qilish ham qiziq. Agar sotib olsangiz, olib chiqish uchun sertifikat soʻrang: qoʻlda toʻqilgan gilamlarni mamlakatdan olib chiqishda hujjat talab qilinishi mumkin.",
    ],
  },

  smwine: {
    en: [
      "The winery was founded in 1868 by the merchant Dmitry Filatov — one of the oldest wineries in Central Asia. Its wines won awards at international exhibitions. Later the winery was named after Mikhail Khovrenko, a winemaker who worked here for many years and created well-known dessert and fortified wines from local grapes.",
      "The museum has old winemakers' tools, barrels, labels, medals and awards. Most interesting are the bottles from Filatov's hidden cache, found during repairs in 1967. After the tour there is a tasting of several wines and brandies.",
      "The tasting is for adults only. A tour with tasting takes 1–1.5 hours; check tour times in advance. You can buy the wine you like on site.",
    ],
    uz: [
      "Vino zavodini 1868-yilda savdogar Dmitriy Filatov tashkil etgan — bu Markaziy Osiyodagi eng qadimiy vino zavodlaridan biri. Uning vinolari xalqaro koʻrgazmalarda mukofotlar olgan. Keyinchalik zavodga bu yerda koʻp yillar ishlagan va mahalliy uzumdan mashhur desert va kuchli vinolar yaratgan vinochi Mixail Xovrenko nomi berilgan.",
      "Muzeyda vinochilarning eski asboblari, bochkalar, yorliqlar, medallar va mukofotlar bor. Eng qiziqi — 1967-yilda taʼmirlash paytida topilgan Filatov yashirin xazinasidagi shishalar. Tomoshadan keyin bir necha vino va konyak tatib koʻriladi.",
      "Tatib koʻrish faqat voyaga yetganlar uchun. Tatib koʻrish bilan ekskursiya 1–1,5 soat davom etadi; ekskursiya vaqtini oldindan aniqlang. Yoqqan vinoni joyida sotib olish mumkin.",
    ],
  },

  smsilk: {
    en: [
      "The Silk Road Samarkand tourist complex opened in 2022 in the east of the city; in September of that year it hosted the summit of the Shanghai Cooperation Organisation. The complex has hotels, a congress hall, restaurants, canals and embankments.\n\nAt its centre is the “Eternal City” (Boqiy Shahar): newly built lanes, workshops and teahouses in the spirit of old Samarkand.",
      "In the Eternal City craftsmen are at work — potters, blacksmiths, weavers, embroiderers — and there are performances and evening shows. The embankments and canals are pleasant for a stroll, especially after sunset, when everything is lit up.",
      "This is a modern complex, not a historic monument — think of it as a place to relax. It is best to come towards evening and allow 2–4 hours. About 20 minutes by taxi from the centre.",
    ],
    uz: [
      "Silk Road Samarkand turistik majmuasi 2022-yilda shaharning sharqida ochilgan; oʻsha yilning sentabrida bu yerda Shanxay hamkorlik tashkilotining sammiti boʻlib oʻtgan. Majmuada mehmonxonalar, kongress-xoll, restoranlar, kanallar va sohilboʻyi yoʻlaklari bor.\n\nMarkazida — “Boqiy shahar”: eski Samarqand ruhida qayta qurilgan torkoʻchalar, ustaxonalar va choyxonalar.",
      "“Boqiy shahar”da hunarmandlar — kulollar, temirchilar, toʻquvchilar, kashtachilar ishlaydi, tomoshalar va kechki shoular boʻladi. Sohilboʻyi va kanallar boʻylab sayr qilish yoqimli, ayniqsa quyosh botgach, hamma yoq yoritilganda.",
      "Bu tarixiy yodgorlik emas, zamonaviy majmua — unga dam olish joyi sifatida qarang. Kechga yaqin kelib, 2–4 soat ajratgan maʼqul. Markazdan taksida 20 daqiqacha.",
    ],
  },

  smbukh: {
    en: [
      "Muhammad ibn Ismail al-Bukhari (810–870) was born in Bukhara and spent most of his life travelling the Islamic world collecting hadiths — accounts of the words and deeds of the Prophet Muhammad. He is said to have studied hundreds of thousands of hadiths and selected only a few thousand of the most reliable. This is how the “Sahih al-Bukhari” came about — a collection Sunnis revere second only to the Quran.\n\nAt the end of his life the imam settled in the village of Khartang near Samarkand, where he died. His grave was a place of pilgrimage for centuries; in 1998 a new memorial complex was built over it, and in the 2020s it was greatly expanded.",
      "A mausoleum with a tiled dome, a large mosque, a courtyard with galleries and a garden. The museum halls display old manuscripts and editions of the Quran and hadiths, and gifts from delegations of different countries.",
      "The complex is 25 km north of Samarkand — allow half a day including the road. It is one of the country's main places of pilgrimage: strict dress code, women need a headscarf, and there are many worshippers on Friday afternoons. Entry is free.",
    ],
    uz: [
      "Muhammad ibn Ismoil al-Buxoriy (810–870) Buxoroda tugʻilgan va umrining katta qismini islom olamini kezib, hadislar — paygʻambar Muhammadning soʻz va ishlari haqidagi rivoyatlarni toʻplash bilan oʻtkazgan. Aytishlaricha, u yuz minglab hadisni oʻrgangan va ulardan faqat bir necha ming eng ishonchlisini saralab olgan. Shu tariqa “Sahihi Buxoriy” — sunniylar Qurʼondan keyin eng ulugʻ biladigan toʻplam yuzaga kelgan.\n\nUmrining oxirida imom Samarqand yaqinidagi Xartang qishlogʻida yashagan va shu yerda vafot etgan. Uning qabri asrlar davomida ziyoratgoh boʻlgan; 1998-yilda uning ustida yangi yodgorlik majmuasi qurilgan, 2020-yillarda esa u ancha kengaytirilgan.",
      "Koshinli gumbazli maqbara, katta masjid, ravoqli hovli va bogʻ. Muzey zallarida Qurʼon va hadislarning qadimiy qoʻlyozmalari va nashrlari, turli mamlakatlar delegatsiyalarining sovgʻalari bor.",
      "Majmua Samarqanddan 25 km shimolda — yoʻl bilan birga yarim kun ajrating. Bu mamlakatning asosiy ziyoratgohlaridan biri: qatʼiy kiyinish qoidasi, ayollarga roʻmol shart, juma kuni tushda ibodat qiluvchilar koʻp. Kirish bepul.",
    ],
  },

  smmakh: {
    en: [
      "Makhdumi Azam — “the Greatest Master” — was the title of Sheikh Ahmad Kasani (1461–1542), one of the leading teachers of the Naqshbandi Sufi order in the 16th century. He lived and taught in Dahbed near Samarkand, and after his death his grave became a place of pilgrimage.\n\nAccording to local sources, the mosque of the ensemble was built in 1619 under the ruler Yalangtush Bahadur — the same who built Sher-Dor and Tilla-Kori on the Registan.",
      "A mausoleum, a mosque, a shady courtyard and an old cemetery. A peaceful place without tourist crowds, where you can see the living tradition of pilgrimage.",
      "Dahbed is about 15 km north of Samarkand; easy to combine with the Imam al-Bukhari complex. Modest dress; check on site which parts are open to visitors.",
    ],
    uz: [
      "Mahdumi Aʼzam — “Ulugʻ hazrat” — XVI asrda Naqshbandiya soʻfiylik tariqatining yetakchi murshidlaridan biri shayx Ahmad Kosoniy (1461–1542) shunday atalgan. U Samarqand yaqinidagi Dahbedda yashab, taʼlim bergan, vafotidan keyin uning qabri ziyoratgohga aylangan.\n\nMahalliy maʼlumotlarga koʻra, ansambl masjidi 1619-yilda Registondagi Sherdor va Tillakorini qurdirgan hukmdor Yalangtoʻsh Bahodir davrida qurilgan.",
      "Maqbara, masjid, soya-salqin hovli va eski qabriston. Sayyohlar olomonisiz, ziyorat anʼanasini jonli koʻrish mumkin boʻlgan sokin joy.",
      "Dahbed Samarqanddan taxminan 15 km shimolda; Imom Buxoriy majmuasi bilan birga koʻrish qulay. Kamtarona kiyim; qaysi qismlar tashrif buyuruvchilar uchun ochiqligini joyida aniqlang.",
    ],
  },

  smdaud: {
    en: [
      "Hazrati Daud is a cave high in the mountains about 40 km south-west of Samarkand, revered by Muslims and by people of other faiths. It is associated with the Prophet Daud (King David): according to tradition, he prayed here while hiding from his enemies.",
      "A long stone staircase of hundreds of steps leads to the cave — the climb takes about an hour. Inside, handprints in the stone are shown. From the top there is a wide view of the mountains and the valley.",
      "It is said that when Daud was pursued by his enemies, the rock opened before him and hid him in the cave, and where he touched the stone, the prints of his hands remained. Pilgrims believe that prayers said here are answered.",
      "You need comfortable shoes and water. In summer climb early in the morning — the staircase gets hot. At the bottom you will be offered a ride up on a donkey. This is a holy place: modest dress, silence in the cave. Plan half a day including the road.",
    ],
    uz: [
      "Hazrati Dovud — Samarqanddan taxminan 40 km janubi-gʻarbda, togʻda baland joylashgan, musulmonlar va boshqa dindagilar ham ziyorat qiladigan gʻor. U Dovud paygʻambar (podshoh Dovud) bilan bogʻlanadi: rivoyatga koʻra, u dushmanlaridan yashirinib, shu yerda ibodat qilgan.",
      "Gʻorga yuzlab zinadan iborat uzun tosh zinapoya olib chiqadi — koʻtarilish bir soatga yaqin davom etadi. Ichkarida toshdagi kaft izlarini koʻrsatishadi. Tepadan togʻlar va vodiyning keng manzarasi ochiladi.",
      "Aytishlaricha, Dovudni dushmanlari taʼqib qilganda qoya uning oldida yorilib, uni gʻorga yashirgan, u toshga tekkan joylarda esa qoʻl izlari qolgan. Ziyoratchilar bu yerda qilingan duo ijobat boʻladi, deb ishonishadi.",
      "Qulay poyabzal va suv kerak. Yozda erta tongda chiqing — zinapoyada issiq boʻladi. Pastda eshakda chiqishni taklif qilishadi. Bu muqaddas joy: kamtarona kiyim, gʻorda sukunat. Yoʻl bilan birga yarim kun rejalashtiring.",
    ],
  },

  smchor: {
    en: [
      "Chor-Chinor means “four plane trees”. This is the name of an old garden in Urgut, at the foot of the Zarafshan range, where giant plane trees grow by a spring. Locals believe the oldest of them are many centuries old. Next to it stands a mosque begun in the early 20th century.",
      "Trees with enormous trunks — it is said several people can fit inside the hollows of some of them. A pond of spring water with fish swimming in it, and shady platforms for tea.",
      "Urgut is a 40-minute drive from Samarkand. The trip is easy to combine with the Urgut Bazaar — one of the largest and most colourful in the country, especially lively at weekends. Fabrics, suzani and antiques are sold there.",
    ],
    uz: [
      "Chor Chinor — “toʻrt chinor” degani. Urgutda, Zarafshon tizmasi etagida buloq yonida ulkan chinorlar oʻsadigan qadimiy bogʻ shunday ataladi. Mahalliy aholi ularning eng keksalari bir necha asrlik deb hisoblaydi. Yonida XX asr boshida qurila boshlangan masjid bor.",
      "Tanasi ulkan daraxtlar — aytishlaricha, ayrimlarining kovagiga bir necha kishi sigʻadi. Baliqlar suzib yuradigan buloq suvli hovuz, choy ichish uchun soya-salqin supalar.",
      "Urgut Samarqanddan mashinada 40 daqiqa. Sayohatni Urgut bozori bilan birga qilish qulay — u mamlakatdagi eng katta va rang-barang bozorlardan biri, ayniqsa dam olish kunlari gavjum. U yerda matolar, soʻzanalar va antikvar buyumlar sotiladi.",
    ],
  },

  smdabu: {
    en: [
      "Dabusiya was a medieval town on the road from Samarkand to Bukhara, on the banks of the Zarafshan. It is mentioned by the Arab geographers who described Mawarannahr: the town stood on an important trade route and guarded the valley from the west. Over time life here faded, and all that remains of the town are high earthen mounds.",
      "The citadel mound, remains of ramparts and walls, excavation trenches. From the top you can see the Zarafshan valley. A place for those who love archaeology and open, empty landscapes.",
      "This is an undeveloped archaeological site: no ticket office, no shade, no toilets. You need comfortable shoes and water; check the access road in advance and, if in doubt, take a guide.",
    ],
    uz: [
      "Dabusiya — Samarqanddan Buxoroga boradigan yoʻldagi, Zarafshon boʻyidagi oʻrta asr shahri. Uni Movarounnahrni tasvirlagan arab geograflari tilga oladi: shahar muhim savdo yoʻlida joylashgan va vodiyni gʻarbdan himoya qilgan. Vaqt oʻtishi bilan bu yerda hayot soʻngan va shahardan baland tuproq tepaliklar qolgan.",
      "Ark tepaligi, devor va qoʻrgʻon qoldiqlari, qazishmalar. Tepadan Zarafshon vodiysi koʻrinadi. Arxeologiya va keng, kimsasiz manzaralarni sevuvchilar uchun joy.",
      "Bu obodonlashtirilmagan arxeologik yodgorlik: kassa ham, soya ham, hojatxona ham yoʻq. Qulay poyabzal va suv kerak; yoʻlni oldindan aniqlang, ikkilansangiz, gid oling.",
    ],
  },

  smravt: {
    en: [
      "Ravatkhoja is a village in the Urgut district, on one of the old routes through the Zarafshan valley. Since ancient times the river's water has been divided into canals here, and the crossing mattered to the whole area. There is little written information about the bridge itself — we will not invent dates.",
      "The old structure of the bridge, the river and the rural landscapes around — especially lovely in spring, when everything is in bloom, and in autumn.",
      "Do not step onto closed or unsafe sections. It is best to visit with a local driver or guide who knows the way.",
    ],
    uz: [
      "Ravotxoʻja — Urgut tumanidagi, Zarafshon vodiysi orqali oʻtgan qadimiy yoʻllardan biridagi qishloq. Bu yerda qadimdan daryo suvi kanallarga boʻlingan va kechuv butun atrof uchun muhim boʻlgan. Koʻprikning oʻzi haqida yozma maʼlumotlar kam — sanalarni toʻqib chiqarmaymiz.",
      "Koʻprikning qadimiy qurilmasi, daryo va atrofdagi qishloq manzaralari — ayniqsa hamma yoq gullaydigan bahorda va kuzda goʻzal.",
      "Yopiq va xavfli qismlarga chiqmang. Yoʻlni biladigan mahalliy haydovchi yoki gid bilan borgan maʼqul.",
    ],
  },
};
