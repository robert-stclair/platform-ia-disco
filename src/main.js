import {
  getRailItems,
  getContent,
  DEFAULT_SYSTEMS,
  MULTIPLE_SYSTEMS,
  SCOPE_PROPERTIES,
  SCOPE_BRANDS,
  SCOPE_CLUSTERS,
} from './nav-data.js';
import { RAIL_ICONS } from './icons.js';

// ---------------------------------------------------------------------------
// Navigation state is a PATH: an array of selected keys, one per depth level,
// starting from the current section's top-level panel item. Depth 0 = which
// top-level item is routed/showing in the canvas; depth 1 = which item
// within that node's content is selected; and so on, recursively. This
// replaced per-concept state fields (sublistKey/tabIndex/propertyName/
// systemName/expandedItemKey) that had to be individually wired, reset, and
// kept in sync — a source of repeated bugs. The path is the source of truth
// for what's rendered in the canvas.
//
// `expandedKey` is separate and UI-only: which panel item's own sublist is
// currently revealed (Direct Booking → Selling tools/Setup/Branding).
// Opening a folder-style item does NOT change the route/canvas — only
// clicking a specific child inside it does. This mirrors a real folder
// tree: expanding ≠ selecting.

const state = {
  accountType: 'SM', // 'SM' | 'LH' | 'MP' — independent of propertyCount; only SM has real content so far
  propertyCount: 'single', // 'single' | 'multiple' — independent of accountType
  section: 'insights',
  path: [], // e.g. ['property-settings', 'services'] or ['direct-booking', 'setup', 'contact-page']
  expandedKey: null, // which top-level 'list'-type item is expanded in the panel (UI-only)
  multipleSystems: false, // hidden-settings toggle: does every property have >1 connected system?
  // EXPLORATORY — property/cluster/brand scope switcher sketch (Insights,
  // Health check once built). See CHANGE-QUEUE.md "Foundational, unsolved"
  // section: this whole mechanism is still being worked through, expected
  // to change once Distribution's (unsolved) shape informs it. Deliberately
  // SEPARATE from `path` — this scopes a section's whole view, it isn't a
  // navigation destination the way Configuration/Distribution's Properties
  // picker is.
  scope: { type: 'all', key: null }, // { type: 'all' | 'property' | 'cluster' | 'brand', key: string | null }
};

function resetPath() {
  state.path = [];
  state.expandedKey = null;
  state.scope = { type: 'all', key: null };
}

const railEl = document.getElementById('rail');
const panelEl = document.getElementById('secondaryPanel');
const canvasEl = document.getElementById('canvas');

function getSystemsForCurrentProperty() {
  return state.multipleSystems ? MULTIPLE_SYSTEMS : DEFAULT_SYSTEMS;
}

// Resolve which item is selected among a list of sibling nodes at a given
// path depth: an explicit path entry at that depth wins; otherwise the node
// marked `active: true`; otherwise the first node.
function resolveSelected(nodes, depth) {
  const explicitKey = state.path[depth];
  if (explicitKey) {
    const found = nodes.find((n) => n.key === explicitKey);
    if (found) return found;
  }
  return nodes.find((n) => n.active) ?? nodes[0] ?? null;
}

function select(depth, key) {
  state.path = state.path.slice(0, depth);
  state.path[depth] = key;
}

function collapse(depth) {
  state.path = state.path.slice(0, depth);
}

