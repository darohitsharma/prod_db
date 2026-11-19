# Production Yield Dashboard

A production analytics dashboard with weighted yield, multi-select filters and role-based access. Built with Google Apps Script and plain JavaScript. Production source spreadsheets are read-only.

[Try the sample-data demo](https://darohitsharma.github.io/prod_db/) · [Setup guide](SETUP.md) · [Security boundaries](SECURITY.md) · [Changes](CHANGELOG.md)

> The public demo uses generated sample rows only. It has no production connection. The authenticated Apps Script app is a separate deployment, with private configuration held outside this repository.

## What it does

- **Month-to-date by default.** Current month in India time across cards, production chart and summary. Manual dates and nonconsecutive month selections remain available.
- **Explore without changing records.** Searchable Month, SKU and Category multi-selects. Compact table-header filters, sorting, text/number/date rules, blanks and two conditions joined by AND/OR.
- **See category performance.** Day-wise or month-wise summary beside a category chart containing all its SKUs. A separate top-level SKU selection does not hide the other SKUs in that chart.
- **Separate responsibilities.** Admin manages controllers, viewers and source refresh. Controllers manage viewers and shared dashboard defaults. Viewers can filter and export.
- **Read a saved snapshot.** Normal page loads read the last successful snapshot, not the production source spreadsheets. An owner-installed trigger updates it every 12 hours. A failed update keeps the previous snapshot and shows its age/status.
- **Use it on desktop or mobile.** Light/dark themes, responsive panels, keyboard-accessible controls and reduced-motion support.

## Preview locally

Requires Python 3. No packages, account or credentials are needed for the demo.

```bash
python3 server.py
```

Open **http://localhost:5173**. This serves `index.html`, the synthetic interactive demo, on localhost only. It does not run the Apps Script backend.

## Deploy an authenticated app

Use [SETUP.md](SETUP.md) for the full owner setup, privacy check and deployment steps. Requires a Google Workspace account and read access to the source spreadsheets. Organization policy and Google quotas apply.

Public source files are templates, not a backup of any private deployment. Existing installations must preserve their own project ID, owner/source settings, roles, snapshot storage and trigger. Do not overwrite a working private installation blindly.

## Project map

| File | Purpose |
| --- | --- |
| `Code.gs` | Server-side access, source reads, snapshot lifecycle and trigger |
| `Index.html` | Authenticated dashboard UI and calculations |
| `appsscript.json` | Apps Script runtime and explicit scopes |
| `.clasp.example.json` | Placeholder project mapping, copy locally only |
| `.claspignore` | Upload only the three app files, not the public demo |
| `index.html` | Public interactive demo, generated sample data only |
| `server.py` | Dependency-free localhost demo server |
| `test.cjs` | Synthetic backend and snapshot regression tests |
| `SETUP.md` | Deployment, private configuration and troubleshooting |
| `SECURITY.md` | Access, storage, disclosure and operational limits |
| `CHANGELOG.md` | Current features and compatibility corrections |

The differently cased `Index.html` and `index.html` have different purposes. Keep their names exactly as shown. `.claspignore` prevents the public demo from being deployed as the authenticated app.

The previously tracked `5-prod_db-source.zip` is a **legacy browser-auth build**, retained for history. It is not the current Apps Script source. Use the editable source files above for new work.

## Calculations

For rows with positive Make and known non-negative Receive:

```text
yield = sum(Receive) / sum(Make)
```

Display as a percentage to two decimals. Missing quantities stay missing. Make and Receive cards sum known values independently, so their quotient can differ from valid-row weighted yield. Values above 100% are not capped. DoD means day-wise; MoM means month-wise, not growth versus the previous period. Only recognized monthly tabs are read; row dates determine the period.

The Today card is explicitly daily and independent of the historical date range. Detail-column filters affect detail/CSV; summary-column filters affect the summary. Top-level filters affect the dashboard, with the documented all-SKU category-chart exception.

## Check changes

Requires Node.js 18 or newer. No npm dependencies.

```bash
node test.cjs
```

Tests use synthetic rows and service mocks. They cover access denial/revocation, admin-only refresh, snapshot creation, trigger deduplication, no source reads on snapshot loads, failed-update retention, integrity checks and concurrent-refresh protection. A mock pass is not proof of Apps Script compatibility: also check push, authorization, deployed page load/reload and scheduled execution on a test deployment before promoting a change.

## Operational limits

A page still needs authentication and a short saved-data load. This is not offline access or instant rendering. Trigger timing can vary; quotas and failures can delay an update. The page shows the saved timestamp, stale state and recorded failures instead of claiming continuous real-time freshness. See [SECURITY.md](SECURITY.md) before storing or sharing any real data.
