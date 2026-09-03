import {
  getRailItems,
  getContent,
  DEFAULT_SYSTEMS,
  MULTIPLE_SYSTEMS,
  SCOPE_PROPERTIES,
  SCOPE_BRANDS,
  SCOPE_CLUSTERS,
  ALL_DISTRIBUTION_CHANNELS,
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
  // Full-page modal / wizard — the first EDITING surface in this
  // prototype, distinct from everything else (which is all read/browse
  // navigation). "we haven't tackled an editing style surface yet but i
  // see a role for a full page modal concept - possibly multi-step."
  // Deliberately SEPARATE from `path`/`section` — a wizard is a bounded
  // TASK (do a thing, then return), not a place you navigate to; opening
  // one does NOT touch section/path, so cancelling or completing it
  // resumes exactly where the user was, with no nav state to unwind.
  // `null` when no wizard is open. See `openWizard`/`closeWizard`/
  // `renderWizard` below for the mechanism.
  wizard: null, // { steps: WizardStep[], currentStep: number, data: object, onComplete: (data) => void } | null
};

function resetPath() {
  state.path = [];
  state.expandedKey = null;
  state.scope = { type: 'all', key: null };
}

const railEl = document.getElementById('rail');
const railUserEl = document.getElementById('railUser');
const railAssistantEl = document.getElementById('railAssistant');
const railNotificationsEl = document.getElementById('railNotifications');
const panelEl = document.getElementById('secondaryPanel');
const canvasEl = document.getElementById('canvas');
const mobileTopbarTitleEl = document.getElementById('mobileTopbarTitle');
const mobileBackEl = document.getElementById('mobileBack');
const mobileMenuEl = document.getElementById('mobileMenu');
const mobileDrawerEl = document.getElementById('mobileDrawer');
const mobileDrawerBackdropEl = document.getElementById('mobileDrawerBackdrop');
const mobileDrawerCloseEl = document.getElementById('mobileDrawerClose');
const mobileDrawerListEl = document.getElementById('mobileDrawerList');
const wizardOverlayEl = document.getElementById('wizardOverlay');
const wizardStepsEl = document.getElementById('wizardSteps');
const wizardBodyEl = document.getElementById('wizardBody');
const wizardCloseEl = document.getElementById('wizardClose');
const wizardBackEl = document.getElementById('wizardBack');
const wizardNextEl = document.getElementById('wizardNext');

// Theme override — 'system' (default) removes the attribute entirely so
// style.css's `prefers-color-scheme` media query decides, matching every
// other artifact/page in this app; 'light'/'dark' stamp `data-theme` on
// <html> to force one, same mechanism style.css's token blocks already key
// off. Persisted in localStorage so the choice survives a reload. Lives in
// My account → Preferences (moved there, not duplicated, from an earlier
// hidden-prototype-settings-sheet version) — a real product preference,
// not a prototype-only demo toggle like account type/property count.
const THEME_STORAGE_KEY = 'platform-ia-disco:theme';

function applyTheme(choice) {
  if (choice === 'light' || choice === 'dark') {
    document.documentElement.setAttribute('data-theme', choice);
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
}

applyTheme(localStorage.getItem(THEME_STORAGE_KEY) || 'system');

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
      let selected = (explicitKey && tabs.find((t) => t.key === explicitKey)) || tabs.find((t) => t.active) || tabs[0] || null;
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
      // If the tab we're entering has its own content as a nav-dashboard
      // using linksToTab tiles (Rate plans' "tiles nested inside a tab"
      // case), stamp this tabs node's OWN pathIndex onto it here — the
      // only point where a tabs node and a nested nav-dashboard actually
      // meet — so its tiles know which pathIndex to write to (this tabs
      // strip's own, not a level of their own). See the nav-dashboard
      // branch below for why that distinction exists.
      if (selected.content?.type === 'nav-dashboard' && selected.content.tiles.some((t) => t.linksToTab)) {
        selected = { ...selected, content: { ...selected.content, parentTabsPathIndex: pathIndex } };
      }
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
      //
      // `detailNode` may be a Node OR a zero-arg function returning one —
      // resolved lazily, right here, only once a name is actually picked.
      // Required for buildPropertyNode/buildUserNode's mutual cross-links
      // (a property's Users tab opens buildUserNode; a user's Properties
      // tab opens buildPropertyNode): calling both functions EAGERLY while
      // building either one's content recurses forever (each call
      // constructs the other's full tree, which constructs the first
      // one's again, ...) — a real RangeError caught live, not a
      // theoretical concern. Passing a thunk instead defers the recursive
      // call until a render actually needs that specific detail page, at
      // which point the OTHER side's thunk is what gets stored, not
      // invoked — the cycle never actually unwinds infinitely because nav
      // is finite (a person can't click infinitely many times in one
      // session). Every other `records` caller still passes a plain Node
      // — unaffected.
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
      node = typeof content.detailNode === 'function' ? content.detailNode() : content.detailNode;
      pathIndex += 1;
      continue;
    }

    if (content.type === 'nav-dashboard') {
      // Navigation dashboard (6th canonical page-skeleton type, CONTEXT.md's
      // "tabs move a level deeper" candidate model) — a fixed set of named
      // tiles, either:
      //   (a) STANDALONE, replacing a tab strip entirely — each tile is a
      //       distinct child Node (content.tiles[].content), picked via
      //       state.path[pathIndex] same as `tabs`, but rendered as tiles
      //       and NOT staying visible once picked (breadcrumb takes over —
      //       see renderChainBody). This is the Configuration > Properties
      //       case: PROPERTY_NODE's tab strip is wide enough to overload,
      //       so nav-dashboard replaces it as the landing step.
      //   (b) NESTED inside one tab of an otherwise-normal `tabs` node
      //       (content.tiles[].linksToTab, a sibling tab's key, instead of
      //       its own content) — clicking a tile just SWITCHES which
      //       sibling tab is active, same as clicking the tab strip
      //       directly would, no new path level pushed at all. This is
      //       Rate plans' case: the tab strip stays, tiles are a richer,
      //       status-aware entry point into the SAME tabs, not a
      //       replacement for them. Requires the caller (the `tabs` branch
      //       above) to pass `content.parentTabsPathIndex` — the enclosing
      //       tabs node's own pathIndex — since a linksToTab tile writes to
      //       THAT index, not a new one.
      const usesLinksToTab = content.tiles.some((t) => t.linksToTab);
      if (usesLinksToTab) {
        // Mode (b): no descent, no separate path level — this step is
        // purely presentational. The actual tab switch is handled by the
        // SAME tabs-strip mechanism one level up (data-path-key targets
        // content.parentTabsPathIndex, wired in renderNavDashboard).
        chain.push({ node, content, pathIndex, options: content.tiles, selectedKey: null, isExplicit: false });
        break;
      }
      const explicitKey = state.path[pathIndex];
      const selected = explicitKey ? content.tiles.find((t) => t.key === explicitKey) : null;
      chain.push({
        node,
        content,
        pathIndex,
        options: content.tiles,
        selectedKey: selected?.key ?? null,
        isExplicit: Boolean(selected),
      });
      if (!selected) break;
      node = selected;
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

  railUserEl.classList.toggle('is-active', state.section === 'my-account');
  railAssistantEl.classList.toggle('is-active', state.section === 'assistant');
  railNotificationsEl.classList.toggle('is-active', state.section === 'notifications');
}

