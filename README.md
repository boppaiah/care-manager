# Care Manager Copilot

A desktop-first, tablet-responsive demo for Australian home-care managers. Uses **fictional data only**. The product requirements live in [docs/product-spec.md](docs/product-spec.md).

## Develop

Requires Node.js 22 or newer (validated with Node.js 24) and npm.

```sh
npm ci --cache /tmp/care-manager-npm-cache
npm run dev
```

The root route redirects to `/caseload`. Main routes:

- `/caseload`: computed worklist, all 53 clients, search, status/type/priority filters and sorting.
- `/clients/client_1/prep`: Margaret’s source-linked sample brief, editable talking points, review controls, conversation documentation and follow-up creation.
- `/follow-ups`: cross-client actions with filters and task creation.
- `/follow-ups/task_3`: Helen’s overdue enquiry; task details, progress, required resolution outcomes and reopening history.

## Feature architecture

Next.js App Router pages are Server Components; interactive feature entry points are narrowly designated Client Components. Async route params follow current App Router conventions. Strict TypeScript is enabled.

- `src/features/caseload`: daily worklist and client discovery.
- `src/features/prep`: source-linked preparation and conversation recording.
- `src/features/follow-ups`: task creation, editing, lifecycle and activity history.
- `src/lib`: shared domain models, Zod validation, deterministic seed construction, dates and pure workflow rules.
- `src/components`: shared UI, application shell and browser demo state provider.

All features share a versioned browser-local store via React’s `useSyncExternalStore`. No backend, external AI credential or live care-system integration is required. Only this browser retains edits; there is no cross-user sync. Storage failures are surfaced to the user. Reset demo data restores the fictional scenarios. This is not a production audit store or a place for real health information.

Briefs are explicitly labelled **Sample AI output**, derived from seeded source-linked observations, not a live model. No client-facing actions are automated. A future live model service must run server-side, validate its JSON schema and reject unknown/cross-client source references before presentation.

Dates and overdue calculations use Australia/Sydney. Seed dates are relative to the first load/reset date. The default contact interval is a visible 30-day demo assumption, not a statement of provider or regulatory requirements. Newly recorded contacts affect contact presentation; independent follow-ups remain open.

## Validation

```sh
npm run typecheck
npm run lint
npm run format:check
npm test
npm run build
PLAYWRIGHT_BROWSERS_PATH=/tmp/care-manager-browsers npx playwright install chromium
PLAYWRIGHT_BROWSERS_PATH=/tmp/care-manager-browsers npm run test:e2e
```

If Chromium is already installed on the machine, use `PLAYWRIGHT_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e` instead of downloading a browser.

Browser tests exercise client discovery, evidence drill-down, conversation recording, task creation, refresh persistence, required outcomes, resolution/reopening, dashboard updates, and the five seeded scenarios. Playwright starts its own development server if one is not already running.

`npm run build && npm start` runs the production build. Next.js can also deploy to a compatible host such as Vercel; no deployment has been published as part of this implementation.

## Demo walkthrough

1. Open My Caseload and review the computed counters; select All clients to browse all 53 people.
2. Search for Margaret Wilson. Open her prep brief and inspect both source notes.
3. Review the suggestion, edit talking points, document a fictional completed contact, and create a follow-up with an explicitly confirmed owner and due date.
4. Add progress. Block with a reason, then resolve with a factual outcome. Reopen with a reason and inspect the preserved history.
5. Return to Caseload and verify the counts; inspect Robert’s blocked request, Helen’s overdue enquiry, David’s no-change brief and Linda’s seeded reopened task.

## Scope boundaries

This prototype does not provide authentication, tenant isolation, shared persistence, clinical decisions, emergency monitoring, incident registers or regulatory certification. Use synthetic records only. Production and real-data pilots require a separate design and security/privacy review.
