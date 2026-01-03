import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
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
  let result = attributes.replace(
    /(\s*)([a-z]+:[a-z-]+)\s*=\s*"([^"]*?)"/gi,
    (match, whitespace, attrName, attrValue) =>
      processMatch(match, whitespace, attrName, '"', attrValue)
  );

  // Process namespace attributes (xlink:href) with single quotes
  result = result.replace(
    /(\s*)([a-z]+:[a-z-]+)\s*=\s*'([^']*?)'/gi,
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
  return content.replace(/<([a-z][a-z0-9]*)([^>]*)>/gi, (_match, tagName, attributes) => {
    const convertedAttributes = convertSvgAttributes(attributes);
    return `<${tagName}${convertedAttributes}>`;
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

  const componentCode = `import type { SVGProps } from "react";

export default function ${svgFile.componentName}(props: SVGProps<SVGSVGElement>) {
  return (
    <svg${svgAttributes} {...props}>
      ${svgWithoutTags}
    </svg>
  );
}
`;

  return componentCode;
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

function build() {
  console.log("Building SVG components...");

  const svgFiles = getSvgFiles(SVG_DIR, SVG_DIR);
  const maskFiles = svgFiles.filter((f) => f.isMask);
  const regularFiles = svgFiles.filter((f) => !f.isMask);

  console.log(`Found ${regularFiles.length} SVG files and ${maskFiles.length} mask SVG files`);

  // 處理普通 SVG 檔案
  for (const svgFile of regularFiles) {
    const outputPath = join(OUTPUT_DIR, svgFile.relativePath.replace(/\.svg$/, ".tsx"));
    const outputDir = dirname(outputPath);

    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    const componentCode = convertSvgToComponent(svgFile);
    writeFileSync(outputPath, componentCode, "utf-8");

    console.log(`✓ Converted ${svgFile.relativePath} -> ${svgFile.componentName}`);
  }

  // 處理 mask SVG 檔案
  for (const svgFile of maskFiles) {
    const outputPath = join(OUTPUT_DIR, svgFile.relativePath.replace(/\.mask\.svg$/, ".mask.ts"));
    const outputDir = dirname(outputPath);

    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    const constantCode = convertSvgToMaskDataUri(svgFile);
    writeFileSync(outputPath, constantCode, "utf-8");

    console.log(`✓ Converted ${svgFile.relativePath} -> ${svgFile.componentName}`);
  }

  const indexContent = generateIndexFile(svgFiles);
  const indexPath = join(OUTPUT_DIR, "index.ts");
  writeFileSync(indexPath, indexContent, "utf-8");
  console.log(`✓ Generated index.ts`);

  console.log("Build completed!");
}

function watchFiles() {
  console.log("Watching for file changes...");
  let buildTimeout: NodeJS.Timeout | null = null;

  const debouncedBuild = () => {
    if (buildTimeout) {
      clearTimeout(buildTimeout);
    }
    buildTimeout = setTimeout(() => {
      try {
        build();
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

    const watcher = watch(dir, { recursive: true }, (_eventType, filename) => {
      if (!filename) return;

      const fullPath = join(dir, filename);
      // 只處理 SVG 文件變動或目錄變動
      try {
        const stat = statSync(fullPath);
        if (filename.endsWith(".svg") || stat.isDirectory()) {
          console.log(`\n📁 File changed: ${filename}`);
          debouncedBuild();
        }
      } catch {
        // 文件可能被刪除，但我們仍然需要重新構建以更新 index
        if (filename.endsWith(".svg")) {
          console.log(`\n📁 File removed: ${filename}`);
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

  // 初始構建
  try {
    build();
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
