import { existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const required = [".next/BUILD_ID", ".next/prerender-manifest.json"];

const missing = required.filter((file) => !existsSync(join(root, file)));

if (missing.length > 0) {
  console.error(
    "[qknou-fe] Production build is missing. Run `npm run build` before `npm start`.\n" +
      `Missing: ${missing.join(", ")}`
  );
  process.exit(1);
}

console.log("[qknou-fe] Production build verified.");
