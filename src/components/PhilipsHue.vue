<template>
	<ul class="philips-hue">
		<li v-if="error">ERROR: {{ error }}</li>
		<li v-for="item in displayDevices" :key="item.id" :class="['philips-hue__item', item.on && item.cssInvert ? 'philips-hue__item--invert' : '']" :style="item.on && item.cssBackground ? 'background-color:' + item.cssBackground : ''">
			<div class="philips-hue__label">
				{{ item.name }}
			</div>
			<div class="philips-hue__value" v-if="item.temperature">
				{{ item.temperature / 100 | round }}<span class="philips-hue__value-label">&deg;</span>
			</div>
			<div class="philips-hue__value" v-else-if="item.lightLevel">
				{{ item.lightLevel / 1000 | round }}<span class="philips-hue__value-label"> lux</span>
			</div>
			<div class="philips-hue__value" v-else-if="item.on && item.brightness">
				{{ item.brightness | round }}<span class="philips-hue__value-label">%</span>
			</div>
			<div class="philips-hue__value" v-else>
				<span class="philips-hue__value-label">Off</span>
			</div>
		</li>
	</ul>
</template>

<script>
import _ from 'lodash';
import Axios from 'axios';
import Moment from 'moment';
export default {
	name: 'PhilipsHue',
	props: {
		reloadInterval: {
			type: Number,
			default: 2000
		}
	},
	data() {
		return {
			lastUpdate: '',
			error: false,
			devices: []
		}
	},
	mounted() {
		this.updateDevices();
		setInterval(() => {
			this.updateDevices();
		}, this.reloadInterval);
	},
	computed: {
		displayDevices: function() {
			const tidyDeviceArray = [];
			this.devices.forEach((item) => {
				let lightObj = {
					verified: false,
					id: item.uniqueid,
					name: item.name,
					type: item.type
				};
				switch(item.type) {
					case 'Extended color light':
						lightObj.verified = true;
						lightObj.on = item.state.on;
						lightObj.brightness = this.normalize(item.state.bri, 0, 100, 0, 255);
						lightObj.cssBackground = `hsl(${this.normalize(item.state.hue, 0, 360, 0, 65535)}deg, ${this.normalize(item.state.sat, 0, 100, 0, 254)}%, ${this.normalize(item.state.bri, 0, 50, 0, 255)}%)`;
					break;
					case 'Dimmable light':
						lightObj.verified = true;
						lightObj.on = item.state.on;
						lightObj.brightness = this.normalize(item.state.bri, 0, 100, 0, 255);
						lightObj.cssBackground = `hsl(0deg, 0%, ${this.normalize(item.state.bri, 0, 100, 0, 255)}%)`;
						lightObj.cssInvert = lightObj.brightness > 80 ? true : false;
					break;
					case 'ZLLTemperature':
						lightObj.verified = true;
						lightObj.name = 'Ambient temperature';
						lightObj.temperature = item.state.temperature;
					break;
					case 'ZLLLightLevel':
						lightObj.verified = true;
						lightObj.name = 'Living room light level';
						lightObj.lightLevel = item.state.lightlevel;
						lightObj.daylight = item.state.daylight;
						lightObj.dark = item.state.dark;
					break;
				}
				if(lightObj.verified) tidyDeviceArray.push(lightObj);
			});
			return tidyDeviceArray.sort((a, b) => {
				return a.name.localeCompare(b.name);
			});
		}
	},
	methods: {
		normalize: function(num, toMin, toMax, fromMin, fromMax) {
			return toMin + (num - fromMin) / (fromMax - fromMin) * (toMax - toMin);
		},
		updateDevices: function() {
			Axios
				.all([
					Axios.get(`${process.env.VUE_APP_HUE_API_ENDPOINT}/${process.env.VUE_APP_HUE_API_KEY}/lights`),
					Axios.get(`${process.env.VUE_APP_HUE_API_ENDPOINT}/${process.env.VUE_APP_HUE_API_KEY}/sensors`),
				])
				.then(Axios.spread((lights, sensors) => {
					this.devices = _.concat(_.values(lights.data), _.values(sensors.data));
				}))
				.catch((error) => {
					this.error = error;
				})
				.finally(() => {
					this.lastUpdate = Moment().format('HH:mm:ss');
				});
		}
	},
	filters: {
		round: function(num) {
			return Math.round(num);
		}
	}
}
</script>

<style scoped>
.philips-hue {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
	grid-auto-rows: 120px;
	grid-gap: 1.5rem;
	margin: 0;
	padding: 0;
	list-style-type: none;
}
.philips-hue__item {
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	padding: 1rem;
	border: 1px solid rgba(255, 255, 255, .2);
	color: #fff;
}
.philips-hue__item--invert {
	color: #000;
}
.philips-hue__label {
	font-size: smaller;
}
.philips-hue__value {
	font-size: xx-large;
	font-weight: 500;
}
.philips-hue__value-label {
	font-size: smaller;
	font-weight: 300;
	opacity: .67;
}
</style>