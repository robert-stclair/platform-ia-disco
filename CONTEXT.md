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
alongside per-property settings, not as their own top-level or MP-specific section.

## Open threads (not yet resolved)

- **Bulk rate distribution mechanics** once a Properties tab exists under Distribution → Rate
  plans. MP's current production model (Group Rate Plan → Property Rate Plan → Property Room
  Rate) enforces one shared config across entities in bulk operations, where single-property
  Platform allows per-entity config — a real tension once this is actually designed.
- Configuration's nested "item 1/2/3" and "Etc." haven't been walked through concretely yet.
- Transactions hasn't surfaced any multi-property-specific differences yet — worth checking
  whether that's really true or just unexamined.

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

## Keeping this in sync

When a new decision is made (in conversation, in Confluence, or by editing the whiteboard),
update **both** this file and the Confluence decisions log page — this file is the
code-adjacent record for future sessions/contributors working directly in the repo; Confluence
is the stakeholder-facing one.
