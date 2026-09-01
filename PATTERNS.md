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

These four are the project's canonical page-skeleton types (list / table / stacked cards /
card grid — see "Dashboard card grid" below for the fourth). Not a closed set — add a new one
here first when a genuinely new page shape comes up, following the same "skeleton content,
real titles/headers only" rule as everything else.

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
{ type: 'records', names: string[], detailNode: Node }
```

- `names` — real names, rendered via `renderRecordPicker` (`.wf-list`, real
  text per the breadcrumb-clarity exception above).
- `detailNode` — one shared Node (usually `type: 'tabs'`) that every record
  opens. The SAME node reference for every name — there's one shared detail
  shape, not one Node per record.
- Breadcrumb: "[picker label] / [record name]" once a record is picked, then
  the detail node's own tabs render with no additional crumb segment of their
  own (the detail node is treated as a new root once reached this way — see
  `renderChainBody`'s `isDetailNodeRoot` handling in `main.js`).

**Existing instances:** Properties (`names: SAMPLE_PROPERTIES`, `detailNode:
PROPERTY_NODE`) and Users (`names: SAMPLE_USERS`, `detailNode: buildUserNode(...)`).
Both are the SAME mechanism — never add a new content type for "a picker that
opens a shared detail page." Reuse `records` and give it a new `detailNode`.

## Not yet built

- **Card list** — a list where each row is a card-shaped block (bigger than
  `.wf-list__row`, room for more visual weight) rather than a thin row. Not
  implemented yet.
- **Dashboard card grid** — distinct from `'media'` (4:3 photo cards): a
  metric/chart-style card (title bar + a skeleton chart or stat block), for
  dashboard-style landing pages (e.g. Insights' own Dashboard). Not implemented
  yet — build as a new `sketch` value (not reusing `'media'`) when a real
  dashboard-style page is ready to wire up.

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
| **Action row** (`{ actionIcon: '+', ... }`) | Plain clickable item, same as any normal panel item, but with a leading icon marking it as an ACTION (does something) rather than a navigable settings page | Add products |

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
