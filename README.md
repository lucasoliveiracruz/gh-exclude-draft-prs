# GitHub: exclude draft PRs by default

Userscript that adds `draft:false` to repository pull request lists, so `/{owner}/{repo}/pulls`
opens without drafts. Runs alongside Refined GitHub, which has no equivalent feature —
`global-search-filters` was removed and re-adding it was closed as not planned.

## Install

1. Install [Violentmonkey](https://violentmonkey.github.io/) or Tampermonkey.
2. Open `github-exclude-draft-prs.user.js` in Chrome (drag it onto a tab); the manager offers to install it.

## Behavior

- Applies to repository PR lists only. `draft:false` is invalid on issue lists, and the
  React dashboard at `/pulls` does not read the `q` param the same way — use a saved view there.
- A query that already mentions `draft:`/`is:draft` is left alone, so filtering *to* drafts still works.
- Switching to the Closed tab drops the qualifier; `turbo:load` re-adds it.
- Costs one extra page load, so the unfiltered list flashes briefly. Rewriting list links
  (as Refined GitHub's `last-update-sort` does) would avoid the flash but miss direct URL hits.
