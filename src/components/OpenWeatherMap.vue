<template>
	<div class="lcars-weather" v-if="initialized">
		<ol class="lcars-weather__graph">
			<li v-for="bar in next12Hours.graph.data" :key="bar.dt" class="lcars-weather__row">
				<div class="lcars-weather__time">{{ timestampToTime(bar.dt) }}</div>
				<div class="lcars-weather__rain">
					<div class="lcars-weather__rain-bar" :style="'width:' + ((100 / next12Hours.graph.maxPrecipitation) * getBarPrecipitation(bar)) + '%'"></div>
					<div class="lcars-weather__condition" :style="'left:' + forecastGraphPosition(bar.temp, next12Hours.graph.minTemperature, next12Hours.graph.maxTemperature) + '%'">
						<skycon :condition="getSkycon(bar.weather[0].id, bar.weather[0].icon)" width="20" height="20" color="white" />
					</div>
				</div>
				<div class="lcars-weather__temp">
					{{ round(bar.temp) }}&deg;
				</div>
			</li>
		</ol>
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
		name: 'OpenWeatherMap',
		props: {
			reloadInterval: {
				type: Number,
				default: 300000 // 5 minutes
			}
		},
		data() {
			return {
				error: false,
				initialized: false,
				lat: process.env.VUE_APP_OWM_LATITUDE,
				lng: process.env.VUE_APP_OWM_LONGITUDE,
				forecastData: {}
			}
		},
		computed: {
			current() {
				const now = this.forecastData.current;
				return {
					summary: now.weather[0]?.main,
					temperature: now.temp,
					apparentTemperature: now.feels_like,
					graph: {}
				}	
			},
			nextHour() {
				const hour = this.forecastData.hourly[0];
				return {
					summary: hour.weather[0]?.main,
					temperature: hour.temp,
					apparentTemperature: hour.feels_like,
					graph: _.assign(
						{ data: this.forecastData.minutely }, 
						this.nextHourGraphDetails()
					)
				}
			},
			next12Hours() {
				return {
					summary: this.forecastData.daily[0]?.weather[0]?.main,
					graph: _.assign(
						{ data: this.forecastData.hourly.slice(0, 12) },
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
				if(localStorage.getItem('RD_OWM_FORECAST')) {
					this.forecastData = JSON.parse(localStorage.getItem('RD_OWM_FORECAST'));
					this.initialized = true;
					return true;
				}
				return false;
			},
			saveData: function() {
				localStorage.setItem('RD_OWM_FORECAST', JSON.stringify(this.forecastData));
			},
			updateForecast: function() {
				//if(process.env.NODE_ENV === 'development' && this.loadData()) { return; }
				Axios
					.get(process.env.VUE_APP_OWM_API_ENDPOINT, {
						params: {
							"appid": process.env.VUE_APP_OWM_API_KEY,
							"lat": this.lat,
							"lon": this.lng,
							"units": "metric"
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
			round: function(num) {
				return Math.round(num);
			},
			timestampToTime: function(timestamp) {
				return Moment.unix(timestamp).format('HHmm');
			},
			getBarPrecipitation: function(bar) {
				if(bar.rain) {
					return bar.rain['1h'];
				}
				else if(bar.snow) {
					return bar.snow['1h'];
				}
				return 0;
			},
			nextHourGraphDetails: function(defaultPrecipitation = 9) {
				const data = this.forecastData.minutely;
				const precipitationArray = _.map(data, 'precipitation');
				const maxPrecipitation = Math.max(...precipitationArray);
				return {
					show: maxPrecipitation > 0 ? true : false,
					maxPrecipitation: maxPrecipitation > defaultPrecipitation ? maxPrecipitation : defaultPrecipitation
				}
			},
			next12HoursGraphDetails: function(defaultPrecipitation = 9) {
				const today = this.forecastData.daily[0];
				const tomorrow = this.forecastData.daily[1];
				const afterNoon = new Date().getHours() >= 12 ? true : false;
				const maxPrecipitation = afterNoon ? Math.max(today.rain, tomorrow.rain, today.snow, tomorrow.snow) : Math.max(today.rain, today.snow);
				const maxTemperature = afterNoon ? Math.max(today.temp.max, tomorrow.temp.max) : today.temp.max;
				const minTemperature = afterNoon ? Math.min(today.temp.min, tomorrow.temp.min) : today.temp.min;
				return {
					maxTemperature: maxTemperature,
					minTemperature: minTemperature,
					maxPrecipitation: maxPrecipitation > defaultPrecipitation ? maxPrecipitation : defaultPrecipitation
				}
			},
			forecastGraphPosition: function(temperature, minTemperature, maxTemperature) {
				// Not 0-100 to avoid overlapping time label or going off the bottom of the bar
				const minPercentage = 2;
				const maxPercentage = 90;
				return minPercentage + (temperature - minTemperature) / (maxTemperature - minTemperature) * (maxPercentage - minPercentage);
			},
			getSkycon(id, iconCode) {
				// OWM uses a different icon naming scheme to Dark Sky,
				// But we still want to be able to use the same iconography.
				// https://openweathermap.org/weather-conditions
				
				// Determine if it's night or day
				const night = (iconCode.slice(-1) === "n") ? true : false;
				
				// Determine icon to use
				if(id >= 200 && id < 300) {
					// 2xx: Thunderstorms
					return "rain";
				}
				else if(id >= 300 && id < 400) {
					// 3xx: Light rain
					return "rain";
				}
				else if(id >= 500 && id < 600) {
					// 5xx: Rain 
					if(id === 511) {
						// 511: Freezing rain
						return "sleet";
					}
					return "rain";
				}
				else if(id >= 600 && id < 700) {
					// 6xx: Snow
					if(id >= 611) {
						// 611+: Various mixtures of snow/rain
						return "sleet";
					}
					return "snow";
				}
				else if(id >= 700 && id < 800) {
					// 7xx: Atmospheric 
					if(id >= 771) {
						// 771+: Exteme wind conditions
						return "wind";
					}
					return "fog";
				}
				else if(id >= 801 && id < 900) {
					// 8xx (except 800): Cloud cover
					if(id >= 803) {
						// 803+: Heavy cloud cover
						return "cloudy";
					}
					return (night) ? "partly-cloudy-night": "partly-cloudy-day";
				}
				// 800: Clear
				return (night) ? "clear-night" : "clear-day";
			}
		}
	}
</script>
	
<style scoped lang="scss">
	.lcars-weather {
		$self: &;
		height: 100%;
		&__graph {
			display: flex;
			flex-direction: column;
			height: 100%;
			list-style-type: none;
		}
		&__row {
			display: flex;
			flex-grow: 1;
			margin-top: .25rem;
			&:first-child {
				margin-top: 0;
				#{$self}__time,
				#{$self}__rain-bar,
				#{$self}__temp {
					background-color: var(--color-secondary-1);
				}
			}
		}
		&__time,
		&__temp {
			display: inline-flex;
			justify-content: flex-end;
			align-items: center;
			padding: .125rem .5rem;
			color: var(--canvas-background-color);
			background-color: var(--color-primary-2);
			font-variant-numeric: tabular-nums;
		}
		&__time {
			flex: 0 0 var(--label-width);
			margin-right: .125rem;
			padding-left: 1rem;
			border-radius: 2rem 0 0 2rem;
			font-family: var(--font-heading);
		}
		&__rain {
			flex: 1 0;
			position: relative;
			background-image: linear-gradient(to bottom, var(--color-neutral-2), var(--color-neutral-2));
			background-size: 100% 1px;
			background-repeat: no-repeat;
			background-position: 50%;
		}
		&__rain-bar {
			height: 100%;
			background-color: var(--color-primary-2);
			border-radius: 0 2rem 2rem 0;
		}
		&__condition {
			position: absolute;
			top: 50%;
			transform: translateY(-50%);
			canvas {
				height: 1.25rem;
				width: 1.25rem;
			}
		}
		&__temp {
			flex: 0 0 10%;
			margin-left: .125rem;
			padding-right: 1rem;
			border-radius: 0 2rem 2rem 0;
		}
	}
</style>