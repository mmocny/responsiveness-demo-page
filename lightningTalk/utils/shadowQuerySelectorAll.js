// Inspiration: https://www.abeautifulsite.net/posts/querying-through-shadow-roots/

/*
 * Acts like querySelectorAll, except you can pass a list of selectors...
 * Each selector is evaluated within the shadowRoot of the previous NodeList
 * 
 * Optionally:  call with a single string separated by `>>>`
 */
export default function* shadowQuerySelectorAll(selectors, rootNode = document, depth = 0) {
	if (typeof selectors === 'string') {
		return yield* shadowQuerySelectorAll(String(selectors).split('>>>'), rootNode);
	}
	const nodes = rootNode?.querySelectorAll(selectors[depth]);
	if (depth >= selectors.length - 1) {
		yield* nodes;
	} else {
		for (let node of nodes) {
			yield* shadowQuerySelectorAll(selectors, node?.shadowRoot, depth + 1);
		}
	}
}