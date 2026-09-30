import { describe, expect, it } from "vitest";
import { вСкрипт } from "./seo";

describe("вСкрипт", () => {
  it("не даёт закрыть <script> из данных", () => {
    const s = вСкрипт({ description: "</script><script>alert(1)</script>" });
    expect(s).not.toContain("</script>");
    expect(s).not.toContain("<");
    // и остаётся тем же JSON
    expect(JSON.parse(s).description).toBe("</script><script>alert(1)</script>");
  });
});
