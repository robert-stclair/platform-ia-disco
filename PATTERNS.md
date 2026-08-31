# Wireframe patterns

Reusable structural sketches for the canvas area. All patterns are pure skeleton —
grey blocks/bars suggesting shape and rhythm, never real labels, names, or copy (a
card's own **title** is the one exception: card titles are real text confirmed from
production screenshots, per the project's "real titles, wireframe content" rule).

Adding a new pattern? Add it here first (name, when to use it, the exact classes),
then implement it in `renderSketch`/`renderSectionShape` in `src/main.js` and the
matching rules in `src/style.css`. Keep this file and the code in sync — this is the
single reference for "how do I wireframe X," not a description that can drift.

## Top-level canvas sketches (`content.sketch`)

These render as the whole content of a `sketch`-type node (a tab, a leaf item).

| `sketch` value | Renders | Use for |
|---|---|---|
| `'sections'` | Stacked cards, each with a real title + a section-shape sub-pattern (below) | Settings pages made of multiple labelled cards (Property settings' tabs, Integrated systems) |
| `'media'` | A grid of `.sketch-card` blocks (4:3 aspect ratio) | Photo/media grids (Media library) |
| `'list'` | A `.wf-list` of skeleton rows | A flat list of records with no further per-row detail (Users) |

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

- `.wf-list` — the container: consistent margin, gap, and max-width (520px).
- `.wf-list__row` — one row: bordered card, 48px tall, centered content.
- `.wf-list__row--sketch` — renders a centered skeleton bar instead of real text.
  Used for both the properties/systems picker (rows are real links, `data-path-key`
  drives navigation, but the *visible* content is still a skeleton bar — no real
  property/system names shown) and plain sketch lists (Users).
- Add `a.wf-list__row` (an `<a>` tag with the class) when a row needs to be
  clickable; a plain `<li class="wf-list__row ...">` when it's static.

Use `.wf-list` for: the properties picker, the systems picker, Users, and any
future flat list of records.

## Not yet built

- **Table** — rows + columns with headers, for record lists needing more than one
  visible field per row. Not implemented yet — build it as `sketch: 'table'` when
  a real need for it comes up, following the same "skeleton only, no real values"
  rule as everything else here.
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
