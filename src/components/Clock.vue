<template>
	<div class="clock">
		<div class="clock__background">
			<progress class="clock__progress" :min="unixStartOfYear - unixStartOfYear" :max="unixEndOfYear - unixStartOfYear" :value="unixNow - unixStartOfYear"></progress>
			<div class="clock__months">
				<div class="clock__month" v-for="i in 12" :style="'--noOfDays:' + daysInMonth(i)"><!--{{ i }}: {{ daysInMonth(i) }}--></div>
			</div>
		</div>
		<div class="clock__inner">
			<div class="clock__date">{{ humanDate }}</div>
			<div class="clock__time">{{ hours }}:{{ minutes }}<span class="clock__seconds">:{{ seconds }}</span></div>
		</div>
	</div>
</template>

<script>
import Moment from 'moment';
export default {
	name: 'Clock',
	data() {
		return {
			momentObj: Moment()
		}
	},
	mounted() {
		setInterval(() => {
			this.momentObj = Moment();
		}, 1000);
	},
	methods: {
		daysInMonth: function(month) {
			return new Date(this.currentYear, month, 0).getDate();
		}
	},
	computed: {
		// Used for mathsing
		currentYear: function() { return this.momentObj.format('YYYY'); },
		// Used for graphing
		daysInYear: function() { return this.momentObj.isLeapYear() ? 366 : 365; },
		unixStartOfYear: function() { return Moment(new Date(`${this.currentYear}-01-01T00:00:00`)).unix(); },
		unixEndOfYear: function() { return Moment(new Date(`${this.currentYear}-12-31T23:59:59`)).unix(); },
		unixNow: function() { return this.momentObj.unix(); },
		// Displayed values
		humanDate: function() { return this.momentObj.format('dddd, D MMMM YYYY'); },
		hours: function() { return this.momentObj.format('HH'); },
		minutes: function() { return this.momentObj.format('mm'); },
		seconds: function() { return this.momentObj.format('ss'); }
	}
}
</script>

<style scoped>
.clock {
	--textHeight: 2.25rem;
	--barHeight: .75rem;
	height: calc(var(--barHeight) + var(--textHeight));
	position: relative;
}
.clock__background {
	position: relative;
}
.clock__progress {
	width: 100%;
	height: var(--barHeight);
	margin: 0;
	padding: 0;
	border: 0;
	position: absolute;
	top: 0;
	left: 0;
	background-color: transparent;
	appearance: none;
}
.clock__progress::-webkit-progress-bar {
	background-color: transparent;
}
.clock__progress::-webkit-progress-value {
	background-color: var(--highlight);
}
.clock__progress::-moz-progress-bar {
	background-color: var(--highlight);
}
.clock__months {
	display: flex;
	flex-direction: row;
	width: 100%;
	height: var(--barHeight);
	position: absolute;
	top: 0;
	left: 0;
}
.clock__month {
	flex-grow: var(--noOfDays);
	flex-shrink: 0;
	flex-basis: 1px;
}
.clock__month + .clock__month {
	border-left: 1px solid rgba(255, 255, 255, .2);
}
.clock__inner {
	display: flex;
	flex-direction: row;
	align-items: center;
	width: 100%;
	height: var(--textHeight);
	position: absolute;
	top: var(--barHeight);
	left: 0;
}
.clock__date {

}
.clock__time {
	margin-left: auto;
	font-weight: 500;
	font-feature-settings: 'tnum' 1;
}
.clock__seconds {
	opacity: .67;
	font-size: smaller;
	font-weight: 600;
}
</style>