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

// Booking engine's sublist — same across single- and multi-property.
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
            active: true,
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

// Two independent settings axes control what renders:
//   - accountType: 'SM' | 'LH' | 'MP' — SM is the only one with real content
//     so far; LH/MP render empty until their nav differences are defined
//     (deliberately not guessed at — no placeholder content).
//   - propertyCount: 'single' | 'multiple' — drives the Properties list
//     (Distribution's Properties tab, Configuration's Properties list),
//     independent of account type: any account can have >1 property.
//
// Brands/Clusters specifically are gated further by account type (MP only)
// via `mpOnly: true` — property count alone isn't sufficient for those two,
// per the "brands/clusters may be MP-only, the properties list is not"
// distinction. Rendering filters out `mpOnly` items unless accountType==='MP'.

const SM_CONTENT = {
  single: {
    insights: {
      items: [{ label: 'Dashboard', active: true }, { label: 'Recommendations' }],
      ugc: ['Weekly performance', 'Channel comparison'],
    },
    distribution: {
      items: [{ label: 'Inventory', active: true }, { label: 'Rate plans' }, { label: 'Yield rules' }],
    },
    transactions: {
      items: [
        { label: 'Reservations', active: true },
        { label: 'Guest communications' },
        { label: 'Payments' },
      ],
    },
    configuration: {
      items: [
        { key: 'property-settings', label: 'Property settings', active: true, content: PROPERTY_NODE.content },
        { key: 'channels-plus', label: 'Channels Plus', content: null },
        { key: 'booking-engine', label: 'Booking engine', content: BOOKING_ENGINE_LIST },
      ],
    },
  },
  multiple: {
    insights: {
      items: [{ label: 'Dashboard', active: true }, { label: 'Recommendations' }],
      ugc: ['Weekly performance', 'Channel comparison', 'Portfolio health'],
    },
    distribution: {
      items: [{ label: 'Inventory', active: true }, { label: 'Rate plans' }, { label: 'Yield rules' }],
      sublist: [{ key: 'properties', label: 'Properties', active: true }],
    },
    transactions: {
      items: [
        { label: 'Reservations', active: true },
        { label: 'Guest communications' },
        { label: 'Payments' },
      ],
    },
    configuration: {
      items: [
        {
          key: 'properties-config',
          label: 'Properties',
          active: true,
          content: {
            type: 'list',
            items: [
              {
                key: 'properties-list',
                label: 'Properties',
                active: true,
                content: {
                  type: 'properties',
                  names: [
                    'Harbourview Hotel',
                    'The Grand Meridian',
                    'Coastal Breeze Inn',
                    'Alpine Lodge & Suites',
                    'Riverside Boutique Hotel',
                  ],
                },
              },
              { key: 'brands', label: 'Brands', content: null, mpOnly: true },
              { key: 'clusters', label: 'Clusters', content: null, mpOnly: true },
            ],
          },
        },
        { key: 'channels-plus', label: 'Channels Plus', content: null },
        { key: 'booking-engine', label: 'Booking engine', content: BOOKING_ENGINE_LIST },
      ],
    },
  },
};

// LH and MP intentionally absent — accountType renders empty for them until
// their real nav differences are defined.
export const CONTENT = {
  SM: SM_CONTENT,
};
