# Change queue

> **New Claude session starting here?** Read in this order first: `CONTEXT.md` (project
> framing + confirmed decisions), `IA-BY-USER-TYPE.md` (decisions/open questions per account
> type), `NOTES-CLEANUP.md` (sitemap + coding standards — why path-index bugs kept happening),
> `REFACTOR-PLAN.md` (what this branch's refactor did and why), `PATTERNS.md` (reusable
> wireframe pattern catalog), then this file last. You're most likely on the
> `refactor/structure-cleanup` branch, not `main` — check with `git branch --show-current`.
> The 4 page-skeleton types in item 7 below are a starting set, not a closed list — the user
> adds new types as new page needs come up, so don't treat 7 as "done" once those 4 exist.

Running list of requested changes to batch and implement together, instead of one at a time.
Add to this as you type out requests; nothing here gets implemented until you say go.

## Progress so far (updated live while implementing — user stepped away, said to keep going)

Implemented and pushed, in this order: the Insights scope-switcher sketch (foundational
section below), item 5 (LH + Front desk), items 1/3/4/6/9 together (Property rename, Channels,
Products heading, Health check real content, Metasearch), item 8 (My insights + starring),
and item 7's standard-margin sub-piece. Two real regressions were caught and fixed along the
way — see git log on `refactor/structure-cleanup` for full detail on both:
- `resolveChain` wasn't pushing a step for plain leaf (`sketch`-type) content, so ALL such
  content across the whole app silently stopped rendering after the prior session's chain
  refactor — not just something touched today.
- The standard content-margin wrapper was being applied per-nesting-level instead of once,
  double-padding any tabs-within-tabs case to 48px instead of 24px.

Two decisions were made without live user input, since they were reversible/low-risk and the
user had explicitly said to just keep going rather than wait: the exact 2 items chosen to
illustrate My insights' starring (Weekly performance/Channel comparison, plus Portfolio health
for multi-property — arbitrary, no significance to which ones), and Health check's tabs given
`sketch: 'list'` as a first-pass page-type (flagged inline to reconsider once `table` exists).
Neither is a real fork — cheap to change on review.

**Update:** `table` and dashboard-card-grid patterns built, full-width list done, the real-names
breadcrumb exception applied to BOTH the properties and systems pickers (both feed a crumb via
the identical mechanism — applying it to only one would've been an arbitrary inconsistency with
no real reason behind it; flagging this call since it wasn't explicitly asked). **Deliberately
NOT wiring the dashboard-card-grid pattern onto Insights' own Dashboard item** (which still has
`content: null`) — doing so would require inventing card titles, and only one real one is
confirmed anywhere in the docs ("Property Status," from `CONTEXT.md`'s usage-data reference
points). The pattern is built and documented, ready to use once real dashboard card titles are
confirmed — not forced on with guesses. Flag this back to the user for real titles before
Insights' Dashboard gets built out.

**Still remaining from item 7:** the full retrofit pass assigning a page-type to every
existing item. Continuing now.

## Suggested implementation order (added after a pre-implementation review)

Reviewed the queue against the current code to catch dependencies before starting:

1. **#5 (LH + Front desk) first.** Touches `RAIL_ITEMS`'s shape itself (constant -> function
   of `accountType`) — better to land this structural change on its own before #7's broad
   `nav-data.js` retrofit pass touches the same file, to avoid merge friction between two
   large edits. Scope check: `RAIL_ITEMS` is imported in exactly one place in `main.js`
   (`renderRail()`, `main.js:182`) — small blast radius, but `renderRail()` currently takes no
   arguments and will need `state.accountType` threaded through, same pattern as
   `getContent(state.accountType, state.propertyCount)` already uses. Call it out explicitly
   so it isn't a surprise mid-implementation.
2. **#1, #3, #4, #6, #8 next**, any order among themselves — all independent of each other and
   of #5, all touch `buildSmContentTree`/`buildConfigurationPropertiesItem` (or, for #8,
   Insights' own section) in `nav-data.js`, don't touch `RAIL_ITEMS`.
