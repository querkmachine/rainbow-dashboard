<template>
	<div class="dark-sky">
		<template v-if="error">ERROR: {{ error }}</template>
		<template v-if="initialized">
			<section v-if="nextHour" class="dark-sky__section">
				<div class="dark-sky__summary">
					{{ nextHour.summary }}
					{{ next12Hours.summary }}
				</div>
				<div class="dark-sky__temperature">
					<span class="dark-sky__temperature-main">
						<small>Feels like</small>
						{{ round(nextHour.apparentTemperature) }}&deg;
					</span>
				</div>
				<div class="dark-sky__rain-graph" v-if="nextHour.graph.show">
					<ol class="dark-sky__rain-graph-list">
						<li class="dark-sky__rain-graph-bar" v-for="bar in nextHour.graph.data" :style="'height:' + ((100 / nextHour.graph.maxPrecipitation) * bar.precipIntensity) + '%'" :key="bar.time">
							<div class="dark-sky__rain-graph-bar-variance" :style="'height:' + ((100 / nextHour.graph.maxPrecipitation) * bar.precipIntensityError) + '%'">
							</div>
						</li>
					</ol>
				</div>
			</section>
			<section class="dark-sky__section">
				<div class="dark-sky__forecast-graph">
					<ol class="dark-sky__forecast-graph-list">
						<li v-for="bar in next12Hours.graph.data" :key="bar.time" class="dark-sky__forecast-graph-bar">
							<div class="dark-sky__forecast-graph-label">{{ timestampToTime(bar.time) }}</div>
							<div class="dark-sky__forecast-graph-rain" :style="'height:' + ((100 / next12Hours.graph.maxPrecipitation) * bar.precipIntensity) + '%'"></div>
							<div class="dark-sky__forecast-graph-details" :style="'bottom:' + forecastGraphPosition(bar.temperature, next12Hours.graph.minTemperature, next12Hours.graph.maxTemperature) + '%'">
								<div class="dark-sky__forecast-graph-icon">
									<skycon :condition="bar.icon" width="90" height="90" color="white" />
								</div>
								<div class="dark-sky__forecast-graph-temperature">{{ round(bar.temperature) }}&deg;</div>
							</div>
						</li>
					</ol>
				</div>
			</section>
		</template>
	</div>
</template>

<script>
import _ from 'lodash';
import Axios from 'axios';
import Moment from 'moment';
import Vue from 'vue';
import VueSkycons from 'vue-skycon';
Vue.use(VueSkycons);

export default {
	name: 'DarkSky',
	props: {
		lat: {
			type: Number,
			required: true
		},
		lng: {
			type: Number,
			required: true
		},
		reloadInterval: {
			type: Number,
			default: 300000 // 5 minutes
		}
	},
	data() {
		return {
			error: false,
			initialized: false,
			forecastData: {}
		}
	},
	computed: {
		nextHour: function() {
			return {
				summary: this.forecastData.minutely.summary,
				temperature: this.forecastData.hourly.data[0].temperature,
				apparentTemperature: this.forecastData.hourly.data[0].apparentTemperature,
				graph: _.assign(
					{ data: this.forecastData.minutely.data }, 
					this.nextHourGraphDetails(this.forecastData.minutely.data)
				)
			}
		},
		next12Hours: function() {
			return {
				summary: this.forecastData.hourly.summary,
				graph: _.assign(
					{ data: this.forecastData.hourly.data.slice(0, 12) },
					this.next12HoursGraphDetails()
				)
			}
		}
	},
	mounted() {
		this.updateForecast();
		setInterval(() => {
			this.updateForecast();
		}, this.reloadInterval);
	},
	methods: {
		loadData: function() {
			if(localStorage.getItem('RD_DARKSKY_FORECAST')) {
				this.forecastData = JSON.parse(localStorage.getItem('RD_DARKSKY_FORECAST'));
				this.initialized = true;
				return true;
			}
			return false;
		},
		saveData: function() {
			localStorage.setItem('RD_DARKSKY_FORECAST', JSON.stringify(this.forecastData));
		},
		updateForecast: function() {
			if(process.env.NODE_ENV === 'development' && this.loadData()) { return; }
			Axios
				.get(`https://cors-anywhere.herokuapp.com/https://api.darksky.net/forecast/${process.env.VUE_APP_DARKSKY_API_KEY}/${this.lat},${this.lng}`, {
					params: {
						units: 'uk2'
					}
				})
				.then((response) => {
					this.forecastData = response.data;
					this.error = false;
					this.initialized = true;
					this.saveData();
				})
				.catch((error) => {
					this.error = error;
					this.initialized = false;
				})
		},
		nextHourGraphDetails: function(data, defaultPrecipitation = 9) {
			const precipitationArray = _.map(data, 'precipIntensity');
			const maxPrecipitation = Math.max(...precipitationArray);
			return {
				show: maxPrecipitation > 0 ? true : false,
				maxPrecipitation: maxPrecipitation > defaultPrecipitation ? maxPrecipitation : defaultPrecipitation
			}
		},
		next12HoursGraphDetails: function(defaultPrecipitation = 9) {
			const today = this.forecastData.daily.data[0];
			const tomorrow = this.forecastData.daily.data[1];
			const afterNoon = new Date().getHours() >= 12 ? true : false;
			const maxPrecipitation = afterNoon ? Math.max(today.precipIntensityMax, tomorrow.precipIntensityMax) : today.precipIntensityMax;
			const maxTemperature = afterNoon ? Math.max(today.temperatureMax, tomorrow.temperatureMax) : today.temperatureMax;
			const minTemperature = afterNoon ? Math.min(today.temperatureMin, tomorrow.temperatureMin) : today.temperatureMin;
			return {
				maxTemperature: maxTemperature,
				minTemperature: minTemperature,
				maxPrecipitation: maxPrecipitation > defaultPrecipitation ? maxPrecipitation : defaultPrecipitation
			}
		},
		forecastGraphPosition: function(temperature, minTemperature, maxTemperature) {
			// Not 0-100 to avoid overlapping time label or going off the bottom of the bar
			const minPercentage = 7.5;
			const maxPercentage = 67;
			return minPercentage + (temperature - minTemperature) / (maxTemperature - minTemperature) * (maxPercentage - minPercentage);
		},
		round: function(num) {
			return Math.round(num);
		},
		timestampToTime: function(timestamp) {
			return Moment.unix(timestamp).format('HH:mm');
		}
	}
}
</script>

