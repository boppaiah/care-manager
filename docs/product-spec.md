# Care Manager Copilot — MVP Product Specification

**Version:** 0.1  
**Date:** 17 October 2026  
**Status:** Ready for prototype implementation  
**Market:** Australian home-care providers operating under Support at Home  
**Primary user:** Care manager / care partner  
**Product positioning:** A personal productivity and action layer alongside an existing care-management platform (such as AlayaCare or ShiftCare), **not** a replacement system of record.

---

## 1. Product objective

Help a care manager responsible for approximately **53 clients** quickly understand:

1. **Who needs my attention?** — *My Caseload*
2. **What should I know before I speak with this person?** — *Conversation Prep*
3. **What did we agree to do, and has it been completed?** — *Follow-through*

### Value proposition

> Your care-management software stores the information. Care Manager Copilot helps you get the work done.

The proposed value is less time spent searching through progress notes, preparing for client conversations, checking previous requests, and tracking loose ends. The tool should **not** replace direct care-management contact or human clinical judgement.

### Success hypothesis (to test)

Target an eventual saving of **3–5 hours per care manager per week** on preparation and coordination. This is a **hypothesis**, not an established result. A prototype needs to collect baseline and task-completion timing before claiming savings.

### MVP operating assumptions

- Start with **synthetic, fictional client data**; do not upload identifiable health information to the public demo.
- Simulate data coming from an incumbent system; **no live AlayaCare/ShiftCare integration** is required in v0.1.
- A **single care-manager persona** can use all three screens; multi-tenant provider management is out of scope for the demo.
- Desktop-first, responsive on tablets; mobile optimisations can come later.
- The tool assists with prioritisation and documentation; it must **not** diagnose, automatically approve care-plan changes, make binding clinical decisions, or independently decide reportability of incidents.

---

## 2. Scope overview

| Screen | Main question | Primary output |
|---|---|---|
| **1. My Caseload** | What should I work on today? | A prioritised list of clients and actionable work |
| **2. Conversation Prep** | What do I need to know before contact? | A source-linked client brief and suggested discussion topics |
| **3. Follow-through** | What still needs to happen? | Owned, dated tasks tracked to verified completion |

### End-to-end journey

1. Care manager opens **My Caseload** and sees that *Margaret Wilson* has an upcoming monthly conversation plus an unresolved request.
2. They open **Conversation Prep** and see recent observations about mobility, a family request for physiotherapy, and the status of the last follow-up.
3. They contact Margaret or her appropriate registered supporter **outside the demo** and record the interaction. Recording is **not equivalent to proving that a compliant direct care-management activity occurred**; it represents user-entered documentation.
4. They create or confirm the next action: *Check physiotherapy availability and respond to Margaret's daughter*.
5. **Follow-through** assigns an owner and due date, tracks attempts and responses, and requires an outcome before closure.
6. Until completed, the action remains visible on **My Caseload**.

---

## 3. Screen 1 — My Caseload

### Goal

Give the care manager a reliable, concise starting point for their day across an approximately 53-client caseload, without making them read every individual file.

### User stories

- **MC-01:** As a care manager, I can view all clients assigned to me so I know my caseload.
- **MC-02:** I can see which clients have **open follow-ups**, **upcoming monthly conversations**, or **new observations worth review**.
- **MC-03:** I can sort/filter work by urgency, due date, action type, and client name.
- **MC-04:** I can open a client and move directly to Conversation Prep with the relevant context.
- **MC-05:** I can open an outstanding action directly in Follow-through.
- **MC-06:** I can tell which alerts are **AI suggestions awaiting review** versus **human-confirmed work**.

### Layout

**A. Header**

- Title: `My Caseload`.
- Current date and care-manager identity (fictional demo identity).
- Search: name / client ID.

**B. Summary tiles** (all counts derive from underlying records)

- `Assigned clients` — e.g., 53.
- `Contact due soon` — upcoming monthly contacts based on entered records, **not a compliance certification**.
- `Open follow-ups` — tasks with nonterminal statuses.
- `Needs review` — newly surfaced AI-suggested observations not yet triaged.
- `Overdue` — open tasks past their due date.

**C. Main worklist**

Each row/card shows:

| Field | Example |
|---|---|
| Client | Margaret Wilson |
| Work item | Mobility observation; physiotherapy request |
| Item type | Observation / Contact / Follow-up |
| Status | Needs review / Open / In progress / Resolved |
| Priority | High / Medium / Low **(triage cue only)** |
| Due date | 19 Oct 2026 |
| Evidence | 2 notes linked / 1 request linked |
| Action | `Prepare conversation` or `View follow-up` |

