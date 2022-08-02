// Duration has a rounded value to 8ms, but startTime is accurate
function getReportedRenderTimeForEntry(entry) {
	const presentationTime = entry.startTime + entry.duration;
	// Sometimes there is no presentation time, in which case processingEnd is used as the end time
	// When that happens, we may as well use accurate processingEnd
	// TODO: consider using processingEnd whenever presentationTime is within 4ms here.
	return Math.max(presentationTime, entry.processingEnd);
}

// For events that share the same real presentation time, because we round() off duration to 8ms, an odd thing happens:
// - As startTime moves forward, the duration gets smaller
// - It can be either rounded-down or rounded-up, so...
// - The reported renderTime (startTime + duration) can end up be anywhere in the 8ms range.
// - For a single shared frame, the `duration` value for any one event may be much lower than the largest duration.
// 
// By sorting events by their reported renderTime, we know that all events which ended up at the same presentation should be within 8ms of each other.
//
// ...this heiristic can become a problem on screens with refresh rates higher than 120hz, since after that, there is less than an 8ms gap between renderTimes.
// ...also, if presentation times are not accurate or not vsync aligned, issues with grouping can arrise even at 60hz.
function groupEntriesByEstimatedFrameRenderTime(entries) {
	entries.sort((a,b) => getReportedRenderTimeForEntry(a) - getReportedRenderTimeForEntry(b));

	const ret = []; // entry[][]
	let curr = []; // entry[]

	// 8ms sliding window
	const WINDOW = 8;
	let windowStart;
	for (let entry of entries) {
		const renderTime = getReportedRenderTimeForEntry(entry);

		// create the first window?
		if (!windowStart) {
			windowStart = renderTime;
		}
		// create a new window?
		if (renderTime - windowStart > WINDOW) {
			ret.push(curr);
			curr = [];
			windowStart = renderTime;
		}
		// add to current window
		curr.push(entry);
	}
	// add the final window
	ret.push(curr);

	return ret;
}

// After grouping entries by estimated renderTime, lets map to a single common renderTime for the frame (like a frameId)
// This is just for readability purposes.
// 
// Note: with enough effort, this may become a fairly accurate renderTime
// See: https://bugs.chromium.org/p/chromium/issues/detail?id=1295823
function estimateRenderTimeForFrame(entries) {
	const renderTimes = entries.map(getReportedRenderTimeForEntry);
	const min = Math.min(...renderTimes);
	const max = Math.max(...renderTimes);
	const mid = (max+min)/2;
	const roundedMid = Math.floor((mid+4)/8)*8;
	// return roundedMid;
	// TODO: looking up the nearest frame presentation time via the rAF time of the next frame
	// TODO: You may be able to call rAF from within the PerformanceObserver callback...  but it risks not being scheduled.
	// TODO: Alternatively, a single rAF call could be used to align to vsync?
	return mid;
}

// Unlike for InteractionID, here I assign labels to *all* the event types.
// Some of these may end up grouped wrong, for example, you can get a click event synthesized after a keypress.
// This grouping may make that look like "KEY,TAP".
// But for timings, I don't actually use these type values, just as FYI.
function getInteractionType(entry) {
	switch(entry.name) {
	case "keydown":
	case "keyup":
	case "keypress":
		return "KEY";
		
	case "pointerdown":
	case "pointerup":
	case "pointercancel":
	case "touchstart":
	case "touchend":
	case "touchcancel":
	case "mousedown":
	case "mouseup":
	case "gotpointercapture":
	case "lostpointercapture":
	case "click":
	case "dblclick":
	case "auxclick":
	case "contextmenu":
		return "TAP";
		
	case "pointerleave":
	case "pointerout":
	case "pointerover":
	case "pointerenter":
	case "mouseout":
	case "mouseover":
	case "mouseleave":
	case "mouseenter":
	case "lostpointercapture":
		return "HOVER";
	
	case "dragstart":
	case "dragend":
	case "dragenter":
	case "dragleave":
	case "dragover":
	case "drop":
		return "DRAG";
	
	case "beforeinput":
	case "input":
	case "compositionstart":
	case "compositionupdate":
	case "compositionend":
		return "INPUT";
		
	default:
		// Shouldn't have missed any...
		return "OTHER";
	}
}

function getInteractionTypesForFrame(entries) {
	return [...new Set(entries.map(entry => getInteractionType(entry)))];
}

function getInteractionIdsForFrame(entries) {
	return [...new Set(entries.map(entry => entry.interactionId).filter((id) => id != 0))];
}

// Calculate the total time spent inside entries we care about.
// Due to some peculiarities, this isn't as easy as just summing processingEnd-processingStart
// See: https://bugs.chromium.org/p/chromium/issues/detail?id=1295718
function calculateTotalProcessingTime(entries) {
	// Sort by processing [start, end].  Sometimes processing re-ordered and not in order of input timeStamp.
	entries.sort((a,b) => a.processingStart - b.processingStart || a.processingEnd - b.processingEnd);

	let sum = 0;
	let previousEndTime;
	for (let entry of entries) {
		if (!previousEndTime) {
			previousEndTime = entry.processingEnd;
		} else if (entry.processingStart < previousEndTime) {
			// Skip entries which start before the previous ended
			continue;
		}
		sum += (entry.processingEnd - entry.processingStart);
		previousEndTime = entry.processingEnd;
	}

	return sum;
}

