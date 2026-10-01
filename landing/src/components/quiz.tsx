"use client";

import { useState } from "react";
import { APP_URL, useЯзык, тр, type Многоязычно } from "@/lib/i18n";
import Reveal from "./reveal";

/**
 * «Какая поездка вам подходит?» — три вопроса и готовый маршрут по дням
 * из настоящих мест HelloUZ. Кнопка открывает его прямо в приложении:
 * ссылка «/?trip=<код>» (формат — src/lib/trip.ts приложения).
 */

type Интерес = "history" | "nature" | "food";
type Старт = "tashkent" | "samarkand" | "bukhara";

interface Точка {
  вид: "p" | "r";
  id: string;
  /** Имена собственные на всех десяти языках (бренды — как есть). */
  имя: Многоязычно;
}

/**
 * Имена мест на остальных восьми языках — общепринятые написания: узбекская
 * латиница, устоявшиеся китайские, японские и корейские названия, арабская
 * транскрипция. Названия заведений-брендов (Minzifa, Caravan…) не переводятся.
 */
const ИМЕНА: Record<string, Omit<Многоязычно, "en">> = {
  "Hast-Imam": { uz: "Hazrati Imom", zh: "哈斯特伊玛目建筑群", ko: "하스트 이맘", de: "Hast-Imam", fr: "Hast-Imam", ja: "ハスト・イマーム", tr: "Hast İmam", ar: "حضرتي إمام" },
  "Chorsu Bazaar": { uz: "Chorsu bozori", zh: "乔尔苏巴扎", ko: "초르수 바자르", de: "Chorsu-Basar", fr: "Bazar Chorsu", ja: "チョルスー・バザール", tr: "Çorsu Pazarı", ar: "بازار تشورسو" },
  "Amir Timur Museum": { uz: "Amir Temur muzeyi", zh: "帖木儿博物馆", ko: "아미르 티무르 박물관", de: "Amir-Timur-Museum", fr: "Musée Amir Timour", ja: "アミール・ティムール博物館", tr: "Emir Timur Müzesi", ar: "متحف الأمير تيمور" },
  "Registan": { uz: "Registon", zh: "雷吉斯坦广场", ko: "레기스탄", de: "Registan", fr: "Registan", ja: "レギスタン広場", tr: "Registan", ar: "ريجستان" },
  "Gur-e-Amir": { uz: "Go‘ri Amir", zh: "古尔-艾米尔陵", ko: "구르 에미르", de: "Gur-Emir", fr: "Gour-Emir", ja: "グーリ・アミール廟", tr: "Gur-i Emir", ar: "كور أمير" },
  "Shah-i-Zinda": { uz: "Shohi Zinda", zh: "沙希辛德陵墓群", ko: "샤히 진다", de: "Schah-i-Sinda", fr: "Shah-i-Zinda", ja: "シャーヒ・ズィンダ廟群", tr: "Şah-ı Zinde", ar: "شاه زنده" },
  "Bibi-Khanym Mosque": { uz: "Bibixonim masjidi", zh: "比比哈努姆清真寺", ko: "비비하눔 모스크", de: "Bibi-Chanum-Moschee", fr: "Mosquée Bibi-Khanoum", ja: "ビビ・ハニム・モスク", tr: "Bibi Hanım Camii", ar: "مسجد بيبي خانم" },
  "Ulugh Beg Observatory": { uz: "Ulug‘bek rasadxonasi", zh: "兀鲁伯天文台", ko: "울루그베그 천문대", de: "Ulugh-Beg-Observatorium", fr: "Observatoire d'Ulugh Beg", ja: "ウルグ・ベク天文台", tr: "Uluğ Bey Gözlemevi", ar: "مرصد أولوغ بيك" },
  "Meros paper mill": { uz: "«Meros» qog‘oz ustaxonasi", zh: "“梅罗斯”造纸坊", ko: "메로스 종이 공방", de: "Papiermanufaktur „Meros“", fr: "Moulin à papier Meros", ja: "メロス紙工房", tr: "Meros kâğıt atölyesi", ar: "ورشة «ميروس» للورق" },
  "Ark Fortress": { uz: "Ark qal’asi", zh: "阿克城堡", ko: "아르크 요새", de: "Festung Ark", fr: "Forteresse de l'Ark", ja: "アルク城", tr: "Ark Kalesi", ar: "قلعة أرك" },
  "Kalon Minaret": { uz: "Minorai Kalon", zh: "卡扬宣礼塔", ko: "칼론 미나렛", de: "Kalon-Minarett", fr: "Minaret Kalon", ja: "カラーン・ミナレット", tr: "Kalon Minaresi", ar: "منارة كلان" },
  "Lyabi-Hauz": { uz: "Labi Hovuz", zh: "莱比哈乌斯", ko: "랴비 하우즈", de: "Labi-Hauz", fr: "Lyabi-Khaouz", ja: "ラビ・ハウズ", tr: "Lebi Havuz", ar: "لب حوض" },
  "Samanid Mausoleum": { uz: "Somoniylar maqbarasi", zh: "萨曼王朝陵墓", ko: "사마니 영묘", de: "Samaniden-Mausoleum", fr: "Mausolée des Samanides", ja: "イスマイール・サーマーニー廟", tr: "Samaniler Türbesi", ar: "ضريح السامانيين" },
  "Sitorai Mohi-Khosa": { uz: "Sitorai Mohi Xossa", zh: "斯托莱·莫希·霍萨宫", ko: "시토라이 모히 호사", de: "Sitorai Mohi-Chosa", fr: "Sitorai Mokhi-Khossa", ja: "シトライ・マヒ・ホサ宮殿", tr: "Sitorai Mohi Hossa", ar: "ستوراي ماهي خاصة" },
  "Itchan Kala": { uz: "Ichan qal’a", zh: "伊钦·卡拉", ko: "이찬 칼라", de: "Itchan Kala", fr: "Itchan Kala", ja: "イチャン・カラ", tr: "İçan Kale", ar: "إيتشان قلعة" },
  "Islam Khodja Minaret": { uz: "Islomxo‘ja minorasi", zh: "伊斯兰霍贾宣礼塔", ko: "이슬람 호자 미나렛", de: "Islam-Chodscha-Minarett", fr: "Minaret Islam Khodja", ja: "イスラーム・ホジャ・ミナレット", tr: "İslam Hoca Minaresi", ar: "منارة إسلام خوجة" },
  "Charvak Reservoir": { uz: "Chorvoq suv ombori", zh: "恰尔瓦克水库", ko: "차르바크 저수지", de: "Tscharwak-Stausee", fr: "Réservoir de Tcharvak", ja: "チャルバク貯水池", tr: "Çarvak Barajı", ar: "خزان تشارفاك" },
  "Chimgan Mountains": { uz: "Chimyon tog‘lari", zh: "奇姆甘山", ko: "침간 산맥", de: "Tschimgan-Berge", fr: "Monts Tchimgan", ja: "チムガン山地", tr: "Çimgan Dağları", ar: "جبال تشيمغان" },
  "Urungach Lakes": { uz: "Urungach ko‘llari", zh: "乌伦加奇湖", ko: "우룬가치 호수", de: "Urungatsch-Seen", fr: "Lacs d'Ourungatch", ja: "ウルンガチ湖", tr: "Urungaç Gölleri", ar: "بحيرات أورونغاتش" },
  "Amirsoy Resort": { uz: "Amirsoy kurorti", zh: "阿米尔索伊度假村", ko: "아미르소이 리조트", de: "Resort Amirsoy", fr: "Station Amirsoy", ja: "アミルソイ・リゾート", tr: "Amirsoy Tatil Köyü", ar: "منتجع أميرسوي" },
  "Zaamin National Park": { uz: "Zomin milliy bog‘i", zh: "扎阿明国家公园", ko: "자아민 국립공원", de: "Nationalpark Saamin", fr: "Parc national de Zaamin", ja: "ザーミン国立公園", tr: "Zaamin Milli Parkı", ar: "حديقة زامين الوطنية" },
  "Aydarkul Lake": { uz: "Aydarko‘l", zh: "艾达尔湖", ko: "아이다르쿨 호수", de: "Aydarkul-See", fr: "Lac Aydarkoul", ja: "アイダルクル湖", tr: "Aydarkul Gölü", ar: "بحيرة أيدركول" },
  "Sentob & Nuratau": { uz: "Sentob va Nurota tog‘lari", zh: "森托布与努拉塔山", ko: "센토브와 누라타우 산맥", de: "Sentob und Nuratau-Gebirge", fr: "Sentob et monts Nourataou", ja: "セントブとヌラタウ山地", tr: "Sentob ve Nuratau Dağları", ar: "سنتوب وجبال نوراتاو" },
  "Sarmishsay petroglyphs": { uz: "Sarmishsoy qoyatosh suratlari", zh: "萨尔米什赛岩画", ko: "사르미시사이 암각화", de: "Felsbilder von Sarmischsai", fr: "Pétroglyphes de Sarmichsaï", ja: "サルミシュサイの岩絵", tr: "Sarmışsay Kaya Resimleri", ar: "نقوش سرميشساي الصخرية" },
  "Shakhimardan": { uz: "Shohimardon", zh: "沙希马尔丹", ko: "샤히마르단", de: "Schachimardan", fr: "Chakhimardan", ja: "シャヒマルダン", tr: "Şahimerdan", ar: "شاه مردان" },
  "Central Asian Plov Centre": { uz: "Markaziy Osiyo palov markazi", zh: "中亚抓饭中心", ko: "중앙아시아 플로프 센터", de: "Zentralasiatisches Plov-Zentrum", fr: "Centre du plov d'Asie centrale", ja: "中央アジア・プロフセンター", tr: "Orta Asya Pilav Merkezi", ar: "مركز البلوف لآسيا الوسطى" },
  "Rokhat Teahouse": { uz: "Rohat choyxonasi", zh: "罗哈特茶馆", ko: "로하트 차이하나", de: "Teehaus Rochat", fr: "Tchaïkhana Rokhat", ja: "ロハット・チャイハナ", tr: "Rohat Çayhanesi", ar: "مقهى روحات" },
  "Siyob Bazaar": { uz: "Siyob bozori", zh: "锡亚布巴扎", ko: "시욥 바자르", de: "Siyob-Basar", fr: "Bazar Siyob", ja: "シヨブ・バザール", tr: "Siyob Pazarı", ar: "بازار سياب" },
  "Samarkand Plov Centre": { uz: "Samarqand palov markazi", zh: "撒马尔罕抓饭中心", ko: "사마르칸트 플로프 센터", de: "Samarkander Plov-Zentrum", fr: "Centre du plov de Samarcande", ja: "サマルカンド・プロフセンター", tr: "Semerkant Pilav Merkezi", ar: "مركز البلوف في سمرقند" },
  "Registan Teahouse": { uz: "Registon yonidagi choyxona", zh: "雷吉斯坦茶馆", ko: "레기스탄 차이하나", de: "Teehaus am Registan", fr: "Tchaïkhana du Registan", ja: "レギスタンのチャイハナ", tr: "Registan Çayhanesi", ar: "مقهى ريجستان" },
  "Lyabi-Hauz Restaurant": { uz: "Labi Hovuz restorani", zh: "莱比哈乌斯餐厅", ko: "랴비 하우즈 레스토랑", de: "Restaurant Labi-Hauz", fr: "Restaurant Lyabi-Khaouz", ja: "ラビ・ハウズ・レストラン", tr: "Lebi Havuz Restoranı", ar: "مطعم لب حوض" },
};

