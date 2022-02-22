<template>
	<div class="lcars-hue">
		<div v-for="item in displayDevices" :key="item.id" class="lcars-hue__item" :style="item.on && item.cssBackground ? 'background-color:' + item.cssBackground : ''">
			<span class="lcars-hue__name">{{ item.name }}</span><br>
			<span class="lcars-hue__status">
				<template v-if="item.temperature">
					{{ item.temperature / 100 | round }}&deg;
				</template>
				<template v-else-if="item.lightLevel">
					{{ item.lightLevel / 1000 | round }} lux
				</template>
				<template v-else-if="item.on && item.brightness">
					{{ item.brightness | round }}%
				</template>
				<template v-else>
					Off
				</template>
			</span>
		</div>
	</div>
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
						lightObj.cssBackground = `hsl(${this.normalize(item.state.hue, 0, 360, 0, 65535)}deg, ${this.normalize(item.state.sat, 0, 100, 0, 254)}%, ${this.normalize(item.state.bri, 25, 50, 0, 255)}%)`;
					break;
					case 'Dimmable light':
						lightObj.verified = true;
						lightObj.on = item.state.on;
						lightObj.brightness = this.normalize(item.state.bri, 0, 100, 0, 255);
						lightObj.cssBackground = `hsl(0deg, 0%, ${this.normalize(item.state.bri, 25, 100, 0, 255)}%)`;
						lightObj.cssInvert = lightObj.brightness > 80 ? true : false;
					break;
					// case 'ZLLTemperature':
					// 	lightObj.verified = true;
					// 	lightObj.name = 'Ambient temperature';
					// 	lightObj.temperature = item.state.temperature;
					// break;
					// case 'ZLLLightLevel':
					// 	lightObj.verified = true;
					// 	lightObj.name = 'Hallway light level';
					// 	lightObj.lightLevel = item.state.lightlevel;
					// 	lightObj.daylight = item.state.daylight;
					// 	lightObj.dark = item.state.dark;
					// break;
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

<style scoped lang="scss">
.lcars-hue {
	flex-grow: 0;
	&__item {
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		align-items: flex-end;
		min-height: 3.25rem;
		margin-top: .25rem;
		margin-bottom: .25rem;
		padding: .5rem;
		color: var(--canvas-background-color);
		background-color: var(--color, var(--color-neutral-1));
		text-transform: uppercase;
		transition: background-color .3333s ease-in-out;
	}
	&__name {
		font-family: var(--font-heading);
	}
	&__status {
		
	}
}
</style>