// ---------------------------------------------------------------------------
// Resolve state.path against the content tree ONCE per render into a flat
// chain of steps — replaces two separate hand-rolled recursive walks
// (one for the panel, one for the canvas) that each independently computed
// "what's selected here" and "what path index is this," and had drifted out
// of sync more than once. Both renderPanel and renderCanvas now read off
// this same array instead of re-deriving it.
//
// Each step describes one level of the current selection:
//   node        — the Node whose content this step is describing
//   content     — node.content (convenience)
//   pathIndex   — the state.path[] index that selects AMONG node's children
//                 (i.e. state.path[pathIndex] picks which child comes next)
//   selectedKey — the key/name of the child actually selected at this step
//                 (via explicit path, active fallback, or first-child fallback)
//   isExplicit  — true only if state.path[pathIndex] was actually set by a
//                 user click, not resolved via active/first-child fallback.
//                 A breadcrumb crumb is only ever added for an explicit step.
//
// Stops descending at the first 'list' step with no explicit child chosen
// (a folder that's merely open, not navigated into — the canvas keeps
// showing nothing further, matching "expanding ≠ selecting").
function resolveChain(rootNode) {
  const chain = [];
  let node = rootNode;
  // Starts at 1, not 0: state.path[0] already means "which top-level panel
  // item is routed" (read by resolveSelected in renderPanel/renderCanvas
  // BEFORE resolveChain is ever called). rootNode's own content selects its
  // children starting at state.path[1] — starting this at 0 would collide
  // the two meanings onto the same index (caught via Distribution's
  // Properties item, whose content sits directly on the panel item with no
  // wrapping tabs layer to absorb the offset).
  let pathIndex = 1;

  while (node?.content) {
    const content = node.content;

    if (content.type === 'tabs') {
      const tabs = content.tabs.filter((t) => !t.mpOnly || state.accountType === 'MP');
      const explicitKey = state.path[pathIndex];
      const selected = (explicitKey && tabs.find((t) => t.key === explicitKey)) || tabs.find((t) => t.active) || tabs[0] || null;
      chain.push({
        node,
        content,
        pathIndex,
        // A single visible tab (after mpOnly filtering) collapses straight
        // to its content — no strip shown, same rule `type: 'systems'`
        // already applies for one connected system. `options: []` signals
        // this to renderChainBody, same convention the systems branch uses
        // for "no picker needed." Caught via a single-property account's
        // USER_NODE (only "User details", no "Properties" tab) — but this
        // is a general rule for the `tabs` content type, not case-specific.
        options: tabs.length > 1 ? tabs : [],
        selectedKey: selected?.key ?? null,
        isExplicit: Boolean(explicitKey && selected?.key === explicitKey),
      });
      if (!selected) break;
      node = selected;
      pathIndex += 1;
      continue;
    }

    if (content.type === 'list') {
      // No default/active fallback — a folder stays un-navigated until an
      // explicit child click sets state.path at this index.
      const explicitKey = state.path[pathIndex];
      const selected = explicitKey ? content.items.find((n) => n.key === explicitKey) : null;
      chain.push({
        node,
        content,
        pathIndex,
        options: content.items,
        selectedKey: selected?.key ?? null,
        isExplicit: Boolean(selected),
      });
      if (!selected) break;
      node = selected;
      pathIndex += 1;
      continue;
    }

    if (content.type === 'records') {
      // Generic "clickable records list -> shared detail node" pattern
      // (PATTERNS.md) — a list of names, each opening the SAME detail Node
      // (`content.detailNode`) once picked. Properties (-> PROPERTY_NODE)
      // and Users (-> USER_NODE) are both instances of this one mechanism,
      // not separate ones — generalized from an earlier version hardcoded
      // to `type: 'properties'` recursing into PROPERTY_NODE specifically.
      const explicitKey = state.path[pathIndex];
      chain.push({
        node,
        content,
        pathIndex,
        options: content.names,
        selectedKey: explicitKey ?? null,
        isExplicit: Boolean(explicitKey),
      });
      if (!explicitKey) break;
      node = content.detailNode;
      pathIndex += 1;
      continue;
    }

    if (content.type === 'systems') {
      // Always push a step, even with one system (options: []) — the caller
      // (renderChainBody) uses an empty `options` to know "no picker needed,
      // render sections directly," rather than the chain silently ending
      // with no step at all (which would leave the sections unrendered).
      const systems = getSystemsForCurrentProperty();
      const hasPicker = systems.length > 1;
      const explicitKey = hasPicker ? state.path[pathIndex] : null;
      chain.push({
        node,
        content,
        pathIndex,
        options: hasPicker ? systems : [],
        selectedKey: explicitKey ?? null,
        isExplicit: Boolean(explicitKey),
      });
      break; // systems' own sections render directly once resolved — no further node to descend into
    }

    // 'sketch' (or anything else with no children to select among) — leaf.
    // Push a step for it too, even though it has no `options`/`selectedKey`
    // — every node the walk passes through gets a chain entry, so
    // renderChainBody never has to guess whether "no next step" means
    // "nothing to render" vs. "render this leaf's own content directly."
    // BUG FIX: an earlier version of this function silently stopped WITHOUT
    // pushing a step here, so any tabs/list/properties branch recursing to
    // `chain[i+1]` for a leaf tab hit "no such step" and rendered nothing —
    // caught via Health check's tabs (each one a sketch leaf) rendering
    // empty tab bodies.
    chain.push({ node, content, pathIndex, options: [], selectedKey: null, isExplicit: false });
    break;
  }

  return chain;
}

