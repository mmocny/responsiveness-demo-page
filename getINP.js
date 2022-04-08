const EVERY_N = 50;
const MAX_ENTRIES = 10;
const largestINPEntries = [];
let minKnownInteractionId = Number.POSITIVE_INFINITY;
let maxKnownInteractionId = 0;


function addInteractionEntryToINPList(entry) {
	// Add this entry only if its larger than what we already know about.
	if (largestINPEntries.length < MAX_ENTRIES || entry.duration > largestINPEntries[largestINPEntries.length-1].duration) {
		// If we already have an interaction with this same ID, replace it rather than append it.
		let existing = largestINPEntries.findIndex((other) => entry.interactionId == other.interactionId);
		if (existing >= 0) {
			// Only replace if this one is actually longer
			if (entry.duration > largestINPEntries[existing].duration) {
				largestINPEntries[existing] = entry;
			}
		} else {
			largestINPEntries.push(entry);
		}
		largestINPEntries.sort((a,b) => b.duration - a.duration);
		largestINPEntries.splice(MAX_ENTRIES);
	}
}

function getCurrentINPEntry() {
	const interactionCount = estimateInteractionCount();
	const which = Math.min(largestINPEntries.length-1, Math.floor(interactionCount / EVERY_N));
	return largestINPEntries[which];
}

function updateInteractionIds(interactionId) {
	minKnownInteractionId = Math.min(minKnownInteractionId, interactionId);
	maxKnownInteractionId = Math.max(maxKnownInteractionId, interactionId);
}

export function estimateInteractionCount() {
	const drag = performance.eventCounts.get('dragstart');
	const tap = performance.eventCounts.get('pointerup');
	const keyboard = performance.eventCounts.get('keydown');
	// This estimate does well on desktop, poorly on mobile
	// return tap + drag + keyboard;

	// This works well when PO buffering works well
	return (maxKnownInteractionId > 0) ? ((maxKnownInteractionId - minKnownInteractionId) / 7) + 1 : 0;
}

function trackInteractions(callback) {
	const observer = new PerformanceObserver(list => {
		for (let entry of list.getEntries()) {
			// TODO: Perhaps ignore values before FCP
			if (!entry.interactionId) continue;
			
			updateInteractionIds(entry.interactionId);
			addInteractionEntryToINPList(entry);
			
			callback(entry);
		}
	});

	observer.observe({
		type: "event",
		durationThreshold: 0, // 16 minumum by spec
		buffered: true
	});
}

// Will get called multuple times, every time INP changes
export function getINP(callback) {
	// TODO: get all entries not just previous
	let previousINP;
	trackInteractions(entry => {
		const inpEntry = getCurrentINPEntry();
		if (!previousINP || previousINP.duration != inpEntry.duration) {
			previousINP = inpEntry;
			callback({
				value: inpEntry.duration,
				entries: [inpEntry],
				interactionCount: estimateInteractionCount(),
			});
		}
	});
}

// Alternative to getINP
// Will get called multuple times, for every new interaction
// (Note: only when over 16ms duration)
export function reportAllInteractions(callback) {
	trackInteractions(entry => {
		callback({
			value: entry.duration,
			entries: [entry],
			interactionCount: estimateInteractionCount(),
		});
	});
}

/* Usage Example */
getINP(({ value, entries, interactionCount }) => {
	console.log(`[INP] value: ${value}, interactionCount:${interactionCount}`, entries);
	
	let currentINP = entries[0];

	// RenderTime is an estimate, because duration is rounded, and may get rounded keydown
	// In rare cases it can be less than processingEnd and that breaks performance.measure().
	// Lets make sure its at least 4ms in those cases so you can just barely see it.
	const presentationTime = currentINP.startTime + currentINP.duration;
	const adjustedPresentationTime = Math.max(currentINP.processingEnd + 4, presentationTime);

	// Thanks philipwalton!
	// Add measures so you can see the breakdown in the DevTools performance panel.
	performance.measure(`[Web Vitals Extension] INP.duration`, {
		start: currentINP.startTime,
		end: presentationTime,
	});
	performance.measure(`[Web Vitals Extension] INP.inputDelay`, {
		start: currentINP.startTime,
		end: currentINP.processingStart,
	});
	performance.measure(`[Web Vitals Extension] INP.processingTime`, {
		start: currentINP.processingStart,
		end: currentINP.processingEnd,
	});
	performance.measure(`[Web Vitals Extension] INP.presentationDelay`, {
		start: currentINP.processingEnd,
		end: adjustedPresentationTime,
	});
});