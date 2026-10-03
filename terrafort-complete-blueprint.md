# TerraFort — Complete Product and Execution Blueprint

> **Working name:** TerraFort  
> **Working promise:** Protect before. Prove after. Recover faster.  
> **Category:** Agricultural climate-resilience and recovery infrastructure  
> **Initial geography:** One flood-prone district in Bihar  
> **Long-term geography:** India, expanded state by state and hazard by hazard  
> **Primary payer:** Insurer, FPO, bank, NGO, processor or government programme  
> **Farmer access:** Free or institution-sponsored; voice-, assisted- and mobile-first

---

## 1. Executive conclusion

TerraFort will create a continuously updated **digital twin of a farm**: its
plots, crops, ponds, livestock, stored inputs, machinery, buildings, finances,
insurance and exposure to climate hazards.

It will combine that farm record with weather, river, satellite and field data
to perform five jobs:

1. **Understand exposure** before money is invested.
2. **Warn** when a material hazard becomes more likely.
3. **Recommend concrete actions** appropriate to the crop stage and assets.
4. **Create trustworthy before-and-after evidence** when damage occurs.
5. **Coordinate insurance, relief and recovery workflows** with licensed and
   authorised partners.

TerraFort is not merely a weather application, an insurance seller, a farm
diary, or a satellite dashboard. Its proposed differentiation is the complete
last-mile chain:

```text
Risk → local action → completion evidence → damage evidence → recovery
```

The national vision includes crops, fish ponds, dairy, goats, poultry, stored
inputs, pumps, machinery and buildings. The first release must nevertheless
solve one measurable workflow: **flood preparation and damage evidence for
crop farmers in one Bihar district**.

---

## 2. Critical truths and boundaries

### 2.1 Components already exist in India

The idea must not be built on the false claim that nobody in India is working
on agricultural risk:

- PMFBY provides crop-insurance infrastructure and already has a Farmer App,
  WhatsApp support, crop-cutting tools, a Crop Loss Assessment Platform and
  weather-information systems.[^pmfby-platform]
- PMFBY procedures already allow mobile reporting of some localised losses with
  coordinates and photographs, and impose short notification windows in
  specified cases.[^pmfby-guidelines]
- The Central Water Commission operates flood forecasts and a FloodWatch
  service.[^cwc]
- IMD and agricultural institutions provide weather and agrometeorological
  advisories.
- Indian companies such as SatSure and Cropin already provide earth-observation
  and agricultural intelligence to institutions.[^satsure][^cropin]
- India is developing farmer, crop and geospatial digital infrastructure.

The opportunity is therefore **integration, usability, local action,
institutional workflow and recovery**, not inventing weather data or satellite
imagery.

### 2.2 Exact long-range disaster prediction is impossible

TerraFort must never claim that it can predict the exact field, date and damage
of a flood six months in advance.

| Horizon | Responsible product claim |
|---|---|
| 3–6 months | Seasonal probability and preparedness planning |
| 2–6 weeks | Elevated probabilistic climate risk |
| 7–14 days | Increasingly actionable weather outlook |
| Hours–5 days | Event warning using rainfall, river and local information |
| During/after | Observed inundation, exposure and damage evidence |

Seasonal outlooks are probabilities of conditions such as above-normal
rainfall, not exact forecasts for an individual farm.[^noaa-seasonal]

### 2.3 Software cannot stop a flood

TerraFort can sometimes help protect movable assets, adjust timing, improve
preparedness, document loss and speed recovery. It cannot:

- Stop a river overflowing.
- Guarantee that standing crops survive.
- Guarantee an insurance or relief payout.
- Replace embankments, drainage, veterinary care or agronomy.
- Diagnose crop or animal disease from satellite imagery alone.
- Give evacuation advice that conflicts with official disaster authorities.

Every interface, sales claim and recommendation must preserve these limits.

---

## 3. The underlying problem

### Before the season

- A farmer invests without a consolidated view of historical flood, drought,
  heat and waterlogging exposure.
- Farm plots and assets may not be digitally documented.
- The farmer may not know which insurance or public programme is relevant.
- Insurance exclusions, deadlines and claim procedures are difficult to
  understand.
- Seasonal risk information does not become an individual action plan.

### Before an event

