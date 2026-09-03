/**
 * Языки интерфейса.
 *
 * Приложение ставят иностранцы, и держать его на одном русском — значит
 * закрыть его для большинства гостей страны. Здесь переведён сам
 * интерфейс: кнопки, вкладки, подписи, сообщения — всё, что печатает само
 * приложение. Названия мест и описания вводит редактор в панели; они
 * остаются на том языке, на каком введены, потому что это данные, а не
 * интерфейс, и переводит их человек, а не таблица строк.
 *
 * Переводы настоящие, а не машинные: для интерфейса это посильно, а
 * кривой перевод хуже английского, который поймут почти везде.
 *
 * Арабский пишется справа налево. Это не украшение — при обычном порядке
 * арабский текст ломается и читается наоборот, поэтому у него отдельная
 * пометка направления.
 */

export const LOCALES = ["en", "ru", "uz", "zh", "ko", "de", "fr", "ja", "tr", "ar"] as const;
export type Locale = (typeof LOCALES)[number];

/** Как язык показан в переключателе — флаг и родное самоназвание. */
export const LOCALE_META: Record<Locale, { label: string; dir: "ltr" | "rtl" }> = {
  en: { label: "🇬🇧 English", dir: "ltr" },
  ru: { label: "🇷🇺 Русский", dir: "ltr" },
  uz: { label: "🇺🇿 Oʻzbek", dir: "ltr" },
  zh: { label: "🇨🇳 中文", dir: "ltr" },
  ko: { label: "🇰🇷 한국어", dir: "ltr" },
  de: { label: "🇩🇪 Deutsch", dir: "ltr" },
  fr: { label: "🇫🇷 Français", dir: "ltr" },
  ja: { label: "🇯🇵 日本語", dir: "ltr" },
  tr: { label: "🇹🇷 Türkçe", dir: "ltr" },
  ar: { label: "🇸🇦 العربية", dir: "rtl" },
};

/**
 * Словарь. У каждой строки — перевод на все десять языков в одном
 * порядке с LOCALES: так добавить ключ можно только вместе с переводами,
 * и пропуск сразу виден.
 */
type Row = Record<Locale, string>;

function row(
  en: string,
  ru: string,
  uz: string,
  zh: string,
  ko: string,
  de: string,
  fr: string,
  ja: string,
  tr: string,
  ar: string,
): Row {
  return { en, ru, uz, zh, ko, de, fr, ja, tr, ar };
}

