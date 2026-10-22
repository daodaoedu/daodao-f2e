import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import * as ts from "typescript";
import { describe, expect, it } from "vitest";
import enMessages from "../../../packages/i18n/src/locales/en";
import zhTWMessages from "../../../packages/i18n/src/locales/zh-TW";

/**
 * App 用到的翻譯 key 兩個語系都要有、插值參數要對得上（daodao#360）。
 *
 * App 的翻譯函式找不到 key 時直接回傳 key 本身、沒傳的 {placeholder} 原樣顯示
 * （apps/mobile/i18n/index.tsx），畫面就出現 `practice.mobile_frequency_daily`、`{max}`。
 * 網頁的 locale-key-parity 只比對兩語系 key 集合是否一致，兩邊都缺的 key 抓不到。
 *
 * 檢查方式：用 TypeScript AST 找 `const x = useMobileTranslation("ns")` 宣告的翻譯函式，
 * - 整個 apps/mobile：字面 key 呼叫 `x("key", { ... })` → key 兩語系都要有；字串裡的
 *   {placeholder} 都要由呼叫傳入
 * - 編輯頁（STRICT_FILES）：另檢查 `labelKey`／`descriptionKey` 這類動態 key，以及
 *   傳了參數但字串沒用到（例：傳 count 但字串只有「天」，數字就消失）
 */

type Messages = Record<string, unknown>;

const MOBILE_ROOT = resolve(__dirname, "..");
const SKIP_DIRS = new Set([
  "node_modules",
  "generated",
  "__tests__",
  ".expo",
  "dist",
  "ios",
  "android",
]);
const STRICT_FILES = ["app/practices/[id]/edit.tsx"];
const DYNAMIC_KEY_PROPS = new Set(["labelKey", "descriptionKey"]);

const locales: Array<[string, Messages]> = [
  ["zh-TW", zhTWMessages as Messages],
  ["en", enMessages as Messages],
];

const readMessage = (messages: Messages, key: string): string | undefined => {
  const value = key.split(".").reduce<unknown>((current, part) => {
    if (current && typeof current === "object" && part in current) {
      return (current as Messages)[part];
    }
    return undefined;
  }, messages);
  return typeof value === "string" ? value : undefined;
};

const placeholdersOf = (message: string) =>
  [...message.matchAll(/\{(\w+)\}/g)].map((match) => match[1] as string);

const listSourceFiles = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    if (SKIP_DIRS.has(name)) return [];
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return listSourceFiles(path);
    return /\.tsx?$/.test(name) && !name.endsWith(".d.ts") ? [path] : [];
  });

interface TranslatorDecl {
  name: string;
  namespace: string;
  scope: ts.Node;
}

interface KeyUsage {
  file: string;
  line: number;
  key: string;
  /** 呼叫時傳入的參數名；null 表示傳的不是物件字面值（例：變數、spread），無法比對 */
  values: string[] | null;
  dynamic: boolean;
}

const isScope = (node: ts.Node) => ts.isSourceFile(node) || ts.isFunctionLike(node);

const enclosingScope = (node: ts.Node): ts.Node => {
  let current = node.parent;
  while (current && !isScope(current)) current = current.parent;
  return current ?? node.getSourceFile();
};

const stringLiteralText = (node: ts.Node | undefined) =>
  node && (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node))
    ? node.text
    : undefined;

const objectLiteralKeys = (node: ts.Expression | undefined): string[] | null => {
  if (!node) return [];
  if (!ts.isObjectLiteralExpression(node)) return null;
  const keys: string[] = [];
  for (const prop of node.properties) {
    if (ts.isSpreadAssignment(prop)) return null;
    if (prop.name && (ts.isIdentifier(prop.name) || ts.isStringLiteral(prop.name))) {
      keys.push(prop.name.text);
    }
  }
  return keys;
};

