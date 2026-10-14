"use client";

import { useMemo, useState } from "react";
import { Аватар, Ввод, Заголовок, Карточка, Кнопка, Поле, Теги, Текст, Фотографии, Чипы, цвет } from "./ui";
import { ВХОДИТ_ГИД, ВХОДИТ_ВОДИТЕЛЬ, type КлючКабинета, type ЯзыкКабинета } from "./texts";
import {
  КЛАССЫ_МАШИН,
  ЯЗЫКИ_ПАРТНЁРОВ,
  type КлассМашины,
  type Партнёр,
  type ВидПартнёра,
} from "@/lib/provider-rules";

/** Анкета водителя или гида: подать новую или поправить свою. */

type Форма = {
  name: string;
  photo: string;
  phone: string;
  telegram: string;
  whatsapp: string;
  city: string;
  cities: string[];
  languages: string[];
  bio: string;
  experienceYears: string;
  priceDay: string;
  priceHour: string;
  hoursPerDay: string;
  includes: string[];
  photos: string[];
  car: {
    make: string;
    model: string;
    year: string;
    color: string;
    seats: string;
    class: КлассМашины;
    ac: boolean;
    plate: string;
  };
  specialties: string[];
  licensed: boolean;
};

function изАнкеты(п: Partial<Партнёр> | null, имя: string, телефон: string): Форма {
  return {
    name: п?.name ?? имя,
    photo: п?.photo ?? "",
    phone: п?.phone ?? телефон,
    telegram: п?.telegram ?? "",
    whatsapp: п?.whatsapp ?? "",
    city: п?.city ?? "Самарканд",
    cities: п?.cities ?? [],
    languages: п?.languages ?? ["uz", "ru"],
    bio: п?.bio ?? "",
    experienceYears: String(п?.experienceYears ?? ""),
    priceDay: п?.priceDay ? String(п.priceDay) : "",
    priceHour: п?.priceHour ? String(п.priceHour) : "",
    hoursPerDay: String(п?.hoursPerDay ?? 10),
    includes: п?.includes ?? [],
    photos: п?.photos ?? [],
    car: {
      make: п?.car?.make ?? "",
      model: п?.car?.model ?? "",
      year: п?.car?.year ? String(п.car.year) : "",
      color: п?.car?.color ?? "",
      seats: п?.car?.seats ? String(п.car.seats) : "4",
      class: п?.car?.class ?? "comfort",
      ac: п?.car?.ac ?? true,
      plate: п?.car?.plate ?? "",
    },
    specialties: п?.specialties ?? [],
    licensed: п?.licensed ?? false,
  };
}

const КЛАСС_ПОДПИСЬ: Record<КлассМашины, Record<ЯзыкКабинета, string>> = {
  economy: { ru: "Эконом", uz: "Ekonom", en: "Economy" },
  comfort: { ru: "Комфорт", uz: "Komfort", en: "Comfort" },
  business: { ru: "Бизнес", uz: "Biznes", en: "Business" },
  minivan: { ru: "Минивэн", uz: "Miniven", en: "Minivan" },
  bus: { ru: "Микроавтобус", uz: "Mikroavtobus", en: "Minibus" },
};

