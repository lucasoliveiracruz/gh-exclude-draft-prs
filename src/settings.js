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