// ---------------------------------------------------------------------------

function renderRail() {
  const items = getRailItems(state.accountType);
  railEl.innerHTML = items.map(
    (item) => `
      <button class="rail-item${item.key === state.section ? ' is-active' : ''}" data-section="${item.key}" title="${item.label}" aria-label="${item.label}">
        <span class="rail-item__icon">${RAIL_ICONS[item.icon] ?? ''}</span>
      </button>
    `
  ).join('');

  railEl.querySelectorAll('.rail-item').forEach((el) => {
    el.addEventListener('click', () => {
      if (el.dataset.section === state.section) return;
      state.section = el.dataset.section;
      resetPath();
      render();
    });
  });
}

// EXPLORATORY — property/cluster/brand scope switcher sketch. See
// CHANGE-QUEUE.md "Foundational, unsolved" section: only wired up for
// Insights so far (the confirmed "easy" case); Distribution/Transactions
// deliberately untouched since their shape isn't solved yet. Renders a
// single <select> — simplest possible sketch, not a final interaction
// design. Options: All properties, then every individual property, then
// (MP only) Brands and Clusters as scoping groups.
function renderScopeSwitcher() {
  const groups = [];
  groups.push(`<option value="all:" ${state.scope.type === 'all' ? 'selected' : ''}>All properties</option>`);
  groups.push(
    `<optgroup label="Properties">${SCOPE_PROPERTIES.map(
      (name) => `<option value="property:${name}" ${state.scope.type === 'property' && state.scope.key === name ? 'selected' : ''}>${name}</option>`
    ).join('')}</optgroup>`
  );
  if (state.accountType === 'MP') {
    groups.push(
      `<optgroup label="Brands">${SCOPE_BRANDS.map(
        (name) => `<option value="brand:${name}" ${state.scope.type === 'brand' && state.scope.key === name ? 'selected' : ''}>${name}</option>`
      ).join('')}</optgroup>`
    );
    groups.push(
      `<optgroup label="Clusters">${SCOPE_CLUSTERS.map(
        (name) => `<option value="cluster:${name}" ${state.scope.type === 'cluster' && state.scope.key === name ? 'selected' : ''}>${name}</option>`
      ).join('')}</optgroup>`
    );
  }
  return `<select class="scope-switcher" aria-label="Property scope">${groups.join('')}</select>`;
}

function wireScopeSwitcher() {
  const select = canvasEl.querySelector('.scope-switcher');
  if (!select) return;
  select.addEventListener('change', () => {
    const [type, key] = select.value.split(':');
    state.scope = { type, key: key || null };
    render();
  });
}

