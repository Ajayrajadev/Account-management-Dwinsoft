const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add web support
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Add web extensions
config.resolver.sourceExts.push('web.js', 'web.ts', 'web.tsx');

module.exports = config;
