<template>
	<div id="app" class="wrapper">
		<DynamicHighlight />
		<Clock />
		<div class="wrapper__inner">
			<Mastodon />
			<DarkSky />
			<BusTimes />
			<Todoist />
		</div>
		<PhilipsHue />
	</div>
</template>

<script>
import DynamicHighlight from './components/DynamicHighlight.vue';
import Clock from './components/Clock.vue';
import Mastodon from './components/Mastodon.vue';
import DarkSky from './components/DarkSky.vue';
import BusTimes from './components/BusTimes.vue';
import Todoist from './components/Todoist.vue';
import PhilipsHue from './components/PhilipsHue.vue';
export default {
	name: 'app',
	components: {
		DynamicHighlight,
		Clock,
		Mastodon,
		DarkSky,
		BusTimes,
		Todoist,
		PhilipsHue
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
	grid-template-rows: repeat(3, 1fr);
	grid-gap: 3rem;
	grid-template-areas:
		'mastodon darksky darksky'
		'mastodon todoist buses'
		'mastodon todoist buses'
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
.dark-sky { grid-area: darksky; }
.bus-times { grid-area: buses; }
.todoist { grid-area: todoist; }
</style>
