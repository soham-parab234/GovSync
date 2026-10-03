# GovSync — Residence and Scholarship prototype

This version combines separate mobile/password accounts with the Scholarship and Residence workflows, using the supplied cream, orange and navy design.

## Run locally

Use the current README.md setup instructions: install dependencies, run node scripts/setup-local.mjs, provision an administrator using node scripts/create-admin.mjs, and start the development server. Create a citizen account from the login screen and save its recovery code. Read AUTHENTICATION.md for account roles and recovery.

## Residence demonstration

1. In Services, choose **Residence / Domicile Certificate → Start Application**.
2. Select a fictional citizen. Grant the Identity, Residence, and Documents permissions and tick the consent declaration.
3. Optionally enable **Demonstrate an address mismatch** or **Simulate a department outage**.
4. Click **Grant Consent**. The three source checks run in sequence with a short loading state.
5. Review the six pre-filled fields: name, date of birth, address, district, state, and PIN.
6. For a mismatch, compare the registry and application addresses. Choose **Accept verified address**, or edit the address and **Validate information**. Unverified changes cannot pass silently.
7. Review residence year, purpose, and the verified supporting document. The year must match the fictional source record (2018); other source changes need registry correction.
8. Continue to review, confirm the declaration, and submit.
9. Note the single `RES-2026-...` tracking reference.
10. Sign out and use **Administration Login**, then open **Overview**. The submitted Residence application appears in the officer review queue.
11. Select **Review application**, then choose **Approve**, **Request Clarification**, or **Reject**. Clarification and rejection require a reason of at least 10 characters.
12. Sign out and sign back into the citizen account. Decisions appear in **Notifications** and application tracking. Approved applications expose **View Certificate** and a print action.
13. A clarification request allows a response and resubmission to the same officer queue using the same tracking ID.
14. Reload the page and open **My applications** to show that records and decisions are saved.

The certificate is clearly marked **DEMONSTRATION ONLY — not a government certificate**. It is available only after approval.

## Reuse Residence information in Scholarship

Approve a Residence application for Asha, then start a Scholarship application for the same citizen. While the original consent is active, the form offers **Verified residence information available → Use verified information**.

Grant all Scholarship permissions, including Residence. The backend copies the approved source record into the new application's checks, records an audit event, and combines it with Identity, Education, and Income data. The form shows the reused address, district, and state; Maharashtra domicile is checked in validation. Ownership, citizen identity, approval, and both applications' consent are checked on the server.

The original Scholarship scenarios remain:
- Asha: eligible.
- Rohan: income exceeds the demo limit.
- Meera: conflicting dates of birth.
- Department outage: recover by retrying.
- Consent revocation: blocks new reads and submission.

## Languages

Use the header picker for English, Hindi, or Marathi.

Navigation, forms, source labels, validation, tracking, officer actions, notifications, and error messages have explicit translations. Counts, money, percentages, PINs, and dates use locale-aware presentation; Hindi and Marathi display Devanagari digits. Residence years are displayed without thousands separators.

Changing language preserves form state and stored values. The language preference survives reloads. Machine identifiers, raw API/JSON examples, email addresses, and user-written notes retain their original values.

Translations are maintained in `app/i18n.tsx`; the application renders translated strings through React, without rewriting the DOM.

## Architecture and API

Shared flow:

Citizen Portal → Consent → Source APIs → GovSync normalization and validation → Application Registry → Residence Department → Tracking and notification

Persistence uses the existing Cloudflare D1 binding. The new migration adds `service`, `details`, `decision_note`, and `decided_at` to applications. Old applications default to Scholarship.

- `POST /api/applications`: create an application with service-specific consent.
- `GET /api/departments/:source/:citizenId?applicationId=:id`: retrieve a consented fictional record.
- `POST /api/applications/:id/evaluate`: validate stored source records and Residence details.
- `POST /api/applications/:id/submit`: revalidate server-side and save the submission.
- `POST /api/applications/:id/decision`: administrator-only decision on a submitted Residence or Scholarship application.
- `POST /api/applications/:id/clarify`: respond to an officer's clarification request.
- `GET /api/applications/:id/certificate`: retrieve an approved demo certificate.
- `POST /api/applications/:id/reuse-residence`: reuse an approved, consented Residence source.
- `POST /api/applications/:id/revoke`: revoke further access and submission.
- `GET /api/workspace`: own applications and audit events for a citizen, or the submitted/decided review register for an administrator.

Residence sources are Identity, Residence Registry, and Document Registry. Scholarship keeps Identity, Education, Income, and Residence. Source data and raw responses remain available in Data mappings and the API monitor.

Notifications are derived from saved department-decision events. They refresh immediately for decisions in this workspace and poll every 10 seconds while tracking an application. No email/SMS is sent.

## Verification

With the local preview running:

```sh
node --experimental-strip-types scripts/test-validation.mjs
node scripts/test-api.mjs
node scripts/test-residence.mjs
node scripts/test-i18n.mjs
node node_modules/typescript/bin/tsc --noEmit
npm run build
```

The HTTP tests create fictional local applications. They never target hosted URLs. The existing Scholarship suite has 39 HTTP assertions; the Residence suite has 57.

## Demo boundaries

This is a prototype with fictional records, illustrative rules, and no live government integration or real award/issuance. Citizen and administrator accounts have server-enforced roles. Mobile numbers are unverified sign-in identifiers. Real deployment requires verified identity, staff MFA, department-scoped permissions, government integrations and jurisdiction-approved criteria.

The package contains source and migrations, not node_modules, local test records, or a database export. The original hosting configuration is retained for compatibility; this work has not published or changed the existing hosted Site.

## Quick demonstration login

On the Citizen Login screen choose Asha, Rohan or Meera under "Or continue as a sample citizen". Each shows a different scenario (eligible, income above the limit, conflicting birth dates). See AUTHENTICATION.md for details and how to disable it.
