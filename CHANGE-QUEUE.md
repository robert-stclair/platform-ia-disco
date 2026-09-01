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

**Status: items 1, 3, 4, 5, 6, 7, 8, 9 are all implemented and pushed** (see `## Done` below
for a summary of each, and git log on `refactor/structure-cleanup` for full detail). Item 2
was already done before this queue existed. Not yet merged to `main` — still on the refactor
branch, awaiting review. The only unfinished thread is the foundational property/cluster/brand
scope switcher (its own section below) — Distribution's shape is explicitly unsolved there,
not a queue item to implement yet.

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
- **[OPEN]** The dashboard-card-grid pattern (`sketch: 'dashboard-cards'`) is built and
  documented but not wired onto Insights' own Dashboard item, which still has `content: null`
  — needs real card titles first; only "Property Status" is confirmed anywhere in the docs
  (`CONTEXT.md`'s usage-data reference points).
- **[OPEN]** The real-names breadcrumb exception (showing real item names instead of skeleton
  bars) was applied to BOTH the properties and systems pickers, on the reasoning that both
  feed a crumb via the identical mechanism — this wasn't explicitly asked for one specific
  picker vs. both, flagged for a quick sanity check that applying it evenly was the right call.
- **[OPEN, user-reported]** Breadcrumb shows a stale/wrong 3rd segment once drilled into a
  specific property's own tabs, e.g. "Properties / Harbourview Hotel / **Property settings** /
  Integrated systems" should just be "Properties / Harbourview Hotel / Integrated systems."
  Root cause: `PROPERTY_NODE.label` is still literally `"Property settings"` (the earlier
  rename — Configuration's panel item "Property settings" → "Property," item 1 — deliberately
  did NOT touch `PROPERTY_NODE` itself, since it's shared/reused elsewhere) — and once inside a
  property, `PROPERTY_NODE`'s own tab strip is at depth > 0 so it crumbs using that stale
  label, per the standing "tabs at depth > 0 crumb using their own label" rule. **Fix
  (confirmed with user): drop this crumb segment entirely** — once inside a specific property,
  its own root-level tab strip (General information/.../Integrated systems) shouldn't add its
  own crumb segment at all, same treatment as any other depth-0-equivalent tabs root. Needs a
  small change to `renderChainBody`'s crumb logic for this specific case (PROPERTY_NODE reached
  via an explicit `properties` drill-down) — the crumb rule that currently keys off recursion
  `i > 0` needs an exception here, since PROPERTY_NODE's tabs are conceptually "the root" for
  that property even though they're not literally at chain index 0.

## Queued (not yet implemented) — new batch

**Progress: items 3 and 4 are DONE.** Item 3 (generalized `records` pattern + Users), along
with the breadcrumb bug fix from the "Known bugs" list above (both implemented together per
the dependency note, commit `cf4a20b`) — a real second bug was also found and fixed while
testing: a records picker with no wrapping tabs layer (Users) never got its own label crumb, so
the record-name crumb alone was suppressed by the generic single-crumb-is-noise rule. Item 4
(single-tab strips collapse, no strip shown) implemented as a general rule on the `tabs`
content type itself (commit after this note), reusing the same `options: []` convention the
`systems` branch already used for "one connected system, no picker." Item 5 (PROPERTY_NODE's
mirrored "Users" tab, always shown) and item 6 (rename "Manage products" -> "Add products" +
new action-row panel-list pattern) are also DONE — commits `8687f65` and `60d8a7b`. Full detail
in each commit message. Items 1 and 2, plus the scope-switcher placement move, are still queued.

1. **Front desk becomes a calendar page with NO L2 panel at all.** Currently a stub rail item
   with empty panel/canvas. New behavior:
   - Clicking Front desk hides the secondary panel column ENTIRELY (not just empty — the
     column itself disappears from the layout) so the calendar skeleton spans full width,
     rail-to-edge. User's stated reason: "this is what customers always want for the calendar
     is max space" — a real, confirmed product need, not a guess.
   - New 5th canonical page-skeleton type: a **calendar grid** (month/week grid of day cells,
     skeleton content per cell) — add to PATTERNS.md alongside list/table/stacked-cards/
     dashboard-cards, build as a new `sketch` value (e.g. `sketch: 'calendar'`).
   - **Structural note:** this is the first content item with NO secondary panel — every
     other section today always renders `renderPanel(data)` unconditionally in `render()`.
     Need a way for a section (or a specific item within one) to opt out of the panel
     entirely, not just render it with zero items. Check `render()`'s call to
     `renderPanel(data)`/`renderCanvas(data)` and the CSS grid/flex layout that currently
     reserves the panel's column width unconditionally.
   - Content: skeleton grid only for now, no real calendar data/events — no placeholders per
     project rules, this is purely the structural shape.
2. **Reshuffle Insights' item order.** The starred/pinned items (Weekly performance, Channel
   comparison, Portfolio health for multi-property) move from trailing after "My insights" to
   sit directly appended below "Dashboard" — forming one combined default-dashboards list.
   "Recommendations" moves to the END of the list (a separate concept from dashboards, per
   user's reasoning). Resulting order: Dashboard, [starred items], My insights, Recommendations
   — was: Dashboard, Recommendations, My insights, [starred items].
   - Implementation: reorder the `items` array in `buildSmContentTree`'s `insights` section in
     `nav-data.js` — no new mechanism needed, this is a pure ordering change within the
     existing data shape.
3. **Make Users clickable — a record-detail page with tabs, same pattern as Properties.**
   Today Users is a plain `sketch: 'list'` (flat skeleton rows, no per-row identity, no
   click-through at all) — this generalizes it to match how the Properties picker already
   works.
   - **New GENERIC content type, not a Users-specific one** — user's explicit direction: "we
     want this to all be very pattern based." Today's `type: 'properties'` is hardwired to
     recurse into the single shared `PROPERTY_NODE`; generalize it into a reusable "clickable
     records list → shared detail node" mechanism (e.g. rename/reshape as
     `type: 'records', names: [...], detailNode: <shared Node>` or similar — exact shape TBD
     at implementation time) so Properties AND Users are both just instances of the same
     pattern, not two similar-but-separate mechanisms. Document this as a named pattern in
     PATTERNS.md alongside the page-skeleton types (this one's a NAVIGATION pattern, not a
     canvas sketch — note the distinction there).
   - Users' own shared detail node: a `tabs`-type Node with tabs — **"User details"** (always
     present) and **"Properties"** (only for multi-property accounts) showing which properties
     that user has access to (a per-user access-scoping list/picker, analogous to
     Configuration's Properties picker but scoped to one user's permissions, not the whole
     account).
   - **Breadcrumb**: same shape as the existing Properties pattern — "Users / [user name]",
     landing on the user's detail tabs, e.g. "Users / Jane Smith" with [User details]
     [Properties] as the tab strip. Should fall out naturally once Users is a real
     `properties`-pattern instance, since that mechanism already produces this exact
     breadcrumb shape for the Properties case.
   - **Sample data**: use generic realistic full names (not real confirmed user data, not
     placeholder-style labels) — same treatment as the 5 sample property names already in the
     prototype (Harbourview Hotel, etc.) — confirmed with user, not guessed.
   - Depends on/relates to the queued breadcrumb fix above (stale "Property settings" segment)
     — both touch the same crumb-generation logic in `renderChainBody`'s handling of a
     records-style drill-down; worth implementing together to avoid touching that logic twice.
