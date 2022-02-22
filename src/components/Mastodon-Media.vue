<template>
	<div :class="['lcars-mastodon-media', 'lcars-mastodon-media--items-' + data.length]" v-if="data">
		<div class="lcars-mastodon-media__item" v-for="item in data" :key="item.id">
			<template v-if="item.type === 'image'">
				<img class="lcars-mastodon-media__image" :src="item.preview_url" :alt="item.description">
			</template>
			<template v-else-if="item.type === 'video'">
				<video class="lcars-mastodon-media__video" :poster="item.preview_url" autoplay muted loop>
					<source :src="item.url">
				</video>
			</template>
			<template v-else>
				Unsupported media type. Fix it, Kim, fix it.<br>
				(Returned type: {{ item.type }})
			</template>
		</div>
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

<style scoped lang="scss">
.lcars-mastodon-media {
	display: grid;
	grid-gap: .25rem;
	&--items-1 {
		grid-template-columns: 1fr;
		grid-template-areas: 'a';
	}
	&--items-2 {
		grid-template-columns: 1fr 1fr;
		grid-template-areas: 'a b';
	}
	&--items-3 {
		grid-template-columns: 2fr 1fr;
		grid-template-areas: 'a b' 'a c';
	}
	&--items-4 {
		grid-template-columns: 1fr 1fr;
		grid-template-areas: 'a b' 'c d';
	}
	&__item {
		&:nth-child(1) { grid-area: a; }
		&:nth-child(2) { grid-area: b; }
		&:nth-child(3) { grid-area: c; }
		&:nth-child(4) { grid-area: d; }
	}
	&__image,
	&__video {
		width: 100%;
		height: auto;
	}
	&__image {
		
	}
	&__video {
		aspect-ratio: 16 / 9;
	}
}
</style>