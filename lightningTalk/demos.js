import shadowQuerySelectorAll from './shadowQuerySelectorAll.js';
import yieldToMain from './schedulerDotYield.js';
import { block, addTasks } from './common.js';

const increment = Array.from(shadowQuerySelectorAll('score-keeper >>> button:nth-of-type(1)'))[0];
const decrement = Array.from(shadowQuerySelectorAll('score-keeper >>> button:nth-of-type(2)'))[0];

export const demos = [
	{
		title: 'Hello World',
		visible() {
		},
		hidden() {
			for (let el of document.querySelectorAll('body > *:not(score-keeper):not(demo-viewer)')) {
				console.log(el);
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
				block(5000);
			}, 2000);
		},
		hidden() {
		}
	},

	{
		title: 'Post-Load TBT',
		visible() {
			setInterval(() => {
				block(1000);
			}, 2000);
		},
		hidden() {
		}
	},

	{
		title: 'Blocking Click',
		visible() {
			increment.addEventListener('click', () => {
				block(1000);
			});
		},
		hidden() {
		}
	},

	{
		title: 'Fix: setTimeout(0)',
		visible() {
			increment.addEventListener('click', () => {
				setTimeout(() => {
					block(1000);
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
				setTimeout(() => {
					block(1000);
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
				requestAnimationFrame(() => {
					block(1000);
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
				requestAnimationFrame(() => {
					setTimeout(() => {
						block(1000);
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
				requestIdleCallback(() => {
					block(1000);
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
				requestIdleCallback(async () => {
					for (let i = 0; i < 100; i++) {
						if (navigator.scheduling.isInputPending()) {
							await yieldToMain();
						}
						block(10);
					}
				}, { timeout: 0 });
			});
		},
		hidden() {
		}
	},

];
