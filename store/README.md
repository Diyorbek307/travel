# Публикация HelloUZ в Google Play и App Store

Что уже готово в репозитории:

- `android/` — проект Android: голос навигатора через нативный модуль, лёгкий APK
  (≈4,6 МБ), страница «Нет связи», подпись релиза из `android/keystore.properties`.
- `ios/` — проект iOS: иконки, заставка, пояснения для доступа к геолокации,
  камере и фото, схема `hellouz://`. Собирается в GitHub Actions (`.github/workflows/ios.yml`).
- `store/listing.md` — тексты карточек (en/ru/uz), ответы для «Безопасности данных».
- `store/feature-graphic.png` — баннер 1024×500 для Google Play (фото CC0).
- `store/screenshots/` — скриншоты 412×732 (ru, en).
- Политика конфиденциальности: `https://uzbekistan-travel.onrender.com/privacy`
- Удаление аккаунта: `https://uzbekistan-travel.onrender.com/delete-account`

Что можете сделать только вы: аккаунты разработчика, оплата, ключ подписи.

---

## Перед отправкой

1. На Render добавить `ANTHROPIC_API_KEY` — иначе ИИ-функции показывают «Скоро»,
   а описание их обещает. Проверяющие это заметят.
2. По желанию — `PRIVACY_EMAIL` на Render: почта для вопросов о данных появится
   на странице `/privacy`.
3. Убедиться, что сайт отвечает быстро: бесплатный Render засыпает, и первый запуск
   приложения ждёт до минуты. Проверяющие могут отклонить «приложение не грузится».
   Платный тариф Render (Starter) это убирает.
4. У 8 старых мест Самарканда и у демо-заведений стоят выдуманные рейтинги и
   число отзывов. Политики магазинов запрещают вводящие в заблуждение данные —
   лучше обнулить их до публикации.

---

## Google Play

1. Аккаунт: https://play.google.com/console — разовый взнос $25, проверка личности.
   Для нового личного аккаунта Google требует закрытое тестирование: 12 тестировщиков
   в течение 14 дней до выхода в общий доступ.
2. Ключ подписи (один раз, хранить в надёжном месте — без него не выпустить обновление):

   ```bash
   cd android
   keytool -genkey -v -keystore hellouz-upload.jks -keyalg RSA -keysize 2048 -validity 10000 -alias hellouz
   ```

   Потом создать `android/keystore.properties` (в Git не попадает):

   ```
   storeFile=hellouz-upload.jks
   storePassword=ваш_пароль
   keyAlias=hellouz
   keyPassword=ваш_пароль
   ```

3. Сборка для магазина (Android Studio JDK):

   ```bash
   npx cap sync android
   cd android && ./gradlew bundleRelease
   ```

   Файл: `android/app/build/outputs/bundle/release/app-release.aab`.
   Перед каждым обновлением увеличить `versionCode` в `android/app/build.gradle`.
4. В консоли: создать приложение → загрузить AAB → заполнить карточку из
   `store/listing.md`, баннер, скриншоты, политику, «Безопасность данных»,
   возрастной рейтинг (анкета), категорию «Путешествия».

## App Store

1. Аккаунт Apple Developer: https://developer.apple.com/programs — $99 в год.
2. Нужен Mac с Xcode (или облачный сервис сборки, например Codemagic):
   `npx cap sync ios`, открыть `ios/App/App.xcodeproj`, выбрать свою команду
   (Signing & Capabilities), Product → Archive → Distribute App → App Store Connect.
3. В App Store Connect: карточка из `store/listing.md`, скриншоты iPhone 6.9"
   (1320×2868) — снять в симуляторе iPhone 16 Pro Max, политика, анкета приватности
   (те же ответы, что для Google), отправить на проверку.
4. Apple строже к приложениям-«обёрткам сайта»: в приложении должны быть
   нативные возможности. У HelloUZ это голос навигатора, геолокация, камера,
   работа без сети — упомяните это в заметке для проверяющих.
