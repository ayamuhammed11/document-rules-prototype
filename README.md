# Document Rules — Kashier Onboarding Prototype

A standalone HTML prototype of Kashier's document-rules-driven merchant onboarding — four
connected pages spanning the agent (sales) side and the merchant (self-serve) side.

## Pages

- **[document-rules.html](document-rules.html)** — **All Rules.** The agent-portal list of
  requirement rules, with filters by entity, bank, merchant type, and service, an Events
  audit trail, and view/edit/delete actions on each rule.

- **[document-rules-create.html](document-rules-create.html)** — **Create Rule.** The rule
  builder, reached from All Rules' tab bar or "Add Rule" — also handles editing an existing
  rule via `?edit=<id>`. Every rule is built on a **single service**, picked first, and then
  narrowed with any additional conditions (entity type, owner nationality, industry, bank,
  merchant type) before choosing which document types become required. Rules, ids, and
  events are shared with the list page through `localStorage`, so actions on either page are
  reflected on the other without a backend.

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

All four pages use the **identical rule-matching logic and document set**, so a given set of
criteria produces the same checklist everywhere.

## Services

The service catalog mirrors the Kashier Services operations portal, split into **Basic**
and **Add-on** tiers:

| Tier | Services |
| --- | --- |
| Basic | Online Card, Online Wallet, Online Valu, Online Octo, Online Auth n Cap, POS Card, POS Wallet, POS Valu, POS Octo, POS Auth n Cap |
| Add-on | Branches, Currency Conversion, Instant Settlement |

Channel is part of the service name itself (`Online Card` / `POS Card`) rather than a
separate condition. The source portal also groups services by category, but every category
there is currently empty, so that layer isn't reproduced here.

## Other conditions

Entity Type (Individual Seller / Registered Business / Professional Business), Business
Owner Nationality, Industry, Bank, and Settlement type (PF / PSP) — used to narrow a rule
beyond its service. Settlement type takes a single option; the rest allow several.

## Matching semantics

Within a condition group: OR. Across groups: AND. A rule (or the built-in universal
requirements) with no conditions in a group matches everyone. Service is the exception —
each rule carries exactly one.

## Run it

No build step — every page is self-contained:

```bash
open document-rules.html          # All Rules (agent/admin)
open document-rules-create.html   # Create/Edit Rule (agent/admin)
open merchant-onboarding.html     # New Application (sales)
open documents-upload.html        # Documents (merchant)
```

`index.html` mirrors `document-rules.html` so the repo root also works on GitHub Pages.

> Note: each page's sidebar links to other portal pages (Terminals, Home, On-Hold, …) that
> are part of the full prototype project and are not included in this repo — those links
> will 404 here. Links between the pages above work normally.
