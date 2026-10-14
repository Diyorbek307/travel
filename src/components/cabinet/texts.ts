/**
 * Тексты кабинета партнёра. Водители и гиды — местные, поэтому кабинет
 * на трёх языках: русском, узбекском и английском (а не на десяти, как
 * приложение туриста).
 */

export type ЯзыкКабинета = "ru" | "uz" | "en";

const т = (ru: string, uz: string, en: string) => ({ ru, uz, en });

export const ТЕКСТЫ = {
  title: т("Кабинет партнёра", "Hamkor kabineti", "Partner account"),
  brand: т(
    "HelloUZ для водителей и гидов",
    "HelloUZ haydovchi va gidlar uchun",
    "HelloUZ for drivers and guides",
  ),
  loading: т("Загружаем…", "Yuklanmoqda…", "Loading…"),
  back_app: т("В приложение", "Ilovaga", "To the app"),

  // Вход
  guest_title: т(
    "Получайте заявки от туристов",
    "Sayyohlardan buyurtmalar oling",
    "Get requests from tourists",
  ),
  guest_text: т(
    "Разместите анкету водителя или гида в HelloUZ: туристы из разных стран увидят вашу машину, туры и цены и напишут вам напрямую.",
    "HelloUZ’da haydovchi yoki gid anketangizni joylang: turli mamlakatlardan sayyohlar mashinangiz, turlaringiz va narxlaringizni ko‘rib, sizga to‘g‘ridan-to‘g‘ri yozadi.",
    "List your driver or guide profile on HelloUZ: tourists from many countries will see your car, tours and prices and contact you directly.",
  ),
  guest_b1: т(
    "Заявки приходят сюда и на ваш телефон",
    "Buyurtmalar shu yerga va telefoningizga keladi",
    "Requests arrive here and to your phone",
  ),
  guest_b2: т(
    "Без комиссии с поездок — только подписка",
    "Safarlardan komissiya yo‘q — faqat obuna",
    "No commission on trips — just a subscription",
  ),
  guest_b3: т("Первый месяц — бесплатно", "Birinchi oy — bepul", "First month is free"),
  guest_b4: т(
    "Отметка «Проверен» после проверки документов",
    "Hujjatlar tekshirilgach «Tekshirilgan» belgisi",
    "“Verified” badge after document check",
  ),
  login: т("Войти", "Kirish", "Sign in"),
  register: т("Создать аккаунт", "Akkaunt yaratish", "Create account"),
  login_hint: т(
    "Вход тот же, что в приложении: почта, Google или Apple.",
    "Kirish ilovadagi bilan bir xil: pochta, Google yoki Apple.",
    "Same sign-in as the app: email, Google or Apple.",
  ),

  // Выбор роли
  who_title: т("Кем вы работаете?", "Kim bo‘lib ishlaysiz?", "What do you do?"),
  who_driver: т("Я водитель", "Men haydovchiman", "I'm a driver"),
  who_driver_sub: т(
    "Машина с водителем на день, трансферы, поездки по стране",
    "Kunlik haydovchili mashina, transferlar, mamlakat bo‘ylab safarlar",
    "Car with driver for the day, transfers, trips around the country",
  ),
  who_guide: т("Я гид", "Men gidman", "I'm a guide"),
  who_guide_sub: т(
    "Экскурсии и авторские туры на 1–14 дней",
    "Ekskursiyalar va 1–14 kunlik mualliflik turlari",
    "Excursions and your own tours of 1–14 days",
  ),
  add_second: т("Добавить вторую анкету", "Ikkinchi anketa qo‘shish", "Add a second profile"),

  // Анкета
  form_driver: т("Анкета водителя", "Haydovchi anketasi", "Driver profile"),
  form_guide: т("Анкета гида", "Gid anketasi", "Guide profile"),
  sec_person: т("О вас", "Siz haqingizda", "About you"),
  sec_contacts: т("Связь", "Aloqa", "Contacts"),
  sec_work: т("Работа и цены", "Ish va narxlar", "Work and prices"),
  sec_car: т("Машина", "Mashina", "Car"),
  sec_photos: т("Фотографии", "Suratlar", "Photos"),
  photo_profile: т("Ваше фото", "Suratingiz", "Your photo"),
  photo_add: т("Добавить фото", "Surat qo‘shish", "Add photo"),
  photos_hint_driver: т(
    "Машина снаружи и салон, при дневном свете. Первое фото — обложка карточки.",
    "Mashina tashqaridan va salon, kunduzgi yorug‘likda. Birinchi surat — kartochka muqovasi.",
    "Car outside and the interior, in daylight. The first photo is the card cover.",
  ),
  photos_hint_guide: т(
    "Вы на экскурсии, места, которые показываете. Первое фото — обложка.",
    "Ekskursiyadagi siz, ko‘rsatadigan joylaringiz. Birinchi surat — muqova.",
    "You on a tour, places you show. The first photo is the cover.",
  ),
  name: т("Имя и фамилия", "Ism va familiya", "Full name"),
  phone: т("Телефон", "Telefon", "Phone"),
  telegram: т("Telegram (необязательно)", "Telegram (ixtiyoriy)", "Telegram (optional)"),
  whatsapp: т("WhatsApp (необязательно)", "WhatsApp (ixtiyoriy)", "WhatsApp (optional)"),
  city: т("Основной город", "Asosiy shahar", "Main city"),
  cities: т("Где ещё работаете", "Yana qayerda ishlaysiz", "Other cities you cover"),
  cities_ph: т("Бухара, Хива…", "Buxoro, Xiva…", "Bukhara, Khiva…"),
  languages: т("Языки, на которых говорите", "Qaysi tillarda gapirasiz", "Languages you speak"),
  bio: т("О себе", "O‘zingiz haqingizda", "About you"),
  bio_ph_driver: т(
    "Сколько лет за рулём, где возите туристов, чем вы удобны: детское кресло, помощь с багажом…",
    "Necha yil rulda, sayyohlarni qayerga olib borasiz, nimasi qulay: bolalar o‘rindig‘i, yuk bilan yordam…",
    "Years of driving, where you take tourists, what makes you convenient: child seat, help with luggage…",
  ),
  bio_ph_guide: т(
    "Образование, опыт, о чём любите рассказывать, чем ваши экскурсии отличаются.",
    "Ma’lumotingiz, tajribangiz, nima haqida gapirishni yaxshi ko‘rasiz, ekskursiyalaringiz nimasi bilan farq qiladi.",
    "Education, experience, what you love to talk about, what makes your tours different.",
  ),
  experience: т("Опыт, лет", "Tajriba, yil", "Experience, years"),
  price_day: т("Цена за день, $", "Kunlik narx, $", "Price per day, $"),
  price_hour: т(
    "Цена за час, $ (необязательно)",
    "Soatlik narx, $ (ixtiyoriy)",
    "Price per hour, $ (optional)",
  ),
  hours_day: т("Часов в дне", "Kunda soat", "Hours per day"),
  includes: т("Что входит в цену", "Narxga nima kiradi", "What's included"),
  includes_ph: т("Своё — и Enter", "O‘zingiznikini yozing va Enter", "Type your own and press Enter"),
  car_make: т("Марка", "Marka", "Make"),
  car_model: т("Модель", "Model", "Model"),
  car_year: т("Год", "Yil", "Year"),
  car_color: т("Цвет", "Rang", "Color"),
  car_seats: т("Мест для пассажиров", "Yo‘lovchi o‘rinlari", "Passenger seats"),
  car_class: т("Класс", "Klass", "Class"),
  car_ac: т("Кондиционер", "Konditsioner", "Air conditioning"),
  car_plate: т(
    "Госномер (видит только менеджер)",
    "Davlat raqami (faqat menejer ko‘radi)",
    "Plate number (only the manager sees it)",
  ),
  specialties: т("Темы экскурсий", "Ekskursiya mavzulari", "Tour topics"),
  specialties_ph: т(
    "Архитектура, гастрономия, горы…",
    "Me’morchilik, gastronomiya, tog‘lar…",
    "Architecture, food, mountains…",
  ),
  licensed: т("Есть лицензия гида", "Gid litsenziyasi bor", "I have a guide licence"),
  save: т("Сохранить", "Saqlash", "Save"),
  send_review: т("Отправить на проверку", "Tekshiruvga yuborish", "Send for review"),
  saved: т("Сохранено", "Saqlandi", "Saved"),
  cancel: т("Отмена", "Bekor qilish", "Cancel"),

  // Ошибки анкеты
  e_name_required: т("Укажите имя", "Ismni kiriting", "Enter your name"),
  e_phone_invalid: т(
    "Проверьте телефон: +998 и 9 цифр",
    "Telefonni tekshiring: +998 va 9 raqam",
    "Check the phone: +998 and 9 digits",
  ),
  e_city_required: т("Укажите город", "Shaharni kiriting", "Enter your city"),
  e_languages_required: т(
    "Отметьте хотя бы один язык",
    "Kamida bitta tilni belgilang",
    "Pick at least one language",
  ),
  e_price_invalid: т(
    "Проверьте цену: от 5 до 5000 $",
    "Narxni tekshiring: 5 dan 5000 $ gacha",
    "Check the price: $5 to $5000",
  ),
  e_car_required: т(
    "Укажите марку и модель машины",
    "Mashina markasi va modelini kiriting",
    "Enter the car make and model",
  ),
  e_car_invalid: т(
    "Проверьте год, класс и число мест",
    "Yil, klass va o‘rinlar sonini tekshiring",
    "Check year, class and seats",
  ),
  e_bio_long: т(
    "«О себе» — не длиннее 1500 знаков",
    "«O‘zingiz haqingizda» — 1500 belgidan oshmasin",
    "“About” must be under 1500 characters",
  ),
  e_already_exists: т(
    "Такая анкета у вас уже есть",
    "Sizda bunday anketa bor",
    "You already have this profile",
  ),
  e_generic: т(
    "Не получилось. Попробуйте ещё раз.",
    "Bo‘lmadi. Qayta urinib ko‘ring.",
    "Something went wrong. Try again.",
  ),
  e_photo: т(
    "Фото не загрузилось — выберите другое",
    "Surat yuklanmadi — boshqasini tanlang",
    "Photo failed — pick another one",
  ),

  // Вкладки
  tab_overview: т("Обзор", "Umumiy", "Overview"),
  tab_profile: т("Анкета", "Anketa", "Profile"),
  tab_tours: т("Туры", "Turlar", "Tours"),
  tab_requests: т("Заявки", "Buyurtmalar", "Requests"),
  tab_billing: т("Оплата", "To‘lov", "Billing"),

  // Статусы
  st_pending: т("На проверке", "Tekshiruvda", "Under review"),
  st_pending_text: т(
    "Менеджер проверит анкету и документы, обычно в течение суток. Может позвонить для уточнения.",
    "Menejer anketa va hujjatlarni odatda bir kun ichida tekshiradi. Aniqlashtirish uchun qo‘ng‘iroq qilishi mumkin.",
    "A manager will review your profile and documents, usually within a day, and may call you.",
  ),
  st_active: т("Анкета видна туристам", "Anketa sayyohlarga ko‘rinadi", "Your profile is live"),
  st_hidden_unpaid: т(
    "Анкета скрыта: размещение не оплачено",
    "Anketa yashirin: joylash to‘lanmagan",
    "Profile hidden: listing not paid",
  ),
  st_rejected: т(
    "Анкету вернули на доработку",
    "Anketa qayta ishlashga qaytarildi",
    "Profile returned for changes",
  ),
  st_rejected_text: т(
    "Исправьте анкету и сохраните — она снова уйдёт на проверку.",
    "Anketani tuzating va saqlang — u yana tekshiruvga ketadi.",
    "Fix the profile and save — it goes back for review.",
  ),
  st_suspended: т("Анкета приостановлена", "Anketa to‘xtatildi", "Profile suspended"),
  st_manager_note: т("Комментарий менеджера", "Menejer izohi", "Manager's note"),
  paid_until: т("Размещение оплачено до {d}", "Joylash {d} gacha to‘langan", "Listing paid until {d}"),
  days_left: т("осталось {n} дн.", "{n} kun qoldi", "{n} days left"),
  promoted_until: т("«Рекомендуем» до {d}", "«Tavsiya etamiz» {d} gacha", "“Recommended” until {d}"),
  stat_views: т("Просмотры карточки", "Kartochka ko‘rishlari", "Profile views"),
  stat_requests: т("Заявки", "Buyurtmalar", "Requests"),
  stat_tours: т("Туры", "Turlar", "Tours"),
  open_card: т("Как видят туристы", "Sayyohlar qanday ko‘radi", "See how tourists see it"),

  // Заявки
  req_empty: т(
    "Заявок пока нет. Хорошие фото и честная цена помогают.",
    "Hozircha buyurtmalar yo‘q. Yaxshi suratlar va halol narx yordam beradi.",
    "No requests yet. Good photos and a fair price help.",
  ),
  req_new: т("Новая", "Yangi", "New"),
  req_confirmed: т("Подтверждена", "Tasdiqlangan", "Confirmed"),
  req_cancelled: т("Отклонена", "Rad etilgan", "Declined"),
  req_confirm: т("Подтвердить", "Tasdiqlash", "Confirm"),
  req_decline: т("Отказать", "Rad etish", "Decline"),
  req_date: т("Дата", "Sana", "Date"),
  req_days: т("Дней", "Kun", "Days"),
  req_people: т("Человек", "Kishi", "People"),
  req_pickup: т("Встреча", "Uchrashuv", "Pick-up"),
  req_call: т("Позвонить", "Qo‘ng‘iroq", "Call"),

  // Оплата
  bill_title: т("Размещение в каталоге", "Katalogda joylashtirish", "Catalog listing"),
  bill_text: т(
    "Без комиссии с поездок: туристы платят вам напрямую, а вы — только за размещение анкеты.",
    "Safarlardan komissiya yo‘q: sayyohlar sizga to‘g‘ridan-to‘g‘ri to‘laydi, siz esa faqat anketa joylashtirish uchun to‘laysiz.",
    "No commission on trips: tourists pay you directly, you only pay for the listing.",
  ),
  plan_month1: т("1 месяц", "1 oy", "1 month"),
  plan_month3: т("3 месяца", "3 oy", "3 months"),
  plan_month6: т("6 месяцев", "6 oy", "6 months"),
  plan_save: т("выгода {p}%", "{p}% tejash", "save {p}%"),
  promo_title: т("Продвижение «Рекомендуем»", "«Tavsiya etamiz» reklamasi", "“Recommended” promotion"),
  promo_text: т(
    "Ваша карточка — первой в списке, с золотой отметкой. Доступно после проверки анкеты.",
    "Kartochkangiz ro‘yxatda birinchi, oltin belgi bilan. Anketa tekshirilgandan keyin.",
    "Your card goes first in the list with a gold badge. Available after review.",
  ),
  plan_promoWeek: т("Неделя", "Hafta", "Week"),
  plan_promoMonth: т("Месяц", "Oy", "Month"),
  pay_with: т("Оплатить через", "To‘lash", "Pay with"),
  pay_off: т(
    "Онлайн-оплата скоро заработает. Пока оплату принимает менеджер — он продлит размещение вручную.",
    "Onlayn to‘lov tez orada ishlaydi. Hozircha to‘lovni menejer qabul qiladi va joylashni qo‘lda uzaytiradi.",
    "Online payment is coming soon. For now a manager takes payment and extends your listing manually.",
  ),
  pay_wait: т(
    "Платёж обрабатывается. Срок продлится, как только платёжная система подтвердит оплату.",
    "To‘lov qayta ishlanmoqda. To‘lov tizimi tasdiqlashi bilan muddat uzaytiriladi.",
    "Payment is being processed. Your term extends as soon as the payment system confirms it.",
  ),
  trial: т(
    "После одобрения — {n} дней бесплатно",
    "Tasdiqlangandan keyin — {n} kun bepul",
    "After approval — {n} days free",
  ),
  history: т("История оплат", "To‘lovlar tarixi", "Payment history"),
  ord_waiting: т("ждёт оплаты", "to‘lov kutilmoqda", "awaiting payment"),
  ord_paid: т("оплачен", "to‘langan", "paid"),
  ord_cancelled: т("отменён", "bekor qilingan", "cancelled"),
  per_month: т("сум / мес", "so‘m / oy", "UZS / month"),
  sum: т("сум", "so‘m", "UZS"),

  // Туры
  tours_empty: т(
    "Туров пока нет. Добавьте первый: туристы чаще выбирают гида с готовой программой.",
    "Hozircha turlar yo‘q. Birinchisini qo‘shing: sayyohlar tayyor dasturli gidni ko‘proq tanlaydi.",
    "No tours yet. Add your first: tourists prefer guides with a ready program.",
  ),
  tour_add: т("Новый тур", "Yangi tur", "New tour"),
  tour_edit: т("Тур", "Tur", "Tour"),
  tour_title: т("Название тура", "Tur nomi", "Tour title"),
  tour_city: т("Город старта", "Boshlanish shahri", "Starting city"),
  tour_days: т("Дней", "Kun", "Days"),
  tour_price_pp: т("Цена с человека, $", "Kishi boshiga narx, $", "Price per person, $"),
  tour_price_group: т(
    "Цена за группу, $ (необязательно)",
    "Guruh narxi, $ (ixtiyoriy)",
    "Private group price, $ (optional)",
  ),
  tour_max: т("Группа до, человек", "Guruh, kishigacha", "Max group size"),
  tour_summary: т("Коротко о туре", "Tur haqida qisqacha", "Short description"),
  tour_program: т("Программа по дням", "Kunlar bo‘yicha dastur", "Day-by-day program"),
  tour_day: т("День {n}", "{n}-kun", "Day {n}"),
  tour_day_title: т("Что в этот день", "Bu kuni nima", "What happens this day"),
  tour_day_text: т(
    "Подробности: места, переезды, обед…",
    "Tafsilotlar: joylar, yo‘l, tushlik…",
    "Details: places, transfers, lunch…",
  ),
  tour_includes: т("Входит", "Kiradi", "Included"),
  tour_excludes: т("Не входит", "Kirmaydi", "Not included"),
  tour_meeting: т("Место встречи", "Uchrashuv joyi", "Meeting point"),
  tour_hidden: т("Скрыть тур от туристов", "Turni sayyohlardan yashirish", "Hide tour from tourists"),
  tour_delete: т("Удалить тур", "Turni o‘chirish", "Delete tour"),
  tour_delete_q: т("Удалить тур навсегда?", "Tur butunlay o‘chirilsinmi?", "Delete this tour for good?"),
  e_title_required: т("Назовите тур", "Turga nom bering", "Name the tour"),
  e_days_invalid: т("Дней — от 1 до 14", "Kunlar — 1 dan 14 gacha", "Days must be 1 to 14"),
  e_program_required: т(
    "Заполните заголовок каждого дня",
    "Har bir kun sarlavhasini to‘ldiring",
    "Fill in each day's title",
  ),
  e_group_invalid: т(
    "Группа — от 1 до 60 человек",
    "Guruh — 1 dan 60 kishigacha",
    "Group must be 1 to 60 people",
  ),
  hidden: т("скрыт", "yashirin", "hidden"),
} as const;

