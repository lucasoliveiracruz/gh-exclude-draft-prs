const assert = require('node:assert/strict');
const test = require('node:test');

const {nextUrl} = require('../src/exclude-drafts.js');

const GITHUB = 'https://github.com';

test('adds the default query to a bare pull request list', () => {
	assert.equal(
		nextUrl(`${GITHUB}/owner/repo/pulls`),
		`${GITHUB}/owner/repo/pulls?q=is%3Apr+is%3Aopen+draft%3Afalse`,
	);
});

test('keeps an existing query', () => {
	assert.equal(
		nextUrl(`${GITHUB}/owner/repo/pulls?q=is%3Apr+is%3Aclosed`),
		`${GITHUB}/owner/repo/pulls?q=is%3Apr+is%3Aclosed+draft%3Afalse`,
	);
});

test('leaves an explicit draft qualifier alone', () => {
	assert.equal(nextUrl(`${GITHUB}/owner/repo/pulls?q=is%3Apr+draft%3Atrue`), null);
	assert.equal(nextUrl(`${GITHUB}/owner/repo/pulls?q=is%3Apr+is%3Adraft`), null);
	assert.equal(nextUrl(`${GITHUB}/owner/repo/pulls?q=is%3Apr+draft%3Afalse`), null);
});

test('treats an empty query as no filter rather than the default', () => {
	assert.equal(
		nextUrl(`${GITHUB}/owner/repo/pulls?q=`),
		`${GITHUB}/owner/repo/pulls?q=draft%3Afalse`,
	);
});

test('preserves unrelated parameters', () => {
	assert.equal(
		nextUrl(`${GITHUB}/owner/repo/pulls?page=2&q=is%3Apr`),
		`${GITHUB}/owner/repo/pulls?page=2&q=is%3Apr+draft%3Afalse`,
	);
});

test('accepts a trailing slash', () => {
	assert.ok(nextUrl(`${GITHUB}/owner/repo/pulls/`));
});

test('ignores everything that is not a repository pull request list', () => {
	for (const path of [
		'/owner/repo/pulls/123',
		'/owner/repo/pulls/123/files',
		'/owner/repo/issues',
		'/owner/repo',
		'/pulls',
		'/issues',
		'/notifications',
	]) {
		assert.equal(nextUrl(GITHUB + path), null, path);
	}
});

test('recognises repository pull request lists', () => {
	const {isRepoPullRequestList} = require('../src/exclude-drafts.js');
	assert.ok(isRepoPullRequestList(`${GITHUB}/owner/repo/pulls`));
	assert.ok(isRepoPullRequestList(`${GITHUB}/owner/repo/pulls?q=is%3Apr`));
	assert.ok(!isRepoPullRequestList(`${GITHUB}/owner/repo/pulls/123`));
	assert.ok(!isRepoPullRequestList(`${GITHUB}/pulls`));
});
