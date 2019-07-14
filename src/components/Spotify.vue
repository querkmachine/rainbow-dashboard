<template>
	<div>Spotify</div>
</template>

<script>
import SpotifyWebApi from 'spotify-web-api-node';

// Set up Spotify API 
const SpotifyApi = new SpotifyWebApi({
	clientId: process.env.VUE_APP_SPOTIFY_CLIENT_ID,
	clientSecret: process.env.VUE_APP_SPOTIFY_CLIENT_SECRET,
	clientRedirect: 'http://localhost:8888/callback'
});

console.log(SpotifyApi);

// Get access token
SpotifyApi.authorizationCodeGrant('BQCL3qu-yHjNHR2zzW-bP1XS2bAiXqH3DmDCol-XYw3PQYn4sfK06-fZ27B1P4Sys0be5uYIH7WwhX-Y0WMW49-R6g6gusVpL-9xM61n_0ScLGW1aGBme52nNl1iiH6zfC3NS9EpsFcKXe0UFSVrC5_d2a9Y').then((data) => {
	console.log(data);
	spotifyApi.setAccessToken(data.body['access_token']);
    spotifyApi.setRefreshToken(data.body['refresh_token']);
}, (error) => {
	console.log(
	'Something went wrong when retrieving an access token',
	error.message
	);
})


export default {
	name: 'Spotify',
	data() {
		return {
			nowPlaying: {},
			nextPing: 0
		}
	},
	mounted() {
		//this.updateNowPlaying();
	},
	methods: {
		updateNowPlaying: function() {
			SpotifyApi.getMyCurrentPlaybackState()
				.then((response) => {
					console.log('RESPONSE', response);
				}, (error) => {
					console.log('ERROR', error);
				})
		}
	}
}

</script>

<style scoped>
</style>