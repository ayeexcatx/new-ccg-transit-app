# Official Baseline Coverage Audit (Personal Reference Crosswalk)

Date: 2026-03-25  
Primary source of truth: repository code  
Secondary comparison source: `docs/personal-app-baseline-reference.md`

## Scope audited
- `docs/behavior-preservation-baseline.md`
- `docs/notifications-behavior-baseline.md`
- `docs/portal-dispatch-drawer-behavior-baseline.md`
- `docs/admin-dispatches-behavior-baseline.md`
- `docs/admin-operations-baseline.md`
- `docs/company-owner-baseline.md`
- `docs/driver-baseline.md`

## Fully covered in official baselines
- Access-code login and redirect behavior (active-code validation, admin-to-dashboard routing, session restore/logout rules) is covered in `behavior-preservation-baseline`.
- Admin dashboard cards/quick actions/force-refresh behavior is covered in `admin-operations-baseline`.
- Admin dispatch create/edit/copy/archive/delete, edit locks, live board behavior, and Drive sync workflow are covered across `admin-dispatches-behavior-baseline` + `behavior-preservation-baseline`.
- Dispatch drawer role-based behavior, confirmations, time logs, screenshot flow, incident deep-linking, and owner truck replacement logic are covered in `portal-dispatch-drawer-behavior-baseline`.
- Notification creation/dedup/reconciliation and owner/driver/admin recipient logic are covered in `notifications-behavior-baseline`.
- Company-owner and driver scoped experiences (home/availability/drivers/profile/incidents) are covered in `company-owner-baseline` and `driver-baseline`.

## Present but insufficiently covered (resolved by this audit)
1. Global app shell/header behavior (persistent header, role/workspace identity line, header actions, admin nav set) was only implicit and not clearly captured as a baseline preservation rule.
   - Resolved by adding explicit app-shell baseline bullets to `docs/behavior-preservation-baseline.md` and admin shell coverage to `docs/admin-operations-baseline.md`.
2. Admin confirmations page behavior (Open vs History split, notification-time/pending-age fields, deep-link to dispatch) was not explicitly represented in `admin-operations-baseline.md`.
   - Resolved by adding dedicated **Admin Confirmations** section to `docs/admin-operations-baseline.md`.

## Missing from official baselines
- None remaining after this update for the audited personal-reference items that were confirmed in code and relevant to the official baseline set.

## Needs manual verification
- Install prompt repetition/timing by browser/device (banner eligibility is code-backed; real-world trigger cadence is browser-dependent).
- Long-label responsive behavior in header/workspace areas at narrow breakpoints.
- Confirmation operations policy expectations (e.g., escalation SLA) beyond currently implemented UI/reporting behavior.

## Coverage outcome
After the above documentation updates, the official baseline set now covers the confirmed, relevant personal-reference behaviors audited in this pass.
