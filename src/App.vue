<template>
	<div id="app">
		<Clock />
		<PhilipsHue />
		<DarkSky :lat="51.454330" :lng="-2.588680" />
	</div>
</template>

<script>
import Clock from './components/Clock.vue';
import PhilipsHue from './components/PhilipsHue.vue';
import DarkSky from './components/DarkSky.vue';
export default {
	name: 'app',
	components: {
		Clock,
		PhilipsHue
		DarkSky
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
</style>
