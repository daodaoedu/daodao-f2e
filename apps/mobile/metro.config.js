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

const appModuleAliases = new Set(["react", "react/jsx-runtime", "react/jsx-dev-runtime", "swr"]);
const defaultResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (appModuleAliases.has(moduleName)) {
    return context.resolveRequest(
      {
        ...context,
        originModulePath: path.join(projectRoot, "index.js"),
      },
      moduleName,
      platform
    );
  }

  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withTamagui(config, {
  components: ["tamagui"],
  config: "./tamagui.config.ts",
  outputCSS: "./tamagui-web.css",
});
