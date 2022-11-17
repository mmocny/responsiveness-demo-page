export default function makeTasksThatTakeTime(args = {}) {
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
