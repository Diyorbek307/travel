"use client";

import { useEffect, useState } from "react";
import { APP_URL, useЯзык, type Язык } from "@/lib/i18n";

/**
 * Города — экран во всю ширину: фото сменяется с медленным наездом,
 * слева огромное название города узким шрифтом, справа карточки других
 * городов. Листается само, стрелками и по карточкам.
 */

const фото = (id: string) => `https://images.unsplash.com/photo-${id}?w=1920&q=80&auto=format&fit=crop`;

interface Город {
  id: string;
  регион: Record<Язык, string>;
  имя: Record<Язык, string>;
  текст: Record<Язык, string>;
  img: string;
  /** Какую часть кадра держать в окне. */
  позиция?: string;
}

const ГОРОДА: Город[] = [
  {
    id: "samarkand",
    регион: {
      en: "Samarkand region",
      ru: "Самаркандская область",
      uz: "Samarqand viloyati",
      zh: "撒马尔罕州",
      ko: "사마르칸트주",
      de: "Region Samarkand",
      fr: "Région de Samarcande",
      ja: "サマルカンド州",
      tr: "Semerkant bölgesi",
      ar: "ولاية سمرقند",
    },
    имя: {
      en: "Samarkand",
      ru: "Самарканд",
      uz: "Samarqand",
      zh: "撒马尔罕",
      ko: "사마르칸트",
      de: "Samarkand",
      fr: "Samarcande",
      ja: "サマルカンド",
      tr: "Semerkant",
      ar: "سمرقند",
    },
    текст: {
      en: "Registan, Shah-i-Zinda and Gur-e-Amir — turquoise domes more than six centuries old.",
      ru: "Регистан, Шахи-Зинда и Гур-Эмир — бирюзовые купола, которым больше шести веков.",
      uz: "Registon, Shohi Zinda va Goʻri Amir — olti asrdan oshiq feruza gumbazlar.",
      zh: "雷吉斯坦、夏伊辛达和古尔-埃米尔——六百多年的绿松石穹顶。",
      ko: "레기스탄, 샤히진다, 구르에미르 — 600년이 넘은 청록색 돔들.",
      de: "Registan, Schah-i-Sinda und Gur-Emir — türkise Kuppeln, über sechs Jahrhunderte alt.",
      fr: "Registan, Shah-i-Zinda et Gour-Emir — des coupoles turquoise vieilles de six siècles.",
      ja: "レギスタン、シャーヒ・ズィンダ、グーリ・アミール — 600年を超えるターコイズのドーム。",
      tr: "Registan, Şah-ı Zinde ve Gur-i Emir — altı asırlık turkuaz kubbeler.",
      ar: "ريجستان وشاه زنده وكور أمير — قباب فيروزية عمرها أكثر من ستة قرون.",
    },
    img: фото("1664602078796-68ee76b3fc59"),
  },
  {
    id: "bukhara",
    регион: {
      en: "Bukhara region",
      ru: "Бухарская область",
      uz: "Buxoro viloyati",
      zh: "布哈拉州",
      ko: "부하라주",
      de: "Region Buchara",
      fr: "Région de Boukhara",
      ja: "ブハラ州",
      tr: "Buhara bölgesi",
      ar: "ولاية بخارى",
    },
    имя: {
      en: "Bukhara",
      ru: "Бухара",
      uz: "Buxoro",
      zh: "布哈拉",
      ko: "부하라",
      de: "Buchara",
      fr: "Boukhara",
      ja: "ブハラ",
      tr: "Buhara",
      ar: "بخارى",
    },
    текст: {
      en: "The Ark, Kalon minaret and Lyabi-Hauz: an old town whose life revolves around a pond under mulberries.",
      ru: "Арк, минарет Калян и Ляби-Хауз: старый город, где жизнь идёт вокруг пруда под тутовником.",
      uz: "Ark, Minorai Kalon va Labi Hovuz: hayot tut ostidagi hovuz atrofida kechadigan eski shahar.",
      zh: "雅克城堡、卡扬宣礼塔和里亚比豪兹：生活围绕桑树下水池展开的古城。",
      ko: "아르크, 칼론 미나렛, 랴비하우즈 — 뽕나무 아래 연못을 중심으로 사는 옛 도시.",
      de: "Die Ark, das Kalon-Minarett und Labi-Hauz: eine Altstadt, deren Leben um einen Teich unter Maulbeerbäumen kreist.",
      fr: "L'Ark, le minaret Kalon et Lyabi-Khaouz : une vieille ville qui vit autour d'un bassin sous les mûriers.",
      ja: "アルク城、カラーン・ミナレット、ラビ・ハウズ — 桑の木陰の池を中心に暮らす旧市街。",
      tr: "Ark, Kalon minaresi ve Labi Havuz: hayatın dut ağaçları altındaki havuz çevresinde geçtiği eski şehir.",
      ar: "القلعة ومئذنة كالون وليابي حوض: مدينة قديمة تدور حياتها حول بركة تحت أشجار التوت.",
    },
    img: фото("1653023102302-247f5f0fbdd1"),
  },
  {
    id: "khiva",
    регион: {
      en: "Khorezm",
      ru: "Хорезм",
      uz: "Xorazm",
      zh: "花拉子模",
      ko: "호레즘",
      de: "Choresm",
      fr: "Khorezm",
      ja: "ホラズム",
      tr: "Harezm",
      ar: "خوارزم",
    },
    имя: {
      en: "Khiva",
      ru: "Хива",
      uz: "Xiva",
      zh: "希瓦",
      ko: "히바",
      de: "Chiwa",
      fr: "Khiva",
      ja: "ヒヴァ",
      tr: "Hive",
      ar: "خيوة",
    },
    текст: {
      en: "Itchan Kala — a city within walls, a living open-air museum.",
      ru: "Ичан-Кала — город внутри стен, живой музей под открытым небом.",
      uz: "Ichan qalʼa — devorlar ichidagi shahar, ochiq osmon ostidagi tirik muzey.",
      zh: "伊钦卡拉——城墙之内的城市，一座活着的露天博物馆。",
      ko: "이찬칼라 — 성벽 안의 도시, 살아 있는 야외 박물관.",
      de: "Itchan Kala — eine Stadt in Mauern, ein lebendiges Freilichtmuseum.",
      fr: "Itchan Kala — une ville entre ses remparts, un musée vivant à ciel ouvert.",
      ja: "イチャン・カラ — 城壁の中の街、生きた野外博物館。",
      tr: "İçan Kale — surlar içinde bir şehir, yaşayan bir açık hava müzesi.",
      ar: "إيتشان قلعة — مدينة داخل الأسوار ومتحف حيّ في الهواء الطلق.",
    },
    img: фото("1654861857666-1e8c438cbe4a"),
  },
  {
    id: "tashkent",
    регион: {
      en: "The capital",
      ru: "Столица",
      uz: "Poytaxt",
      zh: "首都",
      ko: "수도",
      de: "Die Hauptstadt",
      fr: "La capitale",
      ja: "首都",
      tr: "Başkent",
      ar: "العاصمة",
    },
    имя: {
      en: "Tashkent",
      ru: "Ташкент",
      uz: "Toshkent",
      zh: "塔什干",
      ko: "타슈켄트",
      de: "Taschkent",
      fr: "Tachkent",
      ja: "タシケント",
      tr: "Taşkent",
      ar: "طشقند",
    },
    текст: {
      en: "Chorsu bazaar, Hast-Imam and the museum-like metro — the capital where most trips begin.",
      ru: "Базар Чорсу, Хаст-Имам и метро-музей — столица, с которой начинается поездка.",
      uz: "Chorsu bozori, Hazrati Imom va muzeyga oʻxshash metro — sayohat boshlanadigan poytaxt.",
      zh: "乔尔苏巴扎、哈斯特伊玛目和博物馆般的地铁——大多数旅程从这座首都开始。",
      ko: "초르수 시장, 하스트이맘, 박물관 같은 지하철 — 여행이 시작되는 수도.",
      de: "Chorsu-Basar, Hast-Imam und die Metro wie ein Museum — die Hauptstadt, in der die meisten Reisen beginnen.",
      fr: "Le bazar Chorsu, Hast-Imam et le métro-musée — la capitale où commence le voyage.",
      ja: "チョルスー・バザール、ハスト・イマーム、美術館のような地下鉄 — 旅の始まりの首都。",
      tr: "Çorsu pazarı, Hast İmam ve müze gibi metro — yolculukların başladığı başkent.",
      ar: "سوق تشورسو وحضرة إمام والمترو الذي يشبه المتحف — العاصمة التي تبدأ منها الرحلات.",
    },
    img: фото("1622030797403-fa221ce5d208"),
  },
  {
    id: "mountains",
    регион: {
      en: "Mountains near Tashkent",
      ru: "Горы у Ташкента",
      uz: "Toshkent yaqinidagi togʻlar",
      zh: "塔什干附近的山",
      ko: "타슈켄트 근교의 산",
      de: "Berge bei Taschkent",
      fr: "Montagnes près de Tachkent",
      ja: "タシケント近郊の山",
      tr: "Taşkent yakınındaki dağlar",
      ar: "جبال قرب طشقند",
    },
    имя: {
      en: "Amirsoy",
      ru: "Амирсой",
      uz: "Amirsoy",
      zh: "阿米尔索伊",
      ko: "아미르소이",
      de: "Amirsoy",
      fr: "Amirsoy",
      ja: "アミルソイ",
      tr: "Amirsoy",
      ar: "أميرسوي",
    },
    текст: {
      en: "The Western Tien Shan next to the capital: skiing in winter, trails, Charvak and Chimgan in summer.",
      ru: "Западный Тянь-Шань рядом со столицей: зимой — лыжи, летом — тропы, Чарвак и Чимган.",
      uz: "Poytaxt yonidagi Gʻarbiy Tyan-Shan: qishda chang'i, yozda soʻqmoqlar, Chorvoq va Chimyon.",
      zh: "首都旁的西天山：冬季滑雪，夏季徒步，还有恰尔瓦克湖和奇姆甘山。",
      ko: "수도 옆 서톈산 — 겨울엔 스키, 여름엔 트레킹과 차르박, 침간.",
      de: "Der Westliche Tian Shan neben der Hauptstadt: im Winter Ski, im Sommer Pfade, Tscharwak und Tschimgan.",
      fr: "Le Tian Shan occidental aux portes de la capitale : ski l'hiver, sentiers, Tcharvak et Tchimgan l'été.",
      ja: "首都のそばの西天山 — 冬はスキー、夏はトレイル、チャルヴァクとチムガン。",
      tr: "Başkentin yanında Batı Tanrı Dağları: kışın kayak, yazın patikalar, Çarvak ve Çimgan.",
      ar: "تيان شان الغربية بجوار العاصمة: تزلج في الشتاء، ومسارات وشارفاك وتشيمغان في الصيف.",
    },
    img: фото("1712780943624-b5d3f7a72792"),
    позиция: "center 80%",
  },
];

