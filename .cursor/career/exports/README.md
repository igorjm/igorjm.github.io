# LinkedIn PDF exports

Drop your latest **LinkedIn profile PDF** here as:

```
linkedin-profile.pdf
```

LinkedIn: Profile → **More** → **Save to PDF**

Then from `web/`:

```bash
npm run career:import-linkedin
npm run career:audit-linkedin -- --update-baseline
```

This updates:

- `.cursor/career/linkedin-baseline.md`
- `.cursor/career/.cache/linkedin-snapshot.md`

**Why PDF instead of live fetch?** LinkedIn’s public HTML fetch is often partial (meta tags only). Your PDF export is the authoritative snapshot after manual edits.

Do not commit if the PDF contains private info you don’t want in git — add `exports/*.pdf` to `.gitignore` if needed.
