# GovSync vs Demo — Phase 1 Feature Comparison & Architecture Matrix

**Date:** November 13, 2026  
**Auditor:** Senior Software Architect & Full-Stack Engineer  
**Scope:** In-depth comparative analysis between the **GovSync** main project (`d:\My Projects\GovSync`) and the **Demo** prototype (`d:\My Projects\Demo`).

---

## 1. Executive Summary

- **GovSync** is a full-stack, production-oriented application built on Next.js 16, React 19, Cloudflare Workers D1, and Drizzle ORM. It possesses production-ready authentication (scrypt-v1 hashing, HttpOnly cookies, session revocation, rate-limiting), comprehensive multi-language support (English, Hindi, Marathi), official verification certificates, and an end-to-end two-way officer clarification workflow. However, its service offerings are currently hardcoded to 2 services, and its validation logic is procedural.
- **Demo** is a client-side prototype built on Vite 5, React 18, and Tailwind CSS. While its backend is simulated (in-memory mock data with client `sessionStorage`), its conceptual breadth is significantly broader: it features a 7-service marketplace, declarative eligibility rules with operator comparison, cross-department discrepancy detection with interactive resolution UI, multi-department bounded network retries, and an administrator API health monitor.

The goal of future phases will be to adapt Demo's superior UI concepts and declarative data models into GovSync's robust serverless architecture without compromising GovSync's production security, internationalization, or data persistence.

---

## 2. Feature Comparison Matrix