// Switches to any section by key — state.section + resetPath + render, the
// same underlying mechanism a normal desktop rail-item click uses. Named
// for its original purpose (My account/Notifications/AI assistant, which
// aren't in getRailItems' own list, unlike a normal rail-item click's
// handler), but reused generically by the mobile drawer for ALL sections
// (both getRailItems' own items AND the 3 utility ones) since it's exactly
// the same mechanism either way.
function switchToUtilitySection(key) {
  if (state.section === key) return;
  state.section = key;
  resetPath();
  render();
}

railUserEl.addEventListener('click', () => switchToUtilitySection('my-account'));
railAssistantEl.addEventListener('click', () => switchToUtilitySection('assistant'));
railNotificationsEl.addEventListener('click', () => switchToUtilitySection('notifications'));

// EXPLORATORY — property/cluster/brand scope switcher sketch. See
// CHANGE-QUEUE.md "Foundational, unsolved" section — a section-level
// `scopeSwitcher` flag controls where this shows (currently Insights and
// Distribution wholesale, NOT per-item yet — see CONTEXT.md's per-section
// audit for the target per-item shape, e.g. Rate plans/Yield rules
// shouldn't have this, Inventory needs a different mechanism entirely).
// Renders a single <select> — simplest possible sketch, not a final
// interaction design. Options: All properties, then every individual
// property, then (MP only) Brands and Clusters as scoping groups.
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
// Walks the currently-selected chain looking for the DEEPEST explicit
// `crossNav` records pick (e.g. following buildPropertyNode's "Users" tile
// into a user's own buildUserNode page, or the reverse via buildUserNode's
// "Properties" tab) and returns that pick's `homeItemKey`, if any.
//
// Exists because the rail/L2 panel's highlight (`resolveSelected(items, 0)`
// in renderPanel) only ever reads `state.path[0]` — but a crossNav pick
// happens much deeper in the tree (inside whichever item the user
// originally entered through), and never touches `state.path[0]` itself.
// Caught live: drilling Config → Property → [a property] → Users →
// [a user] left the rail still highlighting "Properties," even though the
// canvas was now showing that user's own "User details / Properties" page
// — a different concept entirely. `homeItemKey` (set alongside each
// `crossNav: true` in nav-data.js) names which rail item that DESTINATION
// conceptually belongs to, so the rail can follow the user across the
// cross-nav instead of staying stuck on wherever they started.
function findCrossNavHomeItemKey(rootItem) {
  if (!rootItem?.content) return null;
  const chain = resolveChain(rootItem);
  let homeItemKey = null;
  for (const step of chain) {
    if (step.content?.type === 'records' && step.isExplicit && step.content.crossNav && step.content.homeItemKey) {
      homeItemKey = step.content.homeItemKey;
    }
  }
  return homeItemKey;
}

// The one section that needs an email-client-style L2 (Notifications, via
// `data.customPanel: 'records-inbox'`) — the notification rows themselves
// (title + snippet) render PERMANENTLY in the L2 panel instead of a normal
// nav-item list, and never disappear once one is picked; the canvas (see
// renderCanvas's matching branch) shows ONLY the selected notification's
// detail. Assumes exactly the shape NOTIFICATIONS_ITEMS has: one panel item
// whose own content is a `records` picker sitting directly on it (pathIndex
// 1, same as any records picker with no wrapping tabs — see resolveChain's
// comment on why pathIndex starts at 1). Not a generalizable mechanism —
// built for this one case; extend deliberately, not by default, if another
// section ever wants the same split.
function renderRecordsInboxPanel(data) {
  const pickerItem = data.items[0];
  const content = pickerItem.content;
  const selectedName = state.path[1] ?? null;
  // NO real title text in the row — "i dont want words in ther just
  // skeleton lines." `name` is still the real underlying value (needed for
  // routing/selection via `data-inbox-name`), it just never renders as
  // visible text — a skeleton bar stands in for the title, same as the
  // snippet line already does for the preview.
  const html = `<ul class="wf-list${content.showSnippet ? ' wf-list--snippets' : ''} wf-list--inbox">${content.names
    .map((name) => {
      const snippet = content.showSnippet ? `<div class="wf-list__row-snippet-skel"></div>` : '';
      return `
        <li>
          <a href="#" class="wf-list__row${name === selectedName ? ' is-active' : ''}" data-inbox-name="${name}">
            <div class="wf-list__row-title-skel"></div>
            ${snippet}
          </a>
        </li>
      `;
    })
    .join('')}</ul>`;
  panelEl.innerHTML = html;
  panelEl.querySelectorAll('[data-inbox-name]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      state.path = [pickerItem.key, el.dataset.inboxName];
      render();
    });
  });
}

