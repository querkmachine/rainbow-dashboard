<template>
	<div class="clock">
		<div class="clock__background">
			<progress class="clock__progress" :max="daysInMonth" :value="dayOfMonth">{{ dayOfMonth }}</progress>
			<progress class="clock__progress" :max="daysInYear" :value="dayOfYear">{{ dayOfYear }}</progress>
		</div>
		<div class="clock__inner">
			<div class="clock__date">{{ date }}</div>
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
	computed: {
		date: function() { return this.momentObj.format('dddd, D MMMM YYYY'); },
		hours: function() { return this.momentObj.format('HH'); },
		minutes: function() { return this.momentObj.format('mm'); },
		seconds: function() { return this.momentObj.format('ss'); },
		dayOfWeek: function() { return this.momentObj.isoWeekday(); },
		dayOfMonth: function() { return this.momentObj.date(); },
		dayOfYear: function() { return this.momentObj.dayOfYear(); },
		daysInMonth: function() { return this.momentObj.daysInMonth(); },
		daysInYear: function() { return this.momentObj.isLeapYear() ? 366 : 365; }
	}
}
</script>

<style scoped>
.clock {
	--height: 3rem;
	height: var(--height);
	position: relative;
}
.clock__progress {
	width: 100%;
	height: calc(var(--height) / 2);
	margin: 0;
	padding: 0;
	border: 0;
	background-color: transparent;
	appearance: none;
}
.clock__progress::-webkit-progress-bar {
	background-color: transparent;
}
.clock__progress::-webkit-progress-value,
.clock__progress::-moz-progress-bar {
	background-color: var(--highlight);
}
.clock__inner {
	display: flex;
	flex-direction: row;
	align-items: center;
	width: 100%;
	height: 100%;
	padding: 0 1rem;
	position: absolute;
	top: 0;
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