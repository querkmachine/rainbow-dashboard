<template>
	<div class="mastodon">hi</div>
</template>

<script>
import Mastodon from 'mastodon';
const M = new Mastodon({
	access_token: process.env.VUE_APP_MASTODON_ACCESS_KEY,
	api_url: VUE_APP_MASTODON_API_ENDPOINT
});
export default {
	name: 'Mastodon',
	data() {
		return {
			error: false,
			initialized: false,
			statuses: []
		}
	},
	mounted() {
		this.updateStatuses();
	},
	methods: {
		loadData: function() {
			if(localStorage.getItem('RD_MASTODON_STATUSES')) {
				this.forecastData = JSON.parse(localStorage.getItem('RD_MASTODON_STATUSES'));
				this.initialized = true;
				return true;
			}
			return false;
		},
		saveData: function() {
			localStorage.setItem('RD_MASTODON_STATUSES', JSON.stringify(this.forecastData));
		},
		updateStatuses: function() {
			if(this.loadData()) { return; }
			M
				.get('timelines/home', {})
				.then((response) => {
					console.log(response);
					this.statuses = response;
				})
		}
	}
}
</script>

<style scoped>
</style>