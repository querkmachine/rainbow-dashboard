<template>
	<span hidden></span>
</template>

<script>
import Moment from 'moment';
export default {
	name: 'DynamicHighlight',
	data() {
		return {
			highlightColor: '',
			previousDayOfYear: 0
		}
	},
	mounted() {
		this.calculateHighlight();
		setInterval(() => {
			this.calculateHighlight();
		}, 1000 * 60 * 60);
	},
	methods: {
		calculateHighlight: function() {
			// If it's the same day as the last test, don't bother continuing (will avoid the watch check)
			if(this.previousDayOfYear === Moment().dayOfYear()) { return; }
			const hueDegrees = Math.round(0 + (Moment().dayOfYear() - 1) / ((Moment().isLeapYear() ? 366 : 365) - 1) * (359 - 0));
			this.highlightColor = `hsl(${hueDegrees}deg, 79%, 51%)`;
		}
	},
	watch: {
		highlightColor: function() {
			document.documentElement.style.setProperty('--highlight', this.highlightColor);
		}
	}
}
</script>