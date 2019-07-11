<template>
	<div :class="['mastodon-media', 'mastodon-media--items-' + data.length]" v-if="data">
		<ol>
			<li v-for="item in data" :key="item.id">
				<img :src="item.remote_url" :alt="item.description">
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

}
.mastodon-media--items-1 {
	
}
.mastodon-media--items-2 {
	
}
.mastodon-media--items-3 {
	
}
.mastodon-media--items-4 {
	
}
.mastodon-media img { max-width: 100%; }
</style>