// Every panel item is a real Node now — no legacy plain-object or
// section-level-sublist special-casing. The panel only ever needs the FIRST
// step of the chain (what's routed at the top level) plus `expandedKey`
// (UI-only, independent of routing) — it doesn't call resolveChain itself
// since it only cares about depth 0; renderCanvas does the full walk.
function renderPanel(data) {
  const items = data.items;
  // Grouping headings (e.g. "Products" — a plain label clustering already-
  // visible sibling items, never itself clickable/routable — see
  // PATTERNS.md's folder-vs-heading rule) are invisible to routing
  // entirely: filtered out before resolveSelected ever sees them, so one
  // can never accidentally become "the routed item" via the nodes[0]
  // fallback if it happened to sit first in the array.
  const routableItems = items.filter((i) => !i.heading);
  const routedItem = routableItems.length ? resolveSelected(routableItems, 0) : null;
  // Which 'list' item is expanded in the panel — UI-only, independent of
  // routing. No default: nothing is expanded until explicitly clicked.
  const expandedItem = items.find((i) => i.key === state.expandedKey) ?? null;

  // EXPLORATORY scope switcher moved to the canvas's top-right (see
  // renderCanvas/renderScopeSwitcher) — repositioned per user feedback,
  // no longer rendered here in the panel.
  let html = '';

  // Sublist HTML renders immediately after its own parent item, inline
  // within the same list — not appended as one block after the whole list.
  // A parent whose sublist renders after unrelated later siblings only
  // "looked right by accident" when it happened to be the last item.
  html += `<ul class="nav-list">`;

  items.forEach((item) => {
    if (item.heading) {
      // Grouping heading — plain label, never clickable/routable/expandable.
      // See PATTERNS.md's folder-vs-heading rule.
      html += `<li class="nav-list-heading">${item.label}</li>`;
      return;
    }
    const hasList = item.content?.type === 'list';
    // A 'list' item shows an "open" state (expanded, not routed) — visually
    // distinct from '.is-active' (actually routed/showing in the canvas),
    // so an expanded folder never looks the same as real selection.
    const isRouted = !hasList && item === routedItem;
    const isOpen = hasList && item === expandedItem;
    const chevron = hasList
      ? `<svg class="nav-list-item__chevron${isOpen ? ' is-open' : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg>`
      : '';
    // `starred` — EXPLORATORY, non-functional (CHANGE-QUEUE.md item 8): a
    // couple of Insights' promoted items show a star to illustrate "this
    // was promoted from My insights because the user starred it."
    const star = item.starred ? `<span class="nav-list-item__star" aria-hidden="true"></span>` : '';
    // `actionIcon` — a leading icon marking this item as an ACTION row
    // (e.g. "+ Add products") rather than a settings-page destination like
    // its siblings — a third panel-list pattern alongside folder/heading
    // (PATTERNS.md). Still plain-clickable, just visually distinguished.
    const actionIcon = item.actionIcon
      ? `<span class="nav-list-item__action-icon" aria-hidden="true">${item.actionIcon}</span>`
      : '';
    // actionIcon + label grouped in their own span so the flex row's
    // justify-content: space-between still only splits "label side" from
    // "star/chevron side" into two groups, not three separate items.
    const labelGroup = actionIcon ? `<span class="nav-list-item__label-group">${actionIcon}${item.label}</span>` : item.label;
    html += `
      <li class="nav-list-item${isRouted ? ' is-active' : ''}${isOpen ? ' is-open' : ''}">
        <a href="#" data-item-key="${item.key}">${labelGroup}${star}${chevron}</a>
      </li>
    `;

    // This item's own expanded children, if it's the one currently open.
    // Child path index is always 1 here because a folder-type item can only
    // ever appear as a top-level panel item (pathIndex 0) today — if that
    // changes, derive this from the item's own resolved pathIndex instead
    // of hardcoding 1.
    if (isOpen) {
      const childPathIndex = 1;
      // `mpOnly` items (e.g. Brands/Clusters) only show for the MP account type.
      const children = item.content.items.filter((s) => !s.mpOnly || state.accountType === 'MP');
      const explicitChildKey = state.path[0] === item.key ? state.path[childPathIndex] : null;
      html += `<ul class="nav-sublist">${children
        .map(
          (s) =>
            `<li><a href="#" data-path-key="${childPathIndex}:${s.key}" class="${s.key === explicitChildKey ? 'is-active' : ''}">${s.label}</a></li>`
        )
        .join('')}</ul>`;
    }
  });
  html += `</ul>`;

  if (data.ugc) {
    html += `<ul class="nav-list">${data.ugc.map((u) => `<li class="nav-list-item"><a href="#">${u}</a></li>`).join('')}</ul>`;
  }

  panelEl.innerHTML = html;

  panelEl.querySelectorAll('[data-item-key]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const key = el.dataset.itemKey;
      const item = items.find((i) => i.key === key);
      if (item?.content?.type === 'list') {
        // Expand/collapse only — does not touch the route/canvas.
        state.expandedKey = state.expandedKey === key ? null : key;
      } else {
        // Real navigation.
        select(0, key);
        state.expandedKey = null;
      }
      render();
    });
  });

  // Clicking a child inside an expanded list IS real navigation. Expanding a
  // list never touched state.path (it's UI-only), so path[0] must be set to
  // the expanded item's own key here — otherwise the canvas has no route.
  panelEl.querySelectorAll('[data-path-key]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const [depth, key] = el.dataset.pathKey.split(':');
      state.path = [expandedItem.key];
      state.path[Number(depth)] = key;
      render();
    });
  });
}