**D. Filters**

- Work status: `Open`, `Overdue`, `Needs review`, `Completed`, `All`.
- Work type: `Contact`, `Observation`, `Follow-up`.
- Priority: `All`, `High`, `Medium`, `Low`.

### Behaviour and business rules

- Default worklist sorts **overdue human-confirmed actions**, then **upcoming contact**, then **unreviewed AI observations**, subject to user-selected filters.
- Priority is a *work prioritisation hint*, not a clinical acuity score. Display uncertainty and let the care manager override it.
- An AI observation must always link to underlying note excerpts and source IDs; no unexplained alerts.
- New and unresolved issues appear in the client row but remain individually inspectable.
- Completing a task updates the counters and worklist immediately.
- A documented monthly contact does **not** automatically close an independent unresolved follow-up.
- Provide clear empty states, e.g. `No overdue follow-ups`.

### Acceptance criteria

- [ ] Show 53 fictional assigned clients in a searchable caseload.
- [ ] Tiles use computed counts and refresh when tasks are updated.
- [ ] Search by client name works; filters and sort order work.
- [ ] Clicking a client opens that client's Conversation Prep.
- [ ] Clicking a follow-up opens the correct task in Follow-through.
- [ ] AI-suggested items are clearly distinct from confirmed tasks.
- [ ] Every presented observation has a source link or is marked `manual entry`.

---

## 4. Screen 2 — Conversation Prep

### Goal

Prepare a concise, trustworthy briefing before a monthly or ad hoc care-management conversation, using available notes and previous interactions.

### User stories

- **CP-01:** I can view a one-page summary of the client's recent care context.
- **CP-02:** I can see what has changed **since the last recorded conversation**.
- **CP-03:** I can see open requests and promises with their actual owners and statuses.
- **CP-04:** I can click through to the original notes or interaction records behind each statement.
- **CP-05:** I can review and edit suggested discussion points; AI cannot commit anything on my behalf.
- **CP-06:** After a real conversation, I can manually record the interaction and create follow-up actions.

### Layout

**A. Client header**

- Client name and fictional reference number.
- Next/last recorded contact date; last contact method and person contacted if known.
- Quick navigation: `Back to Caseload`, `Follow-through`.

**B. AI-prepared briefing**

Sections:

1. **What changed?** Concise observations from a configurable period (default: since last recorded conversation, otherwise preceding 30 days).
2. **Recent care notes** Short excerpts with timestamp, author role, and source link.
3. **Open client/family requests** Request description, who raised it, current owner, current status, and due date.
4. **Outstanding actions** Link directly to Follow-through.
5. **Suggested discussion points** 2–5 questions for the care manager to approve/edit.
6. **Source coverage** Show `Prepared from X notes and Y previous interactions` plus the period reviewed; say when information is missing.

**C. Record conversation (manual action)**

Form fields:

- Contact date/time.
- Contacted person: `Client`, `Registered supporter`, `Other (specify)`.
- Contact method: `Phone`, `In person`, `Video`, `Other`.
- Brief factual summary / outcome, entered or approved by care manager.
- `Create follow-up` checkbox / button.
- Save as a local demo record with author and timestamp.

Do **not** use labels such as `Compliance fulfilled` or `Contact verified` unless the provider has independently validated its legal and operational criteria. The demo can show `Contact documented`.

### AI output contract

For each generated observation, return structured data (not just free-form text):

```json
{
  "observationId": "obs_001",
  "clientId": "client_001",
  "summary": "Recent notes mention reduced appetite and unsteadiness.",
  "category": "change_in_wellbeing",
  "suggestedPriority": "medium",
  "sourceNoteIds": ["note_001", "note_002"],
  "requiresHumanReview": true,
  "confidenceLabel": "needs_verification"
}
```

Rules:

- Never invent diagnoses, visit dates, family relationships, care plans, approvals, or resource availability.
- Prefer `Not available in provided records` over guessing.
- Attribute assertions to source notes and distinguish **reported observation** from **confirmed fact**.
- Link observations to exact notes; no source, no assertive statement.
- Distinguish newly surfaced information from repeated known concerns.
- Flag possible serious deterioration as `Requires prompt human review` and point to the provider's existing escalation pathway; **never offer a definitive clinical urgency determination**.
- Suggestions are editable drafts. No automatic client-facing messages or autonomous external actions.

### Acceptance criteria

- [ ] Brief is generated for a selected fictional client.
- [ ] It shows observations, recent source notes, outstanding tasks, and suggested conversation points.
- [ ] Every key summary item can be traced to its original seeded note/interaction.
- [ ] Missing information is stated explicitly rather than hallucinated.
- [ ] User can edit discussion points and record a completed conversation.
- [ ] User can create a new follow-up from the recorded outcome.
- [ ] The recorded contact appears in the client timeline and affects relevant *contact-due* presentation only; unrelated tasks remain open.

