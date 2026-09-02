import { GREEN } from "@/lib/theme";
import type { Hotel, Place, Restaurant, Route } from "@/lib/types";

/**
 * Содержимое приложения.
 *
 * Всё лежит здесь, а не в базе: пока нет админ-панели, править контент
 * проще в одном типизированном файле, чем через миграции. Когда панель
 * появится, эти массивы заменит выборка — типы останутся теми же.
 */

export const PLACES: Place[] = [
  { id:"reg",   name:"Площадь Регистан",         city:"Самарканд", type:"История",      rating:4.9, reviews:12847, distance:"0.3 км", entry:"$8",        hours:"08:00–19:00", audio:true,  qr:true,  img:"https://images.unsplash.com/photo-1664602078796-68ee76b3fc59?w=700&h=480&fit=crop&auto=format",  desc:"Сердце древнего Самарканда — три великолепных медресе, украшенных лучшей мозаичной плиткой в мире. Объект Всемирного наследия ЮНЕСКО." },
  { id:"shah",  name:"Шахи-Зинда",               city:"Самарканд", type:"Мечеть",       rating:4.8, reviews:8392,  distance:"1.2 км", entry:"$5",        hours:"08:00–18:00", audio:true,  qr:true,  img:"https://images.unsplash.com/photo-1728029062560-4b0e2b958885?w=700&h=480&fit=crop&auto=format",  desc:"Аллея мавзолеев — священный некрополь с куполами бирюзовых плиток, охватывающий семь веков исламского искусства." },
  { id:"ark",   name:"Бухарская Арка",           city:"Бухара",    type:"Крепость",     rating:4.7, reviews:6128,  distance:"0.5 км", entry:"$6",        hours:"09:00–18:00", audio:true,  qr:true,  img:"https://images.unsplash.com/photo-1653023102302-247f5f0fbdd1?w=700&h=480&fit=crop&auto=format",  desc:"Гигантская крепость, служившая резиденцией эмиров Бухары на протяжении 14 веков." },
  { id:"ikhon", name:"Ичан-Кала",                city:"Хива",      type:"Старый город", rating:4.9, reviews:9441,  distance:"0 км",   entry:"$12",       hours:"Всегда",      audio:true,  qr:true,  img:"https://images.unsplash.com/photo-1654861857666-1e8c438cbe4a?w=700&h=480&fit=crop&auto=format",  desc:"Внутренний обнесённый стеной город Хивы — живой музей, застывший во времени. Объект Всемирного наследия ЮНЕСКО." },
  { id:"kalon", name:"Минарет Калян",            city:"Бухара",    type:"Мечеть",       rating:4.8, reviews:7103,  distance:"0.2 км", entry:"Бесплатно", hours:"Всегда",      audio:true,  qr:true,  img:"https://images.unsplash.com/photo-1719995153986-63e529a32585?w=700&h=480&fit=crop&auto=format",  desc:"«Башня смерти» — 800-летний минарет, который даже Чингисхан отказался разрушить." },
  { id:"gur",   name:"Гур-э-Амир",              city:"Самарканд", type:"Мавзолей",     rating:4.8, reviews:5920,  distance:"0.6 км", entry:"$5",        hours:"08:00–18:00", audio:true,  qr:true,  img:"https://images.unsplash.com/photo-1728029062560-4b0e2b958885?w=700&h=480&fit=crop&auto=format",  desc:"Мавзолей Тамерлана — шедевр тимуридской архитектуры с бирюзовым куполом высотой 34 метра." },
  { id:"chrvk", name:"Чарвакское водохранилище", city:"Чарвак",    type:"Природа",      rating:4.9, reviews:4210,  distance:"60 км",  entry:"Бесплатно", hours:"Всегда",      audio:false, qr:false, img:"https://images.unsplash.com/photo-1728281711729-a3b3424e6c1e?w=700&h=480&fit=crop&auto=format",  desc:"Живописное горное озеро в 80 км от Ташкента — идеально для пляжного отдыха и активного туризма." },
  { id:"tash",  name:"Площадь Мустакиллик",     city:"Ташкент",   type:"Площадь",      rating:4.6, reviews:3540,  distance:"1.0 км", entry:"Бесплатно", hours:"Всегда",      audio:false, qr:false, img:"https://images.unsplash.com/photo-1622030797403-fa221ce5d208?w=700&h=480&fit=crop&auto=format",  desc:"Главная площадь Ташкента — символ независимости Узбекистана, обрамлённый парками и фонтанами." },
  { id:"bibi",  name:"Мечеть Биби-Ханым",       city:"Самарканд", type:"Мечеть",       rating:4.7, reviews:6240,  distance:"0.9 км", entry:"$4",        hours:"08:00–18:00", audio:true,  qr:true,  img:"https://images.unsplash.com/photo-1664602078796-68ee76b3fc59?w=700&h=480&fit=crop&auto=format",  desc:"Грандиозная соборная мечеть Тамерлана, построенная в 1399–1404 гг. Когда-то крупнейшая мечеть в исламском мире." },
  { id:"ulug",  name:"Обсерватория Улугбека",   city:"Самарканд", type:"Музей",        rating:4.6, reviews:3820,  distance:"3.5 км", entry:"$3",        hours:"09:00–18:00", audio:true,  qr:false, img:"https://images.unsplash.com/photo-1728029062560-4b0e2b958885?w=700&h=480&fit=crop&auto=format",  desc:"Астрономическая обсерватория XV в. — Улугбек составил здесь звёздный каталог, опередив Европу на 150 лет." },
  { id:"labi",  name:"Ляби-Хауз",               city:"Бухара",    type:"Площадь",      rating:4.7, reviews:5180,  distance:"0.3 км", entry:"Бесплатно", hours:"Всегда",      audio:false, qr:false, img:"https://images.unsplash.com/photo-1653023102302-247f5f0fbdd1?w=700&h=480&fit=crop&auto=format",  desc:"Живописный пруд в центре Бухары, окружённый медресе и чайханами — любимое место горожан с XVI в." },
  { id:"ismail",name:"Мавзолей Исмаила Самани",  city:"Бухара",    type:"Мавзолей",     rating:4.8, reviews:4930,  distance:"0.7 км", entry:"$2",        hours:"08:00–19:00", audio:true,  qr:true,  img:"https://images.unsplash.com/photo-1653023102302-247f5f0fbdd1?w=700&h=480&fit=crop&auto=format",  desc:"Жемчужина центральноазиатской архитектуры IX–X вв. — один из старейших сохранившихся исламских мавзолеев." },
  { id:"ihlj",  name:"Ислам-Ходжа",             city:"Хива",      type:"Минарет",      rating:4.7, reviews:3610,  distance:"0.2 км", entry:"$5",        hours:"09:00–18:00", audio:false, qr:false, img:"https://images.unsplash.com/photo-1654861857666-1e8c438cbe4a?w=700&h=480&fit=crop&auto=format",  desc:"Самый высокий минарет Хивы (57 м) и медресе при нём — последний крупный памятник хивинского ханства, XIX в." },
  { id:"hastm", name:"Хаст-Имам",               city:"Ташкент",   type:"Мечеть",       rating:4.7, reviews:4210,  distance:"1.5 км", entry:"Бесплатно", hours:"06:00–21:00", audio:false, qr:false, img:"https://images.unsplash.com/photo-1622030797403-fa221ce5d208?w=700&h=480&fit=crop&auto=format",  desc:"Духовный центр Ташкента, где хранится один из старейших Коранов в мире — рукопись Усмана VII в." },
  { id:"chorsu",name:"Базар Чорсу",              city:"Ташкент",   type:"Базары",       rating:4.6, reviews:7830,  distance:"2.0 км", entry:"Бесплатно", hours:"06:00–20:00", audio:false, qr:false, img:"https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=700&h=480&fit=crop&auto=format",  desc:"Старейший рынок Центральной Азии под синим куполом — специи, шёлк, фрукты, керамика и пряности со всего Шёлкового пути." },
  { id:"minor", name:"Мечеть Минор",             city:"Ташкент",   type:"Мечеть",       rating:4.5, reviews:2980,  distance:"2.5 км", entry:"Бесплатно", hours:"05:30–22:00", audio:false, qr:false, img:"https://images.unsplash.com/photo-1622030797403-fa221ce5d208?w=700&h=480&fit=crop&auto=format",  desc:"Современная белоснежная мечеть (2014 г.) у набережной Боз-Су — жемчужина новой архитектуры Ташкента." },
  { id:"ayaz",  name:"Крепость Аяз-Кала",       city:"Нукус",     type:"Крепость",     rating:4.6, reviews:1820,  distance:"120 км", entry:"$3",        hours:"Всегда",      audio:false, qr:false, img:"https://images.unsplash.com/photo-1571401835393-8c5f35328320?w=700&h=480&fit=crop&auto=format",  desc:"Античная крепость I в. до н.э. в пустыне Кызылкум — один из самых драматичных силуэтов древнего Хорезма." },
  { id:"navruz",name:"Музей Навои",              city:"Самарканд", type:"Музей",        rating:4.5, reviews:2140,  distance:"1.8 км", entry:"$2",        hours:"09:00–17:00", audio:false, qr:false, img:"https://images.unsplash.com/photo-1664602078796-68ee76b3fc59?w=700&h=480&fit=crop&auto=format",  desc:"Дом-музей великого поэта Алишера Навои с редкими рукописями и предметами быта эпохи Тимуридов." },
  { id:"chimgn",name:"Чимганские горы",          city:"Чарвак",    type:"Природа",      rating:4.9, reviews:5670,  distance:"85 км",  entry:"Бесплатно", hours:"Всегда",      audio:false, qr:false, img:"https://images.unsplash.com/photo-1571401835393-8c5f35328320?w=700&h=480&fit=crop&auto=format",  desc:"Горный курорт в 80 км от Ташкента — треккинг, лыжи зимой, водопады и панорамы на Тянь-Шань." },
  { id:"savsav", name:"Базар Сиаб",             city:"Самарканд", type:"Базары",       rating:4.7, reviews:6120,  distance:"0.7 км", entry:"Бесплатно", hours:"06:00–20:00", audio:false, qr:false, img:"https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=700&h=480&fit=crop&auto=format",  desc:"Старейший рынок Самарканда у подножия Шахи-Зинды — здесь торгуют нонами, специями и узбекскими сладостями с древних времён." },
];

