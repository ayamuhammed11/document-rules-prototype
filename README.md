# Document Rules — Kashier Agent Portal Prototype

A standalone HTML prototype of the **Document Rules** module for the Kashier agent portal.

Authorized users create requirement rules — each rule links one or more document types to
conditions (entity type, industry, bank, module, service, and risk flags). When a merchant
or salesperson's selections during onboarding match a rule's conditions, the linked
documents are displayed and required to proceed with the onboarding application.

## Features

- **Rule builder** — rule name, multi-select document types, and condition groups with
  `ANY ✓` indicators when a group is left unrestricted
- **Matching semantics** — within a condition group: OR · across groups: AND · empty
  group: matches everyone (rule shows a `UNIVERSAL` tag)
- **Rules list** — condition pills, edit (prefilled builder), delete with confirmation,
  and filters by Entity / Bank / Module / Service
- Kashier design-system tokens (Ocean / Teal palette, Outfit + Noto Sans, 4px radius)

## Run it

No build step — it is a single self-contained HTML file:

```bash
open document-rules.html   # or just double-click it
```

`index.html` is an identical copy so the page also works at the repo root on GitHub Pages.

> Note: the sidebar links to other portal pages (Terminals, Document Types, On-Hold, …)
> that are part of the full prototype project and are not included in this repo.