// ---------------------------------------------------------------------------
// Canvas: renders the content of the deepest selected node, walking the path.
// Builds a breadcrumb trail of every 'tabs'/'systems' ancestor passed through
// (the "root node" — e.g. "Property settings" or "Selling tools" — plus any
// properties/systems drill-down), consistent at every depth rather than
// special-cased per feature.

// No mid-render DOM access: (1) resolve the chain, (2) build one HTML string
// plus breadcrumb trail purely from it, (3) write it once, (4) wire every
// interactive element. Never reintroduce per-level DOM lookups mid-walk —
// an earlier id-based version broke on nested tab levels for exactly that
// reason (duplicate ids resolved to the wrong element).
function renderCanvas(data) {
  const rootItem = data.items.length ? resolveSelected(data.items, 0) : null;

  // EXPLORATORY scope switcher (see renderScopeSwitcher) — lives top-right
  // of the canvas, not the L2 panel (repositioned per user feedback: didn't
  // want it eating into the panel's own space). Rendered here, BEFORE the
  // early-return below, so it still shows even when the routed item has no
  // content of its own (e.g. Insights' Dashboard) — the switcher is a
  // property-scoping control for the whole SECTION, independent of whether
  // this particular item happens to have canvas content.
  const switcherHtml =
    data.scopeSwitcher && state.propertyCount === 'multiple'
      ? `<div class="canvas-scope-switcher">${renderScopeSwitcher()}</div>`
      : '';

  if (!rootItem?.content) {
    canvasEl.innerHTML = switcherHtml;
    wireScopeSwitcher();
    return;
  }

  const chain = resolveChain(rootItem);
  const { trail, bodyHtml } = renderChainBody(chain, 0);
  // Standard content-area margin (PATTERNS.md) applied ONCE here, always —
  // not per-branch inside renderChainBody. A prior version only wrapped
  // content in `.sketch` inside the `tabs` branch, so any leaf item with no
  // tabs anywhere in its ancestry (Users, Channels, Manage products) got no
  // padding at all, rendering flush against the canvas edges — caught
  // while building item 7's standard-margin audit.
  canvasEl.innerHTML = switcherHtml + breadcrumbHtml(trail) + `<div class="sketch">${bodyHtml}</div>`;
  wireScopeSwitcher();
  wirePathLinks();
  wireBreadcrumb();
}

