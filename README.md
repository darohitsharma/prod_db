# prod_db - Production yield dashboard

Live site: use the GitHub Pages link in this repository's deployment/Pages settings. Public UI and generic code only. No production records, Google tokens or client secrets are stored in this repository.

## Run this GitHub download in VS Code

1. Click Code > Download ZIP. Extract it and open the extracted repository folder in VS Code.
2. Terminal > New Terminal: run `python3 server.py`.
3. The browser opens http://localhost:5173/index.html . Keep the terminal running. No npm install is needed.
4. Click Connect Google. Choose your work account with access to both private source Sheets, then approve read-only Google Sheets access. Google may ask for its normal verification code.
5. Click Refresh from Sheets after the data changes. This is manual refresh, the same as the original GitHub Pages dashboard. No background scheduler is configured.
6. Ctrl+C stops the local server. If Python 3 is missing, install it from python.org, then reopen VS Code.

The public GitHub download has NO saved company data. The separate owner-only work Drive ZIP includes the optional checked snapshot. Do not upload that ZIP/data folder to this repository. Localhost:5173 was verified to reach normal Google OAuth sign-in with the existing client. Other ports may need their origin added in the Google Cloud client settings. No client secret is needed.

## Edit the project

The root index.html is a readable self-contained HTML/CSS/JS app. You can edit it directly in VS Code and commit/push it; Pages deploys from main / (root). server.py is local-only and is not run by GitHub Pages.

For modular source, download/unzip prod_db-source.zip. Open its prod_db folder. It includes web/, tests/, prepare_pages.py and a longer step-by-step README. No data is included. Edit web/, run `node tests/core.test.js` if Node is installed, then `python3 prepare_pages.py`. Replace this repository's root index.html with the newly generated publish/index.html and commit/push. Do not replace other repositories.

## What it does

Green/neutral light and dark themes. All / GP 44 / GP-26 source filter, DoD day-wise or MoM month-wise grouping, All/month selector, inclusive From-To dates, category filter and SKU/product search. Trend chart, summary and full detail table, paginated rows and filtered CSV.

Yield = Receive / Make, displayed as a ratio to two decimals (0.97 = 97%). Weighted totals use only records with positive Make and known non-negative Receive. Missing Receive is not zero; incomplete counts stay visible. Values over 1.00 are flagged, not capped. Only monthly production tabs are read. Pending and old daily tabs are excluded to avoid overlap. Row dates, not tab names, control date filtering.

## Privacy and live data

Sheet IDs and the browser OAuth client ID are visible identifiers, not passwords. Google tokens are held only in tab memory; reload clears them. Private row access requires Google consent and an account that can read the Sheets. The public page itself is visible to anyone, but it embeds no data. Sign-in hints are not access controls. Never make source Sheets link-viewable as a shortcut.

New monthly tabs are discovered on Refresh. Google session expiry requires reconnecting. A failed refresh retains the previous in-memory dataset and shows the failure. Data is read directly from Google, never through GitHub or a paid backend. Publishing code does not refresh Sheet data for an open session.

If origin_mismatch appears, use localhost:5173 or add the exact scheme/host/port to the existing OAuth web client. If Google returns 403, check both source Sheet permissions, Google Sheets API enablement and Workspace policy. No billing or paid service should be enabled.
