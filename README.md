# GitHub: exclude draft PRs by default

Adds `draft:false` to repository pull request lists, so `/{owner}/{repo}/pulls` opens without
drafts. Ships as a Chrome extension and as a userscript built from the same source.

Refined GitHub has no equivalent: `global-search-filters` was removed in
[#6248](https://github.com/refined-github/refined-github/pull/6248) and re-adding it was
[closed as not planned](https://github.com/refined-github/refined-github/issues/7658). This runs
alongside it.

## Install as an extension

1. Open `chrome://extensions` and turn on Developer mode.
2. Load unpacked, and pick this directory.

## Install as a userscript

1. Install [Violentmonkey](https://violentmonkey.github.io/) or Tampermonkey.
2. Drag `github-exclude-draft-prs.user.js` onto a Chrome tab.

## Behavior

- Applies to repository PR lists only. `draft:false` is invalid on issue lists, and the React
  dashboard at `/pulls` does not read the `q` param the same way — use a saved view there.
- A query already mentioning `draft:`/`is:draft` is left alone, so filtering *to* drafts still works.
- An empty `q` stays unfiltered apart from `draft:false`; only a missing `q` gets the
  `is:pr is:open` default GitHub would have applied.
- Switching to the Closed tab drops the qualifier and `turbo:load` re-adds it.
- Redirecting costs one extra request. It runs at `document_start`, so it normally lands before
  first paint. Rewriting list links (as Refined GitHub's `last-update-sort` does) would avoid the
  request but miss direct URL hits.

## Development

`src/exclude-drafts.js` is the source of truth for both targets. `manifest.json` loads it directly;
the userscript is generated from it.

```sh
npm test      # node --test, covers nextUrl()
npm run build # regenerate github-exclude-draft-prs.user.js from src + manifest
```

Bump the version in `manifest.json` and rebuild; the userscript header derives from it.