function renderPanel(data) {
  if (data.customPanel === 'records-inbox') {
    renderRecordsInboxPanel(data);
    return;
  }
  const items = data.items;
  // Grouping headings (e.g. "Products" — a plain label clustering already-
  // visible sibling items, never itself clickable/routable — see
  // PATTERNS.md's folder-vs-heading rule) are invisible to routing
  // entirely: filtered out before resolveSelected ever sees them, so one
  // can never accidentally become "the routed item" via the nodes[0]
  // fallback if it happened to sit first in the array.
  const routableItems = items.filter((i) => !i.heading);
  const defaultRoutedItem = routableItems.length ? resolveSelected(routableItems, 0) : null;
  // A crossNav pick anywhere deeper in the tree overrides the plain
  // state.path[0] lookup above — see findCrossNavHomeItemKey.
  const crossNavHomeItemKey = findCrossNavHomeItemKey(defaultRoutedItem);
  const routedItem = crossNavHomeItemKey ? routableItems.find((i) => i.key === crossNavHomeItemKey) ?? defaultRoutedItem : defaultRoutedItem;
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
    // `badge` — illustrative "something needs attention" dot (Health check,
    // Recommendations, Dynamic pricing — CONTEXT.md's notification
    // candidate-model). A plain dot, not a count — no real number exists
    // yet. Deliberately scoped to the L2 panel item only, not the rail
    // icon — user's explicit choice, avoiding the larger unsolved question
    // of rail-level badge aggregation. STATIC (always shows, no dismiss
    // interaction) — a dismiss-on-visit behavior was explored and dropped:
    // "maybe it's too much to bother with" — nothing in this prototype
    // tracks real resolved/unresolved state to make a dismiss meaningful.
    // The real-product intent (a badge clears once its underlying issue is
    // addressed) is captured in CONTEXT.md, not simulated here.
    const badge = item.badge ? `<span class="nav-list-item__badge" aria-hidden="true"></span>` : '';
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
        <a href="#" data-item-key="${item.key}">${labelGroup}${star}${badge}${chevron}</a>
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

  // Records-inbox mode (Notifications): the picker itself already rendered
  // PERMANENTLY in the L2 panel (renderRecordsInboxPanel) — the canvas must
  // NOT also render it. Show an empty "select one" state until a
  // notification is actually picked; once picked, skip straight to the
  // detail node's own content (chain[1]), no breadcrumb — there's nothing
  // to crumb back to, the list never left the panel.
  if (data.customPanel === 'records-inbox') {
    if (!chain[0]?.selectedKey) {
      canvasEl.innerHTML = `${switcherHtml}<div class="sketch"><div class="records-inbox-empty">Select a notification to view it</div></div>`;
      wireScopeSwitcher();
      return;
    }
    const detail = renderChainBody(chain, 1);
    canvasEl.innerHTML = `${switcherHtml}<div class="sketch">${detail.bodyHtml}</div>`;
    wireScopeSwitcher();
    wirePathLinks();
    wireThemeToggle();
    wireWizardOpenButtons();
    return;
  }

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
  wireThemeToggle();
  wireWizardOpenButtons();
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
  // A step reached via an explicit `records` pick OR a standalone
  // (non-linksToTab) `nav-dashboard` tile pick already got its OWN crumb
  // segment from that prior step (the record name / the tile's label) —
  // this step's destination node then gets treated as a new root, so its
  // own `step.node.label` must NOT also crumb, or the label doubles up
  // (e.g. a tile named the same as the node it opens, like Property
  // details -> PROPERTY_DETAILS_NODE, both called "Property details").
  const prevWasStandaloneNavDashboard =
    prevStep?.content?.type === 'nav-dashboard' && !prevStep.content.parentTabsPathIndex && prevStep.isExplicit;
  const isDetailNodeRoot = (prevStep?.content?.type === 'records' && prevStep.isExplicit) || prevWasStandaloneNavDashboard;
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
      // `content.starredNames` (optional, e.g. My insights' Dashboards/
      // Charts): shows the illustrative star on specific rows.
      const starredNames = content.starredNames ? new Set(content.starredNames) : null;
      // `content.display: 'table'` (optional, e.g. Rate plans): renders the
      // SAME real, clickable names as a table-styled skeleton instead of a
      // plain list — first column real + clickable, remaining columns
      // skeleton-only, no real headers (same titleless-skeleton convention
      // as everywhere else). Every other `records` caller (Properties,
      // Users, Dashboards, Charts, Yield rules) omits this and keeps the
      // plain list — this is additive, not a replacement.
      const pickerHtml =
        content.display === 'table'
          ? renderRecordTable(step.options, pathIndex, content.tableColumns ?? 3)
          : renderRecordPicker(step.options, pathIndex, starredNames, content.showSnippet);
      // `content.topWidgets` (optional, e.g. Rate plans): a few dashboard-
      // cards widgets rendered ABOVE the picker — "contextual insights
      // around the place rather than just lists." Same building block
      // `nav-dashboard`'s `extraSections` already uses (titleless
      // dashboard-cards, skeleton content, real card count/shape only) —
      // decorative, never navigable, purely a display composition around
      // the one routable element (the picker itself, unchanged). Every
      // other `records` caller omits this and keeps the plain picker.
      const widgetsHtml = content.topWidgets
        ? `<div class="records-page__widgets">${renderSketch(content.topWidgets)}</div>`
        : '';
      return { trail: [], bodyHtml: widgetsHtml + pickerHtml };
    }
    // `content.crossNav` (buildUserNode's Properties tab / buildPropertyNode's
    // Users tile — two `records` pickers that point at EACH OTHER): marks
    // this crumb as a RESET POINT. The breadcrumb must show "where I am,"
    // not "how I clicked here" — without this, repeated back-and-forth
    // (User → Property → User → ...) accumulates every hop into one
    // ever-growing trail (a genuine bug caught live via screenshot: "Users /
    // Jane Smith / Properties / Harbourview Hotel / Users / Jane Smith",
    // names repeated). Simply dropping the locally-accumulated `ownCrumb`
    // here does NOT work — every ANCESTOR call (e.g. the tabs strip for
    // Jane Smith's own User details/Properties tabs, one level up) has
    // already prepended its own crumb via `.concat()` before this code
    // runs, and concatenation can't un-prepend what a caller already added.
    // So instead: tag this one crumb with `resetTrail: true` and let it
    // flow normally through every ancestor's `.concat()` (trail keeps
    // growing structurally, same as always) — then `breadcrumbHtml` (the
    // single place the FINAL trail is consumed) slices off everything
    // before the LAST `resetTrail` crumb, once, right before rendering.
    // `state.path` itself is untouched either way — still the real click
    // history for routing/truncateTo purposes.
    const recordCrumb = { label: selectedKey, truncateTo: pathIndex + 1, resetTrail: content.crossNav === true };
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

  if (content.type === 'nav-dashboard') {
    // Mode (b), nested in a tab (content.tiles[].linksToTab set): tiles
    // target the ENCLOSING tabs node's own pathIndex, not this step's —
    // clicking one just switches the active sibling tab, no path level of
    // its own, no crumb (nothing was pushed). Mode (a), standalone: tiles
    // target this step's own pathIndex, same as before.
    const targetPathIndex = content.parentTabsPathIndex ?? pathIndex;
    if (!selectedKey) {
      // Still on the dashboard itself — no crumb yet, same as an
      // unselected `records` picker.
      return { trail: [], bodyHtml: renderNavDashboardPage(content, step.options, targetPathIndex) };
    }
    // Once a tile is picked, the tile grid does NOT stay visible (unlike
    // `tabs`' strip) — the breadcrumb takes over as the way back, per
    // CONTEXT.md's "tabs move a level deeper" plan.
    const selectedTile = content.tiles.find((t) => t.key === selectedKey);
    const tileCrumb = { label: selectedTile?.label ?? selectedKey, truncateTo: pathIndex + 1 };
    const ownCrumb = i === 0 ? [{ label: step.node.label, truncateTo: pathIndex }] : crumb;
    const inner = renderChainBody(chain, i + 1);
    // The dashboard tile only shows a plain dot (renderNavDashboard) — the
    // actual tip TEXT surfaces here instead, once the user has clicked
    // through to this specific tile's own page. Keeps the dashboard level
    // calm (see renderNavDashboard's comment) while still explaining the
    // callout somewhere real, one level in.
    const tipBanner = selectedTile?.tip ? renderTileTipBanner(selectedTile.tip) : '';
    return { trail: ownCrumb.concat(tileCrumb, inner.trail), bodyHtml: tipBanner + inner.bodyHtml };
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
// `starredNames` (optional): a Set of names that get the illustrative star
// indicator (CHANGE-QUEUE.md item 8's My insights) — shows the same
// starred/promoted relationship on the actual picker row, not just on the
// duplicated top-level entry, so it "gets across" visually in both places
// (user's explicit direction). Only meaningful for the `records` pattern's
// custom-dashboard pickers; the properties/systems pickers never pass this.
// `showSnippet` (optional) — an email-inbox-style row instead of a plain
// single line: the real name stays the title, plus a second skeleton line
// underneath standing in for a preview/summary — "have the summaries
// stacked in the L2 panel and the detail in the main panel - just like an
// email browser might have it" (Notifications' own request). Skeleton, not
// real preview text, matching this prototype's standing "real titles,
// skeleton content" rule — no real notification body copy is confirmed.
// Every other `records` caller (Properties, Users, Dashboards, Charts,
// Yield rules) omits this and keeps the plain single-line row.
function renderRecordPicker(names, depth, starredNames, showSnippet) {
  return `<ul class="wf-list${showSnippet ? ' wf-list--snippets' : ''}">${names
    .map((name) => {
      const star = starredNames?.has(name) ? `<span class="nav-list-item__star" aria-hidden="true"></span>` : '';
      const snippet = showSnippet ? `<div class="wf-list__row-snippet-skel"></div>` : '';
      return `
        <li>
          <a href="#" class="wf-list__row" data-path-key="${depth}:${name}">
            <span class="wf-list__row-title">${name}${star}</span>
            ${snippet}
          </a>
        </li>
      `;
    })
    .join('')}</ul>`;
}

// Table-styled variant of the same real-names exception above (e.g. Rate
// plans, per the user's direction: "let's make it a table skeleton - but
// show clickable names just like the current list"). First column is the
// SAME real, clickable name renderRecordPicker uses; `extraColumns` (a
// count, not real data) renders as plain skeleton cells alongside it — no
// real headers at all, same titleless-skeleton convention as everywhere
// else (this is a table's SHAPE, not its confirmed content).
function renderRecordTable(names, depth, extraColumns) {
  const rows = names
    .map(
      (name) => `
        <tr>
          <td><a href="#" class="sketch-table__name-link" data-path-key="${depth}:${name}">${name}</a></td>
          ${Array(extraColumns).fill('<td><div class="sketch-table-cell"></div></td>').join('')}
        </tr>
      `
    )
    .join('');
  return `<table class="sketch-table">${rows}</table>`;
}

// Navigation dashboard (6th canonical page-skeleton type) — a flat grid of
// clickable TILES, each a real navigation destination (not decoration, and
// not the same thing as the inert `dashboard-cards` sketch's stat/chart
// cards). Each tile: a real confirmed title (the tile's own label IS the
// heading — no separate grouping heading above clusters of tiles, per the
// user's explicit "flat set for now - with the headings in the tile
// itself"), an OPTIONAL always-on status stat (`t.stat`, e.g. "5 channels
// connected, 2 awaiting setup" — a real string when the underlying
// data/wording is decided, a skeleton block otherwise; fills the slot that
// used to be a pure metric-skeleton placeholder — "all tiles would have
// key stats like that"), an OPTIONAL attention callout (`t.tip`, e.g. "Not
// connected to a PMS" — deliberately SEPARATE from `stat`, not a
// replacement for it: "and then sometimes a callout for something that
// needs attention"), and a trailing "›" chevron affordance marking it as a
// link, same visual role `.nav-list-item__chevron` plays for a
// folder-style panel item, but this is a NEW element since these are
// canvas tiles, not panel-list rows.
//
// `t.tip`'s TEXT does NOT render on the dashboard tile itself — a first
// version rendered it as a badged chip right on the tile, but with 3+
// tiles carrying one at once that read as alarm/negative noise on what's
// meant to be a calm, "optimize" surface (the user's own call, live: "it
// might be too much negative noise on the dashboard level"). Revised: the
// tile shows only a plain dot (`.nav-dashboard__tile-dot`, same visual
// language as the panel-item badge) signaling "something to look at
// here" — no wording, no color-block chip. The actual tip text moved to a
// banner (`renderTileTipBanner`) on the tile's OWN destination page,
// prepended once the user clicks through (see renderChainBody's
// `nav-dashboard` branch) — "show them in more detail when user clicks
// through."
//
// `t.key` (mode a, standalone — see resolveChain) vs. `t.linksToTab` (mode
// b, nested in a tab — the tile switches a SIBLING tab instead of pushing
// a path level) both route through the same `data-path-key` mechanism
// (`wirePathLinks`/`select`) — the only difference is which key routes and
// which pathIndex it targets (passed in as `depth`, resolved by the caller
// to either this step's own pathIndex or the enclosing tabs node's, per
// renderChainBody's `targetPathIndex`).
function renderNavDashboard(tiles, depth) {
  return `<div class="nav-dashboard">${tiles
    .map((t) => {
      const routeKey = t.linksToTab ?? t.key;
      const stat = t.stat
        ? `<span class="nav-dashboard__tile-stat">${t.stat}</span>`
        : `<div class="nav-dashboard__tile-stat-skel"></div>`;
      // `t.tip`'s actual text does NOT render here — three-plus red chips
      // sitting on one dashboard read as alarm, not "optimize" (the user's
      // own call: "might be too much negative noise on the dashboard
      // level"). Just a plain dot next to the title, same visual language
      // as the panel-item badge (.nav-list-item__badge) — "is there
      // something to look at," not what it is. The real explanation moved
      // to a banner on the tile's OWN destination page instead (see
      // renderChainBody's nav-dashboard branch) — click through for detail.
      const tipDot = t.tip ? `<span class="nav-dashboard__tile-dot" aria-hidden="true"></span>` : '';
      return `
        <a href="#" class="nav-dashboard__tile" data-path-key="${depth}:${routeKey}">
          <div class="nav-dashboard__tile-metric-skel"></div>
          <span class="nav-dashboard__tile-body">
            <span class="nav-dashboard__tile-title">${t.label}${tipDot}</span>
            ${stat}
          </span>
          <svg class="nav-dashboard__tile-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg>
        </a>
      `;
    })
    .join('')}</div>`;
}

// The tip TEXT's actual home — a tile's destination page, prepended once
// the user clicks through from the dashboard (see renderChainBody's
// `nav-dashboard` branch). Deliberately a plain banner, not the dashboard
// tile's old badged-chip treatment repeated here — one callout on its own
// page reads as normal page-level messaging, not stacked alarm noise.
function renderTileTipBanner(tip) {
  return `<div class="tile-tip-banner"><span class="tile-tip-banner__dot" aria-hidden="true"></span>${tip}</div>`;
}

// Wraps a nav-dashboard's tile grid with an optional page title and
// optional stacked EXTRA sections below it — e.g. Rate plans' Overview:
// "Configuration" (a titled heading over the existing Rooms/Channels/
// Integrated systems/Properties tiles — user's direction: "top strip we
// currently have is configuration, can have a title"), then "Performance"
// (a few dashboard-cards chart widgets) and "Adoption" (a channel-adoption
// table, skeleton-only for now — "we can keep it to skeleton concepts for
// now"). The tile grid itself is UNCHANGED and stays fully routable
// (clicking a tile still switches tabs/pushes a path level exactly as
// before) — only decorative content, via the extra sections, using the
// SAME `renderSketch` dispatcher every other sketch-only leaf uses. Extra
// sections are never navigable — this is purely a display composition
// around the one routable element (the tile grid), not a new content type
// every node needs to support.
//
// `content.title` (optional): heading shown above the tile grid.
// `content.extraSections` (optional): [{ title, content: { type:'sketch', ... } }],
// rendered below the tile grid, each with its own `.nav-dashboard-page__section-title`.
function renderNavDashboardPage(content, tiles, depth) {
  const titleHtml = content.title ? `<h2 class="nav-dashboard-page__title">${content.title}</h2>` : '';
  const tileGrid = renderNavDashboard(tiles, depth);
  const extraSections = (content.extraSections ?? [])
    .map(
      (s) => `
        <div class="nav-dashboard-page__section">
          <h3 class="nav-dashboard-page__section-title">${s.title}</h3>
          ${renderSketch(s.content)}
        </div>
      `
    )
    .join('');
  return `<div class="nav-dashboard-page">${titleHtml}${tileGrid}${extraSections}</div>`;
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

// Generic entry point for any canvas element that opens a wizard —
// `data-wizard-open="<id>"` maps to a lookup table of wizard DEFINITIONS
// (steps + onComplete), so new wizards register themselves in
// WIZARD_DEFINITIONS below rather than each needing bespoke wiring here.
function wireWizardOpenButtons() {
  canvasEl.querySelectorAll('[data-wizard-open]').forEach((el) => {
    el.addEventListener('click', () => {
      const definition = WIZARD_DEFINITIONS[el.dataset.wizardOpen];
      if (definition) openWizard(definition);
    });
  });
}

// "Add channel" — the wizard's first real instance, direction-setting for
// this whole IA's not-yet-tackled editing-surface pattern. Two steps,
// always both shown (no conditional skip yet — "sometimes do some channel
// level config stuff" simplified to "always show it, for now," since no
// real per-channel mapping requirements are confirmed): pick a channel
// from the FULL distribution universe (OTAs + Direct Booking + Channels
// Plus, one flat list, no grouping), then a generic mapping-config step.
// `onComplete` is a no-op for now — this prototype has no persistent data
// layer to actually add the picked channel to RATE_PLAN_CHANNELS and
// re-render it into the Channels tab; the wizard's OWN mechanism (open →
// step through → close, resuming exactly where the user was) is the thing
// being demonstrated, not a full simulated backend.
const WIZARD_DEFINITIONS = {
  'add-channel': {
    steps: [
      {
        title: 'Choose channel',
        render: (wizard) => `
          <h2 class="wizard-step__title">Choose a channel to add</h2>
          <ul class="wf-list wizard-channel-picker">${ALL_DISTRIBUTION_CHANNELS.map(
            (name) => `
              <li>
                <a href="#" class="wf-list__row${wizard.data.channel === name ? ' is-active' : ''}" data-wizard-select="channel" data-wizard-value="${name}">
                  <span class="wf-list__row-title">${name}</span>
                </a>
              </li>
            `
          ).join('')}</ul>
        `,
        onNext: (wizard) => Boolean(wizard.data.channel),
      },
      {
        title: 'Configure mapping',
        render: () => `
          <h2 class="wizard-step__title">Configure mapping</h2>
          ${renderSectionsSketch([
            { title: 'Room type mapping', shape: 'list' },
            { title: 'Rate mapping', shape: 'list' },
          ])}
        `,
      },
    ],
    onComplete: () => {},
  },
};

function breadcrumbHtml(trail) {
  // Slice off everything before the LAST `resetTrail` crumb (see the
  // `records` branch's `crossNav` handling in renderChainBody) — a
  // cross-navigation re-entry (User ↔ Property) marks its own crumb this
  // way so the breadcrumb shows "where I am," not the full click history
  // that led here. `state.path`/truncateTo are untouched by this — only
  // what's DISPLAYED is trimmed, applied once here since every ancestor's
  // `.concat()` along the way can only grow the trail, never retroactively
  // shorten what a caller already prepended.
  const lastResetIndex = trail.reduce((acc, t, i) => (t.resetTrail ? i : acc), -1);
  const visibleTrail = lastResetIndex > 0 ? trail.slice(lastResetIndex) : trail;
  // A single crumb with nothing above or below it is noise — only show the
  // breadcrumb once there's an actual multi-level trail to convey.
  if (visibleTrail.length <= 1) return '';
  return (
    `<div class="breadcrumb">` +
    visibleTrail
      .map((t, i) => {
        const isLast = i === visibleTrail.length - 1;
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
  if (shape === 'theme-toggle') return renderThemeToggle();
  return `<div class="sketch-col">${Array(2).fill(skeletonField()).join('')}</div>`;
}

// The one deliberately LIVE (non-skeleton-only) control in this prototype
// — "make it a skeleton - but make it work!" Looks exactly like every
// other section's skeleton content (plain bars, no visible label text,
// same treatment as .sketch-skel-value) so it doesn't stand out as
// obviously more "finished" than its neighbors — but is fully wired
// underneath: each bar is a real `data-theme-choice` button, same
// mechanism/CSS shell (`.scope-toggle`) the old hidden-settings-sheet
// version used before this control MOVED here (not duplicated — see
// `wireThemeToggle`, called once per render since this section only
// exists on Preferences, not present in the static index.html shell the
// old one-time wiring assumed).
function renderThemeToggle() {
  const current = localStorage.getItem(THEME_STORAGE_KEY) || 'system';
  return `<div class="scope-toggle theme-toggle-skel">${['system', 'light', 'dark']
    .map(
      (choice) =>
        `<button class="theme-toggle-skel__bar${choice === current ? ' is-active' : ''}" data-theme-choice="${choice}" aria-label="${choice}"></button>`
    )
    .join('')}</div>`;
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
    // Dashboard card grid (PATTERNS.md's 4th canonical type) — distinct
    // from 'media': a metric/chart-style card, for dashboard landing
    // pages. `content.cards`: [{title?, shape: 'chart'|'stat'}] — `title`
    // is OPTIONAL: give it when a real card title is confirmed (same
    // "real titles, skeleton content" rule as everywhere else); omit it
    // to render a skeleton title bar instead, for indicating the page
    // SHAPE only, with no real content confirmed yet (e.g. Insights'
    // Dashboard — confirmed with user: doesn't need real titles, just
    // needs to read as a dashboard-style page).
    return `<div class="sketch-dashboard-cards">${content.cards
      .map((c) => {
        const title = c.title
          ? `<h3 class="sketch-dashboard-card__title">${c.title}</h3>`
          : `<div class="sketch-dashboard-card__title-skel"></div>`;
        return `<div class="sketch-dashboard-card">${title}<div class="sketch-dashboard-card__${c.shape === 'stat' ? 'stat' : 'chart'}"></div></div>`;
      })
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
  if (content.sketch === 'calendar') {
    // Front desk's specific preset of the generic 'grid' pattern below — 7
    // weekday columns, 5 rows, no row labels (a month-calendar shape).
    // Kept as its own sketch value (rather than requiring every call site
    // to spell out the weekday columns) since "calendar" is a meaningful
    // name on its own; it just delegates to the same renderer.
    return renderGridSketch({ columns: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], rowCount: 5 });
  }
  if (content.sketch === 'grid') {
    // GENERIC grid pattern (Distribution batch item 4) — generalized from
    // the calendar pattern so the same mechanism works for both a month
    // calendar (real column labels, no row labels) and a room-type x date
    // matrix like Inventory (skeleton-only — "just a skeleton without
    // words", confirmed by user; real column/row TEXT is optional, not
    // required, unlike the calendar case).
    // `content.columns` (required): either an array of real header labels
    // (real text, like the calendar's weekdays), OR a plain number — a
    // column COUNT with no real labels, rendering skeleton bars instead
    // (Inventory's case: shape only, nothing confirmed to say yet).
    // `content.rows` (optional): either an array of real row label text,
    // OR a plain number — a row count with skeleton bars instead of real
    // labels. When given (either form), `content.rowCount` is ignored.
    // `content.rowCount` (optional, default 5): used only when `rows` is
    // omitted entirely, for a plain grid with no row-label column at all
    // (calendar's case).
    return renderGridSketch(content);
  }
  if (content.sketch === 'chat-start') {
    // AI assistant's fresh-chat landing — a centered greeting, a few
    // skeleton "suggested prompt" chips, and a skeleton input bar pinned to
    // the bottom. Shape only, same skeleton-until-confirmed convention as
    // everywhere else — no real greeting copy or prompt suggestions
    // decided yet.
    return `
      <div class="chat-start">
        <div class="chat-start__greeting-skel"></div>
        <div class="chat-start__prompts">${Array(3).fill('<div class="chat-start__prompt-skel"></div>').join('')}</div>
        <div class="chat-start__input-skel"></div>
      </div>
    `;
  }
  if (content.sketch === 'message-view') {
    // Notifications' detail page — deliberately NO real text anywhere, not
    // even a card title ("make the main view totally skeleton with no
    // words"), unlike `sections`' standing "real titles, skeleton content"
    // rule. Reads as an open email/message: a subject-line skeleton bar, a
    // shorter meta-line bar underneath it, then a handful of body-paragraph
    // skeleton lines of varying width (not all 100%, so it reads as text
    // rather than a stack of identical bars).
    const bodyWidths = [92, 78, 88, 60, 84];
    return `
      <div class="message-view">
        <div class="message-view__subject-skel"></div>
        <div class="message-view__meta-skel"></div>
        <div class="message-view__body">${bodyWidths
          .map((w) => `<div class="message-view__line-skel" style="width:${w}%"></div>`)
          .join('')}</div>
      </div>
    `;
  }
  if (content.sketch === 'channel-rates') {
    // Rate plan → Channels tab's real shape (was a plain sketch:'list'
    // stub) — "i see a channel and then the channel rates below it, and
    // then another channel etc." An "Add channel" action row (same visual
    // language as My account's action rows) leads into the new
    // full-page wizard (see wireChannelRates/openWizard) — this sketch's
    // return value gets wired up separately from every other sketch
    // (which are inert strings) because this ONE needs to open the
    // wizard, not push a nav path. `content.channels`: real channel names
    // currently connected to this rate plan (RATE_PLAN_CHANNELS) — each
    // gets its own card with a skeleton mini-table underneath standing in
    // for "this channel's rates, one row per room type" (a rate = rate
    // plan × room type, per the user's own definition) — no real room-type
    // names/prices confirmed, shape only.
    const channelCards = content.channels
      .map(
        (name) => `
          <div class="channel-rates__card">
            <h3 class="channel-rates__channel-name">${name}</h3>
            <table class="sketch-table channel-rates__table">
              <tbody>${Array(3)
                .fill(null)
                .map(
                  () => `
                    <tr>
                      <td><div class="sketch-table-cell" style="width:40%"></div></td>
                      <td><div class="sketch-table-cell"></div></td>
                    </tr>
                  `
                )
                .join('')}</tbody>
            </table>
          </div>
        `
      )
      .join('');
    return `
      <div class="channel-rates">
        <button class="channel-rates__add-btn" data-wizard-open="add-channel">
          <span class="nav-list-item__action-icon" aria-hidden="true">+</span>
          Add channel
        </button>
        ${channelCards}
      </div>
    `;
  }
  return '';
}

function renderGridSketch({ columns, rows, rowCount = 5 }) {
  const hasColumnLabels = Array.isArray(columns);
  const columnCount = hasColumnLabels ? columns.length : columns;
  const hasRowLabels = Array.isArray(rows);
  const hasRows = rows !== undefined && rows !== null;
  // Same grid-template-columns applied to BOTH the header and the body —
  // they must match exactly or the header's labels drift out of alignment
  // with the body's actual columns (caught visually: header stacked
  // vertically instead of aligning with the day columns below it, since
  // only .sketch-grid__body had this set inline, not .sketch-grid__header).
  const gridStyle = `grid-template-columns: ${hasRows ? 'minmax(120px, auto) ' : ''}repeat(${columnCount}, 1fr);`;
  const columnHeaderCells = hasColumnLabels
    ? columns.map((c) => `<div>${c}</div>`).join('')
    : Array(columnCount).fill('<div class="sketch-grid__header-skel"></div>').join('');
  const header = `<div class="sketch-grid__header" style="${gridStyle}">${
    hasRows ? '<div class="sketch-grid__row-label-spacer"></div>' : ''
  }${columnHeaderCells}</div>`;
  const totalRows = hasRows ? (hasRowLabels ? rows.length : rows) : rowCount;
  const body = Array(totalRows)
    .fill(null)
    .map((_, r) => {
      const rowLabel = hasRows
        ? hasRowLabels
          ? `<div class="sketch-grid__row-label">${rows[r]}</div>`
          : `<div class="sketch-grid__row-label"><div class="sketch-grid__row-label-skel"></div></div>`
        : '';
      const cells = Array(columnCount)
        .fill('<div class="sketch-grid__cell"><div class="sketch-grid__cell-fill"></div></div>')
        .join('');
      return rowLabel + cells;
    })
    .join('');
  return `<div class="sketch-grid">${header}<div class="sketch-grid__body" style="${gridStyle}">${body}</div></div>`;
}

// ---------------------------------------------------------------------------
// Full-page modal / wizard — the first EDITING surface in this prototype.
// Everything else here is read/browse navigation (drill-down, tabs, tiles);
// a wizard is a bounded TASK — pick some things, configure them, commit —
// that starts and ends without altering where the user was. Deliberately
// separate from state.path/section: opening one does not push a path level
// or change section, so cancelling or completing it needs no nav state to
// unwind, `render()` just resumes showing whatever was already there.
//
// A step is `{ title, render: (wizard) => string, onNext?: (wizard) =>
// boolean }` — `render` returns the step's own body HTML (any existing
// sketch/pattern can be reused inside it); `onNext` (optional) validates/
// commits that step's data before advancing, returning `false` to block
// advancing (not used by the first instance below, but part of the shape
// so a later step CAN block on incomplete input without a new mechanism).
// `wizard.data` is a plain object steps read/write into as scratch state
// for the whole flow (e.g. which channel was picked in step 1, read back
// in step 2's mapping UI) — cleared once the wizard closes.
function openWizard({ steps, onComplete }) {
  state.wizard = { steps, currentStep: 0, data: {}, onComplete };
  renderWizard();
}

function closeWizard() {
  state.wizard = null;
  wizardOverlayEl.hidden = true;
}

function renderWizard() {
  const wizard = state.wizard;
  if (!wizard) {
    wizardOverlayEl.hidden = true;
    return;
  }
  wizardOverlayEl.hidden = false;
  const { steps, currentStep } = wizard;
  const isLastStep = currentStep === steps.length - 1;

  wizardStepsEl.innerHTML = steps
    .map((s, i) => {
      const stepState = i < currentStep ? 'is-done' : i === currentStep ? 'is-current' : '';
      return `<span class="wizard__step ${stepState}">${i + 1}. ${s.title}</span>`;
    })
    .join('<span class="wizard__step-sep" aria-hidden="true"></span>');

  wizardBodyEl.innerHTML = steps[currentStep].render(wizard);

  wizardBackEl.hidden = currentStep === 0;
  wizardNextEl.textContent = isLastStep ? 'Done' : 'Next';

  wizardBodyEl.querySelectorAll('[data-wizard-select]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      wizard.data[el.dataset.wizardSelect] = el.dataset.wizardValue;
      renderWizard();
    });
  });
}

wizardCloseEl.addEventListener('click', closeWizard);

wizardBackEl.addEventListener('click', () => {
  const wizard = state.wizard;
  if (!wizard || wizard.currentStep === 0) return;
  wizard.currentStep -= 1;
  renderWizard();
});

wizardNextEl.addEventListener('click', () => {
  const wizard = state.wizard;
  if (!wizard) return;
  const step = wizard.steps[wizard.currentStep];
  if (step.onNext && step.onNext(wizard) === false) return;
  const isLastStep = wizard.currentStep === wizard.steps.length - 1;
  if (isLastStep) {
    wizard.onComplete?.(wizard.data);
    closeWizard();
    render();
    return;
  }
  wizard.currentStep += 1;
  renderWizard();
});

// ---------------------------------------------------------------------------

function render() {
  renderRail();
  // Falls through to an honest empty panel/canvas for any section with no
  // data for the current state (e.g. an undefined rail item for a given
  // account type) — no placeholders, just nothing rendered.
  const content = getContent(state.accountType, state.propertyCount);
  const data = content?.[state.section];
  if (!data) {
    panelEl.innerHTML = '';
    canvasEl.innerHTML = '';
    return;
  }
  // `noPanel` (CHANGE-QUEUE.md item 1, Front desk's calendar) hides the L2
  // panel COLUMN entirely — not just rendering it empty, which would still
  // reserve its fixed width in the flex layout. The canvas needs the full
  // combined width. See the `.secondary-panel.is-hidden` CSS rule.
  panelEl.classList.toggle('is-hidden', Boolean(data.noPanel));
  if (!data.noPanel) {
    renderPanel(data);
  } else {
    panelEl.innerHTML = '';
  }
  renderCanvas(data);
  renderMobileChrome(data);
}

// ---------------------------------------------------------------------------
// Mobile shell — additive only, zero changes to the desktop render path
// above. Desktop keeps showing rail + L2 panel + canvas side by side at all
// times (CSS handles that); below the mobile breakpoint, CSS instead shows
// exactly ONE of {L2 panel, canvas} at a time, driven by `.is-mobile-canvas`
// on `.app-body` — no separate "which screen" state needed, this is derived
// straight from `state.path.length` each render: an empty path means nothing
// has been drilled into yet (show the L2 list), any non-empty path means the
// canvas has something to show (show it, with a back arrow to return to the
// list). This single derivation covers every existing content shape for
// free, including the records-inbox custom panel (Notifications) — its own
// "list stays put, canvas shows the detail" behavior already matches "path
// empty = panel, path non-empty = canvas" exactly, no special-casing needed.
// `noPanel` sections (Front desk) have no panel to fall back to at all, so
// they always show canvas on mobile too — same reasoning as desktop's own
// `.secondary-panel.is-hidden` handling.
const appBodyEl = document.querySelector('.app-body');

// Labels for the 3 utility destinations (My account/Notifications/AI
// assistant) — these aren't in getRailItems' own list (they're reached via
// separate rail buttons, not a rail section), so the mobile topbar title
// needs its own small lookup for them alongside getRailItems' sections.
const UTILITY_SECTION_LABELS = {
  'my-account': 'My account',
  notifications: 'Notifications',
  assistant: 'AI assistant',
};

function renderMobileChrome(data) {
  const showingCanvas = Boolean(data.noPanel) || state.path.length > 0;
  appBodyEl.classList.toggle('is-mobile-canvas', showingCanvas);
  // Back arrow and hamburger occupy the SAME slot — never both at once (not
  // a standard pattern; showing both is redundant since back already leads
  // toward the drawer eventually, just one step at a time). Back only makes
  // sense when there's an L2 to return to, so `noPanel` sections (Front
  // desk) keep the hamburger even while "drilled in" — there's nothing to
  // go back to at the L2 level, the hamburger is the only way to leave.
  const showBack = showingCanvas && !data.noPanel;
  mobileBackEl.hidden = !showBack;
  mobileMenuEl.hidden = showBack;

  const items = getRailItems(state.accountType);
  const currentItem = items.find((i) => i.key === state.section);
  mobileTopbarTitleEl.textContent = currentItem?.label ?? UTILITY_SECTION_LABELS[state.section] ?? '';
}

mobileBackEl.addEventListener('click', () => {
  collapse(0);
  render();
});

function openMobileDrawer() {
  renderMobileDrawer();
  mobileDrawerEl.classList.add('is-open');
  mobileDrawerBackdropEl.classList.add('is-open');
}

function closeMobileDrawer() {
  mobileDrawerEl.classList.remove('is-open');
  mobileDrawerBackdropEl.classList.remove('is-open');
}

mobileMenuEl.addEventListener('click', openMobileDrawer);
mobileDrawerCloseEl.addEventListener('click', closeMobileDrawer);
mobileDrawerBackdropEl.addEventListener('click', closeMobileDrawer);

// The drawer lists every rail section PLUS the 3 utility destinations
// (assistant/notifications/my account) as ONE flat list — reuses
// getRailItems' own data for the sections rather than hand-maintaining a
// second copy; the 3 utility rows are appended with the exact same
// section-switch mechanism `switchToUtilitySection` already uses for their
// desktop rail buttons.
function renderMobileDrawer() {
  const items = getRailItems(state.accountType);
  const sectionRows = items
    .map(
      (item) => `
        <li>
          <button class="mobile-drawer__item${item.key === state.section ? ' is-active' : ''}" data-drawer-section="${item.key}">
            <span class="mobile-drawer__item-icon" aria-hidden="true">${RAIL_ICONS[item.icon] ?? ''}</span>
            ${item.label}
          </button>
        </li>
      `
    )
    .join('');
  const utilityRows = [
    { key: 'assistant', label: 'AI assistant' },
    { key: 'notifications', label: 'Notifications' },
    { key: 'my-account', label: 'My account' },
  ]
    .map(
      (u) => `
        <li>
          <button class="mobile-drawer__item${u.key === state.section ? ' is-active' : ''}" data-drawer-section="${u.key}">
            ${u.label}
          </button>
        </li>
      `
    )
    .join('');
  mobileDrawerListEl.innerHTML = sectionRows + `<li class="mobile-drawer__divider"></li>` + utilityRows;
  mobileDrawerListEl.querySelectorAll('[data-drawer-section]').forEach((el) => {
    el.addEventListener('click', () => {
      switchToUtilitySection(el.dataset.drawerSection);
      closeMobileDrawer();
    });
  });
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
    // Deliberately NOT calling resetPath() here (unlike account-type, which
    // can change which sections/items exist at all) — property count only
    // gates a few things within an otherwise-identical structure
    // (showProperties-driven tabs/tiles, the scope switcher, mpOnly items),
    // so staying on the current path lets the user watch a page react to
    // the toggle in place, instead of bouncing back to that section's
    // default landing item. resolveSelected/resolveChain's explicit-key-or-
    // fallback lookups already handle the rare case where the current path
    // points at something that stops existing (e.g. a Properties tab that
    // disappears going single-property) by falling back to that level's
    // default, not crashing.
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

// Wires the theme-toggle skeleton's buttons — called per-render (from
// wirePathLinks, alongside every other canvas interactive element), NOT
// once at load like the rest of this file's `[data-...]` toggles. Those
// all live in index.html's static shell; this control instead renders
// fresh into the canvas's innerHTML every time Preferences is shown, so a
// one-time querySelectorAll (as the old settings-sheet version used)
// would only ever find it the very first time and go stale after any
// re-render.
function wireThemeToggle() {
  canvasEl.querySelectorAll('[data-theme-choice]').forEach((el) => {
    el.addEventListener('click', () => {
      const choice = el.dataset.themeChoice;
      applyTheme(choice);
      localStorage.setItem(THEME_STORAGE_KEY, choice);
      canvasEl.querySelectorAll('[data-theme-choice]').forEach((b) => {
        b.classList.toggle('is-active', b === el);
      });
    });
  });
}

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
