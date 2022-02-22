<template>
	<ol class="lcars-mastodon" v-if="initialized">
		<li class="lcars-mastodon__toot" v-for="item in displayedStatuses" :key="item.id">
			<div class="lcars-mastodon__meta">
				<span class="lcars-mastodon__meta-author">
					<template v-if="item.reblog">
						{{ item.reblog.account.acct }}
					</template>
					<template v-else>
						{{ item.account.acct }}
					</template>
				</span>
				<span class="lcars-mastodon__meta-reblog" v-if="item.reblog">
					{{ item.account.acct }}
				</span>
				<span class="lcars-mastodon__meta-timestamp">
					<Timeago :datetime="item.created_at" :auto-update="1" :dictionary="timeagoDictionary" />
				</span>
			</div>
			<div class="lcars-mastodon__body">
				<mastodon-media v-if="item.reblog && item.reblog.media_attachments.length" :data="item.reblog.media_attachments" />
				<mastodon-media v-else-if="item.media_attachments.length" :data="item.media_attachments" />
				<div class="lcars-mastodon__cw" v-if="item.spoiler_text" v-html="customEmoji(item.spoiler_text, item.emojis)"></div>
				<div class="lcars-mastodon__content" v-if="item.content" v-html="customEmoji(item.content, item.emojis)"></div>
			</div>
		</li>
	</ol>
</template>

<script>
import Mastodon from 'mastodon-api';
import Twemoji from 'twemoji';

import Timeago from './Timeago.vue';
import MastodonMedia from './Mastodon-Media.vue';

// Set up Mastodon API
const M = new Mastodon({
	access_token: process.env.VUE_APP_MASTODON_ACCESS_KEY,
	api_url: `https://${process.env.VUE_APP_MASTODON_API_ENDPOINT}`
});

export default {
	name: 'Mastodon',
	components: {
		Timeago,
		MastodonMedia
	},
	data() {
		return {
			error: false,
			initialized: false,
			statuses: [],
			socket: {},
			timeagoDictionary: {
				now: ['now', 'now'],
				second: ['%ss', 'in %ss'],
				seconds: ['%ss', 'in %ss'],
				minute: ['%sm', 'in %sm'],
				minutes: ['%sm', 'in %sm'],
				hour: ['%sh', 'in %sh'],
				hours: ['%sh', 'in %sh'],
				day: ['%sd', 'in %sd'],
				days: ['%sd', 'in %sd'],
				week: ['%swk', 'in %swk'],
				weeks: ['%swk', 'in %swk'],
				month: ['%smo', 'in %smo'],
				months: ['%smo', 'in %smo'],
				year: ['%syr', 'in %syr'],
				years: ['%syr', 'in %syr']
			}
		}
	},
	mounted() {
		this.loadInitialStatuses();
		this.startListening();
	},
	updated() {
		Twemoji.parse(document.querySelectorAll('.mastodon')[0], {
			folder: 'svg',
			ext: '.svg'
		});
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
		loadInitialStatuses: function() {
			if(process.env.NODE_ENV === 'development' && this.loadData()) { return; }
			M
				.get('timelines/home', {})
				.then((response) => {
					this.statuses = response.data;
					this.error = false;
					this.initialized = true;
					this.saveData();
				})
				.catch((error) => {
					this.error = error;
					this.initialized = false;
				})
		},
		startListening: function() {
			this.socket = new WebSocket(`wss://${process.env.VUE_APP_MASTODON_API_ENDPOINT}streaming?access_token=${process.env.VUE_APP_MASTODON_ACCESS_KEY}&stream=user`);
			this.socket.onmessage = (event) => {
				const data = JSON.parse(event.data);
				if(data.event === 'update') {
					const payload = JSON.parse(data.payload);
					this.statuses.unshift(payload);
				}
				else if(data.event === 'delete') {
					const index = this.statuses.findIndex((status) => {
						return status.id === data.payload;
					});
					if(index !== -1) {
						this.statuses.splice(index, 1);
					}
				}
			}
			this.socket.onclose = () => {
				this.startListening();
			}
		},
		customEmoji: function(string, emojiArray) {
			for(let i = 0; i < emojiArray.length; i++) {
				string = string.replace(`:${emojiArray[i].shortcode}:`, `<img class="emoji" src="${emojiArray[i].static_url}" alt="${emojiArray[i].shortcode}">`);
			}
			return string;
		}
	},
	computed: {
		displayedStatuses: function() {
			return this.statuses.slice(0, 10);
		}
	}
}
</script>

<style scoped lang="scss">
	.lcars-mastodon {
		list-style-type: none;
		&__toot {
			margin-bottom: 1rem;
		}
		&__meta {
			display: flex;
			flex-direction: row-reverse;
			padding-right: 1rem;
			padding-left: 1rem;
			border-radius: 1rem;
			background-color: var(--color-primary-1);
		}
		&__meta-author {
			padding: .125rem .5rem;
			background-color: var(--canvas-background-color);
			color: var(--color-primary-2);
			text-transform: uppercase;
		}
		&__meta-timestamp {
			margin-right: auto;
			padding: .125rem .5rem;
			border-width: 0 .25rem; 
			border-style: solid;
			border-color: var(--canvas-background-color);
			color: var(--canvas-background-color);
			background-color: var(--color-primary-2);
			font-variant-numeric: tabular-nums;
		}
		&__meta-reblog {
			padding: .125rem .5rem;
			color: var(--canvas-background-color);
			text-transform: uppercase;
		}
		&__body {
			padding: .5rem 1.5rem;
			text-align: left;
			overflow: hidden;
			.lcars-mastodon-media {
				width: 8rem;
				float: right;
				margin-left: .5rem;
			}
		}
		&__cw {
			color: var(--color-secondary-1);
			text-transform: uppercase;
		}
		&__content {
			line-height: 1.2;
		}
	}
</style>

<style lang="scss">
.lcars-mastodon {
	&__content {
		a {
			color: var(--color-secondary-2);
			text-decoration: none;
			.invisible:first-child { display: none; }
		}
	}
}
</style>