- Generic warnings are not plot-, crop-stage- or asset-specific.
- Messages say “heavy rain” but not what to move, harvest, drain or document.
- Warnings may not reach users who cannot read English or continuously access
  the internet.
- FPOs and local organisations cannot see which members and assets are exposed.

### During an event

- Connectivity becomes unreliable.
- There is no single operational view of affected farmers, livestock or assets.
- Evidence is collected inconsistently.
- The same farmer may repeatedly provide the same information to different
  agencies.

### After an event

- Required photographs, coordinates, policy details or land records are
  missing.
- Short claim-intimation windows may be missed.
- Farmers do not know the status of the case.
- Insurers and programmes must reconcile incomplete or conflicting records.
- Assistance is difficult to prioritise and audit.
- The farmer must restart production without a structured recovery plan.

---

## 4. Users, buyers and incentives

### Farmer

**Needs:** understandable warnings, practical actions, trusted assistance,
asset protection and recovery support.

**Interface:** voice call, IVR, WhatsApp, SMS, simple PWA and field agent.

**Commercial rule:** do not depend on small farmers paying a large monthly
subscription.

### Field agent

**Needs:** offline registration, plot mapping, assigned tasks, evidence capture,
identity checks, synchronisation and case follow-up.

### FPO or cooperative

**Needs:** member exposure, emergency coordination, procurement and transport
planning, evidence quality and recovery tracking.

### Insurer

**Needs:** portfolio exposure, policy linkage, consistent first-notice-of-loss,
evidence review, field-assessment prioritisation and fraud controls.

TerraFort must partner with a licensed insurer/intermediary for regulated
insurance sales or advice; it should not act as an unlicensed insurer.

### Bank or lender

**Needs:** exposure monitoring, protected versus uninsured assets, early
intervention and recovery visibility—subject to consent and fair-lending rules.

### Government or NGO

**Needs:** situational awareness, defensible beneficiary prioritisation,
assistance records and outcome measurement.

### Processor or buyer

**Needs:** crop-supply exposure, harvest disruption warnings and recovery
coordination within its supplier network.

---

## 5. Product surfaces

### 5.1 Farmer service

The farmer should see five questions, not a complex enterprise dashboard:

```text
1. What is my risk?
2. What should I do now?
3. What is protected?
4. How do I report damage?
5. What is the status of my recovery?
```

Core capabilities:

- Registration assisted by voice or field agent.
- Farm, crop, livestock and asset summary.
- Seasonal preparedness plan.
- Hazard warnings with confidence and source.
- Crop-stage- and asset-specific checklists.
- “I am safe / I need assistance” response.
- Before-event evidence prompt.
- Guided damage reporting.
- Insurance/relief education.
- Case and payment-status timeline.
- Human support escalation.

### 5.2 Field-agent application

- Offline farmer and household registration.
- Consent capture in the farmer’s language.
- Plot-boundary mapping.
- Crop and crop-stage verification.
- Livestock, pond, inventory and equipment registration.
- Policy-document scanning.
- Task route and priority list.
- Geotagged, timestamped photographs and video.
- Damage form with reason codes and confidence.
- Duplicate-case warning.
- Supervisor review and correction.
- Synchronisation history and conflict resolution.

### 5.3 Institutional operations dashboard

- Multi-layer GIS risk map.
- Exposure by village, crop, asset and policy.
- Alert delivery and acknowledgement metrics.
- Farmers requiring human follow-up.
- Pre-event action completion.
- Event footprint and observed inundation.
- Damage cases and evidence quality.
- Assignment to assessors.
- Claim/relief workflow and ageing.
- Payment and recovery status.
- Audit, data-export and API controls.

### 5.4 Risk and evidence API

For authorised partners:

- Farm and plot exposure lookup.
- Hazard alerts.
- Observed inundation.
- Crop-condition signals.
- First-notice-of-loss intake.
- Evidence-package retrieval.
- Case status.
- Aggregated portfolio analytics.

No personal data should be exposed without a lawful purpose, explicit
authorisation and appropriate contractual controls.

---

## 6. Whole-farm digital twin

### Identity and household

- Farmer/producer identifier
- Contact and preferred language
- Household and authorised representatives
- Consent history
- FPO/cooperative membership
- Bank/insurance references only where lawful and authorised

