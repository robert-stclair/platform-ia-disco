// Nav content model for the Platform 2.0 IA wireframe.
// Mirrors the decisions log on the "IA schemes — prototyping" Confluence page:
// https://siteminder-jira.atlassian.net/wiki/spaces/SMD/pages/1197277194/IA+schemes+prototyping
//
// ---------------------------------------------------------------------------
// ONE recursive node shape, used at every level (rail item, panel item,
// sublist item, tab). This replaced an earlier version that used three
// competing shapes (`tabs`/`sublist`/`properties` as sibling properties on
// the same object) — that produced duplicate-key bugs and lost content when
// patched. Never reintroduce that pattern.
//
//   Node = {
//     key, label,
//     active?: true,        // default-selected among its siblings
//     content: null | Content
//   }
//
//   Content =
//     | { type: 'tabs', tabs: Node[] }             // horizontal tab strip; each tab is a Node
//     | { type: 'list', items: Node[] }            // vertical sub-nav list (packed away until its parent is clicked)
//     | { type: 'records', names: string[], detailNode: Node | (() => Node), display?: 'table', tableColumns?: number, crossNav?: boolean }
//                                                   // GENERIC "clickable records list -> shared detail node" pattern
//                                                   // (PATTERNS.md) — selecting a name shows `detailNode`'s content.
//                                                   // Properties (-> buildPropertyNode) and Users (-> buildUserNode) are
//                                                   // both instances of this ONE mechanism — never hardcode a new
//                                                   // content type for "a picker that opens a shared detail page,"
//                                                   // reuse this.
//                                                   // `detailNode` as a FUNCTION (thunk, zero args) instead of a plain
//                                                   // Node: REQUIRED whenever two detail nodes cross-reference each
//                                                   // other (buildPropertyNode's Users tile opens buildUserNode;
//                                                   // buildUserNode's Properties tab opens buildPropertyNode) — an
//                                                   // eager call on either side recurses forever (a real caught
//                                                   // RangeError, not theoretical). resolveChain resolves the thunk
//                                                   // lazily, only once a name is actually clicked. Every other
//                                                   // caller can keep passing a plain Node.
//                                                   // `crossNav: true` (optional): marks a picker as a cross-navigation
//                                                   // point between two entities referencing each other (same pair as
//                                                   // above) — without it, repeated back-and-forth accumulates every
//                                                   // hop into one ever-growing breadcrumb (a real caught bug, not
//                                                   // theoretical: "Users / Jane Smith / Properties / Harbourview
//                                                   // Hotel / Users / Jane Smith"). breadcrumbHtml trims the DISPLAYED
//                                                   // trail to start from the last `crossNav` pick — state.path
//                                                   // itself is untouched, only what's shown. See PATTERNS.md.
//                                                   // `display: 'table'` (optional, e.g. Rate plans): same real,
//                                                   // clickable names, rendered as a table-styled skeleton instead
//                                                   // of a plain list — `tableColumns` (default 3) controls how many
//                                                   // extra skeleton-only columns render alongside the name column.
//     | { type: 'nav-dashboard', tiles: Node[], parentTabsPathIndex?: number, title?: string, extraSections?: Array }
//                                                   // navigation dashboard (6th canonical page-skeleton type) — a flat
//                                                   // grid of clickable TILES, each a real destination (not the same
//                                                   // thing as the inert `dashboard-cards` sketch below). TWO modes
//                                                   // (PATTERNS.md) — (a) STANDALONE: tiles are real child Nodes
//                                                   // (tile.content), replaces a tab strip entirely, breadcrumb takes
//                                                   // over once picked (built: buildPropertyNode); (b) NESTED in one
//                                                   // tab of a normal `tabs` node (tile.linksToTab, a sibling tab's
//                                                   // key, instead of tile.content) — clicking a tile just switches
//                                                   // the active sibling tab, tab strip never disappears (built:
//                                                   // Rate plans). `parentTabsPathIndex` is set by resolveChain
//                                                   // automatically when mode (b) is detected — never set it by hand
//                                                   // in nav-data.js. Optional `tile.tip`: a real-time-feeling status
//                                                   // string (skeleton bar if omitted). Optional `title`: heading
//                                                   // shown above the tile grid. Optional `extraSections`:
//                                                   // [{ title, content }] — purely decorative sections stacked
//                                                   // BELOW the (still fully routable) tile grid, each `content` any
//                                                   // `sketch` value — see renderNavDashboardPage in main.js, and
//                                                   // buildRatePlanNode's Overview tab for the first instance.
//     | { type: 'sketch', sketch, ... }            // see PATTERNS.md for every `sketch` value + its own options
//     | { type: 'systems' }                        // "Integrated systems"-style: system count drives whether a
//                                                   //   systems list appears before the selected system's content
//
// No placeholder items (e.g. "Etc.") — only entries confirmed from
// production screenshots or decided in conversation. Sketches show real
// card titles where confirmed, but wireframe blocks underneath — no
// field-level labels or copy.
//
// ---------------------------------------------------------------------------
// Page-skeleton type retrofit (CHANGE-QUEUE.md item 7) — every existing
// item's assigned type, so the mapping is explicit rather than implicit.
// Update this table whenever an item's content/type changes.
//
//   Item                                    | Type              | Notes
//   ----------------------------------------|--------------------|------
//   Configuration > Properties                | records (nav)      | type:'records' -> buildPropertyNode(...);
//                                                                    picker rows are 'list' via renderRecordPicker.
//                                                                    Distribution's own Properties item was
//                                                                    REMOVED — see IA-BY-USER-TYPE.md's open
//                                                                    question, don't reintroduce without that
//                                                                    being resolved first.
//   PROPERTY_NODE (top level)                 | nav dashboard      | type:'nav-dashboard', mode a (standalone —
//                                                                    PATTERNS.md); tiles: Property details,
//                                                                    Channels, Connectivities, Integrated
//                                                                    systems, Users. Was an 8-tab strip before
//                                                                    this conversion — see CONTEXT.md.
//   PROPERTY_NODE > Property details (tile)   | tabs               | drills into PROPERTY_DETAILS_NODE: General
//                                                                    information/Room types/Services/Policies/
//                                                                    Media library
//   PROPERTY_DETAILS_NODE > General info      | stacked cards      | sketch:'sections' — absorbed the OLD
//                                                                    "Property details" tab's fields
//                                                                    (Property/Contact/Extra information) after
//                                                                    a naming collision with the new top-level
//                                                                    tile of the same name
//   PROPERTY_DETAILS_NODE > Room types        | list               | sketch:'list'
//   PROPERTY_DETAILS_NODE > Media library     | card grid (media)  | sketch:'media'
//   PROPERTY_NODE > Channels, Connectivities  | list               | sketch:'list', NEW tiles, best-guess stub
//     (tiles)                                                       (same treatment as Rate plans' own
//                                                                    Channels/Connectivities)
//   PROPERTY_NODE > Integrated systems (tile) | stacked cards      | sketch:'sections' via 'systems' type —
//                                                                    kept at TOP level, not folded under
//                                                                    Property details
//   PROPERTY_NODE > Users (tile, always       | list               | sketch:'list' (which users have access
//     shown)                                                        to this property — mirror of USER_NODE's
//                                                                    Properties tab, but unconditional) — also
//                                                                    kept at TOP level
//   Direct Booking > Selling tools's 2 tabs  | stacked cards      | sketch:'sections'
//   Direct Booking > Setup's 7 tabs          | stacked cards      | sketch:'sections'
//   Direct Booking > Branding                | none yet           | content: null, stub
//   Configuration > Users                    | records (nav)      | type:'records' -> buildUserNode; picker
//                                                                    rows are 'list' via renderRecordPicker
//   USER_NODE > User details                 | stacked cards      | sketch:'sections'
//   USER_NODE > Properties (multi-prop only) | list               | sketch:'list' (which properties this
//                                                                    user has access to)
//   Configuration > Channels                 | none yet           | content: null, stub — page-type TBD
//   Configuration > Channels Plus            | none yet           | content: null, stub
//   Configuration > Metasearch               | none yet           | content: null, stub
//   Configuration > Add products              | none yet           | content: null, stub. Action-row pattern
//                                                                    (actionIcon: '+'), renamed from "Manage
//                                                                    products" — see PATTERNS.md
//   Configuration > Brands, Clusters (MP)     | none yet           | content: null, stub
//   Distribution > Inventory                  | grid               | sketch:'grid', SKELETON-ONLY (numeric
//                                                                    columns/rows, no real labels — "just a
//                                                                    skeleton without words") — real
//                                                                    columns/rows not decided, don't guess
//   Distribution > Rate plans                 | records (nav,      | type:'records', display:'table' ->
//                                                table)               buildRatePlanNode(showProperties) — tabs
//                                                                    (Overview/Rooms/Channels/
//                                                                    Connectivities/Properties[MP]) whose
//                                                                    Overview tab holds a nav-dashboard
//                                                                    (mode b, nested-in-a-tab — see
//                                                                    PATTERNS.md); tiles use linksToTab to
//                                                                    switch sibling tabs, no extra nav level
//   Distribution > Yield rules                | records (nav)      | type:'records' -> YIELD_RULE_NODE (same
//                                                                    simple treatment)
//   Distribution > Health check                | dashboard cards    | sketch:'dashboard-cards' — ONE page, 7
//                                                                    TITLELESS stat-shaped cards ("generic -
//                                                                    no labels"), no more tab strip (was 7
//                                                                    separate list tabs)
//   Insights > Dashboard                      | dashboard cards    | sketch:'dashboard-cards', ALL cards
//                                                                    titleless (skeleton title bar) — page
//                                                                    shape only, confirmed no titles needed
//   Insights > Recommendations                | list               | sketch:'list'
//   Insights > My insights > Dashboards,      | records (nav)      | type:'records' -> CUSTOM_DASHBOARD_NODE;
//     Charts                                                        starredNames marks illustrative rows;
//                                                                    picker rows are 'list' via
//                                                                    renderRecordPicker
//   CUSTOM_DASHBOARD_NODE (any custom          | dashboard cards    | sketch:'dashboard-cards', same titleless
//     dashboard/chart, incl. promoted items)                        skeleton as Insights' own Dashboard
//   Transactions > Reservations                | list               | sketch:'list' (plain, not clickable
//                                                                    records — unlike Rate plans/Yield rules)
//   Transactions > Guest communications,       | none yet           | content: null, stub
//     Payments
//   Front desk (LH only) > Calendar           | calendar           | sketch:'calendar'; section has
//                                                                    noPanel: true (max width, no L2)
//   My account > Profile, Security            | stacked cards      | sketch:'sections' each — flat panel items
//                                                                    (not a tabs node), reached via the rail's
//                                                                    user avatar rather than a rail item; splits
//                                                                    up what was one long scrolling page
//   My account > Support code, Logout         | none yet           | content: null, stub. Action-row pattern
//                                                                    (actionIcon), same L2 list as Profile/
//                                                                    Security so they can sit together as plain
//                                                                    action rows rather than tabs

