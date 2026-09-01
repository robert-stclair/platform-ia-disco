# IA schemes by user/account type

A working doc to track how the IA differs — or doesn't — across account types and property
counts. Edit this directly as decisions are made; it's the place to think out loud about a
specific user type without having to hold the whole nav tree in your head. Mirror confirmed
decisions back into `CONTEXT.md` (the terse, settled log) and the Confluence decisions page
once they're solid — this doc is allowed to be messier/more exploratory than either of those.

**The confirmed model** (see `CONTEXT.md` for the full reasoning): account type and property
count are independent axes. One IA, not several — the rail and top-level sub-nav are constant;
what changes across types lives in the secondary/tertiary layers only.

```
                 │ single property        │ multiple properties
─────────────────┼─────────────────────────┼──────────────────────────
 SM (no MP)      │ Property settings only  │ Properties tab (no
                 │ (property-scope layer   │ Brands/Clusters — those
                 │ collapses away)         │ are MP-gated)
─────────────────┼─────────────────────────┼──────────────────────────
 LH               │ undefined — TBD         │ undefined — TBD
─────────────────┼─────────────────────────┼──────────────────────────
 MP               │ Properties tab incl.    │ Properties tab incl.
                 │ Brands/Clusters         │ Brands/Clusters
```

## SM (SiteMinder core), single property (~80% of accounts)

**Status: primary confirmed scheme — everything else is a variation on this.**

- Property-scope layer is invisible — there's only one property, so no picker/tab appears
  anywhere. Configuration's first item is plain "Property settings."
- Full nav as built: see `NOTES-CLEANUP.md` §1 for the literal current sitemap.
- Insights UGC: 2 custom-dashboard slots (Weekly performance, Channel comparison).

Open questions specific to this group:
- (none currently — this is the best-understood segment)

## SM, multiple properties (2–5 properties: 13.6% of accounts; 50–100+: enterprise)

**Status: confirmed for the parts that exist; Brands/Clusters explicitly do NOT apply here.**

- Configuration → "Properties" tab strip appears (Properties / — no Brands, no Clusters, since
  those are MP-gated separately from property count).
- Insights UGC gains a third slot: Portfolio health.

Open questions specific to this group:
- **Why did Distribution have its own "Properties" item at all, separate from Configuration's?**
  Distribution used to get its own Properties item (migrated from an early legacy shape to the
  generic `records` pattern during the structural refactor) — but the user flagged, on
  reflection, that they're not sure this belongs: "how did we end up with properties in
  distribution? i think thats something i need to work through actually." **Removed for now**
  (CHANGE-QUEUE.md Distribution batch, item 5) — Configuration's own Properties item is
  unrelated and unaffected. This is explicitly the user's own open thread to work through, not
  a decision to guess an answer to — don't reintroduce a Distribution Properties item without
  a real resolution of what problem it's meant to solve (is it about scoping Rate plans/Yield
  rules to a specific property? Bulk operations across properties? Something else entirely?).
  Likely connects to the still-unsolved property/cluster/brand scope switcher below, and to the
  bulk rate distribution question just below this one — Distribution's whole property-scoping
  story is still genuinely unresolved, not just this one item.
- **Bulk rate distribution mechanics** — real tension flagged in `CONTEXT.md`: MP's production
  model enforces one shared config across bulk-selected entities (Group Rate Plan → Property
  Rate Plan → Property Room Rate), where single-property Platform allows per-entity config.
  Does a non-MP multi-property account get bulk editing at all, and if so which model?
- **Channels/OTA subscriptions — scoping resolved, placement still open.** A "Channels" item
  (list of subscribed OTAs/channels + their management, e.g. Booking.com/Expedia) is wanted.
  Scoping question — resolved via knowledge-base research: confirmed production MP routes
  include a "Channel adoption view" (`/all-properties/distribution/adoption`) working across
  multi-property accounts today, so channel connections DO span multi-property, at the
  account/portfolio level (not purely per-property). This is the SAME shape of open question
  as bulk rate distribution above (both touch the redesign's stated goal of better bulk-action
  support across properties) — MP's confirmed "one shared config across bulk-selected
  entities" tension for rate plans may apply identically to bulk channel management; not yet
  designed. Placement (Distribution vs. Configuration) is queued as CHANGE-QUEUE.md item #9,
  still open. **Not the same thing as Health check** (a separate Distribution item, queued as
  item #6 with real confirmed content sourced from the same MP routes research) — a couple of
  Health check's tabs happen to mention channels (Disabled channels, Channels awaiting
  connection setup) but that's a domain-content overlap, not an IA relationship; don't let
  Health check's placement or design inform Channels' or vice versa.
