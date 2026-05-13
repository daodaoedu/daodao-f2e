"use client";

// ============================================================================
// Design System Handbook
// Source A: packages/design-tokens/src/  (專案 Token)
// Source B: tokens.json                  (Figma / Tailwind Token)
// ⚠️  = 兩端有差異需確認   ❌ = 專案端缺失
// ============================================================================

import { useState } from "react";

// ---------------------------------------------------------------------------
// COLOR DATA  (from packages/design-tokens/src/colors.ts)
// ---------------------------------------------------------------------------
// Primary Scale + Figma 主色 合併（Logo Cyan 與 Primary Base 為同一色 #16B9B3）
const primaryColors = [
  { name: "Primary Palest", token: "primary.palest", hex: "#E6F7F9", cssVar: "--primary-palest" },
  { name: "Primary Pale", token: "primary.pale", hex: "#D9F3F5", cssVar: "--primary-pale" },
  {
    name: "Primary Lightest",
    token: "primary.lightest",
    hex: "#B3E8E6",
    cssVar: "--primary-lightest",
  },
  {
    name: "Primary Lighter",
    token: "primary.lighter",
    hex: "#66D4CF",
    cssVar: "--primary-lighter",
  },
  {
    name: "Primary Base",
    token: "primary.base",
    hex: "#16B9B3",
    cssVar: "--primary-base",
    isMain: true,
  },
  { name: "Primary Darker", token: "primary.darker", hex: "#0D7A77", cssVar: "--primary-darker" },
  { name: "Text Dark", hex: "#295E5C", cssVar: "--text-dark" },
  { name: "Logo Gray", hex: "#536166", cssVar: "--logo-gray" },
  { name: "Light Cyan", hex: "#A9EDE8", cssVar: "--light-cyan" },
  { name: "Blue", hex: "#99ECFF", cssVar: "--blue" },
  { name: "Light Blue", hex: "#DBF9FF", cssVar: "--light-blue" },
  { name: "Very Light Blue", hex: "#F5FFFD", cssVar: "--very-light-blue" },
  { name: "Red", hex: "#FF6E0B", cssVar: "--red" },
  { name: "Logo Orange", hex: "#FFA10B", cssVar: "--logo-orange" },
  { name: "Logo Yellow", hex: "#F9E41C", cssVar: "--logo-yellow" },
  { name: "Mascot Aqua", hex: "#7DD3E3", cssVar: "--mascot-aqua", token: "mascot.aqua" },
  {
    name: "Mascot Bright Blue",
    hex: "#5CC5E8",
    cssVar: "--mascot-bright-blue",
    token: "mascot.brightBlue",
  },
];
const grayColors = [
  { name: "BG Dark", token: "gray.dark", hex: "#0D3036", cssVar: "--bg-dark" },
  { name: "Light Gray", token: "gray.mid", hex: "#9FB5B8", cssVar: "--light-gray" },
  { name: "BG Gray", token: "gray.light", hex: "#E4EAE9", cssVar: "--bg-gray" },
  { name: "Very Light Gray", token: "gray.veryLight", hex: "#F4F6F6", cssVar: "--very-light-gray" },
  { name: "White", token: "gray.white", hex: "#FFFFFF", cssVar: "--white" },
];

// ---------------------------------------------------------------------------
// TYPOGRAPHY DATA
// ---------------------------------------------------------------------------
const fontFamilies = [
  { name: "Inter", value: "Inter, sans-serif", token: "fonts.heading / fonts.body" },
  { name: "Noto Sans TC", value: '"Noto Sans TC", sans-serif', token: "CSS: --font-sans" },
  { name: "JetBrains Mono", value: '"JetBrains Mono", monospace', token: "fonts.mono", mono: true },
  {
    name: "Anonymous Pro",
    value: '"Anonymous Pro", monospace',
    token: "CSS: .anonymous-pro",
    mono: true,
  },
];

