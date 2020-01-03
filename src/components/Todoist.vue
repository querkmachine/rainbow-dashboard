<template>
	<section class="todoist">
		<template v-if="initialized">
			<header class="todoist__header">
				Due in Todoist 
			</header>
			<ul class="todoist__list">
				<li class="todoist__item" v-for="item in tasksWithDueDates" :key="item.id">
					<div class="todoist__task">
						{{ item.content }}
						<template v-for="i in (item.priority - 1)">🚩️ </template>
					</div>
					<div class="todoist__due">{{ item.due.date | dateDifference }}</div>
				</li>
			</ul>
		</template>
	</section>
</template>

<script>
import Axios from 'axios';
import Moment from 'moment';
import Twemoji from 'twemoji';
export default {
	name: 'Todoist',
	props: {
		reloadInterval: {
			type: Number,
			default: 3600000 // 1 hour
		}
	},
	data() {
		return {
			initialized: false,
			error: false,
			tasks: []
		}
	},
	mounted() {
		this.getTasks();
		setInterval(() => {
			this.getTasks();
		}, this.reloadInterval);
	},
	updated() {
		Twemoji.parse(document.querySelectorAll('.todoist')[0], {
			folder: 'svg',
			ext: '.svg'
		});
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
		loadData: function() {
			if(localStorage.getItem('RD_TODOIST_TASKS')) {
				this.tasks = JSON.parse(localStorage.getItem('RD_TODOIST_TASKS'));
				this.initialized = true;
				return true;
			}
			return false;
		},
		saveData: function() {
			localStorage.setItem('RD_TODOIST_TASKS', JSON.stringify(this.tasks));
		},
		getTasks: function() {
			if(process.env.NODE_ENV === 'development' && this.loadData()) { return; }
			Axios
				.get('https://api.todoist.com/rest/v1/tasks', {
					headers: {
						'Authorization': `Bearer ${process.env.VUE_APP_TODOIST_API_TOKEN}`
					}
				})
				.then((response) => {
					this.tasks = response.data;
					this.error = false;
					this.initialized = true;
					this.saveData();
				})
				.catch((error) => {
					this.error = error;
					this.initialized = false;
				})
		}
	},
	filters: {
		dateDifference: function(datetime) {
			const taskDate = Moment(datetime);
			if(taskDate.isSame(Moment(), 'day')) {
				return 'today';
			}
			else if(taskDate.isSame(Moment().subtract(1, 'days'), 'day')) {
				return 'yesterday';
			}
			else if(taskDate.isSame(Moment().add(1, 'days'), 'day')) {
				return 'tomorrow';
			}
			else if(taskDate.isBefore(Moment())) {
				return `${Math.abs(taskDate.diff(Moment(), 'days'))} days ago`;
			}
			else if(taskDate.isAfter(Moment())) {
				return `in ${taskDate.diff(Moment(), 'days') + 1} days`;
			}
			else {
				return datetime;
			}
		}
	}
}
</script>

<style scoped>
.todoist {
	border: 1px solid rgba(255, 255, 255, .2);
	overflow: hidden;
}
.todoist__header {
	padding: .75rem;
	font-size: large;
	font-weight: 500;
}
.todoist__list {
	margin: 0;
	padding: 0;
	list-style-type: none;
}
.todoist__item {
	display: flex;
	flex-direction: row;
	align-items: center;
	padding: .75rem;
}
.todoist__item + .todoist__item {
	border-top: 1px solid rgba(255, 255, 255, .2);
}
.todoist__task {
	padding-right: .5rem;
}
.todoist__due {
	margin-left: auto;
	font-size: smaller;
	font-feature-settings: 'tnum' 1;
	text-align: right;
	opacity: .67;
}
</style>