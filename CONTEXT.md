# Context

This repo is a working prototype for the Platform 2.0 IA exploration — a clickable nav
wireframe, not a built product. It exists to test navigation *models*, not to ship pages.

Full background, open questions, and the parent rationale live on Confluence and are kept in
sync with the decisions captured here:

- [Platform 2.0 — draft proposal](https://siteminder-jira.atlassian.net/wiki/spaces/SMD/pages/1185284102/Platform+2.0+draft+proposal) — the originating proposal (Robert St Clair). Argues Property Platform's IA evolved around team structures rather than a central UX vision, and that several intersecting pressures (distribution model, IA overload, multi-property, nav UX, design system, agentic workflows, mobile web, global elements) make a strategically-driven redesign the right move now rather than later.
- [IA schemes — prototyping](https://siteminder-jira.atlassian.net/wiki/spaces/SMD/pages/1197277194/IA+schemes+prototyping) — the working decisions log this repo mirrors. Update both when a decision changes.
- The whiteboard nested under the draft proposal page is the live, hand-edited source wireframe this repo's markup is based on.

## Why this shape (wireframe, not sitemap)

Working IA decisions as clickable nav mockups rather than text sitemaps/trees — stakeholders
read a nav mock far more easily than a hierarchy diagram. `nav-data.js` is the thing to edit
as decisions evolve; it drives the rail, panel, and canvas annotations directly.

## Decisions captured so far

**Insights is home.** Intentional — Insights doubles as both the landing/dashboard section and
analytics. Not split into a separate "home" concept at this stage.

**"UGC" = user-generated dashboards.** The repeated "UGC" slots under Insights are custom
dashboards a user builds themselves, not guest/review content. Insights sub-nav is: system
Dashboard, Recommendations, then a list of the user's own custom dashboards.

**One IA, not two — property scope collapses/expands contextually.** Single-property and
multi-property are not separate schemes. The same rail and same sub-nav apply across the whole
spectrum (1 property → 2–5, possibly with no MP product licence → 50–100+ enterprise); what
changes is whether a property-scope layer is present:

- For the ~80% single-property accounts, the property-scope layer collapses upward — invisible,
  since there's only one property to scope to.
- For multi-property accounts, it expands into an explicit "Properties" tab/selector. Rate plans
  work the same way: a Properties tab appears, but the top-level surface (Distribution → Rate
  plans) looks identical either way.
- Insights defaults to an all-properties (or last-selection) view for multi-property accounts —
  it isn't a separate MP-specific Insights.
- The differences live in the **secondary/tertiary nav layers**, not in the primary rail, which
  is constant across the entire spectrum.

**Brands/Clusters are Configuration concepts, not a separate MP layer.** Brands, Clusters, and
similar groupings are enablers/setup concerns — they live under Configuration → Properties,
alongside per-property settings, not as their own top-level or MP-specific section. Refined
further below: they're gated by account type (MP), not by property count.

**Account type and property count are independent settings axes.** "MP" is a product some
accounts have (Multi-Property), separate from how many properties an account manages — a
non-MP account can still have many properties. The hidden settings sheet (press `` ` ``) models
this as two independent controls: **Account type** (SM / LH / MP — only SM has real content so
far; LH/MP intentionally render empty until their nav differences are defined) and **Number of
properties** (Single / Multiple — drives the Properties list under Distribution/Configuration,
independent of account type). Within that: the Properties list itself is gated by property
count alone; Brands and Clusters specifically are gated further, only showing for account type
MP (`mpOnly: true` in `nav-data.js`).

**Property settings has direct tabs — no extra nesting layer.** General information / Property
details / Services / Policies / Media library / Integrated systems sit directly on the
"Property settings" panel item — there's no intervening "sublist" wrapping them. A real bug
happened here: an earlier version added a fabricated sublist with invented "Users"/
"Notifications" items sharing a duplicate key with the panel item itself, which caused Booking
engine's content to bleed into Property settings' display. Fixed by giving every navigable node
one consistent recursive shape (see `nav-data.js`'s top comment) — never reintroduce
`tabs`/`sublist`/`properties` as competing sibling properties on the same object.

**Booking engine has its own sublist**: Selling tools (tabs: Promotions/Extras) / Setup (tabs:
Booking rules/Guest details/Email settings/Translations/About page/Contact page/Policies page)
/ Branding (no content yet). Confirmed from real production screenshots.

**Integrated systems (a Property settings tab) is system-count-aware.** With one connected
system it collapses straight to that system's sections (General settings/Inventory settings/
Reservation delivery failure emails/Reservation mappings/Credit card mappings — all real card
titles from screenshots). With more than one system (toggled via the settings sheet) it shows a
system-picker list first, then drills into the selected system's sections. This applies
uniformly regardless of account type or property count — not an MP-only or multi-property-only
concept.

**Folder-style panel items (Booking engine, MP's "Properties" list) don't auto-navigate on
open.** Clicking one only expands/reveals its children in the panel — the canvas keeps showing
whatever was already routed until the user clicks a specific child. This mirrors a real folder
tree (expanding ≠ selecting) and is visually distinct: an "open" folder is bold with no
background pill; a truly routed/selected item gets the pill. Breadcrumbs only appear once
there's a real multi-level trail (a single root crumb with nothing above/below it is
suppressed as noise).

## Open threads (not yet resolved)

- **Bulk rate distribution mechanics** once a Properties tab exists under Distribution → Rate
  plans. MP's current production model (Group Rate Plan → Property Rate Plan → Property Room
  Rate) enforces one shared config across entities in bulk operations, where single-property
  Platform allows per-entity config — a real tension once this is actually designed.
- Configuration's "Etc." item was removed per the no-placeholders rule — nothing stands in for
  it currently; add real items here only once confirmed.
- Transactions hasn't surfaced any multi-property-specific differences yet — worth checking
  whether that's really true or just unexamined.
- **Channels Plus** (a Configuration panel item) has no content wired up yet.
- **LH and MP account types** have no real nav content defined yet — they render empty by
  design, not a bug. Fill in `CONTENT.LH` / `CONTENT.MP` in `nav-data.js` once real differences
  are confirmed.
- Distribution's MP "Properties" tab still uses the old pre-refactor shape (`data.sublist`, a
  flat array with no recursive `content`) — hasn't been migrated to the current node model yet.

## Reference data points (from the platform knowledge base, not this repo)

- PP dashboard usage: near-universal Distribution/Inventory visit follows a dashboard visit in
  the same session; notification bell outperforms every content widget; Smart Guide/NBA widgets
  underperform alert-driven widgets (~100 vs 380–460 weekly clickers for Property Status).
- 13.6% of accounts sit in the 2–5 property band.
- The Quin/DOE-ROE roadmap plans to decommission Smart Guide and consolidate NBA, Smart Guide,
  Sigint, DS/LLMOps, and Channels Plus "Optimise" into one Optimisation Engine — any
  "Recommendations" nav concept here should anticipate that consolidation, not the current
  fragmented state.
- MP Lite already exists as a lighter tier (property switcher, insights/reporting,
  brands/clusters, connectivity health — but no bulk rate management) — a precedent worth
  reviewing given Brands/Clusters are now placed under Configuration → Properties.
- SDS (design system) already has a five-level model (Foundations → Components → Systems →
  Flows → Page types) and a documented `sm-app-header` spec to build on.

## Deployment

Live at https://platform-ia-disco-rsc-6b3452000036.herokuapp.com/ — a static build served via
`serve` (Heroku Node buildpack, `heroku-postbuild` runs `vite build`). Auto-deploys from GitHub
on every push to `main`. Two GitHub remotes are configured: `origin` fans out pushes to both
`platform-ia-disco` and `platform-ia-disco-rsc`; `rsc` targets `platform-ia-disco-rsc` alone.
`heroku` remote also exists for direct manual deploys as a fallback.

**Gotcha:** `package-lock.json` must be generated against the public npm registry
(`registry.npmjs.org`), not a corporate registry mirror — if your local npm config points
elsewhere (check `npm config get registry`), regenerate the lockfile with
`npm install --registry=https://registry.npmjs.org/` before committing, or Heroku's build will
fail with an npm 401 auth error trying to reach a registry it has no credentials for.

## Keeping this in sync

When a new decision is made (in conversation, in Confluence, or by editing the whiteboard),
update **both** this file and the Confluence decisions log page — this file is the
code-adjacent record for future sessions/contributors working directly in the repo; Confluence
is the stakeholder-facing one.
