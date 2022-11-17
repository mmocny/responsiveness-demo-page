const NAME="benchmark";

export async function benchmark(cb) {
	const start = performance.now();
	await cb();
	performance.measure(NAME, { start });
}

export function reportBenchmarkResultsToConsole() {
	new PerformanceObserver(list => {
		for (let entry of list.getEntries()) {
			if (entry.name != NAME) continue;
			console.log(`startTime: ${entry.startTime}, duration: ${entry.duration}`);
		}
	}).observe({ type: 'measure' });
}