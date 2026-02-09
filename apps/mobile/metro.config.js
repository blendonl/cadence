const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
config.resolver.unstable_enablePackageExports = true;

const mobileNodeModules = path.resolve(__dirname, 'node_modules');
const singletonPackages = ['react', 'react-native'];

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (singletonPackages.includes(moduleName)) {
    return {
      filePath: require.resolve(moduleName, { paths: [mobileNodeModules] }),
      type: 'sourceFile',
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
