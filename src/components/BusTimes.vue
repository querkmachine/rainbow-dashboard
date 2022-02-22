<template>
	<ol class="lcars-timetable">
		<template v-if="initialized">
			<template v-for="(item, i) in displayDepartures">
				<li class="lcars-timetable__item" v-if="item.expected_departure_date && item.expected_departure_time" :key="i" :data-line="item.line_name">
					<div class="lcars-timetable__line">{{ item.line_name }}</div>
					<div class="lcars-timetable__destination">{{ item.direction }}</div>
					<div class="lcars-timetable__due">
						<Timeago :datetime="makeISODate(item.expected_departure_date, item.expected_departure_time)" :auto-update="1" />
					</div>
				</li>
				<li class="lcars-timetable__item" v-else :key="i" :data-line="item.line_name">
					<div class="lcars-timetable__line">{{ item.line_name }}</div>
					<div class="lcars-timetable__destination">{{ item.direction }}</div>
					<div class="lcars-timetable__due">
						<Timeago :datetime="makeISODate(item.date, item.aimed_departure_time)" :auto-update="1" />
					</div>
				</li>
			</template>
		</template>
	</ol>
</template>

<script>
import Axios from 'axios';
import Moment from 'moment';
import Timeago from './Timeago.vue';

export default {
	name: 'BusTimes',
	components: {
		Timeago
	},
	props: {
		reloadInterval: {
			type: Number,
			default: 1000 * 60 * 20
		}
	},
	data() {
		return {
			initialized: false,
			error: false,
			unixTime: Moment().unix(),
			stopInfo: {}
		}
	},
	mounted() {
		this.updateTimetable();
		setInterval(() => {
			this.updateTimetable();
		}, this.reloadInterval);
		setInterval(() => {
			this.unixTime = Moment().unix()
		}, 1000);
	},
	methods: {
		loadData: function() {
			if(localStorage.getItem('RD_BUSTIMES_TIMETABLE')) {
				this.stopInfo = JSON.parse(localStorage.getItem('RD_BUSTIMES_TIMETABLE'));
				this.initialized = true;
				return true;
			}
			return false;
		},
		saveData: function() {
			localStorage.setItem('RD_BUSTIMES_TIMETABLE', JSON.stringify(this.stopInfo));
		},
		updateTimetable: function() {
			if(process.env.NODE_ENV === 'development' && this.loadData()) { return; }
			Axios
				.get(`https://transportapi.com/v3/uk/bus/stop/${process.env.VUE_APP_BUSTIMES_STOP_ATCO_CODE}/live.json`, {
					params: {
						app_id: process.env.VUE_APP_BUSTIMES_APP_ID,
						app_key: process.env.VUE_APP_BUSTIMES_API_KEY,
						group: 'no',
						nextbuses: 'yes'
					}
				})
				.then((response) => {
					this.stopInfo = response.data;
					this.error = false;
					this.initialized = true;
					this.saveData();
				})
				.catch((error) => {
					this.error = error;
					this.initialized = false;
				});
		},
		makeISODate: function(date, time) {
			return Moment(`${date} ${time}`).toISOString();
		},
		makeUnixTime: function(date, time) {
			return Moment(`${date} ${time}`).unix();
		}
	},
	computed: {
		displayDepartures: function() {
			return this.stopInfo.departures.all.filter(item => {
				return this.makeUnixTime(item.expected_departure_date, item.expected_departure_time) > this.unixTime || this.makeUnixTime(item.date, item.aimed_departure_time) > this.unixTime;
			}).slice(0, 7);
		}
	}
}
</script>

<style scoped lang="scss">
	.lcars-timetable {
		display: flex;
		flex-direction: row-reverse;
		justify-content: flex-start;
		height: var(--footer-height);
		list-style-type: none;
		text-transform: uppercase;
		&__item {
			flex: 0 0 11%;
			display: flex;
			flex-direction: column;
			padding: .5rem;
			border-width: 0;
			border-left-width: .25rem;
			border-style: solid;
			border-color: var(--canvas-background-color);
			color: var(--canvas-background-color);
			background-color: var(--color-neutral-1);
			&:first-child {
				flex-basis: 16%;
				border-right-width: .25rem;
				background-color: var(--color-secondary-1);
			}
			&[data-line="8"] { background-color: var(--color-secondary-1); }
			&[data-line="505"] { background-color: var(--color-primary-2); }
		}
		&__line {
			font-family: var(--font-heading);
			font-size: 2rem;
		}
		&__destination {
			font-family: var(--font-heading);
		}
		&__due {
			margin-top: auto;
		}
	}
</style>