---

## 5. Screen 3 — Follow-through

### Goal

Ensure client concerns and agreed actions do not disappear after a conversation or note review. Give each action ownership, a due date, and a visible outcome.

### User stories

- **FT-01:** I can view all open actions across my assigned clients.
- **FT-02:** I can create an action manually or from a confirmed observation / conversation.
- **FT-03:** I can give each action an owner, due date and next step.
- **FT-04:** I can record calls, messages, provider responses and other progress.
- **FT-05:** I can see what is overdue or blocked.
- **FT-06:** I can mark an action resolved with an outcome and reopen it if required.
- **FT-07:** I can see an auditable activity history within the demo.

### Layout

**A. Header and task counters**

- `Open`, `In progress`, `Blocked`, `Overdue`, `Resolved`.

**B. Task list**

- Client, title, owner, status, priority cue, due date, last update and originating source.
- Search / filter by status, client, owner, due date and task type.

**C. Detail drawer or page**

Required fields:

| Field | Required? | Notes |
|---|---|---|
| Task title | Yes | Short action statement |
| Client | Yes | Link to client profile |
| Description / next step | Yes | Editable |
| Owner | Yes | Fictional demo team member |
| Due date | Yes | Date; not auto-selected by AI without human confirmation |
| Status | Yes | `Open`, `In progress`, `Blocked`, `Resolved` |
| Origin | Yes | Conversation, note observation or manual entry |
| Source reference | Conditional | Link to record if there is a source |
| Activity history | System-managed | Immutable-style appended updates |
| Resolution outcome | When resolving | Mandatory factual outcome |

### Workflow and business rules

1. Creating a task sets status to `Open`.
2. Starting work changes status to `In progress`.
3. Waiting on another party may change status to `Blocked`, with a reason.
4. Follow-up attempts append activity entries but **do not** imply resolution.
5. Marking `Resolved` requires a free-text outcome (e.g., `Daughter informed that physiotherapy provider will call to arrange assessment`).
6. Reopening preserves prior resolution history and appends a reopening activity event.
7. AI can **suggest** title, next step and category; a human confirms owner, due date and any external contact.
8. Task overdue status is derived from `dueDate < today` and not resolved; `Overdue` is a filter/indicator, not a separate task status.
9. An incident, complaint or potential clinical risk must follow the provider's formal escalation process; this task list is **not** a substitute for required incident/complaint registers.

### Acceptance criteria

- [ ] Create a follow-up from a client conversation or directly from Follow-through.
- [ ] Assign owner and due date; display on both Follow-through and My Caseload.
- [ ] Update status and add timestamped progress events.
- [ ] Filter overdue and blocked items correctly.
- [ ] Require an outcome when resolving.
- [ ] Reopen a resolved item without deleting history.
- [ ] Task detail links back to the originating note or conversation.

---

## 6. Shared data model (prototype)

Keep a small, consistent domain model behind all three screens. IDs in the table are illustrative.

| Entity | Important fields |
|---|---|
| `Client` | `id`, `displayName`, `clientRef`, `assignedCareManagerId`, `supporterName?`, `supporterRole?`, `isActive` |
| `CareManager` | `id`, `displayName`, `role` |
| `CareNote` | `id`, `clientId`, `recordedAt`, `authorName`, `authorRole`, `body`, `sourceSystem`, `sourceRecordId` |
| `Interaction` | `id`, `clientId`, `occurredAt`, `contactedPerson`, `contactMethod`, `summary`, `recordedBy`, `createdAt` |
| `Observation` | `id`, `clientId`, `summary`, `category`, `suggestedPriority`, `sourceNoteIds[]`, `reviewStatus`, `reviewedBy?`, `reviewedAt?` |
| `FollowUp` | `id`, `clientId`, `title`, `description`, `ownerId`, `dueDate`, `status`, `priority`, `originType`, `originId`, `resolutionOutcome?`, `createdAt`, `updatedAt` |
| `FollowUpActivity` | `id`, `followUpId`, `action`, `note`, `actorId`, `createdAt` |
| `ConversationBrief` | `id`, `clientId`, `generatedAt`, `rangeStart`, `rangeEnd`, `summary`, `discussionPoints[]`, `sourceNoteIds[]`, `sourceInteractionIds[]`, `generationStatus` |

### Relationships

