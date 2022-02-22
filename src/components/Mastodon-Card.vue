<template>
	<div class="mastodon-card">
		<img class="mastodon-card__media" v-if="data.image" :src="data.image" :alt="data.title" :width="data.width" :height="data.height">
		<strong class="mastodon-card__title">{{ data.title }}</strong>
		<div class="mastodon-card__content" v-if="data.description">
			<p>{{ data.description }}</p>
		</div>
	</div>
</template>

<script>
export default {
	name: 'MastodonCard',
	props: {
		data: {
			type: Object,
			required: true
		}
	}
}
</script>

<style scoped>
.mastodon-card {
	margin-top: 1rem;
	padding: .5rem;
	padding-left: 6rem;
	border: 1px solid rgba(255, 255, 255, .2);
	font-size: smaller;
	overflow: hidden;
}
.mastodon-card__media {
	width: 5rem;
	height: 5rem;
	object-fit: cover;
	float: left;
	margin-left: -5.5rem;
}
.mastodon-card__title {
	display: block;
	margin-bottom: .25rem;
}
.mastodon-card__content {
	max-width: 42em;
}
.mastodon-card__content > :first-child { margin-top: 0; }
.mastodon-card__content > :last-child { margin-bottom: 0; }
</style>