<style scoped>
.dark-sky {
	display: grid;
	grid-template-columns: 1fr 4fr;
	grid-gap: 1.5rem;
	padding: .75rem;
	border: 1px solid rgba(255, 255, 255, .2);
}
.dark-sky__section {

}
.dark-sky__section-header {
	margin-bottom: .75rem;
	font-feature-settings: 'case' 1;
	font-size: smaller;
	text-transform: uppercase;
	letter-spacing: 1px;
	opacity: .67;
}
.dark-sky__temperature {
	display: flex;
	flex-direction: row;
	justify-content: flex-start;
	align-items: flex-end;
	margin-top: .75rem;
	font-size: xx-large;
	font-weight: 500;
}
.dark-sky__temperature small {
	display: block;
	font-size: small;
}
.dark-sky__temperature-main {
	margin-right: .5rem;
}
.dark-sky__temperature-secondary {
	font-size: auto;
	font-weight: 300;
	opacity: .67;
}
.dark-sky__rain-graph {
	position: relative;
	margin-top: .75rem;
	padding-top: 40%;
	border-width: 0 1px 1px 1px;
	border-style: solid;
	border-color: rgba(255, 255, 255, .2);
	background-image: repeating-linear-gradient(to bottom, transparent 0, transparent calc(100% - 1px), rgba(255, 255, 255, .2) calc(100% - 1px), rgba(255, 255, 255, .2) 100%);
	background-size: 100% 33.3333%;
	overflow: hidden;
}
.dark-sky__rain-graph-list {
	display: flex;
	flex-direction: row;
	align-items: flex-end;
	width: 100%;
	height: 100%;
	margin: 0;
	padding: 0;
	position: absolute;
	top: 0;
	left: 0;
	list-style-type: none;
}
.dark-sky__rain-graph-bar {
	flex: 1 1 1px;
	position: relative;
	border-top: 2px solid var(--highlight);
	transition: height .3333s ease;
}
.dark-sky__rain-graph-bar-variance {
	width: 100%;
	position: absolute;
	top: 0;
	left: 0;
	background-color: var(--highlight);
	transform: translateY(-50%);
	opacity: .5;
	transition: height .3333s ease;
}
.dark-sky__forecast-graph {
	padding-top: 30%;
	position: relative;
	text-align: center;
}
.dark-sky__forecast-graph-list {
	display: flex;
	flex-direction: row;
	width: 100%;
	height: 100%;
	margin: 0;
	padding: 0;
	position: absolute;
	top: 0;
	left: 0;
	list-style-type: none;
}
.dark-sky__forecast-graph-bar {
	flex: 1 1 1px;
	display: flex;
	flex-direction: column;
	position: relative;
}
.dark-sky__forecast-graph-bar + .dark-sky__forecast-graph-bar {
	border-left: 1px solid rgba(255, 255, 255, .2);
}
.dark-sky__forecast-graph-label {
	order: 2;
	margin-top: auto;
	padding: .25rem;
	position: relative;
	z-index: 1;
	font-feature-settings: 'tnum' 1;
	font-size: small;
	font-weight: 600;
}
.dark-sky__forecast-graph-rain {
	width: 100%;
	position: absolute;
	bottom: 0;
	left: 0;
	background-color: var(--highlight);
	transition: height .3333s ease;
}
.dark-sky__forecast-graph-details {
	order: 1;
	width: 100%;
	padding: .5rem;
	position: absolute;
	left: 0;
	z-index: 1;
	transition: bottom .3333s ease;
}
.dark-sky__forecast-graph-icon {
	padding-top: 100%;
	position: relative;
}
.dark-sky__forecast-graph-icon canvas {
	width: 100%;
	height: 100%;
	position: absolute;
	top: 0;
	left: 0;
}
.dark-sky__forecast-graph-temperature {
	margin-top: .5rem;
}
</style>