- A `Client` has many `CareNote`, `Interaction`, `Observation`, and `FollowUp` records.
- An `Observation` may reference many `CareNote` records.
- A `FollowUp` may originate from an `Observation`, `Interaction`, or manual creation.
- A `FollowUp` has many append-only `FollowUpActivity` records.
- A `ConversationBrief` is tied to a client and records exactly which source items were used.

### Suggested task status enumeration

`OPEN | IN_PROGRESS | BLOCKED | RESOLVED`

### Review status enumeration

`NEEDS_REVIEW | CONFIRMED | DISMISSED`

---

## 7. Demo data and scenarios

Seed **53 fictional clients** and enough realistic variation to make the dashboard meaningful. All people, contact details, notes and events must be synthetic.

### Mandatory demo scenarios

**Scenario A — Change in wellbeing (Margaret Wilson)**

- Note 1: Worker reports unsteadiness when walking.
- Note 2: Another worker reports reduced appetite and fatigue.
- Expected AI behaviour: Suggest one source-linked observation for human review, not a diagnosis.
- Expected manager action: Open prep, review source evidence, contact client, create follow-up if needed.

**Scenario B — Unresolved family request (Robert Chen)**

- Family member asks about changing visit times.
- Follow-up is assigned but awaiting service scheduling confirmation.
- Expected behaviour: Request appears in Conversation Prep and Follow-through until outcome is recorded.

**Scenario C — Overdue action (Helen Parker)**

- A missed-service enquiry has passed its follow-up due date.
- Expected behaviour: Shows in overdue tile/filter and worklist with owner.

**Scenario D — No concerning changes (David Thompson)**

- Routine, uneventful notes and no outstanding requests.
- Expected behaviour: Summary explicitly says no new notable change detected **in the reviewed data**; avoid inventing concerns.

**Scenario E — Resolution and reopening (Linda Harris)**

- An action is resolved with outcome, then reopened due to a subsequent family response.
- Expected behaviour: Preserve complete task timeline and recalculate counts.

### Pre-seeded states

- At least 10 fictional notes spanning multiple dates and authors.
- At least 5 open follow-ups, including 1 overdue and 1 blocked.
- At least 2 clients with month-to-date contacts documented and several with upcoming contact dates.
- At least 2 example observations awaiting human review, 1 confirmed and 1 dismissed.

---

## 8. Proposed implementation

### Stack (optimised for a publishable demo)

- **Frontend + backend:** Next.js, TypeScript, React.
- **Styling:** Tailwind CSS, accessible component library.
- **Database:** Start with local seed JSON or SQLite for a nonpersistent demo; use hosted PostgreSQL/Supabase when shared persistent data is needed.
- **AI:** Server-side LLM call returning schema-validated JSON. Do not expose model keys to the browser.
- **Hosting:** Vercel (or comparable deployment host).
- **Authentication:** Demo access only with synthetic data; production requires provider identity, role-based access and tenant separation.

### Suggested routes

| Route | Purpose |
|---|---|
| `/caseload` | Dashboard / worklist |
| `/clients/:clientId/prep` | Conversation Prep |
| `/follow-ups` | All tasks |
| `/follow-ups/:id` | Task details and history |

### Suggested API endpoints

| Endpoint | Purpose |
|---|---|
| `GET /api/clients` | List assigned clients |
| `GET /api/caseload/summary` | Computed dashboard counts |
| `GET /api/clients/:id/notes` | Fetch source notes |
| `GET /api/clients/:id/brief` | Fetch latest prepared brief |
| `POST /api/clients/:id/brief/generate` | Generate source-linked brief |
| `POST /api/clients/:id/interactions` | Document a completed conversation |
| `GET /api/follow-ups` | Fetch and filter work items |
| `POST /api/follow-ups` | Create task |
| `PATCH /api/follow-ups/:id` | Update owner, due date or status |
| `POST /api/follow-ups/:id/activities` | Append activity / resolution event |

The initial demo can implement these operations using an in-memory or seeded local store if persistence is not yet required, as long as all three screens share the same state.

### Minimum interaction expectations

- Working navigation across all three screens.
- Functional filters, search and sorting.
- Working task creation, assignment, status change, resolution and reopening.
- Source note drill-down from generated summaries.
- A seeded or live AI-generated brief; if simulated, it must be visibly marked `Sample AI output`.
- User-visible loading, empty and error states.
- Accessible keyboard focus and usable contrast.

---

## 9. Regulatory and safety design constraints

These are **design considerations**, not a claim that the MVP itself achieves regulatory compliance. Verify detailed obligations with current official Support at Home guidance and provider compliance specialists before any real pilot.

