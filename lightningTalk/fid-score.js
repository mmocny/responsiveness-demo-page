import { onFID } from 'https://unpkg.com/web-vitals@3?module';
import { MetricViewer } from './metric-viewer.js';

export class FidScore extends MetricViewer {
	constructor() {
		super();
		this.metricName = 'FID';
	}

	connectedCallback() {
		super.connectedCallback();

		onFID(({ value, rating }) => {
			this.score = Math.round(value);
			this.rating = rating;
		});
	}
}

customElements.define('fid-score', FidScore);