// Render every step in `chain` from `i` onward into nested HTML, plus the
// breadcrumb trail. A crumb is added for a step exactly when it's explicit
// (a real user drill-down, not a default/active fallback) AND it's not the
// chain's own root step (i === 0) — the root is already shown via the
// panel's highlight, so crumbing it too would be redundant noise. This is
// the one rule that replaces the old scattered `depth > 0` / "does this
// content type deserve a crumb" special-casing per branch.
//
// Second exception: a step reached via an explicit `records` drill-down
// (i.e. chain[i-1] was an explicit records pick) is ALSO treated as a root
// — its own detailNode (PROPERTY_NODE, USER_NODE, ...) is conceptually the
// root level for that record, even though it isn't literally chain index 0.
// Without this, PROPERTY_NODE's own tab strip crumbed using its own stale
// label ("Property settings") once inside a specific property — e.g.
// "Properties / Harbourview Hotel / Property settings / Integrated
// systems" — caught by the user; the detail node's own tabs shouldn't add
// a crumb segment at all, same as any literal chain-root tabs step.
function renderChainBody(chain, i) {
  const step = chain[i];
  if (!step) return { trail: [], bodyHtml: '' };

  const { content, pathIndex, selectedKey, isExplicit } = step;
  const prevStep = chain[i - 1];
  const isDetailNodeRoot = prevStep?.content?.type === 'records' && prevStep.isExplicit;
  const crumb = i > 0 && !isDetailNodeRoot && isExplicit ? [{ label: step.node.label, truncateTo: pathIndex }] : [];

  if (content.type === 'tabs') {
    const nextStep = chain[i + 1];
    // Once the next step is a `records` picker explicitly drilled into (a
    // specific record picked), THIS tab strip (e.g. Properties/Brands/
    // Clusters) is no longer relevant — the user is inside one record's
    // own detail node, which has its own tab strip. Showing both stacked is
    // confusing duplication, so skip straight to the inner content.
    if (nextStep?.content?.type === 'records' && nextStep.isExplicit) {
      return renderChainBody(chain, i + 1);
    }
    // `options: []` means a single visible tab — collapse straight to its
    // content, no strip shown (see the standing rule in resolveChain).
    const tabStrip =
      step.options.length === 0
        ? ''
        : `<div class="tab-strip">` +
          step.options
            .map((t) => `<button class="tab${t.key === selectedKey ? ' is-active' : ''}" data-path-key="${pathIndex}:${t.key}">${t.label}</button>`)
            .join('') +
          `</div>`;
    const inner = renderChainBody(chain, i + 1);
    // No `.sketch` wrapper here — renderCanvas now applies it exactly once,
    // around the whole rendered body. Wrapping it again per nested tabs
    // level (as a prior version did) double-padded any tabs-within-tabs
    // case (e.g. Direct Booking -> Setup's own tab strip) to 48px instead
    // of the intended 24px — caught while auditing the standard
    // content-area margin for CHANGE-QUEUE.md item 7.
    return { trail: crumb.concat(inner.trail), bodyHtml: tabStrip + inner.bodyHtml };
  }

  if (content.type === 'list') {
    // A folder that's merely open (no explicit child chosen) shows nothing
    // further — expanding ≠ selecting. resolveChain already stopped here in
    // that case, so reaching this branch with no selectedKey means "leaf".
    if (!selectedKey) return { trail: [], bodyHtml: '' };
    return renderChainBody(chain, i + 1);
  }

  if (content.type === 'records') {
    if (!selectedKey) {
      // Still on the picker itself — no drill-down yet, no crumb.
      return { trail: [], bodyHtml: renderRecordPicker(step.options, pathIndex) };
    }
    const recordCrumb = { label: selectedKey, truncateTo: pathIndex + 1 };
    // A records picker's own crumb (`crumb`, e.g. "Properties") is normally
    // only added when i > 0 (wrapped in an outer tabs strip, like
    // Configuration → Properties/Brands/Clusters → Properties). But when a
    // records picker sits DIRECTLY on the panel item with no wrapping tabs
    // (like Users), i === 0, so `crumb` is empty and only `recordCrumb`
    // would show — a single, genuinely useful crumb ("Jane Smith") that the
    // generic `trail.length <= 1` suppression then hides as if it were
    // redundant noise, when it isn't (nothing else shows the record name).
    // Fix: always include this picker's own label crumb once a record is
    // explicitly picked, even at i === 0, so the trail reads "Users / Jane
    // Smith" instead of getting suppressed to nothing.
    const ownCrumb = i === 0 ? [{ label: step.node.label, truncateTo: pathIndex }] : crumb;
    const inner = renderChainBody(chain, i + 1);
    return { trail: ownCrumb.concat(recordCrumb, inner.trail), bodyHtml: inner.bodyHtml };
  }

  if (content.type === 'systems') {
    // options: [] means one connected system — collapses straight to
    // sections, no picker, no crumb (nothing to disambiguate).
    if (step.options.length === 0) {
      return { trail: [], bodyHtml: renderSectionsSketch(content.sections) };
    }
    if (!selectedKey) {
      // A picker exists (>1 system) but none chosen yet — no crumb.
      return { trail: [], bodyHtml: renderRecordPicker(step.options, pathIndex) };
    }
    const systemCrumb = { label: selectedKey, truncateTo: pathIndex + 1 };
    return { trail: crumb.concat(systemCrumb), bodyHtml: renderSectionsSketch(content.sections) };
  }

  // content.type === 'sketch'
  return { trail: [], bodyHtml: renderSketch(content) };
}