export type КлючКабинета = keyof typeof ТЕКСТЫ;

export function выбратьЯзык(): ЯзыкКабинета {
  try {
    const сохранён = localStorage.getItem("uzup.lang");
    if (сохранён === "ru" || сохранён === "uz" || сохранён === "en") return сохранён;
  } catch {}
  const браузер = (typeof navigator !== "undefined" ? navigator.language : "ru").slice(0, 2);
  return браузер === "uz" ? "uz" : браузер === "en" ? "en" : "ru";
}

/** Пресеты «что входит» — быстрые чипы в анкете. */
export const ВХОДИТ_ВОДИТЕЛЬ = {
  ru: ["Топливо", "Ожидание", "Встреча в аэропорту", "Вода в салоне", "Детское кресло", "Wi-Fi в машине"],
  uz: [
    "Yoqilg‘i",
    "Kutish",
    "Aeroportda kutib olish",
    "Salonda suv",
    "Bolalar o‘rindig‘i",
    "Mashinada Wi-Fi",
  ],
  en: ["Fuel", "Waiting time", "Airport pick-up", "Water in the car", "Child seat", "Wi-Fi in the car"],
};
export const ВХОДИТ_ГИД = {
  ru: ["Экскурсия по программе", "Помощь с билетами", "Фото на память", "Рекомендации кафе"],
  uz: ["Dastur bo‘yicha ekskursiya", "Chiptalar bilan yordam", "Esdalik suratlari", "Kafe tavsiyalari"],
  en: ["Guided program", "Help with tickets", "Souvenir photos", "Café recommendations"],
};