### Location

- State, district, block, panchayat and village
- PIN code as a communication aid
- Exact plot polygon for real risk analysis
- Elevation, slope, drainage and nearby water body

**PIN code alone is not precise enough** for farm-level flood or crop-health
assessment. Adjacent plots can have different elevation, drainage and river
exposure.

### Crop parcel

- Crop and variety
- Sowing/transplanting date
- Expected harvest date
- Growth stage
- Irrigation source
- Input investment
- Expected yield and value
- Historical losses
- Insurance linkage

### Fish pond

- Pond geometry and depth
- Embankment condition
- Species, stocking and cycle dates
- Pump/aerator
- Feed inventory
- Overflow and contamination exposure

### Livestock

- Species and approximate count
- Shelter location and capacity
- Water/feed availability
- Heat/flood vulnerability
- Vaccination/health information only where properly governed
- Evacuation destination

### Inventory and physical assets

- Seed, fertilizer, medicine and feed
- Harvested produce
- Pump, tractor, generator, solar equipment
- Storage structure, shed and farm building
- Replacement value and mobility
- Photograph and proof of ownership where appropriate

### Event and recovery history

- Warnings received and acknowledged
- Recommended actions
- Completed actions and evidence
- Reported damage
- Verified damage
- Claim/relief case
- Payment or assistance
- Recovery milestones

---

## 7. Hazard catalogue and decision support

### Flood and waterlogging

Inputs:

- Rainfall observations and forecast
- River level and reservoir information
- Terrain and drainage
- Historical inundation
- Radar satellite observations
- Soil saturation
- Plot and asset locations

Possible actions:

- Clear drainage where safe and agronomically appropriate.
- Move pumps, fertilizer, feed and harvested material.
- Relocate livestock.
- Protect electrical equipment.
- Consider emergency harvest only when crop maturity and safety permit.
- Record pre-event evidence.
- Follow official evacuation instructions.

### Drought and soil-moisture stress

- Seasonal outlook and historical rainfall
- Observed rainfall deficit
- Soil-moisture signals
- Crop stage and irrigation availability

Actions may include irrigation scheduling, prioritisation of limited water,
mulching or agronomic escalation. Recommendations must be approved by local
agronomic experts.

### Heatwave

- Temperature and humidity
- crop/livestock sensitivity
- shelter, water and power availability

Actions can include livestock shade, water readiness, work-hour adjustments and
crop-specific irrigation advice.

### Cyclone, hail, frost and high wind

Each requires a separate rulebook, evidence standard, geographic scope and
authoritative data source. “All India” expansion means adding validated regional
hazard packs, not switching on one universal model.

### Pest and disease conditions

TerraFort can estimate conditions favourable to a pest or disease and recommend
inspection. It must not claim a confirmed diagnosis without qualified
inspection or laboratory evidence.

---

## 8. End-to-end flood workflow

### A. Onboarding

1. Partner institution identifies a village/cohort.
2. Field agent explains the service and obtains consent.
3. Farmer, household and contact preferences are registered.
4. Plot boundary, crop, crop stage and expected value are captured.
5. Movable and fixed assets are recorded.
6. Existing policy or programme details are linked.
7. Farmer receives a simple printed/WhatsApp summary.

### B. Preparedness

1. Historical hazard profile is calculated.
2. Seasonal risk is presented as probability, not certainty.
3. Farmer and agent create a preparedness plan.
4. High-value movable assets and safe destinations are recorded.
5. Required insurance/relief documents are checked before the event.

### C. Alert generation

1. Official and model data are ingested.
2. Hazard engine calculates location-specific severity and confidence.
3. Crop/asset engine determines what is exposed.
4. Decision engine selects only approved actions.
5. Human review is required for high-impact mass alerts during the pilot.
6. Message is delivered through the preferred channel.

Every alert must include:

- Severity
- Location
- Expected time window
- Confidence/uncertainty
- Data timestamp and source
- Actions
- Safety disclaimer
- Human-help channel

### D. Action confirmation

- Farmer presses a number, replies on WhatsApp or tells an agent.
- FPO sees who has not acknowledged.
- Agent prioritises vulnerable households.
- Completion evidence is optional for low-risk actions and required only where
  necessary; do not burden farmers with excessive reporting.