| Feature | Demo (Original Prototype) | GovSync (Main Project) | Migration Priority | Architectural Assessment |
|---|---|---|---|---|
| **Service Catalog & Marketplace** | 7 active services (`scholarship`, `ration-card`, `passport`, `pension`, `income-certificate`, `caste-certificate`, `domicile-certificate`). Filterable by category, searchable, with estimated completion time and required source badges (`ServiceMarketplace.tsx`). | 2 services (`scholarship`, `residence`). Presented as fixed cards without search, category grouping, or dynamic catalog metadata (`app/apply.tsx`). | **High** | Demo's data-driven service catalog pattern should replace GovSync's hardcoded two-service switch. |
| **Declarative Eligibility Rule Engine** | Dynamic rule schema (`EligibilityRule`) supporting operators (`<=`, `>=`, `==`, `!=`, `<`, `>`) against normalized profile attributes, generating pass/fail breakdown with expected vs actual values (`src/lib/engine.ts`). | Hardcoded procedural functions in `lib/demo.ts` (`assess`) and `lib/residence.ts` (`assessResidence`) with fixed checks. | **High** | Highly valuable. Moving GovSync to declarative rules will allow adding new services without writing custom evaluation functions for each. |
| **Cross-Source Conflict Detection & Resolution** | Automated conflict engine (`detectConflicts`) detecting discrepancies (e.g. Aadhaar address vs Revenue address). Presents an interactive UI for citizen to choose trusted source or provide manual explanation (`ServiceDetailPage.tsx`). | Single hardcoded name/DOB identity-education check and simulated address mismatch checkbox. Flags application as `needs_review` without a granular conflict resolution UI. | **High** | Demo's conflict detection UI and data model (`DataConflict[]`) with severity rating is a major UX differentiator for GovSync. |
| **API Registry & Live Health Monitor** | Dedicated administrative monitor (`AdminRegistry.tsx`) tracking 5 mock APIs with live status badges (operational/degraded/down), response time (ms), supported fields, and an interactive "Test Ping" tool. | Basic monitor table in `views.tsx` showing 4 endpoints, latency test, and JSON explorer. | **Medium** | Demo's abstraction of department APIs as first-class registry entries with health tracking should be integrated into GovSync's admin suite. |
| **Network Orchestration & Retries** | Mock adapter (`adapters.ts`) with realistic latency simulation, timeout thresholds (4000ms), and automated bounded retry logic (max 2 retries) before declaring failure. Parallel fetching with `Promise.all`. | Direct fetch per department route via server `/api/departments/:source/:citizenId`. Checks run sequentially with 450ms fixed delay; manual retry button on 503 outage. | **Medium** | GovSync's client-side sequential loop should adopt bounded retries and parallel source resolution. |
| **Application State Machine** | 13 granular states (`draft`, `consent_granted`, `data_fetching`, `data_fetched`, `eligibility_checking`, `eligible`, `not_eligible`, `needs_review`, `submitted`, `under_review`, `approved`, `rejected`, `manual_review`). | 7 tracked states (`draft`, `eligible`, `needs_review`, `submitted`, `approved`, `clarification`, `rejected`). | **Medium** | Combine both: retain GovSync's database-persisted statuses while adopting Demo's fine-grained client-side progress indicators. |
| **Officer Clarification Workflow** | Not supported. Officers can only Approve, Reject, or trigger internal Manual Review. | Full two-way clarification lifecycle (`POST /api/applications/:id/clarify`). Citizen responds to officer notes and resubmits under the same tracking ID. | **Preserve GovSync** | GovSync's clarification workflow is superior, realistic, and must be preserved. |
| **Inter-Service Data Reuse** | Not implemented. Each application requires redundant fetching. | Implemented end-to-end (`POST /api/applications/:id/reuse-residence`). Verified residence record from an approved application is copied into a scholarship application under active consent. | **Preserve GovSync** | Foundational interoperability capability in GovSync. Must be preserved and expanded to other services. |
| **Multi-Language Internationalization (i18n)** | English only. | Full multi-language architecture (English, Hindi, Marathi) with custom Devanagari numerals, localized labels, and locale preservation (`app/i18n.tsx`). | **Preserve GovSync** | Essential requirement for Indian e-governance; all incoming Demo features must be translated. |
| **Authentication & Session Security** | Mock client-side `sessionStorage`, plain-text passwords, mock multi-identifier input (email, phone, Aadhaar). No real server verification. | Serverless SQLite session store, salted `scrypt-v1` password hashing, timing-safe equality, HttpOnly cookies, CSRF protection, rate limiting (`auth_limits`), and account recovery codes. | **Preserve GovSync** | GovSync's authentication is production-grade. Demo's multi-identifier UI can be adopted, but the backend must remain GovSync's scrypt/session engine. |
| **Citizen Registration & Document Onboarding** | Multi-step wizard with personal info, Aadhaar/phone formatting, and simulated DigiLocker document attachment (`RegisterPage.tsx`). | Basic registration with name, mobile number, password, and recovery code (`login.tsx`). | **Medium** | Demo's document-centric onboarding UX can be adapted to enrich GovSync's registration process. |
| **Formal Demonstration Certificates** | Basic completion summary screen. | Official printable demonstration certificate with reference tracking ID, QR/profile representation, and legal disclaimer (`/api/applications/:id/certificate`). | **Preserve GovSync** | Ready for stakeholder demonstrations; maintain in GovSync. |
| **Audit Trail & Event Log** | In-memory / Supabase `audit_logs` table (`actor_id`, `actor_role`, `action`, `entity_type`, `entity_id`, `details`, `created_at`) with CSV export. | SQLite D1 `audit` table with duration tracking (`duration_ms`), department tags, and JSON details. | **Medium** | Merge capabilities: enrich GovSync's audit table with actor role tags and CSV export. |

---

## 3. Migration Roadmap & Technical Recommendations

### Phase 2 Preparation
1. **Model Generalization:**
   Convert GovSync's `applications` schema to store generic `service_id` and JSON-based `details` rather than relying on hardcoded columns and switch statements.
2. **Component Integration:**
   Selectively port Demo's `Badges.tsx`, `Modal`, `EmptyState`, and multi-step progress bar into GovSync using GovSync's design tokens (`theme.css`).
3. **Engine Adoption:**
   Incorporate Demo's `detectConflicts` and `evaluateEligibility` into GovSync's server-side routes (`lib/server.ts`), ensuring validation occurs server-side.
4. **Preserve GovSync Strengths:**
   Under no circumstances replace GovSync's authentication, D1 SQLite database, or multi-language i18n system with Demo's prototype mocks.