// tokens.json has 9xl; project only has up to 5xl → 6xl~9xl marked ⚠️
const fontSizes = [
  { name: "xs", px: 12, rem: "0.75rem", token: "fontSizes.xs", inProject: true },
  { name: "sm", px: 14, rem: "0.875rem", token: "fontSizes.sm", inProject: true },
  { name: "base", px: 16, rem: "1rem", token: "fontSizes.base", inProject: true },
  { name: "lg", px: 18, rem: "1.125rem", token: "fontSizes.lg", inProject: true },
  { name: "xl", px: 20, rem: "1.25rem", token: "fontSizes.xl", inProject: true },
  { name: "2xl", px: 24, rem: "1.5rem", token: "fontSizes.2xl", inProject: true },
  { name: "3xl", px: 30, rem: "1.875rem", token: "fontSizes.3xl", inProject: true },
  { name: "4xl", px: 36, rem: "2.25rem", token: "fontSizes.4xl", inProject: true },
  { name: "5xl", px: 48, rem: "3rem", token: "fontSizes.5xl", inProject: true },
  { name: "6xl", px: 60, rem: "3.75rem", token: "type.size6xl", inProject: false },
  { name: "7xl", px: 72, rem: "4.5rem", token: "type.size7xl", inProject: false },
  { name: "8xl", px: 96, rem: "6rem", token: "type.size8xl", inProject: false },
  { name: "9xl", px: 128, rem: "8rem", token: "type.size9xl", inProject: false },
];

// tokens.json has 9 weights; project only has 4 → missing ones marked ⚠️
const fontWeights = [
  { name: "Thin", value: 100, token: "type.weightThin", inProject: false },
  { name: "Extralight", value: 200, token: "type.weightExtralight", inProject: false },
  { name: "Light", value: 300, token: "type.weightLight", inProject: false },
  { name: "Normal", value: 400, token: "fontWeights.normal", inProject: true },
  { name: "Medium", value: 500, token: "fontWeights.medium", inProject: true },
  { name: "Semibold", value: 600, token: "fontWeights.semibold", inProject: true },
  { name: "Bold", value: 700, token: "fontWeights.bold", inProject: true },
  { name: "Extrabold", value: 800, token: "type.weightExtrabold", inProject: false },
  { name: "Black", value: 900, token: "type.weightBlack", inProject: false },
];

const lineHeights = [
  { name: "none", ratio: 1, token: "lineHeights.none" },
  { name: "tight", ratio: 1.25, token: "lineHeights.tight" },
  { name: "snug", ratio: 1.375, token: "lineHeights.snug" },
  { name: "normal", ratio: 1.5, token: "lineHeights.normal" },
  { name: "relaxed", ratio: 1.625, token: "lineHeights.relaxed" },
  { name: "loose", ratio: 2, token: "lineHeights.loose" },
];

// tokens.json tracking values — completely missing from project ❌
const letterSpacings = [
  { name: "tighter", value: -0.8, token: "type.trackingTighter" },
  { name: "tight", value: -0.4, token: "type.trackingTight" },
  { name: "normal", value: 0, token: "type.trackingNormal" },
  { name: "wide", value: 0.4, token: "type.trackingWide" },
  { name: "wider", value: 0.8, token: "type.trackingWider" },
  { name: "widest", value: 1.6, token: "type.trackingWidest" },
];

// ---------------------------------------------------------------------------
// RADIUS  — side-by-side comparison
// ---------------------------------------------------------------------------
const radiusComparison = [
  { name: "none", projectPx: 0, tokensPx: 0 },
  { name: "sm", projectPx: 4, tokensPx: 2 },
  { name: "base / DEFAULT", projectPx: 8, tokensPx: 4 },
  { name: "md", projectPx: 12, tokensPx: 6 },
  { name: "lg", projectPx: 16, tokensPx: 8 },
  { name: "xl", projectPx: 20, tokensPx: 12 },
  { name: "2xl", projectPx: 24, tokensPx: 16 },
  { name: "3xl", projectPx: 32, tokensPx: 24 },
  { name: "full", projectPx: 9999, tokensPx: 999 },
];

