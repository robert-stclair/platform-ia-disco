# Change queue

Running list of requested changes to batch and implement together, instead of one at a time.
Add to this as you type out requests; nothing here gets implemented until you say go.

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
4. **Add a "Products" grouping** in Configuration's panel:
   - New heading "Products", placed after Property(/Properties) and Users.
   - Items moved under it: Direct Booking, Channels Plus, Metasearch (new, from #3).
   - After the grouped items, a "Manage products" row.
   - Resulting Configuration order: Property/Properties, Users, — Products — Direct Booking,
     Channels Plus, Metasearch, Manage products.
   - Open question: does "Manage products" need any content/click-through yet, or is it a
     stub row for now (no placeholder content per project rules, but confirm it should even
     render as clickable)?
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
6. **Add "Health check" to Distribution's panel.** New L2 item, LAST in the order: Inventory,
   Rate plans, Yield rules, (Properties if shown), Health check. Stub for now —
   `content: null`, same treatment as Channels Plus (renders, selectable, empty canvas, no
   placeholder content until real content is confirmed).
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

## Open questions

- **"Manage products" row** — what should clicking it do? Leave as `content: null` (renders,
  selectable, empty canvas) like Channels Plus currently does, or is this meant to be
  something more specific? Default assumption unless told otherwise: same stub treatment as
  Channels Plus today.
- **Products heading visual treatment** — this is a new nav pattern (a plain grouping label
  within a panel list, not a clickable item). Need to add this as a real pattern (pure CSS
  label, not a Node) — confirm this shouldn't itself be tracked in PATTERNS.md once built.
- **LH's account-type-specific rail differences beyond Front desk** — is Front desk the ONLY
  rail difference for LH, or are there other L1/L2/L3 differences from SM still to come? Also:
  does LH's "same as SM" content include the account-type/property-count Properties-gating
  logic unchanged (i.e. an LH account with multiple properties still gets a Properties tab
  the same way SM does), or does LH have its own property-count story?

## Done (moved here once implemented, then cleared)

<!-- implemented items land here temporarily so you can see what just shipped, then get cleared next time this file is reset -->