const BASE_RAIL_ITEMS = [
  { key: 'insights', label: 'Insights', icon: 'insights' },
  { key: 'distribution', label: 'Distribution', icon: 'distribution' },
  { key: 'transactions', label: 'Transactions', icon: 'transactions' },
  { key: 'configuration', label: 'Configuration', icon: 'configuration' },
];

// The rail was constant across every account type until LH's "Front desk"
// item (CHANGE-QUEUE.md item 5) — the first case of the rail itself
// varying by account type, not just what's inside L2/L3. LH gets Front
// desk prepended, first/topmost, ahead of the same four items everyone
// else gets.
export function getRailItems(accountType) {
  if (accountType === 'LH') {
    return [{ key: 'front-desk', label: 'Front desk', icon: 'frontDesk' }, ...BASE_RAIL_ITEMS];
  }
  return BASE_RAIL_ITEMS;
}

// EXPLORATORY — sample property names for the generic `records` pattern
// (CHANGE-QUEUE.md item 3). Generic realistic names, not real confirmed
// data. Declared here (moved up from further down the file) so
// buildPropertyNode/buildUserNode below can both reference it — the two
// are mutually cross-linked (a property's Users tab links to buildUserNode,
// a user's Properties tab links to buildPropertyNode), so their shared
// data needs to exist before either function is defined.
const SAMPLE_PROPERTIES = [
  'Harbourview Hotel',
  'The Grand Meridian',
  'Coastal Breeze Inn',
  'Alpine Lodge & Suites',
  'Riverside Boutique Hotel',
];

