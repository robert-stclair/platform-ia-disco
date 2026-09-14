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
//     | { type: 'records', names: string[], detailNode: Node | (() => Node), display?: 'table', tableColumns?: number, crossNav?: boolean, homeItemKey?: string, showSnippet?: boolean }
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
//                                                table)               buildRatePlanNode() — tabs
//                                                                    (Overview/Rooms/Channels/
//                                                                    Integrated systems), no Properties tab
//                                                                    (GRP-entity-only concept, not a plain
//                                                                    rate plan's). Overview tab holds a
//                                                                    nav-dashboard (mode b, nested-in-a-tab —
//                                                                    see PATTERNS.md); tiles use linksToTab to
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
  // Renamed from "Transactions" — CONTEXT.md logged this rail section's own
  // name as an open thread ("we might need to think of a better rail
  // section name... not sure what it is") after the user reached for
  // "Transactions" as a name for something NEW mid-conversation before
  // recalling this section already existed — a sign the old name wasn't
  // sticking in the mental model. "Operations" is the chosen replacement —
  // covers Reservations/Guest communications/Payments as the day-to-day
  // running of a property, not just its payment-transaction content (which
  // is only one of the three L2 items here). `key`/tree property renamed
  // to match (`operations`, not `transactions`) rather than leaving an
  // internal key that no longer matches its visible label.
  { key: 'operations', label: 'Operations', icon: 'operations' },
  { key: 'configuration', label: 'Configuration', icon: 'configuration' },
];

