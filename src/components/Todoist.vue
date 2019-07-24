<template>
	<div>
		<div>Todo today</div>
		<ul>
			<li v-for="item in tasksWithDueDates" :key="item.id">
				{{ item.content }} — 
				{{ item.due.date | dateDifference }}
			</li>
		</ul>
	</div>
</template>

<script>
import Axios from 'axios';
import Moment from 'moment';
export default {
	name: 'Todoist',
	data() {
		return {
			tasks: []
		}
	},
	mounted() {
		this.getTasks();
	},
	computed: {
		tasksWithDueDates: function() {
			const tasks = this.tasks.filter(task => typeof task.due !== 'undefined');
			return tasks.sort((a, b) => {
				a = new Date(a.due.date);
				b = new Date(b.due.date);
				return a > b ? 1 : a < b ? -1 : 0;
			})
		}
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
					this.tasks = response.data;
				})
				.catch((error) => {
					console.log(error);
				})
		}
	},
	filters: {
		dateDifference: function(datetime) {
			const today = Moment();
			const taskDate = Moment(datetime);
			console.log(taskDate, today.add(1, 'days'));
			if(taskDate.isSame(today, 'day')) {
				return 'today';
			}
			else if(taskDate.isSame(today.subtract(1, 'days'), 'day')) {
				return 'yesterday';
			}
			else if(taskDate.isSame(today.add(1, 'days'), 'day')) {
				return 'tomorrow';
			}
			else if(taskDate.isBefore(today)) {
				return 'x days ago';
			}
			else if(taskDate.isAfter(today)) {
				return 'in x days';
			}
			else {
				return datetime;
			}
		}
	}
}
</script>

<style scoped>
</style>