// EXPLORATORY — sample user names for the generic `records` pattern
// (CHANGE-QUEUE.md item 3). Generic realistic names, not real confirmed
// user data, not placeholder-style labels — same treatment as
// SAMPLE_PROPERTIES above.
const SAMPLE_USERS = ['Jane Smith', 'Michael Chen', 'Priya Patel', 'Tom Reilly'];

// A single user's own detail page — "User details" always, plus
// "Properties" (which properties this user has access to) only for
// multi-property accounts. Built as a function of `showProperties`
// (same parameter `buildConfigurationPropertiesItem`/`buildPropertyNode`
// use), since this tab strip's shape itself varies by account state, not
// just its content.
//
// "Properties" tab is now a REAL `records` picker (SAMPLE_PROPERTIES,
// detailNode: a THUNK, () => buildPropertyNode(showProperties)) — not a
// skeleton stub — per the user's explicit self-consistency request:
// Config > Users lists every user on the account; Config > Property > Users
// lists the users assigned to THAT property; Config > Users > [a user] >
// Properties should list the properties THAT user has access to, using the
// SAME names either way round, and clicking through should actually
// navigate to the real property/user page on the other side, not just
// display text: "so it's all self consistent."
//
// This is a genuinely circular reference (buildUserNode's Properties tab
// opens buildPropertyNode; buildPropertyNode's Users tab opens
// buildUserNode) — MUST pass a THUNK (`() => build...(showProperties)`),
// NOT the result of calling it directly. An earlier version called each
// other eagerly INSIDE the object literal being built (e.g. `detailNode:
// buildPropertyNode(showProperties)` evaluated immediately as part of
// constructing buildUserNode's own return value) — that recurses forever
// (building A calls B, which calls A again, ...) and threw a real
// `RangeError: Maximum call stack size exceeded`, caught live in the
// browser console, not a theoretical risk. A thunk defers the call until
// `resolveChain` actually needs that specific detail page (see its
// `records` branch in `main.js`) — nothing about their being `function`
// declarations (vs. `const`) made the ORIGINAL version safe on its own;
// the eager call inside each body was the actual bug.
function buildUserNode(showProperties) {
  return {
    key: 'user',
    label: 'User',
    content: {
      type: 'tabs',
      tabs: [
        {
          key: 'user-details',
          label: 'User details',
          active: true,
          content: { type: 'sketch', sketch: 'sections', sections: [{ title: 'User details', shape: 'field' }] },
        },
        ...(showProperties
          ? [
              {
                key: 'user-properties',
                label: 'Properties',
                content: {
                  type: 'records',
                  names: SAMPLE_PROPERTIES,
                  detailNode: () => buildPropertyNode(showProperties),
                  // Cross-navigation, not a deeper drill-down — this picker
                  // and buildPropertyNode's own "Users" tile point at EACH
                  // OTHER, so following one from the other must not keep
                  // accumulating breadcrumb depth (caught live: "Users /
                  // Jane Smith / Properties / Harbourview Hotel / Users /
                  // Jane Smith" — a click-history log, not a hierarchy
                  // position). See renderChainBody's `crossNav` handling.
                  crossNav: true,
                },
              },
            ]
          : []),
      ],
    },
  };
}

// "Property details" — a tabs node reached by drilling into PROPERTY_NODE's
// own "Property details" tile (below). General information now absorbs what
// used to be a SEPARATE "Property details" tab (Property/Contact/Extra
// information fields) — the two shared a name once PROPERTY_NODE's own
// top-level tile became "Property details", so the old tab's fields were
// folded into General information rather than keeping two same-named
// things at different levels (user's explicit resolution).
const PROPERTY_DETAILS_NODE = {
  key: 'property-details-detail',
  label: 'Property details',
  content: {
    type: 'tabs',
    tabs: [
      {
        key: 'general-information',
        label: 'General information',
        active: true,
        content: {
          type: 'sketch',
          sketch: 'sections',
          sections: [
            { title: 'Currency', shape: 'field' },
            { title: 'Inventory', shape: 'field' },
            { title: 'Language and region', shape: 'field' },
            { title: 'Property', shape: 'field' },
            { title: 'Contact', shape: 'cols' },
            { title: 'Extra information', shape: 'field' },
          ],
        },
      },
      // Per-property — no generic/shared room-type concept exists today
      // (user: "i dont think there is a concept of a generic room type").
      // Confirmed a plain list (not a stub) — CHANGE-QUEUE.md Distribution
      // batch item 6.
      {
        key: 'room-types',
        label: 'Room types',
        content: { type: 'sketch', sketch: 'list' },
      },
      {
        key: 'services',
        label: 'Services',
        content: {
          type: 'sketch',
          sketch: 'sections',
          sections: [
            { title: 'Property description', shape: 'field' },
            { title: 'Features', shape: 'field' },
            { title: 'Instructions to the location', shape: 'field' },
          ],
        },
      },
      {
        key: 'policies',
        label: 'Policies',
        content: {
          type: 'sketch',
          sketch: 'sections',
          sections: [
            { title: 'Check-in / Check-out', shape: 'field' },
            { title: 'Smoking policy', shape: 'field' },
            { title: 'Terms, conditions and privacy policy', shape: 'field' },
          ],
        },
      },
      {
        key: 'media-library',
        label: 'Media library',
        content: { type: 'sketch', sketch: 'media' },
      },
    ],
  },
};