export const СЛОВАРЬ = {
  // ── Нижнее меню ──────────────────────────────────────────────────
  nav_home: row("Home", "Главная", "Bosh sahifa", "首页", "홈", "Start", "Accueil", "ホーム", "Ana sayfa", "الرئيسية"),
  nav_explore: row("Explore", "Исследовать", "Kashf etish", "探索", "탐색", "Entdecken", "Explorer", "さがす", "Keşfet", "استكشاف"),
  nav_map: row("Map", "Карта", "Xarita", "地图", "지도", "Karte", "Carte", "地図", "Harita", "الخريطة"),
  nav_audio: row("Audio", "Аудио", "Audio", "语音", "오디오", "Audio", "Audio", "音声", "Sesli", "الصوت"),
  nav_profile: row("Profile", "Профиль", "Profil", "我的", "프로필", "Profil", "Profil", "プロフィール", "Profil", "الملف"),

  // ── Общие кнопки ─────────────────────────────────────────────────
  common_search: row("Search", "Найти", "Qidirish", "搜索", "검색", "Suchen", "Rechercher", "検索", "Ara", "بحث"),
  common_back: row("Back", "Назад", "Orqaga", "返回", "뒤로", "Zurück", "Retour", "戻る", "Geri", "رجوع"),
  common_open: row("Open", "Открыть", "Ochish", "打开", "열기", "Öffnen", "Ouvrir", "開く", "Aç", "فتح"),
  common_close: row("Close", "Закрыть", "Yopish", "关闭", "닫기", "Schließen", "Fermer", "閉じる", "Kapat", "إغلاق"),
  common_save: row("Save", "Сохранить", "Saqlash", "保存", "저장", "Speichern", "Enregistrer", "保存", "Kaydet", "حفظ"),
  common_cancel: row("Cancel", "Отмена", "Bekor qilish", "取消", "취소", "Abbrechen", "Annuler", "キャンセル", "İptal", "إلغاء"),
  common_delete: row("Delete", "Удалить", "Oʻchirish", "删除", "삭제", "Löschen", "Supprimer", "削除", "Sil", "حذف"),
  common_all: row("All", "Всё", "Hammasi", "全部", "전체", "Alle", "Tout", "すべて", "Tümü", "الكل"),
  common_loading: row("Loading…", "Загрузка…", "Yuklanmoqda…", "加载中…", "불러오는 중…", "Wird geladen…", "Chargement…", "読み込み中…", "Yükleniyor…", "جارٍ التحميل…"),
  common_km: row("km", "км", "km", "公里", "km", "km", "km", "km", "km", "كم"),
  common_min: row("min", "мин", "daq", "分钟", "분", "Min.", "min", "分", "dk", "دقيقة"),
  common_from: row("from", "от", "dan", "起", "부터", "ab", "à partir de", "から", "başlangıç", "من"),
  common_night: row("per night", "за ночь", "bir kecha", "每晚", "1박", "pro Nacht", "par nuit", "1泊", "gecelik", "لليلة"),

  // ── Стартовый экран ──────────────────────────────────────────────
  splash_tagline: row(
    "Discover the beauty of Uzbekistan",
    "Открой красоту Узбекистана",
    "Oʻzbekiston goʻzalligini kashf eting",
    "探索乌兹别克斯坦之美",
    "우즈베키스탄의 아름다움을 만나보세요",
    "Entdecken Sie die Schönheit Usbekistans",
    "Découvrez la beauté de l'Ouzbékistan",
    "ウズベキスタンの美しさを発見",
    "Özbekistan'ın güzelliğini keşfedin",
    "اكتشف جمال أوزبكستان",
  ),
  splash_sub: row(
    "Routes, audio guides, AI assistant and everything about Uzbekistan",
    "Маршруты, аудиогиды, AI-помощник и всё об Узбекистане",
    "Marshrutlar, audio yoʻriqchilar, AI-yordamchi va Oʻzbekiston haqida hammasi",
    "路线、语音导览、AI 助手，关于乌兹别克斯坦的一切",
    "경로, 오디오 가이드, AI 도우미 등 우즈베키스탄의 모든 것",
    "Routen, Audioguides, KI-Assistent und alles über Usbekistan",
    "Itinéraires, audioguides, assistant IA et tout sur l'Ouzbékistan",
    "ルート、音声ガイド、AIアシスタント、ウズベキスタンのすべて",
    "Rotalar, sesli rehberler, yapay zekâ asistanı ve Özbekistan hakkında her şey",
    "مسارات وأدلة صوتية ومساعد ذكاء اصطناعي وكل شيء عن أوزبكستان",
  ),
  splash_start: row(
    "Start the journey",
    "Начать путешествие",
    "Sayohatni boshlash",
    "开始旅程",
    "여행 시작하기",
    "Reise beginnen",
    "Commencer le voyage",
    "旅を始める",
    "Yolculuğa başla",
    "ابدأ الرحلة",
  ),
  splash_login: row(
    "Sign in to your account",
    "Войти в аккаунт",
    "Hisobga kirish",
    "登录账户",
    "계정 로그인",
    "Anmelden",
    "Se connecter",
    "ログイン",
    "Hesaba giriş yap",
    "تسجيل الدخول",
  ),
  splash_places: row("places", "мест", "joy", "个地点", "곳", "Orte", "lieux", "スポット", "yer", "موقع"),
  splash_langs: row("languages", "языков", "til", "种语言", "개 언어", "Sprachen", "langues", "言語", "dil", "لغة"),
  splash_rating: row("rating", "рейтинг", "reyting", "评分", "평점", "Bewertung", "note", "評価", "puan", "التقييم"),

  // ── Регистрация и вход ───────────────────────────────────────────
  reg_title: row("Create account", "Создать аккаунт", "Hisob yaratish", "创建账户", "계정 만들기", "Konto erstellen", "Créer un compte", "アカウント作成", "Hesap oluştur", "إنشاء حساب"),
  reg_sub: row(
    "To save routes and favourites",
    "Чтобы сохранять маршруты и избранное",
    "Marshrut va sevimlilarni saqlash uchun",
    "保存路线和收藏",
    "경로와 즐겨찾기를 저장하려면",
    "Um Routen und Favoriten zu speichern",
    "Pour enregistrer itinéraires et favoris",
    "ルートとお気に入りを保存するため",
    "Rota ve favorileri kaydetmek için",
    "لحفظ المسارات والمفضلة",
  ),
  reg_photo: row("Photo", "Фото", "Rasm", "照片", "사진", "Foto", "Photo", "写真", "Fotoğraf", "صورة"),
  reg_first: row("First name", "Имя", "Ism", "名字", "이름", "Vorname", "Prénom", "名", "Ad", "الاسم"),
  reg_last: row("Last name", "Фамилия", "Familiya", "姓氏", "성", "Nachname", "Nom", "姓", "Soyad", "اللقب"),
  reg_email: row("Email", "Почта", "Email", "邮箱", "이메일", "E-Mail", "E-mail", "メール", "E-posta", "البريد"),
  reg_password: row("Password", "Пароль", "Parol", "密码", "비밀번호", "Passwort", "Mot de passe", "パスワード", "Şifre", "كلمة المرور"),
  reg_country: row("Country", "Страна", "Davlat", "国家", "국가", "Land", "Pays", "国", "Ülke", "الدولة"),
  reg_no_passport: row(
    "Passport details are not requested or stored.",
    "Паспортные данные не запрашиваются и не хранятся.",
    "Pasport maʼlumotlari soʻralmaydi va saqlanmaydi.",
    "不索取也不保存护照信息。",
    "여권 정보는 요청하거나 저장하지 않습니다.",
    "Passdaten werden nicht abgefragt oder gespeichert.",
    "Les données du passeport ne sont ni demandées ni conservées.",
    "パスポート情報は取得も保存もしません。",
    "Pasaport bilgileri istenmez ve saklanmaz.",
    "لا يتم طلب بيانات جواز السفر أو تخزينها.",
  ),
  login_title: row("Sign in", "Вход", "Kirish", "登录", "로그인", "Anmelden", "Connexion", "ログイン", "Giriş", "تسجيل الدخول"),
  login_forgot: row("Forgot password?", "Забыли пароль?", "Parolni unutdingizmi?", "忘记密码？", "비밀번호를 잊으셨나요?", "Passwort vergessen?", "Mot de passe oublié ?", "パスワードをお忘れですか？", "Şifrenizi mi unuttunuz?", "هل نسيت كلمة المرور؟"),

  // ── Главная ──────────────────────────────────────────────────────
  home_welcome: row("Welcome", "Добро пожаловать", "Xush kelibsiz", "欢迎", "환영합니다", "Willkommen", "Bienvenue", "ようこそ", "Hoş geldiniz", "أهلاً بك"),
  home_search_ph: row("Where do you want to go?", "Куда вы хотите поехать?", "Qayerga bormoqchisiz?", "您想去哪里？", "어디로 가고 싶으세요?", "Wohin möchten Sie reisen?", "Où souhaitez-vous aller ?", "どこへ行きますか？", "Nereye gitmek istersiniz?", "إلى أين تريد الذهاب؟"),
  home_places: row("Places", "Места", "Joylar", "景点", "명소", "Orte", "Lieux", "スポット", "Yerler", "أماكن"),
  home_routes: row("Routes", "Маршруты", "Marshrutlar", "路线", "경로", "Routen", "Itinéraires", "ルート", "Rotalar", "مسارات"),
  home_hotels: row("Hotels", "Отели", "Mehmonxonalar", "酒店", "호텔", "Hotels", "Hôtels", "ホテル", "Oteller", "فنادق"),
  home_restaurants: row("Restaurants", "Рестораны", "Restoranlar", "餐厅", "레스토랑", "Restaurants", "Restaurants", "レストラン", "Restoranlar", "مطاعم"),
  home_transport: row("Transport", "Транспорт", "Transport", "交通", "교통", "Transport", "Transport", "交通", "Ulaşım", "النقل"),
  home_transport_sub: row("Flights · Trains · Intercity taxi", "Рейсы · Поезда · Межгород такси", "Reyslar · Poyezdlar · Shaharlararo taksi", "航班 · 火车 · 城际出租车", "항공 · 기차 · 시외 택시", "Flüge · Züge · Überlandtaxi", "Vols · Trains · Taxi interurbain", "航空 · 鉄道 · 都市間タクシー", "Uçuşlar · Trenler · Şehirlerarası taksi", "رحلات · قطارات · تاكسي بين المدن"),
  home_weather: row("Weather today", "Погода сегодня", "Bugungi ob-havo", "今日天气", "오늘 날씨", "Wetter heute", "Météo du jour", "今日の天気", "Bugün hava", "طقس اليوم"),
  home_popular_cities: row("Popular cities", "Популярные города", "Mashhur shaharlar", "热门城市", "인기 도시", "Beliebte Städte", "Villes populaires", "人気の都市", "Popüler şehirler", "مدن مشهورة"),
  home_why: row("Why choose UzUp?", "Почему выбирают UzUp?", "Nega UzUp tanlanadi?", "为什么选择 UzUp？", "왜 UzUp일까요?", "Warum UzUp?", "Pourquoi UzUp ?", "なぜUzUpなのか", "Neden UzUp?", "لماذا UzUp؟"),
  home_all: row("All →", "Все →", "Barchasi →", "全部 →", "전체 →", "Alle →", "Tout →", "すべて →", "Tümü →", "الكل →"),

  // ── Исследовать ──────────────────────────────────────────────────
  explore_kicker: row("EXPLORE", "ИССЛЕДОВАТЬ", "KASHF ETISH", "探索", "탐색", "ENTDECKEN", "EXPLORER", "さがす", "KEŞFET", "استكشاف"),
  explore_title: row("Discover Uzbekistan", "Открой Узбекистан", "Oʻzbekistonni kashf eting", "发现乌兹别克斯坦", "우즈베키스탄 발견", "Usbekistan entdecken", "Découvrez l'Ouzbékistan", "ウズベキスタンを発見", "Özbekistan'ı keşfet", "اكتشف أوزبكستان"),
  f_history: row("History", "История", "Tarix", "历史", "역사", "Geschichte", "Histoire", "歴史", "Tarih", "التاريخ"),
  f_mosques: row("Mosques", "Мечети", "Masjidlar", "清真寺", "모스크", "Moscheen", "Mosquées", "モスク", "Camiler", "مساجد"),
  f_museums: row("Museums", "Музеи", "Muzeylar", "博物馆", "박물관", "Museen", "Musées", "博物館", "Müzeler", "متاحف"),
  f_nature: row("Nature", "Природа", "Tabiat", "自然", "자연", "Natur", "Nature", "自然", "Doğa", "الطبيعة"),
  f_bazaars: row("Bazaars", "Базары", "Bozorlar", "集市", "시장", "Basare", "Bazars", "バザール", "Pazarlar", "أسواق"),

  // ── Карта и маршруты ─────────────────────────────────────────────
  map_kicker: row("ROUTES & MAP", "МАРШРУТЫ И КАРТА", "MARSHRUT VA XARITA", "路线与地图", "경로 및 지도", "ROUTEN & KARTE", "ITINÉRAIRES & CARTE", "ルートと地図", "ROTALAR VE HARİTA", "المسارات والخريطة"),
  map_title: row("Plan your trip", "Спланируй поездку", "Sayohatni rejalashtiring", "规划行程", "여행 계획하기", "Reise planen", "Planifiez votre voyage", "旅行を計画", "Yolculuğunu planla", "خطط لرحلتك"),
  map_tab_map: row("Map", "Карта", "Xarita", "地图", "지도", "Karte", "Carte", "地図", "Harita", "الخريطة"),
  map_tab_routes: row("Routes", "Маршруты", "Marshrutlar", "路线", "경로", "Routen", "Itinéraires", "ルート", "Rotalar", "مسارات"),
  map_tab_ai: row("AI guide", "AI-гид", "AI-gid", "AI 向导", "AI 가이드", "KI-Guide", "Guide IA", "AIガイド", "Yapay zekâ rehberi", "دليل ذكي"),
  map_uz: row("Map of Uzbekistan", "Карта Узбекистана", "Oʻzbekiston xaritasi", "乌兹别克斯坦地图", "우즈베키스탄 지도", "Karte von Usbekistan", "Carte de l'Ouzbékistan", "ウズベキスタンの地図", "Özbekistan haritası", "خريطة أوزبكستان"),
  map_where_you: row("Tap a city · the blue dot is you", "Нажмите город · синяя точка — вы", "Shaharni bosing · koʻk nuqta — siz", "点击城市 · 蓝点是您", "도시를 누르세요 · 파란 점이 나", "Stadt antippen · blauer Punkt sind Sie", "Touchez une ville · le point bleu, c'est vous", "都市をタップ · 青い点があなた", "Şehre dokunun · mavi nokta sizsiniz", "اضغط على مدينة · النقطة الزرقاء هي أنت"),
  map_where_am_i: row("Where am I", "Где я", "Men qayerda", "我在哪", "내 위치", "Wo bin ich", "Où suis-je", "現在地", "Neredeyim", "أين أنا"),
  map_refresh: row("Refresh", "Обновить", "Yangilash", "刷新", "새로고침", "Aktualisieren", "Actualiser", "更新", "Yenile", "تحديث"),
  map_route: row("ROUTE", "МАРШРУТ", "MARSHRUT", "路线", "경로", "ROUTE", "ITINÉRAIRE", "ルート", "ROTA", "المسار"),
  map_you_here: row("You are here", "Вы здесь", "Siz shu yerdasiz", "您在这里", "여기 있습니다", "Sie sind hier", "Vous êtes ici", "現在地", "Buradasınız", "أنت هنا"),
  map_open_nav: row("Open in navigator", "Открыть в навигаторе", "Navigatorda ochish", "在导航中打开", "내비게이션에서 열기", "In Navigation öffnen", "Ouvrir dans le navigateur", "ナビで開く", "Navigasyonda aç", "افتح في الملاحة"),
  map_by_road: row("By road", "По дороге", "Yoʻl boʻyicha", "按道路", "도로 기준", "Straße", "Par la route", "道路経由", "Yol ile", "عبر الطريق"),
  map_straight: row("Straight line", "По прямой", "Toʻgʻri chiziq", "直线", "직선", "Luftlinie", "À vol d'oiseau", "直線", "Kuş uçuşu", "خط مستقيم"),
  map_by_car: row("By car", "На машине", "Mashinada", "驾车", "자동차", "Mit dem Auto", "En voiture", "車で", "Arabayla", "بالسيارة"),
  map_on_foot: row("On foot", "Пешком", "Piyoda", "步行", "도보", "Zu Fuß", "À pied", "徒歩", "Yürüyerek", "سيراً"),
  map_selected_city: row("Selected city", "Выбранный город", "Tanlangan shahar", "已选城市", "선택한 도시", "Ausgewählte Stadt", "Ville sélectionnée", "選択した都市", "Seçilen şehir", "المدينة المختارة"),

  // ── Такси ────────────────────────────────────────────────────────
  taxi_title: row("Taxi", "Такси", "Taksi", "出租车", "택시", "Taxi", "Taxi", "タクシー", "Taksi", "تاكسي"),
  taxi_my_loc: row("My location", "Моё местоположение", "Mening joylashuvim", "我的位置", "내 위치", "Mein Standort", "Ma position", "現在地", "Konumum", "موقعي"),
  taxi_from_here: row("From here", "Отсюда", "Shu yerdan", "从这里", "여기서", "Von hier", "D'ici", "ここから", "Buradan", "من هنا"),
  taxi_where_to: row("Where to", "Куда едем", "Qayerga", "去哪里", "어디로", "Wohin", "Destination", "行き先", "Nereye", "إلى أين"),
  taxi_on_map: row("On map", "На карте", "Xaritada", "在地图上", "지도에서", "Auf Karte", "Sur la carte", "地図で", "Haritada", "على الخريطة"),
  taxi_hide_map: row("Hide map", "Скрыть карту", "Xaritani yashirish", "隐藏地图", "지도 숨기기", "Karte ausblenden", "Masquer la carte", "地図を隠す", "Haritayı gizle", "إخفاء الخريطة"),
  taxi_open_go: row("Open in Yandex Go", "Открыть в Яндекс Go", "Yandex Go'da ochish", "在 Yandex Go 打开", "Yandex Go에서 열기", "In Yandex Go öffnen", "Ouvrir dans Yandex Go", "Yandex Goで開く", "Yandex Go'da aç", "افتح في Yandex Go"),
  taxi_pick_dest: row("Choose a destination", "Выберите, куда едем", "Manzilni tanlang", "请选择目的地", "목적지를 선택하세요", "Ziel wählen", "Choisissez la destination", "行き先を選択", "Varış noktası seçin", "اختر الوجهة"),

  // ── Аудио ────────────────────────────────────────────────────────
  audio_kicker: row("AUDIO GUIDE", "АУДИОГИД", "AUDIO YOʻRIQCHI", "语音导览", "오디오 가이드", "AUDIOGUIDE", "AUDIOGUIDE", "音声ガイド", "SESLİ REHBER", "الدليل الصوتي"),
  audio_title: row("Listen to stories", "Слушай истории", "Hikoyalarni tinglang", "聆听故事", "이야기를 들어보세요", "Geschichten hören", "Écoutez les histoires", "物語を聴く", "Hikâyeleri dinle", "استمع إلى القصص"),
  audio_lang: row("Audio guide language", "Язык аудиогида", "Audio yoʻriqchi tili", "语音导览语言", "오디오 가이드 언어", "Sprache des Audioguides", "Langue de l'audioguide", "音声ガイドの言語", "Sesli rehber dili", "لغة الدليل الصوتي"),
  audio_scan: row("Scan code", "Сканировать код", "Kodni skanerlash", "扫描代码", "코드 스캔", "Code scannen", "Scanner le code", "コードをスキャン", "Kodu tara", "امسح الرمز"),
  audio_scan_hint: row("Point the camera at the plaque — the right guide starts", "Наведите камеру на табличку — включится нужный аудиогид", "Kamerani lavhaga qarating — kerakli yoʻriqchi yoqiladi", "将相机对准标牌 — 相应导览开始", "안내판에 카메라를 대세요 — 해당 가이드가 시작됩니다", "Kamera auf das Schild richten — der passende Guide startet", "Pointez la caméra sur la plaque — le bon guide démarre", "プレートにカメラを向けると案内が始まります", "Kamerayı levhaya tutun — doğru rehber başlar", "وجّه الكاميرا نحو اللوحة — يبدأ الدليل المناسب"),
  audio_available: row("Available recordings", "Доступные записи", "Mavjud yozuvlar", "可用录音", "이용 가능한 녹음", "Verfügbare Aufnahmen", "Enregistrements disponibles", "利用可能な録音", "Mevcut kayıtlar", "التسجيلات المتاحة"),
  audio_none: row(
    "No audio guides yet. They will appear here once recorded.",
    "Аудиогидов пока нет. Как только их запишут, они появятся здесь.",
    "Hozircha audio yoʻriqchilar yoʻq. Yozilgach, shu yerda paydo boʻladi.",
    "暂无语音导览。录制后将显示在此处。",
    "아직 오디오 가이드가 없습니다. 녹음되면 여기에 표시됩니다.",
    "Noch keine Audioguides. Sie erscheinen hier, sobald sie aufgenommen sind.",
    "Pas encore d'audioguides. Ils apparaîtront ici une fois enregistrés.",
    "音声ガイドはまだありません。録音され次第ここに表示されます。",
    "Henüz sesli rehber yok. Kaydedildiğinde burada görünecek.",
    "لا توجد أدلة صوتية بعد. ستظهر هنا بمجرد تسجيلها.",
  ),

  // ── Профиль ──────────────────────────────────────────────────────
  prof_traveler: row("Traveler", "Путешественник", "Sayohatchi", "旅行者", "여행자", "Reisende:r", "Voyageur", "旅行者", "Gezgin", "مسافر"),
  prof_passport: row("Passport", "Паспорт", "Pasport", "护照", "여권", "Pass", "Passeport", "パスポート", "Pasaport", "جواز"),
  prof_bookings: row("Bookings", "Заявки", "Buyurtmalar", "预订", "예약", "Buchungen", "Réservations", "予約", "Rezervasyonlar", "الحجوزات"),
  prof_support: row("Support", "Поддержка", "Qoʻllab-quvvatlash", "客服", "고객지원", "Support", "Assistance", "サポート", "Destek", "الدعم"),
  prof_ai: row("AI guide", "AI-гид", "AI-gid", "AI 向导", "AI 가이드", "KI-Guide", "Guide IA", "AIガイド", "Yapay zekâ rehberi", "دليل ذكي"),
  prof_stats: row("Stats", "Стат.", "Statistika", "统计", "통계", "Statistik", "Stats", "統計", "İstatistik", "إحصاء"),
  prof_settings: row("Settings", "Настройки", "Sozlamalar", "设置", "설정", "Einstellungen", "Paramètres", "設定", "Ayarlar", "الإعدادات"),
  prof_digital_passport: row("Digital Passport", "Цифровой Паспорт", "Raqamli pasport", "数字护照", "디지털 여권", "Digitaler Pass", "Passeport numérique", "デジタルパスポート", "Dijital Pasaport", "الجواز الرقمي"),
  prof_stamps: row("Stamp collection", "Коллекция штампов", "Muhrlar toʻplami", "印章收藏", "스탬프 컬렉션", "Stempelsammlung", "Collection de tampons", "スタンプコレクション", "Damga koleksiyonu", "مجموعة الأختام"),
  prof_language: row("Language", "Язык", "Til", "语言", "언어", "Sprache", "Langue", "言語", "Dil", "اللغة"),
  prof_notifications: row("Notifications", "Уведомления", "Bildirishnomalar", "通知", "알림", "Benachrichtigungen", "Notifications", "通知", "Bildirimler", "الإشعارات"),
  prof_appearance: row("Appearance", "Внешний вид", "Koʻrinish", "外观", "화면", "Darstellung", "Apparence", "外観", "Görünüm", "المظهر"),
  prof_about: row("About the app", "О приложении", "Ilova haqida", "关于应用", "앱 정보", "Über die App", "À propos", "アプリについて", "Uygulama hakkında", "عن التطبيق"),
  prof_send_location: row("Share location", "Отправить геолокацию", "Joylashuvni yuborish", "分享位置", "위치 공유", "Standort teilen", "Partager la position", "位置情報を送る", "Konumu paylaş", "مشاركة الموقع"),
  prof_logout: row("Log out", "Выйти", "Chiqish", "退出登录", "로그아웃", "Abmelden", "Se déconnecter", "ログアウト", "Çıkış yap", "تسجيل الخروج"),
  prof_account: row("Account", "Аккаунт", "Hisob", "账户", "계정", "Konto", "Compte", "アカウント", "Hesap", "الحساب"),

  // ── Оплата ───────────────────────────────────────────────────────
  pay_premium: row("UzUp Pro", "UzUp Pro", "UzUp Pro", "UzUp Pro", "UzUp Pro", "UzUp Pro", "UzUp Pro", "UzUp Pro", "UzUp Pro", "UzUp Pro"),
  pay_no_ads: row("No ads", "Без рекламы", "Reklamasiz", "无广告", "광고 없음", "Keine Werbung", "Sans publicité", "広告なし", "Reklamsız", "بدون إعلانات"),
  pay_pay: row("Pay", "Оплатить", "Toʻlash", "支付", "결제", "Bezahlen", "Payer", "支払う", "Öde", "ادفع"),
  pay_month: row("month", "месяц", "oy", "月", "월", "Monat", "mois", "月", "ay", "شهر"),
  pay_via_payme: row("Pay with Payme", "Оплатить через Payme", "Payme orqali toʻlash", "通过 Payme 支付", "Payme로 결제", "Mit Payme bezahlen", "Payer avec Payme", "Paymeで支払う", "Payme ile öde", "ادفع عبر Payme"),
  pay_via_click: row("Pay with Click", "Оплатить через Click", "Click orqali toʻlash", "通过 Click 支付", "Click으로 결제", "Mit Click bezahlen", "Payer avec Click", "Clickで支払う", "Click ile öde", "ادفع عبر Click"),
  pay_soon: row(
    "Online payment is not connected yet.",
    "Онлайн-оплата пока не подключена.",
    "Onlayn toʻlov hali ulanmagan.",
    "在线支付尚未接入。",
    "온라인 결제가 아직 연결되지 않았습니다.",
    "Online-Zahlung ist noch nicht eingerichtet.",
    "Le paiement en ligne n'est pas encore activé.",
    "オンライン決済はまだ接続されていません。",
    "Çevrimiçi ödeme henüz bağlı değil.",
    "الدفع الإلكتروني غير مفعّل بعد.",
  ),

  // ── Погода ───────────────────────────────────────────────────────
  w_clear: row("Clear", "Ясно", "Ochiq", "晴", "맑음", "Klar", "Dégagé", "快晴", "Açık", "صافٍ"),
  w_partly: row("Partly cloudy", "Малооблачно", "Ozgina bulutli", "少云", "구름 조금", "Leicht bewölkt", "Peu nuageux", "晴れ時々曇り", "Az bulutlu", "غائم جزئياً"),
  w_cloudy: row("Cloudy", "Облачно", "Bulutli", "多云", "흐림", "Bewölkt", "Nuageux", "曇り", "Bulutlu", "غائم"),
  w_fog: row("Fog", "Туман", "Tuman", "雾", "안개", "Nebel", "Brouillard", "霧", "Sisli", "ضباب"),
  w_drizzle: row("Drizzle", "Морось", "Mayda yomgʻir", "毛毛雨", "이슬비", "Nieselregen", "Bruine", "霧雨", "Çise", "رذاذ"),
  w_rain: row("Rain", "Дождь", "Yomgʻir", "雨", "비", "Regen", "Pluie", "雨", "Yağmur", "مطر"),
  w_snow: row("Snow", "Снег", "Qor", "雪", "눈", "Schnee", "Neige", "雪", "Kar", "ثلج"),
  w_thunder: row("Thunderstorm", "Гроза", "Momaqaldiroq", "雷雨", "뇌우", "Gewitter", "Orage", "雷雨", "Gök gürültülü", "عاصفة رعدية"),
  w_wind: row("km/h", "км/ч", "km/soat", "公里/时", "km/h", "km/h", "km/h", "km/h", "km/s", "كم/س"),
  cur_title: row("Currency converter", "Конвертер валют", "Valyuta konvertori", "货币兑换", "환율 계산기", "Währungsrechner", "Convertisseur de devises", "通貨換算", "Döviz çevirici", "محوّل العملات"),
  cur_amount: row("Amount", "Сумма", "Miqdor", "金额", "금액", "Betrag", "Montant", "金額", "Tutar", "المبلغ"),
  cur_from: row("From", "Из", "Dan", "从", "보내는", "Von", "De", "から", "Kaynak", "من"),
  cur_to: row("To", "В", "Ga", "到", "받는", "Nach", "Vers", "へ", "Hedef", "إلى"),
  cur_updated: row("Rate updated", "Курс обновлён", "Kurs yangilandi", "汇率更新于", "환율 업데이트", "Kurs aktualisiert", "Taux mis à jour", "レート更新", "Kur güncellendi", "حُدّث السعر"),
  cur_unavailable: row("Exchange rate is unavailable right now.", "Курс сейчас недоступен.", "Kurs hozircha mavjud emas.", "暂时无法获取汇率。", "현재 환율을 가져올 수 없습니다.", "Wechselkurs derzeit nicht verfügbar.", "Taux de change indisponible pour le moment.", "現在レートを取得できません。", "Kur şu anda alınamıyor.", "سعر الصرف غير متاح حالياً."),
  w_feels: row("feels like", "ощущается", "his etiladi", "体感", "체감", "gefühlt", "ressenti", "体感", "hissedilen", "الإحساس"),
} as const;

export type TKey = keyof typeof СЛОВАРЬ;

const ЗАПАСНОЙ: Locale = "en";

/** Перевод строки. Нет перевода на язык — отдаём английский, а не пустоту. */
export function переведи(key: TKey, locale: Locale): string {
  const строка = СЛОВАРЬ[key];
  return строка[locale] ?? строка[ЗАПАСНОЙ] ?? key;
}

/** Язык по настройкам устройства, приведённый к нашему списку. */
export function языкУстройства(): Locale {
  if (typeof navigator === "undefined") return "en";
  const код = navigator.language.slice(0, 2).toLowerCase();
  return (LOCALES as readonly string[]).includes(код) ? (код as Locale) : "en";
}