3. **#7 last**, specifically the "full retrofit pass" part — it assigns a page-type to EVERY
   panel item, so it should run after #1/#3/#4/#6/#8 exist (Metasearch, Health check, Manage
   products, the renamed Property item, My insights/Dashboards/Charts) rather than before, or
   it'll need re-doing once those land. The new pattern-building part of #7 (table, dashboard
   card grid, full-width list, standard margin, folder-vs-heading rule, starred-row indicator)
   has no ordering dependency and could technically start anytime, but logically pairs with
   the retrofit since the retrofit is what exercises the new patterns — and #8 specifically
   NEEDS the starred-row pattern from #7 to exist before it can render its star indicators, so
   build that particular sub-piece of #7 before or alongside #8, even though the rest of #7
   (the retrofit proper) still comes last.

## Queued (not yet implemented)

1. **Rename Configuration's first panel item.** "Property settings" -> "Property" for the
   single-property case. The multi-property case is already labelled "Properties" (the tabs
   item) — no change needed there. Scope: just this panel item's label; PROPERTY_NODE itself
   (the shared tab-strip shown once you drill into a specific property) keeps its current
   label/key, not renamed.
2. **Users** — already exists (Configuration -> Users, top-level, wireframe list sketch).
   Confirmed as correct/already done — no action needed.
