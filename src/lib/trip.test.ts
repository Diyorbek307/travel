import { describe, expect, it } from "vitest";
import { кодМаршрута, поДням, разобратьКод, type ТочкаМаршрута } from "./trip";

const т = (id: string, day?: number, kind?: ТочкаМаршрута["kind"]): ТочкаМаршрута => ({
  id,
  day,
  kind,
  name: id,
  city: "Самарканд",
  img: "",
  addedAt: "",
});

describe("маршрут по дням", () => {
  it("старые точки без дня — в первом дне, дни без пропусков", () => {
    const дни = поДням([т("a"), т("b", 3), т("c", 1), т("d", 3)]);
    expect(дни.map((д) => д.map((x) => x.id))).toEqual([
      ["a", "c"],
      ["b", "d"],
    ]);
  });
  it("код ссылки туда и обратно", () => {
    const список = [т("1-reg", 1), т("2-h2", 1, "hotel"), т("6-rs6", 2, "restaurant")];
    expect(разобратьКод(кодМаршрута(список))).toEqual([
      { kind: "place", day: 1, id: "1-reg" },
      { kind: "hotel", day: 1, id: "2-h2" },
      { kind: "restaurant", day: 2, id: "6-rs6" },
    ]);
  });
  it("мусор в коде отбрасывается", () => {
    expect(разобратьКод("x.1.a~p.1.ok~p.zz.b")).toEqual([{ kind: "place", day: 1, id: "ok" }]);
  });
});
