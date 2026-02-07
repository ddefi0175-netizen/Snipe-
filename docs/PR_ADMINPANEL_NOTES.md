# PR: AdminPanel JSX fix

This PR contains a small, docs-only commit to open a pull request for the recent AdminPanel JSX fix.

Summary of changes already merged to `main`:

- Fixed truncated JSX in `Onchainweb/src/components/AdminPanel.jsx` so the project builds.
- Replaced non-exported `getAdminPermissions` usage with `getAdminByEmail` from `adminService`.
- Performed a clean install and verified `npm run build` succeeds.

This file is intentionally documentation-only to create a comfortable PR that does not affect the app runtime.

Build verification:
- `node -v`: v24.11.1
- `npm -v`: 11.6.2
- `cd Onchainweb && npm run build` completed successfully and produced `dist/`.

Requested next steps:
- Review and merge if desired, or leave changes already on `main` as-is.
