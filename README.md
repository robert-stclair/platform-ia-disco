# platform-ia-disco

Clickable nav wireframe for the Platform 2.0 IA exploration — a narrow primary rail (Insights /
Distribution / Transactions / Configuration) plus a wider secondary panel, Slack-workspace style.
A scope toggle simulates the property-scope layer collapsing (single property) or expanding
(multi-property).

See [CONTEXT.md](./CONTEXT.md) for the full working context: decisions made so far, open
threads, and links back to Confluence.

Working log / decisions: [IA schemes — prototyping](https://siteminder-jira.atlassian.net/wiki/spaces/SMD/pages/1197277194/IA+schemes+prototyping)
Parent proposal: [Platform 2.0 — draft proposal](https://siteminder-jira.atlassian.net/wiki/spaces/SMD/pages/1185284102/Platform+2.0+draft+proposal)
IA diagram (v4, TBD): [Platform 2.0 — IA node tree v4](https://siteminder-jira.atlassian.net/wiki/spaces/SMD/pages/1281458188/Platform+2.0+IA+node+tree+v4)
IA diagram (v3, frozen): [Platform 2.0 — IA node tree v3](https://siteminder-jira.atlassian.net/wiki/spaces/SMD/pages/1250525195/Platform+2.0+IA+node+tree+v3)
IA diagram (v2): [Platform 2.0 — IA node tree v2](https://siteminder-jira.atlassian.net/wiki/spaces/SMD/pages/1245609992/Platform+2.0+IA+node+tree+v2)

Local: http://localhost:5173/ (after `npm run dev`)
Deployed (v4): [platform-ia-disco-v4-fc2230423181.herokuapp.com](https://platform-ia-disco-v4-fc2230423181.herokuapp.com/) — auth: `platform-ia` / `futurestate`
Deployed (v3, frozen): [platform-ia-disco-v3-666c64ccf42b.herokuapp.com](https://platform-ia-disco-v3-666c64ccf42b.herokuapp.com/) — auth: `platform-ia` / `futurestate`
Deployed (v2, frozen): [platform-ia-disco-v2-1496341690fb.herokuapp.com](https://platform-ia-disco-v2-1496341690fb.herokuapp.com/) — auth: `platform-ia` / `futurestate`
Deployed (v1, frozen): [platform-ia-disco-rsc-6b3452000036.herokuapp.com](https://platform-ia-disco-rsc-6b3452000036.herokuapp.com/) — auth: `platform-ia` / `futurestate`

## Dev

```
npm install
npm run dev
```

## Structure

- `src/nav-data.js` — the nav content model (rail items, sub-items, canvas annotations per
  scope/section). This is the file to edit as IA decisions change — it's meant to mirror the
  Confluence decisions log above.
- `src/main.js` — render logic; swaps the secondary panel and canvas based on selected rail item
  and scope toggle.
- `src/style.css` — light/dark-aware tool chrome styling.
