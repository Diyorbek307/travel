/**
 * Длинные тексты настроек: FAQ, условия, политика.
 *
 * Их не гоняем через общий словарь t(): это абзацы, а не подписи, и
 * держать по десять переводов каждого — лишний вес. Здесь три языка —
 * русский, английский, узбекский — с откатом на русский для остальных.
 * Тексты честные и общие: без обещаний, которых приложение не держит.
 */

export type Локаль = string;

type Блок = { q: string; a: string };
type Три = { ru: string; en: string; uz: string };
type ТриFAQ = { ru: Блок[]; en: Блок[]; uz: Блок[] };

function выбрать<T>(м: { ru: T; en: T; uz: T }, lang: Локаль): T {
  if (lang === "en") return м.en;
  if (lang === "uz") return м.uz;
  return м.ru;
}

const FAQ: ТриFAQ = {
  ru: [
    { q: "Нужен ли интернет?", a: "Для карт, погоды и поиска — да. Скачанные аудиогиды и офлайн-карты работают без сети." },
    { q: "Как включить аудиогид?", a: "Откройте место и нажмите «Слушать», либо наведите камеру на QR-табличку у объекта." },
    { q: "Как построить маршрут?", a: "На карточке места нажмите «Маршрут» — откроется навигатор с проложенным путём." },
    { q: "Что даёт Premium?", a: "Убирает рекламу и открывает все аудиогиды и офлайн-карты без ограничений." },
    { q: "Как сменить язык или валюту?", a: "Профиль → Настройки: язык вверху, валюта — в разделе «Внешний вид»." },
  ],
  en: [
    { q: "Do I need the internet?", a: "For maps, weather and search — yes. Downloaded audio guides and offline maps work without a connection." },
    { q: "How do I start an audio guide?", a: "Open a place and tap “Listen”, or point your camera at the QR plate next to the site." },
    { q: "How do I build a route?", a: "On a place card tap “Route” — your navigator opens with the path drawn." },
    { q: "What does Premium give me?", a: "It removes ads and unlocks all audio guides and offline maps." },
    { q: "How do I change language or currency?", a: "Profile → Settings: language at the top, currency under “Appearance”." },
  ],
  uz: [
    { q: "Internet kerakmi?", a: "Xarita, ob-havo va qidiruv uchun — ha. Yuklab olingan audiogidlar va offline xaritalar tarmoqsiz ishlaydi." },
    { q: "Audiogidni qanday yoqaman?", a: "Joyni oching va «Tinglash»ni bosing yoki kamerani obyekt yonidagi QR-taxtaga qarating." },
    { q: "Marshrutni qanday tuzaman?", a: "Joy kartochkasida «Marshrut»ni bosing — navigator yoʻl bilan ochiladi." },
    { q: "Premium nima beradi?", a: "Reklamani olib tashlaydi va barcha audiogid hamda offline xaritalarni ochadi." },
    { q: "Til yoki valyutani qanday almashtiraman?", a: "Profil → Sozlamalar: til yuqorida, valyuta «Tashqi koʻrinish»da." },
  ],
};

