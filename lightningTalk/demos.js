import shadowQuerySelectorAll from './shadowQuerySelectorAll.js';
import yieldTask from './schedulerDotYield.js';
import { block, addTasks } from './common.js';

const increment = Array.from(shadowQuerySelectorAll('score-keeper >>> button:nth-of-type(1)'))[0];
const decrement = Array.from(shadowQuerySelectorAll('score-keeper >>> button:nth-of-type(2)'))[0];

export const demos = [
	{
		title: 'Baseline Demo',
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
			}, 1000);
		},
		hidden() {
		}
	},

	{
		title: 'Periodic blocking',
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
		title: 'Fix: requestPostAnimationFrame()',
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
							await yieldTask();
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