// ---------------------------------------------------------------------------
// SPACING  — project stops at 128px; tokens.json goes to 384px
// ---------------------------------------------------------------------------
const spacingProject = [
  { k: "0", px: 0 },
  { k: "0.5", px: 2 },
  { k: "1", px: 4 },
  { k: "1.5", px: 6 },
  { k: "2", px: 8 },
  { k: "2.5", px: 10 },
  { k: "3", px: 12 },
  { k: "3.5", px: 14 },
  { k: "4", px: 16 },
  { k: "5", px: 20 },
  { k: "6", px: 24 },
  { k: "7", px: 28 },
  { k: "8", px: 32 },
  { k: "9", px: 36 },
  { k: "10", px: 40 },
  { k: "11", px: 44 },
  { k: "12", px: 48 },
  { k: "14", px: 56 },
  { k: "16", px: 64 },
  { k: "20", px: 80 },
  { k: "24", px: 96 },
  { k: "28", px: 112 },
  { k: "32", px: 128 },
];
const spacingTokensOnly = [
  { k: "36", px: 144 },
  { k: "40", px: 160 },
  { k: "44", px: 176 },
  { k: "48", px: 192 },
  { k: "52", px: 208 },
  { k: "56", px: 224 },
  { k: "60", px: 240 },
  { k: "64", px: 256 },
  { k: "72", px: 288 },
  { k: "80", px: 320 },
  { k: "96", px: 384 },
];

// ---------------------------------------------------------------------------
// LAYOUT  ❌ not in project tokens
// ---------------------------------------------------------------------------
const breakpoints = [
  { name: "sm", px: 640 },
  { name: "md", px: 768 },
  { name: "lg", px: 1024 },
  { name: "xl", px: 1280 },
  { name: "2xl", px: 1536 },
];
const containers = [
  { name: "xs", px: 320 },
  { name: "sm", px: 384 },
  { name: "md", px: 448 },
  { name: "lg", px: 512 },
  { name: "xl", px: 576 },
  { name: "2xl", px: 672 },
  { name: "3xl", px: 768 },
  { name: "4xl", px: 896 },
  { name: "5xl", px: 1024 },
  { name: "6xl", px: 1152 },
  { name: "7xl", px: 1280 },
];

// ---------------------------------------------------------------------------
// SHADOW  ❌ not in project tokens
// ---------------------------------------------------------------------------
const shadows = [
  { name: "none", css: "none" },
  { name: "2xs", css: "0 1px 0 0 rgba(13,0,0,0.05)" },
  { name: "xs", css: "0 1px 2px 0 rgba(13,0,0,0.05)" },
  { name: "sm", css: "0 1px 3px 0 rgba(26,0,0,0.1), 0 1px 2px -1px rgba(26,0,0,0.1)" },
  { name: "DEFAULT", css: "0 4px 6px -1px rgba(26,0,0,0.1), 0 2px 4px -2px rgba(26,0,0,0.1)" },
  { name: "md", css: "0 10px 15px -3px rgba(26,0,0,0.1), 0 4px 6px -4px rgba(26,0,0,0.1)" },
  { name: "lg", css: "0 20px 25px -5px rgba(26,0,0,0.1), 0 8px 10px -6px rgba(26,0,0,0.1)" },
  { name: "xl", css: "0 20px 25px -5px rgba(26,0,0,0.1), 0 8px 10px -6px rgba(26,0,0,0.1)" },
  { name: "2xl", css: "0 25px 50px -12px rgba(64,0,0,0.25)" },
  { name: "inner", css: "inset 0 2px 4px 0 rgba(13,0,0,0.05)" },
];

// ---------------------------------------------------------------------------
// OTHER TOKENS  ❌ not in project tokens
// ---------------------------------------------------------------------------
const opacities = [0, 5, 10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90, 95, 100];
const blurs = [
  { name: "none", px: 0 },
  { name: "sm", px: 4 },
  { name: "DEFAULT", px: 8 },
  { name: "md", px: 12 },
  { name: "lg", px: 16 },
  { name: "xl", px: 24 },
  { name: "2xl", px: 40 },
  { name: "3xl", px: 64 },
];
const borderWidths = [
  { name: "0", px: 0 },
  { name: "DEFAULT", px: 1 },
  { name: "2", px: 2 },
  { name: "4", px: 4 },
  { name: "8", px: 8 },
];

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------
function isLight(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}

