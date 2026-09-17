import {
  getRailItems,
  getContent,
  DEFAULT_SYSTEMS,
  MULTIPLE_SYSTEMS,
  SCOPE_PROPERTIES,
  SCOPE_BRANDS,
  SCOPE_CLUSTERS,
  ALL_DISTRIBUTION_CHANNELS,
  PRODUCT_KEYS,
} from './nav-data.js';
import { RAIL_ICONS, BRAND_MARKS } from './icons.js';

// ---------------------------------------------------------------------------
// German label lookup — used ONLY to stress-test the layout against longer
// real-world strings (German UI copy tends to run noticeably longer than
// English), NOT a real i18n feature: no pluralization/interpolation/locale
// logic, just a flat swap of nav labels via `tr()` below. Deliberately does
// NOT cover the prototype debug panel's own labels (Account type, Language,
// etc.) — that panel is tooling, not part of the design being tested, so it
// stays English-only regardless of this toggle. Covers every `label` value
// in nav-data.js as of this writing; a label with no entry here just passes
// through unchanged (harmless, not an error) if a new one is added later.
const DE_LABELS = {
  'AI assistant': 'KI-Assistent',
  'My account': 'Mein Konto',
  'Add channel': 'Kanal hinzufügen',
  '6 sections complete': '6 Abschnitte vollständig',
  '4 room types': '4 Zimmertypen',
  '7 photos uploaded': '7 Fotos hochgeladen',
  '5 channels connected, 2 awaiting setup': '5 Kanäle verbunden, 2 Einrichtungen ausstehend',
  '0 systems connected': '0 Systeme verbunden',
  'users': 'Benutzer',
  'Back': 'Zurück',
  'Next': 'Weiter',
  'Done': 'Fertig',
  'Choose channel': 'Kanal auswählen',
  'Choose a channel to add': 'Kanal zum Hinzufügen auswählen',
  'Configure mapping': 'Zuordnung konfigurieren',
  'SM rate': 'SM-Rate',
  'Channel': 'Kanal',
  'rate': 'Rate',
  'Rates to publish': 'Zu veröffentlichende Raten',
  'Performance': 'Leistung',
  'Adoption': 'Akzeptanz',
  'About page': 'Info-Seite',
  'Accepted payments': 'Akzeptierte Zahlungsarten',
  'Manage products': 'Produkte verwalten',
  'API': 'API',
  'Automated payments': 'Automatisierte Zahlungen',
  'Booking rules': 'Buchungsregeln',
  'Branding': 'Markengestaltung',
  'Brands': 'Marken',
  'Calendar': 'Kalender',
  'Channel comparison': 'Kanalvergleich',
  'Channels': 'Kanäle',
  'Channels Plus': 'Channels Plus',
  'Charts': 'Diagramme',
  'Clusters': 'Cluster',
  'Communication': 'Kommunikation',
  'Configuration': 'Konfiguration',
  'Contact page': 'Kontaktseite',
  'Dashboard': 'Übersicht',
  'Dashboards': 'Übersichten',
  'Direct Booking': 'Direktbuchung',
  'Distribution': 'Vertrieb',
  'Dynamic pricing': 'Dynamische Preisgestaltung',
  'Email settings': 'E-Mail-Einstellungen',
  'Extras': 'Zusatzleistungen',
  'Front desk': 'Rezeption',
  'General information': 'Allgemeine Informationen',
  'Group landing page': 'Gruppen-Landingpage',
  'Guest communications': 'Gästekommunikation',
  'Guest details': 'Gästedetails',
  'Health check': 'Zustandsprüfung',
  'History': 'Verlauf',
  'Insights': 'Einblicke',
  'Integrated systems': 'Integrierte Systeme',
  'Inventory': 'Bestand',
  'Invoices': 'Rechnungen',
  'Logout': 'Abmelden',
  'Media library': 'Medienbibliothek',
  'Metasearch': 'Metasuche',
  'My insights': 'Meine Einblicke',
  'New chat': 'Neuer Chat',
  'Notification': 'Benachrichtigung',
  'Notifications': 'Benachrichtigungen',
  'Operations': 'Betrieb',
  'Overview': 'Übersicht',
  'Pay': 'Zahlungsabwicklung',
  'Payment requests': 'Zahlungsanforderungen',
  'Payments': 'Zahlungen',
  'Payouts': 'Auszahlungen',
  'Policies': 'Richtlinien',
  'Policies page': 'Richtlinienseite',
  'Portfolio health': 'Portfolio-Zustand',
  'Preferences': 'Einstellungen',
  'Products': 'Produkte',
  'Profile': 'Profil',
  'Promotions': 'Aktionen',
  'Properties': 'Unterkünfte',
  'Property': 'Unterkunft',
  'Property details': 'Unterkunftsdetails',
  'Property settings': 'Unterkunftseinstellungen',
  'Rate plan': 'Ratenplan',
  'Rate plans': 'Ratenpläne',
  'Recommendations': 'Empfehlungen',
  'Reservations': 'Reservierungen',
  'Room types': 'Zimmertypen',
  'Rooms': 'Zimmer',
  'Security': 'Sicherheit',
  'Selling tools': 'Verkaufstools',
  'Service charges': 'Servicegebühren',
  'Services': 'Leistungen',
  'Setup': 'Einrichtung',
  'Support code': 'Support-Code',
  'Taxes': 'Steuern',
  'Transactions': 'Transaktionen',
  'Translations': 'Übersetzungen',
  'User': 'Benutzer',
  'User details': 'Benutzerdetails',
  'Users': 'Benutzer',
  'Virtual terminal': 'Virtuelles Terminal',
  'Website': 'Webseite',
  'Weekly performance': 'Wöchentliche Leistung',
  'Yield rule': 'Ertragsregel',
  'Yield rules': 'Ertragsregeln',
};

function tr(label) {
  if (state.language !== 'DE') return label;
  return DE_LABELS[label] || label;
}

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

// Prototype-settings persistence (debug panel only — NOT navigation state).
// Remembers accountType/propertyCount/multipleSystems/language across a
// reload via localStorage, so re-opening the prototype doesn't lose
// whatever combination you were testing against. Deliberately narrow: only
// the debug-panel toggles are persisted — section/path/scope/expandedKey/
// wizard are real navigation/session state and should always start fresh
// (a reload should land on the default route, just with the same settings
// applied, not resume mid-navigation). Wrapped in try/catch since
// localStorage can throw (private browsing, storage disabled) — falls
// back to the hardcoded defaults below rather than breaking the load.
const PROTOTYPE_SETTINGS_KEY = 'platform-ia-disco:prototype-settings';