// Shows REAL names, not skeleton bars — a deliberate, narrow exception to
// the skeleton-only rule (PATTERNS.md), scoped specifically to lists that
// feed a breadcrumb drill-down, so the resulting crumb reads as a real
// record/system name instead of "[skeleton bar]" (CHANGE-QUEUE.md item 7).
// Used for the generic `records` picker (Properties, Users, ...) AND the
// systems picker — all feed a crumb via the exact same mechanism, so all
// get the exception; applying it to only some would be an arbitrary
// inconsistency with no real justification behind it.
function renderRecordPicker(names, depth) {
  return `<ul class="wf-list">${names
    .map((name) => `<li><a href="#" class="wf-list__row" data-path-key="${depth}:${name}">${name}</a></li>`)
    .join('')}</ul>`;
}

function wirePathLinks() {
  canvasEl.querySelectorAll('[data-path-key]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const [d, key] = el.dataset.pathKey.split(':');
      select(Number(d), key);
      render();
    });
  });
}

function breadcrumbHtml(trail) {
  // A single crumb with nothing above or below it is noise — only show the
  // breadcrumb once there's an actual multi-level trail to convey.
  if (trail.length <= 1) return '';
  return (
    `<div class="breadcrumb">` +
    trail
      .map((t, i) => {
        const isLast = i === trail.length - 1;
        const piece = isLast
          ? `<span class="breadcrumb__current">${t.label}</span>`
          : `<a href="#" data-crumb-truncate="${t.truncateTo}">${t.label}</a>`;
        return i === 0 ? piece : `<span class="breadcrumb__sep">/</span>${piece}`;
      })
      .join('') +
    `</div>`
  );
}

function wireBreadcrumb() {
  canvasEl.querySelectorAll('[data-crumb-truncate]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      collapse(Number(el.dataset.crumbTruncate));
      render();
    });
  });
}

// ---------------------------------------------------------------------------
// Sketches — light structural wireframe blocks. No field-level labels or
// real copy; card titles are real (confirmed from production screenshots).
// See ../PATTERNS.md for the full pattern catalog — check it before adding a
// new sketch/shape value, and add new patterns there, not just inline here.

function skeletonField() {
  return `<div class="sketch-skel-field"><div class="sketch-skel-label"></div><div class="sketch-skel-value"></div></div>`;
}

function renderSectionShape(shape) {
  if (shape === 'chips') {
    return `<div class="sketch-chip-row">${Array(7).fill('<div class="sketch-chip"></div>').join('')}</div>`;
  }
  if (shape === 'cols') {
    return `<div class="sketch-cols"><div class="sketch-col">${Array(3)
      .fill(skeletonField())
      .join('')}</div><div class="sketch-col">${Array(3).fill(skeletonField()).join('')}</div></div>`;
  }
  if (shape === 'list') {
    return `<div class="sketch-col">${Array(3).fill(skeletonField()).join('')}</div>`;
  }
  return `<div class="sketch-col">${Array(2).fill(skeletonField()).join('')}</div>`;
}

function renderSectionsSketch(sections) {
  return `<div class="sketch-sections">${sections
    .map((s) => `<div class="sketch-section"><h3 class="sketch-section__title">${s.title}</h3>${renderSectionShape(s.shape)}</div>`)
    .join('')}</div>`;
}