export const POPULAR_CITIES = [
  { name:"Самарканд", sub:"Город легенд и истории",   rating:4.9, img:"https://images.unsplash.com/photo-1664602078796-68ee76b3fc59?w=500&h=380&fit=crop&auto=format" },
  { name:"Бухара",    sub:"Древний город мира",        rating:4.8, img:"https://images.unsplash.com/photo-1653023102302-247f5f0fbdd1?w=500&h=380&fit=crop&auto=format" },
  { name:"Чарвак",    sub:"Природа и отдых",           rating:4.9, img:"https://images.unsplash.com/photo-1728281711729-a3b3424e6c1e?w=500&h=380&fit=crop&auto=format" },
  { name:"Хива",      sub:"Жемчужина Хорезма",         rating:4.8, img:"https://images.unsplash.com/photo-1654861857666-1e8c438cbe4a?w=500&h=380&fit=crop&auto=format" },
];

export const HOTELS: Hotel[] = [
  { id:"h1", name:"Registan Plaza Hotel",    city:"Самарканд", rating:4.8, reviews:1240, price:"$89",  tag:"Лучшая цена", img:"https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&h=400&fit=crop&auto=format",  desc:"Роскошный отель с видом на Регистан. Бассейн на крыше, узбекские завтраки и персонализированный консьерж-сервис.", facilities:["Wi-Fi","Бассейн","Ресторан","Спа","Парковка","Трансфер"], imgs:["https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=400&h=300&fit=crop","https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop","https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&h=300&fit=crop"] },
  { id:"h2", name:"Sitorai Mohi-Xosa",      city:"Бухара",    rating:4.7, reviews:890,  price:"$65",  tag:"Популярный",  img:"https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&h=400&fit=crop&auto=format",  desc:"Исторический бутик-отель в сердце старого города Бухары. Традиционная архитектура в сочетании с современным комфортом.", facilities:["Wi-Fi","Ресторан","Терраса","Экскурсии","Завтрак"], imgs:["https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&h=300&fit=crop","https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=400&h=300&fit=crop"] },
  { id:"h3", name:"Orient Star Khiva",      city:"Хива",      rating:4.9, reviews:670,  price:"$110", tag:"Топ выбор",   img:"https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop&auto=format",  desc:"Единственный отель внутри крепостных стен Ичан-Калы. Просыпайтесь в окружении 2500-летней истории.", facilities:["Wi-Fi","Ресторан","Бар","Экскурсии","Трансфер","Конференц-зал"], imgs:["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop","https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&h=300&fit=crop"] },
  { id:"h4", name:"Lotte City Tashkent",    city:"Ташкент",   rating:4.8, reviews:2140, price:"$120", tag:"Люкс",        img:"https://images.unsplash.com/photo-1549294413-26f195200c16?w=600&h=400&fit=crop&auto=format",  desc:"5-звёздочный отель в деловом центре Ташкента с бассейном, фитнесом и панорамным рестораном.", facilities:["Wi-Fi","Бассейн","Фитнес","Спа","Ресторан","Парковка"], imgs:["https://images.unsplash.com/photo-1549294413-26f195200c16?w=400&h=300&fit=crop","https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=400&h=300&fit=crop"] },
  { id:"h5", name:"Malika Premier Samarkand",city:"Самарканд",rating:4.6, reviews:980,  price:"$72",  tag:"Хит",         img:"https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop&auto=format",  desc:"Удобный отель в 5 минутах ходьбы от Регистана — идеальное соотношение цены и качества.", facilities:["Wi-Fi","Ресторан","Трансфер","Завтрак"], imgs:["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop"] },
  { id:"h6", name:"Arkanchi Hotel",         city:"Бухара",    rating:4.7, reviews:1120, price:"$58",  tag:"Бутик",       img:"https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&h=400&fit=crop&auto=format",  desc:"Уютный бутик-отель с традиционным узбекским двориком и панорамной террасой.", facilities:["Wi-Fi","Терраса","Завтрак","Экскурсии"], imgs:["https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&h=300&fit=crop"] },
  { id:"h7", name:"Khiva Palace Hotel",     city:"Хива",      rating:4.6, reviews:540,  price:"$85",  tag:"Панорама",    img:"https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&h=400&fit=crop&auto=format",  desc:"Отель у стен Ичан-Калы с террасой и видом на минареты. Традиционный декор и современный сервис.", facilities:["Wi-Fi","Терраса","Ресторан","Трансфер"], imgs:["https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=400&h=300&fit=crop"] },
];

