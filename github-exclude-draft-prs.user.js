// ==UserScript==
// @name         GitHub: exclude draft PRs by default
// @namespace    https://github.com/lucasoliveiracruz/gh-exclude-draft-prs
// @version      1.1.1
// @description  Excludes draft pull requests from repository PR lists, or collapses them behind a toggle.
// @homepageURL  https://github.com/lucasoliveiracruz/gh-exclude-draft-prs
// @supportURL   https://github.com/lucasoliveiracruz/gh-exclude-draft-prs/issues
// @downloadURL  https://raw.githubusercontent.com/lucasoliveiracruz/gh-exclude-draft-prs/main/github-exclude-draft-prs.user.js
// @updateURL    https://raw.githubusercontent.com/lucasoliveiracruz/gh-exclude-draft-prs/main/github-exclude-draft-prs.user.js
// @match        https://github.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(() => {
	const DEFAULT_MODE = 'exclude';
	const MODES = ['exclude', 'collapse', 'off'];

	function normalizeMode(mode) {
		return MODES.includes(mode) ? mode : DEFAULT_MODE;
	}

	function hasExtensionStorage() {
		return typeof chrome !== 'undefined' && Boolean(chrome.storage?.sync);
	}

	async function getMode() {
		if (!hasExtensionStorage()) {
			return DEFAULT_MODE;
		}

		const stored = await chrome.storage.sync.get('mode');
		return normalizeMode(stored.mode);
	}

	async function setMode(mode) {
		await chrome.storage.sync.set({mode: normalizeMode(mode)});
	}

	function onModeChange(listener) {
		if (!hasExtensionStorage()) {
			return;
		}

		chrome.storage.sync.onChanged.addListener(changes => {
			if (changes.mode) {
				listener(normalizeMode(changes.mode.newValue));
			}
		});
	}

	const api = {DEFAULT_MODE, MODES, normalizeMode, getMode, setMode, onModeChange};

	if (typeof module === 'undefined') {
		globalThis.GhDraftPrs = Object.assign(globalThis.GhDraftPrs ?? {}, api);
	} else {
		module.exports = api;
	}
})();

(() => {
	const DEFAULT_QUERY = 'is:pr is:open';
	const EXPLICIT_DRAFT_QUALIFIER = /\bdraft:|\bis:draft\b/;
	const REPO_PULL_REQUEST_LIST = /^\/[^/]+\/[^/]+\/pulls\/?$/;

	function isRepoPullRequestList(href) {
		return REPO_PULL_REQUEST_LIST.test(new URL(href).pathname);
	}

	function nextUrl(href) {
		const url = new URL(href);
		if (!isRepoPullRequestList(href)) {
			return null;
		}

		const currentQuery = url.searchParams.get('q');
		const query = currentQuery === null ? DEFAULT_QUERY : currentQuery.trim();
		if (EXPLICIT_DRAFT_QUALIFIER.test(query)) {
			return null;
		}

		url.searchParams.set('q', query ? `${query} draft:false` : 'draft:false');
		return url.href === href ? null : url.href;
	}

	const api = {isRepoPullRequestList, nextUrl};

	if (typeof module === 'undefined') {
		globalThis.GhDraftPrs = Object.assign(globalThis.GhDraftPrs ?? {}, api);
	} else {
		module.exports = api;
	}
})();

(() => {
	const DRAFT_ICON = '.octicon-git-pull-request-draft';
	const ROW = '.js-issue-row, [data-testid="issue-pr-row"], [role="row"], li';
	const TOGGLE_ID = 'gh-draft-prs-toggle';
	const EXPANDED_KEY = 'gh-draft-prs:expanded';

	const TOGGLE_STYLE = [
		'display: block',
		'width: 100%',
		'padding: 8px 16px',
		'border: 0',
		'border-bottom: 1px solid var(--borderColor-default, #d1d9e0)',
		'background: var(--bgColor-muted, #f6f8fa)',
		'color: var(--fgColor-muted, #59636e)',
		'font: inherit',
		'font-size: 12px',
		'text-align: left',
		'cursor: pointer',
	].join(';');

	let observer = null;
	let scheduled = false;
	let applying = false;

	function isExpanded() {
		return sessionStorage.getItem(EXPANDED_KEY) === 'true';
	}

	function setExpanded(expanded) {
		sessionStorage.setItem(EXPANDED_KEY, String(expanded));
	}

	function draftRows() {
		const rows = new Set();
		for (const icon of document.querySelectorAll(DRAFT_ICON)) {
			const row = icon.closest(ROW);
			if (row) {
				rows.add(row);
			}
		}

		return [...rows];
	}

	function toggleLabel(count, expanded) {
		const drafts = `${count} draft${count === 1 ? '' : 's'}`;
		return expanded ? `Hide ${drafts} on this page` : `Show ${drafts} hidden on this page`;
	}

	function buildToggle() {
		const toggle = document.createElement('button');
		toggle.id = TOGGLE_ID;
		toggle.type = 'button';
		toggle.style.cssText = TOGGLE_STYLE;
		toggle.addEventListener('click', () => {
			setExpanded(!isExpanded());
			apply();
		});
		return toggle;
	}

	function apply() {
		const rows = draftRows();
		const existing = document.getElementById(TOGGLE_ID);

		if (rows.length === 0) {
			existing?.remove();
			return;
		}

		const expanded = isExpanded();
		for (const row of rows) {
			row.style.display = expanded ? '' : 'none';
		}

		applying = true;
		const toggle = existing ?? buildToggle();
		const label = toggleLabel(rows.length, expanded);
		if (toggle.textContent !== label) {
			toggle.textContent = label;
		}

		const list = rows[0].parentElement;
		if (list && toggle.parentElement !== list) {
			list.prepend(toggle);
		}

		queueMicrotask(() => {
			applying = false;
		});
	}

	function scheduleApply() {
		if (scheduled) {
			return;
		}

		scheduled = true;
		requestAnimationFrame(() => {
			scheduled = false;
			apply();
		});
	}

	function start() {
		if (observer) {
			return;
		}

		observer = new MutationObserver(() => {
			if (!applying) {
				scheduleApply();
			}
		});
		observer.observe(document.documentElement, {childList: true, subtree: true});
		scheduleApply();
	}

	function stop() {
		observer?.disconnect();
		observer = null;
		document.getElementById(TOGGLE_ID)?.remove();
		for (const row of draftRows()) {
			row.style.display = '';
		}
	}

	const api = {start, stop, toggleLabel};

	if (typeof module === 'undefined') {
		globalThis.GhDraftPrs = Object.assign(globalThis.GhDraftPrs ?? {}, api);
	} else {
		module.exports = api;
	}
})();

(() => {
	const {isRepoPullRequestList, nextUrl, getMode, onModeChange, start, stop} = globalThis.GhDraftPrs;

	async function run() {
		if (!isRepoPullRequestList(location.href)) {
			stop();
			return;
		}

		const mode = await getMode();

		if (mode === 'exclude') {
			stop();
			const next = nextUrl(location.href);
			if (next) {
				location.replace(next);
			}

			return;
		}

		if (mode === 'collapse') {
			start();
			return;
		}

		stop();
	}

	void run();
	document.addEventListener('turbo:load', run);
	onModeChange(run);
})();
