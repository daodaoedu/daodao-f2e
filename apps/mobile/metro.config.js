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
// （packages/api 有自己的 react/swr，會導致「Cannot read property 'useDebugValue' of null」）
config.resolver.extraNodeModules = {
  react: path.resolve(projectRoot, "node_modules/react"),
  "react-native": path.resolve(projectRoot, "node_modules/react-native"),
  swr: path.resolve(projectRoot, "node_modules/swr"),
};

module.exports = withTamagui(config, {
  components: ["tamagui"],
  config: "./tamagui.config.ts",
  outputCSS: "./tamagui-web.css",
});
