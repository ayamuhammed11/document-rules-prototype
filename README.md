# Document Rules — Kashier Onboarding Prototype

A standalone HTML prototype of Kashier's document-rules-driven merchant onboarding — three
connected pages spanning the agent (sales) side and the merchant (self-serve) side.

## Pages

- **[document-rules.html](document-rules.html)** — the agent-portal module where authorized
  users create requirement rules. Each rule links one or more document types to conditions
  (entity type, owner nationality, industry, bank, module, service, channel). When a
  merchant's or salesperson's selections match a rule's conditions, the linked documents are
  required to proceed with onboarding. Includes a rules list with filters and an Events audit
  trail.

- **[merchant-onboarding.html](merchant-onboarding.html)** — **sales side.** A salesperson
  starts a new merchant application: Merchant Details, then the same Criteria & Services
  conditions as Document Rules. The required-documents checklist computes live as criteria
  are picked. From there the agent can preview the merchant's own upload experience, or
  collect documents in person via an inline agent-assisted upload panel, then create the
  application — logged to an Events audit trail.

- **[documents-upload.html](documents-upload.html)** — **merchant side.** The self-serve
  page a merchant completes during onboarding: the same Criteria & Services form drives a
  live-computed required-documents checklist, with per-document upload, draft-save,
  submit-for-review, and simulated compliance approve/reject states.

Both onboarding pages use the **identical rule-matching logic and document set** as
Document Rules, so a given set of criteria produces the same checklist on either side.

## Matching semantics

Within a condition group: OR. Across groups: AND. A rule (or the built-in universal
requirements) with no conditions in a group matches everyone.

## Run it

No build step — every page is self-contained:

```bash
open document-rules.html        # rule builder (agent/admin)
open merchant-onboarding.html   # new application (sales)
open documents-upload.html      # document upload (merchant)
```

`index.html` mirrors `document-rules.html` so the repo root also works on GitHub Pages.

> Note: each page's sidebar links to other portal pages (Terminals, Home, On-Hold, …) that
> are part of the full prototype project and are not included in this repo — those links
> will 404 here. Links between the three pages above work normally.