/** 找出檔案裡所有翻譯 key 的使用處（含命名空間）。 */
const collectKeyUsages = (file: string, source: string): KeyUsage[] => {
  const sf = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const decls: TranslatorDecl[] = [];
  const calls: ts.CallExpression[] = [];
  const keyProps: ts.PropertyAssignment[] = [];

  const visit = (node: ts.Node) => {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.initializer &&
      ts.isCallExpression(node.initializer) &&
      ts.isIdentifier(node.initializer.expression) &&
      node.initializer.expression.text === "useMobileTranslation"
    ) {
      const [nsArg] = node.initializer.arguments;
      decls.push({
        name: node.name.text,
        namespace: stringLiteralText(nsArg) ?? "",
        scope: enclosingScope(node),
      });
    }
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) calls.push(node);
    if (
      ts.isPropertyAssignment(node) &&
      ts.isIdentifier(node.name) &&
      DYNAMIC_KEY_PROPS.has(node.name.text) &&
      stringLiteralText(node.initializer) !== undefined
    ) {
      keyProps.push(node);
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);

  const resolveTranslator = (node: ts.Node, name: string) => {
    for (let scope: ts.Node | undefined = node; scope; scope = scope.parent) {
      const decl = decls.find((d) => d.name === name && d.scope === scope);
      if (decl) return decl;
    }
    return undefined;
  };
  const lineOf = (node: ts.Node) => sf.getLineAndCharacterOfPosition(node.getStart()).line + 1;
  const withNamespace = (namespace: string, key: string) =>
    namespace ? `${namespace}.${key}` : key;

  const usages: KeyUsage[] = [];
  for (const call of calls) {
    const decl = resolveTranslator(call, (call.expression as ts.Identifier).text);
    const key = stringLiteralText(call.arguments[0]);
    if (!decl || key === undefined) continue;
    usages.push({
      file,
      line: lineOf(call),
      key: withNamespace(decl.namespace, key),
      values: objectLiteralKeys(call.arguments[1]),
      dynamic: false,
    });
  }
  // `labelKey: "..."` 由同檔案的 `t(option.labelKey)` 翻譯，命名空間取該處的 t
  for (const prop of keyProps) {
    const decl = resolveTranslator(prop, "t") ?? decls.find((d) => d.name === "t");
    if (!decl) continue;
    usages.push({
      file,
      line: lineOf(prop),
      key: withNamespace(decl.namespace, stringLiteralText(prop.initializer) as string),
      values: null,
      dynamic: true,
    });
  }
  return usages;
};

const mobileUsages = listSourceFiles(MOBILE_ROOT).flatMap((path) =>
  collectKeyUsages(relative(MOBILE_ROOT, path), readFileSync(path, "utf8"))
);
const isStrict = (usage: KeyUsage) => STRICT_FILES.includes(usage.file);
const where = (usage: KeyUsage) => `${usage.file}:${usage.line} ${usage.key}`;

describe("collectKeyUsages", () => {
  it("resolves namespaces, literal values and dynamic option keys", () => {
    const usages = collectKeyUsages(
      "x.tsx",
      `const options = [{ labelKey: "opt_a" }];
       export function A() {
         const t = useMobileTranslation("practice");
         const commonT = useMobileTranslation("common");
         t("days", { count: 7 });
         commonT("ok");
         t(dynamic);
         t("spread", { ...rest });
         return null;
       }
       export function B() {
         const t = useMobileTranslation("mobile.home");
         t("title");
       }`
    );
    expect(usages.map(({ key, values, dynamic }) => ({ key, values, dynamic }))).toEqual([
      { key: "practice.days", values: ["count"], dynamic: false },
      { key: "common.ok", values: [], dynamic: false },
      { key: "practice.spread", values: null, dynamic: false },
      { key: "mobile.home.title", values: [], dynamic: false },
      { key: "practice.opt_a", values: null, dynamic: true },
    ]);
  });
});

describe("mobile i18n keys (daodao#360)", () => {
  it("scans the app and the practice edit page", () => {
    expect(mobileUsages.length).toBeGreaterThan(500);
    const editKeys = mobileUsages.filter(isStrict).map((u) => u.key);
    expect(editKeys).toEqual(
      expect.arrayContaining([
        "practice.mobile_frequency_daily",
        "practice.mobile_privacy_delayed_description",
        "practice.mobile_days",
        "practice.mobile_tags_limit_label",
      ])
    );
  });

  it.each(locales)("%s defines every literal key the app uses", (_locale, messages) => {
    const missing = mobileUsages
      .filter((u) => !u.dynamic && readMessage(messages, u.key) === undefined)
      .map(where);
    expect(missing).toEqual([]);
  });

  it.each(locales)("%s defines every key the practice edit page uses", (_locale, messages) => {
    const missing = mobileUsages
      .filter((u) => isStrict(u) && readMessage(messages, u.key) === undefined)
      .map(where);
    expect(missing).toEqual([]);
  });

  it.each(locales)("%s placeholders are all passed by the caller", (_locale, messages) => {
    const problems = mobileUsages.flatMap((u) => {
      const message = readMessage(messages, u.key);
      if (message === undefined || u.values === null) return [];
      const notPassed = placeholdersOf(message).filter((p) => !u.values?.includes(p));
      return notPassed.length ? [`${where(u)} missing {${notPassed.join("}, {")}}`] : [];
    });
    expect(problems).toEqual([]);
  });

  it.each(locales)("%s edit page strings use every value passed in", (_locale, messages) => {
    const problems = mobileUsages.filter(isStrict).flatMap((u) => {
      const message = readMessage(messages, u.key);
      if (message === undefined || !u.values?.length) return [];
      const unused = u.values.filter((v) => !placeholdersOf(message).includes(v));
      return unused.length ? [`${where(u)} ignores ${unused.join(", ")}: "${message}"`] : [];
    });
    expect(problems).toEqual([]);
  });
});
