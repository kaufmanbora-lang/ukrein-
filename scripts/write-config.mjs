import { writeFileSync } from "node:fs";
import { loadEnvFiles } from "./env.mjs";

loadEnvFiles();

const key = process.env.GOOGLE_MAPS_API_KEY || "";

writeFileSync(
  "config.js",
  `window.GAME_CONFIG = {\n  googleMapsApiKey: ${JSON.stringify(key)}\n};\n`,
  "utf8"
);

console.log(key ? "config.js written with Google Maps key." : "config.js written without Google Maps key.");
