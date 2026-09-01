# Change queue

> **New Claude session starting here?** Read in this order first: `CONTEXT.md` (project
> framing + confirmed decisions), `IA-BY-USER-TYPE.md` (decisions/open questions per account
> type), `NOTES-CLEANUP.md` (sitemap + coding standards — why path-index bugs kept happening),
> `REFACTOR-PLAN.md` (what this branch's refactor did and why), `PATTERNS.md` (reusable
> wireframe pattern catalog, including `nav-data.js`'s item-by-item type retrofit table), then
> this file last. You're most likely on the `refactor/structure-cleanup` branch, not `main` —
> check with `git branch --show-current`. The 4 page-skeleton types are a starting set, not a
> closed list — the user adds new types as new page needs come up.

Running list of requested changes to batch and implement together, instead of one at a time.
Add to this as you type out requests; nothing here gets implemented until you say go.

**Status: EVERY numbered item so far (1–21) is implemented and pushed** (see `## Done` below
for a summary of each, and git log on `refactor/structure-cleanup` for full detail). Not yet
merged to `main` — still on the refactor branch, awaiting review. The only unfinished thread is
the foundational property/cluster/brand scope switcher (its own section below) — Distribution's
shape is explicitly unsolved there, not a queue item to implement yet. Add new requests to a
fresh numbered list below this status block as they come in.

## Queued (not yet implemented) — Distribution batch

1. **Rate plans becomes a clickable `records` list** ("go deep" — drill into a specific rate
   plan) — same generalized pattern as Properties/Users/Dashboards, not a new mechanism.
   Generic realistic sample names (not real confirmed data), e.g. "Standard Rate,"
   "Non-Refundable," etc. — confirm exact names at implementation time if it matters, otherwise
   pick reasonable ones. Detail node: TBD what a single rate plan's own page looks like — start
   simple (a stacked-cards or list shape) unless told otherwise.
2. **Yield rules becomes a clickable `records` list too** — same pattern as Rate plans/item 1,
   not a plain non-clickable list. Generic sample names, own shared detail node.
3. **Health check simplified to ONE dashboard-cards page, replacing its 7-tab structure
   entirely.** Each of the 7 current tabs (Failed PMS deliveries, Delayed updates, Disabled
   channels, Channels awaiting connection setup, Mapping errors, Disabled channel rates,
   Distribution and system status) becomes a CARD in a single dashboard-cards grid instead of
   a separate tab — real card titles (these ARE the confirmed real names, unlike Insights'
   Dashboard), likely `shape: 'stat'` (a count/status indicator) rather than `'chart'` for each,
   since these are monitoring/status areas, not charts. No more tab strip for Health check.
4. **Inventory becomes a grid page** — reuse the calendar grid's underlying mechanism, but
   GENERALIZE it first so it isn't hardcoded to a 7-column month-calendar shape: needs to work
   for both Front desk's calendar (7 weekday columns) and Inventory's own grid (likely a
   room-type × date matrix, a different shape) — parameterize column count/labels and row
   count rather than assuming every grid is a month view. Exact Inventory grid shape/columns:
   TBD at implementation time, following the "generic enough for different contexts" direction.
5. **Remove Distribution's "Properties" item entirely, for now.** User: "how did we end up with
   properties in distribution? i think thats something i need to work through actually" —
   followed by "i think remove for now." This is the item added in the original refactor
   (`buildSmContentTree`'s `distribution.items`, gated on `showProperties`, using the generic
   `records` pattern → `PROPERTY_NODE`). Remove it from Distribution's item list; DON'T touch
   Configuration's own Properties item (unrelated, stays as-is) or `PROPERTY_NODE` itself
   (still used elsewhere). Log the open question in `IA-BY-USER-TYPE.md`'s Distribution section
   — why Distribution needs (or doesn't need) its own Properties concept, separate from
   Configuration's, is unresolved and explicitly the user's own open thread to work through,
   not something to guess an answer to.
6. **Add "Room types" as a new PROPERTY_NODE tab** (per-property, since there's no generic/
   shared room-type concept today — user: "i dont think there is a concept of a generic room
   type"). Position: right after "Property details," so order becomes General information,
   Property details, Room types, Services, Policies, Media library, Integrated systems, Users.
   Content: `sketch: 'list'` (confirmed — not a stub, user corrected to "actually yep room
   types is a list" after initially suggesting stub).
   - **Speculative idea, NOT a commitment — log as an open question, don't design around it
     yet:** user floated whether room types could ALSO be switchable/manageable centrally
     across properties, if a customer prefers that ("i wonder if we can add that so user can
     switch and manage centrally if they prefer"). This is the same shape of tension as the
     foundational scope-switcher/portfolio-efficiency thread above (today's platform only has
     single-property context, losing whole-portfolio efficiencies) — connect these when
     working through the scope-switcher's Distribution case, don't solve Room types'
     central-management idea in isolation or prematurely.
7. **Transactions → Reservations becomes a plain list.** `content: null` → `sketch: 'list'` —
   NOT the clickable `records` pattern (unlike Rate plans/Yield rules) — just the list shape,
   no drill-down for now.

Two regressions were caught and fixed while implementing (see git log for full detail on
each): `resolveChain` wasn't pushing a step for plain leaf (`sketch`-type) content, so ALL such
content across the whole app had silently stopped rendering since the prior session's chain
refactor; and the standard content-margin wrapper was being applied per-nesting-level instead
of once, double-padding any tabs-within-tabs case to 48px instead of 24px.

A handful of small, reversible calls were made without live user input (user had stepped away
and said to keep going rather than wait) — each flagged inline in `## Done` below for a quick
look on review: which 2 items illustrate My insights' starring, Health check's tabs given
`list` as a first-pass type (flagged to reconsider once real column data suggests `table`),
applying the real-names breadcrumb exception to both the properties AND systems pickers, and
not wiring the new dashboard-card-grid pattern onto Insights' Dashboard (needs real card
titles first — only "Property Status" is confirmed anywhere in the docs).

## Known bugs / follow-ups (found and fixed or flagged during the last session)

Pulled out as their own list per user request, so nothing gets lost in narrative paragraphs.
The two regressions were both found AND fixed already (included here for visibility, not as
outstanding work); the rest are still-open follow-ups worth a look.

- **[FIXED]** `resolveChain` wasn't pushing a step for plain leaf (`sketch`-type) content —
  silently broke ALL such content across the whole app (Property settings' tabs, Direct
  Booking's Setup/Selling tools, Users, Media library) since the prior session's chain
  refactor. Root cause and fix in commit `55f69bc`.
- **[FIXED]** Standard content-margin wrapper (`.sketch`, 24px) was applied per-nesting-level
  instead of once, double-padding any tabs-within-tabs case (e.g. Properties → a specific
  property's own tabs) to 48px instead of 24px. Fixed in commit `05e9a70`.
- **[FIXED]** Tab strip had no gap between its bottom divider and the content cards below it
  once nested inside `.sketch`'s own padding — content sat flush against the tab row. Fixed in
  commit `6ab9eda`.
- **[OPEN]** Health check's 7 tabs use `sketch: 'list'` as a first-pass page-type choice —
  flagged to reconsider as `sketch: 'table'` once real column data for these error/status
  listings is known (they may fit a table better than a flat list).
- **[FIXED]** The dashboard-card-grid pattern is now wired onto Insights' Dashboard and every
  custom dashboard/chart (`CUSTOM_DASHBOARD_NODE`) — confirmed with user it needs NO titles at
  all (a mix of real + skeleton titles "gets weird"); every card is titleless, sized larger
  per "make them larger." Fixed in commit `e1d08e8`.
- **[FIXED]** Breadcrumb showed a stale/wrong 3rd segment once drilled into a specific
  property's own tabs (`PROPERTY_NODE.label` still literally "Property settings"). Fixed by
  treating a detail node's own tabs (reached via an explicit `records` drill-down) as a new
  root for crumb purposes. Fixed in commit `cf4a20b`, alongside generalizing the pattern
  itself (see `## Done` item 10).
- **[FIXED]** A `records` picker with no wrapping tabs layer (Users) never got its own label
  crumb, so the lone record-name crumb was suppressed by the "single crumb is noise" rule.
  Fixed in commit `cf4a20b`.

## Open questions

- **LH's account-type-specific rail differences beyond Front desk** — is Front desk the ONLY
  rail difference for LH, or are there other L1/L2/L3 differences from SM still to come? Also:
  does LH's "same as SM" content include the account-type/property-count Properties-gating
  logic unchanged (i.e. an LH account with multiple properties still gets a Properties tab
  the same way SM does), or does LH have its own property-count story?
- **Channels (#9) bulk-management story** — the redesign's stated goal is better bulk-action
  support across properties for the multi-property cohort. Given channel connections are
  confirmed to already work across multi-property accounts (MP's existing Channel adoption
  view), what does BULK channel management actually look like here (e.g. subscribe/configure
  one channel across many properties at once)? Not designed yet — flag for a follow-up
  conversation, likely informed by the same MP-bulk-primitives caveat already noted in
  `IA-BY-USER-TYPE.md` (MP enforces one shared config across bulk-selected entities, where
  single-property Platform allows per-entity config) — Channels may hit the identical tension.

## Foundational, unsolved — property/cluster/brand switcher

Seeded by the user as explicitly **foundational to the entire redesign** and **not yet
solved** — kept as its own section rather than a numbered queue item, since it's design work
still in progress, not a scoped implementation request. Don't attempt to implement any of
this until it's actually worked through; this is a placeholder to keep the shape of the
problem visible across sessions, not a spec.

**The core idea:** a property switcher — letting a multi-property user scope what they're
viewing to all properties, a specific property, or (for MP accounts) a cluster/brand — needs
to exist "in sections where it makes sense," but which sections, and how the switcher itself
behaves, varies and isn't uniform across the app. This is a different mechanism from the
existing Properties tab/picker (Configuration → Properties, Distribution → Properties) — that
picker is for navigating TO one specific property's own settings; this switcher is about
SCOPING a whole section's view (its data, dashboards, lists) across some subset of the
account's properties, without necessarily navigating anywhere.

**Why this whole feature exists (user's own articulation, captured verbatim in spirit):**
today the platform only has the context of a single property at a time. That loses real
efficiencies — whole-of-portfolio reporting, and distribution concepts too. The scope switcher
is the exploration of fixing that — NOT a settled mechanism to apply uniformly everywhere it
technically could go.

**Per-section state, as described so far — REVISED, no longer "Insights is the easy case":**
- **Insights is NOT uniformly solved either.** Originally treated as the clear/easy case
  (defaults to "all properties" for multi-property, hidden for single-property, individual
  properties + MP clusters/brands as scoping options) — but the user flagged that even within
  Insights, the switcher's relevance may not be uniform: "dashboard and charts might not make
  sense to have a property switcher... does it show only when its relevant?" i.e. Insights'
  own Dashboard/Charts (a user's PERSONAL custom views) may be a case where portfolio-wide
  scoping doesn't apply the same way it does for, say, a system Dashboard or Recommendations.
  This is a real UX question to work through, not resolved by the current sketch's blanket
  "show whenever propertyCount === 'multiple'" rule — don't treat Insights as settled.
- **Health check** — "would do the same" as Insights (same switcher behavior/defaults) — but
  see the note above: if Insights itself isn't uniform, Health check's "same as Insights"
  framing may need revisiting too, not assumed solved just because Insights was assumed solved.
- **Configuration** — likely NOT relevant / doesn't need this switcher, since most
  Configuration work happens one property at a time anyway (aligns with Configuration's
  existing Properties-tab-then-drill-into-one-property model).
- **Distribution** — **the hard, unsolved case.** User explicitly said they haven't solved
  this one. Distribution already has its own Properties tab/picker (bulk rate distribution
  tension already flagged elsewhere in `IA-BY-USER-TYPE.md`/`CONTEXT.md`) — how a
  section-wide scope switcher interacts with that existing per-entity picker, and with bulk
  operations across a scoped subset of properties, is unresolved. This is likely where the
  real design difficulty of the whole feature concentrates.
- **Transactions** — not yet discussed at all; no stated position either way.

**Known open threads this connects to (don't design in isolation from these):**
- The bulk rate distribution tension (`IA-BY-USER-TYPE.md`, SM multi-property section) — MP's
  production model enforces one shared config across bulk-selected entities; a scope switcher
  that lets you select "a cluster" or "3 properties" needs to reckon with the same tension.
- Channels' (queue item #9) own bulk-management question — same shape of problem again.
- Brands/Clusters (Configuration → Properties, MP-gated) are already a confirmed grouping
  concept in the app; this switcher reusing them as scoping units (not just organizational
  labels) is a new use for something that already exists structurally.
- Room types' speculative "manage centrally across properties" idea (Distribution batch item
  6) is the SAME shape of problem again — a per-property concept a customer might want scoped/
  switched across their portfolio. Don't solve any of these one at a time in isolation; they're
  all facets of the same underlying "single-property-only context loses portfolio efficiencies"
  tension the user articulated as the whole reason this exploration exists.

**Next step when picked back up:** work through Distribution specifically first (the stated
hard case), since Insights/Health check sound closer to "apply the same simple pattern" and
Configuration sounds like "doesn't need it" — Distribution is where the actual design
thinking still needs to happen before this becomes an implementable queue item.

**First-pass sketch (in progress, exploratory, done live in the running prototype rather
than only in this doc) — user asked to sketch the solved-shape cases to help reason through
the rest by seeing it, NOT a finished implementation:**
- Building a first rough version of the switcher for Insights and Health check only (the two
  "would do the same, easy" cases) — all-properties default for multi-property, hidden for
  single-property, individual properties + clusters/brands as scoping options for MP.
- Distribution and Transactions are deliberately NOT touched by this sketch — sketching them
  would mean guessing at the unsolved part, which defeats the purpose.
- This is throwaway/exploratory — expect it to change once Distribution's shape is worked
  out, since whatever mechanism this sketch invents for Insights/Health check needs to also
  make sense once Distribution's harder requirements are known. Don't treat this sketch's
  first implementation choices (e.g. where the switcher control lives, exact interaction) as
  locked in.

**Placement reconsidered — DONE (commit `fad34af`).** Moved from the top of the L2 panel to
the canvas's top-right (via `.canvas-scope-switcher`, `renderCanvas` instead of `renderPanel`).
Frees up the panel's own real estate for actual nav items, reads as a persistent page-level
control rather than a panel list item. Still not decided as FINAL — same as the rest of this
sketch, expect it to change further once Distribution's shape is worked out — but it's the
current implementation, not just a leaning anymore.

## Done

1. **Configuration's first item renamed** "Property settings" → "Property" (single-property
   case only; multi-property's "Properties" tabs item unchanged; `PROPERTY_NODE` itself
   unchanged).
2. **Users** — already existed before this queue; confirmed correct, no action taken.
3. **"Metasearch"** added as a Configuration item under the new Products heading.
4. **"Products" grouping heading** added to Configuration (a new non-clickable panel-list
   pattern — see PATTERNS.md's folder-vs-heading rule), containing Direct Booking/Channels
   Plus/Metasearch, with a "Manage products" stub row (`content: null`) after them.
5. **LH gets full SM content** (`getContent` no longer special-cases LH to `null`) **plus a
   new "Front desk" rail item** (bell icon, first/topmost) — `getRailItems(accountType)`
   replaces the old constant `RAIL_ITEMS`, the first case of the rail itself varying by
   account type. Front desk has no L2/L3 content yet (no placeholders); switching account
   type away from LH while on Front desk falls back to Insights.
6. **Health check** added to Distribution (last in order) with real confirmed content — a
   tabs page: Failed PMS deliveries, Delayed updates, Disabled channels, Channels awaiting
   connection setup, Mapping errors, Disabled channel rates, Distribution and system status
   (sourced from production MP routes via knowledge-base research). Currently `sketch: 'list'`
   per tab — flagged to reconsider as `table` once real column data is known. Kept
   deliberately separate from Channels (item 9) per explicit user correction mid-session.
7. **Page-skeleton design system**: standard content-area margin (`.sketch`, 24px, applied
   exactly once in `renderCanvas` — this fixed the two regressions noted above), full-width
   `.wf-list` (was max-width 520px), new `table` pattern (`.sketch-table`, real header row),
   new `dashboard-cards` pattern (`.sketch-dashboard-cards`, built but not yet wired to any
   real page — needs real card titles first), the real-names breadcrumb exception (properties
   + systems pickers), the folder-vs-heading panel-list distinction, and a full retrofit
   table in `nav-data.js`'s top comment mapping every existing item to its page-type. View vs.
   edit mode deliberately deferred, not started.
8. **Insights → "My insights"** folder (replaces the old flat `ugc` array) containing
   Dashboards + Charts (both `sketch: 'list'`), with non-functional illustrative starring — a
   couple of rows get a star icon (`.wf-list__row--starred`) and the same items are duplicated
   as starred top-level entries (`.nav-list-item__star`) alongside Dashboard/Recommendations.
9. **"Channels"** added to Configuration, placed ABOVE the Products heading (core
   functionality, not an add-on, per explicit user reasoning) — stub content for now. Scoping
   question resolved via research: channel connections confirmed to already span
   multi-property accounts today (real production "Channel adoption view" route).

### Second batch (all done, commits `cf4a20b` through `4e6df3c`)

10. **Generalized `type: 'properties'` into a reusable `type: 'records'` nav pattern**
    (`{ names, detailNode }`) per user's explicit "keep this pattern-based" direction — a
    generic "clickable records list → shared detail node" mechanism. Properties (→
    `PROPERTY_NODE`) and Users (→ `buildUserNode`) are both instances of the same mechanism
    now, not separate ones. Documented as a navigation pattern in PATTERNS.md, distinct from
    canvas sketch patterns.
11. **Users is now clickable** — 4 sample names (Jane Smith, Michael Chen, Priya Patel, Tom
    Reilly; generic realistic names, confirmed with user), each opening a shared detail node
    with tabs "User details" (always) and "Properties" (multi-property accounts only, showing
    which properties that user has access to). Breadcrumb: "Users / [name]".
12. **New standing rule: a `tabs` node with exactly one visible tab collapses straight to its
    content, no strip shown** — same treatment `type: 'systems'` already had for one connected
    system. Caught via Users' single-property case; generalized on the `tabs` content type
    itself via `options: []`, not a one-off fix.
13. **PROPERTY_NODE gets a mirrored "Users" tab** (last, after Integrated systems) — always
    shown (not property-count-gated, unlike USER_NODE's "Properties" tab) since every property
    has users with access to it regardless of account state.
14. **"Manage products" renamed to "Add products"** with a leading "+" icon — a new
    **action-row** panel-list pattern, a third alongside folder/heading (PATTERNS.md): a plain
    clickable item, just visually marked as an action rather than a settings-page destination.
15. **Insights item order reshuffled**: Dashboard, [starred/pinned items], My insights,
    Recommendations — was Dashboard, Recommendations, My insights, [starred items].
    Recommendations moved to the end as a separate concept from dashboards, per user's
    reasoning.
16. **Scope switcher repositioned**: L2 panel top → canvas top-right, via a new
    `.canvas-scope-switcher` wrapper rendered from `renderCanvas` instead of `renderPanel` —
    frees the panel's own space, reads as a persistent page-level control. Still not decided
    as final (see the "Foundational, unsolved" section above), but it's the current
    implementation now, not just a leaning.
17. **Front desk becomes a full-width calendar page with no L2 panel.** New 5th canonical
    page-skeleton type (`sketch: 'calendar'` — weekday header + 7×5 grid of skeleton day
    cells) and a new section-level `noPanel: true` flag (`render()` hides the panel column via
    `display: none`, not just emptying it, which would still reserve its fixed width) — the
    first content item to opt out of the L2 panel entirely. User's stated reason: "this is
    what customers always want for the calendar is max space," a confirmed product need.
18. **Scope switcher gets a custom dropdown chevron.** `appearance: none` was stripping the
    native `<select>` arrow entirely — added a custom SVG chevron via `background-image` so it
    still visibly reads as a dropdown.
19. **Dashboard-cards pattern wired up, titleless throughout.** Insights' Dashboard and every
    custom dashboard/chart (new `CUSTOM_DASHBOARD_NODE`) use the dashboard-cards skeleton — NO
    titles at all, ever (reversed an earlier one-real-title choice; mixing real + skeleton
    titles "gets weird"), skeleton title bar sized larger ("make them larger").
20. **"Dashboards"/"Charts" (under My insights) are now clickable `records` pickers**, same
    generic pattern as Properties/Users, each name opening `CUSTOM_DASHBOARD_NODE`. The
    illustrative star now shows on the actual picker row too (new `starredNames` support in
    `renderRecordPicker`), not just the duplicated top-level item — sample names include
    "Weekly performance"/"Portfolio health"/"Channel comparison" so the star visibly lines up
    with the promoted items using the exact same names.
21. **"Recommendations" changed from `content: null` to `sketch: 'list'`** — a list-type page
    like Users/Health check's tabs, per user's direction.
