import { describe, expect, it } from "vitest";
import { formatCurrency, slugify } from "@/lib/utils";

describe("marketplace utils", () => {
  it("formats AZN currency for Azerbaijani locale", () => {
    expect(formatCurrency(2190)).toContain("2.190");
  });

  it("creates SEO friendly Azerbaijani slugs", () => {
    expect(slugify("İkinci əl telefonlar və kompüterlər")).toBe(
      "ikinci-el-telefonlar-ve-komputerler",
    );
  });
});
