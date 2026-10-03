# Account and login guide

## User journey

Citizen registration → save recovery code → citizen dashboard → apply → track.

Administrator provisioning by project owner → Administration Login → review queue → decision recorded in the citizen's history.

Choosing the administrator tab does not grant privileges. The server reads the role from the account attached to the session.

## Stored data

- auth_users: UUID, display name, unique 10-digit mobile identifier, role, salted password hash, recovery-code hash and creation time.
- auth_sessions: SHA-256 hash of a random 256-bit session token, user ID and absolute expiry.
- auth_limits: hashed mobile/IP rate-limit keys, counters and expiry.
- applications.owner: the authenticated account UUID. Existing owner IDs are preserved.
- audit: citizen-visible decision, officer ID/name, note and timestamp.

Passwords use Node-compatible scrypt with N=16384, r=8, p=5, a random 16-byte salt and a 32-byte derived key. The configured memory bound is 32 MiB per derivation. Plaintext passwords and raw session/recovery tokens are not stored in D1. The recovery code is shown once after registration and after a successful password reset.

The runtime uses the supported Cloudflare Workers Node compatibility layer: https://developers.cloudflare.com/workers/runtime-apis/nodejs/crypto/

## Sessions and request checks

- Random session cookie: govsync_session; HttpOnly, SameSite=Strict, Path=/, eight-hour Max-Age, Secure on HTTPS.
- Server checks session existence and expiry on every protected request.
- Every state-changing request must have an Origin matching the requested Site origin.
- Account endpoints limit attempts by both mobile number (10 per 15-minute window) and IP (60 per window).
- Logout deletes the server session. Citizen recovery rotates the recovery code and deletes all previous sessions.
- Citizen queries are scoped by account ID. Administrators see submitted/decided applications, not citizen drafts.
- Decision endpoints require administrator role, validate status and note, and atomically record the decision alongside the update. A second decision on an already processed request returns a conflict.
- Legacy ChatGPT identity headers and the local-preview sign-in helper do not grant a GovSync role.

## Administrator provisioning

Run `node scripts/create-admin.mjs` in a local terminal. It creates .private/admin-account.json and .dev.vars. The setup script is never exposed as a web endpoint. Citizen registration always creates a citizen.

The configured administrator is one project-wide reviewer for this prototype, covering both Residence and Scholarship. There is no public administrator sign-up. Department-specific assignment, staff onboarding and supervisor roles are future work.

For local development, restart the server after setup. For Sites, set GOVSYNC_ADMIN_ACCOUNT as a secret using the exact JSON, then publish a new deployment. .dev.vars and .private are ignored and excluded from the deliverable source archive.

Run the setup script again with the same mobile number to change its password while retaining the account ID. Deploy the updated secret or restart locally. Old credentials stop working, and existing admin sessions fail verification; a successful new login removes obsolete sessions. When replacing an administrator with another number, provision a new number not already registered as a citizen.

`--generate-demo` generates a random password for mobile identifier 9990000001 and writes a local ADMIN-LOGIN.txt. It does not send an SMS or claim control of that number. The separately delivered administrator login file applies to the supplied preview/deployment. A new extracted local copy must run setup and will get its own credentials.

## API

| Endpoint | Access |
| --- | --- |
| POST /api/auth/register | Public within the Site; citizen only |
| POST /api/auth/login | Public within the Site; role + mobile + password |
| POST /api/auth/recover | Citizen mobile + recovery code + new password |
| POST /api/auth/logout | Same-origin session revocation |
| GET /api/auth/session | Authenticated account |
| GET /api/workspace | Citizen-owned records or admin review records |
| POST /api/applications | Citizen only |
| GET /api/applications/:id | Owning citizen |
| GET /api/departments/:source/:citizenId | Owning citizen with active consent |
| POST /api/applications/:id/decision | Administrator only |
| Other application mutations | Owning citizen |
| GET /api/applications/:id/certificate | Owning citizen; approved Residence request |

## Demo limits

Authentication is real within this application, but this is a prototype rather than a government identity system. Mobile ownership is unverified. No OTP, email delivery, Aadhaar verification, live government API, payment or real certificate issuance is included. Use fictional names and numbers while demonstrating.

Before a public deployment with real citizen data, add verified identity/phone enrollment, staff MFA, department-scoped permissions, operational recovery, abuse monitoring, retention policy and a security review. The current Site audience remains unchanged and private.
