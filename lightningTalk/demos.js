import shadowQuerySelectorAll from './shadowQuerySelectorAll.js';
import yieldToMain from './schedulerDotYield.js';
import { block as keepBusy, addTasks } from './common.js';

const increment = Array.from(shadowQuerySelectorAll('score-keeper >>> button:nth-of-type(1)'))[0];
const decrement = Array.from(shadowQuerySelectorAll('score-keeper >>> button:nth-of-type(2)'))[0];

function updateUI() {}
async function maybeYieldToMain() {
	if (navigator.scheduling.isInputPending()) {
		await yieldToMain();
	}
}

export const demos = [
	{
		title: 'Hello World',
		visible() {
		},
		hidden() {
			for (let el of document.querySelectorAll('body > *:not(score-keeper):not(demo-viewer)')) {
				el.style.visibility = "hidden";
			}
		}
	},

	{
		title: 'Show Metrics',
		visible() {
		},
		hidden() {
		}
	},

	{
		title: 'Loading-only TBT',
		visible() {
			setTimeout(() => {
				// work work work
				for (let i = 0; i < 300; i++) {
					keepBusy(10);
				}
			}, 2000);
		},
		hidden() {
		}
	},

	{
		title: 'Post-Load TBT',
		visible() {
			setInterval(() => {
				// work work work
				for (let i = 0; i < 100; i++) {
					keepBusy(10);
				}
			}, 2000);
		},
		hidden() {
		}
	},

	{
		title: 'Blocking Click',
		visible() {
			increment.addEventListener('click', () => {
				updateUI();

				// Other work
				for (let i = 0; i < 100; i++) {
					keepBusy(10);
				}
			});
		},
		hidden() {
		}
	},

	{
		title: 'Fix: setTimeout(0)',
		visible() {
			increment.addEventListener('click', () => {
				updateUI();

				setTimeout(() => {
					for (let i = 0; i < 100; i++) {
						keepBusy(10);
					}
				}, 0);
			});
		},
		hidden() {
		}
	},

	{
		title: 'Fix: setTimeout(50)',
		visible() {
			increment.addEventListener('click', () => {
				updateUI();

				setTimeout(() => {
					for (let i = 0; i < 100; i++) {
						keepBusy(10);
					}
				}, 50);
			});
		},
		hidden() {
		}
	},

	{
		title: 'Fix: requestAnimationFrame()',
		visible() {
			increment.addEventListener('click', () => {
				updateUI();

				requestAnimationFrame(() => {
					for (let i = 0; i < 100; i++) {
						keepBusy(10);
					}
				});
			});
		},
		hidden() {
		}
	},

	{
		title: 'Fix: request "Post Animation Frame"',
		visible() {
			increment.addEventListener('click', () => {
				updateUI();

				requestAnimationFrame(() => {
					setTimeout(() => {
						for (let i = 0; i < 100; i++) {
							keepBusy(10);
						}
					}, 0);
				});
			});
		},
		hidden() {
		}
	},

	{
		title: 'Fix: requestIdleCallback()',
		visible() {
			increment.addEventListener('click', () => {
				updateUI();

				requestIdleCallback(() => {
					for (let i = 0; i < 100; i++) {
						keepBusy(10);
					}
				}, { timeout: 0 });
			});
		},
		hidden() {
		}
	},

	{
		title: 'Fix: requestIdleCallback() with isInputPending and yield',
		visible() {
			increment.addEventListener('click', () => {
				updateUI();

				requestIdleCallback(async () => {
					for (let i = 0; i < 100; i++) {
						keepBusy(10);
						await maybeYieldToMain();
					}
				}, { timeout: 0 });
			});
		},
		hidden() {
		}
	},

];
