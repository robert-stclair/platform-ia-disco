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
//     | { type: 'records', names: string[], detailNode: Node }
//                                                   // GENERIC "clickable records list -> shared detail node" pattern
//                                                   // (PATTERNS.md) — selecting a name shows `detailNode`'s content.
//                                                   // Properties (-> PROPERTY_NODE) and Users (-> USER_NODE) are both
//                                                   // instances of this ONE mechanism — never hardcode a new content
//                                                   // type for "a picker that opens a shared detail page," reuse this.
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
//   Configuration > Properties                | records (nav)      | type:'records' -> PROPERTY_NODE; picker
//                                                                    rows are 'list' via renderRecordPicker.
//                                                                    Distribution's own Properties item was
//                                                                    REMOVED — see IA-BY-USER-TYPE.md's open
//                                                                    question, don't reintroduce without that
//                                                                    being resolved first.
//   PROPERTY_NODE's 4 settings tabs           | stacked cards      | sketch:'sections' (General
//                                                                    information/Property
//                                                                    details/Services/Policies)
//   PROPERTY_NODE > Room types                | list               | sketch:'list'
//   PROPERTY_NODE > Media library            | card grid (media)  | sketch:'media'
//   PROPERTY_NODE > Integrated systems       | stacked cards      | sketch:'sections' via 'systems' type
//   PROPERTY_NODE > Users (always shown)      | list               | sketch:'list' (which users have access
//                                                                    to this property — mirror of USER_NODE's
//                                                                    Properties tab, but unconditional)
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
//   Distribution > Rate plans                 | records (nav)      | type:'records' -> RATE_PLAN_NODE (a
//                                                                    simple stacked-cards stub for now)
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

// A single property's own settings — same structure regardless of whether
// the account is single- or multi-property (the "one IA, not two" decision).
// This is a Node with tabs content; reused directly as Property settings'
// content, and as what a drilled-in property (from an MP properties list)
// shows.
export const PROPERTY_NODE = {
  key: 'property',
  label: 'Property settings',
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
          ],
        },
      },
      {
        key: 'property-details',
        label: 'Property details',
        content: {
          type: 'sketch',
          sketch: 'sections',
          sections: [
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
      // Mirror of USER_NODE's "Properties" tab (CHANGE-QUEUE.md item 5) —
      // which users have access to THIS property. Unlike USER_NODE's
      // "Properties" tab, this one is ALWAYS shown, not property-count-
      // gated: every property, single- or multi-property account alike,
      // has users with access to it.
      {
        key: 'property-users',
        label: 'Users',
        content: { type: 'sketch', sketch: 'list' },
      },
    ],
  },
};

// EXPLORATORY — sample user names for the generic `records` pattern
// (CHANGE-QUEUE.md item 3). Generic realistic names, not real confirmed
// user data, not placeholder-style labels — same treatment as
// SAMPLE_PROPERTIES below.
const SAMPLE_USERS = ['Jane Smith', 'Michael Chen', 'Priya Patel', 'Tom Reilly'];

// A single user's own detail page — "User details" always, plus
// "Properties" (which properties this user has access to) only for
// multi-property accounts. Built as a function of `showProperties`
// (same parameter `buildConfigurationPropertiesItem` uses) rather than a
// static export like PROPERTY_NODE, since this tab strip's shape itself
// varies by account state, not just its content.
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
                content: { type: 'sketch', sketch: 'list' },
              },
            ]
          : []),
      ],
    },
  };
}

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

// Shared detail node every rate plan opens — kept deliberately simple for
// now ("start simple... unless told otherwise"), a basic stacked-cards
// sketch. Revisit if a real rate-plan detail shape is confirmed later.
const RATE_PLAN_NODE = {
  key: 'rate-plan',
  label: 'Rate plan',
  content: { type: 'sketch', sketch: 'sections', sections: [{ title: 'Rate plan', shape: 'field' }] },
};

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

const SAMPLE_PROPERTIES = [
  'Harbourview Hotel',
  'The Grand Meridian',
  'Coastal Breeze Inn',
  'Alpine Lodge & Suites',
  'Riverside Boutique Hotel',
];

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
    // 1) — scoped to just this panel item's label; PROPERTY_NODE itself
    // (the shared tab-strip shown once drilled into a specific property)
    // keeps its own label/key unchanged.
    return { key: 'property-settings', label: 'Property', active: true, content: PROPERTY_NODE.content };
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
          content: { type: 'records', names: SAMPLE_PROPERTIES, detailNode: PROPERTY_NODE },
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
        {
          key: 'rate-plans',
          label: 'Rate plans',
          content: { type: 'records', names: SAMPLE_RATE_PLANS, detailNode: RATE_PLAN_NODE },
        },
        // Same pattern (item 2), own shared detail node.
        {
          key: 'yield-rules',
          label: 'Yield rules',
          content: { type: 'records', names: SAMPLE_YIELD_RULES, detailNode: YIELD_RULE_NODE },
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
    },
    transactions: {
      items: [
        // sketch:'list' (CHANGE-QUEUE.md item 7) — a plain list, NOT the
        // clickable `records` pattern (unlike Rate plans/Yield rules).
        { key: 'reservations', label: 'Reservations', active: true, content: { type: 'sketch', sketch: 'list' } },
        { key: 'guest-communications', label: 'Guest communications', content: null },
        { key: 'payments', label: 'Payments', content: null },
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
