// Nav content model for the Platform 2.0 IA wireframe.
// Mirrors the decisions log on the "IA schemes — prototyping" Confluence page:
// https://siteminder-jira.atlassian.net/wiki/spaces/SMD/pages/1197277194/IA+schemes+prototyping
//
// Edit this file to reflect new decisions as they're made — it's the single
// source of truth the rail/panel/canvas render from.

export const RAIL_ITEMS = [
  {
    key: 'insights',
    label: 'Insights',
    icon: 'insights',
  },
  {
    key: 'distribution',
    label: 'Distribution',
    icon: 'distribution',
  },
  {
    key: 'transactions',
    label: 'Transactions',
    icon: 'transactions',
  },
  {
    key: 'configuration',
    label: 'Configuration',
    icon: 'configuration',
  },
];

export const SECTION_LABELS = Object.fromEntries(RAIL_ITEMS.map((r) => [r.key, r.label]));

export const CONTENT = {
  single: {
    insights: {
      heading: 'Insights',
      items: [
        { label: 'Dashboard', active: true },
        { label: 'Recommendations', badge: '3' },
      ],
      ugc: ['Weekly performance', 'Channel comparison'],
      canvas: {
        eyebrow: 'Insights → Dashboard',
        title: 'Dashboard is the landing surface',
        subtitle:
          'Selecting the Insights rail item defaults straight to Dashboard. Recommendations sits alongside it, then any custom dashboards the user has built.',
        note: 'Decision: Insights is intentionally doing double duty as both home and analytics — not split into a separate concept at this stage.',
      },
    },
    distribution: {
      heading: 'Distribution',
      items: [
        { label: 'Inventory', active: true },
        { label: 'Rate plans' },
      ],
      canvas: {
        eyebrow: 'Distribution → Inventory',
        title: 'One centralised distribution surface',
        subtitle:
          'Replaces the current per-channel enumeration (OTAs, Direct Booking, Channels Plus each as siblings) with two workflow-first entries: Inventory and Rate plans.',
        note: "Open thread: bulk rate distribution mechanics, once the Properties tab exists for multi-property — MP's current model enforces one shared config across entities in bulk ops, where single-property allows per-entity config.",
      },
    },
    transactions: {
      heading: 'Transactions',
      items: [
        { label: 'Reservations', active: true },
        { label: 'Guest communications' },
        { label: 'Payments' },
      ],
      canvas: {
        eyebrow: 'Transactions → Reservations',
        title: 'Guest-facing activity, grouped',
        subtitle:
          'Reservations, guest communications, and payments — the things that happen after a booking exists — sit together under one rail item.',
        note: null,
      },
    },
    configuration: {
      heading: 'Configuration',
      items: [
        { label: 'Property settings', active: true },
        { label: 'Channel setup' },
        { label: 'Booking engine' },
        { label: 'Etc.' },
      ],
      sublist: ['General', 'Users', 'Notifications'],
      canvas: {
        eyebrow: 'Configuration → Property settings',
        title: 'Single property: scope collapses upward',
        subtitle:
          'For the ~80% single-property accounts, there is one property — so no Properties list is shown. Settings apply directly.',
        note: 'Decision: this is the same Configuration section as multi-property — only the presence of a Properties layer changes, not the structure.',
      },
    },
  },
  multi: {
    insights: {
      heading: 'Insights',
      items: [
        { label: 'Dashboard', active: true },
        { label: 'Recommendations', badge: '12' },
      ],
      ugc: ['Weekly performance', 'Channel comparison', 'Portfolio health'],
      canvas: {
        eyebrow: 'Insights → Dashboard',
        title: 'Defaults to all properties (or last selection)',
        subtitle:
          "Same Dashboard concept as single-property — it isn't a separate MP-specific Insights. The scope is just wider by default.",
        note: "Decision: Insights defaults to an all-properties view for multi-property accounts, or the user's last-selected scope.",
      },
    },
    distribution: {
      heading: 'Distribution',
      items: [
        { label: 'Inventory', active: true },
        { label: 'Rate plans' },
      ],
      sublist: ['Properties'],
      canvas: {
        eyebrow: 'Distribution → Rate plans',
        title: 'Same top surface, plus a Properties tab',
        subtitle:
          'Rate plans looks identical to the single-property view at the top level — the difference is a Properties tab appears beneath it for bulk / per-property distribution work.',
        note: "Open thread: MP's three-tier model (Group Rate Plan → Property Rate Plan → Property Room Rate) enforces one shared config across entities in bulk operations — a real tension against single-property's per-entity granularity.",
      },
    },
    transactions: {
      heading: 'Transactions',
      items: [
        { label: 'Reservations', active: true },
        { label: 'Guest communications' },
        { label: 'Payments' },
      ],
      canvas: {
        eyebrow: 'Transactions → Reservations',
        title: 'Unchanged from single-property',
        subtitle: 'No multi-property-specific differences identified yet for this section.',
        note: null,
      },
    },
    configuration: {
      heading: 'Configuration',
      items: [
        { label: 'Properties', active: true, badge: '18' },
        { label: 'Channel setup' },
        { label: 'Booking engine' },
        { label: 'Etc.' },
      ],
      sublist: ['Brands', 'Clusters', 'Per‑property settings'],
      canvas: {
        eyebrow: 'Configuration → Properties',
        title: 'Multi-property: scope expands to a list',
        subtitle:
          "Properties becomes an explicit list. Brands and Clusters live here too — they're enablement/setup concepts, not a separate MP-only section.",
        note: 'Decision: Brands/Clusters nest under Configuration → Properties, alongside per-property settings — not their own top-level or MP-specific area.',
      },
    },
  },
};
