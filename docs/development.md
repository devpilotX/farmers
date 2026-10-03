# Developer guide

Engineering setup, test commands and release gates for TerraFort. Commands below are run from the repository root unless stated otherwise.

## Run locally

This foundation is for local evaluation with synthetic records. It is not approved for collecting real farmer information or issuing emergency advice.

Requirements: Java 21, Maven 3.8 or newer, Node.js 24, Python 3, and Docker Compose. PostgreSQL 16 can be used directly when Docker is unavailable. The Compose service uses PostGIS; this release stores coordinate rings and does not run spatial hazard queries.

From the repository root:

```bash
docker compose up -d --wait
cp .env.example .env
set -a
. ./.env
set +a
mvn -f backend/pom.xml spring-boot:run
```

In a second terminal:

```bash
cd web
npm ci
npm run dev
```

Open `http://127.0.0.1:5173` for the public homepage or `http://127.0.0.1:5173/workspace` for the field workspace. The API runs on `http://127.0.0.1:8080`. The database and both development servers bind to loopback. Do not change those bindings or expose the local profile through a public tunnel.

Optional sample records, while the local API is running:

```bash
python3 scripts/seed-demo.py
```

The fixture script refuses non-demo workspaces and uses stable request identifiers, so rerunning it does not duplicate its records. Names, villages, boundaries and assets are synthetic.

## What works

| Workflow | Foundation behaviour |
| --- | --- |
| Farm registration | Required consent, crop stage, reported area, assets and a validated closed plot boundary. Saved atomically in PostgreSQL. |
| Preparedness | Three illustrative actions created for each farm. Completion survives refresh; a retried write does not toggle the value twice. |
| Farmer summary | Saved crop and asset details, a schematic boundary, consent date and a printable farmer copy. |
| Field workspace | Search, selected-farm links, mobile navigation, visible keyboard focus, empty states and recoverable API errors. |

The interface has no fabricated weather readings, risk scores, insurance coverage or payment totals. Checklist completion is not a safety score. The plot drawing is not a surveyed map.

## Verify the product

Create a separate test database before running backend tests. Never point the integration tests at a database containing records you need; the tests truncate their tables.

```bash
docker compose exec database createdb -U terrafort terrafort_test
DATABASE_URL=jdbc:postgresql://127.0.0.1:5432/terrafort_test \
DATABASE_PASSWORD=local-only-password \
mvn -B -f backend/pom.xml spotless:check verify

for test in tests/test_*.py; do python3 "$test"; done

cd web
npm ci
npm run format:check
npm run lint
npm test
npm run build
npm audit --omit=dev
npx playwright install --with-deps chromium
npm run test:e2e
```

Browser tests need the local API running. If Chromium is already installed, use `CHROMIUM_PATH="$(command -v chromium)" npm run test:e2e` instead of downloading a browser.

GitHub Actions runs the original skill-tool tests, Java formatting and database integration tests, frontend formatting, lint, unit tests, build, dependency audit, browser workflows and automated accessibility checks. The PostGIS service is a real database, not an in-memory substitute. Tests are not retried to hide failures.

## Project layout

```text
backend/    Spring Boot API, transaction boundaries and Flyway migrations
web/        React application, semantic CSS tokens and browser tests
docs/       Decisions, API contract, screenshots and release boundaries
scripts/    Local synthetic-data setup
skills/     Original repository skills, preserved unchanged
tests/      Original skill-tool regression tests
```

The original HTML prototype is retained for reference. `web/` is the application; opening `terrafort-complete-ui.html` does not run the new product.

## Before a field pilot

The non-local backend requires an OIDC JWT with the configured issuer, audience, `farms:write` scope and UUID `organisation_id` claim. The local profile deliberately has no sign-in and must only hold synthetic data. Browser sign-in and an identity provider have not been connected.

Local-language consent, offline capture and synchronisation, an approved district playbook, correction and withdrawal workflows, deployment secrets, TLS, encryption, retention and operational backup ownership are release gates. Official weather, messaging, insurance, damage evidence and recovery integrations are outside this foundation.

No production deployment or CD rollout is configured because no approved hosting target or credentials were supplied. CI prepares and verifies the foundation; it does not represent a live farmer service. See [the foundation record](foundation.md) for the next gate.

## Public homepage build

The build renders the public homepage into `dist/index.html` and creates a non-indexed workspace entry at `dist/workspace/index.html`. The homepage reads no farm data. The field workspace is a separate lazy-loaded bundle; legacy root hash links remain supported. A static host must serve these entry files and preserve their asset paths. API routing and sign-in still require a separately approved deployment.

The production preview used by browser tests runs on port 4173; the development server uses 5173. Browser checks cover both rendered HTML without JavaScript and hydration with JavaScript, as well as the existing database-backed workflows.

## Connection-safe sample capture

In a verified `local-demo` workspace on a loopback host, registration can save a partial sample draft or retain a fixed submitted copy in IndexedDB. Drafts never retain the permission checkbox. Pending copies keep the original request identifier and payload; send them from **Pending registrations** rather than entering the same farm again after an interrupted response.

The queue holds at most 20 copies. One partial draft is kept per browser, with revision checks against stale-tab changes. Drafts and pending copies expire after seven days and are removed on the next store read, not by a background deletion timer. Expiry and discarding affect browser copies, not server farms. Check the registry if a submission was attempted before discarding or recreating it. Device storage is not encrypted or a backup, and the browser may clear it.

Authenticated mode never opens the sample store. Refresh requires the API to verify workspace mode; this phase does not provide offline cold start or cached authenticated data. No background retry or offline checklist write is implemented. See [the capture decision](decisions/0003-connection-safe-registration.md).
