# Document Rules — Kashier Onboarding Prototype

A standalone HTML prototype of Kashier's document-rules-driven merchant onboarding — five
connected pages spanning the agent (sales) side and the merchant (self-serve) side.

In the agent portal sidebar, **Document Types** and **Document Rules** sit together under a
collapsible **Documents** module.

## Pages

- **[document-rules.html](document-rules.html)** — **All Rules.** Rules grouped into a table
  per service (a rule covering several services appears under each), with a rule-name search box, filters by channel, service, merchant
  type, industry, financial institution, and settlement type, and an Events audit trail. Clicking a row
  opens its detail view, with Edit and Delete actions there.

- **[document-rules-create.html](document-rules-create.html)** — **Create Rule.** The rule
  builder, reached from All Rules' tab bar or "Create Rule" — also handles editing an existing
  rule via `?edit=<id>`. Fields follow the Pricing Rules wizard's own order: Rule Name, then
  **channel** and **service**, then merchant type, owner nationality, industry, settlement
  type, and financial institution, before choosing which document types become required —
  all multi-select, as one flat, identically-styled sequence, with no divider between the
  primary fields and the rest. Rules, ids, and events
  are shared with the list page through `localStorage`, so actions on either page are
  reflected on the other without a backend.

- **[document-types.html](document-types.html)** — **Document Types.** The catalogue the
  rules draw on: each document type's name (English and Arabic), description, required
  conditions, accepted formats, size limit, and whether it is captured as one file or as
  named parts (front/back).

- **[merchant-onboarding.html](merchant-onboarding.html)** — **sales side.** A salesperson
  starts a new merchant application: Merchant Details, then the same Criteria & Services
  conditions as Document Rules. The required-documents checklist computes live as criteria
  are picked. From there the agent can preview the merchant's own upload experience, or
  collect documents in person via an inline agent-assisted upload panel, then create the
  application — logged to an Events audit trail, and generates a shareable application link
  that hands the entered criteria off to the merchant's own page.

- **[documents-upload.html](documents-upload.html)** — **merchant side.** The self-serve
  page a merchant completes during onboarding: the same Criteria & Services form drives a
  live-computed required-documents checklist, with per-document upload, draft-save,
  submit-for-review, and simulated compliance approve/reject states. Opening it via an
  application link from `merchant-onboarding.html` pre-fills the criteria and greets the
  merchant by name instead of showing the default seeded demo.

The rules and onboarding pages use the **identical rule-matching logic and document set**, so
a given set of criteria produces the same checklist everywhere.

## Channel and Service

These are two separate fields, matching how the Pricing Rules module itself keeps them
apart rather than folding channel into the service name. A rule picks one or more
**Channels** (Online / POS) and one or more **Services** from a plain 14-method list; the
two are chosen independently, in that order on the form.

| Field | Options |
| --- | --- |
| Channel | Online, POS |
| Service | Card, Wallet, Valu, OCTO, Souhoola, Contact, Basata, Mogo, Tru, Forsa, Aman, Bank Installments, Transfer, Instapay |

Pricing Rules never prices Add-on services (Branches, Currency Conversion, Instant
Settlement) — they're enabled by their own toggle, not a rule — so they aren't part of this
catalog either.

**Financial Institution** hides itself when every selected service is one of the
installment-only methods with no financial institution of its own: Souhoola, Valu, OCTO,
Basata, Mogo, Tru, Forsa, or Aman. With a mix of services it stays visible, since at least
one of them has one. Hiding it clears any financial institution already picked, and it
isn't required while hidden.

## Other conditions

Merchant Type (Individual Seller / Registered Business / Professional Business), Business
Owner Nationality, Industry, Financial Institution, and Settlement type (PF / PSP) — used to
narrow a rule beyond its channel and service. Every one allows several options. Business
Owner Nationality is the one optional condition — every other group needs at least one pick
(Financial Institution included, except where it doesn't apply at all — see above).

Every condition (and Document Types) has a **Select all** checkbox — checked means every option in
that group is picked; unchecking it clears the group — matching the checkbox Pricing Rules
uses in its own criteria blocks.

## Matching semantics

Within a condition group: OR. Across groups: AND.

Every condition group needs at least one option, except Business Owner Nationality (always
optional) and Financial Institution (optional only when no selected service has one).

On load, both Document Rules pages prune stale saved rules — those written before the
catalog shrank, before every condition became required, or before Channel and Service split
into separate fields. A rule keeps whatever services and channels remain valid; one left
without a valid service or channel can never match anything, so it is removed and logged to
the Events trail as either `service retired` or `no service set`.

(The built-in universal requirements on the onboarding pages — National ID, bank proof —
still apply to every applicant; that is baked-in demo data, not an authored rule.)

## Run it

No build step — every page is self-contained:

```bash
open document-rules.html          # All Rules (agent/admin)
open document-rules-create.html   # Create/Edit Rule (agent/admin)
open document-types.html          # Document Types catalogue (agent/admin)
open merchant-onboarding.html     # New Application (sales)
open documents-upload.html        # Documents (merchant)
```

`index.html` mirrors `document-rules.html` so the repo root also works on GitHub Pages.

> Note: each page's sidebar links to other portal pages (Terminals, Home, On-Hold, …) that
> are part of the full prototype project and are not included in this repo — those links
> will 404 here. Links between the pages above work normally.
