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
//     | { type: 'properties', names: string[] }    // clickable property names; selecting one shows PROPERTY_NODE's content
//     | { type: 'sketch', sketch: 'field'|'chips'|'cols'|'list'|'media', sections?: [{title, shape}] }
//     | { type: 'systems' }                        // "Integrated systems"-style: system count drives whether a
//                                                   //   systems list appears before the selected system's content
//
// No placeholder items (e.g. "Etc.") — only entries confirmed from
// production screenshots or decided in conversation. Sketches show real
// card titles where confirmed, but wireframe blocks underneath — no
// field-level labels or copy.

export const RAIL_ITEMS = [
  { key: 'insights', label: 'Insights', icon: 'insights' },
  { key: 'distribution', label: 'Distribution', icon: 'distribution' },
  { key: 'transactions', label: 'Transactions', icon: 'transactions' },
  { key: 'configuration', label: 'Configuration', icon: 'configuration' },
];

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
    ],
  },
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

const SAMPLE_PROPERTIES = [
  'Harbourview Hotel',
  'The Grand Meridian',
  'Coastal Breeze Inn',
  'Alpine Lodge & Suites',
  'Riverside Boutique Hotel',
];

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
    return { key: 'property-settings', label: 'Property settings', active: true, content: PROPERTY_NODE.content };
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
          content: { type: 'properties', names: SAMPLE_PROPERTIES },
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
      items: [
        { key: 'dashboard', label: 'Dashboard', active: true, content: null },
        { key: 'recommendations', label: 'Recommendations', content: null },
      ],
      ugc: showProperties
        ? ['Weekly performance', 'Channel comparison', 'Portfolio health']
        : ['Weekly performance', 'Channel comparison'],
    },
    distribution: {
      items: [
        { key: 'inventory', label: 'Inventory', active: true, content: null },
        { key: 'rate-plans', label: 'Rate plans', content: null },
        { key: 'yield-rules', label: 'Yield rules', content: null },
        // Only appears when showProperties — same recursive 'properties' shape
        // Configuration's Properties tab uses, now a real clickable/routable
        // panel item instead of the old flat, unwired `data.sublist` array.
        ...(showProperties
          ? [{ key: 'properties', label: 'Properties', content: { type: 'properties', names: SAMPLE_PROPERTIES } }]
          : []),
      ],
    },
    transactions: {
      items: [
        { key: 'reservations', label: 'Reservations', active: true, content: null },
        { key: 'guest-communications', label: 'Guest communications', content: null },
        { key: 'payments', label: 'Payments', content: null },
      ],
    },
    configuration: {
      items: [
        buildConfigurationPropertiesItem(showProperties),
        { key: 'users', label: 'Users', content: { type: 'sketch', sketch: 'list' } },
        { key: 'direct-booking', label: 'Direct Booking', content: BOOKING_ENGINE_LIST },
        { key: 'channels-plus', label: 'Channels Plus', content: null },
      ],
    },
  };
}

// Two independent settings axes control what renders:
//   - accountType: 'SM' | 'LH' | 'MP' — SM is the only one with real content
//     so far; LH renders empty until its nav differences are defined
//     (deliberately not guessed at — no placeholder content). MP reuses
//     SM's structure (per decision) but always shows Properties.
//   - propertyCount: 'single' | 'multiple' — independent of account type;
//     also drives Properties, alongside accountType === 'MP'.
export function getContent(accountType, propertyCount) {
  if (accountType === 'LH') return null;
  const showProperties = accountType === 'MP' || propertyCount === 'multiple';
  return buildSmContentTree(showProperties);
}