// A single property's own settings — same structure regardless of whether
// the account is single- or multi-property (the "one IA, not two" decision).
// Now a `nav-dashboard` (6th canonical page-skeleton type, mode a —
// STANDALONE, replacing what used to be an 8-tab strip) instead of `tabs`
// directly — PROPERTY_NODE was the original target case for this pattern's
// standalone mode (the actual tab-overload problem it was built to solve).
// Reused directly as Property settings' content, and as what a drilled-in
// property (from an MP properties list) shows.
//
// Tile set: "Property details" (drills into PROPERTY_DETAILS_NODE above —
// General information/Room types/Services/Policies/Media library), Channels
// and Connectivities (NEW — same best-guess sketch:'list' stub treatment as
// Rate plans' own Channels/Connectivities tiles, not confirmed business
// logic), Integrated systems and Users (both moved to the TOP level per the
// user's explicit direction — "users and integrated systems move to the
// top level" — rather than folding under Property details with the rest).
// `showProperties` is needed here now (function, not a plain const) purely
// so the Users tile below can correctly build buildUserNode(showProperties)
// — the tile itself is ALWAYS shown regardless of property count (mirror of
// buildUserNode's own "Properties" tab, which IS gated — every property,
// single- or multi-property account alike, has users with access to it).
// See buildUserNode above for the other half of this circular reference.
function buildPropertyNode(showProperties) {
  return {
    key: 'property',
    label: 'Property settings',
    content: {
      type: 'nav-dashboard',
      tiles: [
        { key: 'property-details', label: 'Property details', content: PROPERTY_DETAILS_NODE.content },
        { key: 'channels', label: 'Channels', content: { type: 'sketch', sketch: 'list' } },
        { key: 'connectivities', label: 'Connectivities', content: { type: 'sketch', sketch: 'list' } },
        {
          key: 'integrated-systems',
          label: 'Integrated systems',
          content: {
            type: 'systems',
            sections: [
              { title: 'General settings', shape: 'field' },
              { title: 'Inventory settings', shape: 'chips' },
              { title: 'Reservation delivery failure emails', shape: 'field' },
              { title: 'Reservation mappings', shape: 'cols' },
              { title: 'Credit card mappings', shape: 'list' },
            ],
          },
        },
        // Mirror of buildUserNode's "Properties" tab (CHANGE-QUEUE.md item
        // 5) — which users have access to THIS property. Unlike
        // buildUserNode's "Properties" tab, this tile is ALWAYS shown, not
        // property-count-gated. Now a REAL `records` picker (SAMPLE_USERS,
        // detailNode: a THUNK, () => buildUserNode(showProperties)), same
        // self-consistency request as buildUserNode's own Properties tab
        // above — clicking a user here opens their real buildUserNode page.
        // MUST be a thunk, not a direct call — see buildUserNode's own
        // comment above for why (the actual RangeError this caused).
        {
          key: 'property-users',
          label: 'Users',
          // `crossNav: true` — same reasoning as buildUserNode's Properties
          // tab above (these two mutually cross-reference each other) —
          // prevents the breadcrumb from accumulating a click-history log
          // across repeated back-and-forth navigation.
          content: {
            type: 'records',
            names: SAMPLE_USERS,
            detailNode: () => buildUserNode(showProperties),
            crossNav: true,
          },
        },
      ],
    },
  };
}

// My account — reached via the rail's user avatar, not a rail item itself
// (getRailItems is unaffected). Unlike buildPropertyNode/buildUserNode, this
// isn't one tabs node — Profile and Security are separate top-level panel
// items (flat list, like Configuration's), so Support code and Logout can
// sit alongside them in the same L2 list as plain action rows rather than
// being folded into a tab strip. Deliberately left open to grow — a further
// destination (e.g. Notifications, Sessions) is a one-line addition here,
// not a restructure.
const MY_ACCOUNT_ITEMS = [
  {
    key: 'profile',
    label: 'Profile',
    active: true,
    content: {
      type: 'sketch',
      sketch: 'sections',
      sections: [
        { title: 'Name', shape: 'field' },
        { title: 'Contact', shape: 'cols' },
        { title: 'Preferred language', shape: 'field' },
      ],
    },
  },
  {
    key: 'security',
    label: 'Security',
    content: {
      type: 'sketch',
      sketch: 'sections',
      sections: [
        { title: 'Multi-factor authentication', shape: 'field' },
        { title: 'Passkeys', shape: 'field' },
        { title: 'Password', shape: 'field' },
      ],
    },
  },
  // Action rows (PATTERNS.md's third panel-list pattern, alongside folder/
  // heading) — plain-clickable but visually distinct from the destinations
  // above via actionIcon, same treatment as Configuration's "Add products".
  // Neither has real content — clicking through isn't the point of a
  // wireframe stub for a sign-out/support-code action.
  {
    key: 'support-code',
    label: 'Support code',
    actionIcon: '?',
    content: null,
  },
  {
    key: 'logout',
    label: 'Logout',
    actionIcon: '⏻',
    content: null,
  },
];

// A single custom dashboard/chart's own content — every custom dashboard
// (whether a plain "Dashboards"/"Charts" list entry or a starred/promoted
// top-level item) opens the SAME shared detail node, per the generic
// `records` pattern (PATTERNS.md) — "the custom dashboards would use the
// same skeleton" (user's direction, confirmed easy to treat them all the
// same rather than special-casing just the starred ones). Titleless
// dashboard-cards grid, same as Insights' own Dashboard — indicates page
// shape only, no real card content.
export const CUSTOM_DASHBOARD_NODE = {
  key: 'custom-dashboard',
  label: 'Dashboard',
  content: {
    type: 'sketch',
    sketch: 'dashboard-cards',
    cards: [{ shape: 'stat' }, { shape: 'chart' }, { shape: 'chart' }, { shape: 'stat' }],
  },
};

// EXPLORATORY — sample custom-dashboard names for the generic `records`
// pattern, same treatment as SAMPLE_PROPERTIES/SAMPLE_USERS. "Weekly
// performance", "Portfolio health", and "Channel comparison" are included
// here (not just as standalone promoted top-level items) so the
// illustrative star on these specific rows visually lines up with their
// promoted duplicates — same names in both places, not just the same
// concept. All three are DASHBOARDS, not charts — you can't pin/promote a
// single chart on its own (user's explicit correction), only a whole
// dashboard, so Charts has no starring concept at all.
const SAMPLE_DASHBOARDS = ['Weekly performance', 'Channel comparison', 'Occupancy overview', 'Portfolio health', 'Revenue trends'];
const SAMPLE_CHARTS = ['ADR by channel', 'Length of stay', 'Cancellation rate'];

// EXPLORATORY — sample rate plan / yield rule names for the generic
// `records` pattern (Distribution batch, items 1/2 — "go deep" per user).
// Generic realistic names, not real confirmed data.
const SAMPLE_RATE_PLANS = ['Standard Rate', 'Non-Refundable', 'Advance Purchase', 'Long Stay'];
const SAMPLE_YIELD_RULES = ['Weekend surcharge', 'Last-minute discount', 'Length-of-stay discount'];

