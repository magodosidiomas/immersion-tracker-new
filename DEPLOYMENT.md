# Deployment

## Cloudflare Workers — current and only host

Cloudflare Workers is connected directly to this GitHub repo via Cloudflare's
own git integration (Workers Build). There is no separate deploy branch and
no GitHub Actions workflow — everything is driven by Cloudflare's dashboard
config reacting to pushes.

- **Build command:** `npm run build`
- **Deploy command (production branch):** `npx wrangler deploy`
- **Deploy command (other branches):** `npx wrangler versions upload` — this
  uploads a preview version without shipping it to production traffic.
- **Root directory:** `/`

### Production
Pushing to `main` triggers a full build + `wrangler deploy`, which goes live
immediately at:

https://immersion-tracker-new.languagelaboratory22.workers.dev

### Staging
Pushing to `staging` triggers a build + `wrangler versions upload` (not a
full deploy), producing a stable preview alias at:

https://staging-immersion-tracker-new.languagelaboratory22.workers.dev

Workflow: push feature work to `staging` → review on the staging URL →
merge `staging` into `main` → push → prod deploys automatically.

### Netlify — not in use
Legacy option from early in the project, superseded by Cloudflare. Don't
touch it; it may still be live at an old URL but nothing points to it.

## Notes
- No manual deploy step is needed for either branch — Cloudflare's build
  pipeline handles both build and deploy on every push.
- `wrangler.jsonc` lives at the repo root and applies to both branches.
