const path = require('path');

module.exports = function override(config, env) {
    config.resolve.fallback = {
      "fs": false,
      "path": require.resolve("path-browserify"),
      "crypto": require.resolve("crypto-browserify"),
      "stream": require.resolve("stream-browserify"),
      "vm": require.resolve("vm-browserify")
    };
    return config;
  };
  