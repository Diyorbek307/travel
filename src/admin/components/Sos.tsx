import { useCallback, useEffect, useState } from "react";
import { PageHeader, Badge, Card } from "./shared";

/**
 * SOS-сигналы. Турист нажал «Отправить геолокацию» в разделе экстренной
 * помощи — сюда падают его координаты и что о нём известно. Оператор
 * открывает точку на карте и связывается.
 */
interface SosAlert {
  id: string;
  userName: string;
  userInfo: string;
  lat: number;
  lon: number;
  status: "new" | "seen";
  createdAt: string;
}

export default function Sos() {
  const [сигналы, setСигналы] = useState<SosAlert[]>([]);
  const [загрузка, setЗагрузка] = useState(true);

  const подтянуть = useCallback(async () => {
    try {
      const res = await fetch("/api/sos");
      const d = (await res.json()) as { alerts: SosAlert[] };
      setСигналы(d.alerts ?? []);
    } catch {
      setСигналы([]);
    } finally {
      setЗагрузка(false);
    }
  }, []);

  useEffect(() => {
    подтянуть();
    // Экстренное — обновляем чаще, чтобы новый сигнал не ждал перезагрузки.
    const t = setInterval(подтянуть, 20000);
    return () => clearInterval(t);
  }, [подтянуть]);

  return (
    <div>
      <PageHeader title="SOS-сигналы" subtitle="Экстренные обращения туристов с геолокацией" />
      {загрузка ? (
        <p style={{ color: "var(--color-muted)" }}>Загрузка…</p>
      ) : сигналы.length === 0 ? (
        <Card><p style={{ color: "var(--color-muted)" }}>Сигналов нет.</p></Card>
      ) : (
        <div className="grid gap-3">
          {сигналы.map((s) => (
            <Card key={s.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🆘</span>
                    <p className="font-semibold" style={{ color: "var(--color-text)" }}>{s.userName}</p>
                    <Badge label={s.status === "new" ? "новый" : "просмотрен"} color={s.status === "new" ? "rose" : "dim"} />
                  </div>
                  <p className="text-sm mt-1" style={{ color: "var(--color-muted)" }}>{s.userInfo}</p>
                  <p className="text-xs mt-1" style={{ color: "var(--color-muted)" }}>
                    {new Date(s.createdAt).toLocaleString("ru")} · {s.lat.toFixed(5)}, {s.lon.toFixed(5)}
                  </p>
                </div>
                <a
                  href={`https://www.google.com/maps?q=${s.lat},${s.lon}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg px-3 py-2 text-sm font-semibold"
                  style={{ background: "var(--color-accent, #2E7D5A)", color: "#fff" }}
                >
                  📍 На карте
                </a>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