// Shared detail node every rate plan opens — a normal `tabs` node (NOT a
// standalone nav-dashboard — Rate plans doesn't need the extra nav LEVEL
// after all, per the user's own reversal: "rate plans don't need the extra
// level"). Instead, nav-dashboard (6th canonical page-skeleton type — see
// CONTEXT.md/PATTERNS.md) is nested INSIDE the default "Overview" tab as
// that tab's own content — the tab strip stays, tiles are a richer, status-
// aware entry point into the SAME sibling tabs, not a replacement for them.
// Each tile uses `linksToTab` (a sibling tab's key) instead of its own
// content — clicking one just switches the active tab (confirmed
// explicitly: "switches the tab... matches how a normal tab click already
// works"), no new path level, tab strip stays visible throughout.
// `tip` is left unset everywhere for now (renders as a skeleton bar) — the
// user's direction ("provide real time tips on what is not set up") is
// about the tile's SHAPE being able to carry a status string, not live data
// existing yet. Properties tab/tile only for MP/multi-property accounts,
// same `showProperties` gating buildUserNode's own "Properties" tab uses.
function buildRatePlanNode(showProperties) {
  return {
    key: 'rate-plan',
    label: 'Rate plan',
    content: {
      type: 'tabs',
      tabs: [
        {
          key: 'overview',
          label: 'Overview',
          active: true,
          content: {
            type: 'nav-dashboard',
            // "top strip we currently have is configuration, can have a
            // title" — the tile grid itself is unchanged (still fully
            // routable), just labeled now.
            title: 'Configuration',
            tiles: [
              { key: 'rooms-tile', label: 'Rooms', linksToTab: 'rooms' },
              { key: 'channels-tile', label: 'Channels', linksToTab: 'channels' },
              { key: 'connectivities-tile', label: 'Connectivities', linksToTab: 'connectivities' },
              ...(showProperties ? [{ key: 'properties-tile', label: 'Properties', linksToTab: 'properties' }] : []),
            ],
            // Two purely decorative sections stacked below the tile grid —
            // never navigable, rendered via the same renderSketch dispatcher
            // every other sketch-only leaf uses (renderNavDashboardPage in
            // main.js). "Performance": a few graph widgets (dashboard-cards,
            // chart-shaped, titleless per this project's convention).
            // "Adoption": a channel-adoption / distribution snapshot table
            // for this rate plan — skeleton concepts only for now, no real
            // headers or data decided ("we can keep it to skeleton concepts
            // for now").
            extraSections: [
              {
                title: 'Performance',
                content: {
                  type: 'sketch',
                  sketch: 'dashboard-cards',
                  cards: [{ shape: 'chart' }, { shape: 'chart' }, { shape: 'chart' }],
                },
              },
              {
                title: 'Adoption',
                // Skeleton-only grid (columns/rows as plain counts, no real
                // labels — same "just a skeleton without words" treatment
                // Inventory uses), not `sketch:'table'` (which requires
                // real confirmed header text — not the case here yet).
                content: { type: 'sketch', sketch: 'grid', columns: 4, rows: 5 },
              },
            ],
          },
        },
        { key: 'rooms', label: 'Rooms', content: { type: 'sketch', sketch: 'list' } },
        { key: 'channels', label: 'Channels', content: { type: 'sketch', sketch: 'list' } },
        { key: 'connectivities', label: 'Connectivities', content: { type: 'sketch', sketch: 'list' } },
        ...(showProperties ? [{ key: 'properties', label: 'Properties', content: { type: 'sketch', sketch: 'list' } }] : []),
      ],
    },
  };
}

// Shared detail node every yield rule opens — same "start simple" treatment.
const YIELD_RULE_NODE = {
  key: 'yield-rule',
  label: 'Yield rule',
  content: { type: 'sketch', sketch: 'sections', sections: [{ title: 'Yield rule', shape: 'field' }] },
};

// Default: one connected system — 'systems' content collapses straight to
// its sections, no system list.
export const DEFAULT_SYSTEMS = ['Opera ADS'];

// Applies to every property (single- or multi-property) when the hidden
// settings sheet's "Integrated systems" toggle is set to "Multiple systems".
export const MULTIPLE_SYSTEMS = ['Opera ADS', 'RMS Cloud'];

// Direct Booking's sublist — same across single- and multi-property.
const BOOKING_ENGINE_LIST = {
  type: 'list',
  items: [
    {
      key: 'selling-tools',
      label: 'Selling tools',
      active: true,
      content: {
        type: 'tabs',
        tabs: [
          {
            key: 'promotions',
            label: 'Promotions',
            active: true,
            content: { type: 'sketch', sketch: 'sections', sections: [{ title: 'Promotions', shape: 'list' }] },
          },
          {
            key: 'extras',
            label: 'Extras',
            content: { type: 'sketch', sketch: 'sections', sections: [{ title: 'Extras', shape: 'list' }] },
          },
        ],
      },
    },
    {
      key: 'setup',
      label: 'Setup',
      content: {
        type: 'tabs',
        tabs: [
          {
            key: 'booking-rules',
            label: 'Booking rules',
            content: { type: 'sketch', sketch: 'sections', sections: [{ title: 'Booking rules', shape: 'field' }] },
          },
          {
            key: 'guest-details',
            label: 'Guest details',
            content: { type: 'sketch', sketch: 'sections', sections: [{ title: 'Guest details', shape: 'field' }] },
          },
          {
            key: 'email-settings',
            label: 'Email settings',
            content: { type: 'sketch', sketch: 'sections', sections: [{ title: 'Email settings', shape: 'field' }] },
          },
          {
            key: 'translations',
            label: 'Translations',
            content: { type: 'sketch', sketch: 'sections', sections: [{ title: 'Translations', shape: 'field' }] },
          },
          {
            key: 'about-page',
            label: 'About page',
            content: { type: 'sketch', sketch: 'sections', sections: [{ title: 'About page', shape: 'field' }] },
          },
          {
            key: 'contact-page',
            label: 'Contact page',
            content: { type: 'sketch', sketch: 'sections', sections: [{ title: 'Property location', shape: 'field' }] },
          },
          {
            key: 'policies-page',
            label: 'Policies page',
            content: { type: 'sketch', sketch: 'sections', sections: [{ title: 'Policies page', shape: 'field' }] },
          },
        ],
      },
    },
    { key: 'branding', label: 'Branding', content: null },
    { key: 'website', label: 'Website', content: null },
  ],
};

