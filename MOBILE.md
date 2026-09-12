# Мобильные приложения

Приложения для Android и iPhone — это **та же веб-платформа в нативной
оболочке** (Capacitor). Оболочка показывает живой сайт
`https://uzbekistan-travel.onrender.com`, поэтому код не раздваивается, а
данные общие: телефон, планшет и веб ходят к одному серверу. Обновление
контента не требует перевыпуска приложения в магазине.

Настройка — в `capacitor.config.ts`.

## Android

Собирается на Windows/Mac/Linux. Нужен Android Studio (в нём SDK и Java).

```bash
# один раз: синхронизировать веб-часть в нативный проект
npx cap sync android

# собрать отладочный APK
cd android
./gradlew assembleDebug
```

Готовый файл: `android/app/build/outputs/apk/debug/app-debug.apk`.

**Установить на телефон:** перекинуть APK на устройство и открыть
(разрешить «установку из неизвестных источников»), либо через USB:

```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

Открыть проект в Android Studio для эмулятора и правок:

```bash
npx cap open android
```

## iOS

Собрать под iPhone можно **только на macOS**. Своего Mac не нужно —
сборка идёт бесплатно в облаке GitHub (`.github/workflows/ios.yml`,
раннер `macos-14`, потому что репозиторий публичный).

- Автоматически при пуше в `main`, либо вручную: GitHub → вкладка
  **Actions** → «iOS (симулятор)» → **Run workflow**.
- Результат — во вкладке Actions, артефакт **ios-приложение**: сборка
  `.app` под симулятор и скриншот с iPhone.

Собранное под симулятор **не требует подписи** и аккаунта Apple. Чтобы
поставить на настоящий iPhone или в App Store, нужен Apple Developer
($99/год) — тогда в workflow добавляются сертификат и профиль, и шаг
сборки меняет `CODE_SIGNING_ALLOWED=NO` на реальную подпись.

## Что нужно для магазинов

| Магазин | Требуется | Цена |
|---|---|---|
| Google Play | аккаунт Play Console, release-подпись (keystore) | $25 один раз |
| App Store | Mac или облачный, аккаунт Apple Developer, сертификаты | $99 в год |

Release-подпись Android (когда дойдёт до публикации): создать keystore,
прописать его в `android/app/build.gradle` через `signingConfigs`, собрать
`./gradlew bundleRelease` (файл `.aab` для Play).

## Разрешения

Объявлены в `android/app/src/main/AndroidManifest.xml` и запрашиваются у
пользователя при первом использовании:

- **Камера** — сканер QR-кодов у экспонатов.
- **Геолокация** — «где я» на карте и маршрут от текущего места.

На iOS те же разрешения описываются в `Info.plist` с текстом-пояснением
(добавляется при первой сборке iOS-проекта).

## Иконка и имя

- `appName` и `appId` (`uz.uzup.app`) — в `capacitor.config.ts`. ID
  невидим пользователю и не меняется при смене названия.
- Иконки приложения генерируются из логотипа; при смене логотипа —
  перегенерировать и `npx cap sync`.
