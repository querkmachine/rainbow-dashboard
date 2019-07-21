<template>
	<section class="bus-times">
		<template v-if="initialized">
			<header class="bus-times__header">
				{{ stopInfo.stop_name }}
				<template v-if="stopInfo.indicator">
					({{ stopInfo.indicator }})
				</template>
			</header>
			<ol class="bus-times__list">
				<template v-for="item in stopInfo.departures.all">
					<li class="bus-times__item" v-if="(item.expected_departure_date && item.expected_departure_time) && makeUnixTime(item.expected_departure_date, item.expected_departure_time) > unixTime" :key="item.id">
						<div class="bus-times__line">{{ item.line_name }}</div>
						<div class="bus-times__destination">{{ item.direction }}</div>
						<div class="bus-times__due">
							<Timeago :datetime="makeISODate(item.expected_departure_date, item.expected_departure_time)" :auto-update="1" />
						</div>
					</li>
					<li class="bus-times__item" v-else-if="makeUnixTime(item.date, item.aimed_departure_time) > unixTime" :key="item.id">
						<div class="bus-times__line">{{ item.line_name }}</div>
						<div class="bus-times__destination">{{ item.direction }}</div>
						<div class="bus-times__due">
							<Timeago :datetime="makeISODate(item.date, item.aimed_departure_time)" :auto-update="1" />
						</div>
					</li>
				</template>
			</ol>
		</template>
	</section>
</template>

<script>
import Axios from 'axios';
import Moment from 'moment';
import Timeago from './Timeago.vue';
import Vue from 'vue';

export default {
	name: 'BusTimes',
	components: {
		Timeago
	},
	props: {
		reloadInterval: {
			type: Number,
			default: 600000
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
	}
}
</script>

<style scoped>
.bus-times {
	border: 1px solid rgba(255, 255, 255, .2);
}
.bus-times__header {
	padding: .75rem;
	font-size: large;
	font-weight: 500;
}
.bus-times__list {
	margin: 0;
	padding: 0;
	list-style-type: none;
}
.bus-times__item {
	display: flex;
	flex-direction: row;
	align-items: center;
	padding: .75rem;
}
.bus-times__item + .bus-times__item {
	border-top: 1px solid rgba(255, 255, 255, .2);
}
.bus-times__line {
	width: 2em;
	font-weight: 500;
}
.bus-times__destination {
	padding-right: .5rem;
	padding-left: .5rem;
}
.bus-times__due {
	margin-left: auto;
	font-size: smaller;
	font-feature-settings: 'tnum' 1;
	text-align: right;
	opacity: .67;
}
</style>