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
| `'chat-start'` | `.chat-start` — a centered skeleton greeting bar, 3 skeleton "suggested prompt" chips, and a skeleton input bar pinned near the bottom | The AI assistant's fresh-chat landing screen — a wireframe of a chat START state, not any specific conversation's transcript |
| `'message-view'` | `.message-view` — a subject-line skeleton bar, a shorter meta-line bar, then 5 body-paragraph skeleton lines at varied widths | Notifications' detail page — deliberately NO real text anywhere, not even a card title (unlike `sections`' own "real titles" exception) — "make the main view totally skeleton with no words" |

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
| `'theme-toggle'` | A real, clickable System/Light/Dark toggle, styled as 3 plain skeleton bars (no visible label text) inside the `.scope-toggle` shell | The ONE deliberately live (non-skeleton-only) control in this prototype — My account → Preferences' Theme card. See "Live theme toggle" below. |

**Note:** `shape: 'list'` (a card's internal shape) and `sketch: 'list'` (a whole
page that's just a list) are different things at different levels — don't confuse
them when adding new sections.

**Live theme toggle (`shape: 'theme-toggle'`) — the one exception to "every
section is decorative skeleton only."** Built when the user asked to move the
theme control out of the hidden prototype settings sheet into My account →
Preferences as its real home ("move your colour theme from the proto overlay
into there"), then clarified the visual treatment: "make it a skeleton - but
make it work!" So it LOOKS exactly like every other section's skeleton content
(plain bars, no visible "System"/"Light"/"Dark" text) but is fully wired
underneath — each bar is a real `data-theme-choice` button
(`renderThemeToggle` in `main.js`), reusing the same `applyTheme`/
`THEME_STORAGE_KEY` mechanism a settings-sheet version used before this MOVED
here (not duplicated — the settings sheet no longer has a Theme group at
all). Wiring is done via `wireThemeToggle()`, called every render from
`renderCanvas` — NOT a one-time `querySelectorAll` at page load (which is how
every other hidden-settings-sheet toggle still works, since those buttons are
static in `index.html`); this control instead renders fresh into the canvas's
`innerHTML` each time Preferences is shown, so a one-time wiring pass would
only ever find it the first time and go stale after any later re-render. Only
add another genuinely-live control to this prototype with the same
explicit go-ahead — the skeleton-only convention is the default for a reason
(this repo tests navigation MODELS, not working features).

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
{ type: 'records', names: string[], detailNode: Node | (() => Node), display?: 'table', tableColumns?: number, showSnippet?: boolean }
```

- `names` — real names, rendered via `renderRecordPicker` (`.wf-list`, real
  text per the breadcrumb-clarity exception above) by default.
- `showSnippet` (optional) — an email-inbox-style row instead of the plain
  single-line default: the real name stays the title, plus a second SKELETON
  line underneath standing in for a preview/summary (`.wf-list--snippets`,
  `.wf-list__row-snippet-skel`) — not real preview text, same "real titles,
  skeleton content" rule as everywhere else. Built for Notifications: "have
  the summaries stacked in the L2 panel and the detail in the main panel -
  just like an email browser might have it." Every other `records` caller
  (Properties, Users, Dashboards, Charts, Yield rules) omits this and keeps
  the plain single-line row — additive, not a replacement.
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
- `homeItemKey: string` (required alongside `crossNav: true`) — names which
  rail L2 item the picker's `detailNode` DESTINATION conceptually belongs
  to. Needed because the rail/L2 panel's highlight only ever reads
  `state.path[0]`, but a crossNav pick happens deeper in the tree and never
  touches that index — without this, the rail stayed stuck on whichever
  item the user originally entered through even after cross-navigating
  somewhere conceptually different (caught live: Property → Users tile →
  a user left "Properties" highlighted instead of "Users"). `main.js`'s
  `findCrossNavHomeItemKey` walks the resolved chain for the deepest
  explicit crossNav step and returns its `homeItemKey`; `renderPanel` uses
  it to override the plain `state.path[0]` lookup when present. Can vary by
  account type when the destination's own rail key does — e.g.
  `buildUserNode`'s "Properties" tab uses
  `showProperties ? 'properties-config' : 'property-settings'`, matching
  `buildConfigurationPropertiesItem`'s own branching.

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

## Panel-item badge (`item.badge: true`)

EXPLORATORY, non-functional and STATIC — illustrative "something needs
attention" dot (`.nav-list-item__badge`), no count, rendered next to a panel-
list item's label (same slot as the `starred` indicator, before the chevron).
Grew out of CONTEXT.md's notification candidate-model: rather than inventing a
separate badge/alert system per area, the GLOBAL "something needs attention"
surfaces already in this app — Health check and Dynamic pricing (broken-
flavored) and Recommendations (optimize-flavored) — get this badge directly
on their own L2 panel item. Deliberately scoped to the L2 item only, NOT the
rail icon — avoids the larger, unresolved question of rail-level badge
aggregation.

**Color is a DELIBERATE exception to this project's greyscale-only rule** —
user: "make the dot red - it doesn't really parse as black." Uses a new
`--alert` CSS token (light + dark values defined once alongside the other
theme tokens), scoped to just this element — not a general accent color for
the rest of the app.

**Static, not dismissible — a real interaction was explored and dropped.** A
dismiss-on-visit behavior (clear once the item is routed, later refined to
reset per section-visit rather than per session) was built, then the user
reconsidered: "maybe it's too much to bother with the dismiss?" Reverted to a
plain always-on dot — nothing in this prototype tracks real resolved/
unresolved state, so a dismiss interaction wouldn't represent anything real
underneath it. The intended real-product behavior (badge clears once its
underlying issue is addressed) is documented as INTENT in CONTEXT.md, not
simulated in code — don't rebuild the dismiss logic without picking this back
up directly.

**Existing instances:** Health check (`HEALTH_CHECK_ITEM`), Recommendations,
Dynamic pricing.

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
metric-skeleton block (`.nav-dashboard__tile-metric-skel` — hints "a real
metric/icon could show here," shape only, still no real content decided),
the tile's own real, confirmed title (the tile's label IS the heading — no
separate grouping heading above clusters of tiles), and TWO SEPARATE
optional status fields, not one:

- **`tile.stat`** — an always-on, factual summary (e.g. "5 channels
  connected, 2 awaiting setup") — real text once decided
  (`.nav-dashboard__tile-stat`), a skeleton bar otherwise
  (`.nav-dashboard__tile-stat-skel`). This is what the tile's own status
  line has always been building toward — "all tiles would have key stats
  like that."
- **`tile.tip`** — an OPTIONAL attention callout (e.g. "Not connected to a
  PMS"), only on SOME tiles, and deliberately NOT a replacement for `stat`
  — "and then sometimes a callout for something that needs attention." Its
  TEXT does not render on the dashboard tile — see below.

A trailing `›` chevron marks the tile as a link
(`.nav-dashboard__tile-chevron` — same visual role as a folder's
`.nav-list-item__chevron`, but for a canvas tile, not a panel-list row).

**`tile.tip`'s presentation — revised after the dashboard read as too
alarming.** A first version rendered `tip` as a small badged chip right on
the dashboard tile (colored text + dot on a tinted background). With 3+
tiles carrying one at once on the SAME dashboard, that read as stacked
alarm/negative noise, not the "optimize" framing this concept is supposed
to have — the user's own catch, live: "it might be too much negative noise
on the dashboard level." Revised to a two-tier disclosure instead:

- **On the dashboard tile:** just a plain dot next to the title
  (`.nav-dashboard__tile-dot`) — same visual language as the panel-item
  badge (`.nav-list-item__badge`). Signals "something to look at here,"
  no wording, no color-block chip. Calm at a glance even with several
  tiles carrying one.
- **On the tile's own destination page:** the actual tip text, as a
  banner prepended above the page's content (`renderTileTipBanner` in
  `main.js`, `.tile-tip-banner` in `style.css` — reuses the same
  `--alert`/`--alert-tint` tokens the old chip used). One callout on its
  own page reads as normal page-level messaging, not stacked noise — "show
  them in more detail when user clicks through." Wired into
  `renderChainBody`'s `nav-dashboard` branch: once a tile is selected,
  its `tip` (if any) renders as this banner ahead of the tile's own
  content.

This is still the "navigation also becomes recommendation" idea — a nav
surface that doubles as a nudge toward what's missing — just disclosed in
two steps (a quiet signal at the list level, the real explanation one
click in) rather than announcing everything at once.

**Built instance of stat+tip:** every tile on `buildPropertyNode` (Config →
Property) — see its "Built instance (mode a)" section below for the exact
wording per tile. Rate plans' Overview tiles (mode b) haven't adopted this
yet — no `stat`/`tip` set there, so they still render the plain skeleton
bar; a legitimate next step, not yet requested.

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

**Built instance (mode a):** `PROPERTY_NODE`/`buildPropertyNode` (Config →
Properties) — the actual tab-overload case this pattern was originally
built to solve. Its old 8-tab strip is gone; current tile set is Property
details / Room types / Media library / Channels / Integrated systems /
Users, THE SAME for every account type (Users only for multi-property —
`showProperties` gating, same as `buildUserNode`'s own "Properties" tab).
A single-property-only flattened variant (Room types/Media library as flat
rail items instead of tiles, via a since-removed `includePropertyLevelTiles`
parameter) was tried and explicitly reverted — the card grid is kept for
every account type because it's the one surface that can carry a `tile.tip`
contextual nudge; a flat rail item has no equivalent slot. See CONTEXT.md's
"Confirmed principle" writeup for the full back-and-forth. NOT a straight
1:1 conversion of the old tabs — most of them moved a level deeper, then
some were lifted back out:

- **Property details** (tile) drills into a NEW sub-node
  (`PROPERTY_DETAILS_NODE`, a normal `tabs` strip): General information /
  Services / Policies. Room types and Media library originally lived here
  too, but were both later lifted back OUT to their own top-level tiles
  ("lift room types to the property layer rather then property details";
  "lets move media library up a level as well") — they read as
  property-level things in their own right, not sub-pages of Property
  details.
- **Room types, Media library** (tiles) — property-scoped concepts,
  promoted out of Property details' tab strip, same treatment for every
  account type (see the reverted single-property flattening attempt
  above). Room types is still a plain `sketch:'list'` (no generic/shared
  room-type concept exists); Media library still `sketch:'media'`.
- **Channels** (tile) — brand new, mirroring Rate plans' own tile name;
  best-guess `sketch:'list'` stub. Lives on the dashboard ONLY — a
  redundant flat Config L2 "Channels" item (a leftover `content: null`
  stub above the "Products" heading) was removed once the general Config
  L2 model was stated explicitly (see PATTERNS.md/CONTEXT.md's "Property
  dashboard + Products, plus efficiency exceptions" model, and
  `buildConfigurationPropertiesItem`'s own header comment in
  `nav-data.js`) — Channels was considered for the same "efficiency
  exception" treatment Users gets and explicitly rejected.
- **Integrated systems** (tile) — kept at the TOP level rather than folded
  under Property details — "users and integrated systems move to the top
  level." The standalone Connectivities tile that used to sit alongside it
  has been REMOVED — Connectivities and Integrated systems are the same
  concept, named differently by account type (see CONTEXT.md's open
  threads); Integrated systems is now the only tile for it here. (Rate
  plan's own separate Connectivities tab/tile is untouched — that
  consolidation is still open there.)
- **Users** (tile) — multi-property accounts only. A single-property
  account has no "which users have access to THIS property" question
  distinct from "which users are on the account," so the tile would
  duplicate Config → Users — "dont show users under property for a single
  property account."
- The OLD tab literally named "Property details" (Property/Contact/Extra
  information fields) collided with the NEW top-level tile of the same
  name — resolved by merging its fields into General information (now 6
  sections: Currency/Inventory/Language and region/Property/Contact/Extra
  information) rather than keeping two same-named things at different
  levels.
- **Contextual recommendations, then generalized into stat+tip for every
  tile:** Property details, Channels, and Integrated systems first got real
  `tip` text ("2 required fields missing" / "No channels connected yet" /
  "Not connected to a PMS") — gap/opportunity-framed, matching this
  concept's "optimize" flavor (see CONTEXT.md's three-way notification
  model). That later generalized (see "Navigation dashboard" above) into
  the two-field stat+tip model applied to ALL 6 tiles. CURRENT wording:
  Property details (stat "6 sections complete" + tip "2 required fields
  missing"), Room types (stat "4 room types" + tip "1 missing media"),
  Media library (stat "7 photos uploaded", no tip), Channels (stat "5
  channels connected, 2 awaiting setup" — its original tip text moved into
  the stat, since it's routine status, not an attention callout),
  Integrated systems (stat "0 systems connected", NO tip — "Not connected
  to a PMS" was tried and dropped: "lets lose the not connected to a pms
  for now - its a bit basic," a wording call, not a rejection of the
  concept; a better tip for this tile is a legitimate thing to pick back
  up later), Users (stat "4 users", no tip).

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
| **Action row** (`{ actionIcon, ... }`) | Plain clickable item, same as any normal panel item, but with a leading icon marking it as an ACTION (does something) rather than a navigable settings page | Add products (`+`); My account's Logout (power icon); AI assistant's New chat (`+`) |

Use a folder when the label is itself a nav concept whose children are hidden
until opened. Use a heading when you're just visually clustering already-visible
items with no expand/collapse. Use an action row's `actionIcon` when an item is
functionally an action (add/create/manage-as-a-verb) rather than a destination,
so it doesn't read as just another settings page in the list — the icon is the
only difference from a normal item; it's still a real Node with a real `key`
and routes/selects normally. Heading items are filtered out before
`resolveSelected`/`resolveChain` ever see them — they can never become "the
routed item," even via a `nodes[0]` fallback. Action rows are NOT filtered out
this way — they're real, routable items, just visually marked. My account's
"Support code" USED to have an `actionIcon` (a bare `?`) but had it removed —
see "Rail utility buttons" below for why.

## Rail utility buttons (My account, Notifications, AI assistant)

Three buttons live in a small stack above the rail's avatar (`.rail__utility`,
between `.rail__items` and `.rail__user` in `index.html`) — top to bottom:
AI assistant (circled "?"), Notifications (bell + red dot), My account
(avatar, unchanged). None of these are rail SECTIONS — `getRailItems` is
unaffected by any of them — they're a separate class of mode-switch, each
setting `state.section` to a value with no icon in the main rail list at all
(`'assistant'` / `'notifications'` / `'my-account'`), wired via a small shared
`switchToUtilitySection(key)` helper in `main.js` rather than three near-
identical click handlers.

- **My account** (existing) — flat panel-list items (Profile/Security/
  Communication/Preferences/Support code/Logout). See "Live theme toggle"
  above for Preferences' one live control.
- **Notifications** (`tree['notifications']`, `NOTIFICATIONS_ITEMS` in
  `nav-data.js`) — a genuine EMAIL-CLIENT split, not the usual "L2 = page
  list, canvas = whatever's selected" shape every other section uses. The
  notification rows (title + skeleton preview line, `showSnippet: true` —
  see the Records pattern section) render PERMANENTLY in the L2 panel,
  never disappearing once one is picked; the canvas shows ONLY the selected
  notification's own detail (a real, if generic, skeleton page —
  deliberately not a dead end: "we could wireframe a detail view even
  though we dont currently have it"). This is the user-account-focused
  "Notifications" concept from CONTEXT.md's three-way/four-way
  notification-model writeup — distinct from Recommendations/Health
  check/contextual recommendations, which are all property/portfolio-
  focused, not account-focused. See "Records-inbox panel mode" below for
  the mechanism — a first version (L2 as a normal picker, canvas replacing
  the list with the detail, same as Properties/Users) was built and
  corrected once live: "i want the summary list in the L2 panel, and the
  current message full view wireframed in the main view" — an email
  client's message list stays visible while the reading pane shows the
  open message; the list disappearing was the actual bug.
- **AI assistant** (`tree['assistant']`, `ASSISTANT_ITEMS` in `nav-data.js`)
  — L2 is "chat history and controls": a "+ New chat" action row (active by
  default) above a flat "History" skeleton list. Canvas shows the
  `chat-start` sketch (see the top-level sketches table above) when New chat
  is selected — a fresh-chat landing wireframe, not a specific conversation.
  Individual past chat threads are NOT individually clickable yet — genuinely
  undecided what re-opening one should show (a full transcript? the same
  start screen scrolled down?) — don't wire them as a `records` picker until
  that's confirmed.

## Records-inbox panel mode (`data.customPanel: 'records-inbox'`)

A one-off, deliberately NOT generalized panel shape — an email-client
three-pane split (message list always visible + a reading pane), built
specifically for Notifications after a first attempt (L2 as a normal
`records` picker, canvas replacing the list with the detail — same
mechanism Properties/Users/Dashboards all use) was caught live as wrong:
"i want the summary list in the L2 panel, and the current message full
view wireframed in the main view."

```js
{ items: Node[], customPanel: 'records-inbox' }
```

Assumes exactly the shape `NOTIFICATIONS_ITEMS` has: `items` contains ONE
panel item whose own `content` is a `records` picker sitting directly on
it (no wrapping `tabs`) — same "pathIndex 1" case `resolveChain`'s comment
on the records branch already documents for a bare `records` section like
Users. When `data.customPanel === 'records-inbox'`:

- **`renderPanel`** (`main.js`) skips its normal nav-item-list rendering
  entirely and calls `renderRecordsInboxPanel(data)` instead — this reads
  the picker's `content.names`/`showSnippet` directly and renders the ROWS
  AS the L2 panel's actual markup (`.wf-list--inbox`). Went through two
  corrections before landing on the current shape:
  - First pass kept `.wf-list__row`'s bordered-card look (border,
    border-radius, background box) — corrected to a flatter treatment,
    but STILL sat inset inside `.secondary-panel`'s own 20px/12px padding
    with a leftover `border-radius: 7px`, and still rendered the real
    notification title as text.
  - Caught live via screenshot ("it still looks messy... i dont want cards
    inset into the panel, i want the cards to fill the panel... i dont
    want radius corners i want rectilinear.. also i dont want words in
    ther just skeleton lines") — three specific fixes: (1) `.wf-list--inbox`
    negative-margins out the panel's own padding (`margin: -20px -12px 0`,
    `width: calc(100% + 24px)`) so rows span genuinely edge-to-edge, not
    just visually flatter while still gutter-inset; (2) `border-radius: 0`
    everywhere, with a `border-top` on the first row so the whole list
    reads as one bounded rectilinear block; (3) the row's title is now
    `.wf-list__row-title-skel` — a skeleton bar, NOT real text — matching
    the canvas detail's own "no words" treatment. `data-inbox-name` still
    carries the real underlying value for routing; it just never renders.
  Each row wires its own click handler (`data-inbox-name`) that sets
  `state.path = [pickerItem.key, name]` directly and re-renders — simpler
  than the generic `data-path-key` mechanism since there's no
  expand/collapse state to preserve.
- **`renderCanvas`** gets a matching special branch: if nothing's picked
  yet (`!chain[0]?.selectedKey`), show a plain placeholder
  (`.records-inbox-empty`, "Select a notification to view it") instead of
  ever rendering the picker itself (it already lives in the panel — canvas
  rendering it too would duplicate it). Once something IS picked, skip
  straight to the detail node's own content
  (`renderChainBody(chain, 1)`) — no breadcrumb is built at all, since
  there's nothing to crumb back to (the list never left the panel, unlike
  every other `records` caller where picking one crumbs "Properties /
  Harbourview Hotel").

**Don't reach for this by default.** Every other section's L2 panel is a
list of PAGES (clicking an item navigates to different canvas content,
but the panel itself always re-renders as "what pages exist here"). This
mode makes the panel BE live data (notification rows), which only makes
sense for an inbox-shaped concept. Introduce a second instance only with
the same explicit kind of request this one got.

**Icon choices were deliberate, not just "whatever fits at rail size":**
the AI assistant's circled "?" (`.rail-item__icon--assistant`) was chosen
over a bare "?" (reads as human support/help — the wrong signal for an
agentic, in-product assistant that takes actions, not a call-centre-style
help chat) and over a sparkle (a common "AI" cliché the user explicitly
wanted to avoid, and this product isn't ready to use its real assistant
branding yet). "A ? in a circle... reads more like 'ask this' than 'get
human help'" (user's own reasoning). Because of this, My account's
"Support code" item had its own `?` icon RETIRED — a bare `?` right next to
the new circled `?` risked exactly the "is this help or the assistant"
confusion the choice above was designed to avoid; the plain label carries
Support code fine on its own.
