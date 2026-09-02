# Wireframe patterns

Reusable structural sketches for the canvas area. All patterns are pure skeleton —
grey blocks/bars suggesting shape and rhythm, never real labels, names, or copy (a
card's own **title** is the one exception: card titles are real text confirmed from
production screenshots, per the project's "real titles, wireframe content" rule).

Adding a new pattern? Add it here first (name, when to use it, the exact classes),
then implement it in `renderSketch`/`renderSectionShape` in `src/main.js` and the
matching rules in `src/style.css`. Keep this file and the code in sync — this is the
single reference for "how do I wireframe X," not a description that can drift.

**See `nav-data.js`'s top comment** for the full retrofit table — every existing
item's assigned page-skeleton type, kept explicit rather than implicit
(CHANGE-QUEUE.md item 7). Update that table whenever an item's content/type changes.

## Top-level canvas sketches (`content.sketch`)

These render as the whole content of a `sketch`-type node (a tab, a leaf item).

| `sketch` value | Renders | Use for |
|---|---|---|
| `'sections'` (aka **stacked cards**) | Stacked cards, each with a real title + a section-shape sub-pattern (below) | Settings pages made of multiple labelled cards (Property settings' tabs, Integrated systems) |
| `'media'` | A grid of `.sketch-card` blocks (4:3 aspect ratio) | Photo/media grids (Media library) |
| `'list'` | A `.wf-list` of skeleton rows, full-width | A flat list of records with no further per-row detail (Users, Health check's tabs) |
| `'table'` | A `.sketch-table` — real header row (`content.columns`), skeleton cells | A record list needing more than one visible field per row |
| `'calendar'` | A month-calendar PRESET of `'grid'` (see below) — 7 weekday columns, 5 rows, no row labels | Calendar/scheduling views needing maximum canvas space (Front desk) |
| `'grid'` | A `.sketch-grid` — real column headers, OPTIONAL real row labels down the left, skeleton fill per cell | Any grid/matrix-shaped page — a room-type × date inventory matrix, or anything calendar-like that isn't specifically a month view |

These are the project's canonical page-skeleton types (list / table / stacked cards / card
grid / calendar+grid — see "Dashboard card grid" below for the 4th, and "Navigation dashboard"
further below for the 6th, a NAVIGATION pattern rather than a `sketch` value, so it isn't in
this table). Not a closed set — add a new one here first when a genuinely new page shape comes
up, following the same "skeleton content, real titles/headers only" rule as everything else.

**`'grid'` is the generic mechanism; `'calendar'` is one named preset of it** — generalized
this way (Distribution batch item 4) so the SAME renderer covers both a month calendar
(columns only) and a matrix with real row labels (e.g. Inventory's room types down the left),
rather than hardcoding a 7-column month shape everywhere a grid is needed.

```js
{ type: 'sketch', sketch: 'grid', columns: string[], rows?: string[], rowCount?: number }
```

- `columns` (required) — real column header labels.
- `rows` (optional) — real row label text, one row per entry. When given, the row count comes
  from `rows.length`, `rowCount` is ignored, and a labelled column renders down the left
  (`.sketch-grid__row-label`).
- `rowCount` (optional, default 5) — used only when `rows` is omitted, for a plain grid with no
  row labels (calendar's case).
- **Keep the header's and body's `grid-template-columns` in sync** — they're both set inline
  from the same computed string in `renderGridSketch` (`main.js`); a prior version only set it
  on the body, so the header's labels stacked vertically instead of aligning with the columns
  below — don't reintroduce that by setting one without the other if this pattern is ever
  touched again.

**Calendar pairs with `noPanel: true`** (a section-level flag, not a `sketch` option) — see
"No-panel sections" below. Not every calendar/grid-shaped page necessarily needs `noPanel`;
Front desk does because customers always want maximum space for it — a real, confirmed product
need, not an assumption that calendars always warrant it.

## No-panel sections (`data.noPanel: true`)

Not a canvas sketch — a SECTION-level flag (set on the object `getContent` returns per rail
section, e.g. `tree['front-desk']`, not on an individual item's `content`). When true,
`render()` hides the secondary panel column entirely (`display: none`, not just empty —
emptying it alone still reserves its fixed 240px width in the flex layout) so the canvas gets
the full combined width. Use only when a page has a genuine, confirmed need for maximum
canvas space and no real use for a secondary panel (Front desk's calendar is the only
instance so far) — this is a rare exception, not a general escape hatch from building a real
L2 panel.

## Section-shape sub-patterns (`shape`, inside a `'sections'` card)

Each card in a `'sections'` sketch has a real `title` plus one shape describing what's
under it:

| `shape` value | Renders | Use for |
|---|---|---|
| `'field'` (default) | 2 stacked skeleton fields (label bar + value bar) | A card with a couple of simple settings (Currency, General settings) |
| `'chips'` | A wrapped row of 7 `.sketch-chip` pills | A card whose content is a set of toggle-able tags (Inventory settings' sync directions) |
| `'cols'` | Two columns of 3 skeleton fields each | A card with a two-column field layout (Contact, Reservation mappings) |
| `'list'` | 3 stacked skeleton fields, single column | A card whose content is itself list-like but doesn't need the full `.wf-list` treatment (Credit card mappings) |

**Note:** `shape: 'list'` (a card's internal shape) and `sketch: 'list'` (a whole
page that's just a list) are different things at different levels — don't confuse
them when adding new sections.

## The reusable list component (`.wf-list`)

One consistent pattern for **any** list of rows — clickable or not. Always use this
rather than inventing a new list style.

```html
<ul class="wf-list">
  <li><a href="#" class="wf-list__row wf-list__row--sketch" data-path-key="...")></a></li>
  <!-- or, for a non-clickable static list: -->
  <li class="wf-list__row wf-list__row--sketch"></li>
</ul>
```

- `.wf-list` — the container: consistent margin, gap, full-width (was max-width
  520px; changed per CHANGE-QUEUE.md item 7 to fill the available content area).
- `.wf-list__row` — one row: bordered card, 48px tall, centered content.
- `.wf-list__row--sketch` — renders a centered skeleton bar instead of real text.
  Used for both the properties/systems picker (rows are real links, `data-path-key`
  drives navigation, but the *visible* content is still a skeleton bar — no real
  property/system names shown) and plain sketch lists (Users, Health check's tabs).
- `.wf-list__row--starred` — adds a small greyscale star icon to a row (see
  `.nav-list-item__star` for the matching panel-list version). EXPLORATORY,
  non-functional — illustrates "this was starred," no real interaction.
- Add `a.wf-list__row` (an `<a>` tag with the class) when a row needs to be
  clickable; a plain `<li class="wf-list__row ...">` when it's static.

**Exception — real item names ARE allowed, narrowly.** The default is skeleton-only
(no real names), but a list whose selection feeds a breadcrumb drill-down (e.g. the
Properties picker) may show real names instead of skeleton bars specifically to make
the resulting breadcrumb legible (so "Properties / [skeleton bar]" doesn't read as
broken). This is a deliberate, narrow exception — NOT a blanket rule. Plain
non-drilling lists (a user's own "Properties" access list, Health check's tabs)
stay skeleton-only. Don't let this exception creep to every list without a
fresh decision each time.

Use `.wf-list` for: the records picker (Properties, Users — see the Records
pattern below), the systems picker, Health check's tabs, and any future flat
list with no more than one visible field per row (reach for `.sketch-table`
instead once a row needs multiple visible fields).

## Navigation pattern: Records (`type: 'records'`)

Not a canvas sketch — a NAVIGATION pattern (part of the content-model shape in
`nav-data.js`, not a `sketch` value). Use whenever a flat list of clickable
names should each open the SAME shared detail page.

```js
{ type: 'records', names: string[], detailNode: Node | (() => Node), display?: 'table', tableColumns?: number }
```

- `names` — real names, rendered via `renderRecordPicker` (`.wf-list`, real
  text per the breadcrumb-clarity exception above) by default.
- `detailNode` — one shared Node (usually `type: 'tabs'` or `type:
  'nav-dashboard'`) that every record opens. The SAME node reference for every
  name — there's one shared detail shape, not one Node per record.
  **Can also be a zero-arg FUNCTION (thunk)** instead of a plain Node —
  REQUIRED whenever two `records` pickers cross-reference each other (e.g.
  `buildPropertyNode`'s Users tile opens `buildUserNode`; `buildUserNode`'s
  Properties tab opens `buildPropertyNode`). Calling either builder EAGERLY
  inside the other's return value recurses forever — a real caught
  `RangeError: Maximum call stack size exceeded`, not a theoretical risk.
  `resolveChain`'s `records` branch resolves a thunk lazily
  (`typeof content.detailNode === 'function' ? content.detailNode() :
  content.detailNode`), only once a name is actually clicked. Pass a plain
  Node whenever there's no cycle — a thunk is only needed for genuinely
  mutual references.
- `display: 'table'` (optional) — renders the same real, clickable names as a
  table-styled skeleton instead (`renderRecordTable`, `.sketch-table` +
  `.sketch-table__name-link`) — first column real + clickable, remaining
  columns (`tableColumns`, default 3) skeleton-only, no real headers at all
  (same titleless-skeleton convention as everywhere else — this is a table's
  SHAPE, not confirmed column content). Every other `records` caller omits
  this and keeps the plain list — additive, not a replacement.
- Breadcrumb: "[picker label] / [record name]" once a record is picked, then
  the detail node's own tabs render with no additional crumb segment of their
  own (the detail node is treated as a new root once reached this way — see
  `renderChainBody`'s `isDetailNodeRoot` handling in `main.js`).
- `crossNav: true` (optional) — marks this picker as a CROSS-NAVIGATION point
  between two entities that reference each other (e.g. a user's Properties
  tab and a property's Users tile). Without this, repeated back-and-forth
  navigation between two such pickers accumulates every hop into one
  ever-growing breadcrumb — a real bug, caught live: "Users / Jane Smith /
  Properties / Harbourview Hotel / Users / Jane Smith," the same names
  repeated, reading as click history rather than current position. When
  `crossNav` is set, picking a record tags its crumb `resetTrail: true`;
  `breadcrumbHtml` slices the DISPLAYED trail to start from the last such
  crumb (once, at final render) — `state.path` itself is untouched, so
  routing/`truncateTo` behavior is unaffected, only what's shown. Every
  other `records` caller (Properties/Users from Configuration's own list,
  Dashboards, Charts, Yield rules, Rate plans) omits this and keeps the
  normal accumulating trail.

**Existing instances:** Properties (`names: SAMPLE_PROPERTIES`, `detailNode:
buildPropertyNode(...)`), Users (`names: SAMPLE_USERS`, `detailNode:
buildUserNode(...)`) — these two ALSO cross-reference each other one level
deeper (a property's own Users tile, a user's own Properties tab — both use
thunks, see above), and Rate plans (`names: SAMPLE_RATE_PLANS`, `display:
'table'`, `detailNode: buildRatePlanNode(...)` — a `nav-dashboard`, see
below). All are the SAME mechanism — never add a new content type for "a
picker that opens a shared detail page." Reuse `records` and give it a new
`detailNode`.

## Dashboard card grid (`sketch: 'dashboard-cards'`)

Distinct from `'media'` (4:3 photo cards): a metric/chart-style card, for
dashboard-style landing pages (Insights' own Dashboard, and every custom
dashboard/chart via `CUSTOM_DASHBOARD_NODE` — same skeleton for both, per
user's direction: "the custom dashboards would use the same skeleton").

```js
{ type: 'sketch', sketch: 'dashboard-cards', cards: [{ title?, shape: 'chart' | 'stat' }] }
```

**Confirmed: NO titles at all, ever, even a single confirmed one.** An earlier
version put one real title ("Property Status") on the first card and left the
rest titleless — user explicitly reversed this: mixing a real title with
skeleton ones "gets weird," and the page is meant to read as a full page of
cards, not one confirmed metric plus filler. `title` stays supported as an
option in the code (in case a fully-titled dashboard is confirmed later) but
every dashboard-cards instance in this project uses skeleton titles only —
don't add a real title without explicit confirmation this has changed.

The skeleton title bar (`.sketch-dashboard-card__title-skel`) is sized larger
than a typical skeleton label, per "make them larger" — it's standing in for
a real heading, not a minor field label.

## Navigation dashboard (`type: 'nav-dashboard'`)

NOT a canvas sketch either — like `records`, a NAVIGATION pattern (part of the
content-model shape, not a `sketch` value). Easy to confuse with
`dashboard-cards` above since both render a grid of cards — the difference is
functional, not visual: `dashboard-cards`' cards are inert (stat/chart
placeholders, a data-display page); `nav-dashboard`'s TILES are real
navigation destinations (clicking one routes deeper, breadcrumb-relevant),
structurally closer to `tabs` than to `dashboard-cards`.

```js
{ type: 'nav-dashboard', tiles: Node[] }
```

**Two distinct modes — pick per node, don't default to one:**

- **(a) Standalone** — replaces a tab strip entirely. `tiles` are real child
  Nodes with their own `content` (NOT one shared detail node for all of them,
  unlike `records`). Clicking a tile pushes a real path level, same as
  `resolveChain`'s `tabs` branch does for a tab — but **unlike `tabs`, the
  tile grid does NOT stay visible once a tile is picked**: the breadcrumb
  takes over as the way back (`renderChainBody`'s `nav-dashboard` branch
  returns straight to the inner content once `selectedKey` is set, same
  "picker disappears once committed" shape `records` already uses, not
  `tabs`' persistent strip). No `active` default — this is a landing page,
  nothing is picked until a tile is clicked. Use this when a tab strip would
  genuinely be too wide (7+ tabs) — it both overloads the tab bar and leaves
  the L2 sidebar sitting idle once drilled in. **Target case, NOT YET
  built:** `PROPERTY_NODE`'s 8 tabs (Config → Properties).
- **(b) Nested inside one tab of a normal `tabs` node** — the tab strip
  stays exactly as it always would; one tab (usually a default "Overview")
  has a nav-dashboard as its OWN content. Tiles use `linksToTab: <sibling
  tab key>` instead of their own content — clicking one just SWITCHES the
  active sibling tab (same effect as clicking the tab strip directly), no
  new path level, tab strip never disappears. Mechanically: `resolveChain`'s
  `tabs` branch stamps its own `pathIndex` onto the nested nav-dashboard as
  `content.parentTabsPathIndex` at the one point the two node types meet; a
  `linksToTab` tile's link then targets THAT index (see `renderChainBody`'s
  `targetPathIndex`), not a level of its own. Use this when the tab strip
  isn't overloaded but would benefit from a richer, status-aware landing
  view than jumping straight to the first tab's raw content. **Built
  instance:** Rate plans (`buildRatePlanNode` in `nav-data.js`) — see below.

Both modes share the same tile rendering (`renderNavDashboard`): a leading
skeleton block (`.nav-dashboard__tile-metric-skel` — hints "a metric could
show here," shape only, no real content decided), the tile's own real,
confirmed title (the tile's label IS the heading — no separate grouping
heading above clusters of tiles), an OPTIONAL status tip
(`tile.tip` — a real string once decided, e.g. "2 channels not connected,"
or a skeleton bar otherwise; `.nav-dashboard__tile-tip`/`-skel` — not live
data, just the shape of a tile that can carry one), and a trailing `›`
chevron marking it as a link (`.nav-dashboard__tile-chevron` — same visual
role as a folder's `.nav-list-item__chevron`, but for a canvas tile, not a
panel-list row).

**Optional page composition — `content.title` and `content.extraSections`:**
a nav-dashboard's tile grid can carry an optional heading above it
(`title`, e.g. "Configuration") and optional STACKED, purely decorative
sections below it (`extraSections: [{ title, content }]`, each `content`
any existing `sketch` value, rendered via the same `renderSketch`
dispatcher every sketch-only leaf uses — see `renderNavDashboardPage` in
`main.js`). The tile grid's own routing is completely unaffected — tiles
stay fully clickable exactly as before; only the surrounding page grows.
Extra sections are NEVER navigable — this is a display composition around
the one routable element, not a new content type every node needs to
support. Use this when a nav-dashboard's landing page needs more than just
tiles (e.g. Rate plans' Overview: a "Configuration" heading over the
existing tiles, then "Performance" — a few `dashboard-cards` chart widgets
— and "Adoption" — a channel-adoption/distribution snapshot, currently
`sketch:'grid'`, skeleton-only, no real columns/rows confirmed yet).

**Why this exists — the "tabs move a level deeper" model, revised to two
modes after a direct reversal** (see CONTEXT.md's candidate-model writeup
for the full reasoning trail): first built as mode (a) only, applied to
Rate plans — then the user reversed that specific choice on seeing it:
"I now realise Rate plans don't need the extra level, but they could maybe
benefit from this as a sub-dashboard under a default tab heading." Config →
Properties (`PROPERTY_NODE`) was confirmed to still need mode (a) — "I
think we will need the extra level" — so the type was generalized to
support both rather than picking one, per explicit instruction: "keep this
as a page type that can appear in a tabbed view or a non tabbed view."

**Built instance (mode b):** Rate plans' detail (`buildRatePlanNode` in
`nav-data.js`) — tab strip Overview/Rooms/Channels/Connectivities/Properties
(Properties only for MP/multi-property, same `showProperties` gating
`buildUserNode`'s own "Properties" tab uses); "Overview" (default/active)
holds the nav-dashboard, its tiles (`linksToTab`) switching to the matching
sibling tab. Rate plans' list itself also changed alongside this — now a
table skeleton (see the `records` section's `display: 'table'` above), not
a plain list. Tile set explicitly NOT closed — "there will be others I
haven't thought of yet." Every current tile leaves `tip` unset (renders as
skeleton) — no real status wording/data decided yet.

**Built instance (mode a):** `PROPERTY_NODE` (Config → Properties) — the
actual tab-overload case this pattern was originally built to solve. Its
old 8-tab strip is gone; tiles are Property details / Channels /
Connectivities / Integrated systems / Users. NOT a straight 1:1 conversion
of the old tabs — most of them moved a level deeper:

- **Property details** (tile) drills into a NEW sub-node
  (`PROPERTY_DETAILS_NODE`, a normal `tabs` strip): General information /
  Room types / Services / Policies / Media library. Most of the old 8 tabs
  live HERE now, not as top-level tiles — "those move to a level under
  property details, or at least most of them."
- **Channels, Connectivities** (tiles) — brand new, mirroring Rate plans'
  own tile names; same best-guess `sketch:'list'` stub.
- **Integrated systems, Users** (tiles) — deliberately kept at the TOP
  level rather than folded under Property details — "users and integrated
  systems move to the top level."
- The OLD tab literally named "Property details" (Property/Contact/Extra
  information fields) collided with the NEW top-level tile of the same
  name — resolved by merging its fields into General information (now 6
  sections: Currency/Inventory/Language and region/Property/Contact/Extra
  information) rather than keeping two same-named things at different
  levels.

**Bug caught and fixed here — crumb duplication on a standalone tile whose
destination node shares its label:** `isDetailNodeRoot` (the check that
stops a step's OWN node-label crumb from doubling up with the crumb its
parent step already added) originally only covered a `records` pick. A
standalone (mode a) `nav-dashboard` tile pick needed the exact same
treatment and didn't have it — clicking "Property details" (the tile)
showed "Property / Property details / Property details" (the tile's own
crumb, then `PROPERTY_DETAILS_NODE.label`'s crumb, both "Property details").
Fixed by extending `isDetailNodeRoot` in `renderChainBody` to also treat a
standalone `nav-dashboard` step (no `parentTabsPathIndex`, i.e. not mode b)
as a detail-node root, same as `records`. Mode (b) tiles (Rate plans) were
never affected — they don't push a path level at all, so no double crumb
was possible there.

## Not yet built

- **Card list** — a list where each row is a card-shaped block (bigger than
  `.wf-list__row`, room for more visual weight) rather than a thin row. Not
  implemented yet.

## Design constraints (apply to every pattern)

- **Greyscale only.** No color anywhere — not even for "selected" states, which use
  weight/fill, not hue. (See `feedback_ia_prototype_greyscale` memory.)
- **No placeholder content.** Only add a pattern instance for a real, confirmed
  screen — never invent filler cards/rows/fields to fill space.
- **Card titles are real; everything under them is skeleton.** This is the one
  place actual text appears — confirmed from a production screenshot or an
  explicit decision, never guessed.
- **Standard content-area margin: `.sketch` (24px padding) wraps the ENTIRE canvas
  body exactly once, applied by `renderCanvas` — never per-branch inside the
  tree walk.** A prior version applied `.sketch` inside `buildCanvasBody`'s tabs
  branch only, so (a) a leaf item with no tabs anywhere in its ancestry (Users,
  Channels, Manage products) got no padding at all, rendering flush against the
  canvas edge, and (b) a tabs-within-tabs case (e.g. Properties → a specific
  property's own tabs) got double-padded (48px) since each nesting level added
  its own wrapper. When adding a new content type or nesting case, never add
  your own `.sketch`/margin wrapper — it's handled once, upstream, always.

## Panel-list patterns (the left sub-nav, not the canvas)

Three different things can sit in the panel item list — don't conflate them:

| Pattern | Behavior | Example |
|---|---|---|
| **Folder** (`content.type: 'list'`) | Collapsed by default, chevron, clicking expands/collapses (does NOT navigate), children hidden until expanded | Direct Booking, My insights |
| **Grouping heading** (`{ heading: true, label }`) | Always-expanded, no chevron, never clickable — purely visually clusters already-visible sibling items under a label | Products |
| **Action row** (`{ actionIcon, ... }`) | Plain clickable item, same as any normal panel item, but with a leading icon marking it as an ACTION (does something) rather than a navigable settings page | Add products (`+`); My account's Support code (`?`) and Logout (power icon) |

Use a folder when the label is itself a nav concept whose children are hidden
until opened. Use a heading when you're just visually clustering already-visible
items with no expand/collapse. Use an action row's `actionIcon` when an item is
functionally an action (add/create/manage-as-a-verb) rather than a destination,
so it doesn't read as just another settings page in the list — the icon is the
only difference from a normal item; it's still a real Node with a real `key`
and routes/selects normally. Heading items are filtered out before
`resolveSelected`/`resolveChain` ever see them — they can never become "the
routed item," even via a `nodes[0]` fallback. Action rows are NOT filtered out
this way — they're real, routable items, just visually marked.
