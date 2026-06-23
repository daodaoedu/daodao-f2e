import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const componentsDir = resolve(__dirname, "../../components");

describe("action-maker new-year text removal", () => {
  it("action-maker-intro does not contain '總是覺得規劃新年目標很難嗎'", () => {
    const content = readFileSync(resolve(componentsDir, "action-maker-intro.tsx"), "utf-8");
    expect(content).not.toContain("總是覺得規劃新年目標很難嗎");
  });

  it("action-maker-topic does not contain '新的一年，我想要'", () => {
    const content = readFileSync(resolve(componentsDir, "action-maker-topic.tsx"), "utf-8");
    expect(content).not.toContain("新的一年，我想要");
  });

  it("action-maker-category does not contain '新的一年，你想抓住哪顆星'", () => {
    const content = readFileSync(resolve(componentsDir, "action-maker-category.tsx"), "utf-8");
    expect(content).not.toContain("新的一年，你想抓住哪顆星");
  });
});
