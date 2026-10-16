# Cloudflare Pages preview deployment

## Prepared preview

Run `npm ci`, `npm test`, and `npm run build:preview` in this checkout. Node 22.12+ or 24+ is required. The output is `dist-preview/`. Preview mode always uses `/` as its base, omits canonical/production sharing URLs and the sitemap, and supplies noindex metadata, an X-Robots-Tag response header and disallow-all robots rules. It deliberately ignores SITE_URL even when a production value is set. It never changes the production configuration in `.env.production`.

`npm run preview:pages` serves this build locally on port 4175. Before uploading, check photos, all seasonal templates, STL/3MF exports, cancellation, reset and mobile layout. Local Vite preview does not apply Cloudflare `_headers`; test those separately or with the Pages runtime.

## Upload without replacing the live site

The owner selected a new project. Planned project name: `peggleg-lithophane`; production branch: `main`; preview branch: `preview/lithophane`. Cloudflare CLI 4.151.1 is installed in the current environment and reports no authentication. Secure requirements for CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID have been saved in environment settings; credential values are still pending. No Pages project or deployment has been created.

If using an existing Pages project, confirm its project name, account and production branch before deployment. Use a **non-production branch** such as `preview/lithophane`; never assume a project's production branch is `main`. A Direct Upload project's first deployment and dashboard drag-and-drop workflow can create a production deployment, so do not treat any upload as inherently preview-only.

For an authenticated Wrangler setup, after checking the target project's production branch, the preview deployment command is:

```sh
npx wrangler pages deploy dist-preview --project-name YOUR_VERIFIED_PROJECT --branch preview/lithophane
```

This creates an online branch preview. It must not target the project's production branch. Do not attach imgdrop.app or edit its DNS, routes or existing deployment. Preview URLs are publicly reachable unless protected. Configure Cloudflare Access for the preview hostname before sharing if restricted access is required. Noindex is an indexing preference, not access control.

Alternatively, connect the GitHub repository to Pages with a separate production branch and preview branch build configuration. Use `npm run build:preview` and `dist-preview` for preview builds only. The live `/lithophane/` build remains `npm run build` / `dist` and still needs integration into the existing imgdrop.app site.

## Remaining account work

- Identify the Cloudflare account and Pages project; verify its production branch.
- Authenticate through the account's supported secure flow; never put tokens in chat or repository files.
- Choose whether the preview needs Access protection.
- Upload as a non-production branch preview, then validate the actual hosted site, headers and downloads.

## Launch remains separate

No public production release, domain attachment, DNS edits, root robots replacement or Cloudflare account changes are authorized by preparing this preview. Frame compatibility and real print quality still await prototype testing.

## Current validation evidence

Production and preview builds pass, along with seven automated geometry/SEO tests. `npm run check:preview` verifies noindex, root asset paths, absent sitemap/canonical and the JSON-LD CSP hash. The root-hosted preview passed Chromium checks for all four detailed seasonal designs, STL downloads, reset and mobile layout. The ready-to-upload archive is `artifacts/lithophane-pages-preview.zip` (generated output, excluded from Git). No hosted Cloudflare checks have run because no account/project access is configured.

Source is available on GitHub: https://github.com/peggleg/lithophane-site/tree/preview/lithophane . The repository initially had no commits; the preview branch is now its only populated branch. Verify/set a separate production branch in Pages before enabling automatic deployments; do not let the initial Git connection implicitly publish the preview as production.


## New project setup selected by the owner

1. Create a Cloudflare API token in the Cloudflare dashboard (My Profile → API Tokens → Create Token → Custom Token). Permission: Account → Cloudflare Pages → Edit, restricted to the intended account. Account creation/deployment does not need domain/DNS edit permissions. If Cloudflare reports an additional required scope, diagnose that specific error before widening permissions.
2. Enter the token securely in this cloud environment's `CLOUDFLARE_API_TOKEN` secret field. Set the non-secret `CLOUDFLARE_ACCOUNT_ID` field to the account ID shown in the Cloudflare dashboard. Never put the token in chat, GitHub, Markdown, CLI arguments or `.env.production`.
3. Review/save the environment settings and publish the **development environment configuration** as required by the settings UI. This is separate from publishing a website. The requirement save has added `api.cloudflare.com` as an allowed secret destination; saving alone does not inject values into the running process.
4. Once the environment has the bindings, inspect project availability in that account. If `peggleg-lithophane` already exists, inspect it instead of overwriting or assuming it is ours.
5. From the repository, `npm run pages:create` creates the new Direct Upload Pages project with production branch `main`. Project creation alone uploads no website files.
6. Confirm the created project's name and production branch, then `npm run pages:deploy:preview` builds/checks the preview and deploys explicitly to `preview/lithophane`. The commands pin Wrangler to 4.151.1. A preview is online and publicly reachable unless Cloudflare Access protects it; it does not attach imgdrop.app or alter its DNS.
7. Verify the returned preview URL, noindex headers, asset loading, all seasonal designs, photo controls and both model formats. Record the project/deployment result here.

For restricted writable home directories, run CLI commands with `XDG_CONFIG_HOME=/tmp/lithophane-cloudflare-config`, `npm_config_cache=/tmp/lithophane-npm-cache` and `WRANGLER_SEND_METRICS=false`. Do not change HOME or place credentials in those temporary directories manually.

This path creates a Direct Upload project. Future releases can be uploaded through the CLI or GitHub Actions; native Pages Git integration is a separate project choice and should be verified before committing to a different workflow. No GitHub deployment secrets or automatic production publishing have been configured.