export const RESTAURANTS: Restaurant[] = [
  { id:"rs1",  name:"Плов-центр Ташкента",        city:"Ташкент",   cuisine:"Узбекская", rating:4.9, reviews:8420, price:"$5–15",  open:"09:00–15:00", img:"https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop&auto=format",    desc:"Легендарное место — лучший плов в Узбекистане. Готовят с 7 утра в огромных казанах, к полудню всё разбирают." },
  { id:"rs2",  name:"Caravan Restaurant",          city:"Ташкент",   cuisine:"Fusion",    rating:4.7, reviews:3210, price:"$12–25", open:"11:00–23:00", img:"https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop&auto=format",    desc:"Современная узбекская кухня фьюжн в центре Ташкента. Вино, шашлык, живая музыка по пятницам." },
  { id:"rs3",  name:"Чайхана Рохат",              city:"Ташкент",   cuisine:"Традиционная",rating:4.6,reviews:5640, price:"$4–12",  open:"07:00–22:00", img:"https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop&auto=format",    desc:"Старейшая чайхана Ташкента с 1958 года. Самса, лепёшки, нишалда и зелёный чай в атмосфере советского прошлого." },
  { id:"rs4",  name:"Nargis Restaurant",           city:"Самарканд", cuisine:"Узбекская", rating:4.8, reviews:4120, price:"$8–18",  open:"11:00–23:00", img:"https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop&auto=format",    desc:"Терраса с видом на Регистан — лучшее место для заката. Плов, лагман, долма и свежие узбекские лепёшки." },
  { id:"rs5",  name:"Плов-центр Самарканда",      city:"Самарканд", cuisine:"Узбекская", rating:4.7, reviews:6830, price:"$5–10",  open:"09:00–14:00", img:"https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop&auto=format",    desc:"Самаркандский плов — особенный: жёлтый рис, нут, айва и баранина. Здесь его готовят по старинному рецепту." },
  { id:"rs6",  name:"Silk Road Spices",           city:"Самарканд", cuisine:"Fusion",    rating:4.6, reviews:2180, price:"$12–22", open:"12:00–22:30", img:"https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop&auto=format",    desc:"Авторская кухня Шёлкового пути: специи, пряности и традиционные рецепты в современной интерпретации." },
  { id:"rs7",  name:"Ляби-Хауз Ресторан",        city:"Бухара",    cuisine:"Традиционная",rating:4.7,reviews:3940, price:"$6–14",  open:"10:00–22:00", img:"https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop&auto=format",    desc:"На берегу знаменитого пруда Ляби-Хауз. Узбекские блюда, чай с халвой и виды на медресе Надир-Диван-Беги." },
  { id:"rs8",  name:"Minzifa Restaurant",         city:"Бухара",    cuisine:"Узбекская", rating:4.8, reviews:2760, price:"$8–16",  open:"11:00–23:00", img:"https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop&auto=format",    desc:"Уютный ресторан в историческом здании с открытым двориком. Шашлык из тандыра, манты и бухарская самса." },
  { id:"rs9",  name:"Чайхана у Регистана",        city:"Самарканд", cuisine:"Традиционная",rating:4.5,reviews:4580, price:"$3–9",   open:"07:00–21:00", img:"https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop&auto=format",    desc:"Народная чайхана прямо у Регистана — завтрак из самсы и чай за $2, как у местных." },
  { id:"rs10", name:"Oshxona Khiva",              city:"Хива",      cuisine:"Узбекская", rating:4.6, reviews:1840, price:"$5–12",  open:"08:00–21:00", img:"https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop&auto=format",    desc:"Ресторан внутри Ичан-Калы. Хивинский плов, шурпа и долма в атмосфере средневекового города." },
  { id:"rs11", name:"Terrassa Khiva",             city:"Хива",      cuisine:"Fusion",    rating:4.7, reviews:1320, price:"$10–20", open:"12:00–22:00", img:"https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop&auto=format",    desc:"Крышный ресторан с панорамой на минареты Хивы — идеально для ужина на закате." },
  { id:"rs12", name:"Plov House Fergana",         city:"Фергана",   cuisine:"Узбекская", rating:4.8, reviews:5120, price:"$4–10",  open:"09:00–15:00", img:"https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop&auto=format",    desc:"Ферганский плов — самый жирный и ароматный в Узбекистане. Готовят только до обеда, заканчивается быстро." },
  { id:"rs13", name:"Бахор Ресторан",             city:"Наманган",  cuisine:"Узбекская", rating:4.6, reviews:3280, price:"$5–13",  open:"10:00–22:00", img:"https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop&auto=format",    desc:"Ресторан с садом и фонтанами — домашняя узбекская кухня: казан-кабоб, чучвара и свежие соки." },
  { id:"rs14", name:"Samarkand Bazaar Grill",     city:"Самарканд", cuisine:"Гриль",     rating:4.7, reviews:2940, price:"$8–18",  open:"12:00–23:00", img:"https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop&auto=format",    desc:"Лучший шашлык Самарканда — люля, баранина, перепел на углях. Живая узбекская музыка каждый вечер." },
  { id:"rs15", name:"Чайхана Зарафшан",           city:"Бухара",    cuisine:"Традиционная",rating:4.5,reviews:2100, price:"$3–9",   open:"07:00–21:00", img:"https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop&auto=format",    desc:"Классическая бухарская чайхана: лепёшки из тандыра, чай в пиалах и местная атмосфера." },
];

