import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  unlinkSync,
  watch,
  writeFileSync,
} from "node:fs";
import { basename, dirname, extname, join } from "node:path";

const SVG_DIR = join(process.cwd(), "images");
const OUTPUT_DIR = join(process.cwd(), "generated");

interface SvgFile {
  path: string;
  relativePath: string;
  componentName: string;
  isMask: boolean;
}

function toComponentName(filePath: string): string {
  const name = basename(filePath, extname(filePath));
  return `${name
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("")}Svg`;
}

function toMaskConstantName(filePath: string): string {
  // 移除 .mask.svg 後綴，只保留基本名稱
  const name = basename(filePath, ".mask.svg");
  // 轉換為 camelCase，例如: intersect.mask.svg -> intersectMaskDataUri
  const parts = name.split(/[-_]/);
  const camelCase =
    parts[0] +
    parts
      .slice(1)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("");
  return `${camelCase}MaskDataUri`;
}

function getRelativePath(from: string, to: string): string {
  const fromParts = from.split(/[/\\]/).filter(Boolean);
  const toParts = to.split(/[/\\]/).filter(Boolean);

  let i = 0;
  while (i < fromParts.length && i < toParts.length && fromParts[i] === toParts[i]) {
    i++;
  }

  const relativeParts = toParts.slice(i);
  return relativeParts.join("/");
}

function getSvgFiles(dir: string, baseDir: string = dir): SvgFile[] {
  const files: SvgFile[] = [];
  const entries = readdirSync(dir);

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...getSvgFiles(fullPath, baseDir));
    } else if (entry.endsWith(".svg")) {
      const relativePath = getRelativePath(baseDir, fullPath).replace(/\\/g, "/");
      const isMask = entry.endsWith(".mask.svg");
      const componentName = isMask ? toMaskConstantName(entry) : toComponentName(entry);
      files.push({
        path: fullPath,
        relativePath,
        componentName,
        isMask,
      });
    }
  }

  return files;
}

function convertKebabToCamel(str: string): string {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

function convertStyleToReactObject(styleValue: string): string {
  // Parse CSS style string like "mix-blend-mode:multiply" or "prop1:val1;prop2:val2"
  const styles = styleValue.split(";").filter(Boolean);
  const styleObject: Record<string, string> = {};

  for (const style of styles) {
    const [property, value] = style.split(":").map((s) => s.trim());
    if (property && value) {
      const camelProperty = convertKebabToCamel(property);
      styleObject[camelProperty] = value;
    }
  }

  // Convert to React style object format: {{ prop: "value" }}
  const entries = Object.entries(styleObject)
    .map(([key, val]) => `${key}: "${val}"`)
    .join(", ");
  return `{{ ${entries} }}`;
}

function convertSvgAttributes(attributes: string): string {
  // Convert kebab-case attributes to camelCase
  // Match attribute names (e.g., fill-rule="evenodd" or clip-path='url(...)')
  // Special handling for style attribute and xlink:href
  // Match with optional leading whitespace to handle first attribute
  // Use separate patterns for single and double quotes to avoid ReDoS vulnerability
  const processMatch = (
    match: string,
    whitespace: string,
    attrName: string,
    quote: string,
    attrValue: string
  ): string => {
    // Handle style attribute specially
    if (attrName.toLowerCase() === "style") {
      const reactStyle = convertStyleToReactObject(attrValue);
      return `${whitespace}style=${reactStyle}`;
    }

    // Handle xlink:href attribute specially (convert to xlinkHref for React)
    if (attrName.toLowerCase() === "xlink:href") {
      return `${whitespace}xlinkHref=${quote}${attrValue}${quote}`;
    }

    // Handle xmlns:xlink attribute specially (convert to xmlnsXlink for React)
    if (attrName.toLowerCase() === "xmlns:xlink") {
      return `${whitespace}xmlnsXlink=${quote}${attrValue}${quote}`;
    }

    // Skip if already camelCase or if it's a namespace attribute (xml:, xlink:, etc.)
    // But we already handled xlink:href and xmlns:xlink above, so skip other namespace attributes
    if (attrName.includes(":") || !attrName.includes("-")) {
      return match;
    }
    const camelCaseName = convertKebabToCamel(attrName);
    return `${whitespace}${camelCaseName}=${quote}${attrValue}${quote}`;
  };

  // Process namespace attributes (xlink:href) first with double quotes
  // Match namespace attributes like xlink:href, xmlns:xlink, etc.
  // Use [a-z0-9-] with - at the end to ensure it's treated as literal character
  let result = attributes.replace(
    /(\s*)([a-z]+:[a-z0-9-]+)\s*=\s*"([^"]*?)"/gi,
    (match, whitespace, attrName, attrValue) =>
      processMatch(match, whitespace, attrName, '"', attrValue)
  );

  // Process namespace attributes (xlink:href) with single quotes
  result = result.replace(
    /(\s*)([a-z]+:[a-z0-9-]+)\s*=\s*'([^']*?)'/gi,
    (match, whitespace, attrName, attrValue) =>
      processMatch(match, whitespace, attrName, "'", attrValue)
  );

  // Process double-quoted attributes (non-greedy match to prevent backtracking)
  result = result.replace(
    /(\s*)([a-z][a-z0-9-]*)\s*=\s*"([^"]*?)"/gi,
    (match, whitespace, attrName, attrValue) =>
      processMatch(match, whitespace, attrName, '"', attrValue)
  );

  // Process single-quoted attributes (non-greedy match to prevent backtracking)
  result = result.replace(
    /(\s*)([a-z][a-z0-9-]*)\s*=\s*'([^']*?)'/gi,
    (match, whitespace, attrName, attrValue) =>
      processMatch(match, whitespace, attrName, "'", attrValue)
  );

  return result;
}

