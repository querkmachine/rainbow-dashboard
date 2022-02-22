<template>
	<div id="app" class="wrapper">
		<Clock />
		<div class="wrapper__inner">
			<Mastodon />
			<BusTimes />
			<OpenWeatherMap />
			<Bored />
			<CatFact />
			<PiHole />
		</div>
		<PhilipsHue />
	</div>
</template>

<script>
import Bored from './components/Bored.vue';
import CatFact from './components/CatFact.vue';
import PiHole from './components/PiHole.vue';
import Clock from './components/Clock.vue';
import Mastodon from './components/Mastodon.vue';
import OpenWeatherMap from './components/OpenWeatherMap.vue';
import BusTimes from './components/BusTimes.vue';
import PhilipsHue from './components/PhilipsHue.vue';
export default {
	name: 'app',
	components: {
		Bored,
		CatFact,
		PiHole,
		Clock,
		Mastodon,
		OpenWeatherMap,
		BusTimes,
		PhilipsHue
	}
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk&display=swap');
:root {
	--highlight: #786999;
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
	font-family: 'Space Grotesk', sans-serif;
	overflow: hidden;
	cursor: none;
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
	grid-template-rows: repeat(4, 1fr);
	grid-gap: 1.5rem;
	grid-template-areas:
		'mastodon weather weather'
		'mastodon pihole pihole'
		'mastodon fact buses'
		'mastodon bored buses'
	;
	height: calc(100vh - 7rem);
	padding-top: 1rem;
	padding-bottom: 1rem;
}
.clock,
.philips-hue {
	width: 100%;
	position: absolute;
	left: 0;
}
.clock { 
	top: 0;
}
.philips-hue {
	bottom: 0;
}
.mastodon { grid-area: mastodon; }
.bus-times { grid-area: buses; }
.owm { grid-area: weather; }
.bored { grid-area: bored; }
.cat-fact { grid-area: fact; }
.pihole { grid-area: pihole; }
</style>
