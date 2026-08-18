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
