// Metro config wrapped by Sentry so source maps get debug IDs for symbolication.
// getSentryExpoConfig is a drop-in replacement for Expo's getDefaultConfig.
const { getSentryExpoConfig } = require('@sentry/react-native/metro');

const config = getSentryExpoConfig(__dirname);

module.exports = config;
