const { getDefaultConfig } = require("expo/metro-config");
const { withTamagui } = require("@tamagui/metro-plugin");
const path = require("node:path");

// Monorepo 根目錄
const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Monorepo 支援
config.watchFolders = [monorepoRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];

// 支援 package exports
config.resolver.unstable_enablePackageExports = true;

// 支援 workspace packages
config.resolver.disableHierarchicalLookup = false;

// 強制 singleton 套件都解析到 app 自身的 node_modules，避免 monorepo 中出現重複實例
// packages/api 的 node_modules 有自己的 react@19.2.3，而 apps/mobile 用 react@19.1.0，
// 造成兩個不同物理路徑的 React 實例 → "Cannot read property 'useDebugValue' of null"
// 使用 resolveRequest（比 extraNodeModules 更低層級）強制所有 require('react') 等指向同一路徑
const SINGLETONS = new Set(["react", "react-native", "swr"]);
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const base = moduleName.split("/")[0];
  if (SINGLETONS.has(base)) {
    const realPath = require.resolve(moduleName, { paths: [projectRoot] });
    return { filePath: realPath, type: "sourceFile" };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withTamagui(config, {
  components: ["tamagui"],
  config: "./tamagui.config.ts",
  outputCSS: "./tamagui-web.css",
});
