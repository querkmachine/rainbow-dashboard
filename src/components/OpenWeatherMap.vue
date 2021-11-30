<template>
	<div class="owm">
		<template v-if="error">ERROR: {{ error }}</template>
		<template v-if="initialized">
			<section class="owm__section">
				<div class="owm__summary">
					{{ current.summary }} currently.
					{{ nextHour.summary }} soon.
					{{ next12Hours.summary }} later.
				</div>
				<div class="owm__temperature">
					<span class="owm__temperature-main">
						<small>Feels like</small>
						{{ round(current.apparentTemperature) }}&deg;
					</span>
				</div>
				<div class="owm__rain-graph" v-if="nextHour.graph.show">
					<ol class="owm__rain-graph-list">
						<li class="owm__rain-graph-bar" v-for="bar in nextHour.graph.data" :style="'height:' + ((100 / nextHour.graph.maxPrecipitation) * bar.precipIntensity) + '%'" :key="bar.time">
							<div class="owm__rain-graph-bar-variance" :style="'height:' + ((100 / nextHour.graph.maxPrecipitation) * bar.precipIntensityError) + '%'">
							</div>
						</li>
					</ol>
				</div>
			</section>
			<section class="owm__section">
				<div class="owm__forecast-graph">
					<ol class="owm__forecast-graph-list">
						<li v-for="bar in next12Hours.graph.data" :key="bar.dt" class="owm__forecast-graph-bar">
							<div class="owm__forecast-graph-label">{{ timestampToTime(bar.dt) }}</div>
							<div class="owm__forecast-graph-rain" :style="'height:' + ((100 / next12Hours.graph.maxPrecipitation) * getBarPrecipitation(bar)) + '%'"></div>
							<div class="owm__forecast-graph-details" :style="'bottom:' + forecastGraphPosition(bar.temp, next12Hours.graph.minTemperature, next12Hours.graph.maxTemperature) + '%'">
								<div class="owm__forecast-graph-icon">
									<skycon :condition="getSkycon(bar.weather[0].id, bar.weather[0].icon)" width="90" height="90" color="white" />
								</div>
								<div class="owm__forecast-graph-temperature">{{ round(bar.temp) }}&deg;</div>
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
				if(process.env.NODE_ENV === 'development' && this.loadData()) { return; }
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
				return Moment.unix(timestamp).format('HH:mm');
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
				const minPercentage = 7.5;
				const maxPercentage = 67;
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
	
<style scoped>
	.owm {
		display: grid;
		grid-template-columns: 1fr 4fr;
		grid-gap: 1.5rem;
		padding: .75rem;
		border: 1px solid rgba(255, 255, 255, .2);
	}
	.owm__section {
	
	}
	.owm__section-header {
		margin-bottom: .75rem;
		font-feature-settings: 'case' 1;
		font-size: smaller;
		text-transform: uppercase;
		letter-spacing: 1px;
		opacity: .67;
	}
	.owm__temperature {
		display: flex;
		flex-direction: row;
		justify-content: flex-start;
		align-items: flex-end;
		margin-top: .75rem;
		font-size: xx-large;
		font-weight: 500;
	}
	.owm__temperature small {
		display: block;
		font-size: small;
	}
	.owm__temperature-main {
		margin-right: .5rem;
	}
	.owm__temperature-secondary {
		font-size: auto;
		font-weight: 300;
		opacity: .67;
	}
	.owm__rain-graph {
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
	.owm__rain-graph-list {
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
	.owm__rain-graph-bar {
		flex: 1 1 1px;
		position: relative;
		border-top: 2px solid var(--highlight);
		transition: height .3333s ease;
	}
	.owm__rain-graph-bar-variance {
		width: 100%;
		position: absolute;
		top: 0;
		left: 0;
		background-color: var(--highlight);
		transform: translateY(-50%);
		opacity: .5;
		transition: height .3333s ease;
	}
	.owm__forecast-graph {
		padding-top: 30%;
		position: relative;
		text-align: center;
	}
	.owm__forecast-graph-list {
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
	.owm__forecast-graph-bar {
		flex: 1 1 1px;
		display: flex;
		flex-direction: column;
		position: relative;
	}
	.owm__forecast-graph-bar + .owm__forecast-graph-bar {
		border-left: 1px solid rgba(255, 255, 255, .2);
	}
	.owm__forecast-graph-label {
		order: 2;
		margin-top: auto;
		padding: .25rem;
		position: relative;
		z-index: 1;
		font-feature-settings: 'tnum' 1;
		font-size: small;
		font-weight: 600;
	}
	.owm__forecast-graph-rain {
		width: 100%;
		position: absolute;
		bottom: 0;
		left: 0;
		background-color: var(--highlight);
		transition: height .3333s ease;
	}
	.owm__forecast-graph-details {
		order: 1;
		width: 100%;
		padding: .5rem;
		position: absolute;
		left: 0;
		z-index: 1;
		transition: bottom .3333s ease;
	}
	.owm__forecast-graph-icon {
		padding-top: 100%;
		position: relative;
	}
	.owm__forecast-graph-icon canvas {
		width: 100%;
		height: 100%;
		position: absolute;
		top: 0;
		left: 0;
	}
	.owm__forecast-graph-temperature {
		margin-top: .5rem;
	}
</style>