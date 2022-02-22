<template>
	<div class="cat-fact">
		<template v-if="error">ERROR: {{ error }}</template>
		<template v-if="initialized">
			<div class="cat-fact__heading">
				Cat fact!
			</div>
			<div class="cat-fact__fact">
				{{ fact.fact }}
			</div>
		</template>
	</div>
</template>

<script>
import Axios from 'axios';

export default {
	name: "CatFact",
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
			fact: {}
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
			.get('https://catfact.ninja/fact')
			.then((response) => {
				this.fact = response.data;
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
		
	}
}
</script>

<style scoped>
	.cat-fact {
		padding: .75rem;
		border: 1px solid rgba(255, 255, 255, .2);
		overflow: hidden;
	}
	.cat-fact__heading {
		margin-bottom: .75rem;
		font-size: large;
		font-weight: 500;
	}
	.cat-fact__fact {
		font-size: x-large;
	}
</style>