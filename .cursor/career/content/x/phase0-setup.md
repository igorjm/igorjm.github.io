# X Bot — Phase 0 Setup

One-time setup (~1 hour). Do this before the morning pipeline posts anything.

## 1. X Premium

- Subscribe to X Premium on @igoorjm
- Verify account (blue check)
- Grok 4.5 available in X app / Grok Build for interactive strategy (optional for cron bot)

## 2. X Developer App

1. Go to [developer.x.com](https://developer.x.com) → Projects & Apps
2. Create app in **Pay-per-use + Production**
3. **User authentication settings:**
   - OAuth 2.0 enabled
   - Type: Web App
   - Callback URL: `http://localhost:8080/callback`
   - Also add: `http://localhost:8081/callback` (if Docker uses 8080)
   - Website URL: `https://igorjm.github.io`
4. **Scopes:** `tweet.read`, `tweet.write`, `users.read`, `media.write`, `offline.access`
5. Copy **Client ID** and **Client Secret**

## 3. Local OAuth (capture refresh token)

From `web/`:

```bash
export X_CLIENT_ID="your_client_id"
export X_CLIENT_SECRET="your_client_secret"
npm run career:x:setup
```

Complete browser login as @igoorjm. Script prints `X_REFRESH_TOKEN` for GitHub Secrets.

**After adding `media.write`:** re-run setup so the refresh token includes image upload scope.

Optional: save to `web/.env.x` (gitignored, auto-loaded by `npm run career:x:*`):

```
X_CLIENT_ID=...
X_CLIENT_SECRET=...
X_REFRESH_TOKEN=...
ANTHROPIC_API_KEY=...
X_DRY_RUN=true
X_AUTO_POST=false
X_MEDIA_ENABLED=false
```

## 4. LLM API key

Pick one for automated curation:

| Provider | Env var | Get key |
|----------|---------|---------|
| Anthropic | `ANTHROPIC_API_KEY` | console.anthropic.com |
| OpenAI | `OPENAI_API_KEY` | platform.openai.com |
| xAI (Grok) | `XAI_API_KEY` | console.x.ai |

## 5. Cursor MCP

```bash
cp .cursor/mcp.json.example .cursor/mcp.json
# Edit CLIENT_ID and CLIENT_SECRET
```

Cursor → Settings → MCP → confirm `xapi` green dot. First use opens browser for OAuth.

## 6. GitHub Actions secrets

Repo → Settings → Secrets → Actions:

- `X_CLIENT_ID`
- `X_CLIENT_SECRET`
- `X_REFRESH_TOKEN`
- `ANTHROPIC_API_KEY` (or your LLM provider)

## 7. Dry run week

```bash
cd web
X_DRY_RUN=true npm run career:x:brief
```

Review `.cursor/career/content/x/daily/YYYY-MM-DD-briefing.md` for 7 days before setting `X_AUTO_POST=true`.
