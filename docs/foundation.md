# Foundation handoff

The foundation implements three local workflows from Stage 1 of the supplied blueprint: consented farm registration, saved preparedness actions and a printable farmer summary. It is a working application with a real database, not another standalone HTML prototype. It is not a completed Stage 1 field pilot.

## How a record moves

`Registration` submits `FarmInput` through `api.register`. Spring validates the payload; `OrganisationContext` supplies the organisation from a verified token or the isolated local profile. `FarmService.create` validates the boundary and serialises matching request keys with a PostgreSQL transaction lock. `FarmRepository` writes the farm, `TaskRepository` creates its three actions, and an audit event is written in the same transaction.

A retry with the same request identifier and payload returns the original farm. Reusing an identifier with different contents returns HTTP 409. A task update saves the explicit desired completion state. Concurrent opposing task updates use the last committed write; there is no optimistic conflict-resolution UI in this release.

The registry returns at most 500 records, newest first. Pagination and production-scale query tuning are deferred. The blueprint's proposed first cohort is 200 to 500 farmers; this cap is a foundation limit, not a claim of national scale.

## Design choices

Forest green, pale agricultural neutrals and a serif display heading give the workspace a distinct visual direction. Body text is 16px with 1.5 line height; supporting labels are 14px. Controls are generally 48px tall. Spacing follows a 4/8/12/16/24/32/48px scale. Reduced-motion preferences remove transitions.

This single application uses one semantic-token stylesheet, not a separate design-system package. SVGs are used for the logo, functional icons and the actual stored-boundary schematic. No licensed farm photographs exist in the source repository. No external photography was fetched, and no generated picture is presented as an authentic farmer photograph. Add approved, credited field photography at the next visual-content gate.

Loading, empty, failed and partial-data states are explicit. A missing action response is never displayed as zero completed actions. Failed submissions preserve the entered values. Saved checklist changes are pessimistic: the interface confirms success only after the server responds. The foundation required a connection to save. The later [connection-safe capture phase](decisions/0003-connection-safe-registration.md) adds sample drafts and pending submissions; full offline operation is still not implemented.

Declarative JSX in the page shell and registration form exceeds the skills' default function-line budget. Each stays below the 300-line file budget and represents one screen; business decisions, validation, fetching and database writes are separate. The stylesheet is a token and responsive-rule catalogue, not application logic.

## Data and operations

Migrations are additive and versioned. V1 creates the registry, tasks and audit records. V2 enforces bounded closed coordinate rings and matching farm/organisation references in the audit table. Non-crossing geometry is checked by JTS at the API boundary, not by a PostGIS database constraint.

There is no destructive down migration: removing these tables would destroy consent and action history. The recovery path is a verified database backup followed by restoring the corresponding application version. Do not edit applied migrations. A local dump/restore check is recorded in the verification report; production backups, retention and disaster recovery remain deployment-owner responsibilities.

The API requires database availability. API failures have safe messages and a request identifier; personal records and tokens are not logged by application handlers. Known-length JSON requests above 64KB are rejected. An approved production ingress must enforce a body-size limit for chunked requests as well. No outbound paid or messaging API is called.

## Next gate

Before building official alerts or damage evidence, confirm the district and institutional partner, approve the local-language consent and agronomy content, configure OIDC browser sign-in, and implement correction, withdrawal and offline synchronisation. Agree the deployment target and security operations before collecting real records.

The next phase must not imply that a beautiful UI or passing tests establish farmer comprehension, insurance acceptance or scientific forecast accuracy. Those need field and partner validation.