### E. Damage intake

1. Farmer reports through voice, app, toll-free support or field agent.
2. System checks policy/programme deadlines.
3. Case receives a unique identifier.
4. Offline evidence is captured.
5. Satellite/official event layers are associated with the plot.
6. Supervisor validates completeness.
7. Case is transmitted to the authorised institution.

### F. Recovery

- Claim/relief status and missing actions are displayed.
- Repeated requests for the same document are reduced.
- FPO/NGO records material assistance.
- Recovery plan can include replanting, input replacement, livestock support or
  credit referral through authorised partners.
- Outcome and farmer satisfaction are measured.

---

## 9. Insurance and relief module

### Education

Explain in local language:

- What is insured
- What is excluded
- Sum insured
- Premium
- Area-based versus individual-loss treatment
- Required documents
- Notification deadline
- Where to complain or seek help

### Enrollment assistance

TerraFort can:

- Show relevant official options.
- Check document readiness.
- Route the farmer to an authorised insurer, bank or intermediary.
- Track consent and application status.

TerraFort must not solicit, recommend or sell regulated insurance unless the
company obtains the appropriate IRDAI status or operates through a compliant
licensed partner.[^irdai]

### Claim assistance

- First notice of loss
- Deadline timer
- Policy and plot matching
- Guided evidence
- Missing-document detection
- Duplicate detection
- Submission receipt
- Case timeline
- Escalation and grievance information

The system must clearly distinguish:

```text
Submitted ≠ accepted
Verified ≠ payable
Estimated loss ≠ approved claim
```

---

## 10. Fraud resistance and evidence integrity

“No fraud” cannot be guaranteed. The correct goal is to make manipulation
difficult, detectable and reviewable without unfairly rejecting legitimate
farmers.

### Controls

- Verified user, device and field-agent identity.
- Server-issued case and capture tokens.
- Original media retained with cryptographic hash.
- Capture timestamp, coordinates and accuracy.
- Device-clock and metadata anomaly checks.
- Duplicate and near-duplicate image detection.
- Reused-image detection across cases.
- Plot-boundary and event-footprint consistency checks.
- Before/after image comparison.
- Field-agent route and impossible-travel detection.
- Role separation between capture, review and approval.
- Immutable audit log.
- Random physical audits.
- Appeals process and human review.

### Fairness rule

Low GPS accuracy, an old phone or poor connectivity must not automatically be
treated as fraud. Fraud scores prioritise review; they do not independently
deny benefits.

---

## 11. Data sources and integration plan

### India

- IMD observations, forecasts and warnings under permitted access terms
- Central Water Commission flood/river services
- NDMA/state disaster alerts
- PMFBY/NCIP workflows through authorised integration
- State agriculture and revenue systems
- Government land/cadastral services where legally accessible
- AgriStack/farmer and crop registries where authorised
- Soil and crop research institutions

### Earth observation

- Sentinel-1 synthetic-aperture radar: flood/water observations through cloud
- Sentinel-2 optical imagery: vegetation condition when cloud permits
- Landsat: historical context
- Commercial imagery only when cost and resolution justify it

### Ground data

- Farmer and field-agent reports
- Automatic weather stations
- River gauges
- Optional pond and soil sensors
- Agronomist/veterinarian verification

### Data-governance rule

Public availability does not automatically permit every commercial use or
redistribution. Every dataset needs an owner, licence, update frequency,
quality score, retention rule and fallback.

---

## 12. Risk engine

### Layer 1: Baseline exposure

Combines historical hazard frequency, terrain, land cover, drainage, proximity
to water, crop calendar and asset value.

### Layer 2: Dynamic hazard

Combines latest rainfall, forecasts, river level, soil saturation, satellite
observation and official warnings.

### Layer 3: Vulnerability

Considers crop stage, livestock shelter, asset mobility, farmer communication
access and previous losses.

### Layer 4: recommended action

Only actions from an expert-approved regional playbook may be issued.

### Output

```text
Risk = hazard probability × exposure × vulnerability
```

Outputs must show:

- Severity band
- Confidence
- Reasons
- Last update
- Approved action
- Escalation threshold

### Model governance

