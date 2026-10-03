# Connection-safe sample registration

Status: accepted for the local evaluation workspace.
Reversibility: two-way internal change; no schema, API or tenancy change.

## Context and verified constraints

The blueprint calls for an offline-first field-agent workflow and IndexedDB. The current form loses unsaved entries on refresh, and an uncertain POST result can outlive its in-memory request identifier. The API already accepts an immutable request identifier and returns the existing farm when the exact request is repeated. The browser has no connected identity provider.

## Decision

Add two small workflows: explicitly saved partial sample drafts and a bounded pending-registration queue. Use native IndexedDB, with no new dependency. A queued payload is immutable, retains its request identifier, and is removed only after a confirmed API response or explicit discard. Submitting a sample registration first records that payload locally; an interrupted response leaves a retryable item rather than inviting a new request identifier. Retries are explicit, never background operations.

Store only in the verified `local-demo` workspace on a loopback host. Authenticated mode never opens this store. A page refresh still needs the API to verify workspace mode before showing stored entries. This is connection-safe capture in an already opened application, not a complete offline PWA. No service worker or cached authenticated API response is added.

Drafts do not retain the permission checkbox. Completed pending submissions retain the reviewed permission and frozen consent version. Drafts and pending submissions expire after seven days and are removed on the next local-store read; a notice explains expiry. There is no background deletion timer. One partial draft is kept per browser; revision checks prevent an older tab overwriting or discarding a newer copy. Queueing a submission removes only the draft revision that its form loaded. Cap pending submissions at 20 and draft field lengths at the existing form limits. Device storage is not encrypted and can be cleared by the browser. It is neither a backup nor suitable for real farmer data.

ASSUMPTION: the next technical slice is evaluated with synthetic records on a single local browser. Production device identity, encryption and partner retention policy would change this design.

## Options considered

- Keep everything in memory: least privacy exposure and maintenance, but refresh and uncertain network responses lose the retry context.
- Full offline PWA now: allows offline launch but adds cache lifecycle, device/session ownership and security work before identity is configured.
- Explicit IndexedDB drafts and pending submissions: protects this narrow capture flow while preserving the existing API. Its drawback is device-local, unencrypted storage and no offline cold start.

## Acceptance and boundaries

Test partial draft restoration without permission, expiry, size limits, immutable retries, lost-response deduplication against PostgreSQL, blocked storage, server rejection, manual discard and multiple-tab safeguards. Check keyboard paths, mobile reflow and automated accessibility scans. Keep the homepage, foundation and backend checks in CI.

No real farmer data, automatic sync, edited queued payloads, offline task updates, alerts, deletion of server records or deployment is introduced. Full offline operation remains a later gate.