// Pay's sublist — SPLIT from production's current single flat "Payments"
// tab (Payments/Transactions/Payouts/Virtual terminal/Invoices/Automated
// payments/Payment requests/Accepted payments/Taxes/Service charges, all
// stacked under one top-level nav item), per the user's own principle:
// "the low-touch setup stuff lives under Config → Pay, but anything more
// transactional goes elsewhere - likely under either distribution or
// transactions." REVISED once the initial flat split looked messy in
// practice (caught live via screenshot: "this has ended up a bit messy -
// is this what you intended?") — the user then reclassified specifically:
// "I think [virtual] terminal, accepted payments, taxes and service charges
// are all config stuff. The rest can be tabs underneath an L2 maybe called
// Payments." Virtual terminal moved HERE from Transactions (it was
// originally, incorrectly, grouped with the transactional items). Explicit
// caveat from the user: "this is a product area I know little about so we
// are really just roughing it in" — don't treat this split as confirmed
// business logic, it's a rough first pass. The production "Payments" status/
// enablement page itself was DROPPED entirely (not just moved) — "it's just
// a stub to hold an upsell page in the current state," not a real settings
// destination worth modeling as a peer alongside these. Folder sublist
// (same pattern as BOOKING_ENGINE_LIST above) — none of these 4 have
// confirmed internal sub-structure yet, so all stay simple leaf stubs for
// now.
const PAY_LIST = {
  type: 'list',
  items: [
    // "Payments" (the status/enablement banner — "SiteMinder Payments is
    // enabled", bullet points, external doc links) REMOVED — user: "it's
    // just a stub to hold an upsell page in the current state," not a real
    // settings destination worth modeling as a peer alongside these.
    { key: 'automated-payments', label: 'Automated payments', active: true, content: null },
    { key: 'virtual-terminal-config', label: 'Virtual terminal', content: null },
    { key: 'accepted-payments', label: 'Accepted payments', content: null },
    { key: 'taxes', label: 'Taxes', content: null },
    { key: 'service-charges', label: 'Service charges', content: null },
  ],
};

// Distribution's Health check — CHANGE-QUEUE.md Distribution batch item 3:
// SIMPLIFIED from a 7-tab structure (Failed PMS deliveries, Delayed
// updates, Disabled channels, Channels awaiting connection setup, Mapping
// errors, Disabled channel rates, Distribution and system status — real
// confirmed names, previously each its own tab) to ONE dashboard-cards
// page. Confirmed GENERIC/titleless (user: "health check is supposed to be
// generic - no labels") — same treatment as Insights' own Dashboard, even
// though these 7 areas ARE real confirmed names; the page itself is meant
// to read as a generic status-dashboard shape, not display them. No more
// tab strip for Health check. Separate from and unrelated to "Channels"
// (a different Configuration item) — don't let one inform the other.
const HEALTH_CHECK_ITEM = {
  key: 'health-check',
  label: 'Health check',
  content: {
    type: 'sketch',
    sketch: 'dashboard-cards',
    cards: [
      { shape: 'stat' },
      { shape: 'stat' },
      { shape: 'stat' },
      { shape: 'stat' },
      { shape: 'stat' },
      { shape: 'stat' },
      { shape: 'stat' },
    ],
  },
};

// EXPLORATORY — sample data for the property/cluster/brand scope switcher
// sketch (Insights, Health check once built). Not a confirmed decision —
// see CHANGE-QUEUE.md's "Foundational, unsolved" section: this whole
// switcher concept is still being worked through, Distribution's shape is
// unsolved, and this sketch is expected to change once that's resolved.
export const SCOPE_PROPERTIES = SAMPLE_PROPERTIES;
export const SCOPE_BRANDS = ['Coastal Collection', 'Heritage Stays'];
export const SCOPE_CLUSTERS = ['East Coast', 'West Coast', 'Inland'];

// The Properties section (Configuration's first item) is shown whenever
// accountType === 'MP' OR propertyCount === 'multiple' — either condition on
// its own is sufficient (an MP account with just one property still gets it;
// a non-MP account with many properties also gets it). When neither is true,
// Configuration's first item collapses to a plain "Property settings" —
// the "one IA, not two" property-scope-collapses decision.
//
// Properties/Brands/Clusters are TABS (not a panel sublist) inside the
// "Properties" item — Brands and Clusters are gated further, MP only
// (mpOnly: true), filtered out of the tab strip unless accountType==='MP'.
function buildConfigurationPropertiesItem(showProperties) {
  if (!showProperties) {
    // Renamed from "Property settings" to "Property" (CHANGE-QUEUE.md item
    // 1) — scoped to just this panel item's label; buildPropertyNode itself
    // (the shared nav-dashboard shown once drilled into a specific property)
    // keeps its own label/key unchanged.
    return { key: 'property-settings', label: 'Property', active: true, content: buildPropertyNode(showProperties).content };
  }
  return {
    key: 'properties-config',
    label: 'Properties',
    active: true,
    content: {
      type: 'tabs',
      tabs: [
        {
          key: 'properties-list',
          label: 'Properties',
          active: true,
          content: { type: 'records', names: SAMPLE_PROPERTIES, detailNode: buildPropertyNode(showProperties) },
        },
        { key: 'brands', label: 'Brands', content: null, mpOnly: true },
        { key: 'clusters', label: 'Clusters', content: null, mpOnly: true },
      ],
    },
  };
}

