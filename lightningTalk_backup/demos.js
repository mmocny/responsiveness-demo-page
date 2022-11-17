import shadowQuerySelectorAll from './utils/shadowQuerySelectorAll.js';
import { markNeedsNextPaint, schedulerDotYield, schedulerDotYieldUntilNextPaint } from './schedulerDotYield.js';
import makeTasksThatTakeTime from './utils/makeTasksThatTakeTime.js'
import { benchmark, reportBenchmarkResultsToConsole } from './utils/benchmark.js';

/*** Set up ***/

reportBenchmarkResultsToConsole();

const score = document.querySelector('score-keeper');
const increment = score.shadowRoot.querySelector('button');

// This is the default implementation, gets overridden by some demos
function doSomeWorkThatTakesTime(ms) {
	const tasks = makeTasksThatTakeTime({ total: ms });
	for (let task of tasks) {
		task();
	}
}

/*** Each of these is one Page of the demo ***/

export const demos = [
	{
		title: 'Hello World',
		visible() {
		},
		hidden() {
			increment.addEventListener('click', () => {
				score.startUpdateUI();
				score.endUpdateUI();
			});

			for (let el of document.querySelectorAll('body > *:not(score-keeper):not(demo-viewer)')) {
				el.style.visibility = "hidden";
			}
		}
	},

	{
		title: 'Click Handler',
		visible() {
			// Click Handler
			increment.addEventListener('click', () => {
				score.startUpdateUI();
				score.endUpdateUI();
			});
		},
		hidden() {
		}
	},

	{
		title: 'Click + Async',
		visible() {
			// Click + Async
			increment.addEventListener('click', () => {
				score.startUpdateUI();
				setTimeout(
					() => score.endUpdateUI()
				, 1000);
			});
		},
		hidden() {
		}
	},


	{
		title: 'Async only',
		visible() {
			// Everything Async
			increment.addEventListener('click', () => {
				setTimeout(
					() => {
						score.startUpdateUI();
						score.endUpdateUI();
					}
				, 1000);
			});
		},
		hidden() {
		}
	},

	{
		title: 'Sync only',
		visible() {
			// Everything Sync again
			increment.addEventListener('click', () => {
				score.startUpdateUI();
				score.endUpdateUI();
			});
		},
		hidden() {
		}
	},

	{
		title: 'Loading-only TBT',
		visible() {
			// Page Load --> Long Task
			setTimeout(
				() => doSomeWorkThatTakesTime(3000)
			, 2000);

			increment.addEventListener('click', () => {
				score.startUpdateUI();
				score.endUpdateUI();
			});
		},
		hidden() {
		}
	},

	{
		title: 'Post-Load TBT',
		visible() {
			// Periodic Long Tasks
			setInterval(
				() => doSomeWorkThatTakesTime(1000)
			, 2000);

			increment.addEventListener('click', () => {
				score.startUpdateUI();
				score.endUpdateUI();
			});
		},
		hidden() {
		}
	},

	{
		title: 'Click',
		visible() {
			// Click -> Work
			increment.addEventListener('click', () => {
				score.startUpdateUI();
				doSomeWorkThatTakesTime(1000);
				score.endUpdateUI();
			});
		},
		hidden() {
		}
	},

	{
		title: 'Click -> setTimeout(0)',
		visible() {
			// Click -> setTimeout(0) -> Work
			increment.addEventListener('click', () => {
				score.startUpdateUI();
				setTimeout(() => {
					doSomeWorkThatTakesTime(1000);
					score.endUpdateUI();
				}, 0);
			});
		},
		hidden() {
		}
	},

	{
		title: 'Click -> setTimeout(50)',
		visible() {
			// Click -> setTimeout(50) -> Work
			increment.addEventListener('click', () => {
				score.startUpdateUI();
				setTimeout(() => {
					doSomeWorkThatTakesTime(1000);
					score.endUpdateUI();
				}, 50);
			});
		},
		hidden() {
		}
	},

	{
		title: 'Click -> requestAnimationFrame()',
		visible() {
			// Click -> requestAnimationFrame() -> Work
			increment.addEventListener('click', () => {
				score.startUpdateUI();
				requestAnimationFrame(() => {
					doSomeWorkThatTakesTime(1000);
					score.endUpdateUI();
				});
			});
		},
		hidden() {
		}
	},

	{
		title: 'Click -> "requestPostAnimationFrame()"',
		visible() {
			// Click -> requestAnimationFrame() -> setTimeout(0) -> Work
			increment.addEventListener('click', () => {
				score.startUpdateUI();
				requestAnimationFrame(() => {
					setTimeout(() => {
						doSomeWorkThatTakesTime(1000)
						score.endUpdateUI();
					} , 0);
				});
			});
		},
		hidden() {
		}
	},

	{
		title: 'Click -> requestIdleCallback()',
		visible() {
			// Click -> requestIdleCallback() -> Work
			increment.addEventListener('click', () => {
				score.startUpdateUI();
				requestIdleCallback(() => {
					doSomeWorkThatTakesTime(1000);
					score.endUpdateUI();
				});
			});
		},
		hidden() {
		}
	},

	{
		title: 'Add yield()',
		visible() {
			// Let's update to add yield() points
			async function doSomeWorkThatTakesTime(ms) {
				const tasks = makeTasksThatTakeTime({ total: ms, min: 1, max: 100 });

				for (let task of tasks) {
					await schedulerDotYield();
					task();
				}
			}

			increment.addEventListener('click', () => {
				score.startUpdateUI();
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
				score.startUpdateUI();
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
				score.startUpdateUI();
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
				score.startUpdateUI();
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
				score.startUpdateUI();
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
				score.startUpdateUI();
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
				score.startUpdateUI();
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


	{
		title: 'Benchmark: yield()',
		visible() {
			async function doSomeWorkThatTakesTime(ms) {
				const tasks = makeTasksThatTakeTime({ total: ms, min: 50, max: 250 });
				for (let task of tasks) {
					await schedulerDotYield();
					task();
				}
			}

			increment.addEventListener('click', () => {
				score.startUpdateUI();
				benchmark(
					() => doSomeWorkThatTakesTime(1000)
				);
			});
		},
		hidden() {
		}
	},

	{
		title: 'Benchmark: Frame-aware-yield',
		visible() {
			async function doSomeWorkThatTakesTime(ms) {
				const tasks = makeTasksThatTakeTime({ total: ms, min: 50, max: 250 });
				for (let task of tasks) {
					if (navigator.scheduling.isInputPending()) {
						await schedulerDotYieldUntilNextPaint();
					}
					task();
				}
			}

			increment.addEventListener('click', () => {
				score.startUpdateUI();
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
