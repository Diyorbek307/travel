import ResetForm from "./reset-form";

export const dynamic = "force-dynamic";

/** Страница смены пароля по одноразовой ссылке из заявки. */
export default async function ResetPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return <ResetForm token={token ?? ""} />;
}