// Every panel item is a real Node (key, label, content) — no more plain
// {label, active} objects. A leaf item with nothing to click into (e.g.
// "Inventory") is still a Node, just with content: null.
function buildSmContentTree(showProperties) {
  return {
    insights: {
      // "My insights" (CHANGE-QUEUE.md item 8) REPLACES the old informal
      // flat `ugc` array. It's a FOLDER (per the folder-vs-heading rule —
      // collapsed by default, chevron, children hidden until expanded),
      // containing Dashboards and Charts — both clickable `records`
      // pickers (the generic pattern Properties/Users use), each name
      // opening CUSTOM_DASHBOARD_NODE's shared titleless dashboard-cards
      // content. Starring is illustrative/non-functional — a couple of
      // custom dashboards are duplicated as their own starred top-level
      // entries (simplest approach for a static wireframe, since this
      // isn't a real interaction — see CHANGE-QUEUE.md item 8's structural
      // note). Which ones are "starred" is arbitrary illustration, not
      // meaningful data.
      //
      // Order (CHANGE-QUEUE.md item 2, reshuffled): Dashboard, then the
      // starred/pinned items appended directly below it (forming one
      // combined default-dashboards list), then My insights, then
      // Recommendations LAST — a separate concept from dashboards, per
      // user's reasoning, so it no longer sits second.
      items: [
        {
          key: 'dashboard',
          label: 'Dashboard',
          active: true,
          // Dashboard card grid (PATTERNS.md) — confirmed with user: NO
          // titles at all, even confirmed ones — a mix of real + skeleton
          // titles reads oddly ("gets weird"), and this is meant to read
          // as a full page of cards, not one confirmed metric. Every card
          // is titleless (skeleton title bar, sized larger per user's
          // "full page of titles, make them larger" direction) — shape
          // only, not real content.
          content: {
            type: 'sketch',
            sketch: 'dashboard-cards',
            cards: [{ shape: 'stat' }, { shape: 'chart' }, { shape: 'chart' }, { shape: 'stat' }, { shape: 'chart' }, { shape: 'stat' }],
          },
        },
        // Promoted/starred items — illustrative duplicates of a couple of
        // My insights' starred rows below, surfaced at the top level,
        // directly appended after Dashboard. Each opens the same
        // CUSTOM_DASHBOARD_NODE content every custom dashboard/chart uses
        // ("the custom dashboards would use the same skeleton" — user's
        // direction) — same titleless dashboard-cards grid, not a
        // Dashboards-list drill-down (these are standalone top-level
        // items, not literally the same node reached two ways).
        { key: 'starred-dashboard-1', label: 'Weekly performance', content: CUSTOM_DASHBOARD_NODE.content, starred: true },
        { key: 'starred-dashboard-2', label: 'Channel comparison', content: CUSTOM_DASHBOARD_NODE.content, starred: true },
        ...(showProperties
          ? [{ key: 'starred-dashboard-3', label: 'Portfolio health', content: CUSTOM_DASHBOARD_NODE.content, starred: true }]
          : []),
        {
          key: 'my-insights',
          label: 'My insights',
          content: {
            type: 'list',
            items: [
              // "Dashboards"/"Charts" are clickable records lists (same
              // generic pattern as Properties/Users) — each name opens
              // CUSTOM_DASHBOARD_NODE's shared titleless dashboard-cards
              // content. Real item names shown (the breadcrumb-clarity
              // exception, PATTERNS.md), same as Properties/Users pickers.
              {
                key: 'dashboards',
                label: 'Dashboards',
                content: {
                  type: 'records',
                  names: SAMPLE_DASHBOARDS,
                  detailNode: CUSTOM_DASHBOARD_NODE,
                  starredNames: showProperties
                    ? ['Weekly performance', 'Channel comparison', 'Portfolio health']
                    : ['Weekly performance', 'Channel comparison'],
                },
              },
              // No starredNames — you can't pin/promote a single chart on
              // its own (user's explicit correction), only a whole
              // dashboard, so Charts has no starring concept at all.
              {
                key: 'charts',
                label: 'Charts',
                content: { type: 'records', names: SAMPLE_CHARTS, detailNode: CUSTOM_DASHBOARD_NODE },
              },
            ],
          },
        },
        // "Recommendations" is a list page (per user's direction), same
        // as the other stub list-shaped items (Users, Health check's
        // tabs) — sketch:'list' rather than content: null.
        { key: 'recommendations', label: 'Recommendations', content: { type: 'sketch', sketch: 'list' } },
      ],
      // EXPLORATORY sketch flag — see CHANGE-QUEUE.md "Foundational, unsolved"
      // section. Only Insights and (once built) Health check carry this;
      // Configuration/Distribution/Transactions deliberately don't yet.
      scopeSwitcher: showProperties,
    },
    distribution: {
      items: [
        // Skeleton-only grid (Distribution batch item 4) — "just a
        // skeleton without words" (confirmed by user): a plain column
        // count + row count, no real labels at all — shape only, nothing
        // about Inventory's real columns/rows is decided yet.
        {
          key: 'inventory',
          label: 'Inventory',
          active: true,
          content: { type: 'sketch', sketch: 'grid', columns: 7, rows: 6 },
        },
        // Clickable `records` list (Distribution batch item 1 — "go
        // deep"), same generic pattern as Properties/Users/Dashboards.
        // `display: 'table'` (new): renders as a table-styled skeleton
        // instead of a plain list — user's direction: "let's make it a
        // table skeleton - but show clickable names just like the current
        // list." `detailNode` is now a nav-dashboard (see
        // buildRatePlanNode) — the first case this new page type was built
        // against.
        {
          key: 'rate-plans',
          label: 'Rate plans',
          content: {
            type: 'records',
            names: SAMPLE_RATE_PLANS,
            display: 'table',
            detailNode: buildRatePlanNode(showProperties),
          },
        },
        // Same pattern (item 2), own shared detail node.
        {
          key: 'yield-rules',
          label: 'Yield rules',
          content: { type: 'records', names: SAMPLE_YIELD_RULES, detailNode: YIELD_RULE_NODE },
        },
        // Calendar-style grid (user: "dynamic pricing is a grid as well -
        // can use the LH calendar style") — same 7-weekday-column, 5-row
        // shape Front desk's calendar uses, but embedded in a NORMAL
        // Distribution page (L2 panel stays visible), not full-width/
        // noPanel like Front desk's own usage.
        { key: 'dynamic-pricing', label: 'Dynamic pricing', content: { type: 'sketch', sketch: 'calendar' } },
        // Distribution's "Properties" item REMOVED (CHANGE-QUEUE.md
        // Distribution batch item 5) — user flagged, on reflection, they
        // weren't sure why Distribution needed its own Properties concept
        // separate from Configuration's, and asked to remove it while they
        // work through the underlying design question themselves. See
        // IA-BY-USER-TYPE.md's SM-multiple-properties section for the open
        // question. Do NOT reintroduce this without that being resolved —
        // Configuration's own Properties item is unrelated and unaffected.
        HEALTH_CHECK_ITEM,
      ],
      // EXPLORATORY sketch flag — see CHANGE-QUEUE.md "Foundational, unsolved"
      // section. Visual sketch only: showing the switcher present throughout
      // Distribution does NOT resolve how it interacts with Distribution's
      // bulk rate distribution tension — that's still flagged as the hard,
      // unsolved case, this just makes the shape visible to react to.
      scopeSwitcher: showProperties,
    },
    transactions: {
      items: [
        // sketch:'list' (CHANGE-QUEUE.md item 7) — a plain list, NOT the
        // clickable `records` pattern (unlike Rate plans/Yield rules).
        { key: 'reservations', label: 'Reservations', active: true, content: { type: 'sketch', sketch: 'list' } },
        { key: 'guest-communications', label: 'Guest communications', content: null },
        // "Payments" — the TRANSACTIONAL half of Pay's IA split (the other
        // half, low-touch setup, lives under Config → Pay, see PAY_LIST).
        // REVISED from an earlier version that flattened these into 4
        // separate top-level L2 items alongside Transactions itself — the
        // user caught that as messy ("this has ended up a bit messy - is
        // this what you intended?"). Now ONE L2 entry, tabs inside it:
        // "I think [virtual] terminal, accepted payments, taxes and service
        // charges are all config stuff. The rest can be tabs underneath an
        // L2 maybe called Payments." Explicit caveat: "this is a product
        // area I know little about so we are really just roughing it in" —
        // don't treat this grouping as confirmed, it's a rough first pass.
        // The rail SECTION itself is also literally called "Transactions"
        // (credit-card icon) — a separate open naming question, see
        // CONTEXT.md.
        {
          key: 'payments',
          label: 'Payments',
          content: {
            type: 'tabs',
            tabs: [
              { key: 'transactions-tab', label: 'Transactions', active: true, content: { type: 'sketch', sketch: 'list' } },
              { key: 'payouts', label: 'Payouts', content: { type: 'sketch', sketch: 'list' } },
              { key: 'invoices', label: 'Invoices', content: { type: 'sketch', sketch: 'list' } },
              { key: 'payment-requests', label: 'Payment requests', content: { type: 'sketch', sketch: 'list' } },
              // Home for "scheduled and failed automated payments" — user's
              // own framing, a real gap noticed after Automated payments'
              // RULES were placed under Config → Pay (PAY_LIST) but the
              // actual scheduled/failed payment ACTIVITY those rules
              // produce had nowhere to live. Confirmed: transactional, not
              // config-adjacent — belongs here, not nested under Config →
              // Pay → Automated payments. One combined tab (not separate
              // Scheduled/Failed tabs) — status would be a column in this
              // list, not a page split.
              { key: 'automated-payments-tab', label: 'Automated payments', content: { type: 'sketch', sketch: 'list' } },
            ],
          },
        },
      ],
    },
    configuration: {
      items: [
        buildConfigurationPropertiesItem(showProperties),
        // Clickable, using the generic `records` pattern — same mechanism
        // Properties uses (CHANGE-QUEUE.md item 3), not a Users-specific
        // one. Each user opens buildUserNode's shared detail tabs.
        {
          key: 'users',
          label: 'Users',
          content: { type: 'records', names: SAMPLE_USERS, detailNode: buildUserNode(showProperties) },
        },
        // Channels sits ABOVE the Products heading, not inside it — user's
        // explicit reasoning: "its core functionality for all customers not
        // an add-on" (CHANGE-QUEUE.md item 9). Content/page-type TBD.
        { key: 'channels', label: 'Channels', content: null },
        // "Products" — a grouping HEADING (see PATTERNS.md's folder-vs-
        // heading rule), not a folder: always-expanded, no chevron, purely
        // clusters the already-visible items below it under one label.
        { heading: true, label: 'Products' },
        { key: 'direct-booking', label: 'Direct Booking', content: BOOKING_ENGINE_LIST },
        { key: 'channels-plus', label: 'Channels Plus', content: null },
        { key: 'metasearch', label: 'Metasearch', content: null },
        // NEW — stub for now (content: null), no shape decided yet.
        { key: 'pay', label: 'Pay', content: PAY_LIST },
        // Renamed from "Manage products" (CHANGE-QUEUE.md item 6) — "Add
        // products" more precisely signals its action (add a NEW product
        // to the account) vs. the settings-page items above it. `actionIcon`
        // marks it as an ACTION ROW, a third panel-list pattern alongside
        // folder/heading (PATTERNS.md) — plain clickable like Direct
        // Booking/Channels Plus, just with a leading icon distinguishing
        // "does something" from "navigates to a settings page."
        { key: 'manage-products', label: 'Add products', content: null, actionIcon: '+' },
      ],
    },
  };
}

