const fs = require("fs");
const { networkInterfaces } = require("os");

function getLocalIP() {
    const nets = networkInterfaces();
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === "IPv4" && !net.internal) {
                return net.address;
            }
        }
    }
    return "127.0.0.1"; // Default fallback
}

const ip = getLocalIP();
const config = { API_URL: `http://${ip}:8000` };

fs.writeFileSync("config.json", JSON.stringify(config, null, 2));

console.log(`✅ API URL set to: ${config.API_URL} in config.json`);
