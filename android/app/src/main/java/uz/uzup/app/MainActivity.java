package uz.uzup.app;

import android.webkit.ValueCallback;
import com.getcapacitor.BridgeActivity;

/**
 * Главная активность приложения.
 *
 * Навигация в веб-части держится на состоянии, а не на адресах, поэтому у
 * webview нет истории, которую могла бы отмотать системная кнопка
 * «Назад». Без вмешательства она закрывала бы всё приложение с любого
 * экрана — а человек на карточке места ждёт возврата к списку.
 *
 * Поэтому кнопку спрашиваем у самого приложения: в вебе выставлена
 * функция window.__uzupBack(), которая закрывает верхний открытый слой и
 * возвращает true, либо false, если закрывать нечего. Вернули true —
 * остаёмся; false (мы на главной) — сворачиваем приложение, как принято
 * на Android, а не убиваем его.
 *
 * Отдельного плагина для этого не держим намеренно: одна короткая
 * нативная вставка надёжнее, чем привязка к версии стороннего плагина.
 */
public class MainActivity extends BridgeActivity {

    @Override
    public void onBackPressed() {
        if (bridge == null || bridge.getWebView() == null) {
            super.onBackPressed();
            return;
        }
        // Возвращаем булево, а не строку: evaluateJavascript отдаёт
        // результат в JSON, и строка 'true' пришла бы в кавычках («"true"»),
        // а булево true — без них, как и ждёт сравнение ниже.
        final String js = "!!(window.__uzupBack && window.__uzupBack())";
        bridge.getWebView().evaluateJavascript(js, new ValueCallback<String>() {
            @Override
            public void onReceiveValue(final String value) {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        // true — веб закрыл верхний слой, остаёмся на месте.
                        // Иначе мы на главной: сворачиваем приложение.
                        if (!"true".equals(value)) {
                            moveTaskToBack(true);
                        }
                    }
                });
            }
        });
    }
}
