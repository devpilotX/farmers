# 0004: Reviewed corrections and record history

Status: accepted for the sample evaluation release.

Classification: the persisted version and correction API are one-way doors once external consumers depend on them. Internal components remain two-way doors.

## Context

Saved records can contain mistakes. Re-registering a farm creates a second identity and separates its actions from its original permission record. The blueprint's correction requirement needs a bounded first implementation, not a new registration workflow.

The existing application has one API, one PostgreSQL database and no verified external consumers. Real farmer collection, deployment ownership and an identity provider remain unapproved. Load and operator headcount are unknown; this decision applies to the current synthetic evaluation only. Revisit it before field use or when the 100-event history window no longer meets the programme's needs.

## Options considered

1. Replace the whole farm with last-write-wins updates. This is cheap to operate but can silently overwrite another worker's correction and allows identity or consent to change accidentally.
2. Add versioned, reviewed corrections inside the existing transaction boundary. This keeps the operating surface unchanged and prevents lost updates. It cannot reconstruct previous field values or undo a correction.
3. Store full immutable snapshots and derive the current farm from events. This supports reconstruction but retains more sensitive information, requires a retention policy and adds projection/recovery work before a field programme exists.

No option adds a vendor. Option two adds no deployable service; maintenance is migrations and application review rather than another on-call system. Ongoing hours are unmeasured, not assumed to be zero. Option three would require explicit ownership of event retention and projection recovery.

## Decision

Choose option two. A correction may change only crop, stage, reported area, movable assets and recorded boundary. Farmer identity, village, district, original permission, registration request identity and checklist are unchanged.

Every correction carries a fresh request UUID, expected record version, review confirmation and a short reason. PostgreSQL locks the organisation/request key and then the organisation-owned farm row. A matching retry returns the current farm without writing again. A reused key with different content fails. A stale version fails before any mutation. The farm update and correction event commit together.

Records start at version one. Existing records receive their registration time as their initial update time. New audit metadata stores the reason and names of changed fields, not previous personal values. Older registration and checklist events retain their existing type/time only. History returns the latest 100 events, newest first; it is not a complete archive, verified actor log or undo mechanism.

The interface freezes an attempted submission for an exact retry after an uncertain response. A version conflict asks the user to open the current record and start a fresh review. It does not silently merge fields. Corrections are not saved to browser storage or queued offline.

## Consequences and reversal

The strongest argument against this choice is the absence of before/after values: it cannot prove what an old record contained. A full history requirement would need a new decision, consent/retention review and an additive migration. Removing versions or reinterpreting request keys would break existing clients, so these fields must retain their meaning.

Migration V3 is additive and transactional. Back up the evaluation database before applying it; restore that backup with the old application if rollback is needed. Do not run the old application against a database after new corrections have been accepted and claim those corrections remain supported.

No production throughput, retention compliance or deployment readiness is claimed by this phase. Regression checks cover tenancy, stale edits, concurrent writers, replay, unchanged registration identities and atomic audit writes.