- Version every model and rulebook.
- Back-test against historical events.
- Validate in each agroclimatic zone.
- Measure false alarms and missed events.
- Monitor performance by district and farmer segment.
- Require expert sign-off before expanding a hazard.
- Provide a human override with recorded justification.

---

## 13. International benchmark and what India can adopt

### United States

The USDA Risk Management Agency administers a public-private crop-insurance
system delivered through approved private insurers and agents. Climate Hubs,
NOAA products, satellite crop maps and historical insurance-loss tools support
risk decisions.[^usda-rma][^agrisk-viewer]

Adopt:

- A safety-net ecosystem, not an isolated app.
- Trained local agents.
- Policy, hazard and historical-loss data linked to decisions.
- Digital reporting tied to official workflows.

Do not copy blindly:

- Indian farms are smaller and more fragmented.
- Literacy, language, land documentation and smartphone access differ.
- A US-style farmer-paid enterprise subscription is often unsuitable.

### Canada

Canada combines AgriInsurance, AgriStability, AgriInvest and AgriRecovery.
AgriRecovery targets extraordinary recovery costs following disasters, while
AgriStability addresses serious farm-margin decline.[^canada-brm][^agrirecovery]

Adopt:

- Whole-farm financial resilience, not only crop imagery.
- Recovery-cost and income-impact tracking.
- Coordinated programmes with distinct roles.

### Australia

Australia combines climate projections, drought planning, Farm Business
Resilience support and regional coaching. CSIRO’s My Climate View provides
location- and commodity-specific future climate information.[^myclimateview]

Adopt:

- Long-term adaptation plans.
- Water, feed, infrastructure and business-continuity planning.
- Digital tools plus trusted human coaching.

### Europe and international earth observation

ESA-supported insurance systems combine satellite imagery, weather and field
information with analytics and insurer workflows.[^eo-insure]

Adopt:

- Separate data, analysis and workflow layers.
- Serve institutions through APIs.
- Use satellite evidence as one input, not the sole truth.

---

## 14. India gap analysis

| Existing capability | Gap TerraFort targets |
|---|---|
| Weather/flood warning | Convert it into plot-, crop- and asset-specific action |
| Crop-insurance portal/apps | Local-language assisted readiness and case workflow |
| Satellite analytics | Last-mile farmer/FPO action and evidence collection |
| Field surveys | Reusable pre-event farm record and consistent evidence |
| FPO membership | Live exposure and response coordination |
| Relief programmes | Shared case timeline and auditable outcome tracking |
| Separate crop/livestock records | One consented multi-asset farm model |

The defensible product is not another map. It is a trusted network connecting
farmers, field agents, risk intelligence and recovery institutions.

---

## 15. Experience for low-connectivity India

### Channels

- Interactive voice response
- Outbound voice calls
- SMS
- WhatsApp
- Progressive web application
- Printed farmer summary with QR/reference number
- Field-agent assisted workflow

### Languages

Start with Hindi plus the district’s dominant language needs. Content should be
recorded and reviewed by native speakers; machine translation alone is
insufficient for emergency and insurance language.

### Design rules

- One action per screen/message.
- Audio playback for critical instructions.
- Use icons with text, never icons alone.
- Explain risk without panic.
- Minimum typing.
- Offline-first field-agent workflow.
- Never require a farmer to understand GIS maps.
- Always offer a human-help path.

---

## 16. Privacy, security and farmer rights

Farm boundaries, identity, finances, photographs and geolocation are sensitive.
The Digital Personal Data Protection Act requires lawful processing and clear,
plain-language consent; consent requests should be available in an appropriate
scheduled language.[^dpdp]

### Required controls

- Purpose-specific consent.
- Collect the minimum necessary data.
- Separate consent for insurer/bank/NGO sharing.
- Farmer-accessible record and correction process.
- Consent withdrawal and deletion workflow where legally applicable.
- Role-based and farm/tenant-level access.
- Encryption in transit and at rest.
- Key and secret management.
- Short-lived file URLs.
- Device session controls.
- Security logging and incident response.
- Data-retention schedules.
- Subprocessor register.
- Data export and portability.
- No sale of farmer data.
- No AI training on identifiable farmer data without explicit, separate
  permission.

### Prohibited uses

