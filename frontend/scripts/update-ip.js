const fs = require("fs");
const { networkInterfaces } = require("os");

function getLocalIP() {
  const nets = networkInterfaces();
  let bestIP = "localhost";

  // First, try to find a non-internal IPv4 address
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip internal and non-IPv4 addresses
      if (net.family === "IPv4" && !net.internal) {
        // Prefer addresses starting with 192.168 or 10.
        if (
          net.address.startsWith("192.168.") ||
          net.address.startsWith("10.")
        ) {
          return net.address;
        }
        bestIP = net.address;
      }
    }
  }

  return bestIP;
}

const ip = getLocalIP();
const config = {
  API_URL: `http://${ip}:8000`,
  // Add a backup URL for when main URL fails
  FALLBACK_API_URL: `http://localhost:8000`,
};

fs.writeFileSync("config.json", JSON.stringify(config, null, 2));
console.log(`✅ API URL set to: ${config.API_URL} in config.json`);
console.log(`✅ Fallback URL set to: ${config.FALLBACK_API_URL}`);