// Two independent settings axes control what renders:
//   - accountType: 'SM' | 'LH' | 'MP' — MP reuses SM's structure (per
//     decision) but always shows Properties. LH ALSO reuses SM's structure
//     unchanged (CHANGE-QUEUE.md item 5 — LH gets full parity with SM);
//     LH's only account-type-specific difference is the extra "Front desk"
//     rail item (see getRailItems), not different Insights/Distribution/
//     Transactions/Configuration content. If real LH-specific content
//     differences are confirmed later, add them here explicitly — don't
//     let this comment go stale.
//   - propertyCount: 'single' | 'multiple' — independent of account type;
//     also drives Properties, alongside accountType === 'MP'.
export function getContent(accountType, propertyCount) {
  const showProperties = accountType === 'MP' || propertyCount === 'multiple';
  const tree = buildSmContentTree(showProperties);
  // My account — not a rail section (getRailItems is unaffected), reached
  // via the rail's user avatar instead. Same regardless of account type/
  // property count, so it's added here rather than inside
  // buildSmContentTree.
  tree['my-account'] = { items: MY_ACCOUNT_ITEMS };
  if (accountType === 'LH') {
    // Front desk (CHANGE-QUEUE.md item 1) — LH's own rail item (see
    // getRailItems). `noPanel: true` tells render() to hide the L2 panel
    // column entirely, not just render it empty — the calendar needs the
    // FULL canvas+panel width, "what customers always want for the
    // calendar is max space" (user's stated reason, a confirmed product
    // need). No secondary panel item at all, just one routed root whose
    // content is the calendar sketch.
    tree['front-desk'] = {
      noPanel: true,
      items: [{ key: 'calendar', label: 'Calendar', active: true, content: { type: 'sketch', sketch: 'calendar' } }],
    };
  }
  return tree;
}
