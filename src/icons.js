// Rail brand mark — swaps with state.accountType (see renderRail). Real
// brand colors, not the greyscale rail-icon tone: SiteMinder's mark for
// SM/MP (MP — "SiteMinder Plus" — is a tier of SiteMinder, not a separate
// product, so it reuses the SM mark), Little Hotelier's own mark for LH.
// Both are the OFFICIAL hosted brand SVGs, copied verbatim (including
// their own gradient/clipPath defs) from
// https://assets.siteminder.com/product/siteminder/2026/sm-logo.svg and
// .../lh-logo.svg — not traced/approximated from a screenshot.
export const BRAND_MARKS = {
  SM: '<svg viewBox="0 0 24 24" fill="none"><g clip-path="url(#clip0_5285_5305)"><path d="M0 3.73333C0 1.67147 1.67147 0 3.73333 0H20.2667C22.3285 0 24 1.67147 24 3.73333V20.2667C24 22.3285 22.3285 24 20.2667 24H3.73333C1.67147 24 0 22.3285 0 20.2667V3.73333Z" fill="#006DFF"/><path d="M13.7265 16.1527L6.7998 17.4124V19.1998L15.4566 17.6235C15.9319 17.5254 16.3612 17.2646 16.6752 16.8834C16.9891 16.5022 17.1693 16.0228 17.1866 15.5228V8.37305L13.7232 9.0029L13.7265 16.1527Z" fill="url(#paint0_linear_5285_5305)"/><path d="M8.5335 6.37446C8.05915 6.47401 7.63112 6.73559 7.31844 7.11703C7.00577 7.49846 6.82668 7.97748 6.81006 8.47682V15.6266L10.2734 14.9967V7.84697L17.2002 6.58554V4.7998L8.5335 6.37446Z" fill="url(#paint1_linear_5285_5305)"/></g><defs><linearGradient id="paint0_linear_5285_5305" x1="26.4016" y1="18.711" x2="4.34258" y2="9.9774" gradientUnits="userSpaceOnUse"><stop offset="0.140249" stop-color="#DAFF8C"/><stop offset="0.976057" stop-color="#B8FFFF"/></linearGradient><linearGradient id="paint1_linear_5285_5305" x1="26.4019" y1="18.7109" x2="4.34286" y2="9.97736" gradientUnits="userSpaceOnUse"><stop offset="0.140249" stop-color="#DAFF8C"/><stop offset="0.976057" stop-color="#B8FFFF"/></linearGradient><clipPath id="clip0_5285_5305"><rect width="24" height="24" fill="white"/></clipPath></defs></svg>',
  LH: '<svg viewBox="0 0 24 24" fill="none"><g clip-path="url(#clip0_5285_11263)"><path d="M21.6 24H2.4C1.072 24 0 22.928 0 21.6V2.4C0 1.072 1.072 0 2.4 0H21.6C22.928 0 24 1.072 24 2.4V21.6C24 22.928 22.928 24 21.6 24Z" fill="#FFF5EE"/><path d="M5.36043 23.1614C5.55243 23.4734 5.79243 23.7454 6.04843 24.0014H7.86443L8.78443 19.2334C6.44843 19.7054 3.86443 20.7294 5.36043 23.1614Z" fill="#FF6842"/><path d="M21.6 0H2.4C1.072 0 0 1.072 0 2.4V21.6C0 22.928 1.072 24 2.4 24H2.464C1.928 22.864 1.696 21.592 2 20.36C2.52 18.28 4.416 17.096 6.328 16.472C7.616 16.056 8.96 15.84 10.304 15.688C14.304 15.248 18.032 15.816 21.92 16.816L21.128 19.92C19.08 19.4 17.688 18.928 15.64 18.816L17.416 23.992H21.6C22.928 23.992 24 22.92 24 21.592V2.4C24 1.072 22.928 0 21.6 0ZM11.976 14.192C10.76 14.192 9.776 13.208 9.776 11.992C9.776 10.776 10.76 9.792 11.976 9.792C13.192 9.792 14.176 10.776 14.176 11.992C14.176 13.208 13.192 14.192 11.976 14.192ZM8.136 8.68L8.04 7.664L9.608 7.512L9.176 2.936L13.136 2.56L13.568 7.136L15.056 6.992L15.152 8.008L8.136 8.68Z" fill="#FF6842"/></g><defs><clipPath id="clip0_5285_11263"><rect width="24" height="24" fill="white"/></clipPath></defs></svg>',
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
  // Guest messaging rail item (v3, Guest Engagement add-on) — a chat
  // bubble with a small guest/person mark inside, reading as "chat with a
  // guest" rather than a generic messaging icon. EXPLORATORY: first pass,
  // swap for a better icon if this doesn't read clearly at rail size (same
  // caveat frontDesk's own comment carries).
  guestMessaging:
    '<svg viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/><circle cx="12" cy="11" r="1.6"/><path d="M9 15.5c.7-1 1.8-1.5 3-1.5s2.3.5 3 1.5"/></svg>',
};
