# Document Rules — Kashier Onboarding Prototype

A standalone HTML prototype of Kashier's document-rules-driven merchant onboarding — five
connected pages spanning the agent (sales) side and the merchant (self-serve) side.

In the agent portal sidebar, **Document Types** and **Document Rules** sit together under a
collapsible **Documents** module.

## Pages

- **[document-rules.html](document-rules.html)** — **All Rules.** Rules grouped into a table
  per service, with a rule-name search box, filters by merchant type, financial institution,
  settlement type, and service, and an Events audit trail. Clicking a row opens its detail
  view, with Edit and Delete actions there.

- **[document-rules-create.html](document-rules-create.html)** — **Create Rule.** The rule
  builder, reached from All Rules' tab bar or "Add Rule" — also handles editing an existing
  rule via `?edit=<id>`. Every rule is built on a **single service**, picked first, and then
  narrowed with any additional conditions (merchant type, owner nationality, industry,
  financial institution, settlement type) before choosing which document types become
  required. Rules, ids, and events are shared with the list page through `localStorage`, so
  actions on either page are reflected on the other without a backend.

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

## Services

The service catalog matches the Pricing Rules module's own service list exactly: 14 payment
methods, each available **Online** and **POS** — 28 services in total.

| Channel | Methods |
| --- | --- |
| Online | Card, Wallet, Valu, OCTO, Souhoola, Contact, Basata, Mogo, Tru, Forsa, Aman, Bank Installments, Transfer, Instapay |
| POS | same 14 methods |

Channel is part of the stored service value (`Online Card` / `POS Card`) rather than a
separate condition, but each picker groups its chips under an Online / POS header, so the
chip itself only shows the method name — the channel comes from the header it sits under.
Every other display (the list table, filters, the view modal, the selected-service hint)
shows the full `Online Card` / `POS Card` form, since those have no grouping header to
supply the channel.

Pricing Rules never prices Add-on services (Branches, Currency Conversion, Instant
Settlement) — they're enabled by their own toggle, not a rule — so they aren't part of this
catalog either.

## Other conditions

Merchant Type (Individual Seller / Registered Business / Professional Business), Business
Owner Nationality, Industry, Financial Institution, and Settlement type (PF / PSP) — used to
narrow a rule beyond its service. Settlement type takes a single option; the rest allow
several.

## Matching semantics

Within a condition group: OR. Across groups: AND.

Every condition group needs at least one option, so a rule can no longer be left open on a
dimension. Service and Settlement type are single-select, so for them that means exactly
one.

On load, both Document Rules pages prune stale saved rules — those written before the
catalog shrank or before every condition became required. A rule keeps whatever services
remain valid; one left with none can never match anything, so it is removed and logged to
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
