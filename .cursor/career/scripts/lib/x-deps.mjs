import { createRequire } from "module";
import { join } from "path";
import { REPO_ROOT } from "./x-paths.mjs";

const webRequire = createRequire(join(REPO_ROOT, "web/package.json"));

export function requireWebDevDep(name) {
  try {
    return webRequire(name);
  } catch {
    throw new Error(`${name} not found. Run: cd web && npm install`);
  }
}
