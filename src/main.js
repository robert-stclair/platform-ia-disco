import { RAIL_ITEMS, CONTENT, PROPERTY_NODE, DEFAULT_SYSTEMS, MULTIPLE_SYSTEMS } from './nav-data.js';
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
// currently revealed (Booking engine → Selling tools/Setup/Branding).
// Opening a folder-style item does NOT change the route/canvas — only
// clicking a specific child inside it does. This mirrors a real folder
// tree: expanding ≠ selecting.

const state = {
  accountType: 'SM', // 'SM' | 'LH' | 'MP' — independent of propertyCount; only SM has real content so far
  propertyCount: 'single', // 'single' | 'multiple' — independent of accountType
  section: 'insights',
  path: [], // e.g. ['property-settings', 'services'] or ['booking-engine', 'setup', 'contact-page']
  expandedKey: null, // which top-level 'list'-type item is expanded in the panel (UI-only)
  multipleSystems: false, // hidden-settings toggle: does every property have >1 connected system?
};

function resetPath() {
  state.path = [];
  state.expandedKey = null;
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

function renderRail() {
  railEl.innerHTML = RAIL_ITEMS.map(
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

// The Configuration/legacy-shape panel: `data.items[]` are plain rail-item
// siblings; some carry `content` (the new recursive node shape). Distribution
// still has its own separate legacy `data.sublist` for the MP case — passed
// through untouched pending its own refactor.
function renderPanel(data) {
  let html = `<ul class="nav-list">`;

  const contentItems = data.items.filter((i) => i.key);
  // What's actually routed/showing in the canvas right now (falls back to
  // the default like everywhere else) — used to highlight 'tabs' items.
  const routedItem = contentItems.length ? resolveSelected(contentItems, 0) : null;
  // Which 'list' item is expanded in the panel — UI-only, independent of
  // routing. No default: nothing is expanded until explicitly clicked.
  const expandedItem = contentItems.find((i) => i.key === state.expandedKey) ?? null;

  data.items.forEach((item) => {
    const hasList = item.content?.type === 'list';
    // A 'list' item shows an "open" state (expanded, not routed) — visually
    // distinct from '.is-active' (actually routed/showing in the canvas),
    // so an expanded folder never looks the same as real selection.
    const isRouted = !item.key ? item.active : !hasList && item === routedItem;
    const isOpen = hasList && item === expandedItem;
    const chevron = hasList
      ? `<svg class="nav-list-item__chevron${isOpen ? ' is-open' : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg>`
      : '';
    html += `
      <li class="nav-list-item${isRouted ? ' is-active' : ''}${isOpen ? ' is-open' : ''}">
        <a href="#" ${item.key ? `data-item-key="${item.key}"` : ''}>${item.label}${chevron}</a>
      </li>
    `;
  });
  html += `</ul>`;

  // Legacy section-level sublist (Distribution's MP "Properties" tab).
  if (data.sublist) {
    html += `<ul class="nav-sublist">${data.sublist
      .map((s) => `<li><a href="#" class="${s.active ? 'is-active' : ''}">${s.label}</a></li>`)
      .join('')}</ul>`;
  }

  // The expanded item's own children. No default highlight — opening the
  // folder doesn't select a child, so nothing looks selected until the user
  // explicitly clicks one.
  if (expandedItem?.content?.type === 'list') {
    // `mpOnly` items (e.g. Brands/Clusters) only show for the MP account type.
    const items = expandedItem.content.items.filter((s) => !s.mpOnly || state.accountType === 'MP');
    const explicitChildKey = state.path[0] === expandedItem.key ? state.path[1] : null;
    html += `<ul class="nav-sublist">${items
      .map(
        (s) =>
          `<li><a href="#" data-path-key="1:${s.key}" class="${s.key === explicitChildKey ? 'is-active' : ''}">${s.label}</a></li>`
      )
      .join('')}</ul>`;
  }

  if (data.ugc) {
    html += `<ul class="nav-list">${data.ugc.map((u) => `<li class="nav-list-item"><a href="#">${u}</a></li>`).join('')}</ul>`;
  }

  panelEl.innerHTML = html;

  panelEl.querySelectorAll('[data-item-key]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const key = el.dataset.itemKey;
      const item = contentItems.find((i) => i.key === key);
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

// Two-phase, no mid-recursion DOM access: (1) walk the tree purely in data
// to build one HTML string plus a breadcrumb trail; (2) write it once; (3)
// wire every interactive element. This replaced an id-based recursive
// version that broke on nested tab levels (duplicate ids resolve to the
// wrong element) — never reintroduce per-level DOM lookups here.
function renderCanvas(data) {
  const contentItems = data.items.filter((i) => i.key);
  const selectedItem = contentItems.length ? resolveSelected(contentItems, 0) : null;

  if (!selectedItem?.content) {
    canvasEl.innerHTML = '';
    return;
  }

  const { trail, bodyHtml } = buildCanvasBody(selectedItem, 0, []);
  canvasEl.innerHTML = breadcrumbHtml(trail) + bodyHtml;
  wirePathLinks();
  wireBreadcrumb();
}

// Recursively descend into `node.content`, walking the selected path from
// `depth`. Returns { trail, bodyHtml } — trail accumulates a breadcrumb
// entry for every node worth one (tabs roots, properties/systems roots);
// bodyHtml is the fully nested markup for everything below this node.
function buildCanvasBody(node, depth, trail) {
  const content = node.content;

  if (content.type === 'tabs') {
    const selectedTab = resolveSelected(content.tabs, depth + 1);
    const newTrail = trail.concat({ label: node.label, depth });
    const tabStrip =
      `<div class="tab-strip">` +
      content.tabs
        .map((t) => `<button class="tab${t === selectedTab ? ' is-active' : ''}" data-path-key="${depth + 1}:${t.key}">${t.label}</button>`)
        .join('') +
      `</div>`;
    const inner = selectedTab?.content ? buildCanvasBody(selectedTab, depth + 1, newTrail) : { trail: newTrail, bodyHtml: '' };
    return { trail: inner.trail, bodyHtml: tabStrip + `<div class="sketch">${inner.bodyHtml}</div>` };
  }

  if (content.type === 'list') {
    // Opening a folder-style list reveals its children in the panel but does
    // NOT navigate the canvas — only an explicit click on a specific child
    // does. So no default/active fallback here, unlike every other content
    // type: no explicit path entry at this depth means "nothing selected yet".
    const explicitKey = state.path[depth + 1];
    const selectedChild = explicitKey ? content.items.find((n) => n.key === explicitKey) : null;
    if (selectedChild?.content) return buildCanvasBody(selectedChild, depth + 1, trail);
    return { trail, bodyHtml: '' };
  }

  if (content.type === 'properties') {
    const propKey = state.path[depth + 1];
    const newTrail = trail.concat({ label: node.label, depth });
    if (propKey) {
      const inner = buildCanvasBody(PROPERTY_NODE, depth + 1, newTrail.concat({ label: propKey, depth: depth + 1 }));
      return inner;
    }
    return { trail: newTrail, bodyHtml: renderPropertyPicker(content.names, depth + 1) };
  }

  if (content.type === 'systems') {
    const systems = getSystemsForCurrentProperty();
    const newTrail = trail.concat({ label: node.label, depth });
    if (systems.length <= 1) {
      return { trail: newTrail, bodyHtml: renderSectionsSketch(content.sections) };
    }
    const systemKey = state.path[depth + 1];
    if (systemKey) {
      return { trail: newTrail.concat({ label: systemKey, depth: depth + 1 }), bodyHtml: renderSectionsSketch(content.sections) };
    }
    return { trail: newTrail, bodyHtml: renderPropertyPicker(systems, depth + 1) };
  }

  // content.type === 'sketch'
  return { trail, bodyHtml: renderSketch(content) };
}

function renderPropertyPicker(names, depth) {
  return `<ul class="property-list">${names
    .map((name) => `<li><a href="#" data-path-key="${depth}:${name}">${name}</a></li>`)
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
          : `<a href="#" data-crumb-depth="${t.depth}">${t.label}</a>`;
        return i === 0 ? piece : `<span class="breadcrumb__sep">/</span>${piece}`;
      })
      .join('') +
    `</div>`
  );
}

function wireBreadcrumb() {
  canvasEl.querySelectorAll('[data-crumb-depth]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      collapse(Number(el.dataset.crumbDepth) + 1);
      render();
    });
  });
}

// ---------------------------------------------------------------------------
// Sketches — light structural wireframe blocks. No field-level labels or
// real copy; card titles are real (confirmed from production screenshots).

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
  return '';
}

// ---------------------------------------------------------------------------

function render() {
  renderRail();
  // LH/MP have no content defined yet — render an honest empty state rather
  // than guessing at their nav (no placeholders).
  const data = CONTENT[state.accountType]?.[state.propertyCount]?.[state.section];
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