export const ROUTES: Route[] = [
  { id:"r1",title:"Самарканд за 1 день",      sub:"5 мест · 12 км · ~$26",  duration:"8 ч",   icon:"🕌",color: GREEN,       badge:"Классика",
    stops:[{time:"09:00",name:"Площадь Регистан",dur:"2 ч",note:"Лучший свет для фото",entry:"$8"},{time:"11:00",name:"Мечеть Биби-Ханым",dur:"45 мин",note:"5 мин пешком",entry:"$4"},{time:"12:00",name:"Базар Сиаб",dur:"1 ч",note:"Нон и сухофрукты",entry:"Бесплатно"},{time:"13:30",name:"Шахи-Зинда",dur:"1.5 ч",note:"Послеполуденный свет",entry:"$5"},{time:"15:30",name:"Обс. Улугбека",dur:"1 ч",note:"Такси 15 мин",entry:"$3"}] },
  { id:"r2",title:"Великий Шёлковый путь",    sub:"22 остановки · 1400 км",  duration:"7 дней",icon:"🛤️",color:"#C17B2F",badge:"Эпик",
    stops:[{time:"День 1",name:"Ташкент → Самарканд",dur:"Весь день",note:"Поезд Афросиаб 2 ч",entry:""},{time:"День 2",name:"Регистан + Шахи-Зинда",dur:"Весь день",note:"Сердце Шёлкового пути",entry:""},{time:"День 3",name:"Самарканд → Бухара",dur:"Весь день",note:"Поезд 1.5 ч",entry:""},{time:"День 4",name:"Старый город Бухары",dur:"Весь день",note:"Арк, Калян, Ляби-Хауз",entry:""},{time:"День 5",name:"Бухара → Хива",dur:"Весь день",note:"Переезд 5 ч",entry:""}] },
  { id:"r3",title:"Гастрономический",         sub:"14 остановок · 820 км",   duration:"5 дней",icon:"🍽️",color:"#C1603A",badge:"Еда",
    stops:[{time:"09:00",name:"Плов-центр Ташкента",dur:"1.5 ч",note:"Лучший плов в стране",entry:""},{time:"11:30",name:"Рынок Чорсу",dur:"2 ч",note:"Специи, орехи, сухофрукты",entry:""},{time:"14:00",name:"Мастер-класс самса",dur:"2 ч",note:"Научитесь лепить",entry:"$15"},{time:"17:00",name:"Ресторан Caravan",dur:"2 ч",note:"Современная кухня",entry:""},{time:"20:00",name:"Вечерний базар",dur:"1 ч",note:"Уличная еда с местными",entry:""}] },
  { id:"r4",title:"Исламское наследие",       sub:"18 остановок · 980 км",   duration:"5 дней",icon:"☪️",color:"#1B9E8A",badge:"Культура",
    stops:[{time:"День 1",name:"Хаст-Имам, Ташкент",dur:"Весь день",note:"Старейшая мечеть региона",entry:""},{time:"День 2",name:"Регистан + медресе",dur:"Весь день",note:"Три медресе 15–17 вв.",entry:""},{time:"День 3",name:"Минарет Калян, Бухара",dur:"Весь день",note:"800-летний символ",entry:""},{time:"День 4",name:"Мечеть Боло-Хауз",dur:"Весь день",note:"40 деревянных колонн",entry:""},{time:"День 5",name:"Джума-мечеть Хивы",dur:"Весь день",note:"213 колонн XI–XIX вв.",entry:""}] },
  { id:"r5",title:"14 дней по Узбекистану",  sub:"48 остановок · 2800 км",  duration:"14 дней",icon:"🗺️",color:"#6B4FBB",badge:"Полный",
    stops:[{time:"Дни 1–3",name:"Ташкент",dur:"3 дня",note:"Столица и музеи",entry:""},{time:"Дни 4–6",name:"Самарканд",dur:"3 дня",note:"Регистан, Шахи-Зинда",entry:""},{time:"Дни 7–9",name:"Бухара",dur:"3 дня",note:"Арк, Калян, Ляби-Хауз",entry:""},{time:"Дни 10–12",name:"Хива",dur:"3 дня",note:"Ичан-Кала, музеи",entry:""},{time:"Дни 13–14",name:"Нукус",dur:"2 дня",note:"Музей Савицкого",entry:""}] },
  { id:"r6",title:"Горный Узбекистан",        sub:"8 мест · 340 км",         duration:"3 дня", icon:"🏔️",color:"#2E8B57",badge:"Природа",
    stops:[{time:"День 1",name:"Чарвакское озеро",dur:"Весь день",note:"Пляж и горный воздух",entry:""},{time:"День 2",name:"Чимганские горы",dur:"Весь день",note:"Трекинг и панорамы",entry:""},{time:"День 3",name:"Водопад Урам-Баши",dur:"Весь день",note:"Живописный поход",entry:""}] },
];

