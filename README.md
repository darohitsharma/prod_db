# Nat Habit - Analytics - Operations / Production

Read-only production dashboard with light and dark themes. No production rows, access tokens or secrets are included in this repository.

## Run in VS Code

1. Choose Code > Download ZIP, extract it and open the repository folder in VS Code.
2. Open Terminal > New Terminal and run `python3 server.py`.
3. Open http://localhost:5173/web/ and keep the terminal running. No npm install is needed.
4. Click Refresh. If asked, sign in with an authorized work account.
5. Click Refresh whenever you need the latest data. This is manual refresh, not an automatic background scheduler. Refresh shows only "Updating..." and first tries Google's quiet mode (prompt none, hinted to the signed-in work account), so an already-authorised session needs no approval screen. If Google truly requires it (first use or expired session) the status reads "Update paused" and the next Refresh click opens Google's own sign-in/approval window.
6. Stop the local server with Ctrl+C.

Use port 5173. Other origins may require an authorization configuration update. Session authorization can expire; Refresh starts sign-in again when needed. There are no Connect or Disconnect controls and sessions are not stored in the code.

## Using the dashboard

Source buttons (All, GP 44, GP-26) and DoD/MoM view buttons are beside each other in the top-right block. The main filter line is From, To, SKU and Category. Month is in the chart header. Green pulsing status means a successful live read with a valid session; red means not connected, expired or a refresh failure. The status line shows the latest production date and the last successful refresh time in India. Reduced-motion settings stop the pulsing. SKU search matches SKU only; use the Product name header for product-name searches.

- Yield is displayed as a percentage with two decimal places, including in table exports.
- The first three cards keep their selected-filter scope. The Today card uses the current India date and the selected source, category and SKU filters, independent of historical month/date filters.
- By default the daily chart and summary show today and the previous six calendar days. Select a month or From/To range to expand them. Every open and Reset selects the current month (for example Nov-26), From = month start, To = today. Cards and detail/CSV use that month-to-date range. The daily chart/summary initially keep the last 7 calendar days until From, To or Month is changed. Selecting another month updates the date range to that month.
- The day-wise summary lists newest first (today, yesterday, and so on). Today's row has a light green background that gently blinks; reduced-motion settings keep it static. The detail table also defaults to newest date first, and its header sort still works. The chart stays oldest to newest.
- The status line (green pulsing dot, "Data as of ... refreshed ...") is in the top-left area. Dark mode is a pure black, white and grey theme with no green tint; light mode stays green. In dark mode the today row blinks between two greys with an amber edge.
- Every calendar date is labelled on the daily chart. Missing dates show No records, not invented zero-production rows. Today's bars use an amber accent. Scroll longer charts horizontally.
- Month labels use Nov-26 style. Internal date keys stay unchanged for correct filtering.
- Click the summary Date or Month header to open the date/month picker.
- Click any Production detail header for column filters and sorting. Text supports contains, does not contain, equals, starts with and ends with. Numeric columns support comparisons and between. Dates support on, before, after and between. Blank checks are available.
- Enter Yield filter values in percentage units: 95 means 95%. Column filters and sorting apply to the detail table and its CSV only, not the cards or summary. Clear one column or all table filters as needed.
- Quality-count diagnostics and Check flags are not in the viewer interface. Admin checks are supplied separately as private timestamped reports, not through an unprotected hidden route.

## Calculation rules

These notes are no longer shown in the dashboard page; they live here only.

Totals use summed Receive divided by summed Make for rows with positive Make and a known, non-negative Receive. Yield is shown to 2 decimal places (0.97 = 97.00%). Only monthly production tabs are included; pending reports and old daily tabs are excluded to avoid overlap. Row dates control the period, even when they differ from a tab's month. Values above 100.00% are kept and flagged; source data is never edited. DoD means day-wise and MoM means month-wise, not previous-period growth. Coverage: monthly tabs from Aug 2026 onward; new month tabs are found on refresh. The dashboard is read-only, uses manual Refresh and has no automatic refresh.

Yield is Receive divided by Make, displayed as a percentage. Weighted totals use only rows with positive Make and known non-negative Receive. Missing quantities are not zero. Make and Receive cards sum all known values independently, so their quotient can differ from valid-row weighted Yield. Values above 100% are kept, not capped. Source rows are never edited by the dashboard.

## Edit the project

Root `index.html` is the complete browser app. Edit it directly and commit changes to main to update the live site.

The modular source ZIP, when present, contains `web/`, `tests/` and `prepare_pages.py`. Edit `web/`, run `node tests/core.test.js`, then `python3 prepare_pages.py`. The generated `publish/index.html` can replace the root app. Never commit local data, saved sessions or credentials.

No paid hosting or billing is configured. Access to production data still requires an authorized account. Refresh errors keep the previous in-memory data visible with a warning rather than pretending it is fresh.
