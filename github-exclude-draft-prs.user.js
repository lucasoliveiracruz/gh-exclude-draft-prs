// ==UserScript==
// @name         GitHub: exclude draft PRs by default
// @namespace    locrz
// @version      1.0.0
// @description  Appends draft:false to repository pull request lists unless you asked for drafts explicitly
// @match        https://github.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

const DEFAULT_QUERY = 'is:pr is:open';
const EXPLICIT_DRAFT_QUALIFIER = /\bdraft:|\bis:draft\b/;

const isRepoPullRequestList = url => /^\/[^/]+\/[^/]+\/pulls\/?$/.test(url.pathname);

function excludeDrafts() {
	const url = new URL(location.href);
	if (!isRepoPullRequestList(url)) {
		return;
	}

	const query = url.searchParams.get('q') ?? DEFAULT_QUERY;
	if (EXPLICIT_DRAFT_QUALIFIER.test(query)) {
		return;
	}

	url.searchParams.set('q', `${query} draft:false`);
	location.replace(url);
}

excludeDrafts();
document.addEventListener('turbo:load', excludeDrafts);
