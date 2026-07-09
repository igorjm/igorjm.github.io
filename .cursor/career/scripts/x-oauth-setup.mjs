#!/usr/bin/env node
/**
 * One-time OAuth 2.0 PKCE setup for X API.
 *
 * Usage (from web/):
 *   npm run career:x:setup
 *
 * Requires: X_CLIENT_ID, X_CLIENT_SECRET
 */

import { runOAuthSetup } from "./lib/x-auth.mjs";

runOAuthSetup().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
