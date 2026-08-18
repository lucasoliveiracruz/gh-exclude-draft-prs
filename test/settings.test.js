const assert = require('node:assert/strict');
const test = require('node:test');

const {DEFAULT_MODE, MODES, normalizeMode, getMode} = require('../src/settings.js');

test('exposes the three modes with exclude as the default', () => {
	assert.deepEqual(MODES, ['exclude', 'collapse', 'off']);
	assert.equal(DEFAULT_MODE, 'exclude');
});

test('falls back to the default for anything unrecognised', () => {
	assert.equal(normalizeMode('collapse'), 'collapse');
	assert.equal(normalizeMode('off'), 'off');
	assert.equal(normalizeMode(undefined), DEFAULT_MODE);
	assert.equal(normalizeMode('nonsense'), DEFAULT_MODE);
});

test('reports the default when extension storage is unavailable', async () => {
	assert.equal(await getMode(), DEFAULT_MODE);
});