- Does Transactions differ here at all? Flagged as unexamined in `CONTEXT.md` — worth an
  explicit "no differences found" pass rather than leaving it as "presumed same."

## MP (Multi-Property product), any property count

**Status: partially confirmed** — Brands/Clusters placement and gating are decided; the rest of
MP's differentiation from plain multi-property SM is largely undecided.

- Brands and Clusters: confirmed placement (Configuration → Properties, as sibling tabs to the
  Properties list itself), confirmed gating (`accountType === 'MP'`, independent of property
  count — an MP account with exactly one property still gets Brands/Clusters). No content wired
  up for either yet (deliberately — no placeholders).
- **MP Lite precedent** (see `CONTEXT.md` reference data points): an existing lighter MP tier —
  property switcher, insights/reporting, brands/clusters, connectivity health, but explicitly
  *no* bulk rate management. Worth reconciling against this prototype's model: does "MP" here
  represent full MP, MP Lite, or should the two be distinguished as a further sub-axis?
- What does MP actually change beyond Brands/Clusters? Nothing else is confirmed yet — right
  now an MP account's nav is identical to a multi-property SM account's, plus the two extra
  tabs. Is that actually correct, or just unexamined?

Open questions specific to this group:
- MP Lite vs. full MP — same axis or a new one?
- Bulk rate distribution model (shared with the SM multi-property question above, but MP's
  production behavior is the concrete example driving it).
- Does MP change Insights/Transactions at all, or only Configuration?

## LH (Little Hotelier)

**Status: fully undefined by design.** Intentionally renders empty (`getContent` returns `null`
for `accountType === 'LH'`) rather than guessing. Nothing to fill in here until real LH nav
differences are confirmed — this section exists as a placeholder for that future conversation,
not as work to do now.

Known relevant context from the knowledge base (not yet translated into nav decisions):
- LH is an all-in-one product with its own churn/migration dynamics (PESI migration, DACH
  churn) — worth understanding whether LH's differences are structural (a genuinely different
  nav) or just feature-gating on the same structure.

## Cross-cutting, not yet assigned to a specific type

- **Channels Plus** — no content for any account type yet. Worth checking whether it varies by
  type at all before assuming it's uniform.
- **Users** — currently a flat list sketch for everyone; no per-type variation considered yet
  (e.g. does an MP account manage users differently — per-property roles vs. account-wide?).
- **The Optimisation Engine consolidation** (Quin/DOE-ROE roadmap: Smart Guide + NBA + Sigint +
  DS/LLMOps + Channels Plus "Optimise" → one engine) will likely touch Insights →
  Recommendations for every type eventually — worth designing Recommendations with that
  consolidation in mind rather than the current fragmented state, regardless of account type.
- **Property/cluster/brand scope switcher — explicitly called out by the user as foundational
  to the entire redesign, and explicitly NOT yet solved.** Full detail kept in
  `CHANGE-QUEUE.md`'s dedicated "Foundational, unsolved" section rather than duplicated here.
  Short version: a section-wide scope switcher (all properties / one property / a
  cluster-or-brand for MP) is needed in some sections but not others — Insights and Health
  check are the easy/solved-shape cases (default to all-properties, hidden for single-property
  accounts), Configuration likely doesn't need it, Distribution is the hard unsolved case, and
  Transactions hasn't been discussed. This is a DIFFERENT mechanism from the existing
  Properties tab/picker (which navigates to one property's own settings) — this one scopes a
  section's whole view. Don't design new sections' property/multi-property behavior without
  checking whether this switcher is meant to apply there first.

## How to use this doc

- Add a new section per type as it gets real decisions, not before — an empty "TBD" section
  (like LH above) is fine and intentional; a guessed-at one is not.
- When a question here gets answered, move the answer into the relevant section above, delete
  it from "Open questions," and mirror it into `CONTEXT.md`'s decisions log.
- If a decision turns out to apply identically across all types, say so explicitly (like
  "Property settings has direct tabs" in `CONTEXT.md`) rather than leaving it implicit — that's
  what stops us from accidentally treating identical behavior as three separate designs.
