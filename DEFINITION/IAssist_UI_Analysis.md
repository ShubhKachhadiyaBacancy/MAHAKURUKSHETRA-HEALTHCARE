# iAssist HCP Dashboard Analysis

Source reviewed: `https://hcp.iassist.com/dashboard`

Review date: `2026-03-14`

Context: analysis was performed from the currently open authenticated browser session. Findings below combine direct observation of visible UI with limited inference from exposed help content and menu structure.

## 1. Product Surface Summary

iAssist presents as a provider-facing specialty medication operations portal centered on:

- patient intake
- submission management
- medication favorites
- reporting
- account-level workflow preferences
- help and support

The visible product is intentionally narrow. It focuses on getting providers into a small number of recurring tasks quickly rather than exposing a broad enterprise navigation tree.

## 2. Information Architecture

### Global Navigation

Primary sections:

- `Dashboard`
- `Patients`
- `Reports`

Global header utilities:

- patient or medication search
- `Add New Patient`
- user/profile menu
- notifications

### Dashboard Structure

The dashboard is made of four high-level areas:

1. Welcome panel
2. To-do list
3. Medication favorites
4. Patient work queue preview

This is closer to an operational home screen than an analytics dashboard.

### Patients Area

The patients section is a table-driven workspace with:

- patient list
- address
- medication
- last modified
- status
- archive toggle

The emphasis is case tracking, not longitudinal patient records.

### Reports Area

The reports section is currently minimal:

- `Submissions Report`
- date-range filter
- download action
- placeholder for future reports

This suggests reporting is secondary to transactional workflows.

### Profile / Settings Menu

Visible items:

- `Set Up Prescriber Filter`
- `Set Preferred Pharmacy`
- `Set Specialty Program`
- `Account`
- `Help`
- `Sign Out`

This shows the app uses lightweight configuration overlays instead of a large dedicated settings module.

## 3. Core User Journeys

### Journey 1: Add Patient and Start Submission

Observed flow:

1. Click `Add New Patient`
2. Fill modal fields:
   - first name
   - last name
   - date of birth
   - sex
   - zip code
3. Choose:
   - `Add Patient`
   - `Add & Start Submission`

Implication:

- Intake is designed to minimize initial friction.
- The modal captures just enough data to begin downstream work.
- The combined CTA strongly suggests patient creation and submission initiation are often part of the same flow.

### Journey 2: Monitor Active Work

Observed flow:

1. Land on dashboard
2. Review `To-Do List`
3. Review patient queue preview
4. Click `View All Patients` for the full queue

Implication:

- The dashboard is a triage surface.
- The patients page is the main work execution surface.

### Journey 3: Manage Preferred Medications

Observed flow:

1. Click `Add Medication`
2. Search medications
3. Add favorites from search results or sponsored medications

Implication:

- Medication selection is a repeat-use accelerator.
- Favorites likely reduce friction for recurring submission patterns.

### Journey 4: Export Submission History

Observed flow:

1. Open `Reports`
2. Choose date range
3. Optionally use prescriber filter when available
4. Click `Download Now`

Implication:

- Reporting is document/export oriented rather than exploratory analytics.
- This likely serves office administration and audit workflows.

### Journey 5: Configure Operational Defaults

Observed flow:

1. Open profile menu
2. Choose workflow preference such as `Set Preferred Pharmacy`
3. Search/select option
4. Save

Implication:

- The product nudges standardization through account defaults.
- Defaults are configurable but still overridable at submission level.

### Journey 6: Self-Serve Help and Escalation

Observed flow:

1. Open `Help`
2. Browse categorized FAQs
3. Switch to `Contact Us`
4. Submit support form or call support number

Implication:

- Support is embedded inside the product.
- FAQ taxonomy reveals hidden capabilities not obvious from the main nav.

## 4. Feature Inventory

### Directly Observed Features