export const EVENTS = [
  { name:"Фестиваль Навруз",      date:"21 марта",   city:"Ташкент",   emoji:"🌸",color:"#E9C46A",desc:"Персидский Новый год — музыка, сумаляк, народные гуляния." },
  { name:"Шёлковый путь: музыка", date:"12–15 июня", city:"Самарканд", emoji:"🎵",color: GREEN,       desc:"Международный фестиваль традиционной музыки у стен Регистана." },
  { name:"Гастрофест «Плов»",     date:"5 октября",  city:"Ташкент",   emoji:"🍲",color:"#C1603A",desc:"Соревнование поваров — более 100 видов плова со всего Узбекистана." },
  { name:"Буз-кашши",             date:"Март",        city:"Наманган",  emoji:"🏇",color:"#6B4FBB",desc:"Традиционная конная игра — зрелищный народный спорт." },
];

export const WEATHER: Record<string,{temp:string;icon:string;cond:string;wind:string;feels:string}> = {
  "Ташкент":   {temp:"32",icon:"☀️",cond:"Ясно",        wind:"8 км/ч", feels:"31"},
  "Самарканд": {temp:"34",icon:"🌤️",cond:"Малооблачно", wind:"12 км/ч",feels:"33"},
  "Бухара":    {temp:"36",icon:"☀️",cond:"Зной",        wind:"6 км/ч", feels:"38"},
  "Хива":      {temp:"35",icon:"☀️",cond:"Знойно",      wind:"9 км/ч", feels:"37"},
  "Чарвак":    {temp:"26",icon:"⛅",cond:"Горный",       wind:"15 км/ч",feels:"25"},
  "Нукус":     {temp:"33",icon:"☀️",cond:"Сухо",        wind:"10 км/ч",feels:"35"},
  "Фергана":   {temp:"30",icon:"🌤️",cond:"Переменная",  wind:"7 км/ч", feels:"29"},
  "Наманган":  {temp:"31",icon:"☀️",cond:"Ясно",        wind:"5 км/ч", feels:"30"},
  "Андижан":   {temp:"30",icon:"☀️",cond:"Ясно",        wind:"6 км/ч", feels:"29"},
  "Термез":    {temp:"40",icon:"🔆",cond:"Очень жарко", wind:"11 км/ч",feels:"43"},
};