- Secret credit scoring.
- Discriminatory denial based solely on an opaque model.
- Selling location/contact data to input marketers.
- Dark-pattern consent.
- Publicly exposing loss or debt information.

---

## 17. Technical architecture

```text
IMD/CWC/NDMA/EO/IoT/partner systems
                  |
           Ingestion gateway
                  |
      Data quality and provenance
                  |
    Geospatial lake + operational DB
                  |
  Hazard engine | Farm twin | Evidence engine
                  |
       Rules and recommendation service
                  |
 Workflow/case management + integration API
        /             |              \
 Farmer channels   Field app   Institution dashboard
```

### Core stack

| Layer | Technology |
|---|---|
| Core APIs and workflows | Java + Spring Boot |
| Geospatial/ML services | Python + FastAPI |
| Operational database | PostgreSQL + PostGIS |
| Time-series data | PostgreSQL/TimescaleDB initially |
| Object storage | S3-compatible encrypted storage |
| Event processing | Managed queue initially; Kafka only when justified |
| Web interfaces | TypeScript + React |
| Mobile field application | Offline-capable PWA first |
| Local offline store | IndexedDB |
| Mapping | MapLibre/OpenLayers with licensed map layers |
| Identity | Standards-based OIDC provider |
| API contract | OpenAPI |
| Infrastructure | Docker + managed cloud services |
| Infrastructure as code | Terraform/OpenTofu |
| Observability | OpenTelemetry + managed logs/metrics |
| CI/CD | GitHub Actions |

### Architectural rules

- Begin with a modular monolith for core business workflows.
- Keep heavy geospatial processing in a separately deployable Python service.
- Do not begin with dozens of microservices or Kubernetes.
- Every externally derived result stores source, model version and timestamp.
- Every important case transition is auditable.
- Design for intermittent connectivity and idempotent synchronisation.

### Core modules

```text
identity-and-consent
farm-registry
asset-registry
crop-calendar
hazard-ingestion
risk-assessment
recommendations
notifications
field-operations
evidence-vault
cases-and-claims
partner-integrations
payments-and-assistance-status
audit-and-compliance
analytics
```

---

## 18. Core data entities

```text
Person
Household
Consent
Organisation
Membership
Farm
Parcel
CropCycle
PondCycle
LivestockGroup
InventoryItem
PhysicalAsset
InsurancePolicyReference
HazardObservation
Forecast
RiskAssessment
Recommendation
Alert
Acknowledgement
ActionTask
EvidenceCapture
DamageCase
Assessment
ClaimReference
AssistanceRecord
PaymentStatus
RecoveryPlan
AuditEvent
```

Every calculated result needs lineage back to source data and model/rule
version.

---

## 19. Business model

### Primary

- Annual institutional licence
- Per farmer/parcel monitored
- Per active hazard season
- Implementation and field-training fee
- Evidence/case workflow fee
- Risk and exposure API

### Later, through compliant partners

- Insurance distribution or servicing revenue
- Loan-risk or recovery integration
- Disaster programme implementation
- Supply-chain resilience contracts

### Farmer pricing

- Free during pilots.
- Institution-sponsored in the core model.
- A very small farmer fee may be tested only after proven, measurable value and
  never as the primary business assumption.

---

## 20. Go-to-market

### Beachhead

- One flood-prone Bihar district
- One FPO/NGO with trusted field presence
- 200–500 farmers
- Paddy/maize/vegetable parcels
- One insurer, lender or programme observer

### Sales proposition

Do not sell “AI satellite climate technology.”

Sell measurable operational outcomes:

- More farmers reached before an event.
- More high-risk farmers acknowledging the warning.
- More actionable preparations completed.
- Faster, more complete damage intake.
- Less assessor time per valid case.
- Fewer duplicate/incomplete cases.
- Faster recovery status visibility.

### Trust strategy

- Co-brand with a known local partner.
- Employ local field agents.
- Hold village demonstrations.
- Give farmers a physical reference card.
- Publish service limitations.
- Provide grievance and appeals channels.
- Do not promise payouts.

---

## 21. Stage-by-stage roadmap

### Stage 0 — Evidence before software (0–8 weeks)

