<template>
	<div class="lcars-pihole">
		<table class="lcars-pihole__table" v-if="initialized">
			<tbody>
				<tr>
					<th scope="row"><span>Queries</span></th>
					<td>{{ summary.dns_queries_today }}</td>
					<td v-for="(domains, timestamp) in historic.domains_over_time" :key="timestamp">{{ historic.domains_over_time[timestamp] }}</td>
				</tr>
				<tr>
					<th scope="row"><span>Blocked</span></th>
					<td>{{ summary.ads_blocked_today }}</td>
					<td v-for="(domains, timestamp) in historic.ads_over_time" :key="timestamp">{{ historic.ads_over_time[timestamp] }}</td>
				</tr>
				<tr>
					<th scope="row"><span>%</span></th>
					<td>{{ summary.ads_percentage_today.toFixed(3) }}</td>
					<td v-for="(domains, timestamp) in historic.domains_over_time" :key="timestamp">{{ (100 / historic.domains_over_time[timestamp] * historic.ads_over_time[timestamp]).toFixed(3) }}</td>
				</tr>
			</tbody>
		</table>
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
		}
	}
}
</script>

<style scoped lang="scss">
	.lcars-pihole {
		font-family: var(--font-heading);
		text-align: right;
		text-transform: uppercase;
		overflow: hidden;
		&__table {
			width: 100%;
			margin: 0;
			padding: 0;
			border-collapse: collapse;
		}
		tr {
			&:not(:first-child) :is(th, td) {
				border-top: .25rem solid var(--canvas-background-color);
			}
		}
		th,
		td {
			margin: 0;
			padding: 0;
			border: 0;
			vertical-align: baseline;
		}
		th {
			width: var(--label-width);
			margin-top: .25rem;
			padding: .125rem .5rem .125rem 1rem;
			color: var(--canvas-background-color);
			background-color: var(--color-secondary-1);
			border-radius: 1rem 0 0 1rem;
		}
		td {
			padding: .125rem 0 .125rem .5rem;
			color: var(--color-primary-3);
			animation-name: piholeNumbers;
			animation-timing-function: linear;
			animation-iteration-count: infinite;
			animation-duration: 4s;
			font-variant-numeric: tabular-nums;
			&:nth-of-type(1) {
				padding-right: .5rem;
				border-right: .25rem solid var(--color-secondary-1);
			}
			&:nth-of-type(n+22) {
				display: none;
			}
		}
		@for $i from 1 through 4 {
			tr:nth-child(#{$i}) td { animation-delay: (1s * $i) + 3s; }
		}
	}
	
	@keyframes piholeNumbers {
		0%,
		20%,
		75%,
		100% { color: var(--color-primary-3); }
		25%,
		45% { color: var(--color-secondary-1); }
		50%,
		70% { color: var(--color-primary-1); }
	}
</style>