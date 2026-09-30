import { СтраницаЗаписи, метаСтраницы, type ПараметрыСтраницы } from "@/components/seo-view";

// Страница для поисковиков и превью ссылок; сама запись — в приложении.
export const revalidate = 3600;

export function generateMetadata(p: ПараметрыСтраницы) {
  return метаСтраницы("hotel", p);
}

export default function Page(p: ПараметрыСтраницы) {
  return <СтраницаЗаписи вид="hotel" {...p} />;
}