function loadPrototypeSettings() {
  try {
    const raw = localStorage.getItem(PROTOTYPE_SETTINGS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function savePrototypeSettings() {
  try {
    localStorage.setItem(
      PROTOTYPE_SETTINGS_KEY,
      JSON.stringify({
        accountType: state.accountType,
        propertyCount: state.propertyCount,
        multipleSystems: state.multipleSystems,
        language: state.language,
        enabledProducts: state.enabledProducts,
        tier: state.tier,
        hasDrPlus: state.hasDrPlus,
        hasMultiProperty: state.hasMultiProperty,
        isAdmin: state.isAdmin,
      })
    );
  } catch {
    // Storage unavailable — settings just won't persist this session, not
    // a functional break.
  }
}

const savedPrototypeSettings = loadPrototypeSettings();

// The 3 node keys that seed state.attention — exactly the items that used
// to carry nav-data.js's static `badge: true` flag (Health check,
// Recommendations, Dynamic pricing). Kept as one list so main.js is the
// single source of truth for "what's currently illustrating a live issue,"
// not scattered flags on the tree data itself.
const ATTENTION_KEYS = ['health-check', 'recommendations', 'dynamic-pricing', 'room-types'];

const state = {
  accountType: savedPrototypeSettings.accountType ?? 'SM', // 'SM' | 'LH' — independent of propertyCount; only SM has real content so far. MP used to be a 3rd value here — now `hasMultiProperty` below, an add-on like the others (Robert: "lets make Multi-Property an add on like the others").
  propertyCount: savedPrototypeSettings.propertyCount ?? 'single', // 'single' | 'multiple' — independent of accountType
  section: 'insights',
  path: [], // e.g. ['property-settings', 'services'] or ['direct-booking', 'setup', 'contact-page']
  expandedKey: null, // which top-level 'list'-type item is expanded in the panel (UI-only)
  multipleSystems: savedPrototypeSettings.multipleSystems ?? false, // hidden-settings toggle: does every property have >1 connected system?
  // Real SiteMinder packaging (v3 — Robert: "the current bubling is
  // SiteMinder which is channel manager etc .. then SiteMinder Plus which
  // brings in DB, then the rest is add-ons," refined through several
  // corrections, confirmed against siteminder.com/pricing and Sam's own
  // real-world knowledge of Demand+/Metasearch's actual activation):
  //
  //   - Tier: base SiteMinder vs. SiteMinder Plus. Plus additionally
  //     unlocks Direct Booking — the ONLY thing tier gates now (Metasearch
  //     moved out of tier-gating once Robert flagged uncertainty about how
  //     it's really activated).
  //   - "In-product sign-ups" (PRODUCT_KEYS): Channels Plus, Pay,
  //     Metasearch — independently toggleable regardless of tier, kept as
  //     ONE combined list rather than split further by payment model
  //     (commission vs. subscription) or activation method (self-serve vs.
  //     sales-mediated) — a real further distinction surfaced by research
  //     (DR+ needs sales contact, the other 3 are self-serve/automatic per
  //     siteminder.com) but deliberately deferred: "keep it simpler .. just
  //     one combined list for now."
  //   - DR+ (hasDrPlus): a genuinely separate standalone add-on
  //     subscription, independent of tier and of the 3 sign-ups above.
  //
  // Each of these DOES gate Configuration's tree now (getContent's
  // hasDirectBooking/enabledProducts/hasDrPlus params) — when inactive, the
  // product gets NO Configuration item at all, appearing on "Add products"
  // instead (v3 principle: don't bloat the IA with upsell stubs for unowned
  // products — Robert: "not to bloat the ia with upsells").
  enabledProducts: savedPrototypeSettings.enabledProducts ?? [...PRODUCT_KEYS],
  tier: savedPrototypeSettings.tier ?? 'siteminder-plus', // 'siteminder' | 'siteminder-plus'
  hasDrPlus: savedPrototypeSettings.hasDrPlus ?? true,
  // Multi-Property (v3) — was accountType === 'MP', a 3rd mutually-exclusive
  // account type; now a genuine add-on toggle, same treatment as DR+
  // (Robert: "lets make Multi-Property an add on like the others"). Gates
  // Brands/Clusters, Group rate plans, and Direct Booking's API/Group
  // landing page items — everything that used to check accountType ===
  // 'MP' directly now checks this instead. Defaults to false (Multi-
  // Property is the one product NOT on by default, unlike the others —
  // it's the more unusual case, an SM/LH account with a portfolio) so a
  // fresh load doesn't show Brands/Clusters/Group rate plans unprompted.
  hasMultiProperty: savedPrototypeSettings.hasMultiProperty ?? false,
  // User role (v3, Robert: "let's tackle the user type next - let's add
  // admin and non-admin to the proto settings") — the first real work
  // against the "Permissions and visible function" open problem (role-based
  // access within an account, e.g. admin vs. property-level user), which is
  // orthogonal to product entitlement (what's unlocked by tier/add-ons,
  // already handled by Manage products) — see the Confluence open-problems
  // register. Defaults to true (admin) so existing behavior is unchanged
  // unless a prototype tester deliberately switches to non-admin. First
  // surface: Manage products shows a banner and disables Activate (Learn
  // more stays clickable) for non-admin — Robert: "for non-admin they would
  // see everything but not be able to click activate." Deliberately NOT
  // extended to the Users page yet — flagged as its own open question
  // ("not sure if we show that page at all, or show it with disabled
  // options .. i guess that's a permissions visibility decision").
  isAdmin: savedPrototypeSettings.isAdmin ?? true,
  // Prototype-panel toggle: 'EN' | 'DE'. Swaps nav labels via `tr()` (see its
  // definition near the top of this file, alongside DE_LABELS) — a LAYOUT
  // stress test, not real i18n: no pluralization/interpolation, and the
  // prototype panel's own labels are deliberately excluded (that panel is
  // tooling, not part of the design being tested). Purpose is checking
  // whether rail tooltips, panel list items, tabs, breadcrumbs, tile titles,
  // etc. accommodate German's typically longer strings without breaking.
  language: savedPrototypeSettings.language ?? 'EN',
  // EXPLORATORY — property/cluster/brand scope switcher sketch (Insights,
  // Health check once built). See CHANGE-QUEUE.md "Foundational, unsolved"
  // section: this whole mechanism is still being worked through, expected
  // to change once Distribution's (unsolved) shape informs it. Deliberately
  // SEPARATE from `path` — this scopes a section's whole view, it isn't a
  // navigation destination the way Configuration/Distribution's Properties
  // picker is.
  scope: { type: 'all', key: null }, // { type: 'all' | 'property' | 'cluster' | 'brand', key: string | null }
  // Which `state.path` INDEX currently holds a property name that
  // `state.scope` is tracking — set alongside `state.scope` whenever a
  // `syncsScope` pick is made (wirePathLinks), `null` otherwise. Lets the
  // scope switcher's OWN change handler (wireScopeSwitcher) tell whether
  // it's currently sitting a level or more INSIDE that same property
  // (e.g. on "Room types," not just the property's own tiles page) — if
  // so, switching properties from there should follow you to the SAME
  // sub-page on the newly-picked property, not leave you looking at the
  // old property's content under a new scope value (Robert: "switching
  // property when i am a level down in properties should switch the
  // property"). `null` whenever scope changes via any OTHER route (the
  // switcher itself, a non-property scope) — only a genuine property
  // drill-down sets this, so it can't misfire for pages that merely
  // happen to be scoped to a property without being INSIDE one.
  scopedPathDepth: null,
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
  // LIVE "something needs attention" tracking (replaces the old static
  // `badge: true` flag in nav-data.js — Robert: "lets look at badging and
  // somewhat bring it to life - the badge should bubble up the hierarchy
  // and disappear when the user clicks into something"). A Set of node
  // keys that currently have an unresolved issue; ATTENTION_KEYS below
  // seeds it with the same 3 items that used to carry the static dot
  // (Health check/Recommendations/Dynamic pricing) — same illustrative
  // "no real count/data" nature as before, just genuinely stateful now.
  // Deliberately NOT persisted via savedPrototypeSettings — this exists to
  // demonstrate the clear-on-visit interaction, so every fresh load should
  // start with something to clear, not resume already-cleared from a prior
  // session.
  attention: new Set(ATTENTION_KEYS),
};

// Does NOT touch state.scope — the property/cluster/brand switcher is a
// GLOBAL, user-owned value ("we can't switch the scope as people move
// around - they need to own that"), completely independent of navigation.
// It used to reset to 'all' here unconditionally on every section switch
// (Configuration -> Distribution, etc.), which silently discarded a scope
// the user had just deliberately set — directly contradicting that same
// principle already applied everywhere else (the force-single conflict
// prompt, the proxy-click-on-a-property mechanism). Caught live: setting
// scope to a specific property via a property page's own switcher, then
// switching rail sections, silently reset back to "All properties."
function resetPath() {
  state.path = [];
  state.expandedKey = null;
}

const railEl = document.getElementById('rail');
const railBrandEl = document.getElementById('railBrand');
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

// ---------------------------------------------------------------------------
// Live badge bubbling (Robert: "the badge should bubble up the hierarchy and
// disappear when the user clicks into something"). Deliberately narrow —
// exactly 3 illustrative stories exist (ATTENTION_KEYS): Insights >
// Recommendations, Distribution > Health check + Dynamic pricing (both flat
// L2 panel items — no nesting to bubble through at all), and Configuration
// > Room types, which has TWO shapes depending on account state: the flat
// single-property case (Property, a 'nav-dashboard' tile grid directly),
// and the deeper Multi-Property case (Properties > a property card >
// buildPropertyNode's own 'nav-dashboard') — Robert: "you need to bubble up
// room types badge" once he hit the Multi-Property/Properties-tab shape.
//
// `itemHasAttention` descends into 'list' (sublist children), 'nav-
// dashboard' (tile grid), and 'records' — but ONLY when the records
// content is explicitly marked `bubblesAttention: true` (see
// buildConfigurationPropertiesItem's `properties-list` in nav-data.js).
// This is an OPT-IN flag, not "any records picker with a detailNode
// bubbles" — that more general rule was tried first and immediately caused
// a worse bug than the one it fixed: buildPropertyNode(...) is reused as
// the shared detailNode by THREE different records pickers (Configuration's
// own Properties list, Group rate plans' "Properties" tab, and a user's
// cross-nav "Properties" tab) — walking all of them generically bubbled
// Room types' badge onto Group rate plans too, with no visible reason why
// (Robert: "not sure why there is a badge against group rate plans"). Only
// the ONE deliberate story (Configuration > Properties) opts in; the other
// two reuses of the same node do not carry the badge, on purpose — for a
// wireframe whose whole job is "get the idea across" with a small,
// deliberate set of stories (Robert: "let's not have too many anyway for
// this"), explicit > general here.
//
// `visited` guards the one real CYCLE this graph contains (buildPropertyNode
// <-> buildUserNode, via each one's own cross-nav Properties/Users tile) —
// without it, descending into a `bubblesAttention` records picker whose
// detailNode eventually loops back on itself would recurse forever
// (previously hit as a live "Maximum call stack size exceeded" crash).
// Rail-level aggregation (sectionHasAttention) is the same idea one level
// further out: a rail section badges if ANY of its panel items (by this
// same rule) do.
function itemHasAttention(item, visited = new Set()) {
  if (visited.has(item.key)) return false;
  visited.add(item.key);
  if (state.attention.has(item.key)) return true;
  const content = item.content;
  if (content?.type === 'list') {
    return content.items.some((child) => itemHasAttention(child, visited));
  }
  if (content?.type === 'nav-dashboard') {
    return content.tiles.some((tile) => itemHasAttention(tile, visited));
  }
  // 'tabs' (e.g. Configuration > Properties' own Properties/Brands/Clusters
  // strip) — a plain pass-through, needed so a `bubblesAttention` records
  // tab nested one level inside a tabs wrapper (properties-list, below)
  // is even reachable at all. Safe to leave unconditional (unlike the old
  // records branch) — a tab is only ever a small, fixed, hand-authored
  // array on ONE specific item, not a general graph edge, so this can't
  // reintroduce the Group-rate-plans-style fan-out.
  if (content?.type === 'tabs') {
    return content.tabs.some((tab) => itemHasAttention(tab, visited));
  }
  if (content?.type === 'records' && content.bubblesAttention && content.detailNode) {
    const detail = typeof content.detailNode === 'function' ? content.detailNode() : content.detailNode;
    return Boolean(detail) && itemHasAttention(detail, visited);
  }
  return false;
}

function sectionHasAttention(sectionData) {
  if (!sectionData?.items) return false;
  return sectionData.items.some((item) => !item.heading && !item.divider && itemHasAttention(item));
}

// Clears one key's attention. ONLY called from an explicit click handler
// (data-item-key / data-path-key), never from the default/fallback
// resolution renderPanel uses to pick what shows on first load — landing on
// Insights by default doesn't "proxy click" every item that happens to
// render first; Recommendations only clears once someone actually clicks
// it. Same explicit-vs-fallback distinction the breadcrumb trail already
// makes (resolveChain's `isExplicit`). Removing the leaf key is enough:
// parent/rail badges are recomputed fresh from state.attention on every
// render (itemHasAttention/sectionHasAttention above), so bubbling up and
// clearing are really the same derived computation, not two things to keep
// in sync.
function clearAttention(key) {
  state.attention.delete(key);
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
      const tabs = content.tabs.filter((t) => !t.mpOnly || state.hasMultiProperty);
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
      // `detailNode` thunks can optionally take the selected name as an
      // argument (v3, Manage products — each product needs genuinely
      // different detail content, unlike every prior `records` caller
      // where one shared node covers every name). Every existing zero-arg
      // thunk (buildPropertyNode/buildUserNode etc.) simply ignores the
      // extra argument — safe, additive, not a breaking change to the
      // established `Node | (() => Node)` contract.
      node = typeof content.detailNode === 'function' ? content.detailNode(explicitKey) : content.detailNode;
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

function renderRail(content) {
  const brandKey = state.accountType === 'LH' ? 'LH' : 'SM';
  railBrandEl.innerHTML = BRAND_MARKS[brandKey];
  railBrandEl.title = PRODUCT_TIER_LABELS[state.accountType];
  const items = getRailItems(state.accountType);
  railEl.innerHTML = items.map((item) => {
    // Rail-level bubbling (Robert: "see how we have badges on dynamic
    // pricing and health check - therefore there should be one on the
    // distribution rail item") — a section badges if ANY of its own panel
    // items do, by the same itemHasAttention rule the L2 panel uses.
    const badge = sectionHasAttention(content?.[item.key])
      ? `<span class="rail-item__badge" aria-hidden="true"></span>`
      : '';
    return `
      <button class="rail-item${item.key === state.section ? ' is-active' : ''}" data-section="${item.key}" title="${tr(item.label)}" aria-label="${tr(item.label)}">
        <span class="rail-item__icon">${RAIL_ICONS[item.icon] ?? ''}</span>
        ${badge}
      </button>
    `;
  }).join('');

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

// Property scope switcher (Confluence "IA node tree v2" — Property scope
// column). PER-ITEM now, not section-level (see nav-data.js's
// `scopeSwitcher` on each item) — two modes:
//   - 'multi-select': every option enabled, as before.
//   - 'force-single': the item can't be scoped to All/Brand/Cluster (e.g.
//     Inventory, Dynamic pricing — a per-property grid/calendar with no
//     meaningful all-properties view). Those options render as disabled
//     <option>s (greyed, unselectable) rather than disappearing — the
//     switcher's shape stays the same everywhere, only availability
//     changes, so it doesn't look like a different control depending on
//     what page you're on. See wireScopeSwitcher for the fallback when
//     state.scope is already 'all'/'brand'/'cluster' on arrival.
// Renders a single <select> — simplest possible sketch, not a final
// interaction design. Options: All properties, then every individual
// property, then (MP only) Brands and Clusters as scoping groups.
//
// `force-all` (Brands/Clusters): these ARE all-properties concepts by
// definition — a brand or cluster spans multiple properties, so there's
// no meaningful single-property or brand/cluster-of-a-brand scoping for
// this page. Visible (not hidden — Robert: "visible, locked to all,
// disabled", same slot as every other page) but the whole <select> is
// disabled and always shows "All properties" selected, REGARDLESS of the
// actual global state.scope — this page doesn't participate in the
// shared scope at all, it just always operates at the All level.
function renderScopeSwitcher(mode) {
  const forceSingle = mode === 'force-single';
  const forceAll = mode === 'force-all';
  const groups = [];
  groups.push(
    `<option value="all:" ${state.scope.type === 'all' || forceAll ? 'selected' : ''} ${forceSingle ? 'disabled' : ''}>All properties</option>`
  );
  groups.push(
    `<optgroup label="Properties">${SCOPE_PROPERTIES.map(
      (name) => `<option value="property:${name}" ${!forceAll && state.scope.type === 'property' && state.scope.key === name ? 'selected' : ''}>${name}</option>`
    ).join('')}</optgroup>`
  );
  if (state.hasMultiProperty) {
    groups.push(
      `<optgroup label="Brands">${SCOPE_BRANDS.map(
        (name) =>
          `<option value="brand:${name}" ${!forceAll && state.scope.type === 'brand' && state.scope.key === name ? 'selected' : ''} ${forceSingle ? 'disabled' : ''}>${name}</option>`
      ).join('')}</optgroup>`
    );
    groups.push(
      `<optgroup label="Clusters">${SCOPE_CLUSTERS.map(
        (name) =>
          `<option value="cluster:${name}" ${!forceAll && state.scope.type === 'cluster' && state.scope.key === name ? 'selected' : ''} ${forceSingle ? 'disabled' : ''}>${name}</option>`
      ).join('')}</optgroup>`
    );
  }
  return `
    <div class="scope-switcher-control ${forceSingle ? 'is-force-single' : ''} ${forceAll ? 'is-force-all' : ''}">
      <select class="scope-switcher" aria-label="Property scope" ${forceAll ? 'disabled' : ''}>${groups.join('')}</select>
    </div>
  `;
}

// Whether the CURRENT global scope conflicts with a 'force-single' item
// (Inventory, Dynamic pricing) — true whenever scope is 'all'/'brand'/
// 'cluster'. Deliberately read-only: state.scope is never silently
// mutated by navigation. "we can't switch the scope as people move
// around — they need to own that" (user's correction after an earlier
// version auto-fell-back to the first property on arrival, which
// overrode a choice the user made elsewhere without asking). The ONLY
// way state.scope changes is the user's own explicit action on the
// <select> — including resolving the prompt this renders instead of the
// page (see renderForceSinglePrompt) — never as a side effect of
// navigating to a different item.
function scopeConflictsWithMode(mode) {
  return mode === 'force-single' && state.scope.type !== 'property';
}

// Blocking "select a property to continue" state — shown INSTEAD OF the
// item's own canvas content whenever scopeConflictsWithMode is true. Reuses
// the same <select> as the header switcher (same options, same disabled
// All/Brand/Cluster per force-single) so there's only one control to keep
// in sync, not two competing pickers. Confirmed direction: prompt, don't
// guess — the earlier silent-fallback version is exactly what this
// replaces.
function renderForceSinglePrompt(mode) {
  return `
    <div class="force-single-prompt">
      <p class="force-single-prompt__text">This page shows one property at a time. Select a property to continue.</p>
      <div class="force-single-prompt__control">${renderScopeSwitcher(mode)}</div>
    </div>
  `;
}

function wireScopeSwitcher() {
  const select = canvasEl.querySelector('.scope-switcher');
  if (!select) return;
  select.addEventListener('change', () => {
    const [type, key] = select.value.split(':');
    // Switching properties while genuinely INSIDE that property's own
    // pages (not just scoped to it — e.g. on "Room types," not the
    // property's top-level tiles) should follow you to the SAME sub-page
    // on the newly-picked property, not strand you looking at the old
    // property's content (Robert: "switching property when i am a level
    // down in properties should switch the property"). `scopedPathDepth`
    // (set by wirePathLinks' proxy-click) names which state.path index
    // holds the property name — if that index still exists (we're at or
    // below it) AND the new scope is also a property (switching to All/
    // Brand/Cluster has no obvious "same sub-page" target), splice just
    // that ONE segment, leaving every deeper segment (which tab/tile
    // you're on) untouched.
    if (type === 'property' && state.scopedPathDepth !== null && state.path.length > state.scopedPathDepth) {
      state.path[state.scopedPathDepth] = key;
    } else {
      state.scopedPathDepth = null;
    }
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
  // PATTERNS.md's folder-vs-heading rule) AND plain-line dividers are
  // invisible to routing entirely: filtered out before resolveSelected
  // ever sees them, so one can never accidentally become "the routed
  // item" via the nodes[0] fallback if it happened to sit first in the
  // array.
  const routableItems = items.filter((i) => !i.heading && !i.divider);
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
      html += `<li class="nav-list-heading">${tr(item.label)}</li>`;
      return;
    }
    if (item.divider) {
      // Plain line, no text — a LIGHTER visual separator than `heading`
      // for a group that doesn't need its own label (Insights: the
      // starred dashboards vs. My dashboards/My widgets/Recommendations
      // below them — Robert: "some kind of visual divide between the
      // dashboards and the last three items," not a labeled section).
      html += `<li class="nav-list-divider" aria-hidden="true"></li>`;
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
    // `badge` — illustrative "something needs attention" dot, now LIVE
    // (state.attention, seeded via ATTENTION_KEYS) rather than a static
    // flag: bubbles up from a sublist child to its folder parent
    // (itemHasAttention) and up again to the rail (sectionHasAttention,
    // renderRail) — Robert: "the badge should bubble up the hierarchy and
    // disappear when the user clicks into something." Clears the moment
    // the user actually routes to the item that owns it — see the
    // data-item-key/data-path-key click handlers below, which call
    // clearAttention before re-rendering.
    const badge = itemHasAttention(item) ? `<span class="nav-list-item__badge" aria-hidden="true"></span>` : '';
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
    const labelGroup = actionIcon ? `<span class="nav-list-item__label-group">${actionIcon}${tr(item.label)}</span>` : tr(item.label);
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
      // `mpOnly` items (e.g. Brands/Clusters) only show when Multi-Property is active.
      const children = item.content.items.filter((s) => !s.mpOnly || state.hasMultiProperty);
      const explicitChildKey = state.path[0] === item.key ? state.path[childPathIndex] : null;
      html += `<ul class="nav-sublist">${children
        .map((s) => {
          const childBadge = state.attention.has(s.key) ? `<span class="nav-list-item__badge" aria-hidden="true"></span>` : '';
          return `<li><a href="#" data-path-key="${childPathIndex}:${s.key}" class="${s.key === explicitChildKey ? 'is-active' : ''}">${tr(s.label)}${childBadge}</a></li>`;
        })
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
        // Expand/collapse only — does not touch the route/canvas. Not a
        // "visit" of the folder itself, so its own badge (if any) does NOT
        // clear here — only actually routing to something clears a badge.
        state.expandedKey = state.expandedKey === key ? null : key;
      } else {
        // Real navigation — this IS a visit, clear its badge if it had one.
        select(0, key);
        state.expandedKey = null;
        clearAttention(key);
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
      clearAttention(key);
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

  if (!rootItem?.content) {
    // Force-single conflict check needed HERE too, not just in the main
    // path below — a content-less stub (Channels Plus, Metasearch) with
    // `scopeSwitcher: 'force-single'` was silently skipping the conflict
    // prompt entirely: this branch returns before `chain` is ever built,
    // so the check further down (which needs `chain`) never ran. Caught
    // live: visiting either stub at "All properties" scope just showed an
    // empty page with a switcher that LOOKED enabled, instead of the same
    // "select a property to continue" prompt every other force-single
    // page shows.
    if (rootItem?.scopeSwitcher && state.propertyCount === 'multiple' && scopeConflictsWithMode(rootItem.scopeSwitcher)) {
      canvasEl.innerHTML = renderForceSinglePrompt(rootItem.scopeSwitcher);
      wireScopeSwitcher();
      return;
    }
    canvasEl.innerHTML = renderCanvasHeader(rootItem?.label, null, rootItem?.scopeSwitcher);
    wireScopeSwitcher();
    return;
  }

  const chain = resolveChain(rootItem);

  // Property scope switcher mode (see renderScopeSwitcher) — PER-ITEM
  // (Confluence "IA node tree v2"), but not just off the top-level routed
  // item anymore: a TAB can carry its own `scopeSwitcher` too (e.g. a
  // user's own "Properties" tab inside buildUserNode needs multi-select
  // even though sibling tabs like "User details" don't need a switcher at
  // all; Brands/Clusters need 'force-all'). Walk the resolved chain from
  // the deepest step backward and use the first `scopeSwitcher` found,
  // falling back to rootItem's own — most items only ever set it at the
  // root level (Inventory, Rate plans, ...), so this changes nothing for
  // them; it only matters for a tabs node whose individual tabs disagree.
  //
  // `resolveChain` NEVER pushes a chain step for the selected tab itself
  // when that tab's own `content` is falsy (`while (node?.content)` exits
  // before the next push) — e.g. Brands/Clusters (content: null). Their
  // `scopeSwitcher` would silently never be seen by the walk above, since
  // it only ever looks at `step.node` for steps that DID get pushed. Look
  // it up directly here: any `tabs`-type step's own `options` array holds
  // the full (filtered) tab objects, so its `selectedKey` can be resolved
  // back to the actual tab even when that tab never became its own step.
  // Caught live: Brands' switcher stayed on the last real global scope
  // instead of locking to "All properties" as force-all requires.
  const selectedTabScopeSwitcher = chain
    .filter((step) => step.content?.type === 'tabs' && step.selectedKey)
    .map((step) => step.options.find((t) => t.key === step.selectedKey)?.scopeSwitcher)
    .findLast((mode) => mode !== undefined);
  const scopeSwitcherMode =
    selectedTabScopeSwitcher ?? chain.reduceRight((found, step) => found ?? step.node?.scopeSwitcher, undefined) ?? rootItem?.scopeSwitcher;

  // Force-single conflict (Inventory, Dynamic pricing) — the user's global
  // scope is 'all'/'brand'/'cluster' but this item can only show one
  // property. BLOCKS the item's own content with an explicit prompt
  // instead of silently picking a property for them — "they need to own
  // that" (user's correction). state.scope is left completely untouched
  // here; it only changes once the user picks an option in the prompt's
  // own <select>, at which point it's the SAME global state.scope every
  // other page reads too (confirmed: one shared scope, not a per-page
  // override).
  if (scopeSwitcherMode && state.propertyCount === 'multiple' && scopeConflictsWithMode(scopeSwitcherMode)) {
    canvasEl.innerHTML = renderForceSinglePrompt(scopeSwitcherMode);
    wireScopeSwitcher();
    return;
  }

  // Records-inbox mode (Notifications): the picker itself already rendered
  // PERMANENTLY in the L2 panel (renderRecordsInboxPanel) — the canvas must
  // NOT also render it. Show an empty "select one" state until a
  // notification is actually picked; once picked, skip straight to the
  // detail node's own content (chain[1]), no breadcrumb — there's nothing
  // to crumb back to, the list never left the panel.
  if (data.customPanel === 'records-inbox') {
    if (!chain[0]?.selectedKey) {
      canvasEl.innerHTML = `${renderCanvasHeader(rootItem.label, null, scopeSwitcherMode)}<div class="sketch"><div class="records-inbox-empty">Select a notification to view it</div></div>`;
      wireScopeSwitcher();
      return;
    }
    const detail = renderChainBody(chain, 1);
    canvasEl.innerHTML = `${renderCanvasHeader(rootItem.label, null, scopeSwitcherMode)}<div class="sketch">${detail.bodyHtml}</div>`;
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
  //
  // Single header row (user: "we want to just take minimal vertical space
  // so maybe h1/crumb/property switcher are that top line") — replaces the
  // old two-row switcherHtml + breadcrumbHtml stack. See
  // renderCanvasHeader's own comment for how the title/breadcrumb share
  // one slot.
  //
  // Non-admin role banner (v3) — rendered HERE, full-width, its own strip
  // between the header and `.sketch`, NOT inside renderProductCards/
  // renderProductDetail's own markup (Robert: "bit messy - do you think we
  // should have a full width banner under the header row?" — the first
  // version was capped to .product-detail's 640px column, reading as one
  // more paragraph of page content rather than a page-level notice, same
  // visual language as the app's other full-bleed header-adjacent bars).
  // `rootItem.key === 'manage-products'` covers BOTH the card grid and any
  // of its product detail pages — resolveChain walks from this same
  // rootItem either way, so one check here covers both without threading a
  // flag through renderProductCards/renderProductDetail individually.
  const roleBanner =
    rootItem.key === 'manage-products' && !state.isAdmin
      ? `<div class="role-banner">${tr('To make changes to your account, please speak to one of your administrators.')}</div>`
      : '';
  canvasEl.innerHTML =
    renderCanvasHeader(rootItem.label, trail, scopeSwitcherMode) + roleBanner + `<div class="sketch">${bodyHtml}</div>`;
  wireScopeSwitcher();
  wirePathLinks();
  wireBreadcrumb();
  wireThemeToggle();
  wireWizardOpenButtons();
  wireProductCards();
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
            .map((t) => `<button class="tab${t.key === selectedKey ? ' is-active' : ''}" data-path-key="${pathIndex}:${t.key}">${tr(t.label)}</button>`)
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
      // `content.presetNames` (optional, e.g. My dashboards): a small
      // "Preset" tag on fixed/immutable rows — see renderRecordPicker's
      // own comment.
      const presetNames = content.presetNames ? new Set(content.presetNames) : null;
      // `content.display: 'table'` (optional, e.g. Rate plans, Yield
      // rules): renders the SAME real, clickable names as a table-styled
      // skeleton instead of a plain list — first column real + clickable,
      // remaining columns skeleton-only, no real headers (same
      // titleless-skeleton convention as everywhere else) UNLESS
      // `content.usageColumn` is set. `content.display: 'cards'`
      // (Configuration > Properties, multi-property scope): each name
      // gets its own repeated name-heading + dashboard-cards block (see
      // renderRecordCards) instead of a row in a list/table. Every other
      // `records` caller (Users, Dashboards, Charts) omits `display` and
      // keeps the plain list — both are additive, not replacements.
      const pickerHtml =
        content.display === 'table'
          ? renderRecordTable(step.options, pathIndex, content.tableColumns ?? 3, content.nameSplitOn, content.usageColumn, content.syncsScope)
          : content.display === 'cards'
            ? renderRecordCards(
                step.options,
                pathIndex,
                content.cards,
                content.syncsScope,
                content.bubblesAttention ? content.detailNode : null
              )
            : content.display === 'product-cards'
              ? renderProductCards(pathIndex, content.tierComparison, content.currentTier, content.products)
              : renderRecordPicker(step.options, pathIndex, starredNames, content.showSnippet, content.syncsScope, presetNames);
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
      // `content.newButtonLabel` (My dashboards/My widgets) — a plain,
      // NON-functional "+ New X" button above the picker (Robert: "you
      // dont need to worry about new that would be a button on the list
      // page" — just the structural affordance, no creation flow wired
      // up). Same visual language as Rate plan → Channels' own "Add
      // channel" button, but deliberately not a data-wizard-open trigger
      // — nothing decided yet about what creating one of these involves.
      const newButtonHtml = content.newButtonLabel
        ? `<button class="records-page__new-btn" type="button"><span aria-hidden="true">+</span>${tr(content.newButtonLabel)}</button>`
        : '';
      return { trail: [], bodyHtml: newButtonHtml + widgetsHtml + pickerHtml };
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
// `syncsScope` (optional, e.g. Properties): the rows here ARE properties,
// so picking one acts as a proxy click on the global scope switcher
// itself, not just a page navigation — see wirePathLinks' own comment.
// Rendered as a `data-syncs-scope` flag on the link so that generic click
// handler can tell which `data-path-key` clicks should also update
// state.scope.
// `presetNames` (optional, e.g. My dashboards): a Set of names that are
// FIXED/immutable rows (the 7 real preset dashboards) as opposed to the
// user's own custom ones — shown with a small "Preset" tag so the two
// are visually distinguishable (Robert: "show a visual in the dashboards
// list to indicate the immutable dashboards versus the user ones").
// Marks the exception (preset), not the default (custom) — a custom row
// gets no tag at all, since "no tag" already reads as "yours, editable."
function renderRecordPicker(names, depth, starredNames, showSnippet, syncsScope, presetNames) {
  return `<ul class="wf-list${showSnippet ? ' wf-list--snippets' : ''}">${names
    .map((name) => {
      const star = starredNames?.has(name) ? `<span class="nav-list-item__star" aria-hidden="true"></span>` : '';
      const presetTag = presetNames?.has(name) ? `<span class="wf-list__preset-tag">Preset</span>` : '';
      const snippet = showSnippet ? `<div class="wf-list__row-snippet-skel"></div>` : '';
      return `
        <li>
          <a href="#" class="wf-list__row" data-path-key="${depth}:${name}" ${syncsScope ? 'data-syncs-scope="true"' : ''}>
            <span class="wf-list__row-title">${name}${star}${presetTag}</span>
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
//
// `nameSplitOn` (Confluence "IA node tree v2" — Rate plans' All-properties
// expansion): when the row's own name contains this separator (e.g.
// " — "), the part after it renders as a second, muted span within the
// SAME clickable link/cell — "Standard Rate" + a quieter "Harbourview
// Hotel" — rather than a separate real column. The full string (with
// separator) is still the row's actual identity/key (data-path-key,
// breadcrumb label) — this only changes how it's DISPLAYED, not what it
// IS, so the shared records key/crumb machinery every other caller relies
// on is untouched. See buildRatePlanNames in nav-data.js for why rows
// expand instead of gaining a column here.
//
// `usageColumn` (Confluence v2 — Yield rules' "how many properties are
// using a rule"): `{ label, get(name) }` — when present, adds ONE real
// (not skeleton) column with a real header, `get(name)` computed per row.
// Unlike Rate plans, Yield rules' row COUNT doesn't change (see
// ratePlanUsageCount's comment) — this is purely an added column on the
// existing rows.
// `nameSplitOn` (Rate plans, multi-property scope): each expanded row's
// name is "{Rate plan} — {Property}" — split here into a REAL "Property"
// column, not an inline name-suffix (was: rendered as a muted suffix on
// the name link itself; changed since that read as a subtitle rather than
// real table structure). `usageColumn` (Yield rules): a separately-passed
// column showing a computed value per row (e.g. a usage count) — the two
// are independent column kinds and either, both, or neither may be
// present depending on the caller.
// Sort-affordance chevron on the Property header (Confluence "IA node
// tree v2" — Rate plans' Property column): visual indicator only, no
// working sort behind it — this prototype stays non-interactive at the
// sketch level everywhere else (e.g. Yield rules' Uses column is real-
// count-only, no interaction), so this reads as "sortable" without being
// wired up.
const SORT_AFFORDANCE_ICON =
  '<svg class="sketch-table__sort-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 9l4-4 4 4M8 15l4 4 4-4"/></svg>';

// Extracted from the `dashboard-cards` sketch branch (renderSketch) so
// `renderRecordCards` below can reuse the exact same card markup for its
// per-record card blocks, without duplicating it.
function renderDashboardCards(cards) {
  return `<div class="sketch-dashboard-cards">${cards
    .map((c) => {
      const title = c.title
        ? `<h3 class="sketch-dashboard-card__title">${tr(c.title)}</h3>`
        : `<div class="sketch-dashboard-card__title-skel"></div>`;
      return `<div class="sketch-dashboard-card">${title}<div class="sketch-dashboard-card__${c.shape === 'stat' ? 'stat' : 'chart'}"></div></div>`;
    })
    .join('')}</div>`;
}

// Home's "Priority actions" widget — real title + real rationale text per
// card (not skeleton), a mix of diagnostic and recommendation items shown
// together for now. `content.items`: [{title, rationale}] — always real
// text, no skeleton variant, since this widget only exists to demonstrate
// the "why now" explanation pattern the CPO doc kept asking for; a
// titleless version would defeat the point. Visually a non-functional
// preview of the same clickable-tile language `nav-dashboard` uses
// (chevron, hover) — `renderSketch` has no path/depth context to wire a
// real destination here, same "shape only" convention as `dashboard-cards`.
// Shared minimal "view all" affordance — a bare chevron, no "View all" text
// (Robert: "view all is going to get repetitive maybe we can have a more
// minimal control") — used identically by Priority actions' own header and
// by renderHome's generic row-heading-bar, so all 3 Home rows read the same
// way instead of stacking 3 near-identical text links down the page.
function renderViewAllChevron(pathKey) {
  return `<a href="#" class="home-view-all-chevron" data-path-key="${pathKey}" aria-label="${tr('View all')}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg></a>`;
}

function renderPriorityActions(items, viewAllKey) {
  const count = items.length;
  // `viewAllKey` (e.g. 'recommendations') routes to a real top-level
  // Insights item via the same `data-path-key` mechanism every other canvas
  // link uses (wirePathLinks calls select(0, key) + render()) — switches
  // the rail's selected item, doesn't just point at an inert "#".
  const viewAllHtml = viewAllKey ? renderViewAllChevron(`0:${viewAllKey}`) : '';
  return `
    <div class="priority-actions">
      <div class="priority-actions__header">
        <span class="priority-actions__heading">${tr('Priority actions')} — ${count} ${tr('actions for review')}</span>
        ${viewAllHtml}
      </div>
      <div class="priority-actions__cards">
        ${items
          .map(
            (item) => `
              <div class="priority-actions__card">
                <div class="priority-actions__card-top">
                  <h3 class="priority-actions__card-title">${tr(item.title)}</h3>
                  <svg class="priority-actions__card-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg>
                </div>
                <p class="priority-actions__card-rationale">${tr(item.rationale)}</p>
              </div>
            `
          )
          .join('')}
      </div>
    </div>
  `;
}

// Wireframe data-viz for Home's metric-group stats (v3, Robert: "lets make
// the homepage data widgets look like wireframe dat-viz ie pie chsrts line
// charts etc .. mix it up" then, on the first pass looking too finished:
// "those mock data widgets are to high fi .. keep it a bit 'fisher price'
// very simple light grey rough wirefcerames of charts" — no per-stat text
// label either, just the chart shape under the card's own title). Replaces
// the old plain grey `.metric-group__stat-skel` bar with a small SVG chart
// shape — still entirely illustrative (no real data/axes/numbers), but
// deliberately CRUDE: a few hand-wobbled points, not a smooth/precise
// chart — a toy sketch of "there's a chart here," not a real rendering.
// Greyscale only (project rule), and noticeably lighter than a normal icon
// (see `.metric-group__stat-chart`'s low opacity) so it reads as rough
// scaffolding, not finished content.
//
// One generator per chart family, cycling DETERMINISTICALLY by index (not
// random) so the same stat always renders the same shape across re-renders
// — "mix it up" means varied across a group's several stats, not flickering
// on every render. `wobble(seed, i)` is the shared "hand-drawn" jitter used
// by every line-based shape.
function wobble(seed, i) {
  return (((seed + i * 31 + 7) % 17) - 8) * 1.6;
}

function renderWireframeBars(seed) {
  const n = 4 + (seed % 2);
  const bars = Array.from({ length: n }, (_, i) => {
    const h = 30 + ((seed + i * 29) % 55) + wobble(seed, i);
    const barW = 100 / n;
    return `<rect x="${i * barW + barW * 0.22}" y="${100 - h}" width="${barW * 0.56}" height="${h}" />`;
  }).join('');
  return `<svg class="metric-group__stat-chart" viewBox="0 0 100 100" preserveAspectRatio="none" fill="currentColor" aria-hidden="true">${bars}</svg>`;
}

function renderWireframeLine(seed) {
  const points = [0, 1, 2, 3, 4].map((i) => `${(i / 4) * 100},${Math.max(10, Math.min(90, 55 + wobble(seed, i)))}`);
  return `
    <svg class="metric-group__stat-chart" viewBox="0 0 100 100" preserveAspectRatio="none" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <polyline points="${points.join(' ')}" />
    </svg>
  `;
}

function renderWireframeArea(seed) {
  const points = [0, 1, 2, 3, 4].map((i) => `${(i / 4) * 100},${Math.max(15, Math.min(85, 50 + wobble(seed, i)))}`);
  const fillPath = `0,100 ${points.join(' ')} 100,100`;
  return `
    <svg class="metric-group__stat-chart" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <polygon points="${fillPath}" fill="currentColor" opacity="0.5" />
      <polyline points="${points.join(' ')}" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  `;
}

// A crude hand-drawn "pie" — one wedge cut from a circle, not a precise
// data-driven donut (no smooth stroke-dasharray arc): a slightly wobbled
// polygon slice, reading as "kid's drawing of a pie chart."
function renderWireframePie(seed) {
  const startAngle = -90 + (seed % 40) - 20;
  const sweep = 90 + (seed % 3) * 40;
  const endAngle = startAngle + sweep;
  const toXY = (deg) => {
    const rad = (deg * Math.PI) / 180;
    return [50 + 42 * Math.cos(rad), 50 + 42 * Math.sin(rad)];
  };
  const [x1, y1] = toXY(startAngle);
  const [x2, y2] = toXY(endAngle);
  const largeArc = sweep > 180 ? 1 : 0;
  return `
    <svg class="metric-group__stat-chart metric-group__stat-chart--pie" viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" stroke-width="3" />
      <path d="M50,50 L${x1.toFixed(1)},${y1.toFixed(1)} A42,42 0 ${largeArc} 1 ${x2.toFixed(1)},${y2.toFixed(1)} Z" fill="currentColor" />
    </svg>
  `;
}

const WIREFRAME_CHART_RENDERERS = [renderWireframeBars, renderWireframeLine, renderWireframeArea, renderWireframePie];

function renderWireframeChart(index) {
  const renderer = WIREFRAME_CHART_RENDERERS[index % WIREFRAME_CHART_RENDERERS.length];
  return renderer(index);
}

// Home's performance row — GROUPED stat cards (Robert: "we have grouping
// of cards"), not one flat row of individual metrics. Each group is a
// small cluster of 2-3 real-labeled stats that cascades into its own
// dedicated performance dashboard on click (the cascading-dashboard-family
// idea from the v3 Confluence page, applied to performance content) —
// Home shows the calm summary, the group's own dashboard carries the
// depth. `content.groups`: [{title, stats: [{label, value}]}] — real
// group titles and stat labels (first-pass grouping, not confirmed:
// Rates & distribution / Occupancy & demand / Channels) — NO per-stat text
// label anymore (Robert: "a top level label for the card but no sub level
// label"), just the group's own card title plus its stats' rough wireframe
// CHART shapes (renderWireframeChart above), stacked in a row. `stat.label`
// still exists on the data (kept for a future real build), just isn't
// rendered here.
// `group.linkTo` (optional): [itemKey, recordName] — jumps straight to a
// SPECIFIC dashboard nested two levels deep (e.g. My dashboards >
// Performance) via wirePathLinks' multi-segment `data-path-key` support,
// imagining each group as a real dedicated sub-dashboard rather than an
// inert card (Robert: "imagine they are dedicated sub-dashboard under my
// dashboards"). Groups without `linkTo` stay non-functional, same "shape
// only" convention as everywhere else not yet wired up.
function renderMetricGroups(groups) {
  let chartIndex = 0;
  return `
    <div class="metric-groups">
      ${groups
        .map((group) => {
          const pathKey = group.linkTo ? `data-path-key="0:${group.linkTo[0]}:${group.linkTo[1]}"` : '';
          return `
            <a href="#" class="metric-group" ${pathKey}>
              <div class="metric-group__header">
                <h3 class="metric-group__title">${tr(group.title)}</h3>
                <svg class="metric-group__chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg>
              </div>
              <div class="metric-group__stats">
                ${group.stats.map(() => renderWireframeChart(chartIndex++)).join('')}
              </div>
            </a>
          `;
        })
        .join('')}
    </div>
  `;
}

// Home's value-tracking row — "Tracking past recommendations performance."
// Shows realized value from ACCEPTED recommendations, not a feature badge —
// the direct answer to the CPO doc's DR+ value-awareness gap ("demonstrate
// DR+ was making them money," not label it a tier). `recent` rows show a
// real title + a real illustrative $ value + a status word (e.g.
// "Confirmed" vs. "Estimated" — mirrors the strategy doc's own distinction
// between causally-proven and directional value, without overclaiming
// accuracy this prototype doesn't have real data for).
function renderValueTracker(summary, recent) {
  return `
    <div class="value-tracker">
      <p class="value-tracker__summary">${tr(summary)}</p>
      <div class="value-tracker__rows">
        ${recent
          .map(
            (row) => `
              <div class="value-tracker__row">
                <span class="value-tracker__row-title">${tr(row.title)}</span>
                <span class="value-tracker__row-value">${tr(row.value)}</span>
                <span class="value-tracker__row-status value-tracker__row-status--${row.status === 'Confirmed' ? 'confirmed' : 'estimated'}">${tr(row.status)}</span>
              </div>
            `
          )
          .join('')}
      </div>
    </div>
  `;
}

// "Manage products" (v3) — a real card per product (value prop + billing
// model), plus the SiteMinder/SiteMinder Plus tier comparison. Each
// INACTIVE card gets two actions (v3, Robert: "lets have both with some vis
// hierarchy .. activate can be stronger"): a strong "Activate" button (same
// live state-flip as before, via `data-toggle-product`) and a plain "Learn
// more" TEXT LINK (real `records` navigation via `data-path-key`, into that
// product's own detail page — see buildProductDetailNode) — button vs. text
// link IS the visual hierarchy, no size/colour trick needed. An ACTIVE
// card just gets "Remove" (unchanged, immediate, no detail/stepper
// needed to deactivate). `pathIndex` makes this a real `records` picker
// now, not a standalone sketch — "Learn more" needs genuine nav depth to
// reach a per-product page, which content.type === 'sketch' can't provide
// (renderSketch has no path/depth context at all, confirmed when this was
// still a sketch).
//
// Role gate (v3, Robert: "let's tackle the user type next .. for non-admin
// they would see everything but not be able to click activate (can still
// click learn more)") — the first real "Permissions and visible function"
// work (role-based access, orthogonal to product entitlement). A non-admin
// sees a banner up top and every state-changing control disabled — Activate
// AND Remove (his framing was "make changes to your account," which covers
// removing a product too, not just adding one) AND the tier-switch buttons
// — while "Learn more" stays a real, clickable link either way (browsing a
// product's own detail page isn't "making a change"). Reads `state.isAdmin`
// directly rather than threading it through another parameter — same
// convention this file already uses for other cross-cutting state
// (itemHasAttention reads `state.attention` the same way).
function renderProductCards(pathIndex, tierComparison, currentTier, products) {
  const isAdmin = state.isAdmin;
  const currentTierIndex = currentTier === 'siteminder-plus' ? 1 : 0;
  // Tier switch lives right in the comparison grid too (v3, Robert: "shall
  // we have activate buttons on the SM / SM+ grid as well") — same
  // `data-toggle-product="direct-booking"` mechanism the Direct Booking
  // card's own button already uses (Direct Booking is the ONLY thing tier
  // gates — see buildSmContentTree's own comment), not a separate toggle.
  // The CURRENT tier's column shows a plain "Current" label; the OTHER
  // column gets a real switch button.
  const tierTable = `
    <div class="product-tier-comparison">
      <table>
        <thead>
          <tr>
            <th></th>
            ${tierComparison.tiers
              .map(
                (t, i) => `
                  <th class="${i === currentTierIndex ? 'is-current-tier' : ''}">
                    <div class="product-tier-comparison__tier-name">${tr(t)}</div>
                    ${
                      i === currentTierIndex
                        ? `<span class="product-tier-comparison__current-label">${tr('Current')}</span>`
                        : i === 1
                          ? // Switching TO SiteMinder Plus is an activation
                            // (real packaging: it's what unlocks Direct
                            // Booking) — same AI setup stepper as the
                            // Direct Booking card's own Activate button,
                            // not an instant flip.
                            `<button type="button" class="product-tier-comparison__switch-btn" data-wizard-open="ai-setup-stepper" data-wizard-context="${tr('Direct Booking')}" data-wizard-toggle-key="direct-booking" ${isAdmin ? '' : 'disabled'}>${tr('Switch to this')}</button>`
                          : // Switching back to base SiteMinder is a
                            // downgrade/removal — instant, same as Remove,
                            // no wizard needed to deactivate.
                            `<button type="button" class="product-tier-comparison__switch-btn" data-toggle-product="direct-booking" ${isAdmin ? '' : 'disabled'}>${tr('Switch to this')}</button>`
                    }
                  </th>
                `
              )
              .join('')}
          </tr>
        </thead>
        <tbody>
          ${tierComparison.rows
            .map(
              (row) => `
                <tr>
                  <td class="product-tier-comparison__feature">${tr(row.feature)}</td>
                  ${row.included.map((inc) => `<td class="product-tier-comparison__check">${inc ? '✓' : '—'}</td>`).join('')}
                </tr>
              `
            )
            .join('')}
        </tbody>
      </table>
    </div>
  `;
  const cards = products
    .map(
      (p) => `
        <div class="product-card ${p.active ? 'is-active' : ''}">
          <div class="product-card__top">
            <h3 class="product-card__name">${tr(p.name)}</h3>
            ${p.active ? `<span class="product-card__owned-badge">${tr('Active')}</span>` : ''}
          </div>
          <p class="product-card__tagline">${tr(p.tagline)}</p>
          <p class="product-card__value-prop">${tr(p.valueProp)}</p>
          <div class="product-card__footer">
            <span class="product-card__billing">${tr(p.billing)}</span>
            <div class="product-card__actions">
              ${
                p.active
                  ? ''
                  : `<a href="#" class="product-card__learn-more" data-path-key="${pathIndex}:${p.name}">${tr('Learn more')}</a>`
              }
              ${
                p.active
                  ? `<button type="button" class="product-card__action product-card__action--remove" data-toggle-product="${p.key}" ${isAdmin ? '' : 'disabled'}>${tr('Remove')}</button>`
                  : `<button type="button" class="product-card__action product-card__action--activate" data-wizard-open="ai-setup-stepper" data-wizard-context="${tr(p.name)}" data-wizard-toggle-key="${p.key}" ${isAdmin ? '' : 'disabled'}>${tr('Activate')}</button>`
              }
            </div>
          </div>
        </div>
      `
    )
    .join('');
  return `
    <div class="manage-products">
      ${tierTable}
      <div class="product-cards">${cards}</div>
    </div>
  `;
}

// Shared by BOTH directions — Remove (instant, wireProductCards below) and
// Activate (via the AI setup stepper's onComplete, WIZARD_DEFINITIONS'
// 'ai-setup-stepper') — so there's one place that knows how each product
// key maps onto real state, not two copies that could drift. Same state
// the debug panel's Tier/DR+ controls read and write
// (state.tier/enabledProducts/hasDrPlus/hasMultiProperty) — this page and
// the debug panel are two views onto one source of truth. `activate: true`
// turns a product ON unconditionally; `activate: false` turns it OFF
// unconditionally — NEITHER toggles, since the caller already knows which
// direction it wants (Activate only ever appears on an inactive card,
// Remove only ever on an active one).
function setProductActive(key, activate) {
  if (key === 'direct-booking') {
    // Direct Booking is the only thing tier gates (see buildSmContentTree's
    // own comment) — flips the WHOLE tier, not a per-product flag. Tier is
    // no longer a debug-panel control at all (v3, Robert: "we can prob
    // remove sm/sm+ from the proto settings now as well" — activation now
    // always flows through Manage products/the AI stepper).
    state.tier = activate ? 'siteminder-plus' : 'siteminder';
  } else if (key === 'dr-plus') {
    state.hasDrPlus = activate;
  } else if (key === 'multi-property') {
    state.hasMultiProperty = activate;
    // Activating Multi-Property force-switches propertyCount to 'multiple'
    // if it isn't already (Robert: "adding it automatically toggles the
    // proto setting to multiple properties if its not already") — a
    // Multi-Property portfolio implies more than one property by
    // definition; this prototype doesn't model the inconsistent
    // combination of hasMultiProperty + single property. Deliberately does
    // NOT revert propertyCount back to 'single' when DEACTIVATING Multi-
    // Property — a portfolio account can shrink to managing it as single-
    // property-equivalent without losing its already-entered multi-
    // property data/context.
    if (state.hasMultiProperty && state.propertyCount !== 'multiple') {
      state.propertyCount = 'multiple';
      syncPropertyCountButtons();
    }
  } else {
    state.enabledProducts = activate ? [...new Set([...state.enabledProducts, key])] : state.enabledProducts.filter((k) => k !== key);
  }
  savePrototypeSettings();
}

function activateProduct(key) {
  setProductActive(key, true);
}

// Remove button (v3) — still an instant, in-place deactivation (Robert:
// "itd be neat if we can add remove products in the ui just to get the
// feel for it, obv without the onboarding") — no stepper needed to
// deactivate, only to activate (see the Activate button's own
// data-wizard-open, wired through wireWizardOpenButtons instead of this
// function entirely).
function wireProductCards() {
  canvasEl.querySelectorAll('[data-toggle-product]').forEach((el) => {
    el.addEventListener('click', () => {
      setProductActive(el.dataset.toggleProduct, false);
      render();
    });
  });
}

// Product detail page (v3) — the "Learn more" destination from a Manage
// products card (see buildProductDetailNode). Expanded/larger version of
// the card's own tagline/value-prop/billing plus a real `benefits` list,
// giving the page genuine substance (Robert: "make them feel substantial
// in that they fill the space but still wireframe") without inventing new
// content categories (no screenshots/FAQ/testimonials). "Set up" opens the
// shared AI-generated dynamic stepper wizard (see WIZARD_DEFINITIONS'
// 'ai-setup-stepper') via data-wizard-open/data-wizard-context — the same
// wizard-overlay mechanism the Rate plan > Add channel flow already uses,
// per Robert's own instinct that this might be "the standard form
// presentation" for a bounded task, not a one-off.
function renderProductDetail(product) {
  // `data-wizard-toggle-key` was missing here (a real, pre-existing bug —
  // Robert: "oh you are right - i thought it was working last time we
  // looked") — without it, wizard.data.toggleKey is undefined on
  // completion, so onComplete's `if (data.toggleKey) activateProduct(...)`
  // silently skips the activation step: the wizard finishes, returns to
  // Manage products, but the product never actually turns on. The card's
  // own Activate button always had this wired correctly; this page's
  // "Set up" (reached via Learn more, or a direct/deep link — Robert: "we
  // might deep link to it") did not.
  //
  // The role banner itself is NOT rendered here — see render()'s own
  // `roleBanner` (Robert: "bit messy - do you think we should have a full
  // width banner under the header row?") — this page's `.product-detail`
  // column is only 640px wide, so a banner rendered inside it read as one
  // more paragraph of content rather than a page-level notice. render()
  // renders it once, full-width, for both this page and the card grid.
  return `
    <div class="product-detail">
      <p class="product-detail__tagline">${tr(product.tagline)}</p>
      <p class="product-detail__value-prop">${tr(product.valueProp)}</p>
      <div class="product-detail__benefits">
        <h3 class="product-detail__section-title">${tr('What you get')}</h3>
        <ul class="product-detail__benefits-list">
          ${product.benefits.map((b) => `<li>${tr(b)}</li>`).join('')}
        </ul>
      </div>
      <div class="product-detail__footer">
        <span class="product-detail__billing">${tr(product.billing)}</span>
        <button type="button" class="product-detail__setup-btn" data-wizard-open="ai-setup-stepper" data-wizard-context="${tr(product.name)}" data-wizard-toggle-key="${product.key}" ${state.isAdmin ? '' : 'disabled'}>
          ${tr('Set up')}
        </button>
      </div>
    </div>
  `;
}

// `display: 'cards'` (Configuration > Properties, multi-property scope) —
// each property gets its own clickable name heading directly on THIS
// page, immediately followed by a small dashboard-cards summary for that
// property, then the next property below it — no separate click-through
// needed to see the summary (the name link still opens the property's
// full detail page, same as every other records picker: "name stays
// clickable"). `cards` is the same shape `topWidgets`/dashboard-cards
// sketches already use ([{title?, shape:'chart'|'stat'}]), repeated
// identically under each property — illustrative, not per-property real
// data.
//
// `attentionDetailNode` (optional — only passed when the caller's content
// has `bubblesAttention: true`, see renderChainBody's `records` branch) —
// Robert: "don't we need a badge against the property?" Without this, the
// "Properties" tab/rail icon lit up but every property card looked
// identical — a user would have no way to tell WHICH property to open.
// Every property shares the SAME detail node object (buildPropertyNode),
// so the check is name-independent: if it has attention, EVERY card shows
// the dot (a real product would obviously check per-property data, not one
// shared illustrative node — this prototype has no such data to check).
function renderRecordCards(names, depth, cards, syncsScope, attentionDetailNode) {
  const badge = attentionDetailNode && itemHasAttention(attentionDetailNode)
    ? `<span class="nav-list-item__badge" aria-hidden="true"></span>`
    : '';
  return names
    .map(
      (name) => `
        <div class="record-cards-group">
          <a href="#" class="record-cards-group__title" data-path-key="${depth}:${name}" ${syncsScope ? 'data-syncs-scope="true"' : ''}>${name}${badge}</a>
          ${renderDashboardCards(cards)}
        </div>
      `
    )
    .join('');
}

function renderRecordTable(names, depth, extraColumns, nameSplitOn, usageColumn, syncsScope) {
  const propertyHeader = nameSplitOn
    ? `<th class="sketch-table__property-header">Property${SORT_AFFORDANCE_ICON}</th>`
    : '';
  const usageHeader = usageColumn ? `<th class="sketch-table__property-header">${usageColumn.label}</th>` : '';
  const headerRow = propertyHeader || usageHeader
    ? `<tr class="sketch-table__header-row"><th></th>${propertyHeader}${usageHeader}${Array(extraColumns).fill('<th></th>').join('')}</tr>`
    : '';
  const rows = names
    .map((name) => {
      const [primary, secondary] = nameSplitOn ? name.split(nameSplitOn) : [name, null];
      const propertyCell = nameSplitOn ? `<td class="sketch-table__property-cell">${secondary}</td>` : '';
      const usageCell = usageColumn ? `<td class="sketch-table__property-cell">${usageColumn.get(name)}</td>` : '';
      return `
        <tr>
          <td><a href="#" class="sketch-table__name-link" data-path-key="${depth}:${name}" ${syncsScope ? 'data-syncs-scope="true"' : ''}>${primary}</a></td>
          ${propertyCell}
          ${usageCell}
          ${Array(extraColumns).fill('<td><div class="sketch-table-cell"></div></td>').join('')}
        </tr>
      `;
    })
    .join('');
  return `<table class="sketch-table">${headerRow}${rows}</table>`;
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
      // `t.stat` is a literal, translatable via `tr()` directly.
      // `t.statCount`/`t.statUnitKey` (e.g. the Users tile's "N users") is
      // for stats with a real interpolated number baked in, where `tr()`'s
      // exact-match lookup can't work on the templated string as a whole —
      // only the unit word gets translated, the count stays as-is either way.
      const statText = t.stat ?? (t.statCount !== undefined ? `${t.statCount} ${tr(t.statUnitKey)}` : null);
      const stat = statText
        ? `<span class="nav-dashboard__tile-stat">${tr(statText)}</span>`
        : `<div class="nav-dashboard__tile-stat-skel"></div>`;
      // `t.tip`'s actual text does NOT render here — three-plus red chips
      // sitting on one dashboard read as alarm, not "optimize" (the user's
      // own call: "might be too much negative noise on the dashboard
      // level"). Just a plain dot next to the title, same visual language
      // as the panel-item badge (.nav-list-item__badge) — "is there
      // something to look at," not what it is. The real explanation moved
      // to a banner on the tile's OWN destination page instead (see
      // renderChainBody's nav-dashboard branch) — click through for detail.
      //
      // The DOT itself is now LIVE (state.attention, same mechanism as the
      // rail/panel badges — Robert: "since we have a badge on room types
      // that should also follow this behaviour") — `t.tip` still supplies
      // the explanatory text (unaffected, always shown once you click
      // through), but whether the dot shows/bubbles/clears is state, not
      // just "does this tile happen to have tip text."
      const tipDot = state.attention.has(t.key) ? `<span class="nav-dashboard__tile-dot" aria-hidden="true"></span>` : '';
      return `
        <a href="#" class="nav-dashboard__tile" data-path-key="${depth}:${routeKey}">
          <div class="nav-dashboard__tile-metric-skel"></div>
          <span class="nav-dashboard__tile-body">
            <span class="nav-dashboard__tile-title">${tr(t.label)}${tipDot}</span>
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
  const titleHtml = content.title ? `<h2 class="nav-dashboard-page__title">${tr(content.title)}</h2>` : '';
  const tileGrid = renderNavDashboard(tiles, depth);
  const extraSections = (content.extraSections ?? [])
    .map(
      (s) => `
        <div class="nav-dashboard-page__section">
          <h3 class="nav-dashboard-page__section-title">${tr(s.title)}</h3>
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
      // Usually just "depth:key" (one segment). Home's Performance/
      // Forecasting "View all" links (v3) need to jump straight to a
      // SPECIFIC record two levels deep (My dashboards > Performance) from
      // a page with no ancestry there at all — so this also accepts extra
      // ":key" segments, applying select() once per depth starting at the
      // given depth (0:my-dashboards:Performance -> select(0,
      // 'my-dashboards') then select(1, 'Performance')). Single-segment
      // links (the overwhelming majority) behave exactly as before.
      const [d, ...keys] = el.dataset.pathKey.split(':');
      const depth = Number(d);
      const key = keys[0];
      // `data-syncs-scope` (Properties, GRP's Properties table) — clicking
      // this record is a PROXY CLICK on the global scope switcher itself,
      // not just a page navigation (Robert: "its like a proxy click on
      // the switcher when clicking property on the page"). Sets the same
      // state.scope the switcher's own <select> change handler sets
      // (wireScopeSwitcher) — one shared mechanism, two entry points. This
      // is what makes buildPropertyNode's own switcher trustworthy/useful
      // once you're on a property's page, instead of stale: by the time
      // that page renders, state.scope already reflects where you are.
      if (el.dataset.syncsScope) {
        state.scope = { type: 'property', key };
        state.scopedPathDepth = depth;
      }
      // Clears attention on whatever any of these keys route to (e.g. a
      // nav-dashboard tile like Room types) — a no-op for keys that were
      // never flagged (most of them; ATTENTION_KEYS is a short illustrative
      // list, not every node), so safe to call unconditionally for every
      // canvas link this generic mechanism handles.
      keys.forEach((k) => clearAttention(k));
      keys.forEach((k, i) => select(depth + i, k));
      render();
    });
  });
}

// Generic entry point for any canvas element that opens a wizard —
// `data-wizard-open="<id>"` maps to a lookup table of wizard DEFINITIONS
// (steps + onComplete), so new wizards register themselves in
// WIZARD_DEFINITIONS below rather than each needing bespoke wiring here.
// `data-wizard-context` (v3, optional) — a starting value seeded into
// wizard.data BEFORE step 1 renders, so ONE shared wizard definition (e.g.
// 'ai-setup-stepper', opened from any product's detail page) can still
// reference which product triggered it, without needing a separate
// WIZARD_DEFINITIONS entry per product.
function wireWizardOpenButtons() {
  canvasEl.querySelectorAll('[data-wizard-open]').forEach((el) => {
    el.addEventListener('click', () => {
      const definition = WIZARD_DEFINITIONS[el.dataset.wizardOpen];
      if (!definition) return;
      // `data-wizard-toggle-key` (v3, Manage products' own "Activate"
      // button — Robert: "activate should go to the stepper setup,
      // currently it just toggles in place") — the product key this
      // specific wizard OPEN should actually activate on completion. Seeded
      // into wizard.data alongside productName so the shared
      // 'ai-setup-stepper' definition's onComplete can read it — the real
      // state-flip now happens on wizard completion, not on the button
      // click itself.
      openWizard(definition, { productName: el.dataset.wizardContext, toggleKey: el.dataset.wizardToggleKey });
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
          <h2 class="wizard-step__title">${tr('Choose a channel to add')}</h2>
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
        // Mapping shape depends on the channel picked in step 1 — "we do
        // actually need to tackle this now" turned into two distinct real
        // shapes rather than one generic stand-in:
        // - Direct Booking has no remote system to reconcile against (it IS
        //   the SM side), so mapping is just "which rates go live" — a
        //   checkbox list, one row per rate.
        // - Every other channel (OTAs + Channels Plus) is a real two-system
        //   reconciliation: SM rate on one side, the remote channel's rate
        //   selection on the other — "2 columns should convey it enough."
        //   One mapping section (not split "room type" + "rate") since a
        //   rate IS a rate plan × room type combination.
        title: 'Configure mapping',
        render: (wizard) =>
          `<h2 class="wizard-step__title">${tr('Configure mapping')}</h2>` +
          (wizard.data.channel === 'Direct Booking' ? renderDirectBookingMappingSketch() : renderRemoteMappingSketch(wizard.data.channel)),
      },
    ],
    onComplete: () => {},
  },
  // AI-generated dynamic stepper (v3 Confluence framing) — ONE shared
  // wizard reused by every product's "Set up" button (see
  // buildProductDetailNode), not a bespoke wizard per product. Robert:
  // "generic .. but maybe we show it in that full screen edit mode like we
  // use for the rate mapping .. i am wondering if that might be the
  // standard form presentation" — reuses this exact wizard-overlay
  // mechanism rather than inventing a new full-page stepper style, since
  // this IS meant to be the standard presentation for a bounded task, not
  // just this one flow. `wizard.data.productName` (seeded via
  // data-wizard-context, see wireWizardOpenButtons) is the only thing that
  // varies step titles/copy by product — steps themselves stay generic/
  // illustrative, matching the "wireframe but substantial" brief: real
  // enough to fill the space, not real per-product content. Per the hybrid
  // save model (project_save_model.md) this is a CONSEQUENTIAL action
  // (activating a product) — commits via the final step's explicit
  // Confirm, same as add-channel above, not progressively as steps are
  // completed.
  'ai-setup-stepper': {
    steps: [
      {
        title: 'Connect your account',
        render: (wizard) => `
          <h2 class="wizard-step__title">${tr('Setting up')} ${tr(wizard.data.productName ?? 'this product')}</h2>
          <p class="wizard-step__intro">${tr("We've put together a short setup based on your account — just confirm the details below.")}</p>
          ${renderSectionsSketch([{ title: 'Account details', shape: 'field' }])}
        `,
      },
      {
        // Plain checkbox list, real property names — same
        // `mapping-check-row` pattern renderDirectBookingMappingSketch
        // already uses, not the real-navigation renderRecordPicker (whose
        // data-path-key links only make sense inside canvasEl, which
        // wirePathLinks actually queries — wizardBodyEl is a different
        // subtree entirely). Non-interactive, matching "structure only, no
        // real flow" convention — checked by default, not a real multi-
        // select.
        title: 'Choose your properties',
        render: (wizard) => `
          <h2 class="wizard-step__title">${tr('Which properties should this apply to?')}</h2>
          <div class="sketch-section">${SCOPE_PROPERTIES.map(
            (name) => `<label class="mapping-check-row"><input type="checkbox" checked /><span>${tr(name)}</span></label>`
          ).join('')}</div>
        `,
      },
      {
        title: 'Review and confirm',
        render: (wizard) => `
          <h2 class="wizard-step__title">${tr('Review and confirm')}</h2>
          <p class="wizard-step__intro">${tr('Confirming activates')} ${tr(wizard.data.productName ?? 'this product')} ${tr('for the properties you selected.')}</p>
          ${renderSectionsSketch([{ title: 'Summary', shape: 'field' }])}
        `,
      },
    ],
    // Two real bugs, both here (Robert: "setup stepper should land back on
    // the products page not the 'learn more' page" / "activate should go
    // to the stepper setup, currently it just toggles in place"):
    //   1. The actual state-flip now happens HERE, on completion — not on
    //      the Activate button's own click (see the card's own
    //      data-wizard-toggle-key, seeded into wizard.data as `toggleKey`
    //      by wireWizardOpenButtons) — same activateProduct() helper
    //      wireProductCards' Remove path also uses, so both directions go
    //      through one shared function.
    //   2. `select(0, 'manage-products')` drops back to the picker level —
    //      completing the wizard from a product's detail page (depth 1)
    //      must NOT leave state.path pointed at that now-activated
    //      product's detail page; it returns to Manage products' own card
    //      grid so the newly-activated card is visible in its new state.
    onComplete: (data) => {
      if (data.toggleKey) activateProduct(data.toggleKey);
      select(0, 'manage-products');
    },
  },
};

// Returns the breadcrumb's own visible trail (see the function below for
// why `resetTrail` crumbs get sliced off) without rendering anything —
// split out so renderCanvasHeader can ask "is there a real multi-level
// trail right now?" without duplicating this slicing logic.
function visibleBreadcrumbTrail(trail) {
  const lastResetIndex = trail.reduce((acc, t, i) => (t.resetTrail ? i : acc), -1);
  return lastResetIndex > 0 ? trail.slice(lastResetIndex) : trail;
}

function breadcrumbHtml(trail) {
  const visibleTrail = visibleBreadcrumbTrail(trail);
  // A single crumb with nothing above or below it is noise — only show the
  // breadcrumb once there's an actual multi-level trail to convey.
  if (visibleTrail.length <= 1) return '';
  return (
    `<div class="breadcrumb">` +
    visibleTrail
      .map((t, i) => {
        const isLast = i === visibleTrail.length - 1;
        const piece = isLast
          ? `<span class="breadcrumb__current">${tr(t.label)}</span>`
          : `<a href="#" data-crumb-truncate="${t.truncateTo}">${tr(t.label)}</a>`;
        return i === 0 ? piece : `<span class="breadcrumb__sep">/</span>${piece}`;
      })
      .join('') +
    `</div>`
  );
}

// Single top line combining the page title (or breadcrumb, once drilled
// down) with the Property scope switcher — user's direction: "we want to
// just take minimal vertical space so maybe h1/crumb/property switcher are
// that top line." Replaces what used to be TWO separate rows (the
// switcher's own `.canvas-scope-switcher` div, then breadcrumbHtml's own
// `.breadcrumb` div below it) with one shared flex row: title/breadcrumb
// on the left, switcher on the right, same vertical space either way.
//
// `pageLabel` (rootItem.label, e.g. "Rate plans") renders as a plain H1
// whenever there's no real multi-level trail yet (visibleBreadcrumbTrail
// has ≤1 entry — the existing "single crumb is noise" rule, reused rather
// than duplicated). Once a real drill-down exists, the breadcrumb REPLACES
// the H1 in the exact same slot — it doesn't stack below it. This is the
// same row growing into a different form, not a second row appearing.
//
// `switcherMode` — undefined/falsy when this item has no switcher at all
// (most Configuration items) — in which case the row still renders (for
// the H1/breadcrumb) but with an empty right-hand side, not collapsing to
// nothing; a page keeps its title even without a switcher.
// Product-tier name — a customer-facing tier label (distinct from the
// debug panel's internal SM/LH/MP toggle values), used only as the rail
// brand mark's tooltip (see renderRail). MP is "SiteMinder Plus" here
// since it's sold as a tier of SiteMinder, not a separate product like
// Little Hotelier. Deliberately NOT also shown as a static panel-header
// label — that read as a dead Slack-workspace-switcher lookalike with no
// function, and this scheme is specifically trying to cut chrome like
// that, not add more of it.
const PRODUCT_TIER_LABELS = {
  SM: 'SiteMinder',
  LH: 'Little Hotelier',
  MP: 'SiteMinder Plus',
};

function renderCanvasHeader(pageLabel, trail, switcherMode) {
  const visibleTrail = trail ? visibleBreadcrumbTrail(trail) : [];
  const titleHtml =
    visibleTrail.length > 1
      ? breadcrumbHtml(trail)
      : `<h1 class="canvas-page-title">${tr(pageLabel)}</h1>`;
  const switcherHtml = switcherMode && state.propertyCount === 'multiple' ? renderScopeSwitcher(switcherMode) : '';
  return `<div class="canvas-header">${titleHtml}${switcherHtml}</div>`;
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

// Remote-channel mapping — SM rate on the left, that channel's own rate
// selection on the right, paired row by row. Two columns is enough to
// convey "reconciling two systems" without needing real field labels.
function renderRemoteMappingSketch(channelName) {
  const row = () => `<div class="mapping-row"><div class="sketch-skel-value"></div><div class="mapping-row__arrow">&rarr;</div><div class="sketch-skel-value"></div></div>`;
  return `
    <div class="sketch-section mapping-cols">
      <div class="mapping-cols__headings">
        <h3 class="sketch-section__title">${tr('SM rate')}</h3>
        <span></span>
        <h3 class="sketch-section__title">${channelName || tr('Channel')} ${tr('rate')}</h3>
      </div>
      ${Array(4).fill(row()).join('')}
    </div>
  `;
}

// Direct Booking has no remote system to reconcile — it's just "which rates
// go live," so a checkbox list rather than a two-system mapping.
function renderDirectBookingMappingSketch() {
  const row = () => `<label class="mapping-check-row"><input type="checkbox" checked /><div class="sketch-skel-value"></div></label>`;
  return `<div class="sketch-section"><h3 class="sketch-section__title">${tr('Rates to publish')}</h3>${Array(4).fill(row()).join('')}</div>`;
}

function renderSectionsSketch(sections) {
  return `<div class="sketch-sections">${sections
    .map((s) => `<div class="sketch-section"><h3 class="sketch-section__title">${tr(s.title)}</h3>${renderSectionShape(s.shape)}</div>`)
    .join('')}</div>`;
}

// Home page (Insights > Overview's new content) — a stack of purpose-built
// widgets, each its own row, rather than one dashboard-cards grid. First
// scaffold of the "family of dashboards" idea from the v3 Confluence page:
// Priority actions (mixed diagnostics + recommendations, kept combined for
// now), a grouped Performance summary (cascades to its own dashboards),
// and a value-tracking row for accepted recommendations. `content.rows`:
// [{heading?, content}] — `heading` is optional, only Performance gets one
// today since Priority actions and the value tracker carry their own
// internal headers already.
function renderHome(rows) {
  return `<div class="home-page">${rows
    .map((row) => {
      // `row.viewAll` (optional): {linkTo: [itemKey, recordName]} — same
      // "jump to a specific nested dashboard" mechanism as a metric group's
      // own `linkTo` (Performance row itself needs a "View all" alongside
      // its individual groups' links). Renders as the same bare chevron
      // Priority actions uses, not repeated "View all" text.
      const viewAll = row.viewAll ? renderViewAllChevron(`0:${row.viewAll.linkTo[0]}:${row.viewAll.linkTo[1]}`) : '';
      const heading =
        row.heading || viewAll
          ? `<div class="home-page__row-heading-bar">${row.heading ? `<div class="home-page__row-heading">${tr(row.heading)}</div>` : '<span></span>'}${viewAll}</div>`
          : '';
      return `
        <div class="home-page__row">
          ${heading}
          ${renderSketch(row.content)}
        </div>
      `;
    })
    .join('')}</div>`;
}

function renderSketch(content) {
  if (content.sketch === 'home') return renderHome(content.rows);
  if (content.sketch === 'product-detail') return renderProductDetail(content.product);
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
    return renderDashboardCards(content.cards);
  }
  if (content.sketch === 'priority-actions') {
    // Home's top widget — real titles + real rationale text (Robert wants
    // higher content fidelity for this iteration, not skeleton-only), 3
    // cards shown with a "View all" link to the full list. Deliberately
    // mixes diagnostic-flavored items (a stop-sell left open) and
    // recommendation-flavored items (add a non-refundable rate) in one
    // widget for now — the v3 Confluence page's "cascading dashboard
    // family" (keeping these separate) is logged as a later refinement,
    // not built here yet (Robert: "for now keep it combined").
    return renderPriorityActions(content.items, content.viewAllKey);
  }
  if (content.sketch === 'metric-groups') {
    // Home's performance row — grouped stat cards, each group a small
    // cluster (not one flat row of individual metrics) that cascades into
    // its own dedicated performance dashboard on click, rather than Home
    // trying to carry every number itself. First scaffold of the
    // cascading-dashboard-family idea (v3 Confluence page) applied to
    // performance content specifically.
    return renderMetricGroups(content.groups);
  }
  if (content.sketch === 'value-tracker') {
    // "Tracking past recommendations performance" — answers the CPO/
    // strategy-doc value-awareness gap directly: once a recommendation is
    // accepted, show what it was actually worth, not just that DR+ exists.
    // Deliberately NOT a "DR+ tier" badge/label (Robert reconsidered that —
    // "its prob more about demonstrating that dr+ was making them money
    // which is the other idea") — the row's job is to make realized value
    // visible, not to brand the feature. `content.summary`: real headline
    // text (accepted count + estimated $ this period); `content.recent`:
    // [{title, value, status}] illustrative recent accepted actions.
    return renderValueTracker(content.summary, content.recent);
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
          ${tr('Add channel')}
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
function openWizard({ steps, onComplete }, initialData = {}) {
  state.wizard = { steps, currentStep: 0, data: { ...initialData }, onComplete };
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
      return `<span class="wizard__step ${stepState}">${i + 1}. ${tr(s.title)}</span>`;
    })
    .join('<span class="wizard__step-sep" aria-hidden="true"></span>');

  wizardBodyEl.innerHTML = steps[currentStep].render(wizard);

  wizardBackEl.hidden = currentStep === 0;
  wizardBackEl.textContent = tr('Back');
  wizardNextEl.textContent = isLastStep ? tr('Done') : tr('Next');

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
  // Computed before renderRail (which needs the full tree, not just the
  // current section, to aggregate each rail item's own badge — see
  // sectionHasAttention). Falls through to an honest empty panel/canvas for
  // any section with no data for the current state (e.g. an undefined rail
  // item for a given account type) — no placeholders, just nothing rendered.
  const content = getContent(
    state.accountType,
    state.propertyCount,
    state.scope,
    state.enabledProducts,
    state.hasDrPlus,
    state.tier === 'siteminder-plus',
    state.hasMultiProperty
  );
  renderRail(content);
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
  mobileTopbarTitleEl.textContent = tr(currentItem?.label ?? UTILITY_SECTION_LABELS[state.section] ?? '');
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
  // Same rail-level bubbling as the desktop rail (renderRail) — recomputed
  // here rather than threaded in, since the drawer opens from its own
  // gesture (the hamburger), independent of the main render() cycle.
  const content = getContent(
    state.accountType,
    state.propertyCount,
    state.scope,
    state.enabledProducts,
    state.hasDrPlus,
    state.tier === 'siteminder-plus',
    state.hasMultiProperty
  );
  const sectionRows = items
    .map((item) => {
      const badge = sectionHasAttention(content?.[item.key])
        ? `<span class="mobile-drawer__item-badge" aria-hidden="true"></span>`
        : '';
      return `
        <li>
          <button class="mobile-drawer__item${item.key === state.section ? ' is-active' : ''}" data-drawer-section="${item.key}">
            <span class="mobile-drawer__item-icon" aria-hidden="true">${RAIL_ICONS[item.icon] ?? ''}</span>
            ${tr(item.label)}
            ${badge}
          </button>
        </li>
      `;
    })
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
            ${tr(u.label)}
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
    // to insights rather than stranding the user on a blank screen. This
    // is the only case that needs a reset: the SECTION itself is gone.
    //
    // `resetPath()` REMOVED here (was unconditional — wiped the user's
    // whole current path back to the section's default landing item on
    // every account-type change, even when nothing on that path had
    // actually changed). Caught live: sitting on Configuration → Direct
    // Booking → Selling tools → Promotions and switching SM→MP bounced
    // all the way back to Configuration's default (Properties), even
    // though Direct Booking/Selling tools/Promotions all still exist for
    // MP too. Same reasoning `property-count`'s handler below already
    // applies — resolveSelected/resolveChain already fall back per-level
    // if a specific path segment stops existing (e.g. Front desk itself),
    // so there's no need to defensively wipe the whole path on every
    // toggle. "make sure if i open the proto controls and change a
    // setting you update for the current view/route" (user's direction) —
    // changing a setting should react IN PLACE, not relocate the user.
    if (!getRailItems(state.accountType).some((i) => i.key === state.section)) {
      state.section = 'insights';
      resetPath();
    }
    document.querySelectorAll('[data-account-type]').forEach((b) => {
      b.classList.toggle('is-active', b === el);
    });
    savePrototypeSettings();
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
    savePrototypeSettings();
    render();
  });
});

document.querySelectorAll('[data-system-count]').forEach((el) => {
  el.addEventListener('click', () => {
    state.multipleSystems = el.dataset.systemCount === 'multiple';
    document.querySelectorAll('[data-system-count]').forEach((b) => {
      b.classList.toggle('is-active', b === el);
    });
    savePrototypeSettings();
    render();
  });
});

document.querySelectorAll('[data-language]').forEach((el) => {
  el.addEventListener('click', () => {
    state.language = el.dataset.language;
    document.querySelectorAll('[data-language]').forEach((b) => {
      b.classList.toggle('is-active', b === el);
    });
    savePrototypeSettings();
    render();
  });
});

document.querySelectorAll('[data-user-role]').forEach((el) => {
  el.addEventListener('click', () => {
    state.isAdmin = el.dataset.userRole === 'admin';
    document.querySelectorAll('[data-user-role]').forEach((b) => {
      b.classList.toggle('is-active', b === el);
    });
    savePrototypeSettings();
    render();
  });
});

// Activating Multi-Property from a
// Manage products card (see setProductActive) auto-switches
// state.propertyCount to 'multiple' (Robert: "adding it automatically
// toggles the proto setting to multiple properties if its not already"),
// so the debug panel's own Property count buttons need to be kept in sync
// from that entry point too, not just their own direct click handler.
function syncPropertyCountButtons() {
  document.querySelectorAll('[data-property-count]').forEach((b) => {
    b.classList.toggle('is-active', b.dataset.propertyCount === state.propertyCount);
  });
}

// Sync the debug panel's own button highlighting to whatever was loaded
// from localStorage (see savedPrototypeSettings above) — otherwise a
// returning user would see e.g. "MP" applied to the actual prototype but
// the panel's buttons still showing "SM" highlighted, since those
// `is-active` classes are hardcoded in index.html for the default state.
document.querySelectorAll('[data-account-type]').forEach((b) => {
  b.classList.toggle('is-active', b.dataset.accountType === state.accountType);
});
syncPropertyCountButtons();
document.querySelectorAll('[data-system-count]').forEach((b) => {
  b.classList.toggle('is-active', (b.dataset.systemCount === 'multiple') === state.multipleSystems);
});
document.querySelectorAll('[data-language]').forEach((b) => {
  b.classList.toggle('is-active', b.dataset.language === state.language);
});
document.querySelectorAll('[data-user-role]').forEach((b) => {
  b.classList.toggle('is-active', (b.dataset.userRole === 'admin') === state.isAdmin);
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

// ---------- Debug/prototype overlay layer ----------
// Not part of the product surface being wireframed. Unlike the earlier
// bottom-sheet version, this is deliberately ALWAYS visible (a small dark
// corner tab, `#debugTab`) rather than hidden-by-default — "I want it
// discoverable but distinct from the design." Distinctness comes from the
// inverted dark chrome (see .debug-tab/.debug-panel CSS), not from hiding
// it. The `~` key still toggles it too, as a secondary path.
const debugTab = document.getElementById('debugTab');
const debugPanel = document.getElementById('debugPanel');
const debugClose = document.getElementById('debugClose');

function openDebugPanel() {
  debugPanel.hidden = false;
  debugTab.setAttribute('aria-expanded', 'true');
}

function closeDebugPanel() {
  debugPanel.hidden = true;
  debugTab.setAttribute('aria-expanded', 'false');
}

function toggleDebugPanel() {
  debugPanel.hidden ? openDebugPanel() : closeDebugPanel();
}

window.addEventListener('keydown', (e) => {
  if (e.key === '`' || e.key === '~') {
    e.preventDefault();
    toggleDebugPanel();
  } else if (e.key === 'Escape') {
    closeDebugPanel();
  }
});

debugTab.addEventListener('click', toggleDebugPanel);
debugClose.addEventListener('click', closeDebugPanel);

render();
