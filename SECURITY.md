# Security and data boundaries

## Public repository

This repository contains reusable code and a generated-data demo. Never commit real production rows, exports, live dashboard screenshots, source/store spreadsheet IDs, private project/deployment URLs, account lists, credentials, tokens or session files. The public source reads private wiring from Script Properties. `.gitignore` is a guardrail, not a substitute for reviewing a staged diff.

The older tracked source ZIP is a historical browser-auth implementation, not the current deployment package. Do not use public Git history to keep private data, even after deleting it from the latest commit.

## Identity and roles

Every public server read or mutation checks the active account. Blank or unknown identities are denied. There is no effective-user identity fallback. Browser button visibility is not authorization; privileged server actions enforce their own role checks.

| Action | Admin | Controller | Viewer |
| --- | --- | --- | --- |
| Read saved dashboard, filter, export | Yes | Yes | Yes |
| Manage viewers and shared source/view defaults | Yes | Yes | No |
| Add or remove controllers | Yes | No | No |
| Manually refresh production sources | Yes | No | No |
| Configure snapshot storage/schedule | Yes | No | No |
| Change app code or deployment through dashboard | No | No | No |

An owner-executed Workspace web app is required for the intended model. Account/domain policy can affect active-user identity. Test with real authorized accounts before relying on a deployment's access boundary. Anyone given direct editor access to the Apps Script project has a different, much more powerful level of control. Do not give it to ordinary viewers/controllers.

## Storage

Production sources are only read. Snapshot writes use a separate spreadsheet; configured source IDs are rejected as storage targets. Initial storage is empty until the owner confirms Restricted/owner-only sharing. This privacy check is manual, not a continuous ACL audit. Keep that file unshared and outside shared folders.

Snapshot content is compressed and Base64-encoded for storage. **Encoding and compression are not encryption.** Spreadsheet access is the confidentiality boundary. Dashboard users receive authorized data in their browser and can export it; revocation cannot erase a copy they already received.

A staged write and digest check precede replacement of the active pointer. Failure retains the last successful snapshot. Integrity checks detect accidental corruption, not malicious edits by someone with project/storage access. Script locks coordinate readers/commits; normal saved reads do not trigger source refreshes.

## Browser and freshness

The demo never connects to production. The authenticated app stores the theme preference locally, not a persistent copy of production data. Data loaded into an authorized browser is still accessible to that user and browser extensions they run. Use trusted devices.

A page requires an authenticated server read and has a short loading state. Automatic updates are scheduled every 12 hours, not guaranteed at exact wall-clock times. Google quotas, permission changes or source errors can delay updates. Monitor displayed as-of timestamps and execution history.

## Reporting a problem

Do not open a public issue containing production data, credentials, private links or account lists. Contact the repository owner through an already verified private channel. Share only the minimal sanitized error and reproduction steps in a public discussion.