export const UZ_CITIES = [
  "Ташкент","Самарканд","Бухара","Хива","Нукус","Фергана",
  "Наманган","Андижан","Термез","Карши","Гулистан","Джизак","Чарвак",
];

export const FLIGHTS = [
  { id:"f1", from:"Ташкент",   to:"Самарканд", dep:"08:00", arr:"09:05", airline:"Uzbekistan Airways", price:"$49", code:"HY101", seats:12 },
  { id:"f2", from:"Ташкент",   to:"Бухара",    dep:"10:30", arr:"12:15", airline:"Uzbekistan Airways", price:"$65", code:"HY203", seats:8  },
  { id:"f3", from:"Ташкент",   to:"Хива",      dep:"14:00", arr:"15:40", airline:"Uzbekistan Airways", price:"$79", code:"HY305", seats:5  },
  { id:"f4", from:"Ташкент",   to:"Нукус",     dep:"16:45", arr:"18:10", airline:"Uzbekistan Airways", price:"$55", code:"HY407", seats:20 },
  { id:"f5", from:"Самарканд", to:"Ташкент",   dep:"12:30", arr:"13:35", airline:"Uzbekistan Airways", price:"$49", code:"HY102", seats:15 },
  { id:"f6", from:"Ташкент",   to:"Фергана",   dep:"09:15", arr:"10:20", airline:"Qanot Sharq",        price:"$42", code:"QS210", seats:18 },
];
export const TRAINS = [
  { id:"t1", from:"Ташкент",   to:"Самарканд", dep:"07:00", arr:"09:05", name:"Афросиёб",  price:"$12", type:"Скоростной", dur:"2ч 05м", seats:45 },
  { id:"t2", from:"Ташкент",   to:"Самарканд", dep:"14:00", arr:"16:10", name:"Афросиёб",  price:"$12", type:"Скоростной", dur:"2ч 10м", seats:30 },
  { id:"t3", from:"Ташкент",   to:"Бухара",    dep:"08:00", arr:"11:40", name:"Афросиёб",  price:"$18", type:"Скоростной", dur:"3ч 40м", seats:20 },
  { id:"t4", from:"Самарканд", to:"Бухара",    dep:"09:00", arr:"10:30", name:"Афросиёб",  price:"$9",  type:"Скоростной", dur:"1ч 30м", seats:55 },
  { id:"t5", from:"Ташкент",   to:"Самарканд", dep:"06:00", arr:"10:15", name:"Шарк",      price:"$8",  type:"Обычный",    dur:"4ч 15м", seats:80 },
  { id:"t6", from:"Бухара",    to:"Хива",      dep:"07:30", arr:"13:00", name:"Хоразм",    price:"$12", type:"Обычный",    dur:"5ч 30м", seats:60 },
];
export const INTERCITY = [
  { id:"i1", from:"Ташкент",   to:"Самарканд", dur:"3–4 ч",   price:"$8–12",  departs:"Каждые 30 мин",  note:"Общий такси с попутчиками" },
  { id:"i2", from:"Самарканд", to:"Бухара",    dur:"2.5–3 ч", price:"$7–10",  departs:"Каждые 1 ч",     note:"Через пустынную степь" },
  { id:"i3", from:"Бухара",    to:"Хива",      dur:"5–6 ч",   price:"$15–20", departs:"2–3 рейса/день", note:"Один из самых живописных" },
  { id:"i4", from:"Ташкент",   to:"Фергана",   dur:"5–6 ч",   price:"$10–15", departs:"Каждые 2 ч",     note:"Через Камчикский перевал" },
  { id:"i5", from:"Ташкент",   to:"Чарвак",    dur:"1.5 ч",   price:"$3–5",   departs:"Каждые 20 мин",  note:"Маршрутка №504" },
  { id:"i6", from:"Самарканд", to:"Ташкент",   dur:"3–4 ч",   price:"$8–12",  departs:"Каждые 30 мин",  note:"Обратный маршрут" },
];

