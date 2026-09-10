import { createServer } from "http";
import { createHash, randomBytes } from "crypto";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { createConnection } from "net";
import {
  OAUTH_SCOPES,
  TOKEN_CACHE_FILE,
  X_CACHE_DIR,
  X_OAUTH_AUTHORIZE_URL,
  X_OAUTH_TOKEN_URL,
} from "./x-paths.mjs";
import { parseJsonBody, readJsonFile } from "./errors.mjs";

function base64Url(buf) {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function pkcePair() {
  const verifier = base64Url(randomBytes(32));
  const challenge = base64Url(
    createHash("sha256").update(verifier).digest(),
  );
  return { verifier, challenge };
}

function getCredentials() {
  const clientId = process.env.X_CLIENT_ID;
  const clientSecret = process.env.X_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error(
      "Set X_CLIENT_ID and X_CLIENT_SECRET (see content/x/phase0-setup.md)",
    );
  }
  return { clientId, clientSecret };
}

async function exchangeCode({ code, verifier, redirectUri }) {
  const { clientId, clientSecret } = getCredentials();
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    code_verifier: verifier,
    client_id: clientId,
  });

  const res = await fetch(X_OAUTH_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body,
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Token exchange failed (${res.status}): ${text.slice(0, 500)}`);
  }
  return parseJsonBody(text, "Token exchange");
}

export async function refreshAccessToken(refreshToken) {
  const { clientId, clientSecret } = getCredentials();
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: clientId,
  });

  const res = await fetch(X_OAUTH_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body,
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Token refresh failed (${res.status}): ${text.slice(0, 500)}`);
  }
  return parseJsonBody(text, "Token refresh");
}

export function saveTokenCache(tokens) {
  mkdirSync(X_CACHE_DIR, { recursive: true });
  const payload = {
    ...tokens,
    savedAt: new Date().toISOString(),
  };
  writeFileSync(TOKEN_CACHE_FILE, JSON.stringify(payload, null, 2));
  return payload;
}

export function loadTokenCache() {
  if (!existsSync(TOKEN_CACHE_FILE)) return null;
  return readJsonFile(TOKEN_CACHE_FILE);
}

export async function getAccessToken() {
  const envRefresh = process.env.X_REFRESH_TOKEN?.trim() || undefined;
  const envAccess = process.env.X_ACCESS_TOKEN?.trim() || undefined;

  if (envAccess && !envRefresh) {
    return envAccess;
  }

  let cache = loadTokenCache();
  const refreshToken = envRefresh || cache?.refresh_token;

  if (!refreshToken) {
    throw new Error(
      "No refresh token. Run: npm run career:x:setup (or set X_REFRESH_TOKEN)",
    );
  }

  if (cache?.access_token && cache?.expires_at) {
    const expiresAt = new Date(cache.expires_at).getTime();
    if (Date.now() < expiresAt - 60_000) {
      return cache.access_token;
    }
  }

  const tokens = await refreshAccessToken(refreshToken);
  const expiresAt = new Date(
    Date.now() + (tokens.expires_in ?? 7200) * 1000,
  ).toISOString();

  cache = saveTokenCache({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token ?? refreshToken,
    expires_at: expiresAt,
  });

  return cache.access_token;
}

function isPortFree(port) {
  return new Promise((resolve) => {
    const socket = createConnection({ port, host: "127.0.0.1" });
    socket.once("connect", () => {
      socket.destroy();
      resolve(false);
    });
    socket.once("error", () => resolve(true));
    socket.setTimeout(500, () => {
      socket.destroy();
      resolve(true);
    });
  });
}

async function resolveRedirectUri() {
  if (process.env.X_REDIRECT_URI) {
    return process.env.X_REDIRECT_URI;
  }

  const candidates = [8080, 8081, 8082, 8083, 9090];
  for (const port of candidates) {
    if (await isPortFree(port)) {
      const uri = `http://localhost:${port}/callback`;
      if (port !== 8080) {
        console.warn(
          `\nPort 8080 is in use (often Docker or a stale xurl process).`,
        );
        console.warn(`Using ${uri} instead.`);
        console.warn(
          `Add this Callback URI in the X Developer Portal if not already registered.\n`,
        );
      }
      return uri;
    }
  }

  throw new Error(
    "No free port for OAuth callback (tried 8080–8083, 9090). Set X_REDIRECT_URI or free a port.",
  );
}

export async function runOAuthSetup() {
  const { clientId } = getCredentials();
  const redirectUri = await resolveRedirectUri();
  const { verifier, challenge } = pkcePair();
  const state = base64Url(randomBytes(16));

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: OAUTH_SCOPES,
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
  });

  const authUrl = `${X_OAUTH_AUTHORIZE_URL}?${params}`;

  console.log("\nOpen this URL in your browser (log in as @igoorjm):\n");
  console.log(authUrl);
  console.log("\nWaiting for callback on", redirectUri, "...\n");

  const code = await new Promise((resolve, reject) => {
    const redirectBase = new URL(redirectUri);
    const callbackPath = redirectBase.pathname || "/callback";

    const server = createServer((req, res) => {
      const url = new URL(req.url, redirectBase.origin);
      if (url.pathname !== callbackPath) {
        res.writeHead(404);
        res.end();
        return;
      }

      const returnedState = url.searchParams.get("state");
      const err = url.searchParams.get("error");
      const authCode = url.searchParams.get("code");

      if (err) {
        res.writeHead(400);
        res.end(`OAuth error: ${err}`);
        server.close();
        reject(new Error(err));
        return;
      }

      if (returnedState !== state) {
        res.writeHead(400);
        res.end("State mismatch");
        server.close();
        reject(new Error("OAuth state mismatch"));
        return;
      }

      res.writeHead(200, { "Content-Type": "text/html" });
      res.end("<h1>Success! You can close this tab.</h1>");
      server.close();
      resolve(authCode);
    });

    const port = Number(redirectBase.port) || 80;
    server.listen(port, "127.0.0.1", () => {
      console.log(`Listening on ${redirectUri} ...`);
    });

    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        reject(
          new Error(
            `Port ${port} in use. Set X_REDIRECT_URI to a free port and register it in the X Developer Portal.`,
          ),
        );
      } else {
        reject(err);
      }
    });
  });

  const tokens = await exchangeCode({ code, verifier, redirectUri });
  saveTokenCache({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_at: new Date(
      Date.now() + (tokens.expires_in ?? 7200) * 1000,
    ).toISOString(),
  });

  console.log("\n--- Save these secrets (GitHub Actions / .env.local) ---\n");
  console.log(`X_REFRESH_TOKEN=${tokens.refresh_token}`);
  console.log("\nToken cache written to:", TOKEN_CACHE_FILE);
  console.log("\nNext: set X_DRY_RUN=true && npm run career:x:brief\n");
}