function renderSketch(content) {
  if (content.sketch === 'sections') return renderSectionsSketch(content.sections);
  if (content.sketch === 'media') {
    return `<div class="sketch-cards sketch-cards--media">${Array(8).fill('<div class="sketch-card"></div>').join('')}</div>`;
  }
  if (content.sketch === 'dashboard-cards') {
    // Dashboard card grid (CHANGE-QUEUE.md item 7's 4th pattern) — distinct
    // from 'media': a metric/chart-style card (real title + a skeleton
    // chart/stat block), for dashboard landing pages. `content.cards`:
    // [{title, shape: 'chart'|'stat'}] — real titles confirmed, same rule
    // as everywhere else.
    return `<div class="sketch-dashboard-cards">${content.cards
      .map(
        (c) =>
          `<div class="sketch-dashboard-card"><h3 class="sketch-dashboard-card__title">${c.title}</h3><div class="sketch-dashboard-card__${c.shape === 'stat' ? 'stat' : 'chart'}"></div></div>`
      )
      .join('')}</div>`;
  }
  if (content.sketch === 'list') {
    // `starredRows` (optional): indices that get an illustrative star icon —
    // EXPLORATORY, non-functional (CHANGE-QUEUE.md item 8's "My insights").
    // No real starring interaction, just enough to show the concept.
    const starred = new Set(content.starredRows ?? []);
    return `<ul class="wf-list">${Array(6)
      .fill(null)
      .map((_, i) => `<li class="wf-list__row wf-list__row--sketch${starred.has(i) ? ' wf-list__row--starred' : ''}"></li>`)
      .join('')}</ul>`;
  }
  if (content.sketch === 'table') {
    // `columns` (required): real header labels, confirmed from a production
    // screenshot or explicit decision — same "real titles, skeleton content"
    // rule as everywhere else. Cells are always skeleton bars, never real
    // values. See PATTERNS.md.
    const columns = content.columns ?? [];
    const header = `<tr>${columns.map((c) => `<th>${c}</th>`).join('')}</tr>`;
    const rows = Array(6)
      .fill(null)
      .map(() => `<tr>${columns.map(() => `<td><div class="sketch-table-cell"></div></td>`).join('')}</tr>`)
      .join('');
    return `<table class="sketch-table"><thead>${header}</thead><tbody>${rows}</tbody></table>`;
  }
  return '';
}

// ---------------------------------------------------------------------------

function render() {
  renderRail();
  // Falls through to an honest empty panel/canvas for any section with no
  // data for the current state — covers LH's "Front desk" rail item (no
  // L2/L3 content defined yet, deliberately, no placeholders) the same way
  // it always covered every other undefined case.
  const content = getContent(state.accountType, state.propertyCount);
  const data = content?.[state.section];
  if (!data) {
    panelEl.innerHTML = '';
    canvasEl.innerHTML = '';
    return;
  }
  renderPanel(data);
  renderCanvas(data);
}

document.querySelectorAll('[data-account-type]').forEach((el) => {
  el.addEventListener('click', () => {
    state.accountType = el.dataset.accountType;
    // Front desk (LH-only) can leave state.section pointing at a rail item
    // that doesn't exist for the newly-selected account type — fall back
    // to insights rather than stranding the user on a blank screen.
    if (!getRailItems(state.accountType).some((i) => i.key === state.section)) {
      state.section = 'insights';
    }
    resetPath();
    document.querySelectorAll('[data-account-type]').forEach((b) => {
      b.classList.toggle('is-active', b === el);
    });
    render();
  });
});

document.querySelectorAll('[data-property-count]').forEach((el) => {
  el.addEventListener('click', () => {
    state.propertyCount = el.dataset.propertyCount;
    resetPath();
    document.querySelectorAll('[data-property-count]').forEach((b) => {
      b.classList.toggle('is-active', b === el);
    });
    render();
  });
});

document.querySelectorAll('[data-system-count]').forEach((el) => {
  el.addEventListener('click', () => {
    state.multipleSystems = el.dataset.systemCount === 'multiple';
    document.querySelectorAll('[data-system-count]').forEach((b) => {
      b.classList.toggle('is-active', b === el);
    });
    render();
  });
});

// ---------- Hidden prototype settings sheet ----------
// Not part of the product surface being wireframed — deliberately kept off the
// visible UI. Toggle with the ~ key so it never appears in a screenshot/demo
// unless summoned on purpose.
const sheet = document.getElementById('settingsSheet');
const backdrop = document.getElementById('sheetBackdrop');
const closeBtn = document.getElementById('settingsClose');

function openSheet() {
  sheet.classList.add('is-open');
  backdrop.classList.add('is-open');
}

function closeSheet() {
  sheet.classList.remove('is-open');
  backdrop.classList.remove('is-open');
}

function toggleSheet() {
  sheet.classList.contains('is-open') ? closeSheet() : openSheet();
}

window.addEventListener('keydown', (e) => {
  if (e.key === '`' || e.key === '~') {
    e.preventDefault();
    toggleSheet();
  } else if (e.key === 'Escape') {
    closeSheet();
  }
});

backdrop.addEventListener('click', closeSheet);
closeBtn.addEventListener('click', closeSheet);

render();
