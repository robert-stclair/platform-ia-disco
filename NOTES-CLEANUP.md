# Cleanup notes — for the next session

Written at the end of a session that fixed a string of related breadcrumb/routing bugs
(see git log). The pattern across all of them: **navigation state is currently threaded
through the code as raw array-index arithmetic** (`state.path[depth+1]`, `depth+1` prefixes
baked into `data-path-key` strings, etc.) rather than through named, self-describing
concepts. Every new nav shape has been another chance to get that arithmetic wrong. This
doc is the map + the standards to fix that properly, before adding more content.

## 1. Current sitemap (what actually exists today)

```
Rail
├── Insights (home)
│   ├── Dashboard (active)
│   ├── Recommendations
│   └── UGC: user's own custom dashboards
│         (2 items normally; 3 — adds "Portfolio health" — when Properties is shown)
│
├── Distribution
│   ├── Inventory (active)
│   ├── Rate plans
│   ├── Yield rules
│   └── [when Properties shown] "Properties" sublist item ⚠️ legacy shape, see §3
│
├── Transactions
│   ├── Reservations (active)
│   ├── Guest communications
│   └── Payments
│       (no multi-property differences surfaced yet — unconfirmed, not by design)
│
└── Configuration
    ├── Properties  ⎫ shown when accountType==='MP' OR propertyCount==='multiple'
    │   ├── Properties (tab, active) → pick a property → Property settings (below)
    │   ├── Brands (tab, MP only, no content yet)
    │   └── Clusters (tab, MP only, no content yet)
    │   — OR, when neither condition holds —
    ├── Property settings  ⎫ (same tabs as above, just not behind a property picker)
    │   ├── General information (active) — Currency / Inventory / Language and region
    │   ├── Property details — Property / Contact / Extra information
    │   ├── Services — description / features / instructions
    │   ├── Policies — check-in-out / smoking / terms
    │   ├── Media library — media grid sketch
    │   └── Integrated systems — system-count-aware (1 system: sections directly;
    │       >1: picker first, e.g. Opera ADS / RMS Cloud) → General settings /
    │       Inventory settings / Reservation delivery failure emails /
    │       Reservation mappings / Credit card mappings
    ├── Users — flat list sketch, no children
    ├── Direct Booking (folder, no default route) ⚠️ only folder-type item, see §3
    │   ├── Selling tools → tabs: Promotions (active) / Extras
    │   ├── Setup → tabs: Booking rules / Guest details / Email settings /
    │   │   Translations / About page / Contact page / Policies page
    │   └── Branding (no content yet)
    └── Channels Plus (no content yet)
```

**Account type × property count matrix** (independent axes, see `nav-data.js` top comment):

| | single property | multiple properties |
|---|---|---|
| **SM** | Property settings only | Properties tab (no Brands/Clusters) |
| **LH** | *(undefined — renders empty, intentional)* | *(undefined)* |
| **MP** | Properties tab incl. Brands/Clusters | Properties tab incl. Brands/Clusters |

## 2. Standards worth writing down and holding to

These aren't new decisions — they're things we already do, that should become explicit
rules so new content follows them without relitigating each time:

- **One recursive Node/Content shape, no exceptions.** Already documented at the top of
  `nav-data.js`. The Distribution `sublist` shape (§3) is the one remaining violation.
- **`state.path` is the only source of navigation truth.** No per-feature state fields.
  `expandedKey` is the one deliberate exception (UI-only, doesn't affect routing).
- **Never write a raw path index by hand.** Every `depth+1`, `data-path-key="N:..."` prefix,
  breadcrumb `truncateTo`, etc. must be computed at the exact point it's used, from a
  named local (`tabPathIndex`, `propPathIndex` — see current `buildCanvasBody`), never
  copy-pasted as a literal number or inferred from a different node's depth. This was the
  root cause of every bug fixed this session.
- **Breadcrumbs only mark real drill-downs**, never a tab strip at the root of a panel item,
  never a default/active fallback selection. See the `feedback_ia_prototype_breadcrumb_model`
  memory for the exact rule.
- **Folder-style items (`content.type === 'list'`) never auto-navigate on open** — expanding
  ≠ selecting. Only a child click routes.
- **Greyscale, no placeholders, real card titles only** — unchanged, already in PATTERNS.md.
- **Check PATTERNS.md before inventing a new sketch shape.**

## 3. Known inconsistencies to resolve

- **Distribution's "Properties" sublist is the last non-recursive shape** (`data.sublist`,
  flat array, no `content`, hardcoded rendering in `renderPanel`/no canvas wiring at all —
  it doesn't currently do anything when clicked). Migrate it to the same Node/Content model
  Configuration uses, or decide what it should actually do first if that's still open.
- **`renderPanel`'s sublist-child rendering hardcodes `"1:${s.key}"`** — depth `1` as a
  literal, because today only one folder (Direct Booking) exists at depth 0. This will
  silently produce wrong behavior the moment a folder can appear at a different depth.
  Should be derived the same way `buildCanvasBody` now derives `tabPathIndex`/`propPathIndex`.
- **`renderPanel` and `buildCanvasBody` are two separate hand-written walks over the same
  tree**, each with their own copy of "how do I compute this child's path index." Worth
  considering whether they can share one traversal helper so a fix in one always applies
  to the other — today it's easy to fix a bug in the canvas and leave the identical bug
  live in the panel (or vice versa).
- **Channels Plus and Brands/Clusters have no content** — fine for now (no placeholders),
  but worth flagging so we don't forget they're stubs, not "done."

## 4. Possible bigger swing (not decided — discuss before doing)

The audit-and-patch approach worked but required re-deriving the same path-index reasoning
by hand each time. A structurally safer alternative: give every Node an explicit resolved
identity — e.g. compute a full `{node, pathIndex}` chain once per render and pass *that*
down, instead of separately re-deriving `depth+1` at each recursion step. Bigger refactor,
more upfront cost, but would make "wrong path index" a much harder bug to write by accident.
Worth 15 minutes of discussion before deciding whether it's worth it at this stage, given
the project's explicit goal of fast, disposable exploration rather than durable software.

## 5. Suggested order for tomorrow

1. Read this doc + `feedback_ia_prototype_breadcrumb_model` memory as a refresher.
2. Decide on §4 (patch further vs. structural refactor) before touching code.
3. Migrate Distribution's `sublist` to the real Node shape (§3, first bullet).
4. Fix the hardcoded `"1:"` prefix in `renderPanel` (§3, second bullet).
5. Only then resume adding new IA content — Channels Plus, LH, remaining Transactions
   questions, etc. — on a cleaner foundation.
