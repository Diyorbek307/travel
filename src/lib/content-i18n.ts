import type { Locale } from "./i18n";

/**
 * Перевод содержимого — того, что вводит редактор, а не печатает код.
 *
 * Интерфейс переведён в i18n.ts. Здесь — встроенные данные: категории
 * мест, города, теги, кухни, советы, уведомления. Ключ словаря — сама
 * русская строка из данных; перевода нет — отдаём её как есть.
 *
 * Так новый материал, введённый в панели, не ломается: для него перевода
 * в словаре просто не найдётся, и он покажется на языке ввода. Настоящая
 * многоязычность содержимого — это отдельные поля на каждый язык в самой
 * записи; она появится, когда редактор будет вводить переводы. Пока же
 * переведено то, что заложено в приложение изначально.
 *
 * Имена-топонимы (Регистан, Гур-э-Амир) сознательно не трогаем: их люди
 * так и ищут, а коверкать по чужим алфавитам «на глаз» — та же ложь, что
 * и рисовать границу по памяти. Переводим то, что переводится точно:
 * категории и общие слова.
 */

type Строка = Partial<Record<Locale, string>>;

/** en опускаем там, где он совпадает с оригиналом; ru — это сам ключ. */
function с(
  ключ: string,
  переводы: Строка,
): [string, Строка] {
  return [ключ, переводы];
}

