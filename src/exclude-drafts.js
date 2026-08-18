(() => {
	const DEFAULT_QUERY = 'is:pr is:open';
	const EXPLICIT_DRAFT_QUALIFIER = /\bdraft:|\bis:draft\b/;
	const REPO_PULL_REQUEST_LIST = /^\/[^/]+\/[^/]+\/pulls\/?$/;

	function nextUrl(href) {
		const url = new URL(href);
		if (!REPO_PULL_REQUEST_LIST.test(url.pathname)) {
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

	function excludeDrafts() {
		const next = nextUrl(location.href);
		if (next) {
			location.replace(next);
		}
	}

	if (typeof document !== 'undefined') {
		excludeDrafts();
		document.addEventListener('turbo:load', excludeDrafts);
	}

	if (typeof module !== 'undefined') {
		module.exports = {nextUrl};
	}
})();
