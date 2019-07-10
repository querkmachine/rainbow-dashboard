<template>
	<div id="app">
		<Clock />
		<PhilipsHue />
		<DarkSky :lat="51.454330" :lng="-2.588680" />
	</div>
</template>

<script>
import Twemoji from 'twemoji';
import Clock from './components/Clock.vue';
import PhilipsHue from './components/PhilipsHue.vue';
import DarkSky from './components/DarkSky.vue';
export default {
	name: 'app',
	components: {
		Clock,
		PhilipsHue,
		DarkSky
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
</style>