function convertSvgContent(content: string): string {
  // Convert attributes in all SVG elements (path, g, circle, rect, etc.)
  return content.replace(/<([a-z][a-z0-9]*)([^>]*?)(\/?)>/gi, (_match, tagName, attributes, selfClosing) => {
    const convertedAttributes = convertSvgAttributes(attributes);
    return `<${tagName}${convertedAttributes}${selfClosing}>`;
  });
}

function sanitizeSvgContent(filePath: string): string {
  let svgContent = readFileSync(filePath, "utf-8").trim();

  // Remove XML declaration
  svgContent = svgContent.replace(/^<\?xml[^>]*\?>\s*/i, "");

  // Remove HTML comments (repeatedly until no more matches)
  let previousContent: string;
  do {
    previousContent = svgContent;
    svgContent = svgContent.replace(/<!--[\s\S]*?-->/g, "");
  } while (svgContent !== previousContent);
  svgContent = svgContent.trim();

  return svgContent;
}

function convertSvgToMaskDataUri(svgFile: SvgFile): string {
  const svgContent = sanitizeSvgContent(svgFile.path);

  // 將 SVG 內容轉換為單行
  const singleLineSvg = svgContent.replace(/\s+/g, " ");

  // 轉義單引號和反引號，以便在模板字符串中使用
  const escapedSvg = singleLineSvg
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/\$/g, "\\$");

  const constantCode = `export const ${svgFile.componentName} = \`data:image/svg+xml,\${encodeURIComponent(
  '${escapedSvg}'
)}\`;
`;

  return constantCode;
}

function convertSvgToComponent(svgFile: SvgFile): string {
  const svgContent = sanitizeSvgContent(svgFile.path);

  // Extract SVG attributes
  const svgMatch = svgContent.match(/<svg([^>]*)>/i);
  const svgAttributes = svgMatch ? convertSvgAttributes(svgMatch[1] ?? "") : "";

  // Extract SVG inner content (remove opening and closing svg tags)
  let svgWithoutTags = svgContent
    .replace(/^<svg[^>]*>/i, "")
    .replace(/<\/svg>\s*$/i, "")
    .trim();

  // Convert attributes in inner content
  svgWithoutTags = convertSvgContent(svgWithoutTags);

  const componentCode = `import { forwardRef } from "react";
import type { SVGProps, Ref } from "react";

interface SvgComponentProps extends Omit<SVGProps<SVGSVGElement>, "ref"> {
  ref?: Ref<SVGSVGElement>;
}

const ${svgFile.componentName} = forwardRef<SVGSVGElement, Omit<SVGProps<SVGSVGElement>, "ref">>(
  function ${svgFile.componentName}(props, ref) {
    return (
      <svg${svgAttributes} ref={ref} {...props}>
        ${svgWithoutTags}
      </svg>
    );
  }
);

export default ${svgFile.componentName};
export type { SvgComponentProps };
`;

  return componentCode;
}

