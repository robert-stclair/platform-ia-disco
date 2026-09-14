// Rail brand mark — swaps with state.accountType (see renderRail). Real
// brand colors, not the greyscale rail-icon tone: SiteMinder's actual navy
// mark for SM/MP (MP — "SiteMinder Plus" — is a tier of SiteMinder, not a
// separate product, so it reuses the SM mark), and Little Hotelier's own
// mark/orange for LH. Path traced from the real SiteMinder brand mark
// (Figma "Product-Brand-project-2025", node 8588:3465). LH's tile color
// #FF6842 sampled directly from a real LH app-header screenshot (Figma
// "2025 Brand refresh further exploration", node 3001:27249) since that
// file's icon layer wasn't independently exportable at this nesting depth.
export const BRAND_MARKS = {
  SM: '<svg viewBox="0 0 167 167" fill="none"><path d="M141.021 0C155.368 0 167 11.6319 167 25.979V141.021C167 155.368 155.368 167 141.021 167H25.979C11.6319 167 0 155.368 0 141.021V25.979C0 11.6319 11.6319 0 25.979 0H141.021ZM95.4929 62.6431L95.517 112.396L47.3191 121.161V133.598L107.555 122.629C110.862 121.945 113.851 120.131 116.036 117.479C118.219 114.827 119.473 111.49 119.593 108.011V58.2609L95.4929 62.6431ZM59.3905 44.3564C56.0901 45.0491 53.1098 46.8671 50.9342 49.5207C48.7588 52.1744 47.5135 55.5086 47.3976 58.9827V108.736L71.4951 104.351V54.6006L119.696 45.8241V33.3994L59.3905 44.3564Z" fill="#001633"/></svg>',
  LH: '<svg viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="6" fill="#FF6842"/><circle cx="12" cy="8.7" r="2.6" fill="#fff"/><rect x="10.6" y="7.4" width="2.8" height="1.6" rx="0.5" fill="#FF6842"/><path d="M7 17.2c0-2.9 2.2-5.2 5-5.2s5 2.3 5 5.2v0.3H7v-0.3Z" fill="#fff"/></svg>',
};

export const RAIL_ICONS = {
  // LH-only rail item (Front desk) — unattended-counter service bell.
  // EXPLORATORY: first pass, swap for a better icon if this doesn't read
  // clearly at rail size. See CHANGE-QUEUE.md item 5.
  frontDesk:
    '<svg viewBox="0 0 24 24"><path d="M4 15a8 8 0 0 1 16 0"/><path d="M3 15h18"/><path d="M12 5v2"/><circle cx="12" cy="4" r="1"/><path d="M10 19h4"/></svg>',
  insights:
    '<svg viewBox="0 0 24 24"><path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M7 15l4-6 4 3 5-8"/></svg>',
  distribution:
    '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>',
  // Renamed from "transactions" (a receipt/credit-card glyph) alongside the
  // rail item's own rename to "Operations" — a clipboard/checklist reads as
  // "day-to-day operations" rather than payments specifically, since this
  // section covers Reservations/Guest communications/Payments together, not
  // just the payments piece. See nav-data.js's BASE_RAIL_ITEMS comment.
  operations:
    '<svg viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M8 13l2.5 2.5L16 10"/></svg>',
  configuration:
    '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
};
