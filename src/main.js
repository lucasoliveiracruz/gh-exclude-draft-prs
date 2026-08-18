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
