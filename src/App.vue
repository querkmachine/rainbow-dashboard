<template>
	<div id="app" class="wrapper">
		<Clock />
		<div class="wrapper__inner">
			<Mastodon />
			<DarkSky :lat="51.457357" :lng="-2.618500" />
			<PhilipsHue />
		</div>
	</div>
</template>

<script>
import Twemoji from 'twemoji';
import Clock from './components/Clock.vue';
import DarkSky from './components/DarkSky.vue';
import PhilipsHue from './components/PhilipsHue.vue';
import Mastodon from './components/Mastodon.vue';
export default {
	name: 'app',
	components: {
		Clock,
		DarkSky,
		PhilipsHue,
		Mastodon
	},
	mounted() {
		Twemoji.parse(document.body, {
			folder: 'svg',
			ext: '.svg'
		});
	}
}
</script>

<style>
@import url('https://rsms.me/inter/inter.css');
:root {
	--highlight: #e5218c;
}
* {
	box-sizing: border-box;
}
*::before,
*::after {
	box-sizing: inherit;
}
html,
body {
	margin: 0;
}
body {
	color: #fff;
	background-color: #000;
	font-family: 'Inter', sans-serif;
	overflow: hidden;
	cursor: none;
}
@supports (font-variation-settings: normal) {
	html { font-family: 'Inter var', sans-serif; }
}
.emoji {
	height: 1em;
	width: 1em;
	margin: 0 .05em 0 .1em;
	vertical-align: -0.1em;
}
.wrapper {
	width: 100vw;
	height: 100vh;
	position: relative;
}
.wrapper__inner {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	grid-template-rows: repeat(2, 1fr);
	grid-gap: 3rem;
	grid-template-areas:
		'mastodon darksky darksky'
		'mastodon phue phue'
	;
	height: calc(100vh - 3rem);
	padding: 1rem;
}
.clock { 
	width: 100%;
	position: absolute;
	top: 0;
	left: 0;
}
.mastodon { grid-area: mastodon; }
.dark-sky { grid-area: darksky; }
.philips-hue { grid-area: phue; }
</style>