- Interview 50 flood-affected farmers.
- Interview 10 field officials/agents.
- Interview 5 FPO/NGO leaders.
- Interview 3 insurers and 3 lenders.
- Reconstruct 20 real loss and claim journeys.
- Identify missed deadlines, document gaps and avoidable asset losses.
- Select district and cohort.
- Obtain one written pilot partnership.
- Define legal role and data-sharing basis.

**Gate:** Stop if no institution owns the recovery problem or will provide a
path to official action.

### Stage 1 — Assisted registry and preparedness pilot (2–4 months)

- Field-agent PWA
- Consent and identity
- Plot mapping
- Crop and asset registry
- Historical risk profile
- Farmer summary
- Seasonal preparedness plan
- Simple institutional map

**Gate:** At least 80% usable plot/asset records and farmer comprehension of the
service.

### Stage 2 — Flood alerts and action workflow (4–8 months)

- Official data ingestion
- Risk bands
- Expert-approved action playbook
- Voice/SMS/WhatsApp delivery
- Acknowledgement and agent escalation
- Pre-event evidence prompts
- Alert audit and false-alarm measurement

**Gate:** Alerts reach users, are understood and change at least one relevant
behaviour at a meaningful rate.

### Stage 3 — Damage evidence and recovery (6–12 months)

- Offline damage capture
- Satellite event association
- Evidence quality checks
- Case workflow
- Partner hand-off
- Status tracking
- Appeals and grievance support
- Fraud-review queue

**Gate:** Partner confirms evidence is useful and case handling becomes faster
or cheaper.

### Stage 4 — Insurance and programme integration (9–18 months)

- Licensed partner integration
- Enrollment readiness
- First notice of loss
- Claim/relief status
- Partner APIs
- Audit and compliance controls
- Payment confirmation

**Gate:** A paying partner and completed real recovery cases.

### Stage 5 — Multi-hazard expansion (12–24 months)

Add one validated regional pack at a time:

- Drought
- Heat
- Waterlogging
- Cyclone/high wind
- Frost/hail
- Pest-risk conditions

### Stage 6 — Multi-asset farm resilience (18–36 months)

- Fish ponds
- Dairy and livestock
- Poultry/goats
- Stored inventory
- Buildings and machinery
- Whole-farm financial exposure

### Stage 7 — National platform

- State-by-state data and language packs
- Institutional marketplace/integrations
- Standard risk/evidence APIs
- Independent model audits
- Research partnerships
- National-scale reliability and disaster operations

---

## 22. Pilot measurement

### Reach

- Farmers registered
- Valid plot boundaries
- Preferred channel coverage
- Women and vulnerable households served

### Warning performance

- Delivery rate
- Acknowledgement rate
- Time from source alert to farmer delivery
- False-alarm rate
- Missed-event rate
- Farmer comprehension

### Action

- Recommended actions attempted
- Assets moved/protected
- Emergency harvest or evacuation safely completed
- Human escalations resolved

### Evidence and recovery

- Complete first-notice cases
- Median intake time
- Evidence rejection/rework rate
- Assessor hours per case
- Time to institutional decision
- Time to payment/assistance where measurable

### Economic outcome

- Verified movable asset loss avoided
- Recovery amount facilitated
- Institutional operating cost saved
- Farmer out-of-pocket recovery cost

Do not attribute the value of an entire saved crop to TerraFort unless a robust
evaluation supports that claim.

---

## 23. Team

### Founding pilot team

- Product founder
- Java backend engineer
- TypeScript/PWA engineer
- Geospatial/Python engineer
- Agricultural/climate-risk specialist
- Insurance/regulatory adviser
- Field operations lead
- Local field agents
- UX researcher/local-language content specialist
- Security/privacy adviser, initially fractional

This is not a credible one-person production system. A founder can prototype
the workflow, but scientific, regulatory and field partnerships are essential.

---

## 24. Principal risks

| Risk | Mitigation |
|---|---|
| False sense of safety | Probabilities, limitations, official-source alignment |
| Alert fatigue | Threshold tuning and relevance filtering |
| Wrong agronomic advice | Expert-approved local playbooks |
| No institutional acceptance | Co-design evidence standards before building |
| Data exclusion harms poor farmers | Assisted/offline channels and appeals |
| Fraud | Layered integrity checks plus human review |
| Privacy abuse | Purpose limitation, consent and access controls |
| Insurance regulation | Licensed partner and legal review |
| Government API unavailable | Contracted data access and fallbacks |
| Satellite cloud/latency limitations | Radar, multiple sources and ground checks |
| Farmer distrust | Local partner, transparent role, no payout promises |
| Unsustainable economics | Institution-paid pilot and measured unit cost |
| Building too broadly | Hazard- and district-specific release gates |