export function ФормаАнкеты({
  вид,
  анкета,
  имя,
  телефон,
  язык,
  t,
  onSaved,
  onCancel,
}: {
  вид: ВидПартнёра;
  анкета: Партнёр | null;
  имя: string;
  телефон: string;
  язык: ЯзыкКабинета;
  t: (к: КлючКабинета) => string;
  onSaved: (п: Партнёр) => void;
  onCancel?: () => void;
}) {
  const [ф, setФ] = useState<Форма>(() => изАнкеты(анкета, имя, телефон));
  const [ошибка, setОшибка] = useState("");
  const [идёт, setИдёт] = useState(false);
  const [сохранено, setСохранено] = useState(false);
  const поменять = <K extends keyof Форма>(к: K, v: Форма[K]) => {
    setФ((x) => ({ ...x, [к]: v }));
    setСохранено(false);
  };
  const машина = <K extends keyof Форма["car"]>(к: K, v: Форма["car"][K]) =>
    поменять("car", { ...ф.car, [к]: v });

  const языки = useMemo(() => {
    let имена: Intl.DisplayNames | null = null;
    try {
      имена = new Intl.DisplayNames([язык], { type: "language" });
    } catch {}
    return ЯЗЫКИ_ПАРТНЁРОВ.map((к) => ({ значение: к as string, подпись: имена?.of(к) ?? к }));
  }, [язык]);

  async function сохранить(e: React.FormEvent) {
    e.preventDefault();
    setИдёт(true);
    setОшибка("");
    const тело = {
      ...(анкета ? { id: анкета.id } : { kind: вид }),
      ...ф,
      experienceYears: Number(ф.experienceYears) || 0,
      priceDay: Number(ф.priceDay),
      priceHour: ф.priceHour ? Number(ф.priceHour) : undefined,
      hoursPerDay: Number(ф.hoursPerDay) || 10,
      car: вид === "driver" ? { ...ф.car, year: Number(ф.car.year), seats: Number(ф.car.seats) } : undefined,
    };
    try {
      const r = await fetch("/api/cabinet", {
        method: анкета ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(тело),
      });
      const d = (await r.json()) as { provider?: Партнёр; error?: string };
      if (!r.ok || !d.provider) {
        const ключ = `e_${d.error}` as КлючКабинета;
        setОшибка(t(ключ) || t("e_generic"));
        return;
      }
      setСохранено(true);
      onSaved(d.provider);
    } catch {
      setОшибка(t("e_generic"));
    } finally {
      setИдёт(false);
    }
  }

  const пресеты = (вид === "driver" ? ВХОДИТ_ВОДИТЕЛЬ : ВХОДИТ_ГИД)[язык];

  return (
    <form onSubmit={сохранить}>
      <Карточка>
        <Заголовок>{t("sec_person")}</Заголовок>
        <div className="mb-4">
          <Аватар src={ф.photo} onChange={(v) => поменять("photo", v)} подпись={t("photo_profile")} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Поле подпись={t("name")} className="sm:col-span-2">
            <Ввод required value={ф.name} onChange={(e) => поменять("name", e.target.value)} maxLength={80} />
          </Поле>
          <Поле подпись={t("experience")}>
            <Ввод
              type="number"
              min={0}
              max={60}
              value={ф.experienceYears}
              onChange={(e) => поменять("experienceYears", e.target.value)}
            />
          </Поле>
          <Поле подпись={t("city")}>
            <Ввод required value={ф.city} onChange={(e) => поменять("city", e.target.value)} maxLength={60} />
          </Поле>
          <Поле подпись={t("cities")} className="sm:col-span-2">
            <Теги
              значения={ф.cities}
              onChange={(v) => поменять("cities", v)}
              placeholder={t("cities_ph")}
              максимум={20}
            />
          </Поле>
          <Поле подпись={t("languages")} className="sm:col-span-2">
            <Чипы варианты={языки} выбрано={ф.languages} onChange={(v) => поменять("languages", v)} />
          </Поле>
          <Поле подпись={t("bio")} className="sm:col-span-2">
            <Текст
              rows={4}
              maxLength={1500}
              value={ф.bio}
              placeholder={t(вид === "driver" ? "bio_ph_driver" : "bio_ph_guide")}
              onChange={(e) => поменять("bio", e.target.value)}
            />
          </Поле>
          {вид === "guide" && (
            <>
              <Поле подпись={t("specialties")} className="sm:col-span-2">
                <Теги
                  значения={ф.specialties}
                  onChange={(v) => поменять("specialties", v)}
                  placeholder={t("specialties_ph")}
                  максимум={10}
                />
              </Поле>
              <label className="flex items-center gap-2 text-sm sm:col-span-2" style={{ color: цвет.текст }}>
                <input
                  type="checkbox"
                  checked={ф.licensed}
                  onChange={(e) => поменять("licensed", e.target.checked)}
                  className="h-4 w-4 accent-[var(--accent-fill)]"
                />
                🎓 {t("licensed")}
              </label>
            </>
          )}
        </div>
      </Карточка>

      {вид === "driver" && (
        <Карточка>
          <Заголовок>🚗 {t("sec_car")}</Заголовок>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Поле подпись={t("car_make")}>
              <Ввод
                required
                value={ф.car.make}
                placeholder="Chevrolet"
                onChange={(e) => машина("make", e.target.value)}
                maxLength={40}
              />
            </Поле>
            <Поле подпись={t("car_model")}>
              <Ввод
                required
                value={ф.car.model}
                placeholder="Cobalt"
                onChange={(e) => машина("model", e.target.value)}
                maxLength={40}
              />
            </Поле>
            <Поле подпись={t("car_year")}>
              <Ввод
                type="number"
                required
                min={1980}
                max={new Date().getFullYear() + 1}
                value={ф.car.year}
                onChange={(e) => машина("year", e.target.value)}
              />
            </Поле>
            <Поле подпись={t("car_seats")}>
              <Ввод
                type="number"
                required
                min={1}
                max={60}
                value={ф.car.seats}
                onChange={(e) => машина("seats", e.target.value)}
              />
            </Поле>
            <Поле подпись={t("car_color")}>
              <Ввод value={ф.car.color} onChange={(e) => машина("color", e.target.value)} maxLength={30} />
            </Поле>
            <Поле подпись={t("car_plate")} className="sm:col-span-3">
              <Ввод
                value={ф.car.plate}
                placeholder="30 A 123 BC"
                onChange={(e) => машина("plate", e.target.value)}
                maxLength={15}
              />
            </Поле>
            <Поле подпись={t("car_class")} className="col-span-2 sm:col-span-4">
              <Чипы
                несколько={false}
                варианты={КЛАССЫ_МАШИН.map((к) => ({ значение: к, подпись: КЛАСС_ПОДПИСЬ[к][язык] }))}
                выбрано={[ф.car.class]}
                onChange={(v) => машина("class", v[0])}
              />
            </Поле>
            <label
              className="col-span-2 flex items-center gap-2 text-sm sm:col-span-4"
              style={{ color: цвет.текст }}
            >
              <input
                type="checkbox"
                checked={ф.car.ac}
                onChange={(e) => машина("ac", e.target.checked)}
                className="h-4 w-4 accent-[var(--accent-fill)]"
              />
              ❄ {t("car_ac")}
            </label>
          </div>
        </Карточка>
      )}

      <Карточка>
        <Заголовок>💵 {t("sec_work")}</Заголовок>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Поле подпись={t("price_day")}>
            <Ввод
              type="number"
              required
              min={5}
              max={5000}
              value={ф.priceDay}
              placeholder="60"
              onChange={(e) => поменять("priceDay", e.target.value)}
            />
          </Поле>
          <Поле подпись={t("hours_day")}>
            <Ввод
              type="number"
              min={1}
              max={24}
              value={ф.hoursPerDay}
              onChange={(e) => поменять("hoursPerDay", e.target.value)}
            />
          </Поле>
          <Поле подпись={t("price_hour")} className="col-span-2 sm:col-span-1">
            <Ввод
              type="number"
              min={1}
              max={1000}
              value={ф.priceHour}
              onChange={(e) => поменять("priceHour", e.target.value)}
            />
          </Поле>
          <Поле подпись={t("includes")} className="col-span-2 sm:col-span-3">
            <Теги
              значения={ф.includes}
              onChange={(v) => поменять("includes", v)}
              пресеты={пресеты}
              placeholder={t("includes_ph")}
            />
          </Поле>
        </div>
      </Карточка>

      <Карточка>
        <Заголовок>📞 {t("sec_contacts")}</Заголовок>
        <div className="grid gap-3 sm:grid-cols-3">
          <Поле подпись={t("phone")}>
            <Ввод
              type="tel"
              required
              value={ф.phone}
              placeholder="+998 90 123 45 67"
              onChange={(e) => поменять("phone", e.target.value)}
            />
          </Поле>
          <Поле подпись={t("telegram")}>
            <Ввод
              value={ф.telegram}
              placeholder="@username"
              onChange={(e) => поменять("telegram", e.target.value)}
              maxLength={40}
            />
          </Поле>
          <Поле подпись={t("whatsapp")}>
            <Ввод
              type="tel"
              value={ф.whatsapp}
              placeholder="+998…"
              onChange={(e) => поменять("whatsapp", e.target.value)}
            />
          </Поле>
        </div>
      </Карточка>

      <Карточка>
        <Заголовок>📷 {t("sec_photos")}</Заголовок>
        <Фотографии
          фото={ф.photos}
          onChange={(v) => поменять("photos", v)}
          подсказка={t(вид === "driver" ? "photos_hint_driver" : "photos_hint_guide")}
          кнопка={t("photo_add")}
          ошибка={t("e_photo")}
        />
      </Карточка>

      {ошибка && (
        <p
          className="mb-3 rounded-xl px-3 py-2 text-sm"
          style={{ background: "rgba(192,57,43,0.08)", color: цвет.ошибка }}
        >
          {ошибка}
        </p>
      )}
      <div className="sticky bottom-3 z-10 flex gap-2">
        {onCancel && (
          <Кнопка type="button" вид="тихая" onClick={onCancel}>
            {t("cancel")}
          </Кнопка>
        )}
        <Кнопка type="submit" вид="золото" disabled={идёт} className="flex-1 shadow-lg">
          {идёт ? "…" : сохранено ? `✓ ${t("saved")}` : анкета ? t("save") : t("send_review")}
        </Кнопка>
      </div>
    </form>
  );
}
