# Change queue

> **New Claude session starting here?** Read in this order first: `CONTEXT.md` (project
> framing + confirmed decisions), `IA-BY-USER-TYPE.md` (decisions/open questions per account
> type), `NOTES-CLEANUP.md` (sitemap + coding standards — why path-index bugs kept happening),
> `REFACTOR-PLAN.md` (what this branch's refactor did and why), `PATTERNS.md` (reusable
> wireframe pattern catalog, including `nav-data.js`'s item-by-item type retrofit table), then
> this file last. `refactor/structure-cleanup` was merged to `main` — work happens on `main`
> now, check with `git branch --show-current` if unsure. The page-skeleton types are a starting
> set, not a closed list — the user adds new types as new page needs come up (currently 6:
> list/table/stacked-cards/card-grid/grid/nav-dashboard).

Running list of requested changes to batch and implement together, instead of one at a time.
Add to this as you type out requests; nothing here gets implemented until you say go.

**Status: every batch through "Remove mobile top bar brand mark" was committed and deployed (both
GitHub remotes + Heroku) on 2026-09-03.** The Rate plans topWidgets/Connectivities rename batch
AND the full-page wizard batch below are NOT YET committed — confirm before assuming either is
live. The only unfinished thread is the foundational property/cluster/brand scope switcher (its
own section below) — Distribution's shape is explicitly unsolved there, not a queue item to
implement yet. Add new requests to a fresh numbered list below this status block as they come in.

## Full-page modal / wizard — the first EDITING surface, plus its first instance (Add channel)

This is a genuinely new category of pattern for this prototype, not a page tweak — everything
built before this was read/browse NAVIGATION (drill-down, tabs, tiles); nothing modeled DOING a
bounded task. Explicitly named as direction-setting for the whole IA, not just this one flow:
"we haven't tackled an editing style surface yet but i see a role for a full page modal concept -
possibly multi-step... rethinking this underpins the IA work... it needs to be direction
setting." Grew out of a concrete walkthrough of how Distribution's "add a rate plan to more
channels" flow should work: "i am in a rate plan, i want to distribute it to more channels... i
see all the live rates listed there (a rate is the combination of a rate plan and a room type),
i see a channel and then the channel rates below it... i click 'add channel' and i choose from a
list - crucially that list included direct booking and channels plus as well as otas... then i
have to sometimes do some channel level config stuff (mapping)... and then done and then my new
rates are shown."

1. **New `state.wizard` + `openWizard`/`closeWizard`/`renderWizard` mechanism** (`main.js`) —
   deliberately SEPARATE from `state.path`/`state.section`: a wizard is a bounded TASK (pick
   things, configure them, commit), not a nav destination. Opening one touches no nav state, so
   cancelling or completing it resumes exactly where the user was — `render()` just shows
   whatever was already there, no path/section to unwind. A step is `{ title, render, onNext? }`
   — `render(wizard)` returns the step's own body HTML (reusing existing sketch/pattern
   renderers freely), `onNext(wizard)` optionally validates before advancing (returns `false` to
   block). `wizard.data` is scratch state shared across all steps for one wizard run (e.g. which
   channel was picked in step 1, read back by step 2), cleared once the wizard closes.
2. **Full takeover, own chrome** — confirmed over a canvas-only takeover: the wizard overlay
   (`#wizardOverlay`) covers the ENTIRE viewport (`position: fixed; inset: 0`, above even the
   mobile shell) with no rail/L2 panel/breadcrumb visible underneath — reads as "you've left the
   nav shell and entered a task," not just another page. Own header (numbered step list, e.g.
   "1. Choose channel — 2. Configure mapping", with done/current states) and footer (Back/Next,
   Next becomes "Done" on the last step) — confirmed as the standard wizard shape over a single
   continuously-scrolling page.
3. **First instance: Rate plan → Channels tab's "Add channel" wizard.** Two steps, both always
   shown (no conditional skip yet — "sometimes do some channel level config stuff" simplified to
   always showing the mapping step, since no real per-channel mapping requirements are
   confirmed): step 1 is a flat channel picker — deliberately NO grouping between OTAs and
   SiteMinder's own products (`ALL_DISTRIBUTION_CHANNELS`: Direct Booking, Channels Plus,
   Booking.com, Expedia, Agoda, Airbnb, all as one list) — "crucially that list included direct
   booking and channels plus as well as otas," reusing the same real-clickable-row treatment
   `records` pickers use elsewhere (`.wf-list__row`, wired via `data-wizard-select` instead of
   `data-path-key`). Step 2 is a generic "Configure mapping" page (Room type mapping / Rate
   mapping, skeleton `sections`). `onComplete` is a no-op — this prototype has no persistent data
   layer to actually add the picked channel into the Channels tab's list; the WIZARD MECHANISM
   itself (open → step through → close, resuming cleanly) is what's being demonstrated here, not
   a full simulated backend.
4. **Rate plan's Channels tab given its real shape** (was `sketch:'list'` stub) — "i see a
   channel and then the channel rates below it, and then another channel etc." New
   `sketch: 'channel-rates'` value: a leading "Add channel" action row (opens the wizard above),
   then one card per currently-connected channel (`RATE_PLAN_CHANNELS`: Direct Booking,
   Booking.com, Expedia) with a skeleton mini rates-table underneath standing in for "this
   channel's rates, one row per room type" (a rate = rate plan × room type, per the user's own
   definition) — no real room-type names/prices confirmed, shape only.
5. **Bug caught and fixed live:** the overlay showed up empty on initial page load despite
   `hidden` being set in `index.html` and `state.wizard` being `null` — `.wizard-overlay {
   display: flex }` was overriding the browser's native `[hidden]` UA-stylesheet rule (an author
   rule at equal-or-higher specificity beats it). Fixed with an explicit `.wizard-overlay[hidden]
   { display: none }` override. Also fixed a stray `#` appended to the address bar when picking a
   channel — the channel-picker row's `e.preventDefault()` was missing from its click handler
   (every other `href="#"` link in this app already has it via `wirePathLinks`; this new handler
   was added separately and missed it).
6. Verified in browser (light + dark): "Add channel" opens the full-page wizard correctly;
   picking a channel shows the selected state; Next advances to step 2 with Back now visible and
   Next relabeled "Done"; Done closes the wizard and returns to the unchanged Channels tab; the X
   (cancel) button also closes cleanly from either step; normal navigation elsewhere
   (Configuration, Insights) confirmed unaffected. No console errors.

## Rate plans list gains contextual insight widgets; Rate plan's own "Connectivities" renamed

## Rate plans list gains contextual insight widgets; Rate plan's own "Connectivities" renamed

Two small, related changes to Distribution.

1. **`topWidgets` (new, on `records` content)** — "lets add some graph widgets above the rate
   plans list - the idea being we have these contextual insights around the place rather than
   just lists." A new optional field, parallel to `nav-dashboard`'s existing `extraSections`
   mechanism: `content.topWidgets` renders a decorative `dashboard-cards` widget ABOVE the
   picker/table, using the exact same `renderSketch` dispatcher and titleless-skeleton
   convention as every other dashboard-cards instance (Insights' Dashboard, Rate plan's own
   Overview "Performance" section). Wired into `renderChainBody`'s `records` branch
   (`main.js`) — purely additive to the unselected-picker case, no changes to the selected/
   detail-node path. Applied to Distribution → Rate plans specifically: 3 cards, mixed
   stat+chart, matching the Overview "Performance" section's own proportions. Every other
   `records` caller (Properties, Users, Dashboards, Charts, Yield rules) omits this field and is
   unaffected — verified Yield rules still shows a plain list with no widgets.
2. **Rate plan's own "Connectivities" tile/tab renamed to "Integrated systems"** — resolves the
   open thread CONTEXT.md logged and queued for later: "Connectivities" and "Integrated systems"
   are the same concept, named differently by account type (MP: Connectivities / Platform:
   Integrated systems). Config → Property's own instance was already consolidated in an earlier
   batch; this is Rate plan's Overview tile + sibling tab, the last remaining separate instance —
   "also anywhere you see 'connectivities' change it to 'integrated systems'." Both the tile's
   and tab's `label` AND their internal `key`s were renamed together (`connectivities-tile` →
   `integrated-systems-tile`, `connectivities` → `integrated-systems`), same standard applied to
   the Transactions→Operations rename — an internal key that no longer matches its visible label
   would be its own confusion later.
3. Verified in browser (SM + MP account types): Rate plans' list shows 3 widget cards above the
   table, real clickable names still work; a rate plan's own Overview tile grid shows "Integrated
   systems" (not "Connectivities"), and clicking it correctly activates the renamed sibling tab
   (confirmed via the tab's own `.is-active` state, since the narrow test window couldn't show
   the full tab strip). No console errors.

## Mobile shell — a hamburger + drill-down responsive demo (new redesign stream)

"I want to simple demo how this whole thing could be mobile responsive .. thats one of the
streams of a redesign." This app had ZERO responsive behavior before this batch — the rail + L2
panel + canvas 3-column shell was fixed-width, desktop-only. Scoped deliberately as ONE standard
mobile-web navigation pattern applied to the outer shell, not a per-page responsive retrofit: "i
think we should be able to do it all actually - we need to implement some kind of standard mobile
navigation pattern - thats the main one, all the other stuff is just wireframes pages right?" —
confirmed true in testing: every existing content type (tabs, nav-dashboard tile grids, sections,
tables, grids, the records-inbox panel) needed ZERO changes; they just needed a single-column
canvas to sit inside, which a narrow viewport gives them for free once the shell itself reflows.

1. **Pattern chosen: hamburger drawer (not a bottom tab bar) + drill-down stack (not a
   slide-over).** Bottom tab bar was ruled out as less extensible — this app already has 4 rail
   sections + 3 utility destinations (AI assistant/Notifications/My account) = 7 total, past what
   a tab bar comfortably holds without its own overflow problem; user's own reasoning: "well we
   are going for mobile web - not sure what best out of those two i had assumed burger so its
   more extensible?" Drill-down (one screen visible at a time, back arrow returns to the list) is
   the standard iOS/Android navigation shape, and maps directly onto this app's EXISTING
   `state.path`/breadcrumb model rather than requiring new state.
