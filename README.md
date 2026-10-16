# Justice Clock — Bangladesh

> A modern, real-time justice information dashboard and tracking platform for Bangladesh's legal system, built with verified judicial data sources, automated news discovery, and source transparency.

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue)](#)
[![Tests](https://img.shields.io/badge/tests-18%20passed-success)](#)
[![License](https://img.shields.io/badge/license-MIT-informational)](#)

---

## Table of Contents
1. [Overview & Mission](#overview--mission)
2. [Verified Data Sources](#verified-data-sources)
3. [Real-Time Data Architecture](#real-time-data-architecture)
4. [Dashboard Features](#dashboard-features)
5. [Data Integrity & Clearance Rate Policy](#data-integrity--clearance-rate-policy)
6. [Security & Access Controls](#security--access-controls)
7. [Installation & Local Setup](#installation--local-setup)
8. [Testing & Verification](#testing--verification)
9. [API Reference](#api-reference)

---

## 1. Overview & Mission

**Justice Clock — Bangladesh** provides public-interest transparency into the caseload dynamics, backlog progression, and disposal velocities of Bangladesh's judiciary.

Unlike conventional static mockups, this platform connects to genuine public disclosures from the higher judiciary, subordinate district courts, and verified national media to present an honest, mathematically sound picture of judicial time elapsed.

---

## 2. Verified Data Sources

Every statistic on the dashboard is grounded in official public publications:

| Source Name | Authoritative Body | Coverage & Exact Fields Provided | Update Frequency | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Supreme Court PR & Administration** | Supreme Court of Bangladesh | Cases filed (`83,746`), disposed (`98,732`), net backlog reduction (`+14,986`), clearance rate (`117.89%`), division-wise breakdown (Appellate: `9,139` filed, `11,136` disposed; High Court: `74,607` filed, `87,596` disposed). | Periodic official bulletins (Latest: Jan 1 – Aug 31, 2026 drive) | Verified / Current |
| **Ministry of Law, Justice & Parliamentary Affairs** | Jatiya Sangsad (Parliament Disclosures) | Nationwide total pending (`4,639,476`), subordinate courts backlog (`4,078,432`), civil/criminal split (`1,690,443` civil, `2,387,989` criminal), annual subordinate disposals (`275,084`). | Official parliamentary sessions & annual gazettes | Periodic Gazette |
| **Judiciary Portal Bangladesh** | Supreme Court & Law Ministry | District court structures across 64 districts, active tribunals (Nari-O-Shishu, Cyber, Labour), cause list links. | Live public services portal | Active |
| **BD Laws Portal** | Legislative & Parliamentary Affairs Division | Codified laws (CrPC, CPC, Penal Code, Special Powers Act, Digital Security Act / Cyber Security Act). | Continuous statutory repository | Active |
| **National Media Feeds** | The Daily Star, Prothom Alo, Dhaka Tribune | Live RSS news headlines, publication timestamps, excerpts, and original article links covering crime and court rulings. | Ingested every 15–30 minutes | Live Stream |

---

## 3. Real-Time Data Architecture

The architecture builds on Express, Vite, React 19, and TypeScript with a clean server-side caching and verification layer:

```
┌─────────────────────────────────────────────────────────────┐
│                       Browser Client                        │
│   (React 19 + TypeScript + Tailwind CSS + Lucide Icons)     │
└──────────────┬───────────────────────────────▲──────────────┘
               │ Polling / Auto-refresh        │ JSON API
               ▼                               │
┌──────────────────────────────────────────────┴──────────────┐
│                    Express Backend Server                   │
│   - In-memory Caching Layer (TTL 15–30 mins)                │
│   - Request Timeouts (8000ms AbortController)               │
│   - Rate-Limited Admin Refresh (/api/judicial-stats/refresh)│
│   - SSRF Protection (isSafePublicUrl Validator)             │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
       HTTP/RSS Ingestion              Background Health Probes
               ▼                               ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│   Verified News Feeds        │ │  Official Judicial Portals │
│ - The Daily Star             │ │ - Supreme Court of BD      │
│ - Prothom Alo (EN & BN)      │ │ - Judiciary.gov.bd         │
│ - Dhaka Tribune              │ │ - bdlaws.minlaw.gov.bd     │
└──────────────────────────────┘ └────────────────────────────┘
```

- **Server-Side Caching:** In-memory cache protects external government and media servers from repeated queries while serving fast responses to users.
- **Graceful Fallback:** If an external server experiences temporary downtime, the backend preserves the last verified dataset, labels it as `delayed` or `stale`, and shows the exact timestamp.
- **No Fabricated Real-Time Effects:** No simulated ticking numbers or random generator scripts are used for judicial case counts.

---

## 4. Dashboard Features

- **National Judicial Metric Cards:** View total pending caseloads nationwide (`4.64M`), lower court backlogs, and the 2026 Supreme Court drive metrics (`98,732` disposals, `117.89%` clearance rate).
- **Perspective Switcher:** Seamlessly toggle between Supreme Court 2026 Drive, National Backlog Overview, and Firestore Published Timelines.
- **Court Hierarchy & Division Breakdown:** Interactive inspection of all 8 administrative divisions (Dhaka, Chattogram, Rajshahi, Khulna, Sylhet, Rangpur, Barishal, Mymensingh) with their regional court densities and specialized tribunals.
- **Historical Dynamics (2023–2026):** Year-by-year trajectory for Appellate and High Court divisions showing the impact of special benches and backlog resolution drives.
- **Live Judicial Media Stream:** Curated news articles from *The Daily Star*, *Prothom Alo*, and *Dhaka Tribune* with direct links to original stories.
- **Data Transparency Section:** Visible cards detailing source names, reporting dates, last health probe status, and links to official portals.
- **Asia/Dhaka Live Digital Clock:** Local time in BST (`UTC+06:00`).
- **Bilingual Interface:** Full English and Bengali (`বাংলা`) localization.

---

## 5. Data Integrity & Clearance Rate Policy

1. **Clearance Rate Formula:**
   $$\text{Clearance Rate} = \left(\frac{\text{Cases Disposed}}{\text{New Cases Filed}}\right) \times 100$$
   - A rate **$> 100\%$** indicates that the court disposed of more cases than were filed during the period, successfully reducing its pending backlog.
   - A rate **$< 100\%$** indicates that filings exceeded disposals, increasing the backlog.
   - **Strict Compatibility Rule:** Clearance rates are calculated **only** when numerator (disposals) and denominator (filings) share identical reporting periods and court tiers.
2. **Zero Fabrication Guarantee:** No judicial figures are simulated, interpolated, or guessed. If official numbers are pending gazette release, that status is transparently reported.
3. **Segregated AI Analysis:** AI summaries (Gemini) are strictly restricted to the administrative lead review queue and are never published as official facts or court verdicts.

---

## 6. Security & Access Controls

- **SSRF Protection:** Custom URL validation blocks attempts to add internal/loopback IP addresses (`localhost`, `127.0.0.1`, `10.x`, `192.168.x`, `169.254.x`) or unauthorized protocols.
- **Rate-Limiting:** Public refresh endpoints include a 30-second cooldown per client to prevent denial-of-service against upstream sources.
- **Zero-Trust Firestore Rules:** Strict Attribute-Based Access Control (ABAC) prevents unauthorized public writes while permitting public reads for published records and private submissions for correction requests.
- **Secret Hygiene:** All API keys (`GEMINI_API_KEY`) reside exclusively in server-side environment variables and are never transmitted to client browsers.

---

## 7. Installation & Local Setup

### Prerequisites
- [Bun](https://bun.sh/) (recommended, v1.2+) or Node.js (v20+)
- Git

### Quickstart

```bash
# 1. Clone the repository
git clone https://github.com/nahianalmubin2006-oss/justice-clock.git
cd justice-clock

# 2. Install dependencies
bun install
# (or: npm install)

# 3. Configure environment variables
cp .env.example .env
# Edit .env and supply your GEMINI_API_KEY (optional for basic viewing)

# 4. Run development server
bun run dev
# (or: npm run dev)

# App will be accessible at http://localhost:3000
```

---

## 8. Testing & Verification

The project includes an automated test suite verifying data normalization, clearance rate mathematics, source transparency, and media parsing:

```bash
# Run unit test suite
bun test

# Run TypeScript typecheck
bun run lint

# Run production build
bun run build
```

---

## 9. API Reference

### Public Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check, server uptime, and configuration status. |
| `GET` | `/api/judicial-stats` | Normalized judicial summary, court caseloads, division breakdowns, and historical trends. |
| `GET` | `/api/judicial-stats/sources` | Live probe status of official data sources. |
| `POST` | `/api/judicial-stats/refresh` | Rate-limited trigger to re-check source statuses and refresh cached news. |
| `GET` | `/api/news/public` | Cached judicial news articles from verified national media. |
| `POST` | `/api/corrections` | Submit a public correction or removal request to the review queue. |

### Administrative Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/news/discover` | Automated discovery querying news feeds and generating Gemini structured leads. |
| `GET` | `/api/news/sources` | Registry of configured media feeds. |
| `POST` | `/api/news/test-feed` | Test and validate a new RSS feed URL (with SSRF protection). |
| `POST` | `/api/admin/bootstrap` | Role and permission verification for authorized administrators. |

---

## License
MIT © 2026 Justice Clock Bangladesh