export default function Destinations() {
  const { t, язык } = useЯзык();
  const [i, setI] = useState(0);
  const [пауза, setПауза] = useState(false);
  const город = ГОРОДА[i];

  useEffect(() => {
    if (пауза) return;
    const id = setTimeout(() => setI((x) => (x + 1) % ГОРОДА.length), 6500);
    return () => clearTimeout(id);
  }, [i, пауза]);

  const другие = [...ГОРОДА.slice(i + 1), ...ГОРОДА.slice(0, i)];

  return (
    <section
      id="cities"
      data-nav="dark"
      className="relative h-[100svh] min-h-[640px] overflow-hidden"
      style={{ background: "var(--night)" }}
      onPointerEnter={() => setПауза(true)}
      onPointerLeave={() => setПауза(false)}
    >
      {ГОРОДА.map((г, n) => (
        <div
          key={г.id}
          className="absolute inset-0 transition-opacity duration-[1400ms]"
          style={{ opacity: n === i ? 1 : 0 }}
          aria-hidden={n !== i}
        >
          {n === i && (
            <img
              src={г.img}
              alt=""
              className="kenburns h-full w-full object-cover"
              style={{ objectPosition: г.позиция }}
            />
          )}
        </div>
      ))}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(10,14,12,0.78) 0%, rgba(10,14,12,0.35) 50%, rgba(10,14,12,0.2) 100%), linear-gradient(to top, rgba(10,14,12,0.7), transparent 45%)",
        }}
      />

      <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-5 pb-10 pt-28 text-white sm:px-8 lg:pb-16">
        {/* minmax(0,…) и min-w-0: иначе лента карточек справа растягивает сетку шире телефона и режет текст слева. */}
        <div className="grid grid-cols-[minmax(0,1fr)] items-end gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] [&>*]:min-w-0">
          {/* Контейнер-запрос: название города подгоняется под ширину колонки (cqi),
              иначе «САМАРКАНД» на 9,5rem уходит под карточки справа. */}
          <div key={город.id} className="[container-type:inline-size]">
            <p className="fade-up mb-3 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-white/75">
              <span className="h-px w-10 bg-white/60" /> {t("cities_kicker")} · {город.регион[язык]}
            </p>
            <h2 className="line-mask condensed text-[clamp(3rem,17cqi,9.5rem)] font-bold leading-[0.88]">
              <span style={{ ["--delay" as string]: "0.05s" }}>{город.имя[язык]}</span>
            </h2>
            <p
              className="fade-up mt-5 max-w-md text-[15px] leading-relaxed text-white/85"
              style={{ ["--delay" as string]: "0.25s" }}
            >
              {город.текст[язык]}
            </p>
            <a
              href={APP_URL}
              target="_blank"
              rel="noreferrer"
              className="fade-up mt-7 inline-flex items-center gap-3 rounded-full px-6 py-3 text-sm font-semibold transition-transform hover:scale-[1.04]"
              style={{ background: "var(--gold)", color: "var(--ink)", ["--delay" as string]: "0.35s" }}
            >
              {t("cities_open")} ↗
            </a>
          </div>

          <div>
            <div className="-mx-5 flex gap-4 overflow-x-auto px-5 pb-2 [scrollbar-width:none] lg:mx-0 lg:overflow-visible lg:px-0">
              {другие.slice(0, 4).map((г) => (
                <button
                  key={г.id}
                  onClick={() => setI(ГОРОДА.indexOf(г))}
                  className="group relative h-56 w-40 flex-shrink-0 overflow-hidden rounded-2xl text-left shadow-2xl transition-transform duration-500 hover:-translate-y-2 sm:h-64 sm:w-44"
                >
                  <img
                    src={г.img.replace("w=1920", "w=500")}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <span
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75), transparent 60%)" }}
                  />
                  <span className="absolute bottom-3 left-3 right-3">
                    <span className="block text-[10px] uppercase tracking-[0.18em] text-white/70">
                      {г.регион[язык]}
                    </span>
                    <span className="condensed block text-xl font-bold text-white">{г.имя[язык]}</span>
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-7 flex items-center gap-4">
              <button
                aria-label="←"
                onClick={() => setI((i - 1 + ГОРОДА.length) % ГОРОДА.length)}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-white/40 transition-colors hover:bg-white hover:text-black"
              >
                ←
              </button>
              <button
                aria-label="→"
                onClick={() => setI((i + 1) % ГОРОДА.length)}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-white/40 transition-colors hover:bg-white hover:text-black"
              >
                →
              </button>
              <div className="relative h-px flex-1 bg-white/25">
                <span
                  key={`${i}-${пауза}`}
                  className="absolute inset-y-0 left-0 bg-white"
                  style={
                    пауза
                      ? { width: `${((i + 1) / ГОРОДА.length) * 100}%` }
                      : { width: 0, animation: "grow 6.5s linear forwards" }
                  }
                />
              </div>
              <span className="condensed text-5xl font-bold tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
