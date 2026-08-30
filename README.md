# platform-ia-disco

Clickable nav wireframe for the Platform 2.0 IA exploration — a narrow primary rail (Insights /
Distribution / Transactions / Configuration) plus a wider secondary panel, Slack-workspace style.
A scope toggle simulates the property-scope layer collapsing (single property) or expanding
(multi-property).

Working log / decisions: [IA schemes — prototyping](https://siteminder-jira.atlassian.net/wiki/spaces/SMD/pages/1197277194/IA+schemes+prototyping)
Parent proposal: [Platform 2.0 — draft proposal](https://siteminder-jira.atlassian.net/wiki/spaces/SMD/pages/1185284102/Platform+2.0+draft+proposal)

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
