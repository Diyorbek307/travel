"use client";

import { useЯзык } from "@/lib/i18n";
import { Манифест } from "./effects";

/** Манифест HelloUZ: слова загораются по одному, пока листаешь. */
export default function Manifesto() {
  const { t } = useЯзык();
  return (
    <section id="manifesto" className="paper-grain px-5 py-28 sm:px-8 sm:py-40">
      <div className="mx-auto max-w-5xl">
        <Манифест текст={t("manifesto")} акцент={t("manifesto_accent").split(",")} />
      </div>
    </section>
  );
}