export const STAMPS = [
  { name:"Регистан",    city:"Самарканд",date:"12 авг",icon:"🕌",earned:true  },
  { name:"Шахи-Зинда", city:"Самарканд",date:"12 авг",icon:"☪️",earned:true  },
  { name:"Гур-э-Амир", city:"Самарканд",date:"13 авг",icon:"🏛️",earned:true  },
  { name:"Арк Бухары", city:"Бухара",   date:"—",      icon:"🏰",earned:false },
  { name:"Ичан-Кала",  city:"Хива",     date:"—",      icon:"🗼",earned:false },
  { name:"Музей Тимура",city:"Ташкент", date:"—",      icon:"⚔️",earned:false },
];
export const ACHIEVEMENTS = [
  { title:"Открыл Самарканд",    emoji:"🕌",earned:true, color: GREEN        },
  { title:"Исследователь Бухары",emoji:"🏛️",earned:true, color:"#C17B2F"},
  { title:"Шёлковый путь",       emoji:"🛤️",earned:false,color:"#C1603A"},
  { title:"10 музеев",           emoji:"🏺",earned:false,color:"#1B9E8A"},
  { title:"Фотограф",            emoji:"📸",earned:true, color:"#6B4FBB"},
  { title:"Аудиолюбитель",       emoji:"🎧",earned:false,color:"#2E8B57"},
];
export const AI_REPLIES: Record<string,string> = {
  "Что рядом?":              "📍 Рядом с Регистаном:\n\n🕌 Биби-Ханым — 800 м\n🏺 Музей Афросиаб — 1.2 км\n🛍️ Базар Сиаб — 900 м\n\nВключить аудиогид?",
  "История Регистана":       "🏛️ Регистан — «Песчаное место».\n\nТри медресе: Улугбека (1420), Шер-Дор (1636) и Тилля-Кари (1660). Тамерлан выбрал это место как имперский центр.",
  "Лучшие рестораны?":       "🍽️ Топ рестораны:\n\n1. Platan — лучший плов $8–15\n2. Nargis — терраса с видом $5–12\n3. Silk Road Spices — фьюжн $12–20\n\n💡 Плов едят до полудня!",
  "Что бесплатно?":          "🎫 Бесплатно:\n\n✅ Внешний Регистан\n✅ Минарет Калян\n✅ Стены Ичан-Калы\n✅ Базар Чорсу\n✅ Площадь Мустакиллик\n✅ Чарвак",
  "Как добраться до Бухары?":"🚂 Самарканд→Бухара:\n\n🚄 Поезд: 1.5 ч, от $12\n🚌 Маршрутка: 2 ч, от $5\n\nОтправление: 06:20, 10:45, 14:30, 18:00",
  "Где переночевать?":        "🏨 Отели:\n\n⭐ Registan Plaza $89 · 4.8★\n⭐ Malika Premier $65 · 4.6★\n⭐ B&B Guestus $35 · 4.7★\n\nСкидка 10% через UzUp!",
  "Что посмотреть вечером?":  "🌙 Вечер:\n\n✨ 19:00 Световое шоу Регистан $15\n🍽️ 20:30 Ужин в Platan\n🌟 22:00 Ночная прогулка",
  "Курс валюты?":            "💱 Курс:\n\n$1 = 12 740 UZS\n€1 = 13 980 UZS\n₽1 = 138 UZS\n\n💡 Меняйте в банке, не у менял.",
  "Транспорт в Самарканде?": "🚌 Транспорт:\n\n🚖 Яндекс.Такси ~$1–3\n🚌 Автобус 22 UZS\n🚶 Пешком 20–40 мин между достопримечательностями",
};
export const LANGS = ["🇬🇧 English","🇷🇺 Русский","🇺🇿 O'zbek","🇨🇳 中文","🇰🇷 한국어","🇩🇪 Deutsch","🇫🇷 Français","🇯🇵 日本語","🇹🇷 Türkçe","🇸🇦 العربية"];
export const FILTER_TABS = ["Всё","История","Мечети","Музеи","Природа","Базары","Отели","Рестораны"];
export const SEARCH_POPULAR = ["Регистан Самарканд","Бухара старый город","Хива Ичан-Кала","Чарвак озеро","Плов Ташкент","Базар Сиаб"];
export const NOTIFS = [
  { emoji:"📍",title:"Вы рядом с Регистаном",body:"Нажмите, чтобы включить аудиогид — 8 мин истории.",time:"Сейчас",unread:true },
  { emoji:"🎫",title:"Световое шоу сегодня",body:"Регистан · 21:00 · Билеты от $10. Осталось 12 мест!",time:"1 ч назад",unread:true },
  { emoji:"🏷️",title:"Скидка 15% на отели",body:"Код UZUP15 до 31 авг.",time:"3 ч назад",unread:false },
  { emoji:"✅",title:"Маршрут завершён!",body:"«Самарканд за 1 день» — получите штамп!",time:"Вчера",unread:false },
  { emoji:"🆕",title:"Новый аудиогид",body:"Гур-э-Амир · Обновлённая версия.",time:"2 дня назад",unread:false },
];
export const PRACTICAL = [
  { icon:"💱",title:"Валюта",    body:"$1 = 12 740 сум. Обменивайте в банках." },
  { icon:"🌡️",title:"Климат",   body:"Лето: +35–40°C. Весна/осень: +18–25°C." },
  { icon:"🚖",title:"Транспорт",body:"Яндекс.Такси самый удобный. Метро в Ташкенте." },
  { icon:"🍽️",title:"Кухня",    body:"Плов, лагман, самса, шашлык, нон. Пробуйте всё!" },
  { icon:"📱",title:"SIM-карта", body:"Ucell и Beeline — лучшее покрытие. $5 безлимит." },
  { icon:"🕌",title:"Этикет",   body:"В мечетях — скромная одежда. Фото — спрашивайте." },
  { icon:"🏥",title:"Медицина", body:"Скорая: 103. Полиция: 102. Туристам: 1322." },
  { icon:"⚡",title:"Розетки",  body:"Тип C и F, 220В. Адаптер не нужен для EU." },
];

