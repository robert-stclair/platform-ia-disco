# Context

This repo is a working prototype for the Platform 2.0 IA exploration — a clickable nav
wireframe, not a built product. It exists to test navigation *models*, not to ship pages.

Full background, open questions, and the parent rationale live on Confluence and are kept in
sync with the decisions captured here:

- [Platform 2.0 — draft proposal](https://siteminder-jira.atlassian.net/wiki/spaces/SMD/pages/1185284102/Platform+2.0+draft+proposal) — the originating proposal (Robert St Clair). Argues Property Platform's IA evolved around team structures rather than a central UX vision, and that several intersecting pressures (distribution model, IA overload, multi-property, nav UX, design system, agentic workflows, mobile web, global elements) make a strategically-driven redesign the right move now rather than later.
- [IA schemes — prototyping](https://siteminder-jira.atlassian.net/wiki/spaces/SMD/pages/1197277194/IA+schemes+prototyping) — the working decisions log this repo mirrors. Update both when a decision changes.
- The whiteboard nested under the draft proposal page is the live, hand-edited source wireframe this repo's markup is based on.

## Why this shape (wireframe, not sitemap)

Working IA decisions as clickable nav mockups rather than text sitemaps/trees — stakeholders
read a nav mock far more easily than a hierarchy diagram. `nav-data.js` is the thing to edit
as decisions evolve; it drives the rail, panel, and canvas annotations directly.

**See [PATTERNS.md](./PATTERNS.md)** for the catalog of reusable canvas sketch patterns
(sections/media/list, section shapes, the `.wf-list` component) — check it before adding a
new kind of content sketch, and add to it (not a one-off) when a genuinely new pattern is
needed.

**See [NOTES-CLEANUP.md](./NOTES-CLEANUP.md)** for the current full sitemap, the coding
standards this repo should hold to (especially around path/depth handling — the source of
most bugs so far), known remaining inconsistencies, and a suggested order of work for the
next cleanup pass.

**See [IA-BY-USER-TYPE.md](./IA-BY-USER-TYPE.md)** for how the IA differs (or doesn't) across
account types and property counts — the working, more exploratory companion to the settled
decisions below; edit it directly as new type-specific questions come up.

## Decisions captured so far

**Insights is home.** Intentional — Insights doubles as both the landing/dashboard section and
analytics. Not split into a separate "home" concept at this stage.

**"UGC" = user-generated dashboards.** The repeated "UGC" slots under Insights are custom
dashboards a user builds themselves, not guest/review content. Insights sub-nav is: system
Dashboard, Recommendations, then a list of the user's own custom dashboards.

**One IA, not two — property scope collapses/expands contextually.** Single-property and
multi-property are not separate schemes. The same rail and same sub-nav apply across the whole
spectrum (1 property → 2–5, possibly with no MP product licence → 50–100+ enterprise); what
changes is whether a property-scope layer is present:

- For the ~80% single-property accounts, the property-scope layer collapses upward — invisible,
  since there's only one property to scope to.
- For multi-property accounts, it expands into an explicit "Properties" tab/selector. Rate plans
  work the same way: a Properties tab appears, but the top-level surface (Distribution → Rate
  plans) looks identical either way.
- Insights defaults to an all-properties (or last-selection) view for multi-property accounts —
  it isn't a separate MP-specific Insights.
- The differences live in the **secondary/tertiary nav layers**, not in the primary rail, which
  is constant across the entire spectrum.

**Brands/Clusters are Configuration concepts, not a separate MP layer.** Brands, Clusters, and
similar groupings are enablers/setup concerns — they live under Configuration → Properties,
alongside per-property settings, not as their own top-level or MP-specific section. Refined
further below: they're gated by account type (MP), not by property count.

**Account type and property count are independent settings axes.** "MP" is a product some
accounts have (Multi-Property), separate from how many properties an account manages — a
non-MP account can still have many properties. The hidden settings sheet (press `` ` ``) models
this as two independent controls: **Account type** (SM / LH / MP — only SM has real content so
far; LH/MP intentionally render empty until their nav differences are defined) and **Number of
properties** (Single / Multiple — drives the Properties list under Distribution/Configuration,
independent of account type). Within that: the Properties list itself is gated by property
count alone; Brands and Clusters specifically are gated further, only showing for account type
MP (`mpOnly: true` in `nav-data.js`).

**Property settings has direct tabs — no extra nesting layer.** General information / Property
details / Services / Policies / Media library / Integrated systems sit directly on the
"Property settings" panel item — there's no intervening "sublist" wrapping them. A real bug
happened here: an earlier version added a fabricated sublist with invented "Users"/
"Notifications" items sharing a duplicate key with the panel item itself, which caused Booking
engine's content to bleed into Property settings' display. Fixed by giving every navigable node
one consistent recursive shape (see `nav-data.js`'s top comment) — never reintroduce
`tabs`/`sublist`/`properties` as competing sibling properties on the same object.

**Direct Booking (renamed from "Booking engine") has its own sublist**: Selling tools (tabs:
Promotions/Extras) / Setup (tabs: Booking rules/Guest details/Email settings/Translations/About
page/Contact page/Policies page) / Branding (no content yet) / Website (no content yet).
Confirmed from real production screenshots. Configuration's item order is: Property settings,
Users, Direct Booking, Channels Plus.

**Integrated systems (a Property settings tab) is system-count-aware.** With one connected
system it collapses straight to that system's sections (General settings/Inventory settings/
Reservation delivery failure emails/Reservation mappings/Credit card mappings — all real card
titles from screenshots). With more than one system (toggled via the settings sheet) it shows a
system-picker list first, then drills into the selected system's sections. This applies
uniformly regardless of account type or property count — not an MP-only or multi-property-only
concept.

**Folder-style panel items (Direct Booking, MP's "Properties" list) don't auto-navigate on
open.** Clicking one only expands/reveals its children in the panel — the canvas keeps showing
whatever was already routed until the user clicks a specific child. This mirrors a real folder
tree (expanding ≠ selecting) and is visually distinct: an "open" folder is bold with no
background pill; a truly routed/selected item gets the pill. Breadcrumbs only appear once
there's a real multi-level trail (a single root crumb with nothing above/below it is
suppressed as noise).

## Candidate model (not yet decided): libraries vs. assignment

Raised by the user while working through why a portfolio scope switcher didn't make sense on
Distribution's Rate plans/Yield rules once you're inside a specific plan's own detail (see
CHANGE-QUEUE.md's "Foundational, unsolved" section for that thread) — **not yet a decision**,
but promoted here because it reframes several previously-separate open questions as one idea,
not because it's settled.

**The idea:** some Distribution concepts — Rate plans, Yield rules, and likely Extras/Promos —
aren't really "per-property things" or "portfolio-wide things." They're reusable *definitions*
(a library) that get *assigned* to one or more properties as a separate, later act. A rate plan
like "Weekend surcharge" means the same thing everywhere until it's actually attached to a
property; defining it and assigning it are two different acts that today's IA conflates.

**Why it's appealing:**
- It resolves the "does the switcher belong here" question at the list level entirely — you're
  not scoping a view of properties when browsing the library, so the list needs no scope
  switcher at any property count. Scoping only matters at the assignment step (a Properties tab
  on the specific rate plan/yield rule, mirroring `buildUserNode`'s Properties tab — not yet
  built for `RATE_PLAN_NODE`/`YIELD_RULE_NODE`).
- It collapses invisibly for single-property accounts (~85% of accounts) — the library just
  looks like "here's my list of rate plans," same as today, no new concept to learn. For MP
  accounts it becomes genuinely useful: define once, assign to several properties or a cluster,
  rather than redefining per property.
- Consistent with "one IA, not two" (see above) — the same list page works unchanged across the
  whole single→MP spectrum; only whether the assignment step has more than one property to
  choose from changes.
- Connects to (without fully resolving) the bulk rate distribution tension noted below, and to
  Channels' own bulk-management open question (CHANGE-QUEUE.md item 9's follow-up).

**Where it doesn't obviously fit — flagged as a live doubt, not resolved:** Room types was
floated as a possible fourth example (echoing the speculative "manage centrally across
properties" aside from the Distribution batch — see `PROPERTY_NODE > Room types` in
`nav-data.js`'s type-retrofit table), but the user pushed back: a room type isn't a
context-free reusable definition the way a rate plan is — "Deluxe King" at Property A and
"Deluxe King" at Property B are two physically distinct rooms that happen to share a name/
category, not one thing being reused. Centralizing it as a true library item risks implying a
shared identity that doesn't really exist; it may be closer to "a shared category label
optionally applied when creating a room type per property" than a real library/assignment
split. Don't fold Room types into this pattern as a confirmed example — it needs its own
thinking.

**Not yet built anywhere in this prototype** — `RATE_PLAN_NODE`/`YIELD_RULE_NODE` are still
plain stubs with no Properties/assignment tab, and Distribution's scope switcher still shows
uniformly across all its items (see CHANGE-QUEUE.md). This section exists to hold the shape of
the idea, not to describe current behavior.

## Candidate model (not yet decided): scope switcher rule + sticky per-instance scope

Grew out of the user asking "is there a way to get the top-level IA to a state where for the
major sections it's either switcher or no switcher, for a clean mental model" — worth reading
alongside the libraries-vs-assignment section above, since both came out of the same
conversation about Rate plans. **Not yet built — nothing in this prototype's code reflects
this yet.** `state.scope` is still one shared, non-persistent value reset by `resetPath()` on
every section switch (`src/main.js`), and `scopeSwitcher` is still a per-SECTION flag
(Insights/Distribution wholesale), not per-item.

**The rule that emerged (page-type, not section-level):** a rail section is not uniformly
switcher/no-switcher — the answer instead follows the *kind of page*, and this cuts across
rail sections:
- **Reporting/status pages get it**: Insights' Dashboard (system + starred/promoted), My
  insights' Dashboards, Recommendations, and Distribution's Health check. Confirmed one at a
  time by the user, including an explicit reversal on Charts mid-conversation (see below) — do
  not treat any one confirmation as generalizing to the others without asking.
- **Library/definition pages don't get it**: Distribution's Rate plans/Yield rules LISTS (see
  the libraries-vs-assignment section above) — browsing a library isn't a property-scoped
  activity, full stop, at any property count. This specific case (Rate plans/Yield rules lists)
  is still pending the user's direct confirmation — flagged as the leading candidate, not yet
  asked outright.
- **My insights' Charts — confirmed to KEEP the switcher, after a real reversal worth noting
  for how this reasoning can go wrong:** first pass reasoned Charts are "portfolio-wide by
  nature" (a comparison chart makes more sense across properties than pinned to one) and
  concluded no switcher was needed at all. The user corrected this: chart authoring needs a
  data source, which raised the question of whether scope should be fixed at chart-creation
  time instead of adjustable while viewing — but the user then clarified scope is NOT part of
  a chart's configuration, since "the scope can be changed anyway when it's on a dashboard."
  That reasoning means Charts behaves exactly like Dashboards after all — switcher stays. The
  lesson: "portfolio-wide by nature" was the wrong test — the right test is whether scope is
  meant to be changeable at VIEW time, independent of what makes sense to build/author with.
- **Inventory remains its own unresolved quandary** (see the Distribution section further up)
  — doesn't fit cleanly as reporting or library; not resolved by this rule.
- Distribution, Configuration, and Transactions have not yet been walked through item-by-item
  against this rule — Insights is the only section fully interviewed so far (see below).

**Per-section audit — COMPLETE**, done as a one-question-at-a-time interview across all four
rail sections (item by item, not assumed from the page-type rule alone — Insights itself needed
real back-and-forth on Charts before landing correctly, so treat each answer below as a
specific confirmed decision, not a pattern to extrapolate further without asking):

- **Insights.** Dashboard (system + starred/promoted): switcher. Recommendations: switcher (a
  recommendation can be property-specific, e.g. "this property should adjust its rate"). My
  insights → Dashboards: switcher. My insights → Charts: switcher (see the reversal above — do
  not remove this again without re-confirming).
- **Distribution.** Rate plans list, Yield rules list: NO switcher — confirmed as libraries,
  browsing definitions isn't a property-scoped activity (see libraries-vs-assignment section
  above). Health check: switcher (reporting/status, no assignment flow underneath it). Inventory
  gets a THIRD shape, not simply switcher/no-switcher — see its own write-up just below.
- **Configuration.** Switcher-free for Properties, Users, Channels — already "pick a
  property/entity, manage it directly," a portfolio viewing switcher adds nothing on top of
  inherently single-entity management. **CORRECTION, don't treat as settled: the Products group
  (Direct Booking, Channels Plus, Metasearch) is explicitly EXCLUDED from this "switcher-free"
  call — see the dedicated open thread below.** The blanket answer was given before that group
  was considered specifically, and turned out to be premature for it.
- **Transactions.** Switcher-free entirely (Reservations, Guest communications, Payments) — a
  transaction inherently belongs to one property's booking; no portfolio-wide view was judged
  to make sense here, same logic as Configuration.

**Inventory's resolution — a third shape, distinct from both "switcher" and "no switcher":**
neither a page-level switcher (can't show "all properties" in one grid) nor purely switcher-free
(an MP user still needs a way to see a specific property's inventory) fit. The shape that
emerged: **borrow Configuration's existing Properties picker-then-drill-in pattern as the entry
mechanism** — an MP user lands on Inventory and gets a property picker first (no default, no
"all" option — must choose one), a single-property account skips the picker entirely and lands
straight on its one property's grid (identical collapse logic to Configuration's Properties
today — the user's own framing: "it's the same as what we are doing for property settings in
principal"). The ONE addition beyond Configuration's existing pattern: once inside a specific
property's inventory, a switcher stays available to hop to a different property directly,
without backing out through the picker screen again — Configuration's picker today has no such
after-the-fact switch affordance. Not yet built in this prototype — Inventory currently still
shows the same uniform "All properties"-default switcher as the rest of Distribution (see
CHANGE-QUEUE.md); this write-up is the target shape, not current behavior.

**Candidate model (not yet decided): scope is remembered per switcher INSTANCE, not global.**
The user is "leaning" this way but flagged the implication explicitly: if scope is sticky, it
can't just be sticky for one dashboard as a special case — "every instance of switcher needs
to be independent and sticky," meaning this is an architecture question, not a per-page
setting. Concretely: today's single shared `state.scope` (reset globally on every section
change) would need to become scope-per-dashboard/report — e.g. "Weekly performance" remembers
being viewed at "All properties" while "Portfolio health" remembers being scoped to a cluster,
independently, persisting across visits (not just within one session — this hasn't been asked
outright, but "remembered" implies more than in-memory-only). **Confirmed: a switcher instance
with no saved scope yet defaults to "All properties"** — no inheriting from whatever scope was
last used elsewhere, a deliberately simple, predictable baseline. Real open implementation
questions, not yet decided: where this persisted state actually lives (this is a static
front-end prototype — real persistence would need something like `localStorage` keyed per
dashboard, which is a meaningfully bigger lift than the current single in-memory value); and
whether "sticky" means forever or just per session. Don't build this until it's picked back up
— it changes the switcher from a page-level display control into effectively a saved property
of each dashboard/report, which resonates with (but is a separate decision from) the
libraries-vs-assignment idea above.

## Candidate model (not yet decided): notification-driven narrow surfaces vs. full browsable IA

Grew out of a direct question — "what might be a common pattern to surface notifications?" —
that turned into something bigger once the user connected it back to a design move already
made elsewhere in this project. Not yet a decision, not yet applied anywhere beyond Health
check (which arrived at this shape independently, before the pattern was named).

**The two competing instincts, named explicitly by the user:**
- **Instinct A (what most of this session's work has been doing):** take a real production
  surface — however many items it has — and find it a home: reorganize, split, tab-ify, but
  ultimately still make the full breadth of it separately navigable. Pay's original 10 items,
  Transactions' new tabs, Connectivities/Integrated systems as full tiles — all built this way,
  on the assumption that a user goes LOOKING for these pages.
- **Instinct B (what Health check already does, without it being named as a pattern yet):**
  don't surface everything as separately navigable. Build something NARROWER and PURPOSE-BUILT
  — exists specifically to answer "is something wrong, and where" — and nothing more. Health
  check was already simplified this way earlier in the project: 7 real, confirmed tab names
  (Failed PMS deliveries, Delayed updates, Disabled channels, etc.) collapsed into ONE generic,
  titleless status page, deliberately not making each area its own navigable destination.

**The connection the user drew:** notifications (a bell/badge pattern, discussed as two common
approaches — a central bell+dropdown feed, vs. contextual badges on the specific nav item
that's affected, e.g. a red dot on "Payments" if there's a failed automated payment) aren't
really a bolt-on feature — they're the SAME underlying move as Health check, applied nav-wide.
Instead of making every "something might be wrong here" area (a failed payment, a mapping
error, a disabled channel) a full section a user has to go find, a badge/alert layer means the
PRODUCT surfaces where to look, and the user drills in only when there's something to actually
act on — a much thinner "browse everything" surface behind it (or none at all).

**Why this matters for what's already built:** this doesn't invalidate this session's IA work,
but it reframes the real next question for several areas built as full browsable sections —
Pay's items, Transactions' tabs, Connectivities/Integrated systems (see the open thread just
below on consolidating those two) — none of which have actually been asked "is this a browse-
regularly surface, or a notify-me-and-let-me-drill-straight-to-the-one-thing surface?" Health
check answered that question correctly for itself; the rest were only structurally organized,
not designed against this distinction.

**Refined into a clean three-way split, once the user connected it to what already exists —
this is the CURRENT leading shape of the model, more concrete than the badge/bell framing
above:**

- **Recommendations** (already in the IA, under Insights) — OPTIMIZATION-focused, portfolio/
  account-wide framing: "here's something you could do better," not broken, just an
  opportunity.
- **Health check** (already built, simplified to one generic status page) — BROKEN-focused,
  same portfolio/account-wide framing: "here's something actually failing" — connectivity
  issues, mapping errors, disabled channels.
- **Contextual recommendations** (NOT YET built, a newer concept) — same optimization spirit as
  Recommendations, but LOCALIZED to wherever the user already is, rather than its own
  destination. The user's own framing: "I feel that can be more like the sub-dashboards — they
  provide an opportunity to highlight any missing fields etc." This is NOT a new mechanism to
  invent — it's the actual confirmed PURPOSE of `nav-dashboard`'s existing `tile.tip` field
  (PATTERNS.md), which was speculatively built during the Rate plans work with a broken-flavored
  example ("2 channels not connected") before this session named what it's really for.
  Recharacterize `tip`'s intended content as optimization/missing-field tips (contextual
  recommendations), not primarily failure/status signals — that's Health check's job at the
  global level, not a per-tile tip's.

**What this means for the areas flagged earlier as badge/alert candidates:** most of what
seemed to need its own per-area notification treatment (Connectivities/Integrated systems
needing a badge, Automated payments' "failed" state needing an alert) likely does NOT need a
THIRD, separate notification system — it should probably just FEED INTO Health check (if
broken) or Recommendations/contextual recommendations (if optimizable), rather than inventing
bespoke badges scattered across every area. The three-way split (global-broken /
global-optimize / local-optimize) may be sufficient on its own — a genuinely separate
notification-badge system is now the less likely direction, not confirmed abandoned.

**Not yet resolved:** whether ANY area still needs a true badge/alert affordance beyond these
three surfaces (e.g. is a red dot on a rail item ever still warranted, or does everything route
through Health check/Recommendations?); how "broken" items surfaced elsewhere in this app
(a failed automated payment, a disabled channel) actually get INTO Health check's feed
mechanically; whether contextual recommendations needs its own visual distinction from a plain
status tip, or reuses the same `tile.tip` rendering as-is. Revisit before building any of this.

**BUILT — first concrete pieces** (see CHANGE-QUEUE.md's "Notification candidate-model" batch
for the full writeup): (1) a new `item.badge: true` panel-list pattern — an illustrative dot (no
count), applied to Health check, Recommendations, and Dynamic pricing's own L2 items,
deliberately NOT on rail icons (avoids the rail-aggregation question above). Color is a
DELIBERATE exception to this project's greyscale-only rule — "make the dot red - it doesn't
really parse as black" — via a new `--alert` token scoped to just this element. STATIC, not
dismissible: a dismiss-on-visit interaction was explored (first per-visit, then refined to
per-section-visit) and then explicitly dropped — "maybe it's too much to bother with the
dismiss?" — since nothing in this prototype tracks real resolved/unresolved state to make a
dismiss meaningful; the real-product "clears once addressed" behavior stays documented as
INTENT here, not simulated in code. (2) Recommendations converted from a plain `sketch:'list'`
to a real `dashboard-cards` page — "make that recommendation page richer like a dashboard of
its own." A "concept of groupings" inside Recommendations was floated and explicitly deferred
as a later-stage idea, not built — don't add grouping structure without picking this back up.
Contextual recommendations (the `tile.tip` recharacterization) is now built for its first
instance: Config → Property's tiles (`buildPropertyNode`) — Property details ("2 required
fields missing"), Channels ("No channels connected yet"), Integrated systems ("Not connected to
a PMS") all carry real tip text now, gap/opportunity-framed to match the "optimize" flavor of
this concept. Scope was deliberately narrowed to Config → Property first, not "both" — Rate
plan's own Overview tiles (Rooms/Channels/Connectivities/Properties) still show only the plain
skeleton tip bar, not real text; extending this concept there is a legitimate next step, not yet
requested.

**Generalized further, and named: "navigation also becomes recommendation."** The user's own
framing, stated after seeing the tile stat+tip split in browser. A nav-dashboard tile isn't just
a link with an occasional warning bolted on — every tile can carry a routine, always-on status
stat ("5 channels connected, 2 awaiting setup," "4 room types"), with an attention callout layered
on top only where something's actually missing ("1 missing media," "Not connected to a PMS").
That's the mechanism (`tile.stat` + `tile.tip`, two separate fields — see PATTERNS.md's
"Navigation dashboard" section) — but the THESIS is broader than the mechanism: plain navigation
and contextual recommendation aren't two different surfaces competing for space, they're the
same surface doing both jobs at once. A tile you'd click anyway to check status is already the
right place to notice something needs attention, without a separate notification system
interrupting to tell you. Built for all 6 of `buildPropertyNode`'s tiles; Rate plan's Overview
tiles haven't adopted it yet (see above).

**Correction — `tip`'s DISPLAY, not the thesis, needed a second pass.** The first build rendered
`tip`'s text as a badged chip right on the dashboard tile. Live, with Property details/Room
types/Integrated systems all carrying one at once, the user caught the actual effect: "it might
be too much negative noise on the dashboard level. Maybe just an indicator that there are
recommendations - a dot? and then show them in more detail when user clicks through." Multiple
loud callouts stacked on one screen reads as alarm/failure, which contradicts the whole point of
this being the "optimize" flavor, not Health check's "broken" flavor. Resolution: a two-tier
disclosure — the dashboard tile shows only a plain dot (same visual language as the panel-item
badge, no wording, no color block), and the actual explanation moved to a banner on the tile's
own destination page, shown once the user clicks through (`renderTileTipBanner` in `main.js`).
The "navigation also becomes recommendation" thesis stands unchanged — a tile still does both
jobs at once — it's just disclosed progressively (quiet signal → real detail) instead of
announcing everything at the list level simultaneously. `tile.stat` is unaffected by this
correction; only `tile.tip`'s presentation changed.

**A related, but genuinely SEPARATE fourth concept surfaced alongside this: "Notifications"
(user-account-focused, not property/portfolio-focused) — NOW BUILT.** The user's own original
framing: "notifications might be more user-focused - account stuff etc. if we get around to
adding it." This is DIFFERENT from all three items in the split above — Recommendations/Health
check/contextual recommendations are about the PROPERTY or PORTFOLIO ("something here needs
attention"); this fourth concept is about the USER'S OWN ACCOUNT (session/security/billing-style
things — "your password will expire," "you were mentioned," account-level, not property-level).
Logged as lower priority at the time ("if we get around to it") — picked back up once the gap
became concrete: "it has become a bit of a gap this would solve for." Built as a new rail button
(bell + red dot) above the avatar, switching to its own `notifications` section — L2 is the
notification list itself (a real `records` picker, generic-realistic sample entries: "Your
password will expire in 3 days," "You were added to a new property," etc.), and — deliberately,
even with no real notification data or taxonomy confirmed yet — clicking one opens a real (if
generic) skeleton detail page, not a dead end: "we could wireframe a detail view even though we
dont currently have it." Built alongside a new AI assistant rail button (circled "?" — an
agentic in-product assistant, explicitly NOT framed as human support chat or branded with a
sparkle) and two new My account items, Communication and Preferences (the latter now holding
this prototype's first genuinely live control — a moved-in, skeleton-styled theme toggle). See
CHANGE-QUEUE.md's "Rail utility icons" batch for the full build.

## Confirmed principle: what promotes a Config tile to the property's top level

`buildPropertyNode`'s tile grid (Config → Property) has now had several items move between
"top-level tile" and "tab nested inside Property details" — Room types and Media library were
both lifted OUT to top-level tiles; Users is gated to only appear for multi-property accounts.
Enough of these have happened that the underlying rule was worth stating explicitly rather than
re-deriving it case by case. Asked directly ("is this pattern of things moving between L2/tile
level in MP mode good?"), the user's answer was the actual rule, not a vibe:

**A tile's placement is decided by whether the concept is fundamentally SCOPED TO THE PROPERTY
or SCOPED TO THE ACCOUNT — not by frequency of use, not by "does this look cleaner," and not by
account type directly.** Room types and Media library are property-scoped concepts (a room type
or a photo means nothing outside the one property it belongs to) — they belong at the
property's own top level regardless of account type, which is why BOTH were lifted out for
single- and multi-property accounts alike, not just MP. Users is different: individual users
are an ACCOUNT-level concept (a person's access can span every property on the account) — "which
users have access to THIS property" is only a meaningful, distinct question once there's more
than one property to disambiguate between. For a single-property account that question
collapses to "which users are on the account" — i.e. Config → Users — so showing a Users tile on
the property page too would just duplicate it. That's why Users is gated by `showProperties`
while Room types/Media library are not: the gate tracks account-vs-property SCOPE, and
multi-property just happens to be the condition under which "users on this property" becomes a
question distinct from "users on the account," not a rule of its own.

Apply this test to any future tile-placement call on `buildPropertyNode` (or an equivalent
grid): ask "does this concept exist independent of how many properties the account has,
belonging to the property alone?" — if yes, it's a property-scoped concept and belongs at the
top level unconditionally. If the concept is really about the ACCOUNT and only turns into a
property-specific question once there are multiple properties to choose between, gate it by
`showProperties` instead of promoting it unconditionally.

**Addendum — a single-property flattened variant was tried and explicitly reverted; the card
grid stays the surface for every account type.** The rule above says a property-scoped concept
belongs at the property's own top level; the first attempt at applying it to single-property
accounts flattened Room types/Media library into their own flat rail items instead of tiles,
reasoning that single-property has no properties-list level to drill through (`buildConfigurationPropertiesItem`
reuses `buildPropertyNode`'s content DIRECTLY as the flat Config → Property L2 page), so a tile
felt like one unnecessary level of nesting. The user caught the actual consequence of that
change live: "this start to mean that single property doesnt get the cards at all - and the
property L2 items become property details." That surfaced the real tradeoff — the card grid
isn't just a container solving tab-overload, it's the SURFACE `tile.tip` contextual nudges are
built on ("2 required fields missing," "Not connected to a PMS"); a flat rail item has no
equivalent slot for that. The user's resolution: "its actually more about whats a better surface
- the dashboard allows us to do the contextual hints and nudges - i suspect its the richer
solution." So the card grid wins on its own merits, independent of the property-vs-account-scope
test above — Room types and Media library are tiles on `buildPropertyNode` for EVERY account
type, including single-property, and the single-property flattened variant (which briefly existed
as `buildPropertyNode`'s `includePropertyLevelTiles` parameter and a `buildConfigurationPropertiesItem`
array-return) was fully reverted. The scope test still decides WHETHER something is promoted out
of Property details' tab strip at all (that part holds); it does NOT decide tile-vs-flat-item —
that's decided by which surface can carry a contextual tip, and today that's always the card
grid. Don't re-flatten Property's tiles for single-property without picking this back up.

## Open threads (not yet resolved)

- **"Connectivities" and "Integrated systems" are the SAME concept, named differently by
  account type — RESOLVED on Config → Property, still open on Rate plan.** User's own framing:
  "connectivities and integrated systems are actually the samer thing... MP uses
  connectivities, I think platform uses integrated systems." On `buildPropertyNode` (Config →
  Property) the standalone Connectivities stub tile has been REMOVED — Integrated systems
  (`type: 'systems'`, system-count-aware, General settings/Inventory settings/Reservation
  delivery failure emails/Reservation mappings/Credit card mappings) is now the only tile for
  this concept there. Still NOT resolved on `buildRatePlanNode` (Rate plan's own Overview tile
  and Connectivities tab) — that's a separate, untouched instance of the same best-guess
  `sketch:'list'` stub, still sitting alongside Rate plan's own tabs as its own thing. Whether
  Rate plan gets the same treatment (removing its Connectivities in favor of some
  Integrated-systems equivalent, or an account-type label swap) is not yet worked out — don't
  implement without picking this back up.
- **The "Transactions" rail section's name — RESOLVED, renamed to "Operations."** Originally
  surfaced naturally, not as a direct request: mid-conversation the user asked to add "a section
  called Transactions" before realizing the top-level rail item (credit-card icon) was ALREADY
  called that — "oh ok - i forgot it was called that," logged as an open question with no
  replacement chosen. Picked back up and resolved: "lets rename transaction rail to operations."
  Both the rail item's `label` AND its internal `key`/tree-property (`transactions` →
  `operations` in `nav-data.js`) were renamed together, not just the visible label — an internal
  key that no longer matched its own visible name would have been its own confusion later. Icon
  also changed, from the old receipt/credit-card glyph to a clipboard-with-checkmark
  (`icons.js`'s `operations`) — chosen because "Operations" covers Reservations/Guest
  communications/Payments as the day-to-day running of a property, not payments specifically, so
  a payment-flavored icon no longer fit. The L2 item's own content is unaffected — still
  Reservations/Guest communications/Payments, same as before this rename. **Icon redrawn once,
  live** — the first version used a large near-full-viewBox `<rect>` for the clipboard body,
  which read visibly heavier/blockier than the other three rail icons' thin, open line-strokes:
  "the clipboard icon looks a bit roughly rendered compared to the other." Redrawn as a proper
  open-outline clipboard (body path with a gap at top for the clip, a small separate clip-tab
  rect, a checkmark) at the same visual density as the chart-line/globe/gear icons alongside it.
- **Products group's property scope (Direct Booking / Channels Plus / Metasearch) — BLOCKED on
  business logic, not a nav-design question yet.** The premise itself isn't confirmed: it's not
  known whether these products' config (Direct Booking's Selling tools/Setup — Booking rules,
  Guest details, Email settings, Translations, About page, Contact page, Policies page —
  Channels Plus, Metasearch) is per-property, account-wide, or a mix across the group. The
  user's own framing: "it's not clear if they make sense across a portfolio or not — business
  logic to uncover first." Don't design a nav mechanism for this before that's answered — a
  premature answer already had to be corrected once (Configuration was initially called
  entirely switcher-free above, before this group was considered specifically).
  - **If they turn out to be per-property**, a structural tension was identified: drilling into
    any entity in this app already "spends" the L2 sidebar — it collapses to one root item and
    all real structure moves into canvas tabs (see `PROPERTY_NODE`'s 8 tabs). If a product's own
    config ALSO needs a property-selection layer on top of its existing tab structure (Setup
    alone is already 7 tabs), that either double-nests navigation inside the canvas (real
    overload risk, user's explicit concern: "we also don't want overloaded tabs which could
    easily happen") or leaves the sidebar sitting idle exactly when a second nav layer is
    needed. Not resolved — logged as the shape of the problem, not a chosen fix.
  - **A candidate mechanism was floated, but is now itself corrected/incomplete — do not build
    from it as stated:** the first idea was "property selection lives in the sidebar as a list,
    same as Configuration's Properties." The user rejected this specifically because of scale —
    "I don't like unbounded lists in a navigation section — for large MP groups that could be
    hundreds of properties." This is actually a live problem in what's ALREADY built too, not
    just this new case: `SAMPLE_PROPERTIES` and any future picker (Inventory's proposed one
    included) render a flat list, which is fine for a handful of sample names but wrong at real
    enterprise scale (CONTEXT.md's own reference data cites 50–100+ property accounts). Whatever
    property-selection mechanism gets designed anywhere in this app likely needs to be a
    searchable/typeahead picker (type to filter, select — closer in shape to a `<select>`
    dropdown than a rendered list), probably leveraging Brands/Clusters as a narrowing layer
    before individual-property search, rather than a scrollable name list — this applies
    retroactively to Configuration's existing Properties picker too, not just new cases.
  - **A further candidate — persistent switcher for all of Configuration — was raised and
    explicitly NOT adopted as a premise:** "if all of Config was single property we'd want some
    kind of persistent switcher, but I don't think it necessarily is." I.e. IF Configuration
    turned out to be uniformly per-property, a persistent switcher (visible throughout
    Configuration, letting you hop properties without re-drilling a picker each time) would be
    the coherent answer — but the user does not believe that premise holds, so this is not
    something to build toward without the underlying per-item business logic being confirmed
    first. A mixed answer (some Configuration items per-property, some account-wide) would need
    a different, not-yet-designed treatment — one uniform switcher would misrepresent whichever
    items aren't actually property-scoped.
  - **Other reference shapes discussed, not chosen, kept for whenever this is revisited:** (1)
    a persistent account/entity switcher pinned to the top of an otherwise-unchanged sidebar
    (Stripe Connect's connected-account switcher shape) — keeps the sidebar alive rather than
    collapsing to one item; (2) nested sidebar tree instead of a flat tab strip for anything with
    real depth like Setup's 7 items (Google Workspace admin's pattern) — tabs reserved for 2-4
    true peers, sidebar handles hierarchy. Neither has been evaluated against confirmed business
    logic yet, so neither is a decision.
  - **Hiding the L2 sidebar until a property is picked was raised and rejected.** The idea:
    for MP, hide the sidebar entirely (full-width canvas, just the picker) until a property's
    selected, then bring the sidebar back with that product's real structure. Rejected on the
    grounds that it breaks the one consistent promise the sidebar makes everywhere else in this
    app — always present, even showing very little (e.g. a single collapsed root item) — right
    at the moment (mid-navigation) a user most needs that landmark. It would also be a
    DIFFERENT use of the existing `noPanel: true` mechanism than its only current usage (Front
    desk's calendar, permanently full-width for that whole section) — this would need the panel
    to flicker in and out based on in-section picker state, not stay fixed per section. Leaning
    instead toward: the sidebar always shows SOMETHING (the picker/grouping itself lives in the
    L2, rather than the L2 disappearing to let the canvas show it) — consistent with how
    Configuration's Properties list already behaves (L2 shows the property list until drilled
    in, then collapses to one root item, structure moves to canvas tabs). Not fully resolved,
    but the "hide the whole bar" version is set aside.
  - **Emerging candidate: split Configuration's OWN L2 into "Portfolio" and "Property" groupings,
    not a new rail item.** Raised by the user directly: "maybe L1 needs to split into
    portfolio-wide config and property-level config — but it'd be nice to keep it all pretty
    close for MP vs. the single scenario." Weighed against two shapes (asked directly, chosen
    explicitly): (a) keep it inside Configuration's existing L2 via a grouping heading (same
    pattern already used for "Products" — see `{ heading: true, label: 'Products' }` in
    `nav-data.js`), one heading for portfolio-wide items and one for property-level items,
    OR (b) a genuine second L1/rail item, shown only for MP/multi-property accounts (same
    conditional mechanism Front desk already uses for LH). **Chosen: (a), inside Configuration's
    L2.** Reasoning: truest to the existing "one IA, not two" decision — the rail stays
    IDENTICAL for every account type/property count, always. A single-property account would
    simply never see the "Portfolio" heading/group at all (nothing to group under it), the same
    invisible-collapse trick already used for Brands/Clusters and the whole Properties layer —
    not a new kind of asymmetry, an extension of one already established. NOT YET BUILT: this
    requires the per-item business-logic question above (which specific items are portfolio vs.
    property scoped) to be answered first — this entry captures the STRUCTURAL shape the split
    should take once that's known, not an implementation to do now.
  - **Leading candidate, arrived at through several rejected alternatives: tabs move one level
    deeper, a contextual dashboard becomes the new landing step after any entity drill-in —
    for BOTH single-property and MP, not an MP-only surface.** This is the resolution to the
    whole "L2 collapses to nothing, tabs absorb all the depth, MP needs a level nothing else
    has" thread above. Arrived at by first floating a canvas-level secondary sidebar (rejected —
    "I don't want another visible nav surface, it signals complexity, we want to make the
    complexity calm"), then a per-tab sub-nav (chosen only as the lesser of two options, then
    immediately flagged as still an MP-only surface — "a different surface introduced only for
    the MP use case which kind of feels like a fail," echoing the same "one IA, not two"
    principle already established elsewhere in this doc), before landing here.
    - **The actual mechanism:** drilling into any entity (a property, Direct Booking, etc.) no
      longer lands directly on a tab strip. It lands on a contextual DASHBOARD — reusing the
      `dashboard-cards`/`sections` sketch pattern this prototype already has (currently used for
      Insights/Health check), one card per sub-area (e.g. Direct Booking: Selling tools /
      Setup / Branding as three cards, not three tabs). Clicking a card goes one level deeper,
      via breadcrumb, to that specific sub-area's actual content — which may STILL be a tab
      strip at that point, if that specific sub-area genuinely has tab-like peers underneath it
      (e.g. once inside "Setup," Booking rules/Email settings/Translations/etc. could remain
      tabs, now isolated from Selling tools/Branding rather than competing with them at the same
      level). Tabs aren't eliminated — they're demoted from "the first thing you see after
      drilling in" to "the structure inside one specific card, only where a sub-area actually
      needs them."
    - **Why this satisfies "one IA, not two" where the sidebar and per-tab ideas didn't:** the
      contextual dashboard is IDENTICAL for single-property and MP — a single-property Direct
      Booking user sees the exact same Selling tools/Setup/Branding cards an MP user sees after
      picking a property. Nothing is invented specifically for MP; only how you ARRIVE differs
      (MP picks a property first via the existing Properties-list convention, single-property
      skips straight to it via the existing collapse convention) — same asymmetry pattern
      already used everywhere else in this app, not a new one.
    - **What this implies for the L2 sidebar** (the other half of the same idea): once entity
      content moves to a contextual dashboard instead of tabs, L2 is freed to hold only things
      that are genuinely NOT part of that entity's own dashboard — "anything truly global sits
      in the L2 panel" (user's own framing). For Configuration this likely means L2 continues
      to hold the entity picker (Properties list) plus true account-wide items, while everything
      specific to whichever entity is drilled into lives in that entity's own contextual
      dashboard, reached via breadcrumb — not tabs, and not a second sidebar.
    - **BUILT — `nav-dashboard` now has TWO modes, not one, after a direct reversal on Rate
      plans specifically.** First pass built Rate plans as a STANDALONE nav-dashboard (tab strip
      replaced entirely, tiles pushed a real path level — the original "tabs move a level
      deeper" shape). The user then reversed this once they saw it: "I now realise Rate plans
      don't need the extra level" — Rate plans was never actually the tab-strip-overload case
      (only 3-4 tabs), that's `PROPERTY_NODE`'s problem, not this one. What Rate plans DOES
      benefit from: a tab strip that still exists, PLUS a status-aware dashboard living inside
      its OWN default tab — "they could maybe benefit from this as a sub-dashboard under a
      default tab heading, the tiles would link to tabs but provide real time tips on what is
      not set up etc." Config → Properties (`PROPERTY_NODE`) is confirmed to still need the
      original standalone/replacing shape: "in config → properties I think we will need the
      extra level." Explicit instruction: "keep this as a page type that can appear in a tabbed
      view or a non tabbed view."
      - **Mode (a), standalone** (`PROPERTY_NODE`, BUILT — see below): tiles are real child
        Nodes (`tile.content`), clicking one pushes a path level, breadcrumb takes over, no
        persistent tab strip. This is the ORIGINAL shape, unchanged.
      - **Mode (b), nested in a tab** (Rate plans' actual shape, BUILT — see
        `buildRatePlanNode` in `nav-data.js`): the tabs node keeps its normal strip
        (Overview/Rooms/Channels/Connectivities/Properties); "Overview" (the default/active tab)
        has a nav-dashboard as ITS content; each tile uses `linksToTab` (a sibling tab's key)
        instead of its own content — clicking a tile just SWITCHES the active sibling tab, same
        as clicking the tab strip directly would ("switches the tab... matches how a normal tab
        click already works," confirmed explicitly), no new path level, tab strip stays visible
        the whole time. Mechanically: `resolveChain`'s `tabs` branch stamps its own `pathIndex`
        onto a nested nav-dashboard as `content.parentTabsPathIndex` at the one point the two
        node types meet; a `linksToTab` tile's `data-path-key` targets that index instead of
        pushing one of its own (`renderChainBody`'s `nav-dashboard` branch, `targetPathIndex`).
      - **Tiles can carry a real-time-feeling status tip** (`tile.tip`, optional — real string
        when decided, skeleton bar otherwise) — "provide real time tips on what is not set up
        etc." Not live data yet, just the SHAPE (`.nav-dashboard__tile-tip`/`-skel` in
        `style.css`) — every current instance leaves `tip` unset.
      - Rate plans' list itself also changed shape alongside this: the picker is now a table
        skeleton (`display: 'table'` on the `records` content type — real, clickable names in
        column 1, skeleton-only cells elsewhere, no real headers), not a plain list.
      - The tile set (Rooms/Channels/Connectivities/Properties[MP]) is explicitly NOT closed —
        "there will be others I haven't thought of yet."
    - **BUILT — `PROPERTY_NODE` converted to mode (a), standalone**, superseding "Property
      settings has direct tabs — no extra nesting layer" above (the 8-tab strip that pattern
      described no longer exists as a flat strip). Confirmed mode (a), not (b) — "in config →
      properties I think we will need the extra level." Final tile set, arrived at via a
      dedicated back-and-forth on which of the old 8 tabs become tiles vs. sub-items (worth
      reading in full since it wasn't a simple 1:1 conversion):
      - **Property details** (tile) — drills into a NEW sub-node (`PROPERTY_DETAILS_NODE`, a
        normal `tabs` strip: General information / Room types / Services / Policies / Media
        library). Most of the old 8 tabs moved HERE, not to top-level tiles — "those move to a
        level under property details, or at least most of them."
      - **Channels, Connectivities** (tiles) — brand new, not on the old 8-tab list at all;
        same best-guess `sketch:'list'` stub treatment as Rate plans' own Channels/
        Connectivities tiles, mirroring that tile set intentionally.
      - **Integrated systems, Users** (tiles) — explicitly kept at the TOP level, NOT folded
        under Property details with the rest: "users and integrated systems move to the top
        level under property[,] the nav dashboard." Content unchanged from before.
      - **Naming collision, resolved:** the OLD tab strip already had a tab called "Property
        details" (Property/Contact/Extra information fields) — different from the NEW
        top-level tile of the same name. Resolved by folding the old tab's fields into General
        information (now: Currency/Inventory/Language and region/Property/Contact/Extra
        information, 6 sections) rather than keeping two same-named things at different levels
        — user's explicit call: "old 'Property details' becomes part of General information."
      - `PROPERTY_NODE`'s two existing call sites (`buildConfigurationPropertiesItem`'s
        single-property collapse, and the multi-property Properties list's `detailNode`) both
        needed zero code changes — both only ever referenced `PROPERTY_NODE`/`.content` as an
        opaque value, never assumed its internal shape.
    - **`BOOKING_ENGINE_LIST` (Direct Booking) is NOT yet converted** — still lands directly on
      its own tab/sublist structure, untouched by this pattern so far.
    - **Framing to pick this back up with:** the user's own closing framing — "it might be a[n
      option for a] nav-based dashboard concept as an optional THIRD nav level before tabs" (mode
      a) alongside "a sub-dashboard under a default tab heading" (mode b) as a SEPARATE, lighter
      option for cases that don't have the tab-overload problem. Decide per-node which mode (if
      either) fits — mode (a) for genuinely overloaded tab strips (PROPERTY_NODE's 8 tabs), mode
      (b) for a normal-sized tab strip that would just benefit from a richer, status-aware
      landing view (Rate plans' case). Don't apply either mechanically just because the pattern
      now exists in both shapes.

- **Bulk rate distribution mechanics** once a Properties tab exists under Distribution → Rate
  plans. MP's current production model (Group Rate Plan → Property Rate Plan → Property Room
  Rate) enforces one shared config across entities in bulk operations, where single-property
  Platform allows per-entity config — a real tension once this is actually designed.
- Configuration's "Etc." item was removed per the no-placeholders rule — nothing stands in for
  it currently; add real items here only once confirmed.
- Transactions hasn't surfaced any multi-property-specific differences yet — worth checking
  whether that's really true or just unexamined.
- **Channels Plus** (a Configuration panel item) has no content wired up yet.
- **LH and MP account types** have no real nav content defined yet — they render empty by
  design, not a bug. Fill in `CONTENT.LH` / `CONTENT.MP` in `nav-data.js` once real differences
  are confirmed.
- Distribution's MP "Properties" tab still uses the old pre-refactor shape (`data.sublist`, a
  flat array with no recursive `content`) — hasn't been migrated to the current node model yet.

## Reference data points (from the platform knowledge base, not this repo)

- PP dashboard usage: near-universal Distribution/Inventory visit follows a dashboard visit in
  the same session; notification bell outperforms every content widget; Smart Guide/NBA widgets
  underperform alert-driven widgets (~100 vs 380–460 weekly clickers for Property Status).
- 13.6% of accounts sit in the 2–5 property band.
- The Quin/DOE-ROE roadmap plans to decommission Smart Guide and consolidate NBA, Smart Guide,
  Sigint, DS/LLMOps, and Channels Plus "Optimise" into one Optimisation Engine — any
  "Recommendations" nav concept here should anticipate that consolidation, not the current
  fragmented state.
- MP Lite already exists as a lighter tier (property switcher, insights/reporting,
  brands/clusters, connectivity health — but no bulk rate management) — a precedent worth
  reviewing given Brands/Clusters are now placed under Configuration → Properties.
- SDS (design system) already has a five-level model (Foundations → Components → Systems →
  Flows → Page types) and a documented `sm-app-header` spec to build on.

## Deployment

Live at https://platform-ia-disco-rsc-6b3452000036.herokuapp.com/ — a static build served via
a small custom Node server (`server.js`, Heroku Node buildpack, `heroku-postbuild` runs `vite
build`). Auto-deploys from GitHub on every push to `main`. Two GitHub remotes are configured:
`origin` fans out pushes to both `platform-ia-disco` and `platform-ia-disco-rsc`; `rsc` targets
`platform-ia-disco-rsc` alone. `heroku` remote also exists for direct manual deploys as a
fallback.

**Gotcha:** `package-lock.json` must be generated against the public npm registry
(`registry.npmjs.org`), not a corporate registry mirror — if your local npm config points
elsewhere (check `npm config get registry`), regenerate the lockfile with
`npm install --registry=https://registry.npmjs.org/` before committing, or Heroku's build will
fail with an npm 401 auth error trying to reach a registry it has no credentials for.

### Access control — Basic Auth on the deployed site only

The deployed Heroku site sits behind HTTP Basic Auth — anyone hitting the live URL gets a
browser credential prompt before seeing anything. **Local dev (`npm run dev`) is completely
unaffected** — this only applies to the deployed build served via `npm start`.

- **Credentials:** username `platform-ia`, password `futurestate` — these are the DEFAULT
  fallback values baked into `server.js` (`BASIC_AUTH_USER`/`BASIC_AUTH_PASS`), used only if
  the equivalent Heroku config vars aren't set. **To actually rotate/change them, set Heroku
  config vars instead of editing the code:**
  ```
  heroku config:set BASIC_AUTH_USER=platform-ia BASIC_AUTH_PASS=futurestate -a platform-ia-disco-rsc
  ```
  (or whatever new values are wanted — the code default only matters if these vars are unset).
- **Implementation:** `server.js` is a small custom static-file server (Node's built-in `http`/
  `fs`, no new dependency) that checks every request's `Authorization` header before serving
  anything from `dist/`, replacing the previous plain `serve` static-server setup. Any
  unauthenticated or wrong-credential request gets a 401 with a `WWW-Authenticate` challenge,
  which is what triggers the browser's native login prompt. Unknown paths still fall through to
  `index.html` (this is a client-side-routed single-page app, so a hard refresh on a deep link
  must not 404).
- **Why this exists:** the prototype is explorable IA content, not meant to be indexed or
  stumbled on by anyone outside the people actually reviewing it — a lightweight gate, not a
  real security boundary (Basic Auth sends credentials base64-encoded, not encrypted, on every
  request — fine over HTTPS for a low-stakes internal wireframe, not appropriate for anything
  actually sensitive).

## Keeping this in sync

When a new decision is made (in conversation, in Confluence, or by editing the whiteboard),
update **both** this file and the Confluence decisions log page — this file is the
code-adjacent record for future sessions/contributors working directly in the repo; Confluence
is the stakeholder-facing one.
