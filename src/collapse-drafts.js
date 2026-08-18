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
