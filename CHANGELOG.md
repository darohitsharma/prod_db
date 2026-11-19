# Changelog

## 2026-11-19 · Saved-snapshot dashboard

### Added
- Admin, Controller and Viewer role separation with server-side checks.
- Durable, separate snapshot storage and owner-installed 12-hour updates.
- Last-successful snapshot retention on failed updates, integrity checking and stale/failure status.
- Searchable Month, SKU and Category multi-selects, including nonconsecutive months.
- Compact column-header filters with type-aware conditions, AND/OR and sorting.
- Side-by-side summary and category SKU-yield chart; responsive stacking on mobile.
- All SKUs of a selected chart category, independent of the separate top SKU selection.
- Reusable private Script Properties configuration, synthetic demo and regression tests.
- Setup, access/storage boundaries and maintenance documentation.

### Changed
- Manual production-source refresh is Admin-only, not available to Controllers.
- Normal opens/reloads read the saved snapshot instead of production source Sheets.
- Current-month-to-date defaults now apply to chart and summary too. Manual selections remain available.
- Untouched defaults follow the current India day/month; Today remains explicitly daily.
- Theme control sits with role/navigation controls on the right.
- Public Pages is a generated-data demo, separate from any authenticated deployment.

### Fixed
- Apps Script parser compatibility: removed logical nullish assignment from server grouping.
- Snapshot decompression: explicit gzip Blob content type and filename on reconstruction.

### Verification scope
Synthetic fixtures exercise role and snapshot behavior; local rendered previews cover the UI. A deployed authorized saved-read/reload was also checked privately. This public template's private-configuration adaptation still needs its own deployment acceptance. Real role identities and a first scheduled execution must be verified by each operator. No production data or private deployment evidence is included here.

## Legacy browser-auth build

Previous commits and `5-prod_db-source.zip` contain the earlier browser-sign-in/manual-refresh app. They are retained as history, not presented as the current deployment flow. Existing history has not been rewritten or backdated.
