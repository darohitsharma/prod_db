# Deployment and maintenance

## 1. Keep deployment configuration private

Create or select your own Apps Script project under the account that will own it. In **Project Settings > Script Properties**, set:

| Property | Value |
| --- | --- |
| `OWNER_EMAIL` | Exact lowercase owner work email |
| `ACCESS_DOMAIN` | Approved email domain, without `@` |
| `SOURCE_A_ID` | First source spreadsheet ID |
| `SOURCE_B_ID` | Second source spreadsheet ID |

Use sources with the expected Date, Category, SKU, Product Name, Make Qty. and Receive Qty columns. Monthly tab names such as `Nov 2026` or `Nov'26` are recognized. Configure the two source labels consistently if you change the template's `Source A` and `Source B` names.

Do not place those private values in a tracked file. Do not change an existing installation's `VIEWERS`, `CONTROLLERS`, `DASHBOARD_SETTINGS` or `SNAPSHOT_*` properties unless you are intentionally administering it. The public template externalizes wiring that a private installation may have kept in its own source, so review that migration before replacing a working installation.

## 2. Push the app files

Install Node.js and Google's `@google/clasp` CLI if needed, then authenticate with the intended deployment account. Copy `.clasp.example.json` to `.clasp.json` and replace the placeholder with your own project ID. `.clasp.json` is ignored by Git.

```bash
clasp login
clasp push
```

Verify the push succeeded. The tracked `.claspignore` admits only `Code.gs`, `Index.html` and `appsscript.json`. It excludes the public demo, tests and documentation. Do not rename the authenticated UI to lowercase `index.html`, which is the public demo.

## 3. Authorize before publishing

Open the Apps Script editor as the owner. Refresh the editor after a push. Choose **authorizeSnapshotSetup** in the function dropdown and click **Run**. Review Google's requested permissions. Continue only after the execution succeeds.

The manifest requests:
- `spreadsheets`: reads the configured production sources and creates/writes a separate snapshot store. This is a broad Google permission; the source read-only boundary is enforced by code, not by that scope.
- `userinfo.email`: identifies the active viewer.
- `script.scriptapp`: manages the owner-installed clock trigger.

Deploy as a web app running as the owner, restricted to the intended Workspace domain. Named account checks in the app narrow that domain audience further. If active-user identity is blank in your deployment context, access is denied. Do not work around that by substituting the effective owner identity.

For an existing deployment, use **Deploy > Manage deployments > Edit > New version** to preserve its URL and settings. A source push alone does not update the deployed version. Never publish private owner/source settings in release notes.

## 4. Finish snapshot setup

1. Open the deployed app as its configured owner, then Control panel.
2. Click **1. Prepare snapshot storage**. This creates an empty separate spreadsheet, with no source data yet.
3. Open the actual returned spreadsheet link and its **Share** dialog.
4. Check **General access: Restricted** and that only the owner account has access. Correct any other audience before continuing.
5. Return to the app and tick the privacy confirmation. Click **2. Enable saved snapshots + 12-hour updates**.
6. Wait for success. Reload the dashboard without pressing source Refresh. Verify saved data and its actual timestamp.

The app does not request Drive permission to inspect or enforce the storage ACL. The owner must check it and keep the file Restricted later. Do not share that storage file with dashboard viewers/controllers, and do not put it in a shared folder. They use the app's account checks instead.

In Apps Script > Triggers, verify one `scheduledSnapshotRefresh_` handler. In Executions, check the first later automatic run. A configured schedule does not prove a scheduled execution has succeeded. Timing is controlled by Google and can vary.

## 5. Operate and verify

- Only Admin can refresh production sources manually. Controllers cannot call that server action.
- Normal opens read the saved snapshot. Open pages check saved-version metadata every 15 minutes and on window focus, without re-reading sources.
- The active snapshot pointer switches after staged writing and integrity verification. Source/schema/write failure keeps the old snapshot.
- Check the saved timestamp and warnings. Do not call old data live or current just because a page loaded.
- Test Admin, Controller, Viewer, blank/unknown identity and revocation with accounts you are authorized to use. Do not create test role grants in a real deployment without approval.
- Source tabs are read with display values. Missing values stay missing; formula/header changes can prevent an update. Inspect the exact Admin diagnostic before changing source data.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Setup function missing | Actual `Code.gs`, not a `.txt` sibling; save, push, then reload editor |
| Parse error at logical assignment | Apps Script may reject `??=`, `||=` or `&&=`; server code avoids them |
| No saved snapshot yet | Complete owner-only storage/privacy setup; do not repeatedly refresh |
| Null Blob content type on read | Reconstruct gzip bytes with `application/x-gzip` before `Utilities.ungzip` |
| Access unavailable | Exact configured owner/domain/role and active account; keep fail-closed behavior |
| Old version after push | Publish New version on the existing deployment |
| Stale snapshot | Inspect automatic executions/permissions/quotas and the Admin diagnostic |

## Updating an existing installation safely

Back up private source/configuration outside Git, review the diff, run tests, then push the intended files and publish a new version. Preserve project/deployment IDs, roles, snapshot store and schedule. Fixing UI or snapshot-read code does not require creating a new store or rerunning setup. Test the deployed saved read and reload before declaring success.
