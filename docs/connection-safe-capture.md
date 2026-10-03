# Connection-safe sample capture verification

## Delivered

The registration form can save and restore a partial sample draft. Permission is never kept with a draft and must be checked again after restoration. A submitted sample is recorded as a fixed pending copy before the API call; the pending page supports review, explicit retry and deliberate discard.

A confirmed response removes the pending copy. An uncertain response or rejection preserves it. Repeating the fixed request returns the same farm through the existing API idempotency contract. Discarding a browser copy cannot cancel an already sent request or delete a server farm.

One partial draft and at most 20 pending copies are supported. Draft revision checks prevent a stale tab replacing or discarding a newer draft. Enqueuing a registration clears only the draft revision that its form actually loaded. Copies expire after seven days and are removed during the next local-store read; no background retention timer runs.

## Verified results

| Check | Result |
| --- | --- |
| Backend | 16 PostgreSQL integration/security tests passed; Java formatting passed. |
| Frontend units | 24 route, boundary and local-capture policy tests passed. |
| Browser suite | 26 tests passed, retaining the 15 homepage and foundation journeys. No retries configured. |
| Partial drafts | Incomplete fields survive refresh; permission and unknown fields are excluded; explicit draft discard works. |
| Pending submissions | Keeping a sample for later makes no POST. Refresh preserves the fixed copy; only an explicit send contacts the API. |
| Lost response | A real PostgreSQL-backed registration commits, its response is blocked, and retry returns the same farm without a duplicate. |
| Concurrent retries | Two tabs submit the same pending request concurrently; the API creates one farm. |
| Device transactions | Real IndexedDB enforces the 20-copy cap, exact-payload retry and draft revision checks. |
| Expiry | Old draft and pending copies are removed without submitting them. |
| Failure paths | Rejection retains the copy. Storage failure reports an error, preserves entered values and sends no sample POST. |
| Privacy gate | Authenticated mode never opens the sample store. Local persistence additionally requires a loopback host. |
| Frontend quality | Formatting, ESLint, build and production dependency audit passed; no dependencies added. |
| Original tools | All five repository Python test scripts passed. |

Visual review covered the restored desktop draft, the restored 320-pixel draft, expanded pending details on desktop and mobile, an empty queue and unavailable storage. Six live states also passed automated WCAG A/AA scans and horizontal-overflow checks. Keyboard journeys cover the original registration sequence, the pending disclosure, explicit send and focus after completion. Automated checks are not a full screen-reader or legal accessibility certification.

The keyboard test now waits for the form to finish reading device storage before entering fields. This tests the intended loading state rather than relying on storage being fast. Visual review also found and removed a stale queue notice after discard; a regression assertion protects that state.

## Implementation review

Device state uses native IndexedDB transactions. Network policy and form parsing are separate from the presentation components. The composed registration hook and declarative pending screen exceed the heuristic function-line budget; each source file remains below 300 lines, and storage/submission/restore helpers remain separate. No new package, service worker, API route or database migration was added.

Device records and coordinate details are rendered as escaped text. No tokens, authenticated API responses or live records are persisted by this feature. The sample store is not encrypted and is not a backup. The mode/host checks are a feature gate, not a substitute for server authorisation.

The public entry remains prerendered and API-independent. Its main JavaScript bundle remains approximately 74.6 KB gzip. The lazy workspace bundle is approximately 10 KB gzip after this addition; the extra capture code is not fetched by homepage-only visitors.

## Release boundary

The previous homepage PR was merged into main at `36c2f16fc6bf7d21a9f270a0f01a331cac58fef7`; its post-merge [GitHub verification passed](https://github.com/devpilotX/farmers/actions/runs/37108565378). This phase starts from that merge and is reviewed separately.

This is synthetic local evaluation, not a full offline PWA. Refresh still needs workspace-mode verification from the API. Offline cold start, automatic sync, browser identity, real farmer storage, task sync, correction/withdrawal, alerts and production deployment remain outside this phase. Independent human review and approved operational policies are still required before a field pilot.

See [the capture decision](decisions/0003-connection-safe-registration.md), [the developer guide](development.md) and [the API contract](openapi.yml).
