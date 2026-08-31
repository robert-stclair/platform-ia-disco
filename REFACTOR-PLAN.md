# Refactor plan — structural cleanup (branch: `refactor/structure-cleanup`)

Goal: make this codebase a solid, low-friction base for fast IA iteration, without
over-building it into something heavier than a disposable exploration tool needs to be.
Written before touching code — see `NOTES-CLEANUP.md` for the bug history that motivated this.

## The core problem

Two separate hand-rolled walks over the same content tree exist today:
`renderPanel` (draws the left sub-nav) and `buildCanvasBody` (draws the canvas + breadcrumb).
Each one independently:
- decides what's selected at a given level (`resolveSelected`, called separately in each),
- computes its own path index (`depth + 1`, `tabPathIndex`, `propPathIndex`, ad hoc, per call site),
- and wires its own click handlers back onto `state.path`.

Every bug fixed in the last session (breadcrumb showing too early, wrong collapse target,
duplicate tab strip) came from these two walks getting *slightly* out of sync, or from a path
index being computed correctly in one walk and copy-pasted wrong in the other. Also: section
items (Insights/Distribution/Transactions) are plain `{label, active}` objects while
Configuration's items are real recursive Nodes — two shapes for "the thing in the panel list,"
which is why Distribution's Properties sublist is still stuck on the old flat shape.

## The fix: resolve the path once, walk it once

Instead of two separate recursive walks, compute **one array up front** each render —
`resolveChain(rootNode)` — that walks `state.path` exactly once and returns every step:

```js
// One resolved step per level of the current selection.
// [{ node, content, pathIndex, isExplicit }, ...]
//   node       — the Node object at this level
//   content    — node.content (for convenience)
//   pathIndex  — the state.path[] index this node's OWN children select from
//                (i.e. state.path[pathIndex] is "which child of `node` is picked")
//   isExplicit — true if state.path[pathIndex] was actually set by a user click,
//                false if this step came from an active/first-child fallback
```

Both `renderPanel` and `renderCanvas`/`buildCanvasBody` consume this *same* array instead of
each re-deriving it. Concretely:
- The panel only ever needs `chain[0]` (what's routed at the top level) plus `expandedKey`
  (unchanged, still UI-only) — it stops calling `resolveSelected` itself.
- The canvas walks `chain` to build both the tab-strip/list/picker HTML *and* the breadcrumb
  in one pass — a crumb is added for a step exactly when `step.isExplicit` is true and the
  step is "worth" a crumb (tabs at depth 0 still never crumb — see below), which replaces the
  scattered `depth > 0` / `propKey ? ... : ...` conditionals with one consistent rule read
  directly off the chain.
- `select(pathIndex, key)` / `collapse(pathIndex)` stay exactly as they are — `pathIndex` from
  the chain IS the same number that already goes into `state.path`, just computed once instead
  of N times.

This is NOT a rewrite of the content model (`nav-data.js`'s Node/Content shape is sound and
stays as-is) — it's consolidating the traversal logic in `main.js` from two copies to one.

## Fold in while we're here (from NOTES-CLEANUP.md §3)

- **Migrate Distribution's `data.sublist`** to a real Node (`content: {type: 'properties', ...}`
  reusing the same shape Configuration's Properties uses) so it goes through the same resolved
  chain instead of being hand-rendered as a one-off in `renderPanel`. This also means it'll
  actually be clickable/wired, which it isn't today.
- **Make section-level items real Nodes.** Insights/Transactions items become
  `{key, label, active, content: null}` instead of `{label, active}` — removes the `!item.key`
  special-casing in `renderPanel` and makes every panel list the same shape, always.
- **Delete the now-dead hardcoded `"1:"` prefix** in the sublist-click handler — it's replaced
  by the chain's own `pathIndex`.

## Explicitly NOT doing (stay proportionate to a disposable exploration tool)

- No component framework, no build-step change, no TypeScript. Still vanilla Vite/JS.
- No generalized "router" abstraction beyond the resolved chain above — the chain is a plain
  array built fresh each render, not a persisted/cached structure.
- Not touching `nav-data.js`'s Node/Content shape itself — it's already the right level of
  abstraction; only the code that *walks* it is being consolidated.
- Not attempting to unify `renderPanel` and `renderCanvas` into one function — they render two
  different DOM regions with genuinely different rules (panel shows one level + expand state;
  canvas shows the whole remaining depth). They should share the *chain*, not become one thing.

## Working order

1. Add `resolveChain(rootNode)` in `main.js`, alongside the existing helpers. Keep the old
   functions in place initially — don't delete `buildCanvasBody`/`renderPanel` bodies until the
   replacements are verified working, so there's always a working `main` to fall back to.
2. Rewrite `renderCanvas`/`buildCanvasBody` to consume the chain. Verify every scenario from
   yesterday's manual test pass still works: Properties → property → tabs (no duplicate strip),
   breadcrumb collapse at every level, Integrated systems single/multi, Direct Booking
   folder → Setup → tabs.
3. Rewrite `renderPanel` to consume the chain instead of calling `resolveSelected` itself.
4. Migrate Distribution's `sublist` to a real Node + wire it through the chain.
5. Make Insights/Transactions items real Nodes; delete the `!item.key` special-casing.
6. Delete the old `buildCanvasBody`/hand-rolled path-index code once everything above is
   verified. Update `NOTES-CLEANUP.md` §3 to strike the resolved items.
7. Full manual pass again (or ask the user to verify visually) before merging to `main`.

## Merge criteria

- Every behavior in `NOTES-CLEANUP.md §1`'s sitemap still works identically — this is a
  structural refactor, not a redesign; nothing should look or behave differently to the user.
- No more hand-written path-index arithmetic anywhere outside `resolveChain` itself.
- Distribution's Properties sublist is a real, clickable Node like everything else.
- `git diff main` reviewed end-to-end before merging — this branch should be a clean structural
  diff, easy to sanity-check against the "nothing user-visible changed" bar above.
