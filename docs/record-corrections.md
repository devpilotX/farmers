# Reviewed corrections and record history

## Delivered

A farmer summary now leads to a correction form and a record-history view. Crop, stage, reported area, movable assets and the recorded boundary can be corrected. The form requires review and a short reason. Identity, village, district, original permission and saved action progress are unchanged.

Each accepted correction advances the farm version once. A stale form cannot overwrite a newer record. A fixed request identifier and exact payload make interrupted-response retries safe; reusing that identifier for another payload or farm fails. Retrying the original registration after a correction returns the current farm without restoring old details or creating a second farm.

The history view shows the latest 100 events, newest first. Correction entries contain the new version, changed field names and reason. Registration and checklist entries have their existing type/time. Previous field values and verified actor attribution are not stored by this phase.

## Verification

| Check | Result |
| --- | --- |
| PostgreSQL integration and security | 30 tests passed, including all 16 previous backend checks. |
| Corrections | All five editable fields, review, reason, no-change rejection, invalid geometry and area checked. |
| Concurrent writers | Different requests against the same version produce one acceptance and one conflict. Matching retries write once. |
| Transaction failure | A forced audit insert failure rolls back the farm update and version change. |
| Retry identity | Matching retries after a later correction return the current farm; conflicting payloads and cross-farm key reuse fail. |
| Access | Another organisation cannot correct the farm or read its history. Token and scope requirements remain enforced. |
| Frontend units | 30 route, boundary, capture-policy and correction-payload tests passed. |
| Browser workflows | 37 tests passed. Previous registration, checklist, print, homepage and IndexedDB journeys retained alongside correction, conflict, exact-retry and navigation checks. No test retries configured. |
| Dependencies | No packages added. Production dependency audit reports zero vulnerabilities. |
| Original repository tools | All five Python test scripts passed; original skills remain unchanged. |

A hosted foundation check exposed a checklist timing defect. A deterministic delayed-read test reproduced an older revalidation replacing a confirmed completion. Checklist reads now use request generations and abort an outstanding read before a write; responses from a departed farm cannot update the current view. Returning during an outstanding write refreshes the confirmed actions, and pending writes remain scoped to their farm. A rejected outstanding write stays visible when the worker returns before its response. The existing foundation assertion was retained.

The browser tests commit a real correction, lose its response and retry it, then verify there is one correction event. They also exercise a second writer, unchanged permission, validation errors, history failures/empty results, small-screen reflow, keyboard operation and leaving an in-flight submission without a late redirect.

Visual inspection covered desktop and 320-pixel correction forms, 390-pixel retry/conflict states, desktop/mobile history, history failure and empty states, the corrected summary and the retained public homepage. Visual review also improved separation before the boundary fields and scoped saved confirmations to their own farm. Live automated A/AA scans and horizontal-overflow checks passed for these ten states. These checks do not replace screen-reader evaluation or testing with farmers and field workers.

## Migration and recovery check

The synthetic evaluation database was backed up before V3. A separate restoration retained 42 farms and 60 events at schema version two. V3 applied transactionally in approximately 25 milliseconds on this small local dataset and backfilled existing records' update time from registration time. This is not a production migration-duration estimate.

V3 adds record versions and update times, nullable correction metadata, a unique organisation/request key and database checks on correction events. It does not rewrite original registration hashes or existing permission/task records. No full-value history, offline correction queue or deletion mechanism was introduced.

## Implementation review

Transport, correction policy, history storage and presentation remain separate. Row locking, version checks and atomic writes were reviewed together with retries and organisation filters. Reasons are escaped text in the interface; unrelated personal information is discouraged at entry. No new service, client secret or browser-persisted correction data was added.

The structural scan prompted simpler history decoding. Long declarative React screens and the composed correction and checklist hooks remain documented exceptions to the function-line heuristic; source files stay below the 300-line budget. Unsaved changes are checked before route state changes, and successful responses cannot redirect a page the user has already left.

## Release boundary

This phase starts from the cleaned main commit `c0ef8631421bd49229460cf210d4dbc77611678e`. It remains a synthetic evaluation release. Live alerts, browser sign-in, identity/location reassignment, permission withdrawal, real-data retention, a production host and operational recovery ownership still need their own approved work. The workflow checks out the exact public repository commit with native Git and selects the verified hosted Node 24 tool cache. This removes deprecated action-runtime warnings without enabling an insecure runtime or reading another project. A missing Node 24 cache fails explicitly. Failed browser contexts are printed into the job log for diagnosis.

CI verification is not a production deployment or an independent human approval.

See [decision 0004](decisions/0004-reviewed-farm-corrections.md), [the API contract](openapi.yml) and [the developer guide](development.md).
