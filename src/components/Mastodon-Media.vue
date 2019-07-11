<template>
	<div :class="['mastodon-media', 'mastodon-media--items-' + data.length]" v-if="data">
		<ol class="mastodon-media__list">
			<li class="mastodon-media__item" v-for="item in data" :key="item.id">
				<template v-if="item.type === 'image'">
					<img class="mastodon-media__image" :src="item.remote_url" :alt="item.description">
				</template>
				<template v-else-if="item.type === 'video'">
					VIDEO GOES HERE
				</template>
				<template v-else>
					Unsupported media type. Fix it, Kim, fix it.
				</template>
			</li>
		</ol>
	</div>
</template>

<script>
export default {
	name: 'MastodonMedia',
	props: {
		data: {
			type: Array,
			required: true
		}
	}
}
</script>

<style scoped>
.mastodon-media {
	margin-top: 1rem;
	padding-top: 56.25%;
	border: 1px solid rgba(255, 255, 255, .2);
	position: relative;
}
.mastodon-media--items-3,
.mastodon-media--items-4 {
	padding-top: 75%;
}
.mastodon-media__list {
	display: grid;
	width: 100%;
	height: 100%;
	margin: 0;
	padding: 0;
	position: absolute;
	top: 0;
	left: 0;
	list-style-type: none;
}
.mastodon-media--items-1 .mastodon-media__list {
	grid-template-columns: 1fr;
	grid-template-rows: 100%;
	grid-template-areas: 'a';
}
.mastodon-media--items-2 .mastodon-media__list {
	grid-template-columns: repeat(2, 1fr);
	grid-template-rows: 100%;
	grid-template-areas: 'a b';
}
.mastodon-media--items-3 .mastodon-media__list {
	grid-template-columns: 2fr 1fr;
	grid-template-rows: repeat(2, 50%);
	grid-template-areas: 'a b' 'a c';
}
.mastodon-media--items-4 .mastodon-media__list {
	grid-template-columns: repeat(2, 1fr);
	grid-template-rows: repeat(2, 50%);	
	grid-template-areas: 'a b' 'c d';
}
.mastodon-media__item {
	display: flex;
	justify-content: center;
	align-items: center;
}
.mastodon-media__item:nth-child(1) { grid-area: a; }
.mastodon-media__item:nth-child(2) { grid-area: b; }
.mastodon-media__item:nth-child(3) { grid-area: c; }
.mastodon-media__item:nth-child(4) { grid-area: d; }
.mastodon-media__image {
	max-width: 100%;
	max-height: 100%;
}
</style>