const TERMS: Три = {
  ru:
    "Условия использования UzRoam\n\n" +
    "UzRoam — справочно-туристическое приложение об Узбекистане: места, маршруты, аудиогиды, карты и погода.\n\n" +
    "1. Информация в приложении носит справочный характер. Мы стремимся к точности, но не гарантируем, что цены, часы работы и расписания всегда актуальны — уточняйте их на месте.\n\n" +
    "2. Бронирования и билеты оформляются у сторонних поставщиков (отели, перевозчики, такси). UzRoam лишь передаёт вас к ним и не является стороной сделки.\n\n" +
    "3. Партнёрские предложения помечены словом «Партнёр». Ответственность за товары и услуги несёт рекламодатель.\n\n" +
    "4. Не используйте приложение для незаконных целей и не пытайтесь нарушить его работу.\n\n" +
    "Связь: раздел «Написать в поддержку».",
  en:
    "UzRoam Terms of Use\n\n" +
    "UzRoam is an informational travel app about Uzbekistan: places, routes, audio guides, maps and weather.\n\n" +
    "1. The information is for reference. We aim for accuracy but do not guarantee that prices, hours and schedules are always current — please verify on site.\n\n" +
    "2. Bookings and tickets are handled by third-party providers (hotels, carriers, taxi). UzRoam only forwards you to them and is not a party to the deal.\n\n" +
    "3. Partner offers are marked “Partner”. The advertiser is responsible for their goods and services.\n\n" +
    "4. Do not use the app for unlawful purposes or attempt to disrupt it.\n\n" +
    "Contact: the “Contact support” section.",
  uz:
    "UzRoam foydalanish shartlari\n\n" +
    "UzRoam — Oʻzbekiston haqidagi maʼlumot-sayohat ilovasi: joylar, marshrutlar, audiogidlar, xaritalar va ob-havo.\n\n" +
    "1. Maʼlumot maʼlumot uchun. Aniqlikka intilamiz, ammo narx, ish vaqti va jadval doim dolzarb ekanini kafolatlamaymiz — joyida aniqlang.\n\n" +
    "2. Bandlar va chiptalar uchinchi tomon yetkazib beruvchilarda (mehmonxona, tashuvchi, taksi) rasmiylashtiriladi. UzRoam faqat sizni ularga yoʻnaltiradi.\n\n" +
    "3. Hamkor takliflari «Hamkor» soʻzi bilan belgilanadi. Tovar va xizmat uchun reklama beruvchi javobgar.\n\n" +
    "4. Ilovadan noqonuniy maqsadda foydalanmang va ishini buzishga urinmang.\n\n" +
    "Aloqa: «Qoʻllab-quvvatlashga yozish» boʻlimi.",
};

const PRIVACY: Три = {
  ru:
    "Политика конфиденциальности UzRoam\n\n" +
    "Мы бережно относимся к данным и собираем только необходимое.\n\n" +
    "1. Аккаунт: имя, почта и (по желанию) страна и телефон. Пароль хранится в виде хеша — в открытом виде его нет ни у кого.\n\n" +
    "2. На устройстве: язык, валюта, тема, избранное, маршрут и посещённые города. Эти данные не покидают телефон.\n\n" +
    "3. Геолокация используется только пока открыто приложение — чтобы показать расстояние и ближайшие места. Мы не ведём историю перемещений.\n\n" +
    "4. Погоду и курсы валют получаем от внешних сервисов; им уходит только сам запрос, без ваших данных.\n\n" +
    "5. Вы можете скачать свои данные или удалить аккаунт в разделе «Аккаунт».",
  en:
    "UzRoam Privacy Policy\n\n" +
    "We treat data carefully and collect only what's needed.\n\n" +
    "1. Account: name, email and (optionally) country and phone. The password is stored as a hash — no one holds it in the clear.\n\n" +
    "2. On the device: language, currency, theme, favourites, route and visited cities. This data never leaves the phone.\n\n" +
    "3. Location is used only while the app is open — to show distance and nearby places. We keep no movement history.\n\n" +
    "4. Weather and exchange rates come from external services; only the request is sent, without your data.\n\n" +
    "5. You can download your data or delete your account in the “Account” section.",
  uz:
    "UzRoam maxfiylik siyosati\n\n" +
    "Maʼlumotlarga ehtiyotkorlik bilan qaraymiz va faqat zarurini yigʻamiz.\n\n" +
    "1. Hisob: ism, e-pochta va (ixtiyoriy) davlat hamda telefon. Parol hash koʻrinishida saqlanadi — ochiq holda hech kimda yoʻq.\n\n" +
    "2. Qurilmada: til, valyuta, mavzu, sevimlilar, marshrut va tashrif buyurilgan shaharlar. Bu maʼlumot telefondan chiqmaydi.\n\n" +
    "3. Joylashuv faqat ilova ochiq turganda ishlatiladi — masofa va yaqin joylarni koʻrsatish uchun. Harakat tarixini yuritmaymiz.\n\n" +
    "4. Ob-havo va valyuta kurslarini tashqi xizmatlardan olamiz; ularga faqat soʻrov ketadi, maʼlumotlaringizsiz.\n\n" +
    "5. «Hisob» boʻlimida maʼlumotlaringizni yuklab olishingiz yoki hisobni oʻchirishingiz mumkin.",
};

export function faqТексты(lang: Локаль): Блок[] {
  return выбрать(FAQ, lang);
}
export function условияТекст(lang: Локаль): string {
  return выбрать(TERMS, lang);
}
export function политикаТекст(lang: Локаль): string {
  return выбрать(PRIVACY, lang);
}
