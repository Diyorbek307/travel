/**
 * Политика конфиденциальности и удаление аккаунта — тексты.
 *
 * Пишем только то, что приложение действительно делает (сверено с кодом:
 * lib/users, community, photos, push, support-desk, routing, taxi,
 * translate-photo, esim-payments). Изменили обработку данных — меняйте и
 * этот текст: ссылка на него стоит в Google Play и App Store.
 */

export type ЯзыкПолитики = "en" | "ru" | "uz";

export interface Раздел {
  заголовок: string;
  пункты: string[];
}

export interface Политика {
  название: string;
  обновлено: string;
  вступление: string;
  разделы: Раздел[];
  контакт: (почта: string | null) => string;
}

export const ДАТА = "13.10.2026";

export const ПОЛИТИКА: Record<ЯзыкПолитики, Политика> = {
  en: {
    название: "HelloUZ privacy policy",
    обновлено: `Last updated: ${ДАТА}`,
    вступление:
      "HelloUZ is a travel guide to Uzbekistan (app and website). This policy explains what data we process, why, who receives it and how to delete it. We do not sell personal data.",
    разделы: [
      {
        заголовок: "What we collect",
        пункты: [
          "Account (optional): email, first and last name, password (stored only as a hash), country, phone if you add it, profile photo if you upload it. You can use most of the app as a guest without an account.",
          "Location: used on your device to show distance, build routes, guide you turn by turn and order a taxi. To calculate a route, your current point and the destination are sent to our server and to a routing service; we do not store them. If you press SOS, your coordinates are saved and shown to our operators so they can help.",
          "Photos for the AI photo guide and menu translator: the photo you take is sent to our server and to Anthropic (Claude) for processing and is not stored.",
          "Support chat: your messages are stored so our team can answer. First replies are written by an AI assistant (clearly marked “AI”) using Anthropic; a human operator can join at any time. If you describe a bug, a short report with your device type and language is saved for our developers.",
          "Bookings: hotel, restaurant and tour requests (date, number of guests, your note) are stored and passed to the venue so it can confirm them.",
          "Reviews you publish, with your first name.",
          "Push notifications: if you allow them, we store the browser/device subscription address and your selected city.",
          "Settings like language, favourites, trip plan and downloaded cities are kept on your device.",
        ],
      },
      {
        заголовок: "Who receives data",
        пункты: [
          "Render (hosting) — stores our server and database.",
          "Anthropic — processes AI requests (support assistant, AI guide, photo guide, translation). Data is not used to train models under Anthropic's commercial terms.",
          "OpenStreetMap / FOSSGIS or OpenRouteService — route calculation (coordinates only).",
          "Yandex Go — when you order a taxi, the app opens Yandex Go with the pickup and destination points.",
          "Payme and Click — when you pay for an eSIM, payment happens on their pages; we receive only the payment status. Airalo — issues the eSIM.",
          "Email service — to send verification codes and notifications.",
          "Hotels, restaurants and tour operators — your booking request for their venue.",
        ],
      },
      {
        заголовок: "How long we keep data",
        пункты: [
          "Account data — until you delete the account.",
          "Support chats, bug reports, SOS signals, push subscriptions — deleted together with the account.",
          "Reviews — remain after account deletion, but without your name.",
          "Bookings — remain as the venue's record (date, guests) without a link to you.",
        ],
      },
      {
        заголовок: "Your rights",
        пункты: [
          "You can view and edit your profile in the app (Profile → Settings).",
          "You can delete your account and data at any time: Profile → Settings → Delete account, or see /delete-account.",
          "You can turn off location, camera and notifications in your phone settings; the app keeps working without them.",
        ],
      },
      {
        заголовок: "Children",
        пункты: ["HelloUZ is not intended for children under 13 and we do not knowingly collect their data."],
      },
    ],
    контакт: (почта) =>
      почта
        ? `Questions about privacy: ${почта} or the support chat in the app (Profile → Support).`
        : "Questions about privacy: the support chat in the app (Profile → Support).",
  },
  ru: {
    название: "Политика конфиденциальности HelloUZ",
    обновлено: `Обновлено: ${ДАТА}`,
    вступление:
      "HelloUZ — путеводитель по Узбекистану (приложение и сайт). Здесь написано, какие данные мы обрабатываем, зачем, кому передаём и как их удалить. Мы не продаём персональные данные.",
    разделы: [
      {
        заголовок: "Что мы собираем",
        пункты: [
          "Аккаунт (по желанию): почта, имя и фамилия, пароль (хранится только в виде хеша), страна, телефон — если укажете, фото профиля — если загрузите. Большей частью приложения можно пользоваться гостем без аккаунта.",
          "Местоположение: используется на телефоне, чтобы показать расстояние, построить маршрут, вести по шагам и вызвать такси. Для расчёта маршрута ваша точка и точка назначения уходят на наш сервер и в сервис маршрутов; мы их не храним. Если вы нажмёте SOS, координаты сохраняются и видны нашим операторам, чтобы помочь.",
          "Фото для ИИ-фото-гида и переводчика меню: снимок уходит на наш сервер и в Anthropic (Claude) для обработки и не сохраняется.",
          "Чат поддержки: сообщения хранятся, чтобы команда могла ответить. Первым отвечает ИИ-помощник (с пометкой «ИИ») на базе Anthropic; живой оператор подключается в любой момент. Если вы описали ошибку, короткая заявка с типом устройства и языком сохраняется для разработчиков.",
          "Брони: заявки в гостиницы, рестораны и на экскурсии (дата, число гостей, ваш комментарий) хранятся и передаются заведению для подтверждения.",
          "Отзывы, которые вы публикуете, — с вашим именем.",
          "Push-уведомления: если вы их разрешили, храним адрес подписки устройства и выбранный город.",
          "Язык, избранное, план поездки и скачанные города хранятся на вашем устройстве.",
        ],
      },
      {
        заголовок: "Кому передаются данные",
        пункты: [
          "Render (хостинг) — на нём работают наш сервер и база.",
          "Anthropic — обрабатывает запросы к ИИ (помощник поддержки, ИИ-гид, фото-гид, перевод). По коммерческим условиям Anthropic эти данные не используются для обучения моделей.",
          "OpenStreetMap / FOSSGIS или OpenRouteService — расчёт маршрута (только координаты).",
          "Яндекс Go — при заказе такси приложение открывает Яндекс Go с точками подачи и назначения.",
          "Payme и Click — при оплате eSIM оплата идёт на их страницах, мы получаем только статус платежа. Airalo — выпускает eSIM.",
          "Почтовый сервис — для кодов подтверждения и уведомлений.",
          "Гостиницы, рестораны и экскурсоводы — ваша заявка на бронь в их заведение.",
        ],
      },
      {
        заголовок: "Сколько хранятся данные",
        пункты: [
          "Данные аккаунта — пока вы его не удалите.",
          "Переписка с поддержкой, заявки об ошибках, сигналы SOS, подписки на уведомления — удаляются вместе с аккаунтом.",
          "Отзывы — остаются после удаления аккаунта, но без вашего имени.",
          "Брони — остаются записью у заведения (дата, гости) без связи с вами.",
        ],
      },
      {
        заголовок: "Ваши права",
        пункты: [
          "Посмотреть и изменить профиль можно в приложении (Профиль → Настройки).",
          "Удалить аккаунт и данные можно в любой момент: Профиль → Настройки → Удалить аккаунт, или см. /delete-account.",
          "Геолокацию, камеру и уведомления можно выключить в настройках телефона — приложение продолжит работать.",
        ],
      },
      {
        заголовок: "Дети",
        пункты: ["HelloUZ не предназначен для детей младше 13 лет, и мы сознательно не собираем их данные."],
      },
    ],
    контакт: (почта) =>
      почта
        ? `Вопросы о данных: ${почта} или чат поддержки в приложении (Профиль → Поддержка).`
        : "Вопросы о данных: чат поддержки в приложении (Профиль → Поддержка).",
  },
  uz: {
    название: "HelloUZ maxfiylik siyosati",
    обновлено: `Yangilangan: ${ДАТА}`,
    вступление:
      "HelloUZ — Oʻzbekiston boʻyicha yoʻlboshlovchi (ilova va sayt). Bu yerda qanday maʼlumotlarni, nima uchun qayta ishlashimiz, kimga berishimiz va ularni qanday oʻchirish mumkinligi yozilgan. Biz shaxsiy maʼlumotlarni sotmaymiz.",
    разделы: [
      {
        заголовок: "Nimalarni yigʻamiz",
        пункты: [
          "Akkaunt (ixtiyoriy): pochta, ism va familiya, parol (faqat xesh koʻrinishida saqlanadi), mamlakat, telefon — agar kiritsangiz, profil surati — agar yuklasangiz. Ilovaning koʻp qismidan akkauntsiz, mehmon sifatida foydalanish mumkin.",
          "Joylashuv: masofani koʻrsatish, marshrut tuzish, qadamma-qadam boshlash va taksi chaqirish uchun telefonda ishlatiladi. Marshrutni hisoblash uchun sizning nuqtangiz va manzil serverimizga hamda marshrut xizmatiga yuboriladi; biz ularni saqlamaymiz. SOS tugmasini bossangiz, yordam berish uchun koordinatalaringiz saqlanadi va operatorlarimizga koʻrinadi.",
          "SI foto-gid va menyu tarjimoni uchun suratlar: surat serverimizga va Anthropic (Claude) ga qayta ishlash uchun yuboriladi va saqlanmaydi.",
          "Qoʻllab-quvvatlash chati: jamoa javob berishi uchun xabarlar saqlanadi. Birinchi boʻlib Anthropic asosidagi SI-yordamchi («SI» belgisi bilan) javob beradi; operator istalgan payt qoʻshiladi. Xatolikni tasvirlasangiz, qurilma turi va til koʻrsatilgan qisqa ariza dasturchilar uchun saqlanadi.",
          "Bronlar: mehmonxona, restoran va ekskursiyalarga arizalar (sana, mehmonlar soni, izohingiz) saqlanadi va tasdiqlash uchun muassasaga beriladi.",
          "Siz eʼlon qilgan sharhlar — ismingiz bilan.",
          "Push-bildirishnomalar: ruxsat bersangiz, qurilma obunasi manzili va tanlangan shahar saqlanadi.",
          "Til, sevimlilar, sayohat rejasi va yuklab olingan shaharlar qurilmangizda saqlanadi.",
        ],
      },
      {
        заголовок: "Maʼlumotlar kimga beriladi",
        пункты: [
          "Render (xosting) — serverimiz va bazamiz shu yerda ishlaydi.",
          "Anthropic — SI soʻrovlarini qayta ishlaydi (yordamchi, SI-gid, foto-gid, tarjima). Anthropic tijorat shartlariga koʻra bu maʼlumotlar modellarni oʻqitishda ishlatilmaydi.",
          "OpenStreetMap / FOSSGIS yoki OpenRouteService — marshrutni hisoblash (faqat koordinatalar).",
          "Yandex Go — taksi buyurtma qilganda ilova olib ketish va manzil nuqtalari bilan Yandex Go ni ochadi.",
          "Payme va Click — eSIM uchun toʻlov ularning sahifalarida amalga oshadi, biz faqat toʻlov holatini olamiz. Airalo — eSIM chiqaradi.",
          "Pochta xizmati — tasdiqlash kodlari va bildirishnomalar uchun.",
          "Mehmonxonalar, restoranlar va ekskursiya tashkilotchilari — ularning muassasasiga bron arizangiz.",
        ],
      },
      {
        заголовок: "Maʼlumotlar qancha saqlanadi",
        пункты: [
          "Akkaunt maʼlumotlari — siz uni oʻchirmaguningizcha.",
          "Chat yozishmalari, xatolik arizalari, SOS signallari, bildirishnoma obunalari — akkaunt bilan birga oʻchiriladi.",
          "Sharhlar — akkaunt oʻchirilgandan keyin ham qoladi, lekin ismingizsiz.",
          "Bronlar — muassasada siz bilan bogʻlanmagan yozuv (sana, mehmonlar) sifatida qoladi.",
        ],
      },
      {
        заголовок: "Huquqlaringiz",
        пункты: [
          "Profilni ilovada koʻrish va oʻzgartirish mumkin (Profil → Sozlamalar).",
          "Akkaunt va maʼlumotlarni istalgan payt oʻchirish mumkin: Profil → Sozlamalar → Akkauntni oʻchirish yoki /delete-account sahifasi.",
          "Joylashuv, kamera va bildirishnomalarni telefon sozlamalarida oʻchirish mumkin — ilova ishlashda davom etadi.",
        ],
      },
      {
        заголовок: "Bolalar",
        пункты: ["HelloUZ 13 yoshgacha boʻlgan bolalar uchun moʻljallanmagan va biz ularning maʼlumotlarini ataylab yigʻmaymiz."],
      },
    ],
    контакт: (почта) =>
      почта
        ? `Maʼlumotlar boʻyicha savollar: ${почта} yoki ilovadagi qoʻllab-quvvatlash chati (Profil → Qoʻllab-quvvatlash).`
        : "Maʼlumotlar boʻyicha savollar: ilovadagi qoʻllab-quvvatlash chati (Profil → Qoʻllab-quvvatlash).",
  },
};

