import type { ЗаписьРегиона } from "./core";

/**
 * Места региона из каталога владельца, сверенные с Wikidata и OpenStreetMap.
 * Описания — на русском, английском и узбекском. Собрано из рабочих
 * файлов импорта; правьте тексты здесь, точки — по карте.
 */
export const МЕСТА_СЫРДАРЬИ: ЗаписьРегиона[] = [
  {
    id: "sy-sardoba",
    name: "Сардоба Ёгочли",
    city: "Гулистан",
    type: "История",
    geo: { lat: 40.324454, lon: 68.110663 },
    district: "Сардобинский район",
    entry: "Бесплатно",
    время: "20–30 минут",
    далеко: true,
    desc: "Старинное купольное водохранилище XVI века в посёлке Гумбаз Сардобинского района, прямо у трассы Ташкент — Самарканд. Сардобы строили при Абдулла-хане вдоль караванных путей через безводную Голодную степь: в глубокий резервуар под кирпичным куполом собирали воду, которая оставалась прохладной в любую жару. Ёгочли — одна из трёх сохранившихся сардоб Мирзачуля, по ней и назван район. Внутрь можно спуститься и оценить акустику купола; пить воду сейчас нельзя.",
    en: { name: "Yogochli Sardoba", desc: "A 16th-century domed water cistern in the settlement of Gumbaz in Sardoba district, right by the Tashkent–Samarkand highway. Sardobas were built under Abdullah Khan along caravan routes across the waterless Hungry Steppe: water was collected in a deep reservoir under a brick dome and stayed cool in any heat. Yogochli is one of three surviving sardobas of Mirzachul, and the district is named after them. You can step inside and test the dome's acoustics; the water is not drinkable today." },
    uz: { name: "Yogʻochli sardoba", desc: "Sardoba tumanining Gumbaz shaharchasida, Toshkent — Samarqand yoʻli yonida joylashgan XVI asrga oid gumbazli suv ombori. Sardobalar Abdullaxon davrida suvsiz Mirzachoʻl orqali oʻtgan karvon yoʻllari boʻylab qurilgan: gʻisht gumbaz ostidagi chuqur hovuzga suv yigʻilgan va u har qanday jaziramada salqin turgan. Yogʻochli — Mirzachoʻlda saqlanib qolgan uchta sardobadan biri, tuman ham shu nom bilan atalgan. Ichkariga tushib, gumbaz akustikasini sinab koʻrish mumkin; suvni hozir ichib boʻlmaydi." },
    wikidata: "Q115819386",
  },
  {
    id: "sy-museum",
    name: "Музей истории и культуры Сырдарьинской области",
    city: "Гулистан",
    type: "Музей",
    geo: { lat: 40.49401, lon: 68.77132 },
    время: "1 час",
    desc: "Областной музей в центре Гулистана, рассказывающий историю края от древности до наших дней. Археологические находки напоминают, что здесь проходили караванные пути и стояли города Уструшаны, а большой раздел посвящён освоению Голодной степи — Мирзачуля — в XX веке, когда безводную пустыню превратили в хлопковый край каналами и новыми городами. Есть этнографические залы с костюмами, утварью и ремёслами. Хорошая отправная точка для знакомства с областью.",
    en: { name: "Syrdarya Regional History and Culture Museum", desc: "The regional museum in central Gulistan, telling the story of the land from antiquity to the present. Archaeological finds recall the caravan routes and the towns of Ustrushana that once stood here, and a large section is devoted to the 20th-century development of the Hungry Steppe — Mirzachul — when canals and new towns turned the waterless desert into cotton country. Ethnographic rooms show costumes, household objects and crafts. A good starting point for getting to know the region." },
    uz: { name: "Sirdaryo viloyati tarixi va madaniyati davlat muzeyi", desc: "Gulistan markazidagi viloyat muzeyi oʻlka tarixini qadimdan bugungi kungacha hikoya qiladi. Arxeologik topilmalar bu yerdan karvon yoʻllari oʻtganini va Ustrushona shaharlari boʻlganini eslatadi, katta boʻlim esa XX asrda suvsiz choʻl kanallar va yangi shaharlar bilan paxta oʻlkasiga aylantirilgan Mirzachoʻlning oʻzlashtirilishiga bagʻishlangan. Kiyimlar, roʻzgʻor buyumlari va hunarlar namoyish etilgan etnografiya zallari bor. Viloyat bilan tanishuvni boshlash uchun yaxshi joy." },
  },
  {
    id: "sy-church",
    name: "Храм Николая Чудотворца в Гулистане",
    city: "Гулистан",
    type: "Церковь",
    geo: { lat: 40.497211, lon: 68.767517 },
    время: "20–30 минут",
    свято: true,
    desc: "Действующий православный храм Гулистана с непростой историей. Большую кирпичную церковь, построенную здесь в 1890 году, снесли в 1930-х, и в 1945 году община за несколько месяцев возвела из сырцового кирпича новый молитвенный дом. В 1955 году его освятили в честь святителя Николая, позже пристроили притвор и подняли кресты. Небольшой храм напоминает о русских переселенцах, осваивавших Голодную степь. Одежда закрытая, женщинам — платок; во время службы не фотографируйте.",
    en: { name: "St Nicholas Church, Gulistan", desc: "A working Orthodox church in Gulistan with an eventful history. The large brick church built here in 1890 was demolished in the 1930s, and in 1945 the community built a new prayer house of mud brick within a few months. In 1955 it was consecrated to St Nicholas, and a narthex was added and crosses raised later. The small church recalls the Russian settlers who developed the Hungry Steppe. Dress modestly, women should cover their hair, and do not take photos during services." },
    uz: { name: "Gulistondagi Avliyo Nikolay cherkovi", desc: "Gulistondagi murakkab tarixga ega amaldagi pravoslav cherkovi. Bu yerda 1890-yilda qurilgan katta gʻisht cherkov 1930-yillarda buzib tashlangan, 1945-yilda esa jamoa bir necha oy ichida xom gʻishtdan yangi ibodat uyini qurgan. 1955-yilda u Avliyo Nikolay nomiga bagʻishlangan, keyinroq dahliz qoʻshilib, xochlar oʻrnatilgan. Kichik cherkov Mirzachoʻlni oʻzlashtirgan rus koʻchmanchilarini eslatadi. Kiyim yopiq, ayollar — roʻmolda; ibodat paytida suratga olmang." },
    wikidata: "Q122171929",
  },
  {
    id: "sy-navoi",
    name: "Памятник Алишеру Навои в Гулистане",
    city: "Гулистан",
    type: "Памятник",
    geo: { lat: 40.49586, lon: 68.77621 },
    entry: "Бесплатно",
    время: "15–30 минут",
    desc: "Памятник великому поэту и мыслителю Алишеру Навои (1441–1501), основоположнику литературы на староузбекском языке, в центре Гулистана. Вокруг разбита аллея «Билимдонлар маскани» — «Обитель знатоков» — с цветниками и скамейками, а рядом стоит областная библиотека его имени. Это любимое место вечерних прогулок горожан и встреч студентов. Удобно осмотреть вместе с областным музеем, который находится в нескольких минутах ходьбы.",
    en: { name: "Alisher Navoi Monument, Gulistan", desc: "A monument to the great poet and thinker Alisher Navoi (1441–1501), founder of literature in the Chagatai Uzbek language, in central Gulistan. Around it lies the 'Bilimdonlar Maskani' — 'Abode of the Learned' — avenue with flowerbeds and benches, and the regional library named after him stands nearby. It is a favourite place for evening walks and student meetups. Easy to combine with the regional museum, a few minutes' walk away." },
    uz: { name: "Gulistondagi Alisher Navoiy haykali", desc: "Gulistan markazidagi eski oʻzbek tilidagi adabiyot asoschisi, buyuk shoir va mutafakkir Alisher Navoiy (1441–1501) haykali. Atrofida gulzor va oʻrindiqlar bilan «Bilimdonlar maskani» xiyoboni barpo etilgan, yonida esa uning nomidagi viloyat kutubxonasi joylashgan. Bu shaharliklarning kechki sayr va talabalarning uchrashuv joyi. Bir necha daqiqalik yoʻldagi viloyat muzeyi bilan birga koʻrish qulay." },
  },
  {
    id: "sy-bibikhadija",
    name: "Мавзолей Биби Хадичи в Хавасабаде",
    city: "Гулистан",
    type: "Мавзолей",
    geo: { lat: 40.19728, lon: 68.82407 },
    district: "Хавастский район",
    время: "30–45 минут",
    свято: true,
    далеко: true,
    desc: "Почитаемая сельская святыня в кишлаке Хавасабад Хавастского района, на юге области у подножия Туркестанского хребта. Купольный мавзолей стоит в саду с прудом, а рядом — терраса-айван на резных колоннах, где отдыхают паломники. В том же кишлаке находятся мавзолеи Шер-бобо и Юсуф-бобо, так что можно обойти все три святыни за одну поездку. Место тихое и тенистое; одежда закрытая, женщинам — платок.",
    en: { name: "Bibi Khadicha Mausoleum, Khavosobod", desc: "A revered village shrine in Khavosobod, Khavast district, in the south of the region at the foot of the Turkestan range. The domed mausoleum stands in a garden with a pond, beside an iwan terrace on carved columns where pilgrims rest. The mausoleums of Sher Bobo and Yusuf Bobo are in the same village, so all three shrines fit into one trip. It is a quiet, shady place; dress modestly, and women should cover their hair." },
    uz: { name: "Xovosoboddagi Bibi Xadicha maqbarasi", desc: "Viloyat janubida, Turkiston tizmasi etagidagi Xovos tumani Xovosobod qishlogʻidagi eʼzozli qishloq ziyoratgohi. Gumbazli maqbara hovuzli bogʻda turadi, yonida ziyoratchilar dam oladigan oʻymakor ustunli ayvon bor. Shu qishloqda Sher bobo va Yusuf bobo maqbaralari ham joylashgan, uchala ziyoratgohni bir safarda aylanib chiqish mumkin. Bu yer sokin va soyali; kiyim yopiq, ayollar — roʻmolda." },
  },
];
