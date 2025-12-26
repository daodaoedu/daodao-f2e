import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from "fs";
import { join, dirname, basename, extname } from "path";

const SVG_DIR = join(process.cwd(), "images");
const OUTPUT_DIR = join(process.cwd(), "generated");

interface SvgFile {
  path: string;
  relativePath: string;
  componentName: string;
}

function toComponentName(filePath: string): string {
  const name = basename(filePath, extname(filePath));
  return name
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("") + "Svg";
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
      const componentName = toComponentName(entry);
      files.push({
        path: fullPath,
        relativePath,
        componentName,
      });
    }
  }

  return files;
}

function convertKebabToCamel(str: string): string {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

function convertSvgAttributes(attributes: string): string {
  // Convert kebab-case attributes to camelCase
  // Match attribute names (e.g., fill-rule="evenodd" or clip-path='url(...)')
  return attributes.replace(
    /(\s+)([a-z][a-z0-9-]*)\s*=/gi,
    (match, whitespace, attrName) => {
      // Skip if already camelCase or if it's a namespace attribute (xml:, xlink:, etc.)
      if (attrName.includes(":") || !attrName.includes("-")) {
        return match;
      }
      const camelCaseName = convertKebabToCamel(attrName);
      return `${whitespace}${camelCaseName}=`;
    },
  );
}

function convertSvgContent(content: string): string {
  // Convert attributes in all SVG elements (path, g, circle, rect, etc.)
  return content.replace(
    /<([a-z][a-z0-9]*)([^>]*)>/gi,
    (match, tagName, attributes) => {
      const convertedAttributes = convertSvgAttributes(attributes);
      return `<${tagName}${convertedAttributes}>`;
    },
  );
}

function convertSvgToComponent(svgFile: SvgFile): string {
  let svgContent = readFileSync(svgFile.path, "utf-8").trim();
  
  // Remove XML declaration
  svgContent = svgContent.replace(/^<\?xml[^>]*\?>\s*/i, "");
  
  // Remove HTML comments
  svgContent = svgContent.replace(/<!--[\s\S]*?-->/g, "").trim();
  
  // Extract SVG attributes
  const svgMatch = svgContent.match(/<svg([^>]*)>/i);
  const svgAttributes = svgMatch ? convertSvgAttributes(svgMatch[1]) : "";
  
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
      const importPath = `./${file.relativePath.replace(/\.svg$/, "")}`;
      return `export { default as ${file.componentName} } from "${importPath}";`;
    })
    .join("\n");

  return exports + "\n";
}



function build() {
  console.log("Building SVG components...");

  const svgFiles = getSvgFiles(SVG_DIR, SVG_DIR);
  console.log(`Found ${svgFiles.length} SVG files`);

  for (const svgFile of svgFiles) {
    const outputPath = join(
      OUTPUT_DIR,
      svgFile.relativePath.replace(/\.svg$/, ".tsx"),
    );
    const outputDir = dirname(outputPath);

    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    const componentCode = convertSvgToComponent(svgFile);
    writeFileSync(outputPath, componentCode, "utf-8");

    console.log(`✓ Converted ${svgFile.relativePath} -> ${svgFile.componentName}`);
  }

  const indexContent = generateIndexFile(svgFiles);
  const indexPath = join(OUTPUT_DIR, "index.ts");
  writeFileSync(indexPath, indexContent, "utf-8");
  console.log(`✓ Generated index.ts`);

  console.log("Build completed!");
}

try {
  build();
} catch (error) {
  console.error("Build failed:", error);
  process.exit(1);
}

