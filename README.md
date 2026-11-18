# Nat Habit - Analytics - Operations / Production

Read-only production dashboard with light and dark themes. No production rows, access tokens or secrets are included in this repository.

## Run in VS Code

1. Choose Code > Download ZIP, extract it and open the repository folder in VS Code.
2. Open Terminal > New Terminal and run `python3 server.py`.
3. Open http://localhost:5173/index.html and keep the terminal running. No npm install is needed.
4. Click Refresh. If asked, sign in with an authorized work account.
5. Click Refresh whenever you need the latest data. This is manual refresh, not an automatic background scheduler.
6. Stop the local server with Ctrl+C.

Use port 5173. Other origins may require an authorization configuration update. Session authorization can expire; Refresh starts sign-in again when needed. There are no Connect or Disconnect controls and sessions are not stored in the code.

## Using the dashboard

Source buttons (All, GP 44, GP-26) and DoD/MoM view buttons are beside each other in the top-right block. The main filter line is From, To, SKU and Category. Month is in the chart header. Green pulsing status means a successful live read with a valid session; red means not connected, expired or a refresh failure. The status line shows the latest production date and the last successful refresh time in India. Reduced-motion settings stop the pulsing. SKU search matches SKU only; use the Product name header for product-name searches.

- Yield is displayed as a percentage with two decimal places, including in table exports.
- The first three cards keep their selected-filter scope. The Today card uses the current India date and the selected source, category and SKU filters, independent of historical month/date filters.
- By default the daily chart and summary show today and the previous six calendar days. Select a month or From/To range to expand them. Every open and Reset selects the current month (for example Nov-26), From = month start, To = today. Cards and detail/CSV use that month-to-date range. The daily chart/summary initially keep the last 7 calendar days until From, To or Month is changed. Selecting another month updates the date range to that month.
- Every calendar date is labelled on the daily chart. Missing dates show No records, not invented zero-production rows. Today's bars use an amber accent. Scroll longer charts horizontally.
- Month labels use Nov-26 style. Internal date keys stay unchanged for correct filtering.
- Click the summary Date or Month header to open the date/month picker.
- Click any Production detail header for column filters and sorting. Text supports contains, does not contain, equals, starts with and ends with. Numeric columns support comparisons and between. Dates support on, before, after and between. Blank checks are available.
- Enter Yield filter values in percentage units: 95 means 95%. Column filters and sorting apply to the detail table and its CSV only, not the cards or summary. Clear one column or all table filters as needed.
- Quality-count diagnostics and Check flags are not in the viewer interface. Admin checks are supplied separately as private timestamped reports, not through an unprotected hidden route.

## Calculation rules

Yield is Receive divided by Make, displayed as a percentage. Weighted totals use only rows with positive Make and known non-negative Receive. Missing quantities are not zero. Make and Receive cards sum all known values independently, so their quotient can differ from valid-row weighted Yield. Values above 100% are kept, not capped. Source rows are never edited by the dashboard.

## Edit the project

Root `index.html` is the complete browser app. Edit it directly and commit changes to main to update the live site.

The modular source ZIP, when present, contains `web/`, `tests/` and `prepare_pages.py`. Edit `web/`, run `node tests/core.test.js`, then `python3 prepare_pages.py`. The generated `publish/index.html` can replace the root app. Never commit local data, saved sessions or credentials.

No paid hosting or billing is configured. Access to production data still requires an authorized account. Refresh errors keep the previous in-memory data visible with a warning rather than pretending it is fresh.