// The 4 "Add-on" products (Confluence "IA node tree v2" — Direct Booking/
// Channels Plus/Metasearch/Pay are tagged Add-on: "a section that only
// exists in the IA for accounts that have signed up for that product").
// Keys match Configuration's own product item keys exactly — see
// buildSmContentTree's configuration.items below.
export const PRODUCT_KEYS = ['direct-booking', 'channels-plus', 'metasearch', 'pay'];

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
                // `scopeSwitcher: 'multi-select'` (Confluence "IA node tree
                // v2" — a user's own Properties tab), TAB-LEVEL, not on the
                // whole Users item — "User details" doesn't need a
                // switcher, only this one tab does. renderCanvas resolves
                // scopeSwitcherMode from the deepest chain step that sets
                // one, falling back up to the root item — see its own
                // comment for why this needed a small mechanism change
                // (previously scopeSwitcher only existed at the top-level
                // routed item, never inside a nested tabs strip).
                scopeSwitcher: 'multi-select',
                content: {
                  type: 'records',
                  names: SAMPLE_PROPERTIES,
                  detailNode: () => buildPropertyNode(showProperties),
                  // `syncsScope: true` — clicking a property here acts as a
                  // proxy click on the global scope switcher itself (see
                  // wirePathLinks), not just a page navigation. Robert:
                  // "its like a proxy click on the switcher when clicking
                  // property on the page."
                  syncsScope: true,
                  // Cross-navigation, not a deeper drill-down — this picker
                  // and buildPropertyNode's own "Users" tile point at EACH
                  // OTHER, so following one from the other must not keep
                  // accumulating breadcrumb depth (caught live: "Users /
                  // Jane Smith / Properties / Harbourview Hotel / Users /
                  // Jane Smith" — a click-history log, not a hierarchy
                  // position). See renderChainBody's `crossNav` handling.
                  crossNav: true,
                  // Which rail L2 item this cross-nav's DESTINATION
                  // (buildPropertyNode) conceptually belongs to — used to
                  // fix the rail highlight once cross-navigated (caught
                  // live: rail kept showing "Users" even after following
                  // this picker into a property's own page). Matches
                  // buildConfigurationPropertiesItem's own key exactly —
                  // varies by showProperties, same as that function's
                  // branching.
                  homeItemKey: showProperties ? 'properties-config' : 'property-settings',
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
// General information/Services/Policies), Room types and Media library
// (property-scoped concepts, not sub-pages of Property details — see
// CONTEXT.md's "Confirmed principle: what promotes a Config tile to the
// property's top level"), Channels (best-guess sketch:'list' stub, not
// confirmed business logic), Integrated systems (moved to the TOP level per
// the user's explicit direction — "users and integrated systems move to the
// top level" — rather than folding under Property details with the rest;
// Connectivities was folded INTO this tile — same concept, different name
// by account type, MP: Connectivities / Platform: Integrated systems — so
// there's no separate Connectivities tile here), and Users (multi-property
// accounts only — see the tile's own comment below for why).
//
// Room types and Media library are tiles here for EVERY account type,
// including single-property, even though single-property's
// `buildConfigurationPropertiesItem` reuses this content DIRECTLY as the
// flat Config → Property L2 page (no separate properties-list level to
// drill through first). A single-property-only flattened variant WAS
// tried and explicitly reverted — the card grid is the richer surface
// specifically because it's the vehicle for `tile.tip` contextual
// nudges ("2 required fields missing," etc.); a flat rail item can't
// carry that. Consistency of page SHAPE across account types (nav-
// dashboard's whole reason for existing — "one IA, not two," same page
// reached at two different depths) also argued against diverging here.
// Don't re-flatten this for single-property without picking this
// reasoning back up — see CONTEXT.md's confirmed-principle writeup for
// the full back-and-forth.
// `showProperties` is needed here (function, not a plain const) both to
// gate the Users tile itself and so it can correctly build
// buildUserNode(showProperties) when shown. See buildUserNode above for the
// other half of this circular reference.
function buildPropertyNode(showProperties) {
  return {
    key: 'property',
    label: 'Property settings',
    // `scopeSwitcher: 'multi-select'` — genuinely useful here now, not
    // stale: clicking a property name anywhere (`syncsScope`, see
    // wirePathLinks) acts as a proxy click on the switcher itself,
    // setting the real global state.scope to that property. So by the
    // time you're on this page, the switcher already correctly shows
    // where you are — and, being live, lets you jump straight to a
    // DIFFERENT property from here without navigating back to the list
    // first (Robert: "the switcher stays active since its actually
    // useful"). Earlier attempts (hide entirely, then a disabled
    // force-current lock) were both dropped once the proxy-click idea
    // made the switcher's value trustworthy on this page.
    scopeSwitcher: 'multi-select',
    content: {
      type: 'nav-dashboard',
      tiles: [
        {
          key: 'property-details',
          label: 'Property details',
          content: PROPERTY_DETAILS_NODE.content,
          stat: '6 sections complete',
          tip: '2 required fields missing',
        },
        {
          key: 'room-types',
          label: 'Room types',
          content: { type: 'sketch', sketch: 'list' },
          stat: '4 room types',
          tip: '1 missing media',
        },
        { key: 'media-library', label: 'Media library', content: { type: 'sketch', sketch: 'media' }, stat: '7 photos uploaded' },
        {
          key: 'channels',
          label: 'Channels',
          content: { type: 'sketch', sketch: 'list' },
          stat: '5 channels connected, 2 awaiting setup',
        },
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
          stat: '0 systems connected',
        },
        // Mirror of buildUserNode's "Properties" tab (CHANGE-QUEUE.md item
        // 5) — which users have access to THIS property. Now gated on
        // `showProperties` (multi-property only) — for a single-property
        // account there's no "which users have access to THIS property"
        // question distinct from "which users are on the account," so the
        // tile would be a redundant duplicate of Config > Users. Same gate
        // buildUserNode already applies to its own "Properties" tab, just
        // mirrored onto this side of the circular reference. Real `records`
        // picker (SAMPLE_USERS, detailNode: a THUNK, () =>
        // buildUserNode(showProperties)), same self-consistency request as
        // buildUserNode's own Properties tab above — clicking a user here
        // opens their real buildUserNode page. MUST be a thunk, not a direct
        // call — see buildUserNode's own comment above for why (the actual
        // RangeError this caused).
        ...(showProperties
          ? [
              {
                key: 'property-users',
                label: 'Users',
                // `crossNav: true` — same reasoning as buildUserNode's
                // Properties tab above (these two mutually cross-reference
                // each other) — prevents the breadcrumb from accumulating a
                // click-history log across repeated back-and-forth
                // navigation.
                content: {
                  type: 'records',
                  names: SAMPLE_USERS,
                  detailNode: () => buildUserNode(showProperties),
                  crossNav: true,
                  // See buildUserNode's "Properties" tab (mirror case) for
                  // why this exists — Users is always a flat top-level rail
                  // item regardless of account type, so this one never
                  // varies the way Property's key does.
                  homeItemKey: 'users',
                },
                statCount: SAMPLE_USERS.length,
                statUnitKey: 'users',
              },
            ]
          : []),
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
  // "Communication" — comms/notification-channel preferences (which
  // updates arrive by email/SMS/push etc.), NOT the same concept as the
  // new notifications bell (rail-level, an inbox of what's actually
  // happened) — kept a distinct label/word from "Notifications" so the
  // two aren't confused with each other.
  {
    key: 'communication',
    label: 'Communication',
    content: {
      type: 'sketch',
      sketch: 'sections',
      sections: [
        { title: 'Email notifications', shape: 'field' },
        { title: 'SMS notifications', shape: 'field' },
      ],
    },
  },
  // "Preferences" — general app-level settings. Contains this prototype's
  // FIRST genuinely live (non-skeleton) control — the theme toggle, MOVED
  // here from the hidden prototype settings sheet (user: "move your colour
  // theme from the proto overlay into there") rather than duplicated —
  // it's a real product-level preference, not a prototype-only demo
  // toggle like account type/property count, so it doesn't belong hidden
  // behind the `~` overlay alongside those. `shape: 'theme-toggle'` is a
  // NEW section shape specifically for this — every other section shape
  // is decorative skeleton only; this one is deliberately real, wired the
  // same way (`data-theme-choice`) the settings-sheet version was, just
  // rendered inline instead of in the sheet. See renderSectionShape/
  // wireThemeToggle in main.js.
  {
    key: 'preferences',
    label: 'Preferences',
    content: {
      type: 'sketch',
      sketch: 'sections',
      sections: [{ title: 'Theme', shape: 'theme-toggle' }],
    },
  },
  // Action rows (PATTERNS.md's third panel-list pattern, alongside folder/
  // heading) — plain-clickable but visually distinct from the destinations
  // above via actionIcon, same treatment as Configuration's "Add products".
  // Neither has real content — clicking through isn't the point of a
  // wireframe stub for a sign-out/support-code action. Support code's icon
  // was retired (used to be "?") — it read too similarly to the new AI
  // assistant's circled-"?" rail icon; the plain label carries it fine on
  // its own, same as how a folder/heading item needs no icon either.
  {
    key: 'support-code',
    label: 'Support code',
    content: null,
  },
  {
    key: 'logout',
    label: 'Logout',
    actionIcon: '⏻',
    content: null,
  },
];

// Notifications — reached via the rail's own bell button (railNotifications
// in index.html), not a rail SECTION (getRailItems unaffected), same
// treatment as My account's avatar. This is the USER-ACCOUNT-FOCUSED
// notifications concept CONTEXT.md logged as a separate, lower-priority
// fourth thread alongside the Recommendations/Health check/contextual-
// recommendations three-way split — "it has become a bit of a gap this
// would solve for," now built. Distinct from all three of those (which are
// about the PROPERTY/PORTFOLIO) — this is account/session-level: "your
// password will expire," "you were mentioned," etc.
//
// Shared detail node every notification opens — same generic `records`
// pattern as Dashboards/Charts/Properties/Users (PATTERNS.md), not a
// special case. A real destination even though no live notification DATA
// exists yet — "we could wireframe a detail view even though we dont
// currently have it." Plain sections skeleton: a summary plus whatever
// else a real notification might link to (kept generic, not notification-
// type-specific, since no real notification taxonomy is confirmed yet).
// `sketch: 'message-view'` (not 'sections') — the user's explicit call:
// "make the main view totally skeleton with no words." `sections` always
// renders a real title per card (the standing "real titles, skeleton
// content" convention every other section-based page relies on) — this
// is the one canvas page that shouldn't have ANY real text on it at all,
// so it gets its own dedicated sketch value instead of special-casing
// `sections` to sometimes hide its titles. Reads as an open
// email/message: a subject+meta skeleton line, then a few body-paragraph
// skeleton lines.
export const NOTIFICATION_DETAIL_NODE = {
  key: 'notification-detail',
  label: 'Notification',
  content: { type: 'sketch', sketch: 'message-view' },
};

// EXPLORATORY — sample notification labels, same generic-realistic-names
// treatment as SAMPLE_PROPERTIES/SAMPLE_USERS/SAMPLE_DASHBOARDS. Mixed
// account-level concerns (security/billing/mentions), matching the
// "account stuff" framing from CONTEXT.md's original notifications note —
// deliberately NOT property/portfolio concerns (that's Recommendations/
// Health check/contextual recommendations' territory, not this).
const SAMPLE_NOTIFICATIONS = [
  'Your password will expire in 3 days',
  'You were added to a new property',
  'Priya Patel mentioned you in a comment',
  'Your support ticket was updated',
  'A new login was detected on your account',
];

const NOTIFICATIONS_ITEMS = {
  // `customPanel: 'records-inbox'` — a genuinely different L2 shape from
  // every other section: an EMAIL-CLIENT split, not the usual "L2 = list of
  // pages, canvas = whatever's currently selected." The notification rows
  // themselves (title + snippet) live PERMANENTLY in the L2 panel — they
  // never disappear when one is picked — and the canvas shows ONLY the
  // selected notification's own detail. "I want the summary list in the L2
  // panel, and the current message full view wireframed in the main view."
  // See renderPanel/renderCanvas in main.js for the two special-cased
  // branches this flag triggers. Not a generalizable mechanism yet — this
  // is the one section that needs it; don't reach for it elsewhere without
  // a fresh decision.
  customPanel: 'records-inbox',
  items: [
    {
      key: 'notifications-list',
      label: 'Notifications',
      active: true,
      // `showSnippet: true` — email-inbox-style rows (title + a skeleton
      // preview line stacked underneath), not the plain single-line row
      // every other `records` caller uses: "have the summaries stacked in
      // the L2 panel and the detail in the main panel - just like an email
      // browser might have it."
      content: { type: 'records', names: SAMPLE_NOTIFICATIONS, detailNode: NOTIFICATION_DETAIL_NODE, showSnippet: true },
      // `scopeSwitcher: 'multi-select'` (user: "notifications could prob
      // have the switcher as well") — added for consistency with every
      // other section, though note the tension this creates: the comment
      // above (SAMPLE_NOTIFICATIONS) frames these as ACCOUNT-level concerns
      // (password expiry, mentions, login alerts), deliberately NOT
      // property/portfolio-scoped. A property switcher implies these
      // notifications vary by property, which the current sample data
      // doesn't actually reflect — left as-is per "we can work through the
      // details later," not resolved here.
      scopeSwitcher: 'multi-select',
    },
  ],
};

// AI assistant — reached via the rail's own circled-"?" button
// (railAssistant in index.html), same treatment as Notifications/My
// account above. L2 is "chat history and controls" (user's own framing):
// a "+ New chat" action row (actionIcon pattern, same as Configuration's
// "Add products") above a flat skeleton list of past chat threads: canvas
// shows a wireframe chat-start screen (a centered prompt input, no
// message history yet) — same shape a real product's fresh-chat landing
// takes, not a specific past conversation.
//
// Past chat threads have NO real detail node (unlike Notifications above)
// — genuinely nothing decided yet about what re-opening a past chat should
// show (a full transcript? the same start screen scrolled to the bottom?)
// — so history is one plain skeleton list (sketch:'list', same shape Room
// types/Channels use elsewhere), not individually clickable `records`.
// Don't wire individual threads as navigable until that's confirmed.
const ASSISTANT_ITEMS = {
  items: [
    {
      key: 'new-chat',
      label: 'New chat',
      actionIcon: '+',
      active: true,
      content: { type: 'sketch', sketch: 'chat-start' },
      // `scopeSwitcher: 'multi-select'` (Confluence "IA node tree v2" — AI
      // assistant > New chat/History, both).
      scopeSwitcher: 'multi-select',
    },
    { key: 'chat-history', label: 'History', content: { type: 'sketch', sketch: 'list' }, scopeSwitcher: 'multi-select' },
  ],
};

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

// Rate plans at "All properties" scope (Confluence "IA node tree v2" —
// user: "for rate plans wed wnat to see more when its all properties"):
// EXPANDS into one row per property per rate plan, not just an added
// Property column on the same 4 rows. There's no Group Rate Plan/template
// layer in THIS tree (that's Distribution's separate "Group rate plans"
// MP-only node) — without one, each property's own "Standard Rate" is a
// genuinely independent object, so showing 4 names once, annotated with
// SOME property, would misrepresent the data model. Real per-property
// names generated as "{Rate plan} — {Property}" so every row gets a
// unique, distinct, clickable identity (the shared `records` mechanism
// keys off name/pathIndex — see resolveChain — so names must stay
// genuinely unique, not just visually different via an extra column).
// Single-property/single-selected-property scope stays the plain 4 names,
// unchanged.
//
// `showProperties` param (bug fix): originally checked ONLY
// `scope?.type === 'property'`, which meant an account with `propertyCount:
// 'single'` (genuinely only ONE property, period) still showed the full
// 5x-expanded table whenever the leftover global `state.scope` happened
// to be 'all' — `propertyCount` and `scope` are independent state, so
// toggling propertyCount to Single never touched scope.type. Caught live:
// Reservations (and this function) kept expanding after switching to
// Single in the debug panel. `showProperties` (accountType === 'MP' ||
// propertyCount === 'multiple') is the correct combined signal for
// "is there more than one property to even consider" — checked FIRST,
// before the scope-specific check.
function buildRatePlanNames(scope, showProperties) {
  if (!showProperties || scope?.type === 'property') return SAMPLE_RATE_PLANS;
  const properties = SCOPE_PROPERTIES;
  return SAMPLE_RATE_PLANS.flatMap((plan) => properties.map((property) => `${plan} — ${property}`));
}

// Yield rules "properties using this rule" (user: "we'd want to see a
// concept of how many properties are using a rule - so it prob becomes a
// table"): unlike Rate plans, this does NOT expand rows — one row per
// RULE stays (a yield rule is a real shared concept you'd apply across a
// portfolio, not an independent per-property object the way an unlinked
// rate plan is). Real count only, not interactive (confirmed) — no
// per-property breakdown/expansion yet. Deterministic per rule name (not
// random) so re-renders don't flicker a different count for the same row.
function ratePlanUsageCount(ruleName) {
  const total = SCOPE_PROPERTIES.length;
  const seed = [...ruleName].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return 1 + (seed % total); // 1..total, never 0 — a defined rule is always in use somewhere
}

// EXPLORATORY — sample GRP (Group Rate Plan) template names, MP only
// (Confluence "IA node tree v2" — Distribution > Group rate plans, its own
// object, outside switcher scope: "not applicable — own object"). Generic
// realistic names, not real confirmed data.
const SAMPLE_GROUP_RATE_PLANS = ['GRP Summer Template', 'GRP Corporate Template'];

// A GRP's per-property sync status (Confluence v1b's fuller vocabulary:
// synced/diverged/unlinked/deleted/error — v2's tree simplifies display to
// "synced"/"diverged" as the two illustrative examples, but the full set
// is the real vocabulary). Deterministic per (grpName, propertyName) pair,
// same seeded-hash approach as ratePlanUsageCount, so re-renders don't
// flicker a different status for the same row. `grpName` stays a real
// param even though every GRP currently opens the SAME shared detail node
// (buildGroupRatePlanNode has no per-name variant yet, same convention as
// buildRatePlanNode/YIELD_RULE_NODE) — keeps this ready if a genuinely
// per-GRP breakdown is wanted later, without a signature change then.
const GRP_SYNC_STATUSES = ['Synced', 'Diverged', 'Unlinked', 'Deleted', 'Error'];
function groupRatePlanSyncStatus(grpName, propertyName) {
  const seed = [...`${grpName}:${propertyName}`].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return GRP_SYNC_STATUSES[seed % GRP_SYNC_STATUSES.length];
}

// Distribution's actual channel universe — deliberately ONE list, no
// categorical split between OTAs and SiteMinder's own products: "crucially
// that list included direct booking and channels plus as well as otas."
// Used both as a rate plan's currently-CONNECTED channels (a subset, see
// `RATE_PLAN_CHANNELS` below) and as the full picker list the "Add channel"
// wizard offers (anything not already connected). Generic realistic OTA
// names, not real confirmed partner names.
export const ALL_DISTRIBUTION_CHANNELS = ['Direct Booking', 'Channels Plus', 'Booking.com', 'Expedia', 'Agoda', 'Airbnb'];

// A rate plan's CURRENTLY connected channels — a subset of
// ALL_DISTRIBUTION_CHANNELS, confirmed real for the Channels tab's default
// state (so "Add channel" has somewhere to add TO, and something to show
// underneath each one — see buildRatePlanNode's Channels tab).
const RATE_PLAN_CHANNELS = ['Direct Booking', 'Booking.com', 'Expedia'];

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
// existing yet. NO Properties tab/tile here (removed) — bulk property
// assignment is a GRP-entity concept only. A plain Rate plan has no GRP/
// template layer underneath it (see buildRatePlanNames/Rate plans' own
// row-expansion at multi-property scope), so each property's rate plan is
// a genuinely independent object with nothing to "assign to properties."
function buildRatePlanNode() {
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
              // Renamed from "Connectivities" — same concept as Config →
              // Property's "Integrated systems," just named differently by
              // account type (MP: Connectivities / Platform: Integrated
              // systems) — CONTEXT.md logged this consolidation and applied
              // it to Config → Property already; this is Rate plan's own
              // instance of the same concept, picked up now. `key`/tab key
              // renamed to match (`integrated-systems`, not
              // `connectivities`) rather than leaving an internal key that
              // no longer matches its visible label.
              { key: 'integrated-systems-tile', label: 'Integrated systems', linksToTab: 'integrated-systems' },
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
        // `sketch: 'channel-rates'` (new) — real shape for what used to be
        // a plain list stub: "i see all the live rates listed there (a
        // rate is the combination of a rate plan and a room type), i see a
        // channel and then the channel rates below it, and then another
        // channel etc." An "Add channel" action row leads into the new
        // full-page wizard (see renderChannelRatesSketch/openWizard in
        // main.js) — its first real instance, direction-setting for the
        // whole IA's not-yet-tackled editing-surface pattern.
        { key: 'channels', label: 'Channels', content: { type: 'sketch', sketch: 'channel-rates', channels: RATE_PLAN_CHANNELS } },
        { key: 'integrated-systems', label: 'Integrated systems', content: { type: 'sketch', sketch: 'list' } },
      ],
    },
  };
}