---

## 25. Immediate 30-day action plan

### Week 1

- Choose one target district.
- Recruit an agriculture/climate adviser.
- Create interview guides.
- Contact FPOs, NGOs, insurers and district experts.

### Week 2

- Interview farmers who experienced a flood loss.
- Collect anonymised examples of warnings, documents and claims.
- Map the current end-to-end journey.

### Week 3

- Run a paper prototype:
  - farm card
  - risk message
  - action checklist
  - damage report
  - recovery timeline
- Test comprehension in local language.

### Week 4

- Draft pilot agreement.
- Define accepted evidence with the institutional partner.
- Estimate field cost per farmer.
- Decide whether Stage 1 has a credible payer and operational owner.

Do not begin satellite AI, insurance sales or a national dashboard before this
gate.

---

## 26. Definition of success

TerraFort succeeds only when it can prove all three:

1. **Farmer outcome:** people understand the warning and take useful action.
2. **Recovery outcome:** evidence and workflow improve access to legitimate
   recovery.
3. **Institutional economics:** a paying organisation saves time, cost or risk.

A beautiful application, registered users, notifications sent or satellite
images processed are not sufficient evidence of success.

---

## 27. Final product statement

> TerraFort is an assisted, multi-channel agricultural resilience platform that
> creates a consented digital twin of a farm, monitors climate hazards, converts
> risk into local actions, preserves trustworthy damage evidence and connects
> farmers with authorised recovery institutions.

### Starting wedge

Flood-risk preparation and damage evidence for crop farmers in one Bihar
district.

### Long-term platform

All-India, multi-hazard and multi-asset resilience for crops, ponds, livestock,
inventory, machinery and buildings.

### Non-negotiable principle

The company must earn trust by producing verified farmer and institutional
outcomes—not by making heroic predictions or promising awards.

---

## Sources

[^pmfby-platform]: PMFBY digital platform and application suite: https://www.pmfby.gov.in/pdf/Operational_Guidelines.pdf
[^pmfby-guidelines]: PMFBY operational guidance on localised-loss reporting, coordinates and photographs: https://pmfby.gov.in/pdf/Revamped%20Operational%20Guidelines_17th%20August%202020.pdf
[^cwc]: Central Water Commission flood forecasting and warning: https://www.cwc.gov.in/en/flood-forecasting-hydrological-observation
[^satsure]: SatSure insurance and earth-observation intelligence: https://www.satsure.co/solutions/insurance-and-reinsurance/
[^cropin]: Cropin agricultural and climate intelligence: https://www.cropin.com/
[^noaa-seasonal]: NOAA explanation of monthly and seasonal climate outlooks: https://www.climate.gov/news-features/understanding-climate/understanding-noaas-monthly-and-seasonal-climate-outlooks
[^irdai]: IRDAI intermediary and licensing information: https://irdai.gov.in/intermediaries
[^dpdp]: Digital Personal Data Protection Act, 2023: https://www.meity.gov.in/static/uploads/2024/02/Digital-Personal-Data-Protection-Act-2023.pdf
[^usda-rma]: USDA Risk Management Agency: https://rma.usda.gov/
[^agrisk-viewer]: USDA Climate Hubs AgRisk Viewer: https://www.climatehubs.usda.gov/hubs/southwest/tools/agrisk-viewer
[^canada-brm]: Agriculture and Agri-Food Canada business-risk management programmes: https://agriculture.canada.ca/en/programs/business-risk-management
[^agrirecovery]: Agriculture and Agri-Food Canada AgriRecovery: https://agriculture.canada.ca/en/programs/agrirecovery
[^myclimateview]: CSIRO My Climate View: https://www.csiro.au/en/about/challenges-missions/drought-resilience/mission-progress/climate-services-for-agriculture
[^eo-insure]: ESA EO-INSURE architecture: https://business.esa.int/projects/eo-insure