// React Native 版本（.native.tsx）：用 react-native-svg 的 SvgXml 直接渲染原始 SVG
// 字串，免逐標籤映射。Metro 會對 `import XxxSvg from "./x"` 自動優先解析 .native.tsx，
// web bundler 則載一般 .tsx，兩邊 API 一致（<XxxSvg width height fill … />）。
function convertSvgToNativeComponent(svgFile: SvgFile): string {
  const svgContent = sanitizeSvgContent(svgFile.path);

  // 單行化並轉義，以便安全放進模板字串
  const escapedSvg = svgContent
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/\$/g, "\\$");

  return `import { SvgXml, type XmlProps } from "react-native-svg";

const xml = \`${escapedSvg}\`;

export default function ${svgFile.componentName}(props: Omit<XmlProps, "xml">) {
  return <SvgXml xml={xml} {...props} />;
}
`;
}

function getNativeOutputPath(svgFile: SvgFile): string {
  return getOutputPath(svgFile).replace(/\.tsx$/, ".native.tsx");
}

function generateIndexFile(svgFiles: SvgFile[]): string {
  const exports = svgFiles
    .map((file) => {
      let importPath: string;
      if (file.isMask) {
        // 對於 mask 檔案，將 .mask.svg 替換為 .mask
        importPath = `./${file.relativePath.replace(/\.mask\.svg$/, ".mask")}`;
      } else {
        // 對於普通 SVG 檔案，將 .svg 移除
        importPath = `./${file.relativePath.replace(/\.svg$/, "")}`;
      }
      if (file.isMask) {
        return `export { ${file.componentName} } from "${importPath}";`;
      }
      return `export { default as ${file.componentName} } from "${importPath}";`;
    })
    .join("\n");

  return `${exports}\n`;
}

function needsRebuild(svgFile: SvgFile): boolean {
  const sourceStat = statSync(svgFile.path);
  const sourceMtime = sourceStat.mtimeMs;

  let outputPath: string;
  if (svgFile.isMask) {
    outputPath = join(OUTPUT_DIR, svgFile.relativePath.replace(/\.mask\.svg$/, ".mask.ts"));
  } else {
    outputPath = join(OUTPUT_DIR, svgFile.relativePath.replace(/\.svg$/, ".tsx"));
  }

  if (!existsSync(outputPath)) {
    return true;
  }

  // 一般 SVG 還需有對應的 .native.tsx；缺了就重建（例如首次導入 RN 版）
  if (!svgFile.isMask && !existsSync(getNativeOutputPath(svgFile))) {
    return true;
  }

  const outputStat = statSync(outputPath);
  const outputMtime = outputStat.mtimeMs;

  // 如果源檔案比輸出檔案新，需要重新構建
  return sourceMtime > outputMtime;
}

function getOutputPath(svgFile: SvgFile): string {
  if (svgFile.isMask) {
    return join(OUTPUT_DIR, svgFile.relativePath.replace(/\.mask\.svg$/, ".mask.ts"));
  }
  return join(OUTPUT_DIR, svgFile.relativePath.replace(/\.svg$/, ".tsx"));
}

function buildSingleFile(svgFile: SvgFile): void {
  const outputPath = getOutputPath(svgFile);
  const outputDir = dirname(outputPath);

  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  if (svgFile.isMask) {
    const constantCode = convertSvgToMaskDataUri(svgFile);
    writeFileSync(outputPath, constantCode, "utf-8");
  } else {
    // web 版（.tsx）+ React Native 版（.native.tsx）
    writeFileSync(outputPath, convertSvgToComponent(svgFile), "utf-8");
    writeFileSync(getNativeOutputPath(svgFile), convertSvgToNativeComponent(svgFile), "utf-8");
  }

  console.log(`✓ Converted ${svgFile.relativePath} -> ${svgFile.componentName}`);
}

