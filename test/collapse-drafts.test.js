const assert = require('node:assert/strict');
const test = require('node:test');

const {toggleLabel} = require('../src/collapse-drafts.js');

test('labels the toggle by count and state', () => {
	assert.equal(toggleLabel(1, false), 'Show 1 draft hidden on this page');
	assert.equal(toggleLabel(4, false), 'Show 4 drafts hidden on this page');
	assert.equal(toggleLabel(4, true), 'Hide 4 drafts on this page');
});
