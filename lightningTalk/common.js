/*
 * Keep the main thread busy doing... nothing.
 */
export function block(ms) {
	const target = performance.now() + ms;
	console.group(`Inside block(${ms})`);
	console.log('Starting to block');

	while (performance.now() < target);

	console.log('Done blocking');
	console.groupEnd();
}

/*
 * Spawn a bunch of tasks to fill the event loop task queue.
 */
export function addTasks(totalMs = 30 * 1000, msPerTask = 5) {
	const count = Math.floor(totalMs / msPerTask);
	for (let i = 0; i < count; i++) {
		setTimeout(() => block(msPerTask), 0);
	}
	setTimeout(() => console.log('DONE'), 0);
}