const м = (id: string, ru: string, en: string): Точка => ({ вид: "p", id, имя: { ...ИМЕНА[en], ru, en } });
const р = (id: string, ru: string, en: string): Точка => ({ вид: "r", id, имя: { ...ИМЕНА[en], ru, en } });

/** Дни по городам: сперва город старта, дальше — по Шёлковому пути. */
const ДНИ: Record<Интерес, Record<Старт | "khiva" | "extra", Точка[][]>> = {
  history: {
    tashkent: [
      [
        м("14-hast", "Хаст-Имам", "Hast-Imam"),
        м("15-chorsu", "Базар Чорсу", "Chorsu Bazaar"),
        м("22-timur", "Музей Амира Темура", "Amir Timur Museum"),
      ],
    ],
    samarkand: [
      [
        м("1-reg", "Регистан", "Registan"),
        м("6-gur", "Гур-Эмир", "Gur-e-Amir"),
        м("2-shah", "Шахи-Зинда", "Shah-i-Zinda"),
      ],
      [
        м("9-bibi", "Мечеть Биби-Ханым", "Bibi-Khanym Mosque"),
        м("10-ulug", "Обсерватория Улугбека", "Ulugh Beg Observatory"),
        м("26-meros", "Бумажная фабрика «Мейрос»", "Meros paper mill"),
      ],
    ],
    bukhara: [
      [
        м("3-ark", "Арк", "Ark Fortress"),
        м("5-kalon", "Минарет Калян", "Kalon Minaret"),
        м("11-labi", "Ляби-Хауз", "Lyabi-Hauz"),
      ],
      [
        м("12-ismail", "Мавзолей Самани", "Samanid Mausoleum"),
        м("29-xsito", "Ситораи Мохи-Хоса", "Sitorai Mohi-Khosa"),
      ],
    ],
    khiva: [
      [м("4-ikhon", "Ичан-Кала", "Itchan Kala"), м("13-ihlj", "Минарет Ислам-Ходжа", "Islam Khodja Minaret")],
    ],
    extra: [],
  },
  nature: {
    tashkent: [
      [
        м("7-chrvk", "Чарвакское водохранилище", "Charvak Reservoir"),
        м("19-chimgn", "Чимганские горы", "Chimgan Mountains"),
      ],
      [
        м("51-scurng", "Урунгачские озёра", "Urungach Lakes"),
        м("57-scamir", "Курорт Амирсой", "Amirsoy Resort"),
      ],
    ],
    samarkand: [[м("52-sczaam", "Зааминский нацпарк", "Zaamin National Park")]],
    bukhara: [
      [
        м("43-xaydr", "Озеро Айдаркуль", "Aydarkul Lake"),
        м("55-scsent", "Сентоб и Нуратинские горы", "Sentob & Nuratau"),
      ],
    ],
    khiva: [[м("53-scsarm", "Петроглифы Сармишсая", "Sarmishsay petroglyphs")]],
    extra: [[м("56-scshoh", "Шахимардан", "Shakhimardan")]],
  },
  food: {
    tashkent: [
      [
        м("15-chorsu", "Базар Чорсу", "Chorsu Bazaar"),
        р("1-rs1", "Плов-центр", "Central Asian Plov Centre"),
        р("3-rs3", "Чайхана Рохат", "Rokhat Teahouse"),
      ],
    ],
    samarkand: [
      [
        м("20-savsav", "Базар Сиаб", "Siyob Bazaar"),
        р("5-rs5", "Плов-центр Самарканда", "Samarkand Plov Centre"),
        р("9-rs9", "Чайхана у Регистана", "Registan Teahouse"),
      ],
    ],
    bukhara: [
      [
        м("11-labi", "Ляби-Хауз", "Lyabi-Hauz"),
        р("7-rs7", "Ресторан Ляби-Хауз", "Lyabi-Hauz Restaurant"),
        р("8-rs8", "Minzifa", "Minzifa"),
      ],
    ],
    khiva: [
      [
        м("4-ikhon", "Ичан-Кала", "Itchan Kala"),
        р("10-rs10", "Oshxona Khiva", "Oshxona Khiva"),
        р("11-rs11", "Terrassa Khiva", "Terrassa Khiva"),
      ],
    ],
    extra: [[р("6-rs6", "Silk Road Spices", "Silk Road Spices"), р("2-rs2", "Caravan", "Caravan")]],
  },
};

