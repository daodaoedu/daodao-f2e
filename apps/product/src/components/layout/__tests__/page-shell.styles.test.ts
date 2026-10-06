import { describe, expect, it } from "vitest";
import {
  PAGE_SHELL_MAIN_CLASS,
  PAGE_SHELL_WRAPPER_CLASS,
  pageShellMainClassName,
  pageShellWrapperClassName,
} from "../page-shell.styles";

describe("PageShell wrapper class", () => {
  // daodao#233 regression guard：`w-screen` 疊上 (with-layout) 的 md:pl-[132px] 會讓整頁右偏 132px
  it("預設不含 w-screen，用 w-full", () => {
    expect(PAGE_SHELL_WRAPPER_CLASS).not.toContain("w-screen");
    expect(PAGE_SHELL_WRAPPER_CLASS).toContain("w-full");
  });

  it("疊加 className 後仍不含 w-screen", () => {
    expect(pageShellWrapperClassName("bg-[#B8E8FD]")).not.toContain("w-screen");
  });

  it("保留 #233 修復後的 wrapper 行為（定位、層級、捲動）", () => {
    for (const cls of ["relative", "min-h-screen", "z-10", "overflow-hidden", "overflow-y-auto"]) {
      expect(PAGE_SHELL_WRAPPER_CLASS).toContain(cls);
    }
  });

  it("wrapper 額外 className 疊加在預設之後", () => {
    expect(pageShellWrapperClassName("bg-[#B8E8FD]")).toBe(
      `${PAGE_SHELL_WRAPPER_CLASS} bg-[#B8E8FD]`
    );
  });
});

describe("PageShell main class", () => {
  it("預設為 448px 單欄置中", () => {
    expect(PAGE_SHELL_MAIN_CLASS).toContain("max-w-[448px]");
    expect(pageShellMainClassName()).toBe(PAGE_SHELL_MAIN_CLASS);
  });

  it("mainClassName 能覆寫互相衝突的 max-w 與 padding", () => {
    const merged = pageShellMainClassName("max-w-5xl pb-[224px] md:pb-[128px]");
    expect(merged).toContain("max-w-5xl");
    expect(merged).not.toContain("max-w-[448px]");
    expect(merged).toContain("pb-[224px]");
    expect(merged).not.toContain("pb-[64px]");
    // 沒被覆寫的維持預設
    expect(merged).toContain("pt-3");
    expect(merged).toContain("md:pt-12");
  });

  it("mainClassName 可把上緣留白歸零（個人頁）", () => {
    const merged = pageShellMainClassName("max-w-[640px] pt-0 md:pt-0");
    expect(merged).toContain("pt-0");
    expect(merged).not.toContain("pt-3");
    expect(merged).not.toContain("md:pt-12");
  });
});