2. **Architecture: purely additive, zero changes to existing render logic.** `renderPanel`/
   `renderCanvas`/`resolveChain`/`renderChainBody` are completely untouched — both panel and
   canvas still render into the DOM exactly as before on every `render()` call. A new
   `renderMobileChrome(data)` function (called once, at the end of `render()`) derives which
   screen to show from `state.path.length` — empty path means nothing's been drilled into yet
   (show the L2 panel), any non-empty path means the canvas has something to show (show it, with
   a back arrow). This single derivation covers every existing content shape for free, INCLUDING
   the records-inbox custom panel (Notifications) — its own "list stays put, canvas shows detail"
   desktop behavior naturally becomes "drill down to the detail, back returns to the list" on
   mobile, no special-casing needed, since `state.path[1]` being set is exactly the same
   condition either way. `noPanel` sections (Front desk) always show canvas on mobile too, same
   reasoning as `.secondary-panel.is-hidden` on desktop.
3. **New mobile-only chrome, hidden by default (`display: none`), shown only inside
   `@media (max-width: 767px)`:** a top bar (`#mobileTopbar` — back arrow, hamburger, current
   section's title) and a rail drawer (`#mobileDrawer` + backdrop) listing every `getRailItems()`
   section PLUS the 3 utility destinations as one unified list — reuses `getRailItems`'s own data
   for the sections rather than hand-maintaining a second copy, and the exact same
   `switchToUtilitySection(key)` mechanism the desktop utility-icon buttons already used (now
   generalized to work for any section key, not just the 3 it was originally built for).
4. **CSS is purely additive** — 229 new lines, zero changes to any existing rule. Every new rule
   either defaults to `display: none` (mobile-only elements) or lives inside the media query.
   Verified this directly: with the mobile media query's `media` condition temporarily
   neutralized via `document.styleSheets` in a scratch test, the exact same page reverted to the
   full 3-column desktop shell at the same viewport width, pixel-identical to before this batch —
   confirming the mobile CSS can't have regressed desktop, independent of being able to resize
   the actual test browser window wide enough (the sandboxed browser's window manager wouldn't
   honor a resize request past ~627px in this session).
5. Verified in browser (mobile width): hamburger opens/closes the drawer with correct active-
   section highlighting; tapping a section or utility destination switches and closes the
   drawer; L2 lists render full-width for Insights/Operations/Configuration; drilling into a tile
   (Config → Property → Property details, 3 levels deep: tile grid → tabs → sections) correctly
   shows canvas-only with a working back arrow at every level; Notifications' email-inbox list
   drills down to the wordless message-view detail correctly (rather than desktop's permanent
   list-stays-visible split, which doesn't fit a single-column screen); AI assistant's chat-start
   screen drills in from its own New chat/History L2 the same way every other section does; dark
   mode renders correctly throughout the drawer/topbar/backdrop. No console errors at any point.
6. **Correction: back arrow + hamburger were both showing at once, and the mobile top bar had no
   brand mark.** Asked directly whether that combo was standard — it isn't: "the back arrow +
   hamburger together isn't really a standard pattern... showing both permanently reads as
   cluttered rather than considered." Fixed to the actual standard: ONE leading icon that swaps
   between hamburger (at the L2 root) and back arrow (once drilled in) — never both — same
   pattern persistent-hamburger apps like Gmail use. `renderMobileChrome` now computes a single
   `showBack` flag and toggles `hidden` on BOTH `mobileBackEl`/`mobileMenuEl` from it, instead of
   only ever touching the back arrow's own visibility. `noPanel` sections (Front desk) keep the
   hamburger even while "drilled in," since there's no L2 to go back to there — verified directly
   in LH account type. Verified in browser (light + dark, SM + LH account types): exactly one of
   hamburger/back shows at any time. No console errors.
7. **Brand mark added, then dropped.** Also tried adding a persistent brand mark
   (`.mobile-topbar__brand-mark`, same dashed-placeholder treatment as the desktop rail's own
   `.rail__brand-mark`) next to the leading icon, per "maybe you can keep the brand present as
   well? i want to align with standard patterns as much as possible." Removed again almost
   immediately, live: "the brand mark feels like its getting in the way - lets lose it for now."
   The top bar is back to just the leading icon (hamburger/back) + section title, no brand
   element — don't re-add one without picking this back up.

## "Transactions" rail section renamed to "Operations"

Resolves the open thread CONTEXT.md logged earlier ("we might need to think of a better rail
section name... not sure what it is... maybe log as an open question") — picked back up
directly: "lets rename transaction rail to operations - and need to think of an icon."

1. Rail item's `label` ("Transactions" → "Operations") AND its internal `key`/tree property
   (`transactions` → `operations` in `nav-data.js`'s `BASE_RAIL_ITEMS` and `buildSmContentTree`)
   both renamed together — not just the visible label, so the internal key stays legible and
   matches what it's actually called now.
2. New icon (`icons.js`'s `operations`, replacing `transactions`) — a clipboard with a
   checkmark, chosen over an inbox/tray or an activity-pulse line. The old receipt/credit-card
   glyph fit "Transactions" but not "Operations," which covers Reservations/Guest
   communications/Payments together as the day-to-day running of a property, not payments
   specifically.
3. Verified in browser: rail icon renders correctly at rail size, clearly distinct from
   Configuration's gear and Distribution's globe; clicking it still routes to
   Reservations/Guest communications/Payments unchanged; tooltip/title shows "Operations." No
   console errors.

## Rail utility icons: AI assistant, Notifications; My account gains Communication + Preferences

Four related additions to the rail's utility area (above the avatar) and My account's L2, all
requested together: "lets add communication preferences to the user menu L2... lets add an app
preferences there as well... lets add a simple notifications bell above the user... lets add an
AI chat above that."

1. **My account gains two new items** between Security and the action rows: **Communication**
   (comms/notification-channel preferences — email/SMS toggles — deliberately a DIFFERENT word
   from "Notifications" so it's not confused with the new bell below, which is a different
   concept: an inbox of what's actually happened, not a preferences page) and **Preferences**
   (general app-level settings; currently just Theme — see item 4).
2. **Support code's icon retired** — used to be a bare "?"; removed because it read too similarly
   to the new AI assistant's circled-"?" rail icon (see item 3) and risked exactly the "is this
   help or is this the assistant" confusion being avoided there. Plain label carries it fine.
3. **New "Notifications" rail button** (bell + red dot, `.rail-item__badge` reused, index.html's
   `railNotifications`) — switches to a new `notifications` section, same mechanism as My
   account's avatar. This is the user-account-focused "Notifications" concept CONTEXT.md logged
   as a separate, lower-priority fourth thread months ago, alongside the Recommendations/Health
   check/contextual-recommendations three-way split — "it has become a bit of a gap this would
   solve for."
   - **First pass (SUPERSEDED):** L2 was a normal panel-item list with ONE item whose content was
     a `records` picker — clicking a notification replaced the picker with its detail in the
     canvas, same as every other `records` caller (Properties, Users, Dashboards). Rows were
     plain single-line text.
   - **Correction 1 — email-inbox row style:** the user wanted each row to show a preview line
     too: "have the summaries stacked in the L2 panel and the detail in the main panel - just
     like an email browser might have it." Added `content.showSnippet: true` to the generic
     `records` mechanism (`renderRecordPicker` in `main.js`) — real title plus a second skeleton
     preview line stacked underneath (`.wf-list--snippets`/`.wf-list__row-snippet-skel`).
   - **Correction 2 — real email-client SPLIT, not "detail replaces list":** caught live —
     "you didn't fix notifications... i want the summary list in the L2 panel, and the current
     message full view wireframed in the main view." The first pass's canvas-replaces-list
     behavior wasn't what "just like an email browser" meant — an email client's message list
     stays visible permanently while the reading pane shows the open message. Built a genuinely
     new panel mode for this: `NOTIFICATIONS_ITEMS.customPanel: 'records-inbox'`. When set,
     `renderPanel` skips the normal nav-item-list rendering entirely and calls a new
     `renderRecordsInboxPanel` instead — the notification rows (title + snippet,
     `.wf-list--inbox`) render AS the L2 panel's actual content, permanently, with their own
     `data-inbox-name` click wiring (`state.path = [pickerItem.key, name]`, then re-render).
     `renderCanvas` gets a matching special branch: before anything's picked it shows a plain
     "Select a notification to view it" placeholder (`.records-inbox-empty`); once picked, it
     skips the picker's own chain step entirely (`renderChainBody(chain, 1)`, no breadcrumb —
     there's nothing to crumb back to, the list never left the panel) and shows only the
     detail node's content. This is a genuinely one-off panel shape, not a generalizable
     mechanism — deliberately scoped to Notifications only via the `customPanel` flag; every
     other section keeps the normal L2-is-a-page-list behavior untouched.
   - **Correction 3 — clean flat rows in L2, fully wordless detail view:** two final polish
     requests: "just make them run as clean rows rather than cards in the L2... and make the
     main view totally skeleton with no words." (a) `.wf-list--inbox`'s rows were still
     inheriting `.wf-list__row`'s bordered-card look (border, border-radius, background box) —
     restyled to a flat treatment matching `.nav-list-item a`'s own look elsewhere in the panel
     (no border/box, hover/active fill only, a thin `border-bottom` divider between rows instead
     of card gaps). (b) The detail page was `sketch: 'sections'` with two real titled cards
     ("Summary"/"Related") — every `sections` page relies on real titles as its one standing
     exception to "skeleton content," which is wrong for a page that should have NO real text at
     all. Gave it its own dedicated sketch value instead of special-casing `sections`:
     `sketch: 'message-view'` (`NOTIFICATION_DETAIL_NODE` in `nav-data.js`) — a subject-line
     skeleton bar, a shorter meta-line bar, then 5 body-paragraph skeleton lines at varied widths
     (`.message-view`/`__subject-skel`/`__meta-skel`/`__body`/`__line-skel` in `style.css`),
     reading as an open email/message purely through skeleton shape.
   - Verified in browser: L2 permanently shows all 5 notifications as clean flat rows (no card
     borders, thin dividers between them, correct hover/active fill); clicking one highlights it
     and shows the fully wordless message-view detail (subject/meta/body skeleton lines) in the
     canvas without the list disappearing; switching away to another section and back correctly
     resets to the empty "select one" canvas state while the list stays intact; dark mode renders
     correctly on both the flat rows and the message-view; every other `records` caller
     (Properties, Users, Dashboards, Charts, Yield rules) and every `sections` page confirmed
     unaffected. No console errors.
   - **Correction 4 — "clean flat rows" (Correction 3) still read as messy inset cards.** Caught
     live via screenshot: "it still looks messy - can you see what i mean?" Three specific, more
     precise complaints this time: "i dont want cards inset into the panel, i want the cards to
     fill the panel (they have their own internal padding). and i dont want radius corners i want
     rectilinear .. also i dont want words in ther just skeleton lines." Correction 3's rows still
     (a) sat inside `.secondary-panel`'s own 20px/12px padding, reading as inset cards with
     visible gutters on every side, (b) kept a stray `border-radius: 7px` (a hover-state leftover
     from the very first card-styled version), and (c) still rendered the notification's REAL
     title text, not a skeleton bar — inconsistent with "no words" being applied to the canvas
     detail but not the L2 list right next to it. Fixed all three: `.wf-list--inbox` now
     negative-margins out the panel's own padding (`margin: -20px -12px 0`, `width: calc(100% +
     24px)`) so rows span truly edge-to-edge; `border-radius: 0` everywhere, plus a `border-top`
     on the first row so the list reads as one bounded rectilinear block top-to-bottom, not just
     bottom-divided; `renderRecordsInboxPanel` (`main.js`) now renders a `.wf-list__row-title-skel`
     bar instead of the real name — `data-inbox-name` still carries the real value for routing,
     it just never renders as visible text. Also considered defaulting to the first notification
     selected on entry (like most email clients open on the newest message) — explicitly decided
     AGAINST: "keep empty state... avoids implying a real 'read' action happened on load, which
     this prototype has no data model for anyway." Verified in browser (light + dark): rows now
     genuinely fill the panel with no inset gutters, fully rectilinear, no real text anywhere in
     the L2 list; active/hover states still work correctly. No console errors.
4. **New AI assistant rail button** (`railAssistant`) — icon is a circled "?" (`.rail-item__icon--
   assistant`), chosen deliberately over both a bare "?" (reads as human support/help, wrong
   signal for an agentic in-product assistant) and a sparkle (avoided as a cliché, and the
   product isn't ready to use its real assistant branding yet) — "a ? in a circle" reads more like
   "ask this" than "get human help." Switches to a new `assistant` section: L2 is "chat history
   and controls" — a "+ New chat" action row (active by default) above a flat "History" skeleton
   list (no individual chat threads are clickable yet — genuinely undecided what re-opening one
   should show). Canvas shows a new `chat-start` sketch: a centered skeleton greeting, 3 skeleton
   "suggested prompt" chips, and a skeleton input bar pinned near the bottom — a wireframe of a
   fresh-chat landing screen, not any specific conversation.
5. **Theme toggle MOVED into Preferences, not duplicated** — "move your colour theme from the
   proto overlay into there." Removed entirely from the hidden prototype settings sheet (it's a
   real product preference now, not a prototype-only demo toggle like account type/property
   count) and rebuilt as a new section shape, `shape: 'theme-toggle'`
   (`renderThemeToggle`/`wireThemeToggle` in `main.js`) — genuinely the first LIVE (non-skeleton)
   control in this prototype, per explicit instruction: "make it a skeleton - but make it work!"
   Visually it's three plain skeleton bars (no visible "System"/"Light"/"Dark" text) inside the
   existing `.scope-toggle` shell, so it reads as more skeleton content next to Profile/
   Security's fields — but each bar is a real `data-theme-choice` button underneath, wired
   per-render (`wireThemeToggle`, called from `renderCanvas` every time, unlike the old
   settings-sheet version's one-time `querySelectorAll` at load, which would never have found
   this control since it wasn't in the static `index.html` shell).
6. Verified in browser: bell + circled-"?" render correctly above the avatar (checked in both
   light and dark mode); Notifications lists 5 sample entries and opens a real skeleton detail
   page with correct breadcrumb; AI assistant's L2 shows New chat (active)/History, canvas shows
   the chat-start wireframe, History shows a plain skeleton list; My account now reads Profile/
   Security/Communication/Preferences/Support code (no icon)/Logout; Preferences' theme toggle
   is fully clickable and actually changes the theme; the hidden settings sheet no longer has a
   Theme group (ends at Live link); normal navigation (Insights, Configuration) unaffected. No
   console errors.

## Bug fix: rail highlight didn't follow cross-navigation

Caught live: "when we cross nav the user thing we need to update which L2 item is highlighted."
Drilling Config → Property → [a property] → Users tile → [a user] left the rail still
highlighting "Properties," even though the canvas had moved to that user's own "User details /
Properties" page (`buildUserNode`'s content) — a different concept, reached via `crossNav`, not a
literal deeper level of Property. Same bug in reverse (Users → [a user] → Properties tab →
[a property] left "Users" highlighted instead of "Properties").

**Root cause:** the rail/L2 panel's highlight (`renderPanel`'s `resolveSelected(items, 0)`) only
ever reads `state.path[0]` — but a `crossNav` records pick happens much deeper in the tree (at
whichever `pathIndex` that picker sits at), and never touches `state.path[0]`. So after crossing
over, `state.path[0]` still names whichever rail item the user originally entered through, and
the rail stayed stuck there.

**Fix:**
1. Each `crossNav: true` records config in `nav-data.js` now also carries a `homeItemKey` — which
   rail L2 item its `detailNode`'s content conceptually belongs to. `buildPropertyNode`'s "Users"
   tile → `homeItemKey: 'users'` (always a flat top-level item). `buildUserNode`'s "Properties"
   tab → `homeItemKey: showProperties ? 'properties-config' : 'property-settings'` (varies by
   account type, matching `buildConfigurationPropertiesItem`'s own branching exactly).
2. New `findCrossNavHomeItemKey` helper in `main.js` — walks the resolved chain for the deepest
   explicit crossNav step and returns its `homeItemKey`, if any.
3. `renderPanel` now checks this override before falling back to the plain `state.path[0]`
   lookup — if a crossNav step was taken, the rail highlights `homeItemKey`'s item instead of
   whichever item the click physically started under.
4. Verified in browser (MP account, both directions): Property → Users tile → a user now
   highlights "Users"; Users → a user → Properties tab → a property now highlights "Properties."
   Plain, non-crossnav navigation (Config → Property, Config → Users) still highlights correctly
   — no regression. No console errors.

## Integrated systems' tip dropped (wording, not concept)

"Not connected to a PMS" was called "a bit basic" and removed — `nav-data.js`'s
`integrated-systems` tile now carries only `stat: '0 systems connected'`, no `tip`. This is a
wording call, not a rejection of the underlying "this tile could nudge toward something" idea —
picking a sharper tip for this tile is a legitimate, open thing to come back to. Property
details' and Room types' tips are unaffected.

## Tile tip: dashboard-level dot, real text moved to a destination-page banner

Follow-up correction on the stat+tip batch (below) — caught live, right after that batch shipped
the badged-chip tip treatment: "it might be too much negative noise on the dashboard level. Maybe
just an indicator that there are recommendations - a dot? and then show them in more details when
user clicks through." With Property details/Room types/Integrated systems all carrying a red
chip on the same dashboard at once, it read as alarm/failure, not the "optimize, contextual
recommendation" framing this concept is supposed to have.

1. **`renderNavDashboard` (`main.js`)** no longer renders `tip`'s text at all on the dashboard
   tile — just a plain dot next to the title (`.nav-dashboard__tile-dot`, new), same visual
   language as the existing panel-item badge dot (`.nav-list-item__badge`). `stat` is unaffected.
2. **New `renderTileTipBanner` function** — renders the tip's actual text as a banner
   (`.tile-tip-banner`, reusing the `--alert`/`--alert-tint` tokens the old chip used). Wired into
   `renderChainBody`'s `nav-dashboard` branch: once a tile is selected, its `tip` (if set)
   prepends this banner ahead of the tile's own destination-page content — one callout on its own
   page, not stacked with the others.
3. **CSS**: `.nav-dashboard__tile-tip` (the old chip) removed entirely; new
   `.nav-dashboard__tile-dot` (dashboard) and `.tile-tip-banner`/`.tile-tip-banner__dot`
   (destination page) added.
4. Verified in browser: Config → Property's dashboard now shows small dots on Property
   details/Room types/Integrated systems, no colored chips — reads calm even with 3 at once;
   clicking into each of those 3 tiles shows the correct banner text at the top of its own page;
   Channels/Media library/Users (no `tip`) show no dot and no banner. No console errors.

## Nav-dashboard tiles: stat + tip, two separate fields (superseded in part — see above)

The badged-chip presentation of `tile.tip` described in this section was replaced by the
dashboard-dot + destination-page-banner treatment in the section above, right after this batch
shipped. The `stat`/`tip` DATA model itself (two separate fields) is unchanged and still current
— only how `tip` is DISPLAYED was revised.

## Prototype settings: theme toggle

Not part of the product surface being wireframed — a prototype-only convenience the user
noticed while dark mode was on for other testing ("wow you have a dark mode! add that to the
settings!"). This app's CSS already fully supported light/dark via `prefers-color-scheme` (every
artifact/page built this session follows that convention) — there was just no way to force one
from inside the hidden settings sheet, only the OS-level setting.

1. **New "Theme" group in the settings sheet** (`index.html`) — System (default) / Light / Dark,
   same `.scope-toggle--sheet` control style as the existing Account type/Number of
   properties/Integrated systems groups.
2. **Wired in `main.js`** — `applyTheme(choice)` stamps `data-theme="light"`/`"dark"` on
   `<html>` for an explicit choice, or removes the attribute entirely for "System" (falls back to
   `prefers-color-scheme`) — the exact mechanism `style.css`'s token blocks were already built to
   key off. Persisted to `localStorage` (`platform-ia-disco:theme`) so the choice survives a
   reload rather than resetting to System every time.
3. Verified in browser: Dark renders correctly (checked the new nav-dashboard tile
   stat/tip styling in dark mode too — good contrast, no color-only-defined-in-one-theme bug);
   persists across a reload; System correctly removes the `data-theme` attribute. No console
   errors.

## Nav-dashboard tiles: stat + tip, two separate fields (original batch — display since revised)

**The `tip` DISPLAY approach described in item 2 below (a badged chip on the dashboard tile) was
revised shortly after this shipped — see "Tile tip: dashboard-level dot..." near the top of this
file for the correction.** The `stat`/`tip` DATA model (two separate fields per tile) described
here is still current and unchanged.

The user's framing: "navigation also becomes recommendation" — tiles should surface useful
information even when nothing needs attention, not just conditionally nudge. Grew out of a
request to elevate Room types' "missing media" concept, which surfaced that a single `tip` field
was being asked to do two different jobs — routine status and attention-needed — that should be
visually and semantically distinct.

1. **Confirmed model:** every tile can carry a `stat` (always-on, factual — e.g. Channels: "5
   channels connected, 2 awaiting setup") — this is what the tile's metric-skeleton placeholder
   had been waiting for since nav-dashboard was first built. Separately, some tiles ALSO carry a
   `tip` (attention callout — e.g. "Not connected to a PMS") — NOT a replacement for `stat`, a
   distinct add-on layered on top: "and then sometimes a callout for something that needs
   attention."
2. **`renderNavDashboard` (`main.js`) rewritten** for the two-field model — `stat` renders as
   real text (or a skeleton bar, unchanged behavior) in the slot the metric-skeleton block used
   to occupy alone; `tip`, when present, renders as a SEPARATE badged chip below it, not another
   line of muted body text — small pill, `--alert`-colored text/dot on an `--alert-tint`
   background, so it visually reads as "needs a look" rather than more status copy.
3. **New `--alert-tint` CSS token** (light + dark, alongside the existing `--alert` token) — the
   chip's background. Same deliberate, narrow exception to the greyscale-only rule the panel-item
   badge dot already carved out; not a general accent color.
4. **All 6 `buildPropertyNode` tiles got real `stat` text**, and 3 kept/gained a `tip`: Property
   details (stat "6 sections complete" + tip "2 required fields missing"), Room types (stat "4
   room types" + tip "1 missing media" — the request that started this), Media library (stat "7
   photos uploaded", no tip), Channels (stat "5 channels connected, 2 awaiting setup" — its old
   `tip` text moved INTO the stat, since it's routine status, not an attention callout), Integrated
   systems (stat "0 systems connected" + tip "Not connected to a PMS"), Users (stat "4 users", no
   tip).
5. Verified in browser: all 6 tiles show correctly for single-property (5 tiles) and MP
   per-property drill-in (6 tiles, Users included); dark mode renders the callout chip with good
   contrast; Rate plan's Overview tiles (mode b, unrelated — no `stat`/`tip` set there yet) still
   correctly fall back to skeleton bars, confirming the shared `renderNavDashboard` didn't
   regress for tiles that haven't adopted this yet. No console errors.

## Config → Property tile cleanup batch

Four quick follow-ups, requested live right after the contextual-recommendations tips (below)
were confirmed but before they were verified in browser — folded into the same pass.

1. **Contextual recommendations (`tile.tip`) — first real instance built.** Scoped to Config →
   Property's tiles (not Rate plan's Overview tiles — explicitly deferred, "Config → Property's
   tiles first" over "both"). Real tip text on exactly 3 of the (then-5) tiles: Property details
   ("2 required fields missing"), Channels ("No channels connected yet"), Integrated systems
   ("Not connected to a PMS") — all gap/opportunity framing, not alarm framing, matching the
   "optimize" flavor of this concept vs. Health check's "broken" flavor (see CONTEXT.md's
   three-way notification model). Connectivities (since removed, see below) and Users kept the
   plain skeleton tip bar — no real tip text.
2. **Connectivities tile removed from Config → Property** — same concept as Integrated systems,
   just named differently by account type (MP: Connectivities / Platform: Integrated systems —
   see CONTEXT.md's open thread, now resolved by this removal rather than left queued). No
   separate Connectivities tile is needed once Integrated systems already covers the concept.
3. **Room types AND Media library lifted to the property (tile) layer** — both used to be tabs
   inside `PROPERTY_DETAILS_NODE` (Property details' own drill-in page); both are now their own
   top-level tiles on `buildPropertyNode`'s tile grid, sitting right after Property details.
   Room types moved first ("lift room types to the property layer rather then property
   details"), Media library followed the same treatment moments later ("lets move media library
   up a level as well"). Property details' own tab strip is now just General information /
   Services / Policies.
4. **Users tile on Config → Property is now gated to multi-property accounts only** — "dont show
   users under property for a single property account." Mirrors the gate `buildUserNode`'s own
   "Properties" tab already used (`showProperties`) — for a single-property account there's no
   "which users have access to THIS property" question distinct from "which users are on the
   account," so the tile was a redundant duplicate of Config → Users. Verified: single-property
   accounts show 4 tiles (Property details/Room types/Media library/Channels/Integrated systems
   — Users absent); multi-property accounts show all 5 (Users present, gated correctly); the
   Users ↔ buildUserNode cross-navigation still works with no breadcrumb history-log regression;
   no console errors in either account state.

## Room types/Media library flattening: tried, reverted; Config L2 model confirmed instead

Follow-up after the Config → Property tile cleanup batch shipped Room types/Media library as
tiles for EVERY account type. Asked directly whether this "things move between L2/tile depending
on MP mode" pattern was a good idea, the user gave the actual placement rule (now logged in
CONTEXT.md as "Confirmed principle: what promotes a Config tile to the property's top level").

1. **First attempt (TRIED, then REVERTED): flatten Room types/Media library for single-property
   only.** `buildPropertyNode` briefly gained a second parameter
   (`includePropertyLevelTiles = true`) so single-property could omit them from the tile grid;
   `buildConfigurationPropertiesItem` briefly returned an array (`[Property, Room types, Media
   library]`) for single-property instead of one item. Reasoning at the time: single-property has
   no properties-list level to drill through, so a tile felt like unnecessary nesting.
2. **Caught live, then reverted:** the user noticed the actual consequence — "this start to mean
   that single property doesnt get the cards at all - and the property L2 items become property
   details." That surfaced the real tradeoff: the card grid isn't just solving tab-overload, it's
   the SURFACE `tile.tip` contextual nudges are built on — a flat rail item has no equivalent
   slot. Resolution: "its actually more about whats a better surface - the dashboard allows us to
   do the contextual hints and nudges - i suspect its the richer solution." Fully reverted —
   `buildPropertyNode` is back to one signature, no `includePropertyLevelTiles`;
   `buildConfigurationPropertiesItem` is back to returning one item, not an array. Room types and
   Media library are tiles for every account type again.
3. **Confirmed general Config L2 model** (now the header comment above
   `buildConfigurationPropertiesItem` in `nav-data.js`, and CONTEXT.md): Config's L2 is just two
   things — the Property dashboard (every property-scoped concept lives here as a tile) and
   Products (everything else). MP turns "Property" into "Properties" (a picker) and moves the
   SAME dashboard one level deeper, per selected property. The only exceptions are concepts with
   an efficiency case for ALSO being a flat Config L2 item, reachable without drilling into a
   specific property — Users is the one built so far.
4. **Channels' flat Config L2 item removed** — it was a leftover `content: null` stub sitting
   above the "Products" heading, redundant with the dashboard's own Channels tile once the model
   above was stated explicitly. Considered and explicitly rejected for the same "efficiency
   exception" treatment Users gets — Channels lives on the dashboard only now.
5. Verified in browser: single-property rail is Property / Users / [Products heading] — no flat
   Room types/Media library/Channels items; the "Property" dashboard shows all 5 tiles again
   (Property details/Room types/Media library/Channels/Integrated systems). Multi-property: rail
   unchanged (Properties/Users/[Products]); drilling into a property still shows all 6 tiles. No
   console errors in either state.

## Notification candidate-model: first concrete pieces built

Grew out of a design conversation (see CONTEXT.md's "notification-driven narrow surfaces vs.
full browsable IA" candidate model) — the user connected a question about common notification
patterns back to Health check's own already-simplified shape, then refined it into a three-way
split: Recommendations (global, optimize), Health check (global, broken), contextual
recommendations (local, optimize — the `nav-dashboard` tile's `tip` field, not yet built out as
this specific concept). Confirmed and built the first two concrete pieces of this:

1. **New panel-item badge pattern** (`item.badge: true`, PATTERNS.md) — an illustrative, non-
   functional dot next to a panel-list item's label, same slot as the existing `starred`
   indicator. A dot, not a count — no real number exists yet. Deliberately scoped to the L2
   panel item only, not the rail icon (avoids the larger unresolved question of rail-level
   badge aggregation — user's explicit choice). Applied to Health check, Recommendations, and
   Dynamic pricing (added afterward: "think we can badge dynamic pricing as well").
2. **Badge color: a DELIBERATE exception to the greyscale-only rule.** User: "make the dot red
   - it doesn't really parse as black." New `--alert` CSS token (defined once, light + dark),
   scoped to just this one element — not a general accent color for the app.
3. **Dismiss-on-visit was explored, then dropped.** First built: badge clears once its item is
   routed/viewed ("ideally it goes away just to enforce the concept"), then refined to reset
   per SECTION VISIT rather than per session ("have them come back next time I visit the
   section - I know that's weird but it's just to demo"). Before finishing that refinement, the
   user reconsidered: "maybe it's too much to bother with the dismiss?" — agreed and reverted
   to a fully STATIC badge (always shows, no interaction) since nothing in this prototype
   tracks real resolved/unresolved state to make a dismiss meaningful. The real-product "clears
   once addressed" intent stays documented in CONTEXT.md, not simulated in code.
4. **Recommendations is now a richer dashboard-cards page**, not a plain `sketch:'list'` — user:
   "make that recommendation page richer like a dashboard of its own." Reuses the existing
   `dashboard-cards` pattern as-is (6 titleless stat/chart cards, same treatment as Insights'
   Dashboard/Health check) — a "concept of groupings" inside Recommendations was floated but
   explicitly deferred: "maybe that's a later stage thing - I am fine with reuse [for now]."
   Don't add grouping structure without picking this back up.
5. Verified in browser: red badge dot renders correctly and statically on Health check, Dynamic
   pricing (Distribution) and Recommendations (Insights) L2 items; Recommendations routes to
   its own dashboard-cards content (visually similar to Insights' Dashboard since both reuse
   the same pattern — expected, not a bug); no console errors.

## Pay IA split + small additions batch

1. **Dynamic pricing is now a calendar-style grid** — user: "dynamic pricing is a grid as well
   - can use the LH calendar style." Uses the existing `sketch:'calendar'` preset (7 weekday
   columns Sun–Sat, 5 rows, no row labels — same shape Front desk's calendar uses) but embedded
   in a NORMAL Distribution page (L2 panel stays visible), not full-width/`noPanel` like Front
   desk's own usage.
2. **"Pay" (Config → Products) split from production's current single flat "Payments" section**
   (real screenshot reviewed: Payments/Transactions/Payouts/Virtual terminal/Invoices/Automated
   payments/Payment requests/Accepted payments/Taxes/Service charges, all stacked under one
   top-level nav item today) — per the user's own principle: "the low-touch setup stuff lives
   under Config → Pay, but anything more transactional goes elsewhere - likely under either
   distribution or transactions."
   - **First pass (SUPERSEDED — see revision below):** flattened all 5 "transactional" items
     (Payouts, Virtual terminal, Invoices, Payment requests, plus the existing "Transactions"
     item) as 5 separate top-level L2 rows in the Transactions section. The user caught this
     live via screenshot: "this has ended up a bit messy - is this what you intended?" — a real
     miss, not a deliberate design.
   - **Revised split, confirmed directly:** "I think [virtual] terminal, accepted payments,
     taxes and service charges are all config stuff. The rest can be tabs underneath an L2
     maybe called Payments." Explicit caveat, worth remembering for anyone revisiting this:
     "this is a product area I know little about so we are really just roughing it in" — none
     of this split is confirmed business logic.
   - **Config → Pay** (folder sublist, same pattern as Direct Booking's — `PAY_LIST` in
     `nav-data.js`): Automated payments, **Virtual terminal** (moved here from Transactions
     after the correction), Accepted payments, Taxes, Service charges — all simple stubs, no
     confirmed internal sub-structure. The status/enablement "Payments" page itself
     (`sketch:'sections'`, mirroring the "SiteMinder Payments is enabled" banner from the real
     screenshot) was DROPPED entirely, not kept as a peer item — "it's just a stub to hold an
     upsell page in the current state," not a real settings destination worth modeling here.
     "Automated payments" is now the default/active item in this list.
   - **Transactions section: ONE new L2 entry, not four.** Reservations and Guest
     communications stay untouched. The pre-existing "Payments" L2 item (previously
     `content: null`) now holds a `tabs` strip: Transactions / Payouts / Invoices / Payment
     requests. This is the SAME "Payments" item, not a new one — no duplicate label.
3. Verified in browser: Dynamic pricing renders correctly (weekday grid, L2 panel intact); Pay
   expands as a folder (doesn't auto-navigate, matching the folder-vs-heading rule) with 5
   items (no "Payments" status page), Automated payments now the default; Transactions section
   is back to 3 clean L2 rows (Reservations, Guest communications, Payments), with Payments now
   showing a 4-tab strip (Transactions/Payouts/Invoices/Payment requests); no console errors.
4. **Added a 5th tab to Transactions → Payments: "Automated payments"** — home for "scheduled
   and failed automated payments," a real gap noticed once the automation RULES landed under
   Config → Pay → Automated payments but the actual payment ACTIVITY those rules produce had
   nowhere to live. Confirmed transactional (not nested under Config → Pay), and ONE combined
   tab rather than separate Scheduled/Failed tabs — status would be a column in the list, not
   a page split. Verified rendering correctly alongside the other 4 tabs, no console errors.

## Breadcrumb history-log bug fix

Caught live by the user via screenshot: "the breadcrumb is off here - it's behaving like a true
breadcrumb of where I have been rather than where I am in the product hierarchy." Reproduced
via the Users/Properties self-consistency cross-navigation: Users → Jane Smith → Properties →
Harbourview Hotel → Users → Jane Smith showed breadcrumb "Users / Jane Smith / Properties /
Harbourview Hotel / Users / Jane Smith" — the same two names repeated, a click-history log
rather than a hierarchy position.

**Root cause:** `state.path` genuinely IS a full click history (it just keeps appending one
level per click) — that's fine for ROUTING, but the breadcrumb display was rendering it
verbatim. Every cross-navigation hop between `buildUserNode`'s Properties tab and
`buildPropertyNode`'s Users tile adds 2 more path levels on top of whatever came before,
without end.

**Fix (asked directly, confirmed): "just the current entity, no trail at all."** Simply
discarding the locally-accumulated crumb at the point of cross-navigation does NOT work —
`renderChainBody` builds the trail bottom-up via nested `.concat()`, so by the time a
cross-nav'd record's own code runs, every ANCESTOR call (e.g. the tabs strip for "Jane Smith"'s
own User details/Properties tabs one level up) has already prepended its own crumb; concatenation
can't retroactively un-prepend what a caller already added.

Implemented instead as a **sentinel marker**: the two `records` content declarations that
cross-reference each other (`buildUserNode`'s Properties tab, `buildPropertyNode`'s Users tile)
now carry `crossNav: true`. When a record is picked from one of these, its crumb is tagged
`resetTrail: true` and flows normally through every ancestor's `.concat()` (the trail keeps
growing structurally, exactly as before) — then `breadcrumbHtml` (the ONE place the final,
fully-assembled trail is actually consumed, right before rendering) slices off everything
before the LAST `resetTrail` crumb, once. `state.path` itself and `truncateTo` are completely
unaffected — only what's DISPLAYED is trimmed. Verified: repeated back-and-forth (User →
Property → User → different property → different user) never re-accumulates; a single crumb
after trimming is correctly suppressed (same "noise" rule as everywhere else); Rate plans'
unrelated breadcrumb (no `crossNav` flag) is unaffected.

## Rate plan Overview page composition batch

Built out Rate plans' Overview page (previously just the bare tile grid) per the user's direct
request: "top strip we currently have is configuration, can have a title... then another
section called performance with a few graph widgets... then another section called adoption -
it's a table showing channel adoption, some kind of distribution snapshot for the RP but we can
keep it to skeleton concepts for now."

1. **`nav-dashboard` gains two new optional fields: `title` and `extraSections`** — a heading
   above the tile grid, and purely decorative sections stacked BELOW it (each rendered via the
   same `renderSketch` dispatcher every sketch-only leaf uses). The tile grid's own routing is
   completely unaffected — tiles stay fully clickable exactly as before. New
   `renderNavDashboardPage` in `main.js` composes title + tile grid + extra sections into one
   page; `renderChainBody`'s `nav-dashboard` branch now calls this instead of
   `renderNavDashboard` directly. This is a display composition around the ONE routable element
   (the tile grid), not a new content type every node needs to support.
2. **Rate plans' Overview tab now has 3 stacked sections:** "Configuration" (heading over the
   existing Rooms/Channels/Connectivities/Properties tiles — unchanged, still fully routable),
   "Performance" (3 titleless `dashboard-cards` chart widgets, same skeleton convention as
   Insights/Health check), "Adoption" (a channel-adoption/distribution snapshot — confirmed
   skeleton-only for now: `sketch:'grid'` with `columns:4, rows:5`, no real labels — NOT
   `sketch:'table'`, which requires real confirmed header text this doesn't have yet).
3. Verified: tile routing (Rooms/Channels/Connectivities/Properties → sibling tabs) still works
   correctly nested inside the composed page; returning to Overview re-renders the full
   3-section page correctly; no console errors.

## Small fixes/additions batch

1. **Bug fix: the property-count toggle (hidden settings sheet) no longer resets your
   position.** User: "when I switch settings in the switcher I want to stay in the same view so
   I can see the change - currently it's reverting to a reload of the app." The
   `data-property-count` click handler called `resetPath()` unconditionally — removed that call
   specifically for this toggle (account-type's toggle still resets, since IT can change which
   sections/items exist at all; property count only gates a few things within an otherwise-
   identical structure). `resolveSelected`/`resolveChain`'s existing explicit-key-or-fallback
   lookups already handle the rare case where the current path points at something that stops
   existing — no crash, just falls back to that level's default.
2. **New Distribution item: "Dynamic pricing"** — placed after Yield rules, before Health
   check. `content: null` stub, no shape decided yet.
3. **New Transactions L2 item, literally called "Transactions"** — placed FIRST (before
   Reservations/Guest communications/Payments), `content: null` stub, now the section's default/
   active item. Surfaced a real naming tension: the user first asked to add "a section called
   Transactions... maybe under the guest section," then realized the top-level rail section
   (credit-card icon) is ALREADY called "Transactions" ("oh ok - i forgot it was called that").
   Resolved for now as: add the new L2 item, revisit the RAIL section's own name later — logged
   as an open question in CONTEXT.md, not resolved here.

## Users/Properties self-consistency batch

Raised by the user directly, worth quoting in full since it's a real IA principle, not just a
feature request: "Config > Users is all users in the account... and then for MP users Config >
Property > Users is the users assigned to that property. So then Config > Users > Properties
would list those properties so it's all self consistent." Confirmed explicitly: real names AND
real cross-navigation (clicking a name jumps to that user's/property's actual detail page), not
just matching text.

1. **`buildUserNode`'s "Properties" tab is now a real `records` picker** (`SAMPLE_PROPERTIES`,
   `detailNode`) instead of a `sketch:'list'` stub — clicking a property name opens that
   property's real nav-dashboard.
2. **`buildPropertyNode`'s "Users" tile is now a real `records` picker** (`SAMPLE_USERS`,
   `detailNode`) instead of a `sketch:'list'` stub — clicking a user name opens their real
   `buildUserNode` page. (`PROPERTY_NODE` — the const — was converted to a function,
   `buildPropertyNode(showProperties)`, purely to support this; see item 4 below.)
3. **Bug caught and fixed: infinite recursion (`RangeError: Maximum call stack size
   exceeded`).** `buildUserNode`'s Properties tab and `buildPropertyNode`'s Users tile
   reference EACH OTHER — a genuine two-way cycle. The first version called each other EAGERLY
   inline while constructing the object literal (`detailNode: buildPropertyNode(showProperties)`
   evaluated immediately as part of building `buildUserNode`'s own return value), which
   recurses forever: building A calls B, which calls A again, indefinitely. Confirmed via a
   real stack-overflow exception in the browser console, not a theoretical risk — sections
   stopped switching (rail clicks did nothing) because `render()` was throwing silently.
   **Fixed by making `records`' `detailNode` accept EITHER a Node OR a zero-arg function
   (thunk)** — `resolveChain`'s `records` branch now does
   `typeof content.detailNode === 'function' ? content.detailNode() : content.detailNode`,
   resolved lazily only once a name is actually clicked. Both mutually-recursive call sites now
   pass thunks (`() => buildPropertyNode(showProperties)` / `() => buildUserNode(showProperties)`);
   every other `records` caller (Properties' own external call site, Configuration's Users item,
   Dashboards, Charts, Yield rules, Rate plans) is unaffected — they call the builder functions
   directly, from OUTSIDE the cycle, which is safe (one terminating call, not mutual recursion).
4. **Declaration order reshuffled** in `nav-data.js`: `SAMPLE_PROPERTIES` and the
   `SAMPLE_USERS`/`buildUserNode` block both moved earlier in the file (before
   `PROPERTY_DETAILS_NODE`/`buildPropertyNode`) so both functions can reference each other's
   sample-data arrays regardless of which is defined first — necessary groundwork for the thunk
   fix above, not a behavior change on its own.
5. **Verified end-to-end, both directions, both property-count states:** Properties →
   Harbourview Hotel → Users → Jane Smith → Properties → Harbourview Hotel (full loop, no
   crash, correct breadcrumb, no duplicate crumb segments) in multi-property mode; Property →
   Users → Jane Smith (User details only, no Properties tab, correctly gated) in single-property
   mode.

## Rate plans nav-dashboard batch

Built to prove out CONTEXT.md's "tabs move a level deeper" candidate model concretely, on the
case the user named as the trickiest to work through: "let's tackle this in the context of
rate plans - this is the trickiest problem space and I have been circling around it." Includes
a direct reversal, caught after seeing the first version live — see item 3.

1. **Rate plans list is now a table skeleton**, not a plain list — same real, clickable names as
   before (`renderRecordPicker` → `renderRecordTable`), first column real, remaining columns
   (`tableColumns`, default 3) skeleton-only, no real headers. New `records` content field:
   `display: 'table'`. Every other `records` caller (Properties, Users, Dashboards, Charts,
   Yield rules) is unaffected — this is additive, opt-in per instance.
2. **New page-skeleton type: `nav-dashboard`** (`type: 'nav-dashboard', tiles: Node[]`) — a flat
   grid of clickable TILES, each a real navigation destination, not the same thing as the inert
   `dashboard-cards` sketch. Each tile: a skeleton metric block, its own real title (the label IS
   the heading — "flat set for now - with the headings in the tile itself"), an optional status
   tip (`tile.tip`, skeleton until real wording/data is decided), and a `›` chevron link
   affordance. See PATTERNS.md for the full writeup (now covering both modes below).
3. **REVERSED after seeing it live: Rate plans doesn't need a standalone nav-dashboard after
   all.** First built with the tab strip replaced entirely (tiles pushed a real path level,
   breadcrumb took over) — the user then caught this: "I now realise Rate plans don't need the
   extra level, but they could maybe benefit from this as a sub-dashboard under a default tab
   heading." Config → Properties DOES still need the original standalone shape ("in config →
   properties I think we will need the extra level") — so `nav-dashboard` was generalized to
   support BOTH, per explicit instruction: "keep this as a page type that can appear in a
   tabbed view or a non tabbed view." Rate plans' final shape (`buildRatePlanNode` in
   `nav-data.js`): a normal `tabs` node — Overview/Rooms/Channels/Connectivities/Properties
   (Properties MP-only, same gating as `buildUserNode`'s own Properties tab) — where "Overview"
   (default/active) holds the nav-dashboard as ITS content; each tile uses `linksToTab` (a
   sibling tab's key) instead of its own content, so clicking a tile just SWITCHES the active
   tab (confirmed: "switches the tab... matches how a normal tab click already works") — tab
   strip never disappears, no new path level. Tile set explicitly not closed — "there will be
   others I haven't thought of yet."
4. **`PROPERTY_NODE` (Config → Properties) converted to mode (a), standalone** — the actual
   tab-overload case (8 tabs) this whole pattern was built to solve. NOT a straight 1:1
   conversion of the old tabs — most moved a level deeper. Tiles: Property details, Channels,
   Connectivities, Integrated systems, Users. "Property details" (tile) drills into a NEW
   sub-node (`PROPERTY_DETAILS_NODE`, a normal tab strip: General information/Room types/
   Services/Policies/Media library) — most of the old 8 tabs live there now, not as top-level
   tiles ("those move to a level under property details, or at least most of them"). Channels
   and Connectivities are brand new tiles (best-guess `sketch:'list'` stub, mirroring Rate
   plans' own tile names). Integrated systems and Users were explicitly kept at the TOP level
   rather than folded under Property details ("users and integrated systems move to the top
   level"). A naming collision surfaced and was resolved: the OLD tab literally named "Property
   details" (Property/Contact/Extra information fields) collided with the NEW top-level tile of
   the same name — its fields were merged into General information (now 6 sections) rather than
   keeping two same-named things at different levels. Both of `PROPERTY_NODE`'s existing call
   sites needed zero code changes (both only ever referenced it as an opaque value).
5. **Bug fix: crumb duplication when a standalone tile's label matches its destination node's
   label.** Caught live by the user via screenshot ("see what's going on here? it's an error") —
   clicking "Property details" showed "Property / Property details / Property details" (tile
   crumb + `PROPERTY_DETAILS_NODE.label` crumb, both the same string). `isDetailNodeRoot`
   (`renderChainBody`, the check that prevents a step's own node-label crumb from doubling up
   with the crumb its parent step already added) originally only covered a `records` pick —
   extended to also cover a standalone (non-`linksToTab`) `nav-dashboard` step. Verified fixed
   on Property details, and verified NOT regressed on Rate plans' mode (b) tiles (which never
   push a path level, so were never at risk).

## My account batch

1. **"My account" IA treatment** — production's My account was one long scrolling page (name/
   email/phone/language, then MFA/Passkeys/Password cards below, inconsistent tinted-vs-plain
   card treatment). Split into the same panel-list model every other section uses: reached via
   the rail's user avatar (bottom of rail, now a real clickable button, not a static badge) —
   not a `getRailItems` entry, so switching account type falls back to Insights same as any
   other unrecognized section. L2 shows a flat list: **Profile** (name/contact/preferred
   language, `sketch:'sections'`) and **Security** (MFA/passkeys/password, `sketch:'sections'`)
   as real destinations, plus **Support code** and **Logout** as action rows (actionIcon, same
   pattern as "Add products", `content: null` stubs) sitting in the same list rather than
   folded into a tab strip. Deliberately flat (not a `tabs` node) specifically so the action
   rows could sit alongside the two real destinations in one L2 list. Left open to grow — a
   further destination (Notifications, Sessions, etc.) is a one-line addition to
   `MY_ACCOUNT_ITEMS` in `nav-data.js`, not a restructure.

## Distribution batch — ALL 7 ITEMS DONE (commits `18a9dfd`, `5521c98`, `4396efe`)

1. **Rate plans** is now a clickable `records` list (same generalized pattern as Properties/
   Users/Dashboards) — generic sample names (Standard Rate, Non-Refundable, Advance Purchase,
   Long Stay), opening a simple shared `RATE_PLAN_NODE` (a basic stacked-cards stub).
2. **Yield rules** — same pattern, own shared `YIELD_RULE_NODE`, generic sample names (Weekend
   surcharge, Last-minute discount, Length-of-stay discount).
3. **Health check** simplified to ONE dashboard-cards page, no more tab strip. Initially given
   real card titles (the 7 confirmed names), then corrected — user: "health check is supposed
   to be generic - no labels" — every card is now fully titleless, same treatment as Insights'
   Dashboard.
4. **Grid pattern generalized** — `sketch: 'calendar'` is now a named preset of a new generic
   `sketch: 'grid'` (real or skeleton-only column headers, optional real or skeleton-only row
   labels). **Inventory** wired up with a skeleton-only 7×6 grid — user: "just a skeleton
   without words" — no real columns/rows decided yet, purely shape.
5. **Distribution's "Properties" item removed entirely.** User wasn't sure why it existed
   separately from Configuration's own Properties and wanted to work through the underlying
   question themselves. Open question logged in `IA-BY-USER-TYPE.md`'s SM-multiple-properties
   section — don't reintroduce without resolving that first.
6. **"Room types"** added as a new PROPERTY_NODE tab (right after "Property details") — a
   plain `sketch: 'list'`, per-property since there's no generic/shared room-type concept
   today. A speculative "manage centrally across properties" idea was floated but not
   designed — logged as connected to the foundational scope-switcher thread below, not solved
   in isolation.
7. **Reservations** changed from `content: null` to a plain `sketch: 'list'` (not the
   clickable `records` pattern, unlike Rate plans/Yield rules).

Two regressions were caught and fixed while implementing (see git log for full detail on
each): `resolveChain` wasn't pushing a step for plain leaf (`sketch`-type) content, so ALL such
content across the whole app had silently stopped rendering since the prior session's chain
refactor; and the standard content-margin wrapper was being applied per-nesting-level instead
of once, double-padding any tabs-within-tabs case to 48px instead of 24px.

A handful of small, reversible calls were made without live user input (user had stepped away
and said to keep going rather than wait) — each flagged inline in `## Done` below for a quick
look on review: which 2 items illustrate My insights' starring, Health check's tabs given
`list` as a first-pass type (flagged to reconsider once real column data suggests `table`),
applying the real-names breadcrumb exception to both the properties AND systems pickers, and
not wiring the new dashboard-card-grid pattern onto Insights' Dashboard (needs real card
titles first — only "Property Status" is confirmed anywhere in the docs).

## Known bugs / follow-ups (found and fixed or flagged during the last session)

Pulled out as their own list per user request, so nothing gets lost in narrative paragraphs.
The two regressions were both found AND fixed already (included here for visibility, not as
outstanding work); the rest are still-open follow-ups worth a look.

- **[FIXED]** `resolveChain` wasn't pushing a step for plain leaf (`sketch`-type) content —
  silently broke ALL such content across the whole app (Property settings' tabs, Direct
  Booking's Setup/Selling tools, Users, Media library) since the prior session's chain
  refactor. Root cause and fix in commit `55f69bc`.
- **[FIXED]** Standard content-margin wrapper (`.sketch`, 24px) was applied per-nesting-level
  instead of once, double-padding any tabs-within-tabs case (e.g. Properties → a specific
  property's own tabs) to 48px instead of 24px. Fixed in commit `05e9a70`.
- **[FIXED]** Tab strip had no gap between its bottom divider and the content cards below it
  once nested inside `.sketch`'s own padding — content sat flush against the tab row. Fixed in
  commit `6ab9eda`.
- **[OPEN]** Health check's 7 tabs use `sketch: 'list'` as a first-pass page-type choice —
  flagged to reconsider as `sketch: 'table'` once real column data for these error/status
  listings is known (they may fit a table better than a flat list).
- **[FIXED]** The dashboard-card-grid pattern is now wired onto Insights' Dashboard and every
  custom dashboard/chart (`CUSTOM_DASHBOARD_NODE`) — confirmed with user it needs NO titles at
  all (a mix of real + skeleton titles "gets weird"); every card is titleless, sized larger
  per "make them larger." Fixed in commit `e1d08e8`.
- **[FIXED]** Breadcrumb showed a stale/wrong 3rd segment once drilled into a specific
  property's own tabs (`PROPERTY_NODE.label` still literally "Property settings"). Fixed by
  treating a detail node's own tabs (reached via an explicit `records` drill-down) as a new
  root for crumb purposes. Fixed in commit `cf4a20b`, alongside generalizing the pattern
  itself (see `## Done` item 10).
- **[FIXED]** A `records` picker with no wrapping tabs layer (Users) never got its own label
  crumb, so the lone record-name crumb was suppressed by the "single crumb is noise" rule.
  Fixed in commit `cf4a20b`.

## Open questions

- **LH's account-type-specific rail differences beyond Front desk** — is Front desk the ONLY
  rail difference for LH, or are there other L1/L2/L3 differences from SM still to come? Also:
  does LH's "same as SM" content include the account-type/property-count Properties-gating
  logic unchanged (i.e. an LH account with multiple properties still gets a Properties tab
  the same way SM does), or does LH have its own property-count story?
- **Channels (#9) bulk-management story** — the redesign's stated goal is better bulk-action
  support across properties for the multi-property cohort. Given channel connections are
  confirmed to already work across multi-property accounts (MP's existing Channel adoption
  view), what does BULK channel management actually look like here (e.g. subscribe/configure
  one channel across many properties at once)? Not designed yet — flag for a follow-up
  conversation, likely informed by the same MP-bulk-primitives caveat already noted in
  `IA-BY-USER-TYPE.md` (MP enforces one shared config across bulk-selected entities, where
  single-property Platform allows per-entity config) — Channels may hit the identical tension.

## Foundational, unsolved — property/cluster/brand switcher

Seeded by the user as explicitly **foundational to the entire redesign** and **not yet
solved** — kept as its own section rather than a numbered queue item, since it's design work
still in progress, not a scoped implementation request. Don't attempt to implement any of
this until it's actually worked through; this is a placeholder to keep the shape of the
problem visible across sessions, not a spec.

**The core idea:** a property switcher — letting a multi-property user scope what they're
viewing to all properties, a specific property, or (for MP accounts) a cluster/brand — needs
to exist "in sections where it makes sense," but which sections, and how the switcher itself
behaves, varies and isn't uniform across the app. This is a different mechanism from the
existing Properties tab/picker (Configuration → Properties, Distribution → Properties) — that
picker is for navigating TO one specific property's own settings; this switcher is about
SCOPING a whole section's view (its data, dashboards, lists) across some subset of the
account's properties, without necessarily navigating anywhere.

**Why this whole feature exists (user's own articulation, captured verbatim in spirit):**
today the platform only has the context of a single property at a time. That loses real
efficiencies — whole-of-portfolio reporting, and distribution concepts too. The scope switcher
is the exploration of fixing that — NOT a settled mechanism to apply uniformly everywhere it
technically could go.

**Per-section state, as described so far — REVISED, no longer "Insights is the easy case":**
- **Insights is NOT uniformly solved either.** Originally treated as the clear/easy case
  (defaults to "all properties" for multi-property, hidden for single-property, individual
  properties + MP clusters/brands as scoping options) — but the user flagged that even within
  Insights, the switcher's relevance may not be uniform: "dashboard and charts might not make
  sense to have a property switcher... does it show only when its relevant?" i.e. Insights'
  own Dashboard/Charts (a user's PERSONAL custom views) may be a case where portfolio-wide
  scoping doesn't apply the same way it does for, say, a system Dashboard or Recommendations.
  This is a real UX question to work through, not resolved by the current sketch's blanket
  "show whenever propertyCount === 'multiple'" rule — don't treat Insights as settled.
- **Health check** — "would do the same" as Insights (same switcher behavior/defaults) — but
  see the note above: if Insights itself isn't uniform, Health check's "same as Insights"
  framing may need revisiting too, not assumed solved just because Insights was assumed solved.
- **Configuration** — likely NOT relevant / doesn't need this switcher, since most
  Configuration work happens one property at a time anyway (aligns with Configuration's
  existing Properties-tab-then-drill-into-one-property model).
- **Distribution** — **the hard, unsolved case.** User explicitly said they haven't solved
  this one. Distribution already has its own Properties tab/picker (bulk rate distribution
  tension already flagged elsewhere in `IA-BY-USER-TYPE.md`/`CONTEXT.md`) — how a
  section-wide scope switcher interacts with that existing per-entity picker, and with bulk
  operations across a scoped subset of properties, is unresolved. This is likely where the
  real design difficulty of the whole feature concentrates. The switcher is now shown visually
  throughout Distribution (Inventory/Rate plans/Yield rules/Health check, `scopeSwitcher: true`
  on the section) — a SKETCH ONLY, does not resolve any of the below.
  - **Inventory specifically is its own quandary within this**, raised directly by the user:
    "inventory is going to have to be single property... its a quandary - we cant really hide
    it but it almost needs to force to a property." Unlike Rate plans/Yield rules/Health check,
    "All properties" arguably isn't a meaningful state for a single inventory grid — the
    switcher can't just disappear (per the same "does it show only when it's relevant?"
    question raised for Insights), but may need to behave differently on Inventory than
    elsewhere in the same section: forced/defaulted to one specific property, with "All
    properties" removed as an option rather than just unselected. That would mean the
    switcher's own option set varies by item within one section, not just by section — a
    genuinely new wrinkle, not yet designed. Currently Inventory just shows the same "All
    properties"-default switcher as everything else; deliberately not fixed yet, logged here
    per the user's explicit "just log it for now."
  - **Considered and set aside (for now): making the switcher sticky/global, with nav itself
    reacting to scope** (some rail/L2 items disabled or hidden when scope isn't a single
    property — e.g. Inventory only clickable at single-property scope). Raised by the user as
    a possible resolution to the Inventory quandary above, then explicitly NOT committed to,
    for two stated reasons: (1) it has real unresolved design questions of its own — disabled
    vs. hidden vs. item-adapts-shape, and whether the boundary is per-item or per-section, since
    Rate plans/Yield rules don't obviously share Inventory's problem; (2) a behavioral
    objection specific to this feature's actual audience — the user pointed out that if nav
    availability depends on scope, the low-effort user behavior is to just leave the switcher
    parked on one property permanently and never discover the portfolio-wide views at all,
    which would suppress the very feature this whole exploration exists to add. Combined with
    the small target population (13.6% of accounts sit in the 2–5 property band, MP presumably
    smaller still — see CONTEXT.md's reference data points), the user judged the added
    complexity/risk of nav-availability logic isn't clearly worth it against a purely additive
    model (switcher as a display filter only, nav shape never changes) where multi-property
    users gain capability without costing single-property-habituated users anything. Keep this
    written down as a real candidate that was considered, not silently dropped — but don't
    build toward it without the user revisiting it.
  - **Emerging distinction (not yet built): reporting/status pages vs. management-flow detail
    pages** — a cleaner candidate rule than section-level on/off. Raised by the user via Rate
    plans: production already has a per-rate-plan "Properties" tab letting one rate plan be
    pushed to multiple properties individually (the same shape as `buildUserNode`'s Properties
    tab, not yet built for `RATE_PLAN_NODE`/`YIELD_RULE_NODE` in this prototype). Once you're
    inside that management flow, a portfolio scope switcher doesn't mean anything — the
    Properties tab already answers "which properties is *this* pushed to" more precisely than
    a view-scoping control could. But the switcher still makes real sense on the Rate
    plans/Yield rules LIST (browsing/reporting across plans) and on Health check (pure
    status/reporting, no per-property assignment flow underneath it at all — user confirmed
    "something like health check it makes sense"). So the rule isn't "Distribution vs. not" —
    it's "does a management flow with its own per-property assignment mechanism sit underneath
    this page." Inventory doesn't fit neatly into either side (see above) and stays its own
    open quandary. Nothing built yet — RATE_PLAN_NODE/YIELD_RULE_NODE still lack a Properties
    tab, and the switcher still shows uniformly across all of Distribution's items — logged
    per the user's "just log it" — but this is the leading candidate rule to implement next
    time this is picked up.
- **Transactions** — not yet discussed at all; no stated position either way.

**Known open threads this connects to (don't design in isolation from these):**
- The bulk rate distribution tension (`IA-BY-USER-TYPE.md`, SM multi-property section) — MP's
  production model enforces one shared config across bulk-selected entities; a scope switcher
  that lets you select "a cluster" or "3 properties" needs to reckon with the same tension.
- Channels' (queue item #9) own bulk-management question — same shape of problem again.
- Brands/Clusters (Configuration → Properties, MP-gated) are already a confirmed grouping
  concept in the app; this switcher reusing them as scoping units (not just organizational
  labels) is a new use for something that already exists structurally.
- Room types' speculative "manage centrally across properties" idea (Distribution batch item
  6) is the SAME shape of problem again — a per-property concept a customer might want scoped/
  switched across their portfolio. Don't solve any of these one at a time in isolation; they're
  all facets of the same underlying "single-property-only context loses portfolio efficiencies"
  tension the user articulated as the whole reason this exploration exists.

**Next step when picked back up:** work through Distribution specifically first (the stated
hard case), since Insights/Health check sound closer to "apply the same simple pattern" and
Configuration sounds like "doesn't need it" — Distribution is where the actual design
thinking still needs to happen before this becomes an implementable queue item.

**First-pass sketch (in progress, exploratory, done live in the running prototype rather
than only in this doc) — user asked to sketch the solved-shape cases to help reason through
the rest by seeing it, NOT a finished implementation:**
- Building a first rough version of the switcher for Insights and Health check only (the two
  "would do the same, easy" cases) — all-properties default for multi-property, hidden for
  single-property, individual properties + clusters/brands as scoping options for MP.
- Distribution and Transactions are deliberately NOT touched by this sketch — sketching them
  would mean guessing at the unsolved part, which defeats the purpose.
- This is throwaway/exploratory — expect it to change once Distribution's shape is worked
  out, since whatever mechanism this sketch invents for Insights/Health check needs to also
  make sense once Distribution's harder requirements are known. Don't treat this sketch's
  first implementation choices (e.g. where the switcher control lives, exact interaction) as
  locked in.

**Placement reconsidered — DONE (commit `fad34af`).** Moved from the top of the L2 panel to
the canvas's top-right (via `.canvas-scope-switcher`, `renderCanvas` instead of `renderPanel`).
Frees up the panel's own real estate for actual nav items, reads as a persistent page-level
control rather than a panel list item. Still not decided as FINAL — same as the rest of this
sketch, expect it to change further once Distribution's shape is worked out — but it's the
current implementation, not just a leaning anymore.

## Done

1. **Configuration's first item renamed** "Property settings" → "Property" (single-property
   case only; multi-property's "Properties" tabs item unchanged; `PROPERTY_NODE` itself
   unchanged).
2. **Users** — already existed before this queue; confirmed correct, no action taken.
3. **"Metasearch"** added as a Configuration item under the new Products heading.
4. **"Products" grouping heading** added to Configuration (a new non-clickable panel-list
   pattern — see PATTERNS.md's folder-vs-heading rule), containing Direct Booking/Channels
   Plus/Metasearch, with a "Manage products" stub row (`content: null`) after them.
5. **LH gets full SM content** (`getContent` no longer special-cases LH to `null`) **plus a
   new "Front desk" rail item** (bell icon, first/topmost) — `getRailItems(accountType)`
   replaces the old constant `RAIL_ITEMS`, the first case of the rail itself varying by
   account type. Front desk has no L2/L3 content yet (no placeholders); switching account
   type away from LH while on Front desk falls back to Insights.
6. **Health check** added to Distribution (last in order) with real confirmed content — a
   tabs page: Failed PMS deliveries, Delayed updates, Disabled channels, Channels awaiting
   connection setup, Mapping errors, Disabled channel rates, Distribution and system status
   (sourced from production MP routes via knowledge-base research). Currently `sketch: 'list'`
   per tab — flagged to reconsider as `table` once real column data is known. Kept
   deliberately separate from Channels (item 9) per explicit user correction mid-session.
7. **Page-skeleton design system**: standard content-area margin (`.sketch`, 24px, applied
   exactly once in `renderCanvas` — this fixed the two regressions noted above), full-width
   `.wf-list` (was max-width 520px), new `table` pattern (`.sketch-table`, real header row),
   new `dashboard-cards` pattern (`.sketch-dashboard-cards`, built but not yet wired to any
   real page — needs real card titles first), the real-names breadcrumb exception (properties
   + systems pickers), the folder-vs-heading panel-list distinction, and a full retrofit
   table in `nav-data.js`'s top comment mapping every existing item to its page-type. View vs.
   edit mode deliberately deferred, not started.
8. **Insights → "My insights"** folder (replaces the old flat `ugc` array) containing
   Dashboards + Charts (both `sketch: 'list'`), with non-functional illustrative starring — a
   couple of rows get a star icon (`.wf-list__row--starred`) and the same items are duplicated
   as starred top-level entries (`.nav-list-item__star`) alongside Dashboard/Recommendations.
9. **"Channels"** added to Configuration, placed ABOVE the Products heading (core
   functionality, not an add-on, per explicit user reasoning) — stub content for now. Scoping
   question resolved via research: channel connections confirmed to already span
   multi-property accounts today (real production "Channel adoption view" route).

### Second batch (all done, commits `cf4a20b` through `4e6df3c`)

10. **Generalized `type: 'properties'` into a reusable `type: 'records'` nav pattern**
    (`{ names, detailNode }`) per user's explicit "keep this pattern-based" direction — a
    generic "clickable records list → shared detail node" mechanism. Properties (→
    `PROPERTY_NODE`) and Users (→ `buildUserNode`) are both instances of the same mechanism
    now, not separate ones. Documented as a navigation pattern in PATTERNS.md, distinct from
    canvas sketch patterns.
11. **Users is now clickable** — 4 sample names (Jane Smith, Michael Chen, Priya Patel, Tom
    Reilly; generic realistic names, confirmed with user), each opening a shared detail node
    with tabs "User details" (always) and "Properties" (multi-property accounts only, showing
    which properties that user has access to). Breadcrumb: "Users / [name]".
12. **New standing rule: a `tabs` node with exactly one visible tab collapses straight to its
    content, no strip shown** — same treatment `type: 'systems'` already had for one connected
    system. Caught via Users' single-property case; generalized on the `tabs` content type
    itself via `options: []`, not a one-off fix.
13. **PROPERTY_NODE gets a mirrored "Users" tab** (last, after Integrated systems) — always
    shown (not property-count-gated, unlike USER_NODE's "Properties" tab) since every property
    has users with access to it regardless of account state.
14. **"Manage products" renamed to "Add products"** with a leading "+" icon — a new
    **action-row** panel-list pattern, a third alongside folder/heading (PATTERNS.md): a plain
    clickable item, just visually marked as an action rather than a settings-page destination.
15. **Insights item order reshuffled**: Dashboard, [starred/pinned items], My insights,
    Recommendations — was Dashboard, Recommendations, My insights, [starred items].
    Recommendations moved to the end as a separate concept from dashboards, per user's
    reasoning.
16. **Scope switcher repositioned**: L2 panel top → canvas top-right, via a new
    `.canvas-scope-switcher` wrapper rendered from `renderCanvas` instead of `renderPanel` —
    frees the panel's own space, reads as a persistent page-level control. Still not decided
    as final (see the "Foundational, unsolved" section above), but it's the current
    implementation now, not just a leaning.
17. **Front desk becomes a full-width calendar page with no L2 panel.** New 5th canonical
    page-skeleton type (`sketch: 'calendar'` — weekday header + 7×5 grid of skeleton day
    cells) and a new section-level `noPanel: true` flag (`render()` hides the panel column via
    `display: none`, not just emptying it, which would still reserve its fixed width) — the
    first content item to opt out of the L2 panel entirely. User's stated reason: "this is
    what customers always want for the calendar is max space," a confirmed product need.
18. **Scope switcher gets a custom dropdown chevron.** `appearance: none` was stripping the
    native `<select>` arrow entirely — added a custom SVG chevron via `background-image` so it
    still visibly reads as a dropdown.
19. **Dashboard-cards pattern wired up, titleless throughout.** Insights' Dashboard and every
    custom dashboard/chart (new `CUSTOM_DASHBOARD_NODE`) use the dashboard-cards skeleton — NO
    titles at all, ever (reversed an earlier one-real-title choice; mixing real + skeleton
    titles "gets weird"), skeleton title bar sized larger ("make them larger").
20. **"Dashboards"/"Charts" (under My insights) are now clickable `records` pickers**, same
    generic pattern as Properties/Users, each name opening `CUSTOM_DASHBOARD_NODE`. The
    illustrative star now shows on the actual picker row too (new `starredNames` support in
    `renderRecordPicker`), not just the duplicated top-level item — sample names include
    "Weekly performance"/"Portfolio health"/"Channel comparison" so the star visibly lines up
    with the promoted items using the exact same names.
21. **"Recommendations" changed from `content: null` to `sketch: 'list'`** — a list-type page
    like Users/Health check's tabs, per user's direction.