const ПОРЯДОК: Record<Старт, (Старт | "khiva" | "extra")[]> = {
  tashkent: ["tashkent", "samarkand", "bukhara", "khiva", "extra"],
  samarkand: ["samarkand", "bukhara", "khiva", "tashkent", "extra"],
  bukhara: ["bukhara", "khiva", "samarkand", "tashkent", "extra"],
};

const ДНЕЙ = { short: 2, mid: 4, long: 6 } as const;

export function собратьМаршрут(интерес: Интерес, старт: Старт, дней: number): Точка[][] {
  const все = ПОРЯДОК[старт].flatMap((г) => ДНИ[интерес][г]);
  return все.slice(0, дней);
}

export default function Quiz() {
  const { t, язык } = useЯзык();
  const [интерес, setИнтерес] = useState<Интерес>("history");
  const [длина, setДлина] = useState<keyof typeof ДНЕЙ>("mid");
  const [старт, setСтарт] = useState<Старт>("tashkent");
  const [маршрут, setМаршрут] = useState<Точка[][] | null>(null);

  const код = маршрут
    ?.flatMap((день, d) => день.map((т) => `${т.вид === "r" ? "r" : "p"}.${d + 1}.${т.id}`))
    .join("~");

  const выбор = <T extends string>(
    подпись: string,
    значение: T,
    set: (v: T) => void,
    варианты: [T, string][],
  ) => (
    <label className="block">
      <span
        className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em]"
        style={{ color: "var(--ink-soft)" }}
      >
        {подпись}
      </span>
      <div className="flex flex-wrap gap-2">
        {варианты.map(([v, текст]) => (
          <button
            key={v}
            type="button"
            onClick={() => {
              set(v);
              setМаршрут(null);
            }}
            className="rounded-full px-4 py-2 text-sm font-medium transition-all"
            style={
              значение === v
                ? { background: "var(--ink)", color: "var(--paper)" }
                : { background: "rgba(255,255,255,0.7)", border: "1px solid var(--line)" }
            }
          >
            {текст}
          </button>
        ))}
      </div>
    </label>
  );

  return (
    <section id="quiz" className="paper-grain px-3 pb-24 sm:px-6">
      <Reveal>
        <div
          className="mx-auto max-w-6xl rounded-[36px] border px-6 py-12 sm:px-12"
          style={{ borderColor: "var(--line)", background: "linear-gradient(135deg,#ffffff,#e3f4f2)" }}
        >
          <h2 className="serif mb-3 text-[clamp(2rem,4vw,3rem)] font-semibold leading-tight">
            {t("quiz_title")}
          </h2>
          <p className="mb-10 max-w-xl text-[15px]" style={{ color: "var(--ink-soft)" }}>
            {t("quiz_sub")}
          </p>
          <div className="grid gap-7 md:grid-cols-3">
            {выбор(t("quiz_q1"), интерес, setИнтерес, [
              ["history", t("q_history")],
              ["nature", t("q_nature")],
              ["food", t("q_food")],
            ])}
            {выбор(t("quiz_q2"), длина, setДлина, [
              ["short", t("q_short")],
              ["mid", t("q_mid")],
              ["long", t("q_long")],
            ])}
            {выбор(t("quiz_q3"), старт, setСтарт, [
              ["tashkent", t("city_tashkent")],
              ["samarkand", t("city_samarkand")],
              ["bukhara", t("city_bukhara")],
            ])}
          </div>
          <button
            onClick={() => setМаршрут(собратьМаршрут(интерес, старт, ДНЕЙ[длина]))}
            className="mt-10 inline-flex items-center gap-3 rounded-full px-7 py-4 text-[15px] font-semibold text-white transition-transform hover:scale-[1.03]"
            style={{ background: "var(--ink)" }}
          >
            {t("quiz_go")} →
          </button>

          {маршрут && (
            <div className="fade-up mt-10">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {маршрут.map((день, d) => (
                  <div
                    key={d}
                    className="rounded-2xl border bg-white/70 p-4"
                    style={{ borderColor: "var(--line)" }}
                  >
                    <p className="hand mb-1 text-2xl" style={{ color: "var(--accent-ink)" }}>
                      {t("quiz_day")} {d + 1}
                    </p>
                    <ul className="space-y-1 text-sm">
                      {день.map((т) => (
                        <li key={т.id}>
                          {т.вид === "r" ? "🍽️" : "📍"} {тр(т.имя, язык)}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <a
                href={`${APP_URL}/?trip=${encodeURIComponent(код ?? "")}`}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex items-center gap-3 rounded-full px-7 py-4 text-[15px] font-semibold text-white shadow-[0_14px_30px_-12px_rgba(14,166,159,0.55)] transition-transform hover:scale-[1.03]"
                style={{ background: "var(--accent-ink)" }}
              >
                {t("quiz_open")} ↗
              </a>
            </div>
          )}
        </div>
      </Reveal>
    </section>
  );
}
