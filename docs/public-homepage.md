# Public homepage verification

## Scope

The public product story is now the default entry. Farm registration, preparedness actions and the farmer summary remain in the separate field workspace. This phase changes presentation and navigation, not the database schema or API contract.

The page explains the current three-step workflow, intended users, consent boundaries and planned capabilities. Its primary action opens the working field workspace. The README describes the problem and product; engineering commands are in the developer guide.

## Checks completed

| Check | Result |
| --- | --- |
| Backend | 16 PostgreSQL integration and security tests passed; Java formatting passed. |
| Frontend units | 18 boundary and route-selection tests passed. |
| Browser journeys | 15 tests passed, including all seven foundation journeys. No retries configured. |
| Static checks | Frontend formatting, ESLint and production build passed. |
| Dependencies | Production npm audit reported no vulnerabilities. No dependencies were added. |
| Original tools | All five repository Python test scripts passed. |
| Public HTML | Headline, navigation, product explanation and native FAQ work with JavaScript disabled. |
| API independence | Opening the public page makes no farm API requests, including when that API is blocked. |
| Navigation | Public-to-workspace entry, return home, browser history, legacy workspace hashes and unknown paths checked. |
| Failure handling | A blocked workspace bundle renders a retry screen; retry opens the workspace after the block is removed. |
| Accessibility | Automated WCAG A/AA scans, skip-link focus, keyboard disclosure, Escape handling and section focus passed. |
| Reflow | No horizontal overflow at 1440, 390 or 320 pixels, including expanded mobile navigation. |
| Motion | Reduced-motion browser journey passed; global rules remove non-essential transitions. |
| Prose | Product README, decision record and rendered homepage copy passed the repository's pedantic prose check. |
| Repository skills | All 58 original skills preserved unchanged; relevant instructions recorded in `skills-used.md`. |

Visual inspection covered the complete desktop and mobile homepage, the 320-pixel entry, expanded mobile navigation, expanded FAQ, the existing workspace and the exact README screenshot. The screenshot is a browser export of the public entry, not a proposed mock-up. The farm preview is explicitly illustrative and contains no farmer identity.

## Implementation review

The public page imports no farm API client and includes no live records in its build output. The workspace is lazy-loaded. Production HTML is hydrated rather than replaced on the public route, and the workspace entry is marked `noindex,nofollow`. Native disclosures do not require JavaScript for basic menu or FAQ operation.

No fabricated testimonials, partner logos, adoption totals, weather readings or compensation claims were introduced. Only repository assets and original product branding were used. The skill prose check is a style check, not proof of human authorship.

The local implementation review and automated tests do not replace an independent human review. Production deployment, identity-provider integration and field-pilot approval remain separate gates. A `noindex` directive is not an access-control mechanism.

## Release boundary

This remains an evaluation workspace for synthetic records. Official warnings, approved local actions, offline synchronisation, recovery hand-offs, browser sign-in and deployment are not part of this phase. No production CD target has been configured.

See [the homepage decision](decisions/0002-public-homepage.md), [the developer guide](development.md) and [the foundation gates](foundation.md).