4. **New standing rule: a `tabs`-type node with only ONE tab shouldn't show a tab strip at
   all — collapse straight to that tab's content.** Caught via Users' new "User details" tab
   in single-property mode (no "Properties" tab there, so it's the only one) — showing a
   1-item tab strip is pointless UI, the same problem `type: 'systems'` already solves for a
   single connected system (collapses straight to sections, no picker). Generalize this as a
   rule for the GENERIC `tabs` content type itself, not a Users-specific fix — apply it
   wherever a `tabs` node resolves to exactly one visible tab (after `mpOnly` filtering, etc.),
   not just this one case. Likely affects: `buildUserNode`'s single-property case (just
   confirmed), and worth checking whether any other existing `tabs` node could ever resolve to
   exactly one visible tab under some account-type/property-count combination.
5. **PROPERTY_NODE gets a new "Users" tab — the mirror of USER_NODE's new "Properties" tab.**
   Shows which users have access to this property (the reverse relationship of item 3's
   USER_NODE "Properties" tab, which shows which properties a user has access to).
   - **Position:** last, after Integrated systems — PROPERTY_NODE's tab order becomes General
     information, Property details, Services, Policies, Media library, Integrated systems,
     Users.
   - **Gating: ALWAYS shown, not property-count-gated.** Unlike USER_NODE's "Properties" tab
     (multi-property-only, since a single-property account has nothing to scope), every
     property — single- or multi-property account alike — has users with access to it, so this
     tab is unconditional. Confirmed with user, not assumed by symmetry with the reverse tab.
   - **Consequence worth noting:** because this tab is always present, PROPERTY_NODE will
     always have ≥7 visible tabs regardless of account state — the new single-tab-collapse
     rule (item 4) never applies to PROPERTY_NODE itself, only to USER_NODE's single-property
     case. Don't read this item as contradicting item 4; they apply to different nodes.
   - Content: same page-type as USER_NODE's "Properties" tab (a list/picker) — a list of users
     with access to this property, sketch-only for now, no real access data.

6. **Rename "Manage products" → "Add products," give it a distinct visual treatment.**
   Confirmed with user: "Add products" more precisely signals its action (adding a new
   product to the account) than the settings-page items above it (Direct Booking, Channels
   Plus, Metasearch).
   - **Visual treatment: small "+" icon before the label** — same greyscale rules as
     everything else (no color), just an icon marking this as an ACTION row rather than a
     navigable settings destination, so it doesn't read as just another item in the list.
   - **New panel-list pattern, third kind alongside folder/heading** (PATTERNS.md's
     folder-vs-heading rule currently only names two categories): this is neither a folder
     (no children to expand) nor a grouping heading (it IS clickable, unlike a heading) — it's
     a plain clickable item like Direct Booking/Channels Plus, just with a leading icon marking
     it as an action rather than a page. Document this as its own small addition to
     PATTERNS.md's panel-list patterns section (e.g. "action row" or similar naming) rather
     than leaving it as a one-off — same "keep this pattern-based" direction as items 3/4.
   - Implementation: rename the `label` in `nav-data.js`'s Configuration items array; add a
     leading-icon rendering option to `renderPanel`'s item loop in `main.js` (a new per-item
     flag, e.g. `actionIcon: '+'` or similar — exact shape TBD at implementation time).

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

**Placement reconsidered (queued, not yet implemented):** the switcher currently renders as a
`<select>` at the very top of the L2 panel. User's instinct: doesn't love it eating into the
L2 panel's own space, leaning toward **top-right of the canvas** instead — keeps the main
panel real estate free for actual nav items, and reads more like a persistent page-level
control (alongside/near the breadcrumb) than a panel list item. Not decided as final, just the
current leaning — implement this reposition when picked back up, but don't treat it as locked
in either, same as the rest of this sketch.

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
