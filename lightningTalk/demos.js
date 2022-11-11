import shadowQuerySelectorAll from './shadowQuerySelectorAll.js';
import { markNeedsNextPaint, schedulerDotYield, schedulerDotYieldUntilNextPaint } from './schedulerDotYield.js';
import { block as keepBusy, addTasks } from './common.js';
import { benchmark, reportBenchmarkResultsToConsole } from './benchmark.js';

reportBenchmarkResultsToConsole();

const increment = Array.from(shadowQuerySelectorAll('score-keeper >>> button:nth-of-type(1)'))[0];
const decrement = Array.from(shadowQuerySelectorAll('score-keeper >>> button:nth-of-type(2)'))[0];

function updateUI() { }

function makeTasksThatTakeTime(args = {}) {
	const { total, min, max } = {
		total: 3000,
		min: 10,
		max: 100,
		...args
	}

	function getRandomRange(min, max) {
		const range = max - min;
		// Linear
		// const ease = (x) => x;
		// Cubic
		// const ease = (x) => x * x * x;
		// Quint
		const ease = (x) => x * x * x * x * x;

		const num = ease(Math.random()) * range;
		return min + num;
	}

	const tasks = [];

	let remainder = total;
	while (remainder > 0) {
		const ms = Math.min(remainder, getRandomRange(min, max));
		tasks.push(() => keepBusy(ms));
		remainder -= ms;
	}

	return tasks;
}

function doSomeWorkThatTakesTime(ms) {
	const tasks = makeTasksThatTakeTime({ total: ms });
	for (let task of tasks) {
		task();
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
			setTimeout(
				() => doSomeWorkThatTakesTime(3000)
				, 2000);
		},
		hidden() {
		}
	},

	{
		title: 'Post-Load TBT',
		visible() {
			setInterval(
				() => doSomeWorkThatTakesTime(1000)
				, 2000);
		},
		hidden() {
		}
	},

	{
		title: 'Click',
		visible() {
			increment.addEventListener('click', () => {
				updateUI();
				doSomeWorkThatTakesTime(1000);
			});
		},
		hidden() {
		}
	},

	{
		title: 'Click -> setTimeout(0)',
		visible() {
			increment.addEventListener('click', () => {
				updateUI();
				setTimeout(
					() => doSomeWorkThatTakesTime(1000)
					, 0);
			});
		},
		hidden() {
		}
	},

	{
		title: 'Click -> setTimeout(50)',
		visible() {
			increment.addEventListener('click', () => {
				updateUI();
				setTimeout(
					() => doSomeWorkThatTakesTime(1000)
					, 50);
			});
		},
		hidden() {
		}
	},

	{
		title: 'Click -> requestAnimationFrame()',
		visible() {
			increment.addEventListener('click', () => {
				updateUI();
				requestAnimationFrame(
					() => doSomeWorkThatTakesTime(1000)
				);
			});
		},
		hidden() {
		}
	},

	{
		title: 'Click -> "requestPostAnimationFrame()"',
		visible() {
			increment.addEventListener('click', () => {
				updateUI();
				requestAnimationFrame(() => {
					setTimeout(
						() => doSomeWorkThatTakesTime(1000)
						, 0);
				});
			});
		},
		hidden() {
		}
	},

	{
		title: 'Click -> requestIdleCallback()',
		visible() {
			increment.addEventListener('click', () => {
				updateUI();
				requestIdleCallback(
					() => doSomeWorkThatTakesTime(1000)
				);
			});
		},
		hidden() {
		}
	},

	{
		title: 'Add yield()',
		visible() {
			async function doSomeWorkThatTakesTime(ms) {
				const tasks = makeTasksThatTakeTime({ total: ms, min: 1, max: 100 });

				for (let task of tasks) {
					await schedulerDotYield();
					task();
				}
			}

			increment.addEventListener('click', () => {
				updateUI();
				requestIdleCallback(
					() => doSomeWorkThatTakesTime(1000)
				);
			});
		},
		hidden() {
		}
	},

	{
		title: 'Remove requestIdleCallback()',
		visible() {
			async function doSomeWorkThatTakesTime(ms) {
				const tasks = makeTasksThatTakeTime({ total: ms });
				for (let task of tasks) {
					await schedulerDotYield();
					task();
				}
			}

			increment.addEventListener('click', () => {
				updateUI();
				doSomeWorkThatTakesTime(1000);
			});
		},
		hidden() {
		}
	},

	{
		title: 'Benchmark yield()',
		visible() {
			async function doSomeWorkThatTakesTime(ms) {
				const tasks = makeTasksThatTakeTime({ total: ms });
				for (let task of tasks) {
					await schedulerDotYield();
					task();
				}
			}

			increment.addEventListener('click', () => {
				updateUI();
				benchmark(
					() => doSomeWorkThatTakesTime(1000)
				);
			});
		},
		hidden() {
		}
	},

	{
		title: 'Benchmark without yield()',
		visible() {
			async function doSomeWorkThatTakesTime(ms) {
				const tasks = makeTasksThatTakeTime({ total: ms });
				for (let task of tasks) {
					task();
				}
			}

			increment.addEventListener('click', () => {
				updateUI();
				benchmark(
					() => doSomeWorkThatTakesTime(1000)
				);
			});
		},
		hidden() {
		}
	},

	{
		title: 'Add isInputPending()',
		visible() {
			async function doSomeWorkThatTakesTime(ms) {
				const tasks = makeTasksThatTakeTime({ total: ms });
				for (let task of tasks) {
					if (navigator.scheduling.isInputPending()) {
						await schedulerDotYield();
					}
					task();
				}
			}

			increment.addEventListener('click', () => {
				updateUI();
				benchmark(
					() => doSomeWorkThatTakesTime(1000)
				);
			});
		},
		hidden() {
		}
	},

	{
		title: 'isInputPending() + requestIdleCallback()',
		visible() {
			async function doSomeWorkThatTakesTime(ms) {
				const tasks = makeTasksThatTakeTime({ total: ms });
				for (let task of tasks) {
					if (navigator.scheduling.isInputPending()) {
						await schedulerDotYield();
					}
					task();
				}
			}

			increment.addEventListener('click', () => {
				updateUI();
				requestIdleCallback(
					() => benchmark(
						() => doSomeWorkThatTakesTime(1000)
					)
				);
			});
		},
		hidden() {
		}
	},

	{
		title: ' Frame aware yield if isInputPending',
		visible() {
			async function doSomeWorkThatTakesTime(ms) {
				const tasks = makeTasksThatTakeTime({ total: ms });
				for (let task of tasks) {
					if (navigator.scheduling.isInputPending()) {
						await schedulerDotYieldUntilNextPaint();
					}
					task();
				}
			}

			increment.addEventListener('click', () => {
				updateUI();
				markNeedsNextPaint();
				requestIdleCallback(
					() => benchmark(
						() => doSomeWorkThatTakesTime(1000)
					)
				);
			});
		},
		hidden() {
		}
	},

];
