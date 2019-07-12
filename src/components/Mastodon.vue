<template>
	<ol class="mastodon">
		<li class="mastodon__item" v-for="item in statuses" :key="item.id">
			<article :class="['mastodon__status', item.reblog ? 'mastodon__status--boosted' : '']">
				<div class="mastodon__metadata">
					<div class="mastodon__avatar">
						<img v-if="item.reblog" :src="item.reblog.account.avatar" :alt="item.reblog.account.acct">
						<img :src="item.account.avatar" :alt="item.account.acct">
					</div>
					<div class="mastodon__timestamp">
						<Timeago :datetime="item.created_at" :auto-update="1" />
					</div>
				</div>
				<div class="mastodon__inner">
					<header class="mastodon__header">
						<div class="mastodon__account">
							<strong class="mastodon__account-name">
								<template v-if="item.reblog">
									<span v-html="customEmoji(item.reblog.account.display_name, item.reblog.account.emojis)"></span>
									<small>{{ item.reblog.account.acct }}</small>
								</template>
								<template v-else>
									<span v-html="customEmoji(item.account.display_name, item.account.emojis)"></span>
									<small>{{ item.account.acct }}</small>
								</template>
							</strong>
						</div>
					</header>
					<div class="mastodon__toot">
						<div class="mastodon__content-warning" v-if="item.spoiler_text"><mark>{{ item.spoiler_text }}</mark></div>
						<div class="mastodon__content" v-html="customEmoji(item.content, item.emojis)"></div>
						<mastodon-media v-if="item.reblog && item.reblog.media_attachments.length" :data="item.reblog.media_attachments" />
						<mastodon-media v-else-if="item.media_attachments.length" :data="item.media_attachments" />
						<mastodon-card v-else-if="item.reblog && item.reblog.card" :data="item.reblog.card" />
						<mastodon-card v-else-if="item.card" :data="item.card" />
					</div>
				</div>
			</article>
		</li>
	</ol>
</template>

<script>
import Timeago from 'vue-timeago';
import Mastodon from 'mastodon-api';
import MastodonCard from './Mastodon-Card.vue';
import MastodonMedia from './Mastodon-Media.vue';
import Vue from 'vue';

// Timeago config
Vue.use(Timeago, {
	name: 'Timeago',
	locale: 'en',
	converter(date, locale, { includeSeconds, addSuffix = true }) {
		const distanceInWordsStrict = require('date-fns/distance_in_words_strict')
		return distanceInWordsStrict(Date.now(), date, { locale, addSuffix, includeSeconds });
	}
});

// Set up Mastodon API
const M = new Mastodon({
	access_token: process.env.VUE_APP_MASTODON_ACCESS_KEY,
	api_url: `https://${process.env.VUE_APP_MASTODON_API_ENDPOINT}`
});

export default {
	name: 'Mastodon',
	components: {
		MastodonCard,
		MastodonMedia
	},
	data() {
		return {
			error: false,
			initialized: false,
			statuses: [],
			socket: {}
		}
	},
	mounted() {
		this.loadInitialStatuses();
		this.startListening();
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
					this.trimStatusArray();
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
					this.trimStatusArray();
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
		},
		trimStatusArray: function() {
			this.statuses = this.statuses.slice(0, 8);
		}
	}
}
</script>

<style scoped>
.mastodon {
	margin: 0;
	padding: 0;
	position: relative;
	list-style-type: none;
	overflow: hidden;
}
.mastodon::after {
	content: '';
	width: 100%;
	height: 150px;
	position: absolute;
	bottom: 0;
	left: 0;
	background-image: linear-gradient(
		to top,
		hsl(0, 0%, 0%) 0%,
		hsla(0, 0%, 0%, 0.738) 19%,
		hsla(0, 0%, 0%, 0.541) 34%,
		hsla(0, 0%, 0%, 0.382) 47%,
		hsla(0, 0%, 0%, 0.278) 56.5%,
		hsla(0, 0%, 0%, 0.194) 65%,
		hsla(0, 0%, 0%, 0.126) 73%,
		hsla(0, 0%, 0%, 0.075) 80.2%,
		hsla(0, 0%, 0%, 0.042) 86.1%,
		hsla(0, 0%, 0%, 0.021) 91%,
		hsla(0, 0%, 0%, 0.008) 95.2%,
		hsla(0, 0%, 0%, 0.002) 98.2%,
		hsla(0, 0%, 0%, 0) 100%
	);
}
.mastodon__item + .mastodon__item {
	margin-top: -1px;
}
.mastodon__status {
	display: flex;
	border: 1px solid rgba(255, 255, 255, .2);
	padding: .75rem;
}
.mastodon__metadata {
	flex: 0 0 50px;
	margin-right: .75rem;
	text-align: center;
}
.mastodon__header {
	display: flex;
	flex-direction: row;
	align-items: center;
	margin-bottom: .75rem;
}
.mastodon__avatar {
	width: 50px;
	height: 50px;
	position: relative;
}
.mastodon__avatar img {
	width: 100%;
	height: 100%;
	border-radius: .25rem;
}
.mastodon__timestamp {
	margin-top: .75rem;
	font-size: smaller;
	opacity: .67;
}
.mastodon__inner {
	flex-grow: 1;
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
.mastodon__toot {

}
.mastodon__content-warning {
	margin-bottom: .25rem;
}
.mastodon__content-warning mark {
	color: inherit;
	background-color: var(--highlight);
	box-shadow: -.25rem 0 0 0 var(--highlight), .25rem 0 0 0 var(--highlight);
	box-decoration-break: clone;
}
.mastodon__content {
	line-height: 1.25;
}
.mastodon__content >>> a {
	color: var(--highlight);
}
.mastodon__content >>> a .invisible:first-child { display: none; }
.mastodon__content > :first-child { margin-top: 0; }
.mastodon__content > :last-child { margin-bottom: 0; }
</style>