export const УДАЛЕНИЕ: Record<ЯзыкПолитики, { название: string; шаги: string[]; что: string[]; без: string }> = {
  en: {
    название: "Delete your HelloUZ account",
    шаги: [
      "Open the HelloUZ app or website and sign in.",
      "Go to Profile → Settings.",
      "Tap “Delete account” and confirm.",
    ],
    что: [
      "Deleted immediately: account, profile photo, support chat, bug reports, SOS signals, push subscriptions.",
      "Kept without any link to you: reviews (shown without your name) and booking records at the venue (date, number of guests).",
    ],
    без: "Can't sign in? Use “Forgot password?” on the sign-in screen to restore access, then delete the account as above.",
  },
  ru: {
    название: "Удаление аккаунта HelloUZ",
    шаги: ["Откройте приложение или сайт HelloUZ и войдите.", "Перейдите в Профиль → Настройки.", "Нажмите «Удалить аккаунт» и подтвердите."],
    что: [
      "Удаляется сразу: аккаунт, фото профиля, переписка с поддержкой, заявки об ошибках, сигналы SOS, подписки на уведомления.",
      "Остаётся без связи с вами: отзывы (показываются без имени) и записи о бронях у заведения (дата, число гостей).",
    ],
    без: "Не можете войти? Восстановите доступ кнопкой «Забыли пароль?» на экране входа и удалите аккаунт, как написано выше.",
  },
  uz: {
    название: "HelloUZ akkauntini oʻchirish",
    шаги: [
      "HelloUZ ilovasi yoki saytini oching va kiring.",
      "Profil → Sozlamalar boʻlimiga oʻting.",
      "«Akkauntni oʻchirish» tugmasini bosing va tasdiqlang.",
    ],
    что: [
      "Darhol oʻchiriladi: akkaunt, profil surati, chat yozishmalari, xatolik arizalari, SOS signallari, bildirishnoma obunalari.",
      "Siz bilan bogʻlanmagan holda qoladi: sharhlar (ismingizsiz koʻrsatiladi) va muassasadagi bron yozuvlari (sana, mehmonlar soni).",
    ],
    без: "Kira olmayapsizmi? Kirish ekranidagi «Parolni unutdingizmi?» orqali kirishni tiklang va akkauntni yuqoridagidek oʻchiring.",
  },
};