1. **Direct monthly care-management activity:** The tool may support preparation and documentation but must not represent an automated reminder or generated summary as direct care-management contact.
2. **Care planning and changing needs:** Surface observations that may warrant human review or a care-plan conversation; no autonomous care-plan alteration.
3. **Feedback, complaints and incidents:** Do not silently treat regulated complaints/incidents as ordinary tasks. The demo should advise escalation into the provider's formal process when relevant.
4. **Traceability:** Preserve links from AI summaries and actions to underlying source material and keep a record of manual decisions.
5. **Privacy:** Prototype uses synthetic data only. Real deployments require careful assessment of the Privacy Act 1988, applicable Australian Privacy Principles, the Aged Care Act 2024 and Rules, data security, access control, consent/authority, hosting, third-party model processing, retention and breach response as applicable.
6. **Human approval:** No client-facing messaging, external scheduling, service changes, clinical assessment or task closure occurs autonomously.
7. **Uncertain findings:** AI may make mistakes; show uncertainty, source coverage and review controls. Do not use the system as an emergency monitoring service.

**Reference points for later verification:** Australian Department of Health, Disability and Ageing Support at Home program guidance; strengthened Aged Care Quality Standards; Aged Care Act 2024 and Aged Care Rules 2025; Office of the Australian Information Commissioner guidance on health information and APPs.

---

## 10. Demo script (approximately 5 minutes)

1. **Opening — My Caseload:** Show 53 clients and the number of open/overdue actions. Explain the daily workload problem.
2. **Find the signal:** Select Margaret's needs-review work item.
3. **Conversation Prep:** Show the combined summary from two dated notes, linked sources, outstanding physiotherapy request and suggested discussion topics.
4. **Human in control:** Confirm that the manager reviews the notes and makes the client contact; enter a fictional outcome in the demo.
5. **Create a follow-up:** Make an action to check physiotherapy availability; assign to Sarah and choose a due date.
6. **Follow-through:** Show the action in the cross-client list, add a status update, record the outcome and resolve it.
7. **Close the loop:** Return to My Caseload to show the updated counts. Emphasise that unresolved work remains visible.
8. **Feedback:** Ask whether this replaces any existing manual steps in the manager's actual software workflow.

### Questions to ask reviewers

- Which steps here are **already easy** in AlayaCare/ShiftCare?
- Where do you still switch between screens, spreadsheets, email, calls or notes?
- How long does conversation preparation take today for a routine client vs a complex client?
- How are everyday family requests assigned and tracked to resolution today?
- Would this worklist be trusted? What evidence would you need to see?
- Would this save enough time to justify a separate paid tool and integration?

---

## 11. Definition of done for v0.1

A prototype is ready to show care managers when:

- [ ] All three screens are navigable from a single deployed URL.
- [ ] A 53-client fictional caseload is available.
- [ ] My Caseload gives meaningful, computed and interactive work priorities.
- [ ] Conversation Prep uses linked notes, interactions and tasks to create a usable client brief.
- [ ] The care manager can record an interaction, create a follow-up and navigate to it.
- [ ] Follow-through supports assignment, updates, overdue states, resolution with outcome, and reopening with history.
- [ ] Changes flow back to the caseload and client views consistently.
- [ ] AI-generated material is distinguishable from source facts and human-approved records.
- [ ] The demo never displays real health data or falsely claims regulatory certification.
- [ ] A five-minute walkthrough can be completed without editing code or refreshing seed data.

## 12. Explicitly out of scope (v0.1)

- Integrations with production AlayaCare, ShiftCare or Lumary accounts.
- Automatic outbound phone calls or SMS.
- Replacement of care-worker notes, clinical records, care plans, billing or rostering systems.
- Automated incident classification/reportability decisions or complaints-register substitution.
- Autonomous clinical recommendations, emergency detection guarantees or service-provider bookings.
- Production identity federation, multi-provider tenancy, invoicing or claims automation.
- Regulatory certification, audit assurance or legal compliance guarantees.

---

## 13. Implementation order

1. **Shared seed data + models:** Clients, notes, interactions, observations, follow-ups, activity history.
2. **My Caseload:** Tiles, list, filters, drill-down navigation.
3. **Conversation Prep:** Source-linked summary, note expansion, editable talking points, interaction recording.
4. **Follow-through:** Task creation, edit, status progression, activity log, closure/reopen.
5. **Cross-screen synchronisation:** Updated tasks/contact records immediately reflected everywhere.
6. **AI brief service:** Add schema validation, grounded source references and error fallback.
7. **Deploy + test:** Publish, test five demo scenarios and gather feedback.

**North star for customer discovery:** Does this product reliably eliminate meaningful administrative work **that the care manager's existing platform does not already eliminate**?
