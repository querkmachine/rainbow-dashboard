<template>
	<div>Todoist</div>
</template>

<script>
import Axios from 'axios';
export default {
	name: 'Todoist',
	data() {
		return {

		}
	},
	mounted() {
		this.getTasks();
	},
	methods: {
		getTasks: function() {
			Axios
				.get('https://api.todoist.com/rest/v1/tasks', {
					headers: {
						'Authorization': `Bearer ${process.env.VUE_APP_TODOIST_API_TOKEN}`
					}
				})
				.then((response) => {
					console.log(response.data);
				})
		}
	}
}
</script>

<style scoped>
</style>