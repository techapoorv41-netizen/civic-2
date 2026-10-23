/**
 * CivicSense Server Entrypoint Wrapper
 * Enables running directly via plain Node: `node src/server.js`
 * Automatically registers tsx for on-the-fly TypeScript execution,
 * falling back to the compiled dist/server.js build.
 */
const path = require("path");
const fs = require("fs");

try {
  // 1. Prefer on-the-fly TS execution so source changes take effect immediately
  require("tsx/cjs");
  require(path.join(__dirname, "server.ts"));
} catch (err) {
  // 2. Fallback to compiled dist/server.js if tsx/cjs fails
  const distServer = path.resolve(__dirname, "../dist/server.js");
  if (fs.existsSync(distServer)) {
    require(distServer);
  } else {
    console.error("Unable to start server from src/server.js:", err.message);
    process.exit(1);
  }
}