// ---------------------------------------------------------------------------
// UI PRIMITIVES
// ---------------------------------------------------------------------------
function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-2xl font-bold text-[#295E5C] mb-1">{children}</h2>;
}
function SectionDesc({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={`text-sm text-gray-400 mb-6 ${className ?? ""}`}>{children}</p>;
}
function SubTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{children}</h3>
  );
}
function TokenBadge({ children, dim }: { children: string; dim?: boolean }) {
  return (
    <code
      className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${dim ? "bg-orange-50 text-orange-400" : "bg-gray-100 text-gray-500"}`}
    >
      {children}
    </code>
  );
}
function MissingBadge({ label = "tokens.json only" }: { label?: string }) {
  return (
    <span className="text-[9px] font-bold bg-orange-100 text-orange-500 px-1.5 py-0.5 rounded-full uppercase tracking-wide">
      ⚠ {label}
    </span>
  );
}

function ColorSwatch({
  hex,
  name,
  sub,
  badge,
}: {
  hex: string;
  name: string;
  sub?: string;
  badge?: string;
}) {
  const light = isLight(hex);
  return (
    <div
      className="rounded-xl overflow-hidden shadow-sm"
      style={{
        border:
          hex === "#FFFFFF" || hex === "#F5FFFD" || hex === "#F4F6F6" || hex === "#FAFAFA"
            ? "1px solid #d1d5db"
            : "1px solid transparent",
      }}
    >
      <div
        className="h-14 w-full flex items-end px-2.5 pb-1.5 relative"
        style={{ backgroundColor: hex }}
      >
        {badge && (
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded-full absolute top-1.5 right-1.5"
            style={{
              backgroundColor: light ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.25)",
              color: light ? "#1A2B3C" : "#FFF",
            }}
          >
            {badge}
          </span>
        )}
      </div>
      <div className="bg-white px-2.5 py-1.5">
        <div className="text-[11px] font-semibold text-gray-700 leading-tight">{name}</div>
        {sub && <div className="text-[9px] text-gray-400 mt-0.5">{sub}</div>}
        <div className="font-mono text-[10px] text-gray-400 mt-0.5">{hex}</div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// NAV ITEMS
// ---------------------------------------------------------------------------
const NAV = [
  { id: "color", label: "Color 色彩" },
  { id: "typography", label: "Typography 字體" },
  { id: "radius", label: "Radius 圓角" },
  { id: "spacing", label: "Spacing 間距" },
  { id: "layout", label: "Layout 版型" },
  { id: "shadow", label: "Shadow 陰影" },
  { id: "other", label: "Other 其他" },
];

// ===========================================================================
// PAGE
// ===========================================================================
export default function DesignSystemPage() {
  const [activeNav, setActiveNav] = useState("color");

  const scrollTo = (id: string) => {
    setActiveNav(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-[#F4F6F6]">
      {/* ── Sticky Nav ──────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 flex items-center gap-2 h-12 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-2 mr-4 shrink-0">
            <div className="w-5 h-5 rounded bg-[#16B9B3]" />
            <span className="text-xs font-bold text-[#16B9B3] uppercase tracking-widest">
              DaoDao DS
            </span>
          </div>
          {NAV.map((n) => (
            <button
              type="button"
              key={n.id}
              onClick={() => scrollTo(n.id)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
                activeNav === n.id ? "bg-[#16B9B3] text-white" : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {n.label}
            </button>
          ))}
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-12 space-y-20">
        {/* ── Header ───────────────────────────────────────────── */}
        <header className="space-y-2">
          <h1 className="text-4xl font-bold text-[#295E5C]">Design System Handbook</h1>
          <p className="text-sm text-gray-400 max-w-xl">
            設計端與開發端共同確認的 Token 手冊。 來源：
            <code className="text-xs bg-gray-200 px-1 rounded">packages/design-tokens/src/</code>
            　對照：
            <code className="text-xs bg-orange-100 text-orange-500 px-1 rounded">tokens.json</code>
          </p>
          <div className="flex gap-3 pt-1 flex-wrap">
            <span className="text-xs flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-1">
              <span className="w-2 h-2 rounded-full bg-[#16B9B3] inline-block" />
              專案 Token（已實作）
            </span>
            <span className="text-xs flex items-center gap-1.5 bg-orange-50 border border-orange-200 rounded-full px-3 py-1">
              <span className="w-2 h-2 rounded-full bg-orange-400 inline-block" />⚠ tokens.json
              only（待確認是否補入）
            </span>
          </div>
        </header>

        {/* ================================================================
            COLOR
        ================================================================ */}
        <section id="color">
          <SectionTitle>Color 色彩</SectionTitle>
          <SectionDesc>
            來源：packages/design-tokens/src/colors.ts ＋ Figma Design System Color 頁面
          </SectionDesc>

          <SubTitle>主色 Primary Scale</SubTitle>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-10">
            {primaryColors.map((c) => (
              <div key={c.hex}>
                <ColorSwatch
                  hex={c.hex}
                  name={c.name}
                  sub={c.cssVar}
                  badge={c.isMain ? "Base" : undefined}
                />
                {c.token && (
                  <div className="mt-1.5">
                    <TokenBadge>{c.token}</TokenBadge>
                  </div>
                )}
              </div>
            ))}
          </div>

          <SubTitle>灰階 Grayscale</SubTitle>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-10">
            {grayColors.map((c) => (
              <div key={c.token}>
                <ColorSwatch hex={c.hex} name={c.name} sub={c.cssVar} />
                <div className="mt-1.5">
                  <TokenBadge>{c.token}</TokenBadge>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ================================================================
            TYPOGRAPHY
        ================================================================ */}
        <section id="typography">
          <SectionTitle>Typography 字體</SectionTitle>
          <SectionDesc>
            來源：packages/design-tokens/src/typography.ts　⚠ 灰底 = tokens.json 有但專案缺失
          </SectionDesc>

          {/* Font Families */}
          <SubTitle>字型 Font Families</SubTitle>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-10">
            {fontFamilies.map((f, i) => (
              <div
                key={f.name}
                className={`flex items-center gap-4 px-6 py-4 ${i < fontFamilies.length - 1 ? "border-b border-gray-100" : ""}`}
              >
                <div className="w-52 shrink-0">
                  <div className="text-xs font-semibold text-gray-600">{f.name}</div>
                  <TokenBadge>{f.token}</TokenBadge>
                </div>
                <div className="text-2xl text-gray-700 flex-1" style={{ fontFamily: f.value }}>
                  Aa 漢字 0123
                </div>
                <code className="text-[10px] text-gray-300 hidden sm:block shrink-0">
                  {f.value}
                </code>
              </div>
            ))}
          </div>

          {/* Font Sizes */}
          <SubTitle>字級 Font Size Scale</SubTitle>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-10">
            {[...fontSizes].reverse().map((s, i, arr) => (
              <div
                key={s.name}
                className={`flex items-center gap-4 px-6 py-2 ${!s.inProject ? "bg-orange-50/60" : ""} ${i < arr.length - 1 ? "border-b border-gray-50" : ""}`}
              >
                <div className="w-32 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <TokenBadge dim={!s.inProject}>{s.name}</TokenBadge>
                    {!s.inProject && <MissingBadge />}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1">
                    {s.px}px / {s.rem}
                  </div>
                </div>
                <div
                  className="text-gray-700 flex-1 truncate"
                  style={{ fontSize: Math.min(s.px, 72), lineHeight: 1.3 }}
                >
                  Dao dao 島島阿學
                </div>
              </div>
            ))}
          </div>

          {/* Font Weights */}
          <SubTitle>字重 Font Weights</SubTitle>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-10">
            {fontWeights.map((w) => (
              <div
                key={w.token}
                className={`rounded-xl p-4 shadow-sm ${w.inProject ? "bg-white" : "bg-orange-50 border border-orange-100"}`}
              >
                <div className="text-xl text-gray-700 mb-2" style={{ fontWeight: w.value }}>
                  Aa 漢字
                </div>
                <div className="text-xs font-semibold text-gray-600">{w.name}</div>
                <div className="flex flex-col gap-1 mt-1">
                  <TokenBadge dim={!w.inProject}>{w.token}</TokenBadge>
                  <span className="text-[10px] text-gray-400">{w.value}</span>
                  {!w.inProject && <MissingBadge />}
                </div>
              </div>
            ))}
          </div>

          {/* Line Heights */}
          <SubTitle>行高 Line Heights（ratio）</SubTitle>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
            {lineHeights.map((lh) => (
              <div key={lh.token} className="bg-white rounded-xl p-4 shadow-sm">
                <div
                  className="text-sm text-gray-700 mb-3 border-l-2 border-[#16B9B3] pl-3"
                  style={{ lineHeight: lh.ratio }}
                >
                  DaoDao 道道學習平台
                  <br />
                  讓學習成為習慣的好夥伴
                </div>
                <div className="text-xs font-semibold text-gray-600">{lh.name}</div>
                <div className="flex items-center gap-2 mt-1">
                  <TokenBadge>{lh.token}</TokenBadge>
                  <span className="text-[10px] text-gray-400">{lh.ratio}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Letter Spacing */}
          <SubTitle>
            字距 Letter Spacing{" "}
            <span className="ml-2 text-[10px] text-orange-400 font-normal normal-case">
              ⚠ tokens.json 有，專案缺失
            </span>
          </SubTitle>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-2">
            {letterSpacings.map((ls) => (
              <div
                key={ls.token}
                className="bg-orange-50 border border-orange-100 rounded-xl p-4 shadow-sm"
              >
                <div className="text-base text-gray-700 mb-2" style={{ letterSpacing: ls.value }}>
                  DAODAO 道道
                </div>
                <div className="text-xs font-semibold text-gray-600">{ls.name}</div>
                <div className="flex items-center gap-2 mt-1">
                  <TokenBadge dim>{ls.token}</TokenBadge>
                  <span className="text-[10px] text-gray-400">{ls.value}px</span>
                </div>
                <MissingBadge />
              </div>
            ))}
          </div>
        </section>

        {/* ================================================================
            RADIUS
        ================================================================ */}
        <section id="radius">
          <SectionTitle>Border Radius 圓角</SectionTitle>
          <SectionDesc>⚠ 專案與 tokens.json 的數值約差 2 倍，需設計端確認以哪份為主。</SectionDesc>

          {/* Comparison table */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8">
            <div className="grid grid-cols-4 gap-0 text-xs font-bold text-gray-400 uppercase tracking-widest px-6 py-3 border-b border-gray-100 bg-gray-50">
              <span>Token</span>
              <span className="text-center">專案 (radius.ts)</span>
              <span className="text-center text-orange-400">tokens.json</span>
              <span className="text-center">差異</span>
            </div>
            {radiusComparison.map((r, i) => (
              <div
                key={r.name}
                className={`grid grid-cols-4 items-center px-6 py-3 ${i < radiusComparison.length - 1 ? "border-b border-gray-50" : ""}`}
              >
                <code className="text-xs text-gray-600 font-mono">{r.name}</code>
                {/* Project swatch */}
                <div className="flex items-center justify-center gap-2">
                  <div
                    className="w-8 h-8 bg-[#16B9B3]/20 border-2 border-[#16B9B3]/40"
                    style={{ borderRadius: r.projectPx >= 9999 ? "50%" : r.projectPx }}
                  />
                  <span className="text-xs text-gray-500">
                    {r.projectPx >= 9999 ? "full" : `${r.projectPx}px`}
                  </span>
                </div>
                {/* tokens.json swatch */}
                <div className="flex items-center justify-center gap-2">
                  <div
                    className="w-8 h-8 bg-orange-200/50 border-2 border-orange-300/50"
                    style={{ borderRadius: r.tokensPx >= 999 ? "50%" : r.tokensPx }}
                  />
                  <span className="text-xs text-orange-400">
                    {r.tokensPx >= 999 ? "full" : `${r.tokensPx}px`}
                  </span>
                </div>
                {/* diff */}
                <div className="text-center">
                  {r.projectPx === r.tokensPx || (r.projectPx >= 9999 && r.tokensPx >= 999) ? (
                    <span className="text-xs text-green-500">✓ 一致</span>
                  ) : (
                    <span className="text-xs text-orange-400 font-medium">
                      {r.projectPx >= 9999
                        ? "—"
                        : `${r.projectPx - r.tokensPx > 0 ? "+" : ""}${r.projectPx - r.tokensPx}px`}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ================================================================
            SPACING
        ================================================================ */}
        <section id="spacing">
          <SectionTitle>Spacing 間距</SectionTitle>
          <SectionDesc>基於 4px grid。專案 Token 到 128px；tokens.json 擴展到 384px。</SectionDesc>

          <SubTitle>專案已定義（spacing.ts）</SubTitle>
          <div className="flex flex-wrap gap-2 mb-6">
            {spacingProject.map((s) => (
              <div
                key={s.k}
                className="flex flex-col items-center gap-1 bg-white rounded-lg p-2 shadow-sm min-w-[52px]"
              >
                <div
                  className="bg-[#16B9B3]/30 border border-[#16B9B3]/40 rounded"
                  style={{ width: Math.max(4, Math.min(s.px, 64)), height: 16 }}
                />
                <span className="text-[10px] font-mono text-gray-600">{s.k}</span>
                <span className="text-[9px] text-gray-400">{s.px}px</span>
              </div>
            ))}
          </div>

          <SubTitle>
            tokens.json 額外擴展{" "}
            <span className="ml-2 text-[10px] text-orange-400 font-normal normal-case">
              ⚠ 專案缺失
            </span>
          </SubTitle>
          <div className="flex flex-wrap gap-2">
            {spacingTokensOnly.map((s) => (
              <div
                key={s.k}
                className="flex flex-col items-center gap-1 bg-orange-50 border border-orange-100 rounded-lg p-2 shadow-sm min-w-[52px]"
              >
                <div
                  className="bg-orange-200/50 border border-orange-300/40 rounded"
                  style={{ width: 64, height: 16 }}
                />
                <span className="text-[10px] font-mono text-orange-500">{s.k}</span>
                <span className="text-[9px] text-orange-400">{s.px}px</span>
              </div>
            ))}
          </div>
        </section>

        {/* ================================================================
            LAYOUT
        ================================================================ */}
        <section id="layout">
          <SectionTitle>Layout 版型</SectionTitle>
          <SectionDesc className="flex items-center gap-2">
            tokens.json 定義，專案尚未納入 design-tokens <MissingBadge label="tokens.json only" />
          </SectionDesc>

          <SubTitle>Breakpoints</SubTitle>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8">
            {breakpoints.map((b, i) => (
              <div
                key={b.name}
                className={`flex items-center gap-4 px-6 py-3 ${i < breakpoints.length - 1 ? "border-b border-gray-50" : ""}`}
              >
                <code className="w-12 text-sm font-mono text-gray-600 shrink-0">{b.name}</code>
                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#16B9B3]/40 rounded-full"
                    style={{ width: `${(b.px / 1536) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-mono text-gray-500 shrink-0 w-16 text-right">
                  {b.px}px
                </span>
                <TokenBadge
                  dim
                >{`layout.breakpoint${b.name.charAt(0).toUpperCase()}${b.name.slice(1)}`}</TokenBadge>
              </div>
            ))}
          </div>

          <SubTitle>Container Max Widths</SubTitle>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {containers.map((c, i) => (
              <div
                key={c.name}
                className={`flex items-center gap-4 px-6 py-3 ${i < containers.length - 1 ? "border-b border-gray-50" : ""}`}
              >
                <code className="w-12 text-sm font-mono text-gray-600 shrink-0">{c.name}</code>
                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#66D4CF]/50 rounded-full"
                    style={{ width: `${(c.px / 1280) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-mono text-gray-500 shrink-0 w-16 text-right">
                  {c.px}px
                </span>
                <TokenBadge
                  dim
                >{`layout.container${c.name.charAt(0).toUpperCase()}${c.name.slice(1)}`}</TokenBadge>
              </div>
            ))}
          </div>
        </section>

        {/* ================================================================
            SHADOW
        ================================================================ */}
        <section id="shadow">
          <SectionTitle>Shadow 陰影</SectionTitle>
          <SectionDesc>
            tokens.json 定義，專案尚未納入 design-tokens <MissingBadge label="tokens.json only" />
          </SectionDesc>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {shadows.map((s) => (
              <div
                key={s.name}
                className="bg-white rounded-xl p-4 flex flex-col items-center gap-3"
              >
                <div
                  className="w-14 h-14 rounded-xl bg-white"
                  style={{
                    boxShadow: s.css === "none" ? "none" : s.css,
                    border: "1px solid #f3f4f6",
                  }}
                />
                <div className="text-center">
                  <code className="text-xs font-mono text-gray-600">{s.name}</code>
                  <div className="mt-1">
                    <TokenBadge dim>{`shadow.${s.name}`}</TokenBadge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ================================================================
            OTHER
        ================================================================ */}
        <section id="other">
          <SectionTitle>Other Tokens</SectionTitle>
          <SectionDesc>
            tokens.json 定義，專案尚未納入 design-tokens <MissingBadge label="tokens.json only" />
          </SectionDesc>

          {/* Opacity */}
          <SubTitle>Opacity 透明度</SubTitle>
          <div className="flex flex-wrap gap-2 mb-10">
            {opacities.map((o) => (
              <div
                key={o}
                className="flex flex-col items-center gap-1.5 bg-white rounded-xl p-3 shadow-sm min-w-[52px]"
              >
                <div
                  className="w-8 h-8 rounded-lg border border-gray-200 bg-[#16B9B3]"
                  style={{ opacity: o / 100 }}
                />
                <span className="text-[10px] font-mono text-orange-500">{o}%</span>
                <TokenBadge dim>{`opacity${o}`}</TokenBadge>
              </div>
            ))}
          </div>

          {/* Blur */}
          <SubTitle>Blur 模糊</SubTitle>
          <div className="flex flex-wrap gap-3 mb-10">
            {blurs.map((b) => (
              <div
                key={b.name}
                className="flex flex-col items-center gap-2 bg-white rounded-xl p-3 shadow-sm min-w-[72px]"
              >
                <div className="w-12 h-12 rounded-lg relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#16B9B3] to-[#66D4CF]" />
                  <div
                    className="absolute inset-0"
                    style={{
                      backdropFilter: `blur(${b.px}px)`,
                      WebkitBackdropFilter: `blur(${b.px}px)`,
                    }}
                  />
                </div>
                <code className="text-[11px] font-mono text-orange-500">{b.name}</code>
                <span className="text-[9px] text-gray-400">{b.px}px</span>
                <TokenBadge
                  dim
                >{`blur${b.name.charAt(0).toUpperCase() + b.name.slice(1)}`}</TokenBadge>
              </div>
            ))}
          </div>

          {/* Border Width */}
          <SubTitle>Border Width 邊框寬度</SubTitle>
          <div className="flex flex-wrap gap-3">
            {borderWidths.map((bw) => (
              <div
                key={bw.name}
                className="flex flex-col items-center gap-2 bg-white rounded-xl p-4 shadow-sm min-w-[80px]"
              >
                <div
                  className="w-12 h-12 rounded-lg border-[#16B9B3]"
                  style={{ borderWidth: bw.px, borderStyle: "solid", borderColor: "#16B9B3" }}
                />
                <code className="text-[11px] font-mono text-orange-500">{bw.name}</code>
                <span className="text-[9px] text-gray-400">{bw.px}px</span>
                <TokenBadge dim>{`borderWidth${bw.name}`}</TokenBadge>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-xs text-gray-300 pb-4 border-t border-gray-200 pt-6 space-y-1">
          <div>DaoDao Design System Handbook</div>
          <div>
            Source A: <code>packages/design-tokens/src/</code>　Source B: <code>tokens.json</code>
            　Figma: DaoDao-Design-System
          </div>
        </footer>
      </div>
    </div>
  );
}