// A GRP (Group Rate Plan) template's own detail — MP only (Confluence "IA
// node tree v2" — Distribution > Group rate plans). ONE shared node every
// GRP in the list opens (same convention as buildRatePlanNode/
// YIELD_RULE_NODE — clicking any GRP name shows the same illustrative
// shape, not a genuinely distinct per-name detail). Reuses
// buildRatePlanNode()'s shared-config tabs (Overview/Rooms/Channels/
// Integrated systems — a GRP's own template config IS that same shape,
// just pushed to multiple properties instead of belonging to one), then
// appends ONE extra tab a plain rate plan doesn't have: "Properties this
// GRP is pushed to" — real per-property rows (Confluence: "not applicable
// — own object" for the switcher; this is the GRP's own fixed property-
// assignment list, not switcher-filtered), using the same `records` +
// `usageColumn` mechanism Yield rules' "Uses" count uses, with a real
// sync-status value instead. Each row is clickable through to that
// property's own detail (buildPropertyNode) — same as every other
// Properties list in this app, not a dead-end status table.
function buildGroupRatePlanNode() {
  const baseTabs = buildRatePlanNode().content.tabs;
  return {
    key: 'group-rate-plan',
    label: 'Group rate plan',
    content: {
      type: 'tabs',
      tabs: [
        ...baseTabs,
        {
          key: 'grp-properties',
          label: 'Properties',
          content: {
            type: 'records',
            names: SCOPE_PROPERTIES,
            display: 'table',
            // `tableColumns: 0` — Property + Status is the whole concept
            // here (unlike Rate plans/Yield rules, which default to 3
            // filler columns for more data expected later); extra empty
            // columns would just be clutter on an otherwise-complete table.
            tableColumns: 0,
            detailNode: () => buildPropertyNode(true),
            // `syncsScope: true` — same proxy-click-on-the-switcher
            // behavior as the main Properties list (see its own comment).
            syncsScope: true,
            usageColumn: { label: 'Status', get: (property) => groupRatePlanSyncStatus('grp', property) },
          },
        },
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

// Operations' real row content (Confluence "IA node tree v2" — Reservations
// as a Table, Guest communications as a List, Payments' 4 tabs each as a
// Table, Automated payments as a List). All of these were previously
// unbuilt stubs (sketch:'list' with no real rows, or content: null) per
// the "we can work through the details later" caveat when the scope
// switcher was first added — now built out with the same generic
// `records` + shared-detail-node pattern as Rate plans/Yield rules/
// Properties/Users, using exactly the illustrative row names Confluence's
// tree gives for each ("Reservation 4021, 4022, 4023…", etc.), and the
// same "start simple" shared detail node YIELD_RULE_NODE uses (one
// titled field-shaped section, not invented structure).
const SAMPLE_RESERVATIONS = ['Reservation 4021', 'Reservation 4022', 'Reservation 4023', 'Reservation 4024'];
const RESERVATION_NODE = {
  key: 'reservation',
  label: 'Reservation',
  content: { type: 'sketch', sketch: 'sections', sections: [{ title: 'Reservation', shape: 'field' }] },
};

// Reservations at >1-property scope (Robert: "reservations needs a
// properties column"; confirmed: expand rows, not just add a column) —
// same reasoning and same exact pattern as buildRatePlanNames: a
// reservation belongs to exactly ONE property, so it's a genuinely
// independent per-property object, not a shared portfolio concept the
// way a Yield rule/User is. EXPANDS into one row per property per
// reservation, real Property column via nameSplitOn — not a "N of M"
// count column, which would misrepresent a 1:1 relationship as a
// many-to-many one. Single-property/single-selected-property scope stays
// the plain 4 names, unchanged. `showProperties` checked first — see
// buildRatePlanNames' own comment for the bug this avoids repeating
// (propertyCount: 'single' alone doesn't touch state.scope).
function buildReservationNames(scope, showProperties) {
  if (!showProperties || scope?.type === 'property') return SAMPLE_RESERVATIONS;
  const properties = SCOPE_PROPERTIES;
  return SAMPLE_RESERVATIONS.flatMap((reservation) => properties.map((property) => `${reservation} — ${property}`));
}

const SAMPLE_GUEST_COMMS = ['Pre-arrival', 'Confirmation', 'Post-stay'];
const GUEST_COMM_NODE = {
  key: 'guest-communication',
  label: 'Guest communication',
  content: { type: 'sketch', sketch: 'sections', sections: [{ title: 'Guest communication', shape: 'field' }] },
};

const SAMPLE_TRANSACTIONS = ['Transaction 1', 'Transaction 2', 'Transaction 3', 'Transaction 4'];
const TRANSACTION_NODE = {
  key: 'transaction',
  label: 'Transaction',
  content: { type: 'sketch', sketch: 'sections', sections: [{ title: 'Transaction', shape: 'field' }] },
};

const SAMPLE_PAYOUTS = ['Payout 1', 'Payout 2', 'Payout 3'];
const PAYOUT_NODE = {
  key: 'payout',
  label: 'Payout',
  content: { type: 'sketch', sketch: 'sections', sections: [{ title: 'Payout', shape: 'field' }] },
};

const SAMPLE_INVOICES = ['Invoice 1', 'Invoice 2', 'Invoice 3'];
const INVOICE_NODE = {
  key: 'invoice',
  label: 'Invoice',
  content: { type: 'sketch', sketch: 'sections', sections: [{ title: 'Invoice', shape: 'field' }] },
};

const SAMPLE_PAYMENT_REQUESTS = ['Request 1', 'Request 2', 'Request 3'];
const PAYMENT_REQUEST_NODE = {
  key: 'payment-request',
  label: 'Payment request',
  content: { type: 'sketch', sketch: 'sections', sections: [{ title: 'Payment request', shape: 'field' }] },
};

// Shared by BOTH Automated payments homes (Operations > Payments'
// "Automated payments" tab, AND Configuration > Pay's own "Automated
// payments" item) — same rows, same rule detail, since Confluence's tree
// shows identical "Rule 1, Rule 2, Rule 3…" content in both places.
const SAMPLE_AUTOMATED_PAYMENT_RULES = ['Rule 1', 'Rule 2', 'Rule 3'];
const AUTOMATED_PAYMENT_RULE_NODE = {
  key: 'automated-payment-rule',
  label: 'Automated payment rule',
  content: { type: 'sketch', sketch: 'sections', sections: [{ title: 'Automated payment rule', shape: 'field' }] },
};

// Configuration > Pay's own Taxes/Service charges (real confirmed names
// from Confluence's tree, not illustrative placeholders — "City Tax, VAT,
// Tourist Tax…" / "Resort Fee, Cleaning Fee, Booking Fee…"). Virtual
// terminal/Accepted payments stay content:null — Confluence's tree shows
// no sub-list under either.
const SAMPLE_TAXES = ['City Tax', 'VAT', 'Tourist Tax'];
const TAX_NODE = {
  key: 'tax',
  label: 'Tax',
  content: { type: 'sketch', sketch: 'sections', sections: [{ title: 'Tax', shape: 'field' }] },
};

const SAMPLE_SERVICE_CHARGES = ['Resort Fee', 'Cleaning Fee', 'Booking Fee'];
const SERVICE_CHARGE_NODE = {
  key: 'service-charge',
  label: 'Service charge',
  content: { type: 'sketch', sketch: 'sections', sections: [{ title: 'Service charge', shape: 'field' }] },
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
    // MP-only additions — "API" (programmatic access to Direct Booking) and
    // "Group landing page" (a shared landing page across the group/chain,
    // as distinct from each property's own Website above) only make sense
    // once there's a group of properties to speak of. Uses the same
    // `mpOnly` gate Config → Properties' Brands/Clusters tabs already use —
    // `renderPanel`'s `list`-item filtering (main.js) applies it generically
    // to any list, so no new gating code was needed, just these two items.
    { key: 'api', label: 'API', content: null, mpOnly: true },
    { key: 'group-landing-page', label: 'Group landing page', content: null, mpOnly: true },
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
// (same pattern as BOOKING_ENGINE_LIST above). Virtual terminal/Accepted
// payments stay simple leaf stubs — Confluence's tree shows no sub-list
// under either. Automated payments/Taxes/Service charges built out
// (Confluence: real Lists) — Automated payments shares its rows/detail
// with Operations > Payments' own "Automated payments" tab (same rule
// activity, same object, just two homes in the IA).
const PAY_LIST = {
  type: 'list',
  items: [
    // "Payments" (the status/enablement banner — "SiteMinder Payments is
    // enabled", bullet points, external doc links) REMOVED — user: "it's
    // just a stub to hold an upsell page in the current state," not a real
    // settings destination worth modeling as a peer alongside these.
    {
      key: 'automated-payments',
      label: 'Automated payments',
      active: true,
      content: { type: 'records', names: SAMPLE_AUTOMATED_PAYMENT_RULES, detailNode: AUTOMATED_PAYMENT_RULE_NODE },
    },
    { key: 'virtual-terminal-config', label: 'Virtual terminal', content: null },
    { key: 'accepted-payments', label: 'Accepted payments', content: null },
    { key: 'taxes', label: 'Taxes', content: { type: 'records', names: SAMPLE_TAXES, detailNode: TAX_NODE } },
    {
      key: 'service-charges',
      label: 'Service charges',
      content: { type: 'records', names: SAMPLE_SERVICE_CHARGES, detailNode: SERVICE_CHARGE_NODE },
    },
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
  // EXPLORATORY, non-functional — illustrative "something needs attention"
  // dot (CONTEXT.md's notification candidate-model). A plain dot, not a
  // count — no real data behind it yet.
  badge: true,
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
  // `scopeSwitcher: 'multi-select'` (user: "health check can be all
  // properties or not") — unlike Inventory/Dynamic pricing, Health check
  // is a status-dashboard shape, not a per-property grid/calendar, so a
  // portfolio-wide "how's everything doing" view is meaningful here. Can
  // be scoped to one property, a brand/cluster, or All.
  scopeSwitcher: 'multi-select',
};

// EXPLORATORY — sample data for the property/cluster/brand scope switcher
// sketch (Insights, Health check once built). Not a confirmed decision —
// see CHANGE-QUEUE.md's "Foundational, unsolved" section: this whole
// switcher concept is still being worked through, Distribution's shape is
// unsolved, and this sketch is expected to change once that's resolved.
export const SCOPE_PROPERTIES = SAMPLE_PROPERTIES;
export const SCOPE_BRANDS = ['Coastal Collection', 'Heritage Stays'];
export const SCOPE_CLUSTERS = ['East Coast', 'West Coast', 'Inland'];

// CONFIRMED MODEL (CONTEXT.md): Config's L2 is just two things — the
// Property dashboard (every property-scoped concept lives here, as a tile)
// and Products (everything else, below the "Products" heading). MP simply
// turns "Property" into "Properties" (a picker) and moves the SAME
// dashboard one level deeper, per selected property — `buildPropertyNode`
// is the one dashboard both cases share. The only items that break this
// are ones with an efficiency case for being ALSO reachable as their own
// flat Config L2 rail item, without first drilling into a specific
// property — Users is the one so far (buildUserNode's cross-nav already
// depends on it existing both ways). Channels was considered for the same
// treatment and explicitly rejected — it lives on the dashboard only now,
// no separate flat L2 item.
//
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
function buildConfigurationPropertiesItem(showProperties, scope) {
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
    // `scopeSwitcher: 'multi-select'` (Confluence "IA node tree v2" —
    // Configuration > Properties): this is the concrete instance of the
    // "list -> table, once >1 property" rule (v1b's own reasoning) —
    // Properties follows the exact same switcher-driven behavior as Rate
    // plans/Users, not a special case. One flag on this top-level item
    // covers its tabs (Properties/Brands/Clusters), same mechanism as
    // my-insights/payments.
    scopeSwitcher: 'multi-select',
    content: {
      type: 'tabs',
      tabs: [
        {
          key: 'properties-list',
          label: 'Properties',
          active: true,
          // `display: 'cards'` (Robert: "property then the cards then the
          // property then the cards sort of thing") — each property gets
          // its own clickable name heading directly on this page, followed
          // by a small dashboard-cards summary for that property, repeated
          // per property. Name link still opens the property's full detail
          // page (buildPropertyNode) — confirmed: "name stays clickable,"
          // the cards are a summary, not a replacement for the full page.
          // Scoped to a single property (Robert: "when >1 properties and i
          // filter on one then you would hide the others") — filters down
          // to just that property's own card group. Brand/cluster scope
          // still shows every property — there's no brand/cluster ->
          // member-property mapping in this prototype's sample data to
          // filter against, so that's left as a separate, not-yet-decided
          // question rather than invented here.
          content: {
            type: 'records',
            names: scope?.type === 'property' ? [scope.key] : SAMPLE_PROPERTIES,
            display: 'cards',
            cards: [{ shape: 'stat' }, { shape: 'chart' }, { shape: 'chart' }],
            detailNode: buildPropertyNode(showProperties),
            // `syncsScope: true` — clicking a property name acts as a
            // proxy click on the global scope switcher (see
            // wirePathLinks) — the switcher already reflects where you
            // are by the time buildPropertyNode's own page renders,
            // which is what makes keeping ITS switcher active useful
            // rather than stale (Robert: "the switcher stays active
            // since its actually useful").
            syncsScope: true,
          },
        },
        // `scopeSwitcher: 'force-all'` — Brands/Clusters ARE all-properties
        // concepts by definition (a brand/cluster spans multiple
        // properties), so there's no meaningful single-property or
        // brand/cluster-scoped-within-a-brand view here. Visible switcher,
        // locked to "All properties," disabled — not hidden, same slot as
        // every other page (Robert: "force switcher there to all and
        // disable").
        { key: 'brands', label: 'Brands', content: null, mpOnly: true, scopeSwitcher: 'force-all' },
        { key: 'clusters', label: 'Clusters', content: null, mpOnly: true, scopeSwitcher: 'force-all' },
      ],
    },
  };
}

// Every panel item is a real Node (key, label, content) — no more plain
// {label, active} objects. A leaf item with nothing to click into (e.g.
// "Inventory") is still a Node, just with content: null.
//
// `accountType` (new) is needed specifically for Group rate plans (MP
// only) — that's a real "MP only" distinction (Confluence "IA node tree
// v2"), NOT the same as `showProperties` (which is also true for a plain
// SM account with propertyCount: 'multiple', and Group rate plans should
// NOT show for that case — only true MP accounts get it).
//
// `enabledProducts` (new) gates Configuration's 4 "Add-on" product items
// (Direct Booking/Channels Plus/Metasearch/Pay) — see PRODUCT_KEYS.
function buildSmContentTree(showProperties, scope, accountType, enabledProducts) {
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
          //
          // `scopeSwitcher: 'multi-select'` (Confluence "IA node tree v2"):
          // Dashboard can be scoped to one property, a brand/cluster, or
          // All — same per-item switcher mechanism as Distribution's items.
          content: {
            type: 'sketch',
            sketch: 'dashboard-cards',
            cards: [{ shape: 'stat' }, { shape: 'chart' }, { shape: 'chart' }, { shape: 'stat' }, { shape: 'chart' }, { shape: 'stat' }],
          },
          scopeSwitcher: 'multi-select',
        },
        // Promoted/starred items — illustrative duplicates of a couple of
        // My insights' starred rows below, surfaced at the top level,
        // directly appended after Dashboard. Each opens the same
        // CUSTOM_DASHBOARD_NODE content every custom dashboard/chart uses
        // ("the custom dashboards would use the same skeleton" — user's
        // direction) — same titleless dashboard-cards grid, not a
        // Dashboards-list drill-down (these are standalone top-level
        // items, not literally the same node reached two ways).
        //
        // `scopeSwitcher: 'multi-select'` on every one of these (user:
        // "keep property selector for all the insights dashboards") — every
        // dashboard-shaped page in this section carries the switcher
        // consistently, not just Dashboard/Recommendations.
        { key: 'starred-dashboard-1', label: 'Weekly performance', content: CUSTOM_DASHBOARD_NODE.content, starred: true, scopeSwitcher: 'multi-select' },
        { key: 'starred-dashboard-2', label: 'Channel comparison', content: CUSTOM_DASHBOARD_NODE.content, starred: true, scopeSwitcher: 'multi-select' },
        ...(showProperties
          ? [{ key: 'starred-dashboard-3', label: 'Portfolio health', content: CUSTOM_DASHBOARD_NODE.content, starred: true, scopeSwitcher: 'multi-select' }]
          : []),
        {
          key: 'my-insights',
          label: 'My insights',
          // scopeSwitcher lives on the TOP-LEVEL routed item (renderCanvas
          // reads rootItem.scopeSwitcher off data.items, not off whatever
          // 'records' detail is drilled into) — so this one flag covers
          // "My insights" itself AND everything reached underneath it
          // (Dashboards list, Charts list, and every individual dashboard/
          // chart opened via CUSTOM_DASHBOARD_NODE), not just the folder's
          // own top level.
          scopeSwitcher: 'multi-select',
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
        // REVISED from a plain `sketch:'list'` — user wants Recommendations
        // to feel like its own real dashboard, connecting it to the
        // notification candidate-model (CONTEXT.md): Recommendations is the
        // OPTIMIZATION half of the global "something needs attention" split
        // (Health check being the BROKEN half). Reusing dashboard-cards as-
        // is for now — "reuse but I feel like a concept of groupings could
        // be good - or maybe that's a later stage thing - I am fine with
        // reuse." Groupings/categorized recommendations logged as a later-
        // stage idea, NOT built — don't add grouping structure without
        // picking this back up. `badge: true` — same illustrative
        // "something needs attention" dot as Health check.
        {
          key: 'recommendations',
          label: 'Recommendations',
          badge: true,
          content: {
            type: 'sketch',
            sketch: 'dashboard-cards',
            cards: [
              { shape: 'stat' },
              { shape: 'chart' },
              { shape: 'chart' },
              { shape: 'stat' },
              { shape: 'chart' },
              { shape: 'stat' },
            ],
          },
          scopeSwitcher: 'multi-select',
        },
      ],
      // Section-level `scopeSwitcher` REMOVED (Confluence "IA node tree
      // v2") — same per-item change as Distribution. Every dashboard-shaped
      // item in this section now carries its own `scopeSwitcher:
      // 'multi-select'` (Dashboard, Recommendations, the starred/promoted
      // items, and My insights) — user: "keep property selector for all the
      // insights dashboards."
    },
    distribution: {
      items: [
        // Skeleton-only grid (Distribution batch item 4) — "just a
        // skeleton without words" (confirmed by user): a plain column
        // count + row count, no real labels at all — shape only, nothing
        // about Inventory's real columns/rows is decided yet.
        //
        // `scopeSwitcher: 'force-single'` (Confluence "IA node tree v2" —
        // Property scope column): Inventory is a per-property grid, there's
        // no meaningful "all properties" or cluster view of it. The
        // switcher's All/Brand/Cluster options are disabled (see
        // renderScopeSwitcher). If the global scope is already all/brand/
        // cluster when the user arrives here, this page does NOT silently
        // pick a property for them — it shows an explicit "select a
        // property to continue" prompt instead (renderForceSinglePrompt) —
        // "we can't switch the scope as people move around — they need to
        // own that." Whatever they pick becomes the new GLOBAL scope,
        // same as changing it from the header switcher anywhere else.
        {
          key: 'inventory',
          label: 'Inventory',
          active: true,
          content: { type: 'sketch', sketch: 'grid', columns: 7, rows: 6 },
          scopeSwitcher: 'force-single',
        },
        // Clickable `records` list (Distribution batch item 1 — "go
        // deep"), same generic pattern as Properties/Users/Dashboards.
        // `display: 'table'` (new): renders as a table-styled skeleton
        // instead of a plain list — user's direction: "let's make it a
        // table skeleton - but show clickable names just like the current
        // list." `detailNode` is now a nav-dashboard (see
        // buildRatePlanNode) — the first case this new page type was built
        // against.
        // `topWidgets` (new) — "contextual insights around the place
        // rather than just lists": a few dashboard-cards widgets above the
        // table, same building block `nav-dashboard`'s `extraSections`
        // already uses for Rate plan's own Overview "Performance" section.
        // 3 cards, mixed stat+chart, matching that section's proportions —
        // titleless/skeleton, no real numbers/charts confirmed yet.
        //
        // `scopeSwitcher: 'multi-select'` (Confluence v2): a genuine
        // multi-property collection — the switcher can be set to a single
        // property, a brand/cluster, or All.
        //
        // Row set is SCOPE-AWARE (user: "for rate plans wed wnat to see more
        // when its all properties") — `buildRatePlanNames(scope)` returns
        // the plain 4 names at single-property scope, or expands to one row
        // per property per rate plan otherwise (see that function's comment
        // for why this expands rather than always adding a column: no
        // GRP/template layer here, so each property's "Standard Rate" is a
        // real independent object, not a shared one just annotated with
        // where it lives). `nameSplitOn` (renderRecordTable) is what turns
        // an expanded row's "{Rate plan} — {Property}" name into a real
        // Property column — only passed when scope is genuinely
        // multi-property; at single-property scope there's no property
        // half to split out, so the column shouldn't render at all rather
        // than show up empty.
        {
          key: 'rate-plans',
          label: 'Rate plans',
          content: {
            type: 'records',
            names: buildRatePlanNames(scope, showProperties),
            display: 'table',
            nameSplitOn: !showProperties || scope?.type === 'property' ? null : ' — ',
            detailNode: buildRatePlanNode(),
            topWidgets: {
              type: 'sketch',
              sketch: 'dashboard-cards',
              cards: [{ shape: 'stat' }, { shape: 'chart' }, { shape: 'chart' }],
            },
          },
          scopeSwitcher: 'multi-select',
        },
        // Group rate plans — MP only (Confluence "IA node tree v2"): its
        // own object, OUTSIDE switcher scope entirely (no `scopeSwitcher`
        // set here at all — "not applicable — own object," distinct from
        // `force-single`/`multi-select`/no-switcher-because-account-level;
        // this is "no switcher because the whole node doesn't participate
        // in property scoping the way a normal per-property collection
        // does"). Real, deterministic sample names via
        // SAMPLE_GROUP_RATE_PLANS — same shared-detail-node convention as
        // Rate plans/Yield rules (see buildGroupRatePlanNode's comment).
        // Gated on true accountType === 'MP', NOT `showProperties` (which
        // is also true for a plain SM account with propertyCount:
        // 'multiple' — Group rate plans should NOT show for that case,
        // only real MP accounts get it; see buildSmContentTree's own
        // comment on why accountType had to be threaded through).
        ...(accountType === 'MP'
          ? [
              {
                key: 'group-rate-plans',
                label: 'Group rate plans',
                content: {
                  type: 'records',
                  names: SAMPLE_GROUP_RATE_PLANS,
                  detailNode: buildGroupRatePlanNode(),
                },
              },
            ]
          : []),
        // Same pattern (item 2), own shared detail node.
        //
        // NOW a table (user: "for yield rules we'd want to see a concept of
        // how many properties are using a rule - so it prob becomes a
        // table") — unlike Rate plans, this does NOT expand rows (a yield
        // rule is a shared portfolio concept, not an independent
        // per-property object) — one row per rule stays, with a real
        // "Uses" column (`usageColumn`, new) showing a real, deterministic
        // count via `ratePlanUsageCount`. Real count only, not interactive
        // (confirmed) — no per-property breakdown/expansion yet.
        {
          key: 'yield-rules',
          label: 'Yield rules',
          content: {
            type: 'records',
            names: SAMPLE_YIELD_RULES,
            display: 'table',
            usageColumn: { label: 'Uses', get: (name) => `${ratePlanUsageCount(name)} of ${SCOPE_PROPERTIES.length} properties` },
            detailNode: YIELD_RULE_NODE,
          },
          scopeSwitcher: 'multi-select',
        },
        // Calendar-style grid (user: "dynamic pricing is a grid as well -
        // can use the LH calendar style") — same 7-weekday-column, 5-row
        // shape Front desk's calendar uses, but embedded in a NORMAL
        // Distribution page (L2 panel stays visible), not full-width/
        // noPanel like Front desk's own usage. `badge: true` — same
        // illustrative "something needs attention" dot as Health check/
        // Recommendations (CONTEXT.md's notification candidate-model).
        //
        // `scopeSwitcher: 'force-single'`: same reasoning as Inventory —
        // per-property calendar, no all-properties/cluster view exists.
        {
          key: 'dynamic-pricing',
          label: 'Dynamic pricing',
          badge: true,
          content: { type: 'sketch', sketch: 'calendar' },
          scopeSwitcher: 'force-single',
        },
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
      // Section-level `scopeSwitcher` REMOVED (Confluence "IA node tree
      // v2"): the switcher is now a PER-ITEM property (see each item
      // above), not a section-wide flag. This is the per-item shape
      // CONTEXT.md's per-section audit flagged as the target — Inventory
      // and Rate plans/Yield rules genuinely differ (force-single vs.
      // multi-select), which a single section-level boolean couldn't
      // express. Don't reintroduce a section-level flag here.
    },
    // Renamed from "transactions" alongside the rail item's own rename —
    // see BASE_RAIL_ITEMS' comment for why.
    operations: {
      // `scopeSwitcher: 'multi-select'` on every top-level item here (user:
      // "also need the switcher in the operations section - we can work
      // through the details later") — first pass at plain multi-select
      // everywhere, same default this project uses elsewhere absent a
      // specific reason for force-single (e.g. Inventory/Dynamic pricing).
      // Revisit per-item once the actual per-tab needs (Payments'
      // Transactions vs. Payouts vs. Invoices, etc.) are worked through —
      // don't treat this as confirmed.
      items: [
        // Built out (Confluence "IA node tree v2" — Reservations is a real
        // Table: "Reservation 4021, Reservation 4022, Reservation 4023…" ->
        // Detail), replacing the earlier sketch:'list' stub. Same generic
        // `records` + `display: 'table'` pattern as Rate plans/Yield
        // rules, shared RESERVATION_NODE detail ("start simple," same
        // convention as YIELD_RULE_NODE).
        //
        // Row set is SCOPE-AWARE (Robert: "reservations needs a properties
        // column"; confirmed: expand rows like Rate plans, not a count
        // column) — see buildReservationNames' own comment for why this
        // expands rather than adding a "N of M" column. `nameSplitOn`
        // turns an expanded row's "{Reservation} — {Property}" name into
        // a real Property column, same as Rate plans — only passed when
        // scope is genuinely multi-property.
        {
          key: 'reservations',
          label: 'Reservations',
          active: true,
          content: {
            type: 'records',
            names: buildReservationNames(scope, showProperties),
            display: 'table',
            nameSplitOn: !showProperties || scope?.type === 'property' ? null : ' — ',
            detailNode: RESERVATION_NODE,
          },
          scopeSwitcher: 'multi-select',
        },
        // Built out — Confluence: real List ("Pre-arrival, Confirmation,
        // Post-stay…" -> Detail), replacing the content:null stub.
        {
          key: 'guest-communications',
          label: 'Guest communications',
          content: { type: 'records', names: SAMPLE_GUEST_COMMS, detailNode: GUEST_COMM_NODE },
          scopeSwitcher: 'multi-select',
        },
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
          // One flag covers every tab underneath (Transactions/Payouts/
          // Invoices/Payment requests/Automated payments) — same mechanism
          // as My insights. Some of these tabs may end up needing
          // force-single instead once worked through in detail (e.g.
          // Payouts could be inherently property-specific) — not decided
          // yet, don't read this as confirmed per-tab.
          scopeSwitcher: 'multi-select',
          content: {
            type: 'tabs',
            tabs: [
              // All 4 built out (Confluence: each a real Table -> Detail),
              // replacing sketch:'list' stubs. Same records+table pattern
              // as Reservations above.
              {
                key: 'transactions-tab',
                label: 'Transactions',
                active: true,
                content: { type: 'records', names: SAMPLE_TRANSACTIONS, display: 'table', detailNode: TRANSACTION_NODE },
              },
              {
                key: 'payouts',
                label: 'Payouts',
                content: { type: 'records', names: SAMPLE_PAYOUTS, display: 'table', detailNode: PAYOUT_NODE },
              },
              {
                key: 'invoices',
                label: 'Invoices',
                content: { type: 'records', names: SAMPLE_INVOICES, display: 'table', detailNode: INVOICE_NODE },
              },
              {
                key: 'payment-requests',
                label: 'Payment requests',
                content: { type: 'records', names: SAMPLE_PAYMENT_REQUESTS, display: 'table', detailNode: PAYMENT_REQUEST_NODE },
              },
              // Home for "scheduled and failed automated payments" — user's
              // own framing, a real gap noticed after Automated payments'
              // RULES were placed under Config → Pay (PAY_LIST) but the
              // actual scheduled/failed payment ACTIVITY those rules
              // produce had nowhere to live. Confirmed: transactional, not
              // config-adjacent — belongs here, not nested under Config →
              // Pay → Automated payments. One combined tab (not separate
              // Scheduled/Failed tabs) — status would be a column in this
              // list, not a page split. Built out — Confluence: real List
              // ("Rule 1, Rule 2, Rule 3…" -> Detail), shared with
              // Configuration > Pay's own "Automated payments" item (same
              // rows, same rule detail).
              {
                key: 'automated-payments-tab',
                label: 'Automated payments',
                content: { type: 'records', names: SAMPLE_AUTOMATED_PAYMENT_RULES, detailNode: AUTOMATED_PAYMENT_RULE_NODE },
              },
            ],
          },
        },
      ],
    },
    configuration: {
      items: [
        buildConfigurationPropertiesItem(showProperties, scope),
        // Clickable, using the generic `records` pattern — same mechanism
        // Properties uses (CHANGE-QUEUE.md item 3), not a Users-specific
        // one. Each user opens buildUserNode's shared detail tabs.
        //
        // At >1 property, becomes a real table with a Properties count
        // column (Robert: "users becomes a table in >1 property view with
        // a property column") — the concrete "eventually Users" instance
        // of the same "list -> table, once >1 property" rule already
        // applied to Configuration's Properties. There's no real per-user
        // property-membership data in this prototype (every user's own
        // Properties tab shows the same full SAMPLE_PROPERTIES list), so
        // the column is a deterministic "N of M properties" count, same
        // usageColumn mechanism and even the same seeded-hash helper
        // (ratePlanUsageCount — a generic name-seeded hash despite the
        // name, already reused once for a non-rate-plan case) Yield
        // rules' own "Uses" column uses — not per-user real data, real
        // count only, not interactive.
        {
          key: 'users',
          label: 'Users',
          content: {
            type: 'records',
            names: SAMPLE_USERS,
            detailNode: buildUserNode(showProperties),
            ...(showProperties
              ? {
                  display: 'table',
                  usageColumn: { label: 'Properties', get: (name) => `${ratePlanUsageCount(name)} of ${SCOPE_PROPERTIES.length} properties` },
                }
              : {}),
          },
          // `scopeSwitcher: 'multi-select'` (Confluence "IA node tree v2" —
          // Configuration > Users).
          scopeSwitcher: 'multi-select',
        },
        // "Products" — a grouping HEADING (see PATTERNS.md's folder-vs-
        // heading rule), not a folder: always-expanded, no chevron, purely
        // clusters the already-visible items below it under one label.
        { heading: true, label: 'Products' },
        // Each gated on `enabledProducts` (Confluence "IA node tree v2" —
        // all 4 tagged Add-on: "a section that only exists in the IA for
        // accounts that have signed up for that product"). Defaults to all
        // 4 enabled (see state.enabledProducts in main.js), so this is a
        // no-op unless the debug panel is used to deselect one.
        //
        // `scopeSwitcher: 'force-single'` on all 4 — Confluence's v2 tree
        // leaves Property scope blank for these, but the earlier v1c draft
        // is explicit: "not applicable — no group config yet." There's no
        // group/portfolio-level product config anywhere in this tree (see
        // the "Group-level product config is still missing" open thread) —
        // until that exists, a product is configured one property at a
        // time, so single-property is the only meaningful mode, same
        // reasoning as Inventory/Dynamic pricing.
        ...(enabledProducts.includes('direct-booking')
          ? [{ key: 'direct-booking', label: 'Direct Booking', content: BOOKING_ENGINE_LIST, scopeSwitcher: 'force-single' }]
          : []),
        ...(enabledProducts.includes('channels-plus')
          ? [{ key: 'channels-plus', label: 'Channels Plus', content: null, scopeSwitcher: 'force-single' }]
          : []),
        ...(enabledProducts.includes('metasearch')
          ? [{ key: 'metasearch', label: 'Metasearch', content: null, scopeSwitcher: 'force-single' }]
          : []),
        // NEW — stub for now (content: null), no shape decided yet.
        ...(enabledProducts.includes('pay') ? [{ key: 'pay', label: 'Pay', content: PAY_LIST, scopeSwitcher: 'force-single' }] : []),
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
//   - scope: the property/cluster/brand switcher's current value (see
//     state.scope in main.js) — threaded through so scope-aware row sets
//     (Rate plans' expansion, once other items need it) can react live.
//     Optional; content that doesn't care about scope just ignores it.
//   - enabledProducts: which "Add-on" products (Confluence "IA node tree
//     v2") this account has signed up for — gates Configuration's Direct
//     Booking/Channels Plus/Metasearch/Pay items. Optional; defaults to
//     every product enabled (main.js's own state default already does
//     this, but keep the fallback here too so a caller that omits it
//     entirely doesn't accidentally hide every product).
export function getContent(accountType, propertyCount, scope, enabledProducts = PRODUCT_KEYS) {
  const showProperties = accountType === 'MP' || propertyCount === 'multiple';
  const tree = buildSmContentTree(showProperties, scope, accountType, enabledProducts);
  // My account — not a rail section (getRailItems is unaffected), reached
  // via the rail's user avatar instead. Same regardless of account type/
  // property count, so it's added here rather than inside
  // buildSmContentTree.
  tree['my-account'] = { items: MY_ACCOUNT_ITEMS };
  // Notifications and AI assistant — same treatment as My account above:
  // reached via their own rail buttons (railNotifications/railAssistant in
  // index.html), not rail sections, same regardless of account type/
  // property count.
  tree['notifications'] = NOTIFICATIONS_ITEMS;
  tree['assistant'] = ASSISTANT_ITEMS;
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
