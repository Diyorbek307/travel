import type { Locale } from "@/lib/i18n";

/**
 * Разговорник: фразы, которые туристу правда нужны в первый же день —
 * в такси, в чайхане, на базаре и если что-то случилось.
 *
 * Каждая фраза — по-узбекски (латиницей, как пишут сейчас) и по-русски:
 * в Ташкенте и больших городах русский понимают почти все, в кишлаках —
 * узбекский. Смысл — на языке туриста. Всё лежит в самом приложении, так
 * что разговорник работает и без интернета.
 */

type Смысл = Record<Locale, string>;

const с = (
  en: string,
  zh: string,
  ko: string,
  de: string,
  fr: string,
  ja: string,
  tr: string,
  ar: string,
): Omit<Смысл, "ru" | "uz"> => ({ en, zh, ko, de, fr, ja, tr, ar });

export interface Фраза {
  uz: string;
  ru: string;
  смысл: Omit<Смысл, "ru" | "uz">;
}

export interface РазделФраз {
  id: string;
  icon: string;
  фразы: Фраза[];
}

export const РАЗГОВОРНИК: РазделФраз[] = [
  {
    id: "basic",
    icon: "👋",
    фразы: [
      { uz: "Assalomu alaykum", ru: "Здравствуйте", смысл: с("Hello", "你好", "안녕하세요", "Guten Tag", "Bonjour", "こんにちは", "Merhaba", "السلام عليكم") },
      { uz: "Rahmat", ru: "Спасибо", смысл: с("Thank you", "谢谢", "감사합니다", "Danke", "Merci", "ありがとう", "Teşekkürler", "شكرًا") },
      { uz: "Ha", ru: "Да", смысл: с("Yes", "是", "네", "Ja", "Oui", "はい", "Evet", "نعم") },
      { uz: "Yoʻq", ru: "Нет", смысл: с("No", "不", "아니요", "Nein", "Non", "いいえ", "Hayır", "لا") },
      { uz: "Iltimos", ru: "Пожалуйста", смысл: с("Please", "请", "부탁합니다", "Bitte", "S'il vous plaît", "お願いします", "Lütfen", "من فضلك") },
      { uz: "Kechirasiz", ru: "Извините", смысл: с("Excuse me / Sorry", "对不起 / 打扰一下", "실례합니다 / 죄송합니다", "Entschuldigung", "Excusez-moi", "すみません", "Affedersiniz", "عفوًا / آسف") },
      { uz: "Xayr", ru: "До свидания", смысл: с("Goodbye", "再见", "안녕히 계세요", "Auf Wiedersehen", "Au revoir", "さようなら", "Hoşça kalın", "مع السلامة") },
      { uz: "Tushunmadim", ru: "Я не понимаю", смысл: с("I don't understand", "我听不懂", "이해하지 못했어요", "Ich verstehe nicht", "Je ne comprends pas", "わかりません", "Anlamadım", "لا أفهم") },
      { uz: "Inglizcha gapirasizmi?", ru: "Вы говорите по-английски?", смысл: с("Do you speak English?", "你会说英语吗？", "영어 하세요?", "Sprechen Sie Englisch?", "Parlez-vous anglais ?", "英語を話せますか？", "İngilizce biliyor musunuz?", "هل تتكلم الإنجليزية؟") },
      { uz: "Tanishganimdan xursandman", ru: "Приятно познакомиться", смысл: с("Nice to meet you", "很高兴认识你", "만나서 반가워요", "Freut mich", "Enchanté", "はじめまして", "Tanıştığıma memnun oldum", "تشرفت بمعرفتك") },
    ],
  },
  {
    id: "taxi",
    icon: "🚕",
    фразы: [
      { uz: "Meni shu manzilga olib boring", ru: "Отвезите меня по этому адресу", смысл: с("Take me to this address", "请送我到这个地址", "이 주소로 가 주세요", "Bringen Sie mich zu dieser Adresse", "Emmenez-moi à cette adresse", "この住所までお願いします", "Beni bu adrese götürün", "خذني إلى هذا العنوان") },
      { uz: "Qancha boʻladi?", ru: "Сколько будет стоить?", смысл: с("How much will it cost?", "要多少钱？", "얼마예요?", "Was kostet das?", "Combien ça coûte ?", "いくらになりますか？", "Ne kadar tutar?", "كم سيكلف؟") },
      { uz: "Shu yerda toʻxtating, iltimos", ru: "Остановите здесь, пожалуйста", смысл: с("Stop here, please", "请在这里停车", "여기서 세워 주세요", "Bitte hier anhalten", "Arrêtez-vous ici, s'il vous plaît", "ここで止めてください", "Burada durun lütfen", "توقف هنا من فضلك") },
      { uz: "Vokzal qayerda?", ru: "Где вокзал?", смысл: с("Where is the train station?", "火车站在哪里？", "기차역이 어디예요?", "Wo ist der Bahnhof?", "Où est la gare ?", "駅はどこですか？", "Gar nerede?", "أين محطة القطار؟") },
      { uz: "Aeroportga", ru: "В аэропорт", смысл: с("To the airport", "去机场", "공항으로요", "Zum Flughafen", "À l'aéroport", "空港まで", "Havalimanına", "إلى المطار") },
    ],
  },
  {
    id: "food",
    icon: "🍽️",
    фразы: [
      { uz: "Menyu bering, iltimos", ru: "Меню, пожалуйста", смысл: с("The menu, please", "请给我菜单", "메뉴판 주세요", "Die Speisekarte, bitte", "La carte, s'il vous plaît", "メニューをください", "Menü lütfen", "القائمة من فضلك") },
      { uz: "Hisobni bering, iltimos", ru: "Счёт, пожалуйста", смысл: с("The bill, please", "请结账", "계산서 주세요", "Die Rechnung, bitte", "L'addition, s'il vous plaît", "お会計お願いします", "Hesap lütfen", "الحساب من فضلك") },
      { uz: "Goʻshtsiz", ru: "Без мяса", смысл: с("Without meat", "不要肉", "고기 없이", "Ohne Fleisch", "Sans viande", "肉なしで", "Etsiz", "بدون لحم") },
      { uz: "Choy bering, iltimos", ru: "Чай, пожалуйста", смысл: с("Tea, please", "请来杯茶", "차 주세요", "Tee, bitte", "Du thé, s'il vous plaît", "お茶をください", "Çay lütfen", "شاي من فضلك") },
      { uz: "Suv", ru: "Вода", смысл: с("Water", "水", "물", "Wasser", "Eau", "水", "Su", "ماء") },
      { uz: "Juda mazali!", ru: "Очень вкусно!", смысл: с("Very tasty!", "非常好吃！", "정말 맛있어요!", "Sehr lecker!", "Très bon !", "とてもおいしい！", "Çok lezzetli!", "لذيذ جدًا!") },
    ],
  },
  {
    id: "shop",
    icon: "🛍️",
    фразы: [
      { uz: "Bu qancha turadi?", ru: "Сколько это стоит?", смысл: с("How much is this?", "这个多少钱？", "이거 얼마예요?", "Wie viel kostet das?", "Combien ça coûte ?", "これはいくらですか？", "Bu ne kadar?", "بكم هذا؟") },
      { uz: "Juda qimmat", ru: "Очень дорого", смысл: с("Too expensive", "太贵了", "너무 비싸요", "Zu teuer", "Trop cher", "高すぎます", "Çok pahalı", "غالٍ جدًا") },
      { uz: "Chegirma qilib bera olasizmi?", ru: "Можно скидку?", смысл: с("Can you give me a discount?", "能便宜点吗？", "깎아 주실 수 있어요?", "Geht es etwas günstiger?", "Vous pouvez faire une remise ?", "まけてもらえますか？", "İndirim yapar mısınız?", "هل يمكن تخفيض السعر؟") },
      { uz: "Karta bilan toʻlasam boʻladimi?", ru: "Можно оплатить картой?", смысл: с("Can I pay by card?", "可以刷卡吗？", "카드로 계산해도 돼요?", "Kann ich mit Karte zahlen?", "Je peux payer par carte ?", "カードで払えますか？", "Kartla ödeyebilir miyim?", "هل يمكنني الدفع بالبطاقة؟") },
      { uz: "Suratga olsam boʻladimi?", ru: "Можно сфотографировать?", смысл: с("May I take a photo?", "可以拍照吗？", "사진 찍어도 돼요?", "Darf ich fotografieren?", "Je peux prendre une photo ?", "写真を撮ってもいいですか？", "Fotoğraf çekebilir miyim?", "هل يمكنني التصوير؟") },
    ],
  },
  {
    id: "help",
    icon: "🆘",
    фразы: [
      { uz: "Yordam bering!", ru: "Помогите!", смысл: с("Help!", "救命！", "도와주세요!", "Hilfe!", "Au secours !", "助けて！", "İmdat!", "النجدة!") },
      { uz: "Politsiyani chaqiring", ru: "Вызовите полицию", смысл: с("Call the police", "请报警", "경찰을 불러 주세요", "Rufen Sie die Polizei", "Appelez la police", "警察を呼んでください", "Polisi arayın", "اتصل بالشرطة") },
      { uz: "Menga shifokor kerak", ru: "Мне нужен врач", смысл: с("I need a doctor", "我需要医生", "의사가 필요해요", "Ich brauche einen Arzt", "J'ai besoin d'un médecin", "医者が必要です", "Doktora ihtiyacım var", "أحتاج إلى طبيب") },
      { uz: "Men adashib qoldim", ru: "Я заблудился", смысл: с("I'm lost", "我迷路了", "길을 잃었어요", "Ich habe mich verlaufen", "Je suis perdu", "道に迷いました", "Kayboldum", "لقد ضللت الطريق") },
      { uz: "Hojatxona qayerda?", ru: "Где туалет?", смысл: с("Where is the toilet?", "洗手间在哪里？", "화장실이 어디예요?", "Wo ist die Toilette?", "Où sont les toilettes ?", "トイレはどこですか？", "Tuvalet nerede?", "أين الحمّام؟") },
      { uz: "Dorixona qayerda?", ru: "Где аптека?", смысл: с("Where is a pharmacy?", "药店在哪里？", "약국이 어디예요?", "Wo ist eine Apotheke?", "Où est la pharmacie ?", "薬局はどこですか？", "Eczane nerede?", "أين الصيدلية؟") },
    ],
  },
];
