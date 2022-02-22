<template>
	<div class="bored">
		<template v-if="error">ERROR: {{ error }}</template>
		<template v-if="initialized">
			<div class="bored__suggestion">
				<strong>Bored?</strong>
				Why not {{ activityFormatted }}?
			</div>
			<ul class="bored__meta">
				<li class="bored__meta-item">
					<span class="bored__meta-label">Costs</span>
					<strong class="bored__meta-value">{{ priceFormatted }}</strong>
				</li>
				<li class="bored__meta-item">
					<span class="bored__meta-label">Good for </span>
					<strong class="bored__meta-value">
						<template v-if="activityData.participants === 1">1 person</template>
						<template v-else>{{ activityData.participants }} people</template>
					</strong>
				</li>
				<li class="bored__meta-item">
					<span class="bored__meta-label">Accessible to</span>
					<strong class="bored__meta-value">{{ accessibilityFormatted }}</strong>
				</li>
			</ul>
		</template>
	</div>
</template>

<script>
import Axios from 'axios';

export default {
	name: "Bored",
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
			activityData: {}
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
			.get('https://www.boredapi.com/api/activity')
			.then((response) => {
				this.activityData = response.data;
				this.error = false;
				this.initialized = true;
			})
			.catch((error) => {
				this.error = error;
				this.initialized = false;
			})
		}
	},
	computed: {
		activityFormatted: function() {
			const firstLetter = this.activityData.activity[0];
			const restOfString = this.activityData.activity.slice(1);
			return `${firstLetter.toLowerCase()}${restOfString}`;
		},
		priceFormatted: function() {
			const p = this.activityData.price;
			if(p === 0) {
				return "nothing";
			}
			else if(p > 0 && p < 0.4) {
				return "very little";
			}
			else if(p >= 0.4 && p < 0.7) {
				return "a bit of change";
			}
			else {
				return "quite a lot";
			}
		},
		accessibilityFormatted: function() {
			const a = this.activityData.accessibility;
			if(a === 0) {
				return "anyone";
			}
			else if(a > 0 && a < 0.4) {
				return "most people";
			}
			else if(a >= .4 && a < 0.7) {
				return "some people";
			}
			else {
				return "very few people";
			}
		}
	}
}
</script>

<style scoped>
	.bored {
		padding: .75rem;
		border: 1px solid rgba(255, 255, 255, .2);
		overflow: hidden;
	}
	.bored__suggestion {
		
	}
	.bored__suggestion strong {
		display: block;
		font-size: xx-large;
		font-weight: 500;
		margin-right: .75rem;
	}
	.bored__meta {
		
		clear: both;
		display: flex;
		list-style-type: none;
		margin: 1.5rem 0 0;
		padding: 0;
	}
	.bored__meta-item {
		margin-right: 1.5rem;
	}
	.bored__meta-label {
		font-size: smaller;
		opacity: .67;
	}
	.bored__meta-value {
		display: block;
		font-weight: 500;
		
	}
</style>