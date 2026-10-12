import type { Locale } from "./i18n";

/**
 * Переводы мест Самарканда из базы владельца (src/data/samarkand.ts):
 * названия, подписи «Полезно знать» и описания на девять языков.
 * Ключ — русская строка из данных, как во всём словаре content-i18n.
 */

type Строка = Partial<Record<Locale, string>>;
const с = (ключ: string, п: Строка): [string, Строка] => [ключ, п];

export const ПЕРЕВОДЫ_САМАРКАНДА: [string, Строка][] = [
  // ── Типы и служебное ─────────────────────────────────────────────
  с("Ремёсла", { en: "Crafts", uz: "Hunarmandchilik", zh: "手工艺", ko: "공예", de: "Handwerk", fr: "Artisanat", ja: "工芸", tr: "El sanatları", ar: "حِرف يدوية" }),
  с("Памятник", { en: "Monument", uz: "Haykal", zh: "纪念碑", ko: "기념비", de: "Denkmal", fr: "Monument", ja: "記念碑", tr: "Anıt", ar: "نصب تذكاري" }),
  с("Платно", { en: "Paid", uz: "Pullik", zh: "收费", ko: "유료", de: "Kostenpflichtig", fr: "Payant", ja: "有料", tr: "Ücretli", ar: "مدفوع" }),
  с("Уточняйте", { en: "Check on site", uz: "Joyida aniqlang", zh: "请现场确认", ko: "현장 확인", de: "Vor Ort erfragen", fr: "À vérifier sur place", ja: "現地で確認", tr: "Yerinde sorun", ar: "تحقّق في المكان" }),
  с("Время на осмотр", { en: "Time needed", uz: "Koʻrish uchun vaqt", zh: "参观时长", ko: "관람 시간", de: "Besuchsdauer", fr: "Durée de visite", ja: "所要時間", tr: "Gezi süresi", ar: "مدة الزيارة" }),
  с("Дресс-код", { en: "Dress code", uz: "Kiyinish qoidasi", zh: "着装要求", ko: "복장 규정", de: "Kleiderordnung", fr: "Tenue", ja: "服装", tr: "Kıyafet kuralı", ar: "قواعد اللباس" }),
  с("Плечи и колени закрыты, женщинам — платок", { en: "Shoulders and knees covered; headscarf for women", uz: "Yelka va tizzalar yopiq, ayollarga roʻmol", zh: "遮住肩膀和膝盖，女性需戴头巾", ko: "어깨와 무릎을 가리고, 여성은 스카프 착용", de: "Schultern und Knie bedeckt, Frauen mit Kopftuch", fr: "Épaules et genoux couverts, foulard pour les femmes", ja: "肩と膝を覆う服装、女性はスカーフを", tr: "Omuzlar ve dizler kapalı, kadınlara başörtüsü", ar: "تغطية الكتفين والركبتين، وغطاء رأس للنساء" }),
  с("Билеты", { en: "Tickets", uz: "Chiptalar", zh: "门票", ko: "입장권", de: "Tickets", fr: "Billets", ja: "チケット", tr: "Biletler", ar: "التذاكر" }),
  с("Телефон", { en: "Phone", uz: "Telefon", zh: "电话", ko: "전화", de: "Telefon", fr: "Téléphone", ja: "電話", tr: "Telefon", ar: "الهاتف" }),
  с("Цены — samarkandmuseum.uz/preiskurant", { en: "Prices: samarkandmuseum.uz/preiskurant", uz: "Narxlar — samarkandmuseum.uz/preiskurant", zh: "票价见 samarkandmuseum.uz/preiskurant", ko: "요금: samarkandmuseum.uz/preiskurant", de: "Preise: samarkandmuseum.uz/preiskurant", fr: "Tarifs : samarkandmuseum.uz/preiskurant", ja: "料金：samarkandmuseum.uz/preiskurant", tr: "Fiyatlar: samarkandmuseum.uz/preiskurant", ar: "الأسعار: samarkandmuseum.uz/preiskurant" }),
  с("10–20 минут", { en: "10–20 min", uz: "10–20 daqiqa", zh: "10–20 分钟", ko: "10–20분", de: "10–20 Min.", fr: "10–20 min", ja: "10〜20分", tr: "10–20 dk", ar: "10–20 دقيقة" }),
  с("15–30 минут", { en: "15–30 min", uz: "15–30 daqiqa", zh: "15–30 分钟", ko: "15–30분", de: "15–30 Min.", fr: "15–30 min", ja: "15〜30分", tr: "15–30 dk", ar: "15–30 دقيقة" }),
  с("20–35 минут", { en: "20–35 min", uz: "20–35 daqiqa", zh: "20–35 分钟", ko: "20–35분", de: "20–35 Min.", fr: "20–35 min", ja: "20〜35分", tr: "20–35 dk", ar: "20–35 دقيقة" }),
  с("20–40 минут", { en: "20–40 min", uz: "20–40 daqiqa", zh: "20–40 分钟", ko: "20–40분", de: "20–40 Min.", fr: "20–40 min", ja: "20〜40分", tr: "20–40 dk", ar: "20–40 دقيقة" }),
  с("20–45 минут", { en: "20–45 min", uz: "20–45 daqiqa", zh: "20–45 分钟", ko: "20–45분", de: "20–45 Min.", fr: "20–45 min", ja: "20〜45分", tr: "20–45 dk", ar: "20–45 دقيقة" }),
  с("30–45 минут", { en: "30–45 min", uz: "30–45 daqiqa", zh: "30–45 分钟", ko: "30–45분", de: "30–45 Min.", fr: "30–45 min", ja: "30〜45分", tr: "30–45 dk", ar: "30–45 دقيقة" }),
  с("30–50 минут", { en: "30–50 min", uz: "30–50 daqiqa", zh: "30–50 分钟", ko: "30–50분", de: "30–50 Min.", fr: "30–50 min", ja: "30〜50分", tr: "30–50 dk", ar: "30–50 دقيقة" }),
  с("30–60 минут", { en: "30–60 min", uz: "30–60 daqiqa", zh: "30–60 分钟", ko: "30–60분", de: "30–60 Min.", fr: "30–60 min", ja: "30〜60分", tr: "30–60 dk", ar: "30–60 دقيقة" }),
  с("40–60 минут", { en: "40–60 min", uz: "40–60 daqiqa", zh: "40–60 分钟", ko: "40–60분", de: "40–60 Min.", fr: "40–60 min", ja: "40〜60分", tr: "40–60 dk", ar: "40–60 دقيقة" }),
  с("45–60 минут", { en: "45–60 min", uz: "45–60 daqiqa", zh: "45–60 分钟", ko: "45–60분", de: "45–60 Min.", fr: "45–60 min", ja: "45〜60分", tr: "45–60 dk", ar: "45–60 دقيقة" }),
  с("45–75 минут", { en: "45–75 min", uz: "45–75 daqiqa", zh: "45–75 分钟", ko: "45–75분", de: "45–75 Min.", fr: "45–75 min", ja: "45〜75分", tr: "45–75 dk", ar: "45–75 دقيقة" }),
  с("45–90 минут", { en: "45–90 min", uz: "45–90 daqiqa", zh: "45–90 分钟", ko: "45–90분", de: "45–90 Min.", fr: "45–90 min", ja: "45〜90分", tr: "45–90 dk", ar: "45–90 دقيقة" }),
  с("1–1,5 часа", { en: "1–1.5 hours", uz: "1–1,5 soat", zh: "1–1.5 小时", ko: "1–1.5시간", de: "1–1,5 Std.", fr: "1 h–1 h 30", ja: "1〜1.5時間", tr: "1–1,5 saat", ar: "1–1.5 ساعة" }),
  с("1–2 часа", { en: "1–2 hours", uz: "1–2 soat", zh: "1–2 小时", ko: "1–2시간", de: "1–2 Std.", fr: "1–2 h", ja: "1〜2時間", tr: "1–2 saat", ar: "1–2 ساعة" }),
  с("1,5–3 часа", { en: "1.5–3 hours", uz: "1,5–3 soat", zh: "1.5–3 小时", ko: "1.5–3시간", de: "1,5–3 Std.", fr: "1 h 30–3 h", ja: "1.5〜3時間", tr: "1,5–3 saat", ar: "1.5–3 ساعات" }),
  с("2–4 часа", { en: "2–4 hours", uz: "2–4 soat", zh: "2–4 小时", ko: "2–4시간", de: "2–4 Std.", fr: "2–4 h", ja: "2〜4時間", tr: "2–4 saat", ar: "2–4 ساعات" }),
  с("Полдня", { en: "Half a day", uz: "Yarim kun", zh: "半天", ko: "반나절", de: "Halber Tag", fr: "Une demi-journée", ja: "半日", tr: "Yarım gün", ar: "نصف يوم" }),

  // ── Названия ──────────────────────────────────────────────────────
  с("Музей Афрасиаба", { en: "Afrasiyab Museum", uz: "Afrosiyob muzeyi", zh: "阿夫拉西阿卜博物馆", ko: "아프라시압 박물관", de: "Afrasiab-Museum", fr: "Musée d'Afrasiab", ja: "アフラシアブ博物館", tr: "Afrasiyab Müzesi", ar: "متحف أفراسياب" }),
  с("Бумажная мастерская «Мерос»", { en: "Meros Paper Workshop", uz: "«Meros» qogʻoz ustaxonasi", zh: "Meros 造纸作坊", ko: "메로스 종이 공방", de: "Papierwerkstatt Meros", fr: "Atelier de papier Meros", ja: "メロス紙工房", tr: "Meros Kâğıt Atölyesi", ar: "ورشة ميروس للورق" }),
  с("Городище Афрасиаб", { en: "Afrasiyab Ancient Site", uz: "Afrosiyob qadimiy shahar xarobasi", zh: "阿夫拉西阿卜古城遗址", ko: "아프라시압 고대 유적", de: "Ausgrabungsstätte Afrasiab", fr: "Site antique d'Afrasiab", ja: "アフラシアブ遺跡", tr: "Afrasiyab Antik Kenti", ar: "موقع أفراسياب الأثري" }),
  с("Ансамбль Ходжа-Ахрар", { en: "Khoja Ahrar Ensemble", uz: "Xoʻja Ahror ansambli", zh: "霍贾·阿赫拉尔建筑群", ko: "호자 아흐라르 앙상블", de: "Ensemble Chodscha Ahrar", fr: "Ensemble de Khodja Ahrar", ja: "ホージャ・アフラール建築群", tr: "Hoca Ahrar Külliyesi", ar: "مجمع خوجة أحرار" }),
  с("Мавзолей Ак-Сарай", { en: "Ak-Saray Mausoleum", uz: "Oqsaroy maqbarasi", zh: "阿克萨赖陵墓", ko: "악사라이 영묘", de: "Mausoleum Ak-Saray", fr: "Mausolée d'Ak-Saray", ja: "アク・サライ廟", tr: "Akseray Türbesi", ar: "ضريح آق سراي" }),
  с("Мавзолей Ишратхона", { en: "Ishratkhona Mausoleum", uz: "Ishratxona maqbarasi", zh: "伊什拉特霍纳陵墓", ko: "이쉬라트호나 영묘", de: "Mausoleum Ischratchona", fr: "Mausolée d'Ichratkhona", ja: "イシュラトホナ廟", tr: "İşrethane Türbesi", ar: "ضريح عشرت خانه" }),
  с("Мавзолей Рухабад", { en: "Rukhabad Mausoleum", uz: "Ruhobod maqbarasi", zh: "鲁哈巴德陵墓", ko: "루하바드 영묘", de: "Mausoleum Ruchabad", fr: "Mausolée de Roukhabad", ja: "ルハバード廟", tr: "Ruhabad Türbesi", ar: "ضريح روح آباد" }),
  с("Мавзолей Ходжа Дониёр", { en: "Khoja Doniyor Mausoleum (Tomb of Daniel)", uz: "Xoʻja Doniyor maqbarasi", zh: "霍贾·多尼约尔陵墓（但以理墓）", ko: "호자 도니요르 영묘 (다니엘의 묘)", de: "Mausoleum Chodscha Doniyor (Grab Daniels)", fr: "Mausolée de Khodja Doniyor (tombeau de Daniel)", ja: "ホージャ・ドニヨル廟（ダニエルの墓）", tr: "Hoca Doniyor Türbesi (Danyal'ın Mezarı)", ar: "ضريح خوجة دانيار (قبر النبي دانيال)" }),
  с("Мечеть Хазрет-Хызр", { en: "Hazrat Khizr Mosque", uz: "Hazrati Xizr masjidi", zh: "哈兹拉特·希兹尔清真寺", ko: "하즈라트 히즈르 모스크", de: "Hazrat-Chisr-Moschee", fr: "Mosquée Hazrat Khizr", ja: "ハズラト・ヒズル・モスク", tr: "Hazreti Hızır Camii", ar: "مسجد حضرة الخضر" }),
  с("Мавзолей Ислама Каримова", { en: "Islam Karimov Mausoleum", uz: "Islom Karimov maqbarasi", zh: "伊斯兰·卡里莫夫陵墓", ko: "이슬람 카리모프 영묘", de: "Mausoleum von Islam Karimow", fr: "Mausolée d'Islam Karimov", ja: "イスラム・カリモフ廟", tr: "İslam Kerimov Anıt Mezarı", ar: "ضريح إسلام كريموف" }),
  с("Музей истории культуры Узбекистана", { en: "Museum of the Cultural History of Uzbekistan", uz: "Oʻzbekiston madaniyati tarixi muzeyi", zh: "乌兹别克斯坦文化史博物馆", ko: "우즈베키스탄 문화사 박물관", de: "Museum für Kulturgeschichte Usbekistans", fr: "Musée de l'histoire culturelle de l'Ouzbékistan", ja: "ウズベキスタン文化史博物館", tr: "Özbekistan Kültür Tarihi Müzesi", ar: "متحف تاريخ الثقافة في أوزبكستان" }),
  с("Краеведческий музей Самаркандской области", { en: "Samarkand Regional Museum of Local History", uz: "Samarqand viloyat oʻlkashunoslik muzeyi", zh: "撒马尔罕州地方志博物馆", ko: "사마르칸트 주 향토 박물관", de: "Heimatmuseum des Gebiets Samarkand", fr: "Musée régional de Samarcande", ja: "サマルカンド州郷土博物館", tr: "Semerkant Bölge Müzesi", ar: "متحف التاريخ المحلي لولاية سمرقند" }),
  с("Дом-музей Махмудходжи Бехбуди", { en: "Mahmudkhoja Behbudi House Museum", uz: "Mahmudxoʻja Behbudiy uy-muzeyi", zh: "马赫穆德霍贾·贝赫布迪故居博物馆", ko: "마흐무드호자 베흐부디 생가 박물관", de: "Hausmuseum Mahmudchodscha Behbudi", fr: "Maison-musée de Mahmoudkhodja Behbudi", ja: "マフムードホジャ・ベフブーディー記念館", tr: "Mahmudhoca Behbudi Ev Müzesi", ar: "متحف منزل محمود خوجة بهبودي" }),
  с("Дом-музей Садриддина Айни", { en: "Sadriddin Ayni House Museum", uz: "Sadriddin Ayniy uy-muzeyi", zh: "萨德里丁·艾尼故居博物馆", ko: "사드리딘 아이니 생가 박물관", de: "Hausmuseum Sadriddin Aini", fr: "Maison-musée de Sadriddine Aïni", ja: "サドリッディン・アイニー記念館", tr: "Sadreddin Ayni Ev Müzesi", ar: "متحف منزل صدر الدين عيني" }),
  с("Дом-музей Ходжи Абдулазиза Абдурасулова", { en: "Hoji Abdulaziz Abdurasulov House Museum", uz: "Hoji Abdulaziz Abdurasulov uy-muzeyi", zh: "霍吉·阿卜杜拉齐兹·阿卜杜拉苏洛夫故居博物馆", ko: "호지 압둘아지즈 압두라술로프 생가 박물관", de: "Hausmuseum Hodschi Abdulasis Abdurasulow", fr: "Maison-musée de Hodji Abdoulaziz Abdourassoulov", ja: "ホージ・アブドゥラジズ・アブドゥラスロフ記念館", tr: "Hoca Abdülaziz Abdurasulov Ev Müzesi", ar: "متحف منزل حاجي عبد العزيز عبد الرسولوف" }),
  с("Комплекс Ходжа Абди Дарун", { en: "Khoja Abdi Darun Complex", uz: "Xoʻja Abdi Darun majmuasi", zh: "霍贾·阿卜迪·达伦建筑群", ko: "호자 압디 다룬 단지", de: "Komplex Chodscha Abdi Darun", fr: "Complexe de Khodja Abdi Daroun", ja: "ホージャ・アブディ・ダルン建築群", tr: "Hoca Abdi Darun Külliyesi", ar: "مجمع خوجة عبدي دارون" }),
  с("Мавзолей имама аль-Матуриди", { en: "Imam al-Maturidi Mausoleum", uz: "Imom al-Moturidiy maqbarasi", zh: "伊玛目马图里迪陵墓", ko: "이맘 알마투리디 영묘", de: "Mausoleum des Imam al-Maturidi", fr: "Mausolée de l'imam al-Maturidi", ja: "イマーム・マートゥリーディー廟", tr: "İmam Mâtürîdî Türbesi", ar: "ضريح الإمام الماتريدي" }),
  с("Памятник Амиру Темуру", { en: "Amir Timur Monument", uz: "Amir Temur haykali", zh: "帖木儿纪念像", ko: "아미르 티무르 기념상", de: "Amir-Timur-Denkmal", fr: "Monument à Amir Timour", ja: "アミール・ティムール像", tr: "Emir Timur Anıtı", ar: "نصب الأمير تيمور" }),
  с("Университетский бульвар", { en: "University Boulevard", uz: "Universitet xiyoboni", zh: "大学林荫大道", ko: "대학교 대로", de: "Universitätsboulevard", fr: "Boulevard de l'Université", ja: "大学通り", tr: "Üniversite Bulvarı", ar: "شارع الجامعة" }),
  с("Галерея «Чорсу»", { en: "Chorsu Gallery", uz: "«Chorsu» galereyasi", zh: "乔尔苏画廊", ko: "초르수 갤러리", de: "Galerie Chorsu", fr: "Galerie Tchorsou", ja: "チョルスー・ギャラリー", tr: "Çorsu Galerisi", ar: "معرض تشورسو" }),
  с("Фабрика шёлковых ковров «Худжум»", { en: "Khujum Silk Carpet Factory", uz: "«Hujum» ipak gilam fabrikasi", zh: "胡朱姆丝绸地毯工坊", ko: "후줌 실크 카펫 공방", de: "Seidenteppich-Manufaktur Chudschum", fr: "Fabrique de tapis de soie Khoudjoum", ja: "フジュム絹絨毯工房", tr: "Hucum İpek Halı Atölyesi", ar: "مصنع خوجوم لسجاد الحرير" }),
  с("Музей виноделия имени Ховренко", { en: "Khovrenko Winery Museum", uz: "Xovrenko nomidagi vinochilik muzeyi", zh: "霍夫连科葡萄酒博物馆", ko: "호브렌코 와인 박물관", de: "Weinbaumuseum Chowrenko", fr: "Musée du vin Khovrenko", ja: "ホブレンコ・ワイン博物館", tr: "Hovrenko Şarap Müzesi", ar: "متحف خوفرينكو للنبيذ" }),
  с("Silk Road Samarkand и «Вечный город»", { en: "Silk Road Samarkand & Eternal City", uz: "Silk Road Samarkand va «Boqiy shahar»", zh: "丝绸之路撒马尔罕与“永恒之城”", ko: "실크로드 사마르칸트 & 영원의 도시", de: "Silk Road Samarkand und „Ewige Stadt“", fr: "Silk Road Samarkand et la « Ville éternelle »", ja: "シルクロード・サマルカンドと「永遠の街」", tr: "Silk Road Samarkand ve “Ebedî Şehir”", ar: "سيلك رود سمرقند و«المدينة الخالدة»" }),
  с("Комплекс имама аль-Бухари", { en: "Imam al-Bukhari Complex", uz: "Imom al-Buxoriy majmuasi", zh: "伊玛目布哈里纪念建筑群", ko: "이맘 알부하리 기념 단지", de: "Gedenkkomplex Imam al-Buchari", fr: "Complexe de l'imam al-Boukhari", ja: "イマーム・ブハーリー廟群", tr: "İmam Buhari Külliyesi", ar: "مجمع الإمام البخاري" }),
  с("Комплекс Махдуми Аъзам в Дахбеде", { en: "Makhdumi Azam Complex in Dahbed", uz: "Dahbeddagi Mahdumi Aʼzam majmuasi", zh: "达赫别德的马赫杜米·阿扎姆建筑群", ko: "다흐베드의 마흐두미 아잠 단지", de: "Komplex Machdumi Asam in Dahbed", fr: "Complexe de Makhdoumi Azam à Dakhbed", ja: "ダフベドのマフドゥーミ・アーザム廟群", tr: "Dahbed'de Mahdum-i Azam Külliyesi", ar: "مجمع مخدومي أعظم في دهبيد" }),
  с("Пещера Хазрати Дауд", { en: "Hazrati Daud Cave", uz: "Hazrati Dovud gʻori", zh: "达伍德圣人洞", ko: "하즈라티 다우드 동굴", de: "Höhle Hazrati Daud", fr: "Grotte de Hazrati Daoud", ja: "ハズラティ・ダウド洞窟", tr: "Hazreti Davud Mağarası", ar: "كهف حضرة داود" }),
  с("Сад Чор-Чинор в Ургуте", { en: "Chor-Chinor Garden, Urgut", uz: "Urgutdagi Chor-Chinor bogʻi", zh: "乌尔古特的乔尔奇诺尔花园", ko: "우르구트 초르치노르 정원", de: "Garten Tschor-Tschinor in Urgut", fr: "Jardin de Tchor-Tchinor à Ourgout", ja: "ウルグトのチョル・チノル庭園", tr: "Urgut'ta Çor-Çinor Bahçesi", ar: "حديقة تشور تشينور في أورغوت" }),
  с("Городище Дабусия", { en: "Dabusiya Ancient Site", uz: "Dabusiya qadimiy shahri", zh: "达布西亚古城遗址", ko: "다부시야 고대 유적", de: "Ausgrabungsstätte Dabusija", fr: "Site antique de Daboussia", ja: "ダブーシヤ遺跡", tr: "Dabusiye Antik Kenti", ar: "موقع دبوسية الأثري" }),
  с("Старый мост в Раватходже", { en: "Old Bridge at Ravatkhodja", uz: "Ravotxoʻjadagi eski koʻprik", zh: "拉瓦特霍贾古桥", ko: "라바트호자 옛 다리", de: "Alte Brücke in Rawatchodscha", fr: "Vieux pont de Ravatkhodja", ja: "ラヴァトホジャの古い橋", tr: "Ravathoca Eski Köprüsü", ar: "الجسر القديم في رباط خوجة" }),
];
