<template>
	<span>{{ formattedTime }}</span>
</template>

<script>
import Moment from 'moment';
export default {
	name: 'Timeago',
	props: {
		datetime: {
			type: String,
			required: true
		},
		autoUpdate: {
			type: [Number, Boolean],
			default: 60
		},
		dictionary: {
			type: Object,
			default: function() {
				return {
					now: ['just now', 'right now'],
					second: ['%s second ago', 'in %s second'],
					seconds: ['%s seconds ago', 'in %s seconds'],
					minute: ['%s minute ago', 'in %s minute'],
					minutes: ['%s minutes ago', 'in %s minutes'],
					hour: ['%s hour ago', 'in %s hour'],
					hours: ['%s hours ago', 'in %s hours'],
					day: ['%s day ago', 'in %s day'],
					days: ['%s days ago', 'in %s days'],
					week: ['%s week ago', 'in %s week'],
					weeks: ['%s weeks ago', 'in %s weeks'],
					month: ['%s month ago', 'in %s month'],
					months: ['%s months ago', 'in %s months'],
					year: ['%s year ago', 'in %s year'],
					years: ['%s years ago', 'in %s years']
				}
			}
		}
	},
	data() {
		return {
			timeNow: Moment().unix()
		}
	},
	mounted() {
		if(this.autoUpdate) {
			setInterval(() => {
				this.timeNow = Moment().unix();
			}, this.autoUpdate * 1000);
		}
	},
	computed: {
		timeGiven: function() {
			return Moment(this.datetime).unix();
		},
		formattedTime: function() {
			const diff = this.timeGiven - this.timeNow; 
			return (diff >= 0) ? this.timeDifference(diff, true) : this.timeDifference(diff, false);
		}
	},
	methods: {
		timeDifference: function(diff, future) {
			// This is all vague but it's good enough for showing a rough timestamp
			const second = 1;
			const minute = second * 60;
			const hour = minute * 60;
			const day = hour * 24;
			const week = day * 7;
			const month = day * 30.4375;
			const year = day * 365.25;
			// Abs the difference and pass it on
			const secDiff = Math.abs(diff);
			if(secDiff < second) {
				return this.dateString('now', secDiff, future);
			}
			else if(secDiff < minute) {
				const calcDiff = Math.round(secDiff / second);
				if(calcDiff === 1) return this.dateString('second', calcDiff, future);
				return this.dateString('seconds', calcDiff, future);
			}
			else if(secDiff < hour) {
				const calcDiff = Math.round(secDiff / minute);
				if(calcDiff === 1) return this.dateString('minute', calcDiff, future);
				return this.dateString('minutes', calcDiff, future);
			}
			else if(secDiff < day) {
				const calcDiff = Math.round(secDiff / hour);
				if(calcDiff === 1) return this.dateString('hour', calcDiff, future);
				return this.dateString('hours', calcDiff, future);
			}
			else if(secDiff < week) {
				const calcDiff = Math.round(secDiff / day);
				if(calcDiff === 1) return this.dateString('day', calcDiff, future);
				return this.dateString('days', calcDiff, future);
			}
			else if(secDiff < month) {
				const calcDiff = Math.round(secDiff / week);
				if(calcDiff === 1) return this.dateString('week', calcDiff, future);
				return this.dateString('weeks', calcDiff, future);
			}
			else if(secDiff < year) {
				const calcDiff = Math.round(secDiff / month);
				if(calcDiff === 1) return this.dateString('month', calcDiff, future);
				return this.dateString('months', calcDiff, future);
			}
			else {
				const calcDiff = Math.round(secDiff / year);
				if(calcDiff === 1) return this.dateString('year', calcDiff, future);
				return this.dateString('years', calcDiff, future);
			}
		},
		dateString: function(category, time, future) {
			const string = future ? this.dictionary[category][1] : this.dictionary[category][0];
			return string.replace('%s', Math.round(time));
		}
	}
}
</script>