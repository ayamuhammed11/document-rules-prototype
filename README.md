# Document Rules — Kashier Onboarding Prototype

A standalone HTML prototype of Kashier's document-rules-driven merchant onboarding — five
connected pages spanning the agent (sales) side and the merchant (self-serve) side.

In the agent portal sidebar, **Document Types** and **Document Rules** sit together under a
collapsible **Documents** module.

## Pages

- **[document-rules.html](document-rules.html)** — **All Rules** and **History**, as tabs under a
  breadcrumb header with an "Add Document Rule" button. *All Rules* is one table card — an
  "All document rules" header with a rule-name search and a Filter button that opens a strip of
  searchable dropdowns (channel, service, merchant type, industry, financial institution,
  settlement type; applied with Submit Filters, reset with Clear All). The table lists every
  rule by name, newest first, sortable and paginated, with a row menu (Details / Edit / Delete).
  *History* is the module-wide audit trail of every rule created, updated or deleted. Clicking
  a row opens a right-hand **Rule Details** drawer with two sub-tabs: **Details**, and **Logs** —
  that one rule's timeline, naming the sections each entry created, added to, updated or removed.
  Edit and Delete live in the drawer.

- **[document-rules-create.html](document-rules-create.html)** — **Add document rule.** The
  rule builder — also handles editing an existing rule via `?edit=<id>`. A single card: Rule
  name, then Channel, Service, Merchant type, Owner nationality, Settlement type, Industry,
  Financial institution, and Required documents. Every section is required and multi-select.
  Rules, ids, and events are shared with the list page through `localStorage`, so actions on
  either page are reflected on the other without a backend.

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
apart rather than folding channel into the service name. Pick one or more **Channels**
(Online / POS); the **Service** dropdown then opens a block per selected channel, each listing
that channel's own services, so a service is chosen per channel. A rule is a single record: it
holds every channel and the services picked under each of them: Online Card + Online
Wallet + POS Card is one rule, listed once by its name, with "Online, POS" in the Channel column.
Every ticked channel needs at least one service, and unticking a channel drops its services.
Editing the rule adds or removes channels and services on that same rule, and the change shows
up in its Logs.

| Field | Options |
| --- | --- |
| Channel | Online, POS |
| Service | Card, Wallet, Valu, OCTO, Souhoola, Contact, Basata, Mogo, Tru, Forsa, Aman, Bank Installments, Transfer, Instapay (offered under each channel) |

Pricing Rules never prices Add-on services (Branches, Currency Conversion, Instant
Settlement) — they're enabled by their own toggle, not a rule — so they aren't part of this
catalog either.

**Financial Institution** hides itself when every selected service is one of the
installment-only methods with no financial institution of its own: Souhoola, Valu, OCTO,
Basata, Mogo, Tru, Forsa, or Aman. With a mix of services it stays visible, since at least
one of them has one. Hiding it clears any financial institution already picked, and it
isn't required while hidden.

## Other conditions

Merchant type (Individual / Professional / Registered), Owner nationality, Settlement type
(PF / PSP), Industry, and Financial institution — used to narrow a rule beyond its channel and
service. Each is multi-select and required (Financial institution except where it doesn't apply
at all — see above). Owner nationality, Settlement type, Industry, Financial institution and
Required documents have a **Select all** link that toggles between selecting everything and
clearing the group.

A group covering every option, or left empty on an older rule, matches everyone and is shown as
"All merchant types", "All owner nationalities", and so on.

## Audit trail

Every create, update and delete is recorded with who did it and when, against the rule's id.
The History tab shows them all; a rule's own Logs tab shows just its entries, each naming the
sections it created, or added to, updated or removed (for example "Added: Channel, Service" or
"Updated: Rule name"). Saving an edit that changes nothing adds no entry. A deleted rule's
entries stay in History.

The first visit with nothing stored loads a small set of demo rules and events (once — deleting
everything leaves it empty).

## Matching semantics

Within a condition group: OR. Across groups: AND.

Every condition group needs at least one option, except Financial institution when no
selected service has one.

On load, both Document Rules pages migrate older saved rules: a rule saved with flat channel and
service lists gains the per-channel service map, and one left without a valid service or channel
can never match anything, so it is removed and logged to History as either `service retired` or
`no service set`.

(The built-in universal requirements on the onboarding pages — National ID, bank proof —
still apply to every applicant; that is baked-in demo data, not an authored rule.)

## Run it

No build step — every page is self-contained:

```bash
open document-rules.html          # All Rules (agent/admin)
open document-rules-create.html   # Add/Edit Rule (agent/admin)
open document-types.html          # Document Types catalogue (agent/admin)
open merchant-onboarding.html     # New Application (sales)
open documents-upload.html        # Documents (merchant)
```

`document-rules-core.js` is the data layer both Document Rules pages load (reference data,
storage, audit trail, migration, demo data). `index.html` mirrors `document-rules.html` so the
repo root also works on GitHub Pages.

> Note: each page's sidebar links to other portal pages (Terminals, Home, On-Hold, …) that
> are part of the full prototype project and are not included in this repo — those links
> will 404 here. Links between the pages above work normally.
