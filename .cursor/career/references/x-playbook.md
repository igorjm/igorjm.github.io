# X Playbook — Igor Melo

Reference for `@x-specialist` and the morning pipeline. Apply with [voice-x.md](../content/x/voice-x.md).

## Profile checklist

- [ ] Bio: role + stack + link to igorjm.github.io
- [ ] Verified (X Premium)
- [ ] Pinned tweet: portfolio + flagship project
- [ ] Header: clean, optional tagline
- [ ] Link in bio works on mobile

## Post formats

### 1. Trend commentary (most common)

```
[Insight in line 1 — no "Just saw"]

[1–2 sentences: engineer take, trade-off, or what builders should do]

[Optional question]
```

### 2. Quote-tweet take

- Quote a watchlist post with **your** angle
- Never repeat their thesis — add eval, shipping, or infra lens
- Log `source_inspiration` URL in briefing for audit

### 3. Thread (weekly)

```
1/ Hook + promise (what they'll learn)
2/ Point one (concrete)
3/ Point two
4/ Point three + soft CTA (portfolio or "follow for build logs")
```

Cross-pollinate from [linkedin-posts.md](../content/linkedin-posts.md) Brewra / cog-jackpot stories.

### 4. Project drop

```
Shipped [X]. Stack: [Y]. Not a tutorial — [auth/payments/users].

→ link (max 1/day)
```

### 5. PT-BR (weekly)

- Natural Brazilian Portuguese, not word-for-word EN translation
- Can reference local tech community (Florianópolis, remote BR)

## Hashtags

- 0–2 max, end of tweet only when natural
- Prefer: none (algorithm favors engagement over tags for your niche)

## Morning pipeline output schema

Each queued tweet:

```json
{
  "text": "string <= 280",
  "type": "original | quote_take | thread_part | project",
  "language": "en | pt-BR",
  "scheduledAt": "ISO8601 BRT",
  "quoteTweetId": "optional",
  "sourceInspiration": "optional URL for logging"
}
```

## Engagement (manual v1)

- Reply to comments on your posts within 2 hours when possible
- Comment on 2–3 watchlist posts per week (thoughtful, not "great post")
- Do not auto-reply to strangers (spam risk)

## Metrics

Track weekly in [metrics.md](../content/x/metrics.md): followers, impressions, profile clicks, monetization status.
