(async () => {
	const {getMode, setMode} = globalThis.GhDraftPrs;

	const inputs = [...document.querySelectorAll('input[name="mode"]')];
	const mode = await getMode();

	for (const input of inputs) {
		input.checked = input.value === mode;
		input.addEventListener('change', () => {
			if (input.checked) {
				void setMode(input.value);
			}
		});
	}
})();
