import { createRequire } from "module";
import { join } from "path";
import { SCRIPTS_DIR } from "./x-paths.mjs";

const scriptsRequire = createRequire(join(SCRIPTS_DIR, "package.json"));

export function requireScriptDep(name) {
  try {
    return scriptsRequire(name);
  } catch {
    throw new Error(
      `${name} not found. Run: cd .cursor/career/scripts && npm install`,
    );
  }
}
