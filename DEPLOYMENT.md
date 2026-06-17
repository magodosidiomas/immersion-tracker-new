# Deployment

There are two possible hosts. Check which one is actually current before
assuming — don't rely on memory of "Netlify was chosen," since that's now
out of date.

## Netlify — not in use
Auto-deployed from `main` on every push, but the team has moved off it.
Still live at the old URL, just not the one anyone should be checking.

## Cloudflare Workers — current
Live at the `.workers.dev` URL. Two things make this different from a
normal "push to deploy" setup:

1. **It builds from a separate branch**, `cloudflare/workers-autoconfig`,
   not `main`. That branch has its own `wrangler.jsonc` and a Cloudflare
   Vite plugin in `vite.config.js` that don't exist on `main`. Work done
   on `main` (new components, screens, etc.) does **not** appear on the
   live site until that branch is brought up to date with `main`.
2. **Deploying is a manual, local step** — `npm run deploy` (which runs
   `wrangler deploy`). There's no CI wiring it to git pushes. Whoever has
   Cloudflare access needs to run it after the branch is synced.

So shipping a change to the live site is actually two steps, not one:
sync `cloudflare/workers-autoconfig` with `main` (merge, no conflicts so
far), then run `npm run deploy` from that branch. The first step can be
done from anywhere with repo access; the second needs valid Cloudflare
credentials, which isn't something available in this environment — that
step always falls to whoever holds those credentials.

Worth revisiting whether two branches need to keep existing at all, vs.
moving the Cloudflare config onto `main` and dropping the branch split —
the divergence is exactly what caused a finished component (TopNav) to
silently not show up on the live site.
