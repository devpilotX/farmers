# Foundation verification

Verdict: SHIP for isolated local evaluation with synthetic data. DO NOT SHIP as a live farmer service.

Checked on 3 October 2026. A successful local test run is not an independent code-review approval or a scientific validation of agricultural advice.

## Commands and results

| Check | Result |
| --- | --- |
| `mvn -B -f backend/pom.xml spotless:check verify`, with a separate PostgreSQL test database | 16 tests, 0 failures, 0 errors, 0 skipped; BUILD SUCCESS |
| `npm run format:check` in `web/` | All matched files use Prettier code style |
| `npm run lint` in `web/` | Exit 0, no lint findings |
| `npm test` in `web/` | 6 passed |
| `npm run build` in `web/` | TypeScript and Vite build passed; JavaScript approximately 75.9KB gzip, CSS approximately 3.7KB gzip |
| `npm audit --omit=dev` in `web/` | Found 0 vulnerabilities |
| `CHROMIUM_PATH="$(command -v chromium)" npm run test:e2e` | 7 passed, with no retries |
| Original five `tests/test_*.py` scripts | Each reported 0 checks failed |
| Prose detector at `--strict` | 0 high, 0 medium findings; one low-severity wording suggestion |
| PostgreSQL dump and restore into a separate local database | Restored 9 synthetic farms and 27 related actions |

The dump/restore check used only local sample records. It is not a tested production backup policy.

## Risk-based coverage

Backend tests cover required consent, missing and out-of-range coordinates, invalid geometry and area, conflicting idempotency keys, concurrent identical registrations, repeated task writes, wrong-farm task identifiers, organisation isolation, missing tokens, missing scopes, malformed tenant claims, safe errors, database health and refused public demo bindings.

Browser tests cover the full registration/checklist/summary journey, persistence after refresh, print layout, service outage and retry, empty results, mobile navigation, keyboard registration, invalid boundary recovery, preserved values after failed save, loading and partial-data states. Automated axe scans ran on overview, registry, registration, preparedness and summary using WCAG A/AA rule tags.

A transition that temporarily reduced navigation contrast was removed. A partial-summary bug that could report missing actions as zero completion was fixed and given a regression test. No test is skipped or configured to retry.

## Visual and accessibility checks

Rendered and inspected the five desktop routes at 1440px. Inspected mobile overview, registration, expanded navigation and summary at 390px. The capture diagnostics reported no horizontal overflow, clipped content or overlapping overlays. The snapshot capture's missing favicon was a local-file export detail; the running application's favicon is served from `web/public/`.

Keyboard interactions were exercised with Chromium, including skip-to-content, native controls and the entire registration submission path. Visible focus and responsive reflow were checked. A real screen-reader session and farmer comprehension study were not available; no WCAG certification or field-usability claim is made.

## Implementation review

Reviewed the request path, organisational filters, write transactions, idempotency lock, cross-farm task handling, input constraints, migration invariants, React output escaping, API failure behaviour and deployment-profile boundary. No unresolved correctness blocker was found for the stated local evaluation scope.

GitHub Copilot was requested to review pull request #1. It could not review because the requester's quota was exhausted. This review record is an implementation review, not independent approval. A human reviewer remains the next review gate.

## Release gates

| Area | Foundation status | Before a live release |
| --- | --- | --- |
| Correctness | Tested local workflows | Validate approved field workflows |
| Tests | Unit, database and browser checks | Partner contracts and real-device offline tests |
| Secrets/configuration | No supplied live secrets; fixed local-only fixture password | Managed secrets and reviewed deployment configuration |
| Identity/authorisation | Object isolation and JWT scope paths tested | Approved OIDC provider, browser login and real-token validation |
| Input safety | Bounded validated inputs, React escaping, parameterised SQL | Production ingress limits and abuse controls |
| Data/recovery | Additive migrations and local restore checked | Encryption, retention, correction, withdrawal and restored production backups |
| Failure handling | Visible failures, stable registration retries and desired-state writes | Offline capture and conflict resolution |
| Performance/cost | Small frontend bundle and a 500-record cap | Load test and observed production query plans |
| Observability | Dependency health, request IDs and database audit events | Operational dashboards, alerting and incident ownership |
| Accessibility | Automated checks, keyboard workflows and visual inspection | Screen-reader and local-language farmer testing |
| Dependencies/operations | Locked npm dependencies and clean frontend runtime audit; pinned CI actions and database image | Java advisory audit, licence inventory and hosting/CD approval |

No official weather, insurance, SMS, payment, evidence-storage or disaster-prediction integration was exercised. No production rollout was attempted.