3. **Add "Metasearch"** as a new Configuration L2 item, grouped under the new Products
   heading (see #4) — not a standalone flat item.
4. **Add a "Products" grouping** in Configuration's panel — RESOLVED:
   - New heading "Products", placed after Property(/Properties), Users, and Channels (#9 —
     Channels sits ABOVE Products, not inside it; see #9's resolved placement note).
   - Items moved under it: Direct Booking, Channels Plus, Metasearch (new, from #3).
   - After the grouped items, a "Manage products" row — RESOLVED: stub, `content: null`, same
     treatment as Channels Plus today (renders, selectable, empty canvas).
   - Resulting Configuration order: Property/Properties, Users, Channels, — Products —
     Direct Booking, Channels Plus, Metasearch, Manage products.
5. **LH gets real content for the first time — same as SM, plus a new "Front desk" L1 item.**
   Supersedes LH's previous "renders fully empty, undefined by design" status
   (`getContent` returning `null` for `accountType === 'LH'`). New behavior:
   - LH's rail = Front desk (new, FIRST/topmost) + Insights, Distribution, Transactions,
     Configuration — i.e. everything SM gets, unchanged, with Front desk prepended.
   - LH's Insights/Distribution/Transactions/Configuration content is otherwise IDENTICAL to
     SM's (reuses `buildSmContentTree`/`getContent`'s existing logic rather than a separate
     LH-specific tree) — only the extra rail item is LH-specific.
   - Front desk itself: icon + rail item only for now (bell icon, unattended-counter style —
     needs a new SVG added to `icons.js`'s `RAIL_ICONS`). Clicking it shows an empty
     panel/canvas — no L2/L3 content defined yet, consistent with "no placeholder content."
   - **Structural note:** this is the first time the RAIL ITSELF differs by account type —
     today `RAIL_ITEMS` is one constant list shared by everyone (the "one IA" decision was
     that the rail is constant; differences live in L2/L3). This changes that: `RAIL_ITEMS`
     needs to become a function of `accountType` (parallel to how `getContent` already takes
     `accountType`/`propertyCount`), not a bolted-on `lhOnly` flag on the existing constant
     array. Also updates `CONTEXT.md`'s "the rail... is constant across the entire spectrum"
     decision and `IA-BY-USER-TYPE.md`'s LH section (currently "fully undefined by design").
6. **Add "Health check" to Distribution's panel — now with real confirmed content.** New L2
   item, LAST in the order: Inventory, Rate plans, Yield rules, (Properties if shown), Health
   check. **Updated from stub to real content**, sourced from confirmed production MP routes
   (`/all-properties/health-check/*`) found via knowledge-base research: Health check is a
   TABS page (not a single sketch) with these tabs — Failed PMS deliveries, Delayed updates,
   Disabled channels, Channels awaiting connection setup, Mapping errors, Disabled channel
   rates, Distribution and system status. Page-skeleton type for these tabs TBD per item #7's
   per-item prompting process — ask when implementing.
   **Note: Health check and Channels (#9) are separate, unrelated items** — a couple of Health
   check's tab labels happen to mention "channel" (they're diagnostics/error monitoring
   generally, covering PMS sync and distribution status too, not just channels specifically),
   but that's incidental wording overlap, not a real product relationship. Don't place them
   near each other or treat one as informing the other's design — user explicitly flagged this
   after an earlier draft of this queue conflated them.
7. **Lightweight page-skeleton "design system" — 4 canonical page types + full retrofit.**
   Goal: a small, consistent set of page-shape patterns to choose from per item, prompted
   per-item rather than invented ad hoc. Four types (against what's already in PATTERNS.md):
   - **List** — already exists (`sketch: 'list'`, `.wf-list`). Change: make it full-width
     (currently constrained, `.wf-list` has `max-width: 520px`). Real item names (not pure
     skeleton bars) become allowed ONLY for lists that feed a breadcrumb drill-down (e.g. the
     Properties picker) — NOT a blanket change; plain lists (Users, systems picker) stay
     skeleton-only. This is a deliberate exception to the existing no-real-content-in-lists
     rule, scoped narrowly — document the exception explicitly in PATTERNS.md so it doesn't
     silently creep to every list later.
   - **Table** — genuinely new, flagged as "not yet built" in PATTERNS.md already. Build as
     `sketch: 'table'` — skeleton rows+columns with a header row, same "skeleton only, no
     real values" rule as everything else.
   - **Card grid (dashboard)** — genuinely new, distinct from the existing `media` card grid
     (4:3 photo cards). This one: metric/chart-style cards (title bar + skeleton chart/stat
     block), for dashboard-style landing pages (e.g. Insights). New `sketch` value needed
     (not reusing `'media'`) — e.g. `sketch: 'dashboard-cards'` or similar, name TBD.
   - **Stacked cards** — already exists (`sketch: 'sections'`, used for Property settings
     today). No structural change, just formalize it as one of the 4 canonical types in
     PATTERNS.md's framing.
   - **Standard content-area margin**: codify a single standard margin/max-width/padding rule
     for the canvas content area in PATTERNS.md, then AUDIT every existing sketch (sections,
     media, list) against it and fix any that drift, so all 4 (well, all N) patterns share one
     consistent outer spacing rule rather than each having evolved its own.
   - **Full retrofit pass**: go through every existing panel item and explicitly assign/
     confirm which of the 4 types it is (e.g. Property settings -> stacked cards, Users ->
     list, a future Rate plans -> table?), updating `nav-data.js` comments and PATTERNS.md
     together so the mapping is explicit rather than implicit.
   - **View vs. edit mode** — explicitly DEFERRED, not in this batch. Noted here so it isn't
     lost, to tackle later once the 4 base types are solid.
   - Process note: user wants to be PROMPTED per page/item for which of the 4 types fits,
     rather than have it decided unilaterally — when implementing, ask before assigning a
     type to any item where it isn't already obvious/existing.
   - **New standing rule, decided while queuing #8 below — add to PATTERNS.md as part of this
     item's pass:** FOLDER (chevron, collapsed by default, like Direct Booking) vs. GROUPING
     HEADING (like Products, always-expanded, no chevron) — use a folder when the label is
     itself a nav concept whose children are hidden until opened; use a heading when you're
     just visually clustering already-visible sibling items with no expand/collapse. This
     governs both #4 (Products = heading) and #8 (My insights = folder) below.
8. **Insights: add "My insights" (folder) containing Dashboards + Charts, both list pages,
   with a non-functional "starred" visual indicator.** Replaces the existing informal `ugc`
   array (`insights.ugc`: Weekly performance/Channel comparison/Portfolio health — currently a
   flat, unlabeled block rendered below Dashboard/Recommendations) with a proper structured
   item:
   - "My insights" is a FOLDER-type L2 item (per the new rule above) — collapsed by default,
     chevron, expand reveals two children: "Dashboards" and "Charts". Both are `sketch: 'list'`
     pages (users create their own dashboards/charts here).
   - **Starring, visual only — not functional yet:** a couple of items in the Dashboards/
     Charts lists show a filled-star indicator (to communicate the concept), AND the same
     starred items appear promoted/duplicated up into the MAIN Insights item list (alongside
     Dashboard/Recommendations at the top), also with a star shown. This is purely illustrative
     — no actual starring interaction, no real click-to-star toggle; just enough to show the
     idea visually. Confirm with user before/while implementing exactly which 1-2 items in
     each list get the illustrative star, since "a couple" wasn't more specific.
   - **New pattern needed:** a star indicator on a list row — doesn't exist in PATTERNS.md yet
     (`.wf-list__row` has no starred variant). Add as part of #7's pattern-building pass.
   - **Structural note:** promoting a starred item from a nested folder up into the TOP-LEVEL
     item list is new — today the top-level item list (`data.items`) and a folder's children
     are two separate, non-overlapping renders. This needs either (a) a small amount of
     synthetic/duplicated data (the promoted items literally appear in both places in
     `nav-data.js`, simplest for a static wireframe), or (b) an actual "promoted" flag read at
     render time from the same underlying list. Given this is illustrative/non-functional per
     the confirmed answer above, favor (a) — simplest, no new render logic needed — unless
     asked otherwise.
9. **Add "Channels" — the actual OTA subscription/management list (Booking.com, Expedia,
   etc.) — PLACEMENT RESOLVED.** A completely separate item from Health check (#6) — see the
   note on #6 above; not related, don't place them near each other or design one against the
   other. Scoping resolved via knowledge-base research: confirmed production MP routes
   include a "Channel adoption view" (`/all-properties/distribution/adoption`) working across
   multi-property accounts today, so channel management DOES span multi-property, at the
   account/portfolio level — not purely per-property. Scope for this item: a list of
   currently-subscribed channels/OTAs + their management (add/remove/configure a channel
   connection).
   - **Placement: Configuration, ABOVE the new Products heading (#4) — NOT grouped inside it.**
     User's explicit reasoning: "its core functionality for all customers not an add-on" —
     Channels is core/expected functionality every customer needs, unlike Direct
     Booking/Channels Plus/Metasearch under Products, which read more as optional add-on
     products. Resulting Configuration order: Property/Properties, Users, Channels, —
     Products — Direct Booking, Channels Plus, Metasearch, Manage products.
   - Page-skeleton type / exact content TBD per item #7's per-item prompting process.

## Open questions

- **Products heading visual treatment** — this is a new nav pattern (a plain grouping label
  within a panel list, not a clickable item). Need to add this as a real pattern (pure CSS
  label, not a Node) — confirm this shouldn't itself be tracked in PATTERNS.md once built.
  **Efficiency note:** since #7 already has PATTERNS.md open for a broad pass (new page-skeleton
  types + standard margin + retrofit), document the Products heading as a PANEL-LIST pattern
  in that same PATTERNS.md pass rather than as a separate later edit — they're touching the
  same file for related "codify a nav pattern" reasons, no reason to split into two passes.
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

**Per-section state, as described so far:**
- **Insights** — the clear/easy case. Defaults to "all properties" for a multi-property
  group. Hidden entirely for a single-property account (mirrors the existing property-scope-
  collapses-when-single decision already established elsewhere in the app). Selector allows
  choosing between individual properties, and for MP accounts specifically, also
  clusters/brands as scoping units (not just individual properties).
- **Health check** — "would do the same" as Insights (same switcher behavior/defaults).
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

## Done (moved here once implemented, then cleared)

<!-- implemented items land here temporarily so you can see what just shipped, then get cleared next time this file is reset -->