function build(incremental: boolean = false) {
  if (incremental) {
    console.log("Building SVG components (incremental)...");
  } else {
    console.log("Building SVG components...");
  }

  const svgFiles = getSvgFiles(SVG_DIR, SVG_DIR);
  const maskFiles = svgFiles.filter((f) => f.isMask);
  const regularFiles = svgFiles.filter((f) => !f.isMask);

  console.log(`Found ${regularFiles.length} SVG files and ${maskFiles.length} mask SVG files`);

  let rebuiltCount = 0;
  let skippedCount = 0;

  // 處理普通 SVG 檔案
  for (const svgFile of regularFiles) {
    if (incremental && !needsRebuild(svgFile)) {
      skippedCount++;
      continue;
    }
    buildSingleFile(svgFile);
    rebuiltCount++;
  }

  // 處理 mask SVG 檔案
  for (const svgFile of maskFiles) {
    if (incremental && !needsRebuild(svgFile)) {
      skippedCount++;
      continue;
    }
    buildSingleFile(svgFile);
    rebuiltCount++;
  }

  // 清理已刪除的檔案對應的輸出檔案
  if (incremental && existsSync(OUTPUT_DIR)) {
    const existingOutputFiles = getAllOutputFiles(OUTPUT_DIR);
    const currentSvgFiles = new Set(
      svgFiles.flatMap((f) =>
        f.isMask ? [getOutputPath(f)] : [getOutputPath(f), getNativeOutputPath(f)]
      )
    );
    const indexPath = join(OUTPUT_DIR, "index.ts");

    for (const outputFile of existingOutputFiles) {
      // 跳過 index.ts，因為它總是會被重新生成
      if (outputFile === indexPath) {
        continue;
      }

      if (!currentSvgFiles.has(outputFile)) {
        // 這個輸出檔案對應的源檔案已經不存在了
        if (existsSync(outputFile)) {
          unlinkSync(outputFile);
          console.log(`✓ Removed orphaned output: ${outputFile}`);
        }
      }
    }
  }

  // 總是重新生成 index.ts，因為檔案列表可能變動
  const indexContent = generateIndexFile(svgFiles);
  const indexPath = join(OUTPUT_DIR, "index.ts");
  writeFileSync(indexPath, indexContent, "utf-8");
  console.log(`✓ Generated index.ts`);

  if (incremental) {
    console.log(`Build completed! Rebuilt: ${rebuiltCount}, Skipped: ${skippedCount}`);
  } else {
    console.log("Build completed!");
  }
}

function getAllOutputFiles(dir: string): string[] {
  const files: string[] = [];
  if (!existsSync(dir)) {
    return files;
  }

  const entries = readdirSync(dir);

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...getAllOutputFiles(fullPath));
    } else if (entry.endsWith(".tsx") || entry.endsWith(".ts")) {
      files.push(fullPath);
    }
  }

  return files;
}

function watchFiles() {
  console.log("Watching for file changes...");
  let buildTimeout: NodeJS.Timeout | null = null;
  const changedFiles = new Set<string>();

  const debouncedBuild = () => {
    if (buildTimeout) {
      clearTimeout(buildTimeout);
    }
    buildTimeout = setTimeout(() => {
      try {
        if (changedFiles.size > 0) {
          console.log(`\n🔄 Processing ${changedFiles.size} changed file(s)...`);
          // 使用增量構建模式
          build(true);
          changedFiles.clear();
        }
      } catch (error) {
        console.error("Build failed:", error);
      }
    }, 300); // 防抖 300ms
  };

  // 監聽 images 目錄及其子目錄
  const watchDir = (dir: string) => {
    if (!existsSync(dir)) {
      return;
    }

    const watcher = watch(dir, { recursive: true }, (eventType, filename) => {
      if (!filename) return;

      const fullPath = join(dir, filename);
      // 只處理 SVG 文件變動或目錄變動
      try {
        const stat = statSync(fullPath);
        if (filename.endsWith(".svg")) {
          if (eventType === "rename") {
            // 檔案被刪除
            console.log(`\n🗑️  File removed: ${filename}`);
            changedFiles.add(fullPath);
            debouncedBuild();
          } else if (stat.isFile()) {
            // 檔案被修改
            console.log(`\n📝 File changed: ${filename}`);
            changedFiles.add(fullPath);
            debouncedBuild();
          }
        } else if (stat.isDirectory()) {
          // 目錄變動可能影響檔案列表
          console.log(`\n📁 Directory changed: ${filename}`);
          debouncedBuild();
        }
      } catch {
        // 文件可能被刪除
        if (filename.endsWith(".svg")) {
          console.log(`\n🗑️  File removed: ${filename}`);
          changedFiles.add(fullPath);
          debouncedBuild();
        }
      }
    });

    watcher.on("error", (error) => {
      console.error("Watch error:", error);
    });

    return watcher;
  };

  const watcher = watchDir(SVG_DIR);
  if (!watcher) {
    console.error(`Directory ${SVG_DIR} does not exist`);
    process.exit(1);
  }

  // 初始構建（完整構建）
  try {
    build(false);
  } catch (error) {
    console.error("Initial build failed:", error);
    process.exit(1);
  }
}

const isWatchMode = process.argv.includes("--watch") || process.argv.includes("-w");

try {
  if (isWatchMode) {
    watchFiles();
  } else {
    build();
  }
} catch (error) {
  console.error("Build failed:", error);
  process.exit(1);
}