const ЗАПИСИ: [string, Строка][] = [
  // ── Категории мест ───────────────────────────────────────────────
  с("История", { en: "History", uz: "Tarix", zh: "历史", ko: "역사", de: "Geschichte", fr: "Histoire", ja: "歴史", tr: "Tarih", ar: "التاريخ" }),
  с("Мечеть", { en: "Mosque", uz: "Masjid", zh: "清真寺", ko: "모스크", de: "Moschee", fr: "Mosquée", ja: "モスク", tr: "Cami", ar: "مسجد" }),
  с("Музей", { en: "Museum", uz: "Muzey", zh: "博物馆", ko: "박물관", de: "Museum", fr: "Musée", ja: "博物館", tr: "Müze", ar: "متحف" }),
  с("Природа", { en: "Nature", uz: "Tabiat", zh: "自然", ko: "자연", de: "Natur", fr: "Nature", ja: "自然", tr: "Doğa", ar: "الطبيعة" }),
  с("Базары", { en: "Bazaar", uz: "Bozor", zh: "集市", ko: "시장", de: "Basar", fr: "Bazar", ja: "バザール", tr: "Pazar", ar: "سوق" }),
  с("Крепость", { en: "Fortress", uz: "Qal'a", zh: "城堡", ko: "요새", de: "Festung", fr: "Forteresse", ja: "要塞", tr: "Kale", ar: "قلعة" }),
  с("Мавзолей", { en: "Mausoleum", uz: "Maqbara", zh: "陵墓", ko: "영묘", de: "Mausoleum", fr: "Mausolée", ja: "霊廟", tr: "Türbe", ar: "ضريح" }),
  с("Минарет", { en: "Minaret", uz: "Minora", zh: "宣礼塔", ko: "미너렛", de: "Minarett", fr: "Minaret", ja: "ミナレット", tr: "Minare", ar: "مئذنة" }),
  с("Площадь", { en: "Square", uz: "Maydon", zh: "广场", ko: "광장", de: "Platz", fr: "Place", ja: "広場", tr: "Meydan", ar: "ساحة" }),
  с("Старый город", { en: "Old town", uz: "Eski shahar", zh: "古城", ko: "구시가지", de: "Altstadt", fr: "Vieille ville", ja: "旧市街", tr: "Eski şehir", ar: "المدينة القديمة" }),
  с("Обычный", { en: "Place", uz: "Oddiy", zh: "地点", ko: "일반", de: "Ort", fr: "Lieu", ja: "スポット", tr: "Yer", ar: "مكان" }),
  с("Скоростной", { en: "Express", uz: "Tezyurar", zh: "高速", ko: "고속", de: "Schnell", fr: "Express", ja: "特急", tr: "Hızlı", ar: "سريع" }),

  // ── Города ───────────────────────────────────────────────────────
  с("Ташкент", { en: "Tashkent", uz: "Toshkent", zh: "塔什干", ko: "타슈켄트", de: "Taschkent", fr: "Tachkent", ja: "タシケント", tr: "Taşkent", ar: "طشقند" }),
  с("Самарканд", { en: "Samarkand", uz: "Samarqand", zh: "撒马尔罕", ko: "사마르칸트", de: "Samarkand", fr: "Samarcande", ja: "サマルカンド", tr: "Semerkant", ar: "سمرقند" }),
  с("Бухара", { en: "Bukhara", uz: "Buxoro", zh: "布哈拉", ko: "부하라", de: "Buchara", fr: "Boukhara", ja: "ブハラ", tr: "Buhara", ar: "بخارى" }),
  с("Хива", { en: "Khiva", uz: "Xiva", zh: "希瓦", ko: "히바", de: "Chiwa", fr: "Khiva", ja: "ヒヴァ", tr: "Hive", ar: "خيوة" }),
  с("Нукус", { en: "Nukus", uz: "Nukus", zh: "努库斯", ko: "누쿠스", de: "Nukus", fr: "Noukous", ja: "ヌクス", tr: "Nukus", ar: "نوكوس" }),
  с("Фергана", { en: "Fergana", uz: "Fargʻona", zh: "费尔干纳", ko: "페르가나", de: "Fergana", fr: "Ferghana", ja: "フェルガナ", tr: "Fergana", ar: "فرغانة" }),
  с("Наманган", { en: "Namangan", uz: "Namangan", zh: "纳曼干", ko: "나망간", de: "Namangan", fr: "Namangan", ja: "ナマンガン", tr: "Namangan", ar: "نمنغان" }),
  с("Андижан", { en: "Andijan", uz: "Andijon", zh: "安集延", ko: "안디잔", de: "Andijan", fr: "Andijan", ja: "アンディジャン", tr: "Andican", ar: "أنديجان" }),
  с("Термез", { en: "Termez", uz: "Termiz", zh: "铁尔梅兹", ko: "테르메즈", de: "Termiz", fr: "Termez", ja: "テルメズ", tr: "Termez", ar: "ترمذ" }),
  с("Карши", { en: "Karshi", uz: "Qarshi", zh: "卡尔希", ko: "카르시", de: "Karshi", fr: "Karchi", ja: "カルシ", tr: "Karşı", ar: "قرشي" }),
  с("Гулистан", { en: "Gulistan", uz: "Guliston", zh: "古利斯坦", ko: "굴리스탄", de: "Gulistan", fr: "Goulistan", ja: "グリスタン", tr: "Gülistan", ar: "غولستان" }),
  с("Джизак", { en: "Jizzakh", uz: "Jizzax", zh: "吉扎克", ko: "지자흐", de: "Dschizak", fr: "Djizak", ja: "ジザフ", tr: "Cizzah", ar: "جيزاك" }),
  с("Чарвак", { en: "Charvak", uz: "Chorvoq", zh: "恰尔瓦克", ko: "차르바크", de: "Tscharwak", fr: "Tcharvak", ja: "チャルヴァク", tr: "Çarvak", ar: "تشارفاك" }),

  // ── Теги отелей ──────────────────────────────────────────────────
  с("Люкс", { en: "Luxury", uz: "Hashamatli", zh: "豪华", ko: "럭셔리", de: "Luxus", fr: "Luxe", ja: "ラグジュアリー", tr: "Lüks", ar: "فاخر" }),
  с("Бутик", { en: "Boutique", uz: "Butik", zh: "精品", ko: "부티크", de: "Boutique", fr: "Boutique", ja: "ブティック", tr: "Butik", ar: "بوتيك" }),
  с("Популярный", { en: "Popular", uz: "Mashhur", zh: "热门", ko: "인기", de: "Beliebt", fr: "Populaire", ja: "人気", tr: "Popüler", ar: "شائع" }),
  с("Панорама", { en: "Panorama", uz: "Panorama", zh: "全景", ko: "파노라마", de: "Panorama", fr: "Panorama", ja: "パノラマ", tr: "Panorama", ar: "بانوراما" }),
  с("Лучшая цена", { en: "Best price", uz: "Eng yaxshi narx", zh: "最优价格", ko: "최저가", de: "Bester Preis", fr: "Meilleur prix", ja: "最安値", tr: "En iyi fiyat", ar: "أفضل سعر" }),
  с("Топ выбор", { en: "Top choice", uz: "Eng yaxshi tanlov", zh: "首选", ko: "최고 추천", de: "Top-Wahl", fr: "Choix n°1", ja: "イチオシ", tr: "En iyi seçim", ar: "الخيار الأفضل" }),
  с("Хит", { en: "Hit", uz: "Xit", zh: "热销", ko: "인기", de: "Hit", fr: "Populaire", ja: "話題", tr: "Gözde", ar: "الأكثر رواجاً" }),

  // ── Кухни ────────────────────────────────────────────────────────
  с("Узбекская", { en: "Uzbek", uz: "Oʻzbek", zh: "乌兹别克菜", ko: "우즈베크", de: "Usbekisch", fr: "Ouzbèke", ja: "ウズベク料理", tr: "Özbek", ar: "أوزبكي" }),
  с("Традиционная", { en: "Traditional", uz: "Anʼanaviy", zh: "传统菜", ko: "전통", de: "Traditionell", fr: "Traditionnel", ja: "伝統料理", tr: "Geleneksel", ar: "تقليدي" }),
  с("Гриль", { en: "Grill", uz: "Gril", zh: "烧烤", ko: "그릴", de: "Grill", fr: "Grill", ja: "グリル", tr: "Izgara", ar: "مشويات" }),

  // ── Советы для туристов ──────────────────────────────────────────
  с("Курс смотрите в конвертере выше — он живой", { en: "See the live rate in the converter above", uz: "Kursni yuqoridagi konvertorda koʻring — u jonli", zh: "上方转换器为实时汇率", ko: "위 계산기에서 실시간 환율 확인", de: "Aktuellen Kurs im Rechner oben ansehen", fr: "Le taux en direct est dans le convertisseur ci-dessus", ja: "上の換算ツールでリアルタイムのレートを確認", tr: "Güncel kuru yukarıdaki çeviricide görün", ar: "اطّلع على السعر الحيّ في المحوّل أعلاه" }),
  с("Обменивайте в банках или обменниках", { en: "Exchange at banks or exchange offices", uz: "Bank yoki almashtirish shoxobchalarida ayirboshlang", zh: "在银行或兑换点换汇", ko: "은행이나 환전소에서 환전", de: "In Banken oder Wechselstuben tauschen", fr: "Changez dans les banques ou bureaux de change", ja: "銀行か両替所で両替を", tr: "Banka veya döviz bürolarında bozdurun", ar: "بدّل في البنوك أو مكاتب الصرافة" }),
  с("Карты принимают в крупных отелях", { en: "Cards are accepted in large hotels", uz: "Kartalar yirik mehmonxonalarda qabul qilinadi", zh: "大型酒店可刷卡", ko: "대형 호텔은 카드 결제 가능", de: "Karten werden in großen Hotels akzeptiert", fr: "Les cartes sont acceptées dans les grands hôtels", ja: "大きなホテルではカードが使えます", tr: "Büyük otellerde kart geçer", ar: "تُقبل البطاقات في الفنادق الكبيرة" }),
  с("Наличные нужны для рынков и кафе", { en: "You'll need cash for markets and cafes", uz: "Bozor va kafelar uchun naqd pul kerak", zh: "市场和咖啡馆需备现金", ko: "시장·카페는 현금 필요", de: "Für Märkte und Cafés brauchen Sie Bargeld", fr: "Prévoyez du liquide pour marchés et cafés", ja: "市場やカフェは現金が必要", tr: "Pazar ve kafeler için nakit gerekir", ar: "تحتاج نقداً للأسواق والمقاهي" }),
  с("Яндекс.Такси — самый удобный", { en: "Yandex Taxi is the most convenient", uz: "Yandex Taksi eng qulayi", zh: "Yandex 打车最方便", ko: "얀덱스 택시가 가장 편리", de: "Yandex Taxi ist am bequemsten", fr: "Yandex Taxi est le plus pratique", ja: "Yandexタクシーが最も便利", tr: "En pratiği Yandex Taksi", ar: "تطبيق Yandex Taxi هو الأسهل" }),
  с("Афросиаб: Ташкент–Самарканд 2 ч $12", { en: "Afrosiyob: Tashkent–Samarkand 2 h $12", uz: "Afrosiyob: Toshkent–Samarqand 2 soat $12", zh: "阿夫罗夏布号：塔什干—撒马尔罕 2小时 $12", ko: "아프로시욥: 타슈켄트–사마르칸트 2시간 $12", de: "Afrosiyob: Taschkent–Samarkand 2 Std. 12 $", fr: "Afrosiyob : Tachkent–Samarcande 2 h 12 $", ja: "アフロシヨブ号：タシケント–サマルカンド2時間 $12", tr: "Afrosiyob: Taşkent–Semerkant 2 sa $12", ar: "أفروسياب: طشقند–سمرقند ساعتان 12$" }),
  с("Самарканд–Бухара 1.5 ч $9", { en: "Samarkand–Bukhara 1.5 h $9", uz: "Samarqand–Buxoro 1,5 soat $9", zh: "撒马尔罕—布哈拉 1.5小时 $9", ko: "사마르칸트–부하라 1.5시간 $9", de: "Samarkand–Buchara 1,5 Std. 9 $", fr: "Samarcande–Boukhara 1,5 h 9 $", ja: "サマルカンド–ブハラ1.5時間 $9", tr: "Semerkant–Buhara 1,5 sa $9", ar: "سمرقند–بخارى 1.5 ساعة 9$" }),
  с("Метро есть только в Ташкенте", { en: "The metro exists only in Tashkent", uz: "Metro faqat Toshkentda bor", zh: "地铁仅塔什干有", ko: "지하철은 타슈켄트에만 있음", de: "U-Bahn gibt es nur in Taschkent", fr: "Le métro n'existe qu'à Tachkent", ja: "地下鉄はタシケントのみ", tr: "Metro yalnızca Taşkent'te var", ar: "المترو موجود في طشقند فقط" }),
  с("Аренда авто от $30/день", { en: "Car rental from $30/day", uz: "Avto ijara $30/kundan", zh: "租车 $30/天起", ko: "렌터카 하루 $30부터", de: "Mietwagen ab 30 $/Tag", fr: "Location de voiture dès 30 $/jour", ja: "レンタカー1日 $30～", tr: "Araç kirası günlük 30$'dan", ar: "تأجير سيارة من 30$ يومياً" }),
  с("Апрель–июнь: +20–28°C — идеально", { en: "April–June: +20–28°C — ideal", uz: "Aprel–iyun: +20–28°C — ideal", zh: "四至六月：+20–28°C，最佳", ko: "4~6월: +20–28°C — 최적", de: "April–Juni: +20–28 °C — ideal", fr: "Avril–juin : +20–28 °C — idéal", ja: "4〜6月：+20〜28°C 最適", tr: "Nisan–Haziran: +20–28°C — ideal", ar: "أبريل–يونيو: +20–28° مثالي" }),
  с("Сентябрь–октябрь: +22–30°C", { en: "September–October: +22–30°C", uz: "Sentabr–oktabr: +22–30°C", zh: "九至十月：+22–30°C", ko: "9~10월: +22–30°C", de: "September–Oktober: +22–30 °C", fr: "Septembre–octobre : +22–30 °C", ja: "9〜10月：+22〜30°C", tr: "Eylül–Ekim: +22–30°C", ar: "سبتمبر–أكتوبر: +22–30°" }),
  с("Июль–август: +35–42°C — зной", { en: "July–August: +35–42°C — very hot", uz: "Iyul–avgust: +35–42°C — jazirama", zh: "七至八月：+35–42°C，酷热", ko: "7~8월: +35–42°C — 무더위", de: "Juli–August: +35–42 °C — Hitze", fr: "Juillet–août : +35–42 °C — canicule", ja: "7〜8月：+35〜42°C 猛暑", tr: "Temmuz–Ağustos: +35–42°C — sıcak", ar: "يوليو–أغسطس: +35–42° حرّ شديد" }),
  с("Берите головной убор и крем", { en: "Bring a hat and sunscreen", uz: "Bosh kiyim va krem oling", zh: "备好帽子和防晒霜", ko: "모자와 자외선 차단제 준비", de: "Hut und Sonnencreme mitnehmen", fr: "Prenez chapeau et crème solaire", ja: "帽子と日焼け止めを", tr: "Şapka ve güneş kremi alın", ar: "خذ قبعة وواقي شمس" }),
  с("Ucell и Beeline — лучшее покрытие", { en: "Ucell and Beeline have the best coverage", uz: "Ucell va Beeline — eng yaxshi qamrov", zh: "Ucell 和 Beeline 信号最佳", ko: "Ucell·Beeline 커버리지 최고", de: "Ucell und Beeline haben beste Abdeckung", fr: "Ucell et Beeline : meilleure couverture", ja: "UcellとBeelineが最も繋がる", tr: "En iyi kapsama Ucell ve Beeline", ar: "Ucell وBeeline الأفضل تغطية" }),
  с("SIM-карта: ~$5, нужен паспорт", { en: "SIM card: ~$5, passport required", uz: "SIM-karta: ~$5, pasport kerak", zh: "SIM卡约$5，需护照", ko: "유심 약 $5, 여권 필요", de: "SIM-Karte: ca. 5 $, Pass nötig", fr: "Carte SIM : ~5 $, passeport requis", ja: "SIMカード：約$5、パスポート必要", tr: "SIM kart: ~$5, pasaport gerekli", ar: "شريحة SIM: ~5$، يلزم جواز السفر" }),
  с("Безлимитный интернет от $3/мес", { en: "Unlimited internet from $3/month", uz: "Cheksiz internet $3/oydan", zh: "无限流量 $3/月起", ko: "무제한 인터넷 월 $3부터", de: "Unbegrenztes Internet ab 3 $/Monat", fr: "Internet illimité dès 3 $/mois", ja: "無制限ネット 月$3～", tr: "Sınırsız internet aylık 3$'dan", ar: "إنترنت غير محدود من 3$ شهرياً" }),
  с("Wi-Fi бесплатно в отелях", { en: "Wi-Fi is free in hotels", uz: "Mehmonxonalarda Wi-Fi bepul", zh: "酒店提供免费 Wi-Fi", ko: "호텔 와이파이 무료", de: "WLAN in Hotels kostenlos", fr: "Wi-Fi gratuit dans les hôtels", ja: "ホテルのWi-Fiは無料", tr: "Otellerde Wi-Fi ücretsiz", ar: "الواي فاي مجاني في الفنادق" }),
  с("В мечетях — скромная одежда", { en: "Dress modestly in mosques", uz: "Masjidlarda kamtarona kiyim", zh: "清真寺着装需端庄", ko: "모스크에서는 단정한 복장", de: "In Moscheen dezente Kleidung", fr: "Tenue modeste dans les mosquées", ja: "モスクでは控えめな服装を", tr: "Camilerde sade giyim", ar: "ارتدِ ملابس محتشمة في المساجد" }),
  с("Снимайте обувь перед входом", { en: "Take off shoes before entering", uz: "Kirishdan oldin poyabzalni yeching", zh: "进门前请脱鞋", ko: "입장 전 신발 벗기", de: "Vor dem Eintritt Schuhe ausziehen", fr: "Retirez vos chaussures avant d'entrer", ja: "入る前に靴を脱ぐ", tr: "Girmeden önce ayakkabıları çıkarın", ar: "اخلع حذاءك قبل الدخول" }),
  с("Спрашивайте перед фото людей", { en: "Ask before photographing people", uz: "Odamlarni suratga olishdan oldin soʻrang", zh: "拍人前先征得同意", ko: "사람 촬영 전 허락 구하기", de: "Vor Personenfotos um Erlaubnis fragen", fr: "Demandez avant de photographier les gens", ja: "人を撮る前に一言を", tr: "İnsanları çekmeden önce sorun", ar: "استأذن قبل تصوير الناس" }),
  с("Левая рука считается нечистой", { en: "The left hand is considered unclean", uz: "Chap qoʻl nopok hisoblanadi", zh: "左手被视为不洁", ko: "왼손은 부정하게 여겨짐", de: "Die linke Hand gilt als unrein", fr: "La main gauche est jugée impure", ja: "左手は不浄とされる", tr: "Sol el kirli sayılır", ar: "اليد اليسرى تُعدّ غير طاهرة" }),
  с("Чаевые 5–10% — не обязательны", { en: "Tips 5–10% — optional", uz: "Choychaqa 5–10% — majburiy emas", zh: "小费 5–10%，非强制", ko: "팁 5–10% — 선택", de: "Trinkgeld 5–10 % — freiwillig", fr: "Pourboire 5–10 % — facultatif", ja: "チップ5〜10%（任意）", tr: "Bahşiş %5–10 — isteğe bağlı", ar: "بقشيش 5–10% اختياري" }),
  с("Пейте бутилированную воду", { en: "Drink bottled water", uz: "Shishadagi suv iching", zh: "请喝瓶装水", ko: "생수를 드세요", de: "Trinken Sie Flaschenwasser", fr: "Buvez de l'eau en bouteille", ja: "ボトル入りの水を", tr: "Şişe suyu için", ar: "اشرب مياهاً معبأة" }),
  с("Скорая: 103, Полиция: 102", { en: "Ambulance: 103, Police: 102", uz: "Tez yordam: 103, Politsiya: 102", zh: "急救：103，警察：102", ko: "구급 103, 경찰 102", de: "Rettung: 103, Polizei: 102", fr: "Ambulance : 103, Police : 102", ja: "救急:103、警察:102", tr: "Ambulans: 103, Polis: 102", ar: "الإسعاف 103، الشرطة 102" }),
  с("Туристический инфолайн: 1322", { en: "Tourist infoline: 1322", uz: "Turistik infoliniya: 1322", zh: "旅游热线：1322", ko: "관광 안내전화 1322", de: "Touristen-Hotline: 1322", fr: "Ligne info tourisme : 1322", ja: "観光インフォライン:1322", tr: "Turist hattı: 1322", ar: "خط معلومات السياحة: 1322" }),
  с("Страховка для путешественников", { en: "Travel insurance", uz: "Sayohatchilar uchun sugʻurta", zh: "旅行保险", ko: "여행자 보험", de: "Reiseversicherung", fr: "Assurance voyage", ja: "旅行保険", tr: "Seyahat sigortası", ar: "تأمين السفر" }),
  с("Плов — главное блюдо, до полудня", { en: "Plov is the main dish, before noon", uz: "Osh — asosiy taom, tushgacha", zh: "抓饭是招牌，午前享用", ko: "플로프는 대표 음식, 정오 전", de: "Plov ist das Hauptgericht, vormittags", fr: "Le plov, plat phare, avant midi", ja: "プロフは名物、正午前に", tr: "Plov ana yemek, öğleden önce", ar: "البلوف الطبق الرئيسي، قبل الظهر" }),
  с("Самса, лагман, шашлык, нон", { en: "Samsa, lagman, shashlik, non", uz: "Somsa, lagʻmon, shashlik, non", zh: "萨姆萨、拉条子、烤肉、囊", ko: "삼사·라그만·샤슬릭·논", de: "Samsa, Lagman, Schaschlik, Non", fr: "Samsa, laghman, chachlik, non", ja: "サムサ、ラグマン、シャシリク、ノン", tr: "Somsa, lağman, şaşlık, non", ar: "سمسة، لغمان، شواء، خبز نون" }),
  с("Базары: Чорсу (Ташкент), Сиаб (Самарканд)", { en: "Bazaars: Chorsu (Tashkent), Siab (Samarkand)", uz: "Bozorlar: Chorsu (Toshkent), Siyob (Samarqand)", zh: "集市：乔尔苏（塔什干）、夏布（撒马尔罕）", ko: "시장: 초르수(타슈켄트), 시압(사마르칸트)", de: "Basare: Chorsu (Taschkent), Siab (Samarkand)", fr: "Bazars : Chorsu (Tachkent), Siab (Samarcande)", ja: "バザール：チョルスー（タシケント）、シアブ（サマルカンド）", tr: "Pazarlar: Çorsu (Taşkent), Siab (Semerkant)", ar: "أسواق: تشورسو (طشقند)، سياب (سمرقند)" }),
  с("Вегетарианцам: мастава, дамлама", { en: "Vegetarians: mastava, damlama", uz: "Vegetarianlarga: mastava, damlama", zh: "素食：马斯塔瓦、达姆拉马", ko: "채식: 마스타바, 담라마", de: "Vegetarisch: Mastawa, Damlama", fr: "Végétariens : mastava, damlama", ja: "ベジタリアン向け：マスタバ、ダムラマ", tr: "Vejetaryenlere: mastava, damlama", ar: "للنباتيين: ماستافا، دملمة" }),
  с("Тип C и F, 220В, 50Гц", { en: "Type C and F, 220V, 50Hz", uz: "C va F turi, 220V, 50Hz", zh: "C/F型，220V，50Hz", ko: "C·F형, 220V, 50Hz", de: "Typ C und F, 220 V, 50 Hz", fr: "Type C et F, 220 V, 50 Hz", ja: "CタイプとFタイプ、220V、50Hz", tr: "Tip C ve F, 220V, 50Hz", ar: "نوع C وF، 220 فولت، 50 هرتز" }),
  с("Адаптер нужен гостям из США/UK", { en: "Guests from US/UK need an adapter", uz: "AQSh/Britaniya mehmonlariga adapter kerak", zh: "美/英游客需转换插头", ko: "미국·영국 방문객은 어댑터 필요", de: "Gäste aus USA/UK brauchen Adapter", fr: "Les visiteurs US/UK ont besoin d'un adaptateur", ja: "米英からの方はアダプター必要", tr: "ABD/İngiltere'den gelenlere adaptör gerekir", ar: "زوّار أمريكا/بريطانيا يحتاجون مهايئاً" }),
  с("Качество электричества стабильное", { en: "Power quality is stable", uz: "Elektr sifati barqaror", zh: "供电稳定", ko: "전력 품질 안정", de: "Stromqualität ist stabil", fr: "La qualité du courant est stable", ja: "電力供給は安定", tr: "Elektrik kalitesi istikrarlı", ar: "جودة الكهرباء مستقرة" }),
  // ── Уведомления ──────────────────────────────────────────────────
  с("Вы рядом с Регистаном", { en: "You're near the Registan", uz: "Registon yaqinidasiz", zh: "您在雷吉斯坦附近", ko: "레기스탄 근처입니다", de: "Sie sind nahe dem Registan", fr: "Vous êtes près du Registan", ja: "レギスタン広場の近くです", tr: "Registan'a yakınsınız", ar: "أنت قرب ريغستان" }),
  с("Нажмите, чтобы включить аудиогид — 8 мин истории.", { en: "Tap to start the audio guide — 8 min of history.", uz: "Audio yoʻriqchini yoqish uchun bosing — 8 daqiqa tarix.", zh: "点击开启语音导览 — 8分钟历史。", ko: "눌러서 오디오 가이드 시작 — 8분 역사.", de: "Tippen für den Audioguide — 8 Min. Geschichte.", fr: "Touchez pour l'audioguide — 8 min d'histoire.", ja: "タップで音声ガイド開始 — 歴史8分。", tr: "Sesli rehber için dokunun — 8 dk tarih.", ar: "اضغط لبدء الدليل الصوتي — 8 دقائق تاريخ." }),
  с("Световое шоу сегодня", { en: "Light show today", uz: "Bugun yorugʻlik shousi", zh: "今晚灯光秀", ko: "오늘 라이트 쇼", de: "Lichtshow heute", fr: "Spectacle de lumière aujourd'hui", ja: "今夜ライトショー", tr: "Bugün ışık gösterisi", ar: "عرض ضوئي اليوم" }),
  с("Регистан · 21:00 · Билеты от $10. Осталось 12 мест!", { en: "Registan · 21:00 · Tickets from $10. 12 seats left!", uz: "Registon · 21:00 · Chiptalar $10 dan. 12 joy qoldi!", zh: "雷吉斯坦 · 21:00 · 门票$10起，仅剩12座！", ko: "레기스탄 · 21:00 · 티켓 $10부터. 12석 남음!", de: "Registan · 21:00 · Tickets ab 10 $. Noch 12 Plätze!", fr: "Registan · 21:00 · Billets dès 10 $. 12 places restantes !", ja: "レギスタン · 21:00 · チケット$10～。残り12席！", tr: "Registan · 21:00 · Bilet 10$'dan. 12 yer kaldı!", ar: "ريغستان · 21:00 · التذاكر من 10$. بقي 12 مقعداً!" }),
  с("Скидка 15% на отели", { en: "15% off hotels", uz: "Mehmonxonalarga 15% chegirma", zh: "酒店 85 折", ko: "호텔 15% 할인", de: "15 % Rabatt auf Hotels", fr: "-15 % sur les hôtels", ja: "ホテル15%オフ", tr: "Otellerde %15 indirim", ar: "خصم 15% على الفنادق" }),
  с("Код UZUP15 до 31 авг.", { en: "Code UZUP15 until Aug 31.", uz: "UZUP15 kodi 31 avgustgacha.", zh: "优惠码 UZUP15，8月31日前有效。", ko: "코드 UZUP15, 8월 31일까지.", de: "Code UZUP15 bis 31. Aug.", fr: "Code UZUP15 jusqu'au 31 août.", ja: "コードUZUP15、8月31日まで。", tr: "UZUP15 kodu 31 Ağustos'a kadar.", ar: "الرمز UZUP15 حتى 31 أغسطس." }),
  с("Маршрут завершён!", { en: "Route completed!", uz: "Marshrut yakunlandi!", zh: "路线已完成！", ko: "경로 완료!", de: "Route abgeschlossen!", fr: "Itinéraire terminé !", ja: "ルート完了！", tr: "Rota tamamlandı!", ar: "اكتمل المسار!" }),
  с("«Самарканд за 1 день» — получите штамп!", { en: "‘Samarkand in 1 day’ — get your stamp!", uz: "«Samarqand 1 kunda» — muhr oling!", zh: "《一日撒马尔罕》— 领取印章！", ko: "'하루 사마르칸트' — 스탬프 받기!", de: "„Samarkand an 1 Tag“ — Stempel holen!", fr: "« Samarcande en 1 jour » — obtenez le tampon !", ja: "「1日サマルカンド」— スタンプ獲得！", tr: "'1 Günde Semerkant' — damganı al!", ar: "«سمرقند في يوم» — احصل على ختمك!" }),
  с("Новый аудиогид", { en: "New audio guide", uz: "Yangi audio yoʻriqchi", zh: "新语音导览", ko: "새 오디오 가이드", de: "Neuer Audioguide", fr: "Nouvel audioguide", ja: "新しい音声ガイド", tr: "Yeni sesli rehber", ar: "دليل صوتي جديد" }),
  с("Гур-э-Амир · Обновлённая версия.", { en: "Gur-e-Amir · Updated version.", uz: "Goʻri Amir · Yangilangan versiya.", zh: "古尔-埃米尔 · 更新版。", ko: "구르에미르 · 업데이트 버전.", de: "Gur-e-Amir · Aktualisierte Version.", fr: "Gour-e Amir · Version mise à jour.", ja: "グル・アミール · 更新版。", tr: "Gur-e Amir · Güncel sürüm.", ar: "غور أمير · نسخة محدّثة." }),
  // ── Реклама и статусы ────────────────────────────────────────────
  с("РЕКЛАМА", { en: "AD", uz: "REKLAMA", zh: "广告", ko: "광고", de: "ANZEIGE", fr: "PUB", ja: "広告", tr: "REKLAM", ar: "إعلان" }),
  с("Перейти", { en: "Open", uz: "Oʻtish", zh: "前往", ko: "이동", de: "Öffnen", fr: "Ouvrir", ja: "開く", tr: "Git", ar: "انتقال" }),
  с("Заказать", { en: "Order", uz: "Buyurtma", zh: "预订", ko: "예약", de: "Bestellen", fr: "Commander", ja: "予約", tr: "Sipariş", ar: "اطلب" }),
  с("Купить билет", { en: "Buy ticket", uz: "Chipta olish", zh: "购票", ko: "티켓 구매", de: "Ticket kaufen", fr: "Acheter un billet", ja: "チケット購入", tr: "Bilet al", ar: "شراء تذكرة" }),
  с("Смотреть меню", { en: "View menu", uz: "Menyuni koʻrish", zh: "查看菜单", ko: "메뉴 보기", de: "Menü ansehen", fr: "Voir le menu", ja: "メニューを見る", tr: "Menüyü gör", ar: "عرض القائمة" }),
  с("Не посещено", { en: "Not visited", uz: "Tashrif buyurilmagan", zh: "未到访", ko: "미방문", de: "Nicht besucht", fr: "Non visité", ja: "未訪問", tr: "Ziyaret edilmedi", ar: "لم تُزَر" }),
];

const СЛОВАРЬ: Map<string, Строка> = new Map(ЗАПИСИ);

/** Перевод строки содержимого. Нет перевода — возвращаем как есть. */
export function переведиКонтент(текст: string, locale: Locale): string {
  if (locale === "ru" || !текст) return текст;
  const п = СЛОВАРЬ.get(текст.trim());
  return п?.[locale] ?? текст;
}
