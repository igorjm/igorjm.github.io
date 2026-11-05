#!/usr/bin/env node
/**
 * One-time OAuth 2.0 PKCE setup for X API.
 *
 * Usage (from web/):
 *   npm run career:x:setup
 *
 * Env: web/.env.x (auto-loaded). Requires X_CLIENT_ID, X_CLIENT_SECRET
 */

import "./lib/load-web-env.mjs";
import { runOAuthSetup } from "./lib/x-auth.mjs";
import { fatal } from "./lib/errors.mjs";

runOAuthSetup().catch(fatal);
