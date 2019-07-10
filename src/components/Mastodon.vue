<template>
	<ol class="mastodon">
		<li class="mastodon__item" v-for="item in statuses" :key="item.id">
			<article :class="['mastodon__status', item.reblog ? 'mastodon__status--boosted' : '']">
				<div class="mastodon__avatar">
					<img v-if="item.reblog" :src="item.reblog.account.avatar" :alt="item.reblog.account.acct">
					<img :src="item.account.avatar" :alt="item.account.acct">
				</div>
				<div class="mastodon__inner">
					<header class="mastodon__header">
						<div class="mastodon__account">
							<template v-if="item.reblog">
								<strong class="mastodon__account-name">
									{{ item.reblog.account.display_name }}
									<small>{{ item.reblog.account.acct }}</small>
								</strong>
								<!-- <div class="mastodon__account-name mastodon__account-name--boosted-by">
									Boosted by
									{{ item.account.display_name }}
									<small>{{ item.account.acct }}</small>
								</div> -->
							</template>
							<template v-else>
								<strong class="mastodon__account-name">
									{{ item.account.display_name }}
									<small>{{ item.account.acct }}</small>
								</strong>
							</template>
						</div>
						<!-- <div class="mastodon__timestamp">
							{{ item.created_at }}
						</div> -->
					</header>
					<div class="mastodon__toot">
						<div class="mastodon__toot-warning" v-if="item.sensitive && item.spoiler_text">{{ item.spoiler_text }}</div>
						<div class="mastodon__toot-content" v-html="item.content"></div>
						<div class="mastodon__toot-media" v-if="item.media_attachments">
							<ol>
								<li v-for="media in item.media_attachments">
									<img :src="media.remote_url" :alt="media.description">
								</li>
							</ol>
						</div>
					</div>
				</div>
			</article>
		</li>
	</ol>
</template>

<script>
import Mastodon from 'mastodon-api';
const M = new Mastodon({
	access_token: process.env.VUE_APP_MASTODON_ACCESS_KEY,
	api_url: process.env.VUE_APP_MASTODON_API_ENDPOINT
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
				this.statuses = JSON.parse(localStorage.getItem('RD_MASTODON_STATUSES'));
				this.initialized = true;
				return true;
			}
			return false;
		},
		saveData: function() {
			localStorage.setItem('RD_MASTODON_STATUSES', JSON.stringify(this.statuses));
		},
		updateStatuses: function() {
			if(process.env.NODE_ENV === 'development' && this.loadData()) { return; }
			console.log('Pinging the API...')
			M
				.get('timelines/home', {})
				.then((response) => {
					console.log(response);
					this.statuses = response.data;
					this.error = false;
					this.initialized = true;
					this.saveData();
				})
				.catch((error) => {
					this.error = error;
					this.initialized = false;
				})
		}
	}
}
</script>

<style scoped>
.mastodon {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
	grid-gap: 1.5rem;
	margin: 0;
	padding: 0;
	list-style-type: none;
}
.mastodon__item {

}
.mastodon__status {
	display: flex;
	border: 1px solid rgba(255, 255, 255, .2);
	padding: .75rem;
}
.mastodon__header {
	display: flex;
	flex-direction: row;
	align-items: center;
	margin-bottom: .75rem;
}
.mastodon__avatar {
	flex: 0 0 50px;
	width: 50px;
	height: 50px;
	margin-right: .75rem;
	position: relative;
}
.mastodon__avatar img {
	width: 100%;
	height: 100%;
	border-radius: .25rem;
}
.mastodon__status--boosted .mastodon__avatar img:nth-child(1) {
	width: 80%;
	height: 80%;
}
.mastodon__status--boosted .mastodon__avatar img:nth-child(2) {
	width: 50%;
	height: 50%;
	position: absolute;
	right: 0;
	bottom: 0;

}
.mastodon__account {
	
}
.mastodon__account-name {
	display: block;
	font-weight: 600;
}
.mastodon__account-name small {
	margin-left: .25rem;
	font-size: smaller;
	font-weight: 400;
	opacity: .67;
}
.mastodon__account-name--boosted-by {
	font-weight: 400;
}
.mastodon__timestamp {

}
.mastodon__toot {

}
.mastodon__toot-warning {

}
.mastodon__toot-content {
	
}
.mastodon__toot-content > :first-child { margin-top: 0; }
.mastodon__toot-content > :last-child { margin-bottom: 0; }
.mastodon__toot-content a {
	color: var(--highlight);
}
.mastodon__toot-media img { max-width: 100%; }
</style>