- authenticated dashboard
- patient creation modal
- patient search
- medication favorites
- sponsored medication listing
- patients table
- archived-patient toggle
- notifications drawer
- submissions report export
- preferred pharmacy configuration
- help FAQ center
- support contact form with reCAPTCHA

### Features Strongly Implied by Help Content

- ePrescription / referral submission
- renewal workflows
- re-authorization workflows
- re-verification workflows
- prior authorization support
- clinical attachment handling
- notes and tasks
- alerting for patients needing attention
- document viewing for prior submissions
- EHR integration
- prescriber verification/signature process

## 5. UI Patterns

### What the Product Does Well

- Very shallow navigation
- Clear operational hierarchy
- Fast entry into common actions
- Strong use of modal overlays for focused tasks
- Consistent empty states
- Minimal cognitive load on primary screens

### What the UI Optimizes For

- repeat usage by office staff
- quick training and onboarding
- low-click access to common workflows
- predictable layout over visual novelty

### Weaknesses / Gaps

- dashboard depth is limited
- `To-Do List` is present but not yet useful in the observed state
- reports feel underdeveloped
- notifications panel appeared empty
- some sponsored-medication assets failed to load
- one visible disabled menu item (`Sdasda`) looks like internal/test leakage

## 6. Screens to Replicate

These are worth replicating conceptually for our application:

- dashboard as a triage surface
- add-patient / start-submission flow
- patients queue page
- medication favorites / quick-start surface
- lightweight settings overlays for operational defaults
- embedded help center

## 7. Screens to Improve

For our product, these should be upgraded rather than copied:

- `To-Do List`
  - should become a real workflow queue with owner, due date, blocker, and urgency
- patients table
  - should include clearer next-action visibility, payer status, and affordability state
- reports
  - should move beyond export-only toward actionable operational summaries
- notifications
  - should differentiate attention-needed items from generic updates
- medication favorites
  - should connect to therapy templates, payer rules, and onboarding shortcuts

## 8. Recommended Feature Matrix for Our App

| Area | iAssist observed | Recommendation for SpecialtyRx Connect |
|---|---|---|
| Dashboard | welcome + empty to-do + patient preview | operational command center with blockers, due actions, auth status, affordability status |
| Patient intake | lightweight modal intake | step-based intake with payer, medication, support needs, and routing logic |
| Patient queue | table by patient | queue by patient plus therapy, payer, status, and next action |
| Medication management | favorites + sponsored meds | favorites plus therapy templates and program-specific accelerators |
| Reports | export-driven | export plus live KPI summaries and queue analytics |
| Preferences | pharmacy/program defaults | provider defaults plus notification, communication, and workflow preferences |
| Help | FAQ + support form | FAQ, guided onboarding, and contextual task help |

## 9. Product Strategy Implications

The biggest lesson is not the styling. It is the product shape.

iAssist is built around operational compression:

- few nav items
- clear recurring actions
- fast transition from intake to submission
- minimal branching in the UI

For SpecialtyRx Connect, we should preserve that simplicity but improve the workflow model:

- stronger care-access status modeling
- better prior authorization visibility
- clearer financial assistance orchestration
- more useful triage and tasking
- more integrated communication history

## 10. Build Guidance for Our Application

Before implementation, keep these constraints:

- do not overbuild navigation
- prefer one primary command-center dashboard
- make patient intake fast but structured
- make queues more important than decorative analytics
- surface next actions everywhere
- use settings to reduce repeat work
- keep help embedded

## 11. Suggested MVP Screen Set

Based on both the PRD and this competitor review, the initial screen set should be:

1. Landing / overview
2. Provider dashboard
3. Patient enrollment / intake
4. Patient case queue
5. Case detail with prior auth, coverage, assistance, and communication sections
6. Reports / exports
7. Settings / workflow preferences
8. Help / support

## 12. Notes

- Analysis is limited to what was visible in the authenticated browser session.
- Some capability statements are inferred from help-center IA and menu structure, not directly executed end-to-end.
- This file is intended as a design and architecture reference before application buildout.