// Generate interesting timings for a specific frame of entries
function getTimingsForFrame(entries) {
	// A note here: many entries can share startTime.  Use the first one, but don't assume its the first to get processed.
	// It is possible that processing could take priority by event type, and be out of order of dispatch.  I am not sure.
	// TODO: Should test e.g. passive event handlers which are dispatched to main late...
	const firstInputEntry = entries.reduce((prev,next) => prev.startTime <= next.startTime ? prev : next, entries[0]);
	const firstProcessedEntry = entries.reduce((prev,next) => prev.processingStart <= next.processingStart ? prev : next, entries[0]);
	const lastProcessedEntry = entries.reduce((prev,next) => prev.processingEnd > next.processingEnd ? prev : next, entries[0]);

	const renderTime = estimateRenderTimeForFrame(entries);
	const interactionIds = getInteractionIdsForFrame(entries);
	const interactionTypes = getInteractionTypesForFrame(entries);
	// console.log(targetSelectors);
	const numEntries = entries.length;

	const duration = firstInputEntry.duration;
	const startTime = firstInputEntry.startTime;
	const inputDelay = firstProcessedEntry.processingStart - firstInputEntry.startTime;
	// Almost certainly we have a more accurate paintDelay if we use the estimated real `renderTime` value--
	// But you may want to use the officially reported value sometimes...
	// const presentationDelay = getReportedRenderTimeForEntry(lastProcessedEntry) - lastProcessedEntry.processingEnd;
	const presentationDelay = renderTime - lastProcessedEntry.processingEnd;
	
	const psTime = calculateTotalProcessingTime(entries);
	const psRange = lastProcessedEntry.processingEnd - firstProcessedEntry.processingStart;
	const psGap = psRange - psTime;

	const inputPct = inputDelay / duration;
	const psPct = psTime / duration;
	const gapPct = psGap / duration;
	const presentatonPct = presentationDelay / duration;

	return {
		startTime,
		renderTime,
		interactionIds,
		interactionTypes,
		numEntries,

		duration,
		inputPct,
		psPct,
		gapPct,
		presentatonPct,

		entries,
	}
}

const AllEntries = [];
function measureResponsiveness() {
	const observer = new PerformanceObserver(list => {
		AllEntries.push(...list.getEntries());
	});

	observer.observe({
		type: "event",
		durationThreshold: 0, // 16 minumum by spec
		buffered: true
	});
}

function reportAsTable() {
	function decorateTimings(timings) {
		pctToString(timings);
		roundOffNumbers(timings, 2);
	
		timings.interactionIds = timings.interactionIds.join(',');
		timings.interactionTypes = timings.interactionTypes.join(',');

		delete timings.entries;
	
		return timings;
	}
	
	// Make results easier to look at
	function roundOffNumbers(obj, places) {
		for (let key in obj) {
			const val = obj[key];
			if (typeof val === 'number') {
				obj[key] = Number(val.toFixed(places));
			}
		}
		return obj;
	}
	
	function pctToString(obj) {
		for (let key in obj) {
			const val = obj[key];
			if (key.endsWith('Pct')) {
				obj[key] = `${(val*100).toFixed(2)}%`;
			}
		}
		return obj;
	}

	const AllInteractionIds = getInteractionIdsForFrame(AllEntries);
	const entriesByFrame = groupEntriesByEstimatedFrameRenderTime(AllEntries);
	
	// Filter *frames* which have *only* HOVER interactions.  Leave HOVER events in for the remaining frames to account for timings.
	// TODO: may want to filer down to only KEY/TAP/DRAG, but I left everything else since its not that much noise typically.
	let timingsByFrame = entriesByFrame.map(getTimingsForFrame)
		.filter(timings => timings.interactionTypes.some(type => type != "HOVER"));

	// Optional: Filter down the single longest frame
	// timingsByFrame = [timingsByFrame.reduce((prev,curr) => (curr.duration > prev.duration) ? curr : prev)];

	console.log(`Now have ${AllInteractionIds.length} interactions, in ${entriesByFrame.length} frames, with ${AllEntries.length} entries.`);
	console.table(timingsByFrame.map(decorateTimings));
}

function reportToTimings() {
	const entriesByFrame = groupEntriesByEstimatedFrameRenderTime(AllEntries);
	
	// Filter *frames* which have *only* HOVER interactions.  Leave HOVER events in for the remaining frames to account for timings.
	// TODO: may want to filer down to only KEY/TAP/DRAG, but I left everything else since its not that much noise typically.
	let timingsByFrame = entriesByFrame.map(getTimingsForFrame)
		.filter(timings => timings.interactionTypes.some(type => type != "HOVER"));

	for (const timing of timingsByFrame) {
		performance.measure(
			`[Frame] with ${timing.interactionIds.length} Interactions: ${timing.interactionIds.join(',')}, ${timing.interactionTypes.join(',')}`,
			{
				start: timing.startTime,
				end: timing.renderTime,
			});
		for (const entry of timing.entries) {
			performance.measure(`[Event] ${entry.name}.${entry.interactionId}`,
			{
				start: entry.processingStart,
				end: entry.processingEnd,
			});
		}
		
	}
}

measureResponsiveness();

// TODO: Ideally we would do this in setInterval 
window.addEventListener('beforeunload', () => {
	reportAsTable();
	reportToTimings();
});