// ── Atoms ─────────────────────────────────────────────────────────────────────

/** Рекламные креативы: то, что видит турист в баннере. */
export const ADS = [
  { id:"a1", emoji:"🏨", label:"РЕКЛАМА", title:"Registan Plaza Hotel",     sub:"Скидка 20% при бронировании через UzUp",  cta:"Забронировать", color:"#1B6B8A" },
  { id:"a2", emoji:"🍽️", label:"РЕКЛАМА", title:"Плов-центр Ташкента",      sub:"Лучший плов с 1978 года. Откройте для себя!", cta:"Смотреть меню", color:"#C1603A" },
  { id:"a3", emoji:"✈️", label:"РЕКЛАМА", title:"Uzbekistan Airways",        sub:"Прямые рейсы из Самарканда. От $149",         cta:"Купить билет",  color:"#1A5C3A" },
  { id:"a4", emoji:"🛍️", label:"РЕКЛАМА", title:"Silk & Spice Bazaar",       sub:"Аутентичные сувениры прямо от мастеров",      cta:"Перейти",       color:"#7B4F9E" },
  { id:"a5", emoji:"🚌", label:"РЕКЛАМА", title:"Samarkand Tour Transfers",  sub:"Трансфер аэропорт–город от $8",               cta:"Заказать",      color:"#2E7D5A" },
];
