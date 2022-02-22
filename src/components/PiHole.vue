<template>
	<div class="pihole">
		<template v-if="error">ERROR: {{ error }}</template>
		<template v-if="initialized">
			<div class="pihole__inner">
				<div class="pihole__heading">PiHole &mdash; {{ summary.status }}</div>
				<dl class="pihole__data">
					<div class="pihole__item">
						<dt class="pihole__key">DNS queries today</dt>
						<dd class="pihole__value">{{ formatNumber(summary.dns_queries_today) }}</dd>
					</div>
					<div class="pihole__item">
						<dt class="pihole__key">ads blocked today ({{ summary.ads_percentage_today.toFixed(2) }}%)</dt>
						<dd class="pihole__value">{{ formatNumber(summary.ads_blocked_today) }}</dd>
					</div>
					<div class="pihole__item">
						<dt class="pihole__key">connected clients</dt>
						<dd class="pihole__value">{{ formatNumber(summary.unique_clients) }}</dd>
					</div>
				</dl>
			</div>
		</template>
		<template v-if="graphInitialized">
			<ol class="pihole__graph">
				<li v-for="(domains, timestamp) in historic.domains_over_time" :key="timestamp" class="pihole__graph-item">
					<div class="pihole__graph-bar pihole__graph-bar--domains" :style="'height:' + (100 / graphHighestBar * domains) + '%'"></div>
					<div class="pihole__graph-bar pihole__graph-bar--ads" :style="'height:' + (100 / graphHighestBar * historic.ads_over_time[timestamp]) + '%'"></div>
				</li>
			</ol>
		</template>
	</div>
</template>

<script>
import Axios from 'axios';

export default {
	name: "PiHole",
	props: {
		reloadInterval: {
			type: Number,
			default: 30000 // 30 seconds
		}
	},
	data() {
		return {
			error: false,
			initialized: false,
			graphInitialized: false,
			summary: {},
			historic: {}
		}
	},
	mounted() {
		this.update();
		setInterval(() => {
			this.update();
		}, this.reloadInterval);
	},
	methods: {
		update: function() {
			Axios
			.get('http://192.168.0.42/admin/api.php?summaryRaw')
			.then((response) => {
				this.summary = response.data;
				this.error = false;
				this.initialized = true;
			})
			.catch((error) => {
				this.error = error;
				this.initialized = false;
			})
			Axios
			.get('http://192.168.0.42/admin/api.php?overTimeData10mins')
			.then((response) => {
				this.historic = response.data;
				this.error = false;
				this.graphInitialized = true;
			})
			.catch((error) => {
				this.error = error;
				this.graphInitialized = false;
			})
		},
		formatNumber: function(num) {
			return new Intl.NumberFormat().format(num);
		}
	},
	computed: {
		graphHighestBar: function() {
			const data = this.historic.domains_over_time;
			let highest = 0;
			for(const key in data) {
				if(data[key] > highest) {
					highest = data[key];
				}
			}
			return highest;
		}
	}
}
</script>

<style scoped>
	.pihole {
		padding: .75rem;
		border: 1px solid rgba(255, 255, 255, .2);
		overflow: hidden;
		position: relative;
	}
	.pihole__inner {
		display: flex;
		flex-direction: column;
		height: 100%;
		position: relative;
		z-index: 1;
	}
	.pihole__heading {
		margin-bottom: .75rem;
		font-size: large;
		font-weight: 500;
	}
	.pihole__data {
		margin: 0;
		padding: 0;
		flex-grow: 1;
		display: flex;
		align-items: center;
	}
	.pihole__item {
		flex: 1 1 1px;
		display: flex;
		flex-direction: column-reverse;
		text-align: center;
	}
	.pihole__key {
		opacity: .67;
		font-weight: 500;
		margin: 0;
	}
	.pihole__value {
		margin: 0;
		font-size:xx-large;
	}
	.pihole__graph {
		width: 100%;
		height: 100%;
		position: absolute;
		top: 0;
		left: 0;
		display: flex;
		list-style-type: none;
		margin: 0;
		padding: 0;
	}
	.pihole__graph-item {
		flex: 1 1 1px;
		position: relative;
	}
	.pihole__graph-bar {
		width: 100%;
		position: absolute;
		bottom: 0;
		left: 0;
	}
	.pihole__graph-bar--domains {
		background-color: #222;
	}
	.pihole__graph-bar--ads {
		background-color: var(--highlight);
	}
</style>