# GovSync — citizen and administration portal

A working prototype with separate citizen and administrator accounts, Scholarship and Residence / Domicile services, and English, Hindi and Marathi. The cream, navy and terracotta design follows your login reference; the citizen home follows your service-dashboard layout.

## Run locally

Use Node.js 22.18+ (Node.js 24 recommended). Extract the ZIP and open a terminal in the folder containing package.json.

```sh
npm run install:ci
node scripts/setup-local.mjs
node scripts/create-admin.mjs
npm run dev -- --hostname 127.0.0.1
```

Open the Local URL printed by the server, normally http://127.0.0.1:5173. If PowerShell blocks npm.ps1, use npm.cmd.

The administrator setup asks for a name, 10-digit mobile number and a hidden password of at least 12 characters. It writes ignored local files; restart the server after changing them. To generate a random demonstration administrator instead:

```sh
node scripts/create-admin.mjs --generate-demo
```

Read **.private/ADMIN-LOGIN.txt** for that generated login. Never publish .private or .dev.vars. The source ZIP intentionally contains no reusable administrator password.

## How login works

- **Citizens:** choose Create an account, enter a name, mobile number and password, and save the recovery code. Sign in opens the service dashboard. Each account sees only its own applications, permissions and activity.
- **Administration:** select Administration Login and use the separately provisioned credentials. The dashboard shows submitted requests from citizens. Administrators can approve, reject or request clarification. Citizens cannot call these decision endpoints.
- **Forgot password:** citizens use their saved recovery code to choose a new password. This invalidates existing sessions and issues a replacement recovery code. Lost both password and recovery code? There is no automatic recovery by mobile number alone.
- **Sign out:** revokes the server session and removes the cookie. Sessions expire after eight hours. Passwords use salted scrypt hashes. Session tokens live in HttpOnly cookies, not localStorage.
- Mobile numbers are login identifiers; there is **no SMS verification or OTP provider** in this prototype.

See [AUTHENTICATION.md](AUTHENTICATION.md) for architecture, account provisioning, recovery, migration and deployment details.

## Demonstrate the two roles

1. Create a citizen account and save its recovery code.
2. Open Certificates, choose a sample applicant, and grant the required consent.
3. Review verified information, continue to review, confirm and submit.
4. Sign out. Sign in as an administrator (or use a separate browser profile).
5. Approve, reject or request clarification from the review queue.
6. Return to the citizen account, open My applications and view the result. Approved Residence requests have a clearly marked demonstration certificate.
7. Start a Scholarship request and reuse approved residence information when consent is active.

The administrator queue refreshes every 15 seconds. An open submitted application refreshes every 10 seconds. You can also reload the page.

All department profiles are fictional sample records. Creating an account does not verify a person's real identity or connect to government databases. Scholarship approval is a prototype decision, not a payment. Certificates are demonstration-only.

## Edit colors and images

Start with [CUSTOMIZATION.md](CUSTOMIZATION.md).

| Change | File |
| --- | --- |
| Palette, heading font, shared illustration | app/theme.css |
| Login and dashboard layout | app/auth-theme.css |
| Application form and table layout | app/globals.css |
| Brand name and logo path | app/site-config.ts |
| Login fields and account-recovery screens | app/login.tsx |
| Citizen dashboard and navigation | app/portal.tsx |
| Existing application translations | app/i18n.tsx |
| Login/dashboard translations | app/auth-translations.ts |
| Images | public/images/ |

## Database upgrade

A fresh local copy uses `node scripts/setup-local.mjs`, which applies and records migrations. It is safe to run again.

**If you already have a local database from an earlier archive initialized with direct SQL commands**, back it up first. Do not replay migrations 0000 and 0001. Build the project, then apply only the new accounts migration once:

```sh
npm run build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0002_spooky_gwen_stacy.sql
```

Old applications retain their original owner IDs. They are not silently assigned to new mobile accounts. Use a new application for the new account demonstration.

## Checks

With a local server and a generated demo administrator:

```sh
node scripts/test-auth-flow.mjs
node scripts/test-i18n.mjs
node scripts/test-validation.mjs
npm run build
```

The auth test defaults to port 5177; set TEST_BASE_URL to your Local URL if different. The older test-api.mjs and test-residence.mjs default to 5173 and now use real citizen/admin accounts. Tests create fictional records in the local database only. For a manually provisioned admin, set TEST_ADMIN_PASSWORD in your terminal for the test process; never commit it. Repeated login tests can trigger the intended 15-minute attempt limit.

## Hosting

The existing Sites project identity is retained in .openai/hosting.json. Hosting access and GovSync account roles are separate: the currently private Site remains private. App registration does not grant access to the private Site itself.

For a deployment you operate, set the **secret** GOVSYNC_ADMIN_ACCOUNT to the exact JSON from .private/admin-account.json and deploy. Never copy that value into source or the hosting manifest. See AUTHENTICATION.md.

## Administrator data mappings
After signing in as administrator, open Data mappings and select a submitted application. The department tabs show the saved original response, standardized record, and a field-by-field comparison. No citizen browser session or new department API call is required. Draft applications remain private. Labels support English, Hindi and Marathi; raw record values stay unchanged.
