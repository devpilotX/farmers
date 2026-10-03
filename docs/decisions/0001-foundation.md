# Foundation architecture

Status: accepted for a local foundation, 3 October 2026.

The stack is supplied by the product blueprint. PostgreSQL and the public API are expensive to change; internal component layout is reversible.

## Decision

Build one React and TypeScript web application and one Spring Boot modular monolith. Use PostgreSQL, Flyway migrations and an OpenAPI contract. Docker Compose uses PostGIS. Store validated WGS84 coordinate rings as JSONB initially; scientific hazard analysis is deferred.

The existing repository contains a blueprint, an HTML prototype and skill tooling. It has no application manifest, backend, database, identity provider or CI pipeline. Preserve the original prototype as a reference, not as the application.

Use the supplied specification to continue from implementation planning rather than repeat stack selection gates. The foundation is three vertical slices: consented farm registration, saved preparedness tasks, and a printable farmer summary. The summary shows readiness, not a calculated risk score.

## Alternatives

- Extend the HTML prototype. Fastest visual demonstration, but no typed application boundary or durable workflow.
- Use a TypeScript-only backend. Fewer runtimes, but departs from the supplied Java architecture.
- Use React and Spring Boot. Matches the blueprint and supports transactional records. The cost is maintaining two toolchains and a database; this is the strongest argument against it for a small team.

## Boundaries

ASSUMPTION: this release is evaluated locally with synthetic records. There is no approved production district, identity provider, agronomy playbook or integration credential. The UI labels sample data and checklist content accordingly.

The local profile binds to loopback and uses one demo organisation. Never collect real farmer information in that profile. The non-local profile requires OIDC JWTs with an audience and organisation claim. Production identity deployment, encryption, backups, retention, consent withdrawal and official integrations require a later release gate.

No SMS, weather, insurance, disaster prediction or payment integration is claimed. No satellite service is needed for these three features. No public production deployment is authorised by this decision.

## Acceptance criteria

Registration validates consent and a nonzero closed polygon on the server, saves atomically, and rejects conflicting retries. Each task update checks organisation ownership and uses an explicit desired state, so retrying does not toggle it twice. The summary uses persisted records, labels limitations and supports printing. Invalid inputs, organisation isolation, repeated writes, migrations and browser journeys are tested.

## Reversal

Internal layout can change in days. Migrating the API, consent record and tenant model would require versioning and data migration. Review this decision before admitting real farmer records, approving agronomic content or deploying an official partner integration.
