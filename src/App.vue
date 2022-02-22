<template>
	<div id="app" class="lcars">
		
		<header class="lcars-header">
			<span class="lcars-header__heading">
				Stardate {{ stardate }}
			</span>
		</header>
			
		<div class="lcars-footer">
			<BusTimes />
		</div>
		
		<div class="lcars-sidebar">
			<div class="lcars-sidebar__top">
				<div class="lcars-sidebar__date">{{ dayOfWeek }}<br>{{ date }}</div>
				<div class="lcars-sidebar__time">{{ time }}</div>
			</div>
			<PhilipsHue />
			<div class="lcars-sidebar__bottom"></div>
		</div>
		
		<div class="lcars-body">
			<OpenWeatherMap />
			<Mastodon />
			<PiHole />
		</div>
		
	</div>
</template>

<script>
import Moment from 'moment';

import BusTimes from './components/BusTimes.vue';
import Mastodon from './components/Mastodon.vue';
import OpenWeatherMap from './components/OpenWeatherMap.vue';
import PiHole from './components/PiHole.vue';
import PhilipsHue from './components/PhilipsHue.vue';

export default {
	name: 'app',
	components: {
		BusTimes,
		Mastodon,
		OpenWeatherMap,
		PiHole,
		PhilipsHue
	},
	data() {
		return {
			momentObj: Moment()
		}
	},
	mounted() {
		setInterval(() => {
			this.momentObj = Moment();
		}, 1000);
	},
	computed: {
		date: function() {
			return this.momentObj.format('D MMMM YYYY');
		},
		dayOfWeek: function() {
			return this.momentObj.format('dddd');
		},
		time: function() {
			return this.momentObj.format('HHmm:ss');
		},
		stardate: function() {
			// Cribbed from http://trekguide.com
			const originDate = new Date(1987, 6, 15, 0, 0, 0); // 1987-07-15T00:00:00
			const currentDate = new Date();
			let stardate = currentDate.getTime() - originDate.getTime();
			stardate = stardate / (1000 * 60 * 60 * 24 * 0.036525);
			stardate = Math.floor(stardate + 410000);
			stardate = stardate / 10;
			return stardate.toFixed(1);
		}
	}
}
</script>

<style lang="scss">
@import url("https://use.typekit.net/fvg4idi.css");

:root {
	/* Raw colours */
	--color-black: black;
	--color-white: white;
	--color-primary-1: #786999;
	--color-primary-2: #B59EE5;
	--color-primary-3: #6342AA;
	--color-secondary-1: #B9E587;
	--color-secondary-2: #DEEAD0;
	--color-secondary-3: #52663C;
	--color-neutral-1: #4b5475;
	--color-neutral-2: #242525;
	/* Semantic definitions */
	--header-height: 2rem;
	--footer-height: 7rem;
	--sidebar-width: 10rem;
	--label-width: 6rem;
	--gutter: 1.5rem;
	--font-heading: acumin-pro-extra-condensed, sans-serif;
	--font-body: acumin-pro-condensed, sans-serif;
	--canvas-text-color: var(--color-white);
	--canvas-background-color: var(--color-black);
}

* {
	box-sizing: border-box;
	margin: 0;
	padding: 0;
	&::before,
	&::after {
		box-sizing: inherit;
	}
}

html {
	color: var(--canvas-text-color);
	background-color: var(--canvas-background-color);
	font-size: max(15px, 2vmin);
}

.lcars {
	display: grid;
	grid-template-columns: var(--sidebar-width) 1fr;
	grid-template-rows: var(--header-height) 1fr auto;
	grid-template-areas: 
		'sidebar header'
		'sidebar .'
		'sidebar footer';
	height: 100vh;
	font-family: var(--font-body);
	font-weight: bold;
	text-align: right;
	line-height: 1;
}

.lcars-prehead { 
	grid-area: prehead;
	padding-left: var(--sidebar-width);
	margin-bottom: .5rem;
	padding-bottom: calc(var(--header-height) / 2);
	position: relative;
	background-color: var(--color-primary-1);
	border-bottom-left-radius: calc(var(--header-height) * 2);
	border-bottom-right-radius: var(--header-height);
	&__inner {
		padding-left: var(--gutter);
		padding-bottom: var(--gutter);
		background-color: var(--canvas-background-color);
		border-bottom-left-radius: var(--header-height);
	}
 }

.lcars-header {
	grid-area: header;
	display: flex;
	justify-content: flex-end;
	height: var(--height);
	padding-right: var(--header-height);
	position: relative;
	background-color: var(--color-primary-1);
	border-radius: 0 var(--header-height) var(--header-height) 0;
	&__heading {
		padding: 0 .5rem;
		color: var(--color-primary-2);
		background-color: var(--canvas-background-color);
		font-family: var(--font-heading);
		font-size: calc(var(--header-height) * 1.25);
		text-transform: uppercase;
		line-height: calc(var(--header-height) - .5rem);
	}
}

.lcars-footer {
	grid-area: footer;
	height: var(--footer-height);
	padding-right: calc(var(--header-height) * 2);
	background-color: var(--color-primary-1);
	border-bottom-right-radius: calc(var(--header-height) * 2);
	overflow: hidden;
}

.lcars-body {
	display: grid;
	grid-template-columns: 1fr 1fr;
	grid-template-rows: 1fr auto;
	grid-template-areas: 'weather mastodon' 'pihole pihole';
	grid-gap: var(--gutter);
	padding: var(--gutter) 0 var(--gutter) var(--gutter);
	position: relative;
	.lcars-weather { grid-area: weather; }
	.lcars-pihole { grid-area: pihole; }
	.lcars-mastodon { grid-area: mastodon; }
}

.lcars-sidebar {
	grid-area: sidebar;
	display: flex;
	flex-direction: column;
	&__top,
	&__bottom {
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		height: calc(var(--header-height) * 4);
		padding: .5rem;
		position: relative;
		background-color: var(--color-primary-1);
		&::before,
		&::after {
			content: "";
			width: var(--header-height);
			height: var(--header-height);
			position: absolute;
			left: 100%;
			z-index: 0;
		}
		&::before {
			background-color: var(--color-primary-1);
		}
		&::after {
			background-color: var(--canvas-background-color);
		}
	}
	&__top {
		flex-grow: 1;
		align-items: flex-end;
		border-top-left-radius: calc(var(--header-height) * 2);
		&::before,
		&::after {
			top: var(--header-height);
		}
		&::after {
			border-top-left-radius: var(--header-height);
		}
	}
	&__bottom {
		flex-grow: 1;
		align-items: flex-start;
		border-bottom-left-radius: calc(var(--header-height) * 2);
		&::before,
		&::after {
			bottom: var(--footer-height);
		}
		&::before,
		&::after {
			bottom: var(--footer-height);
		}
		&::after {
			border-bottom-left-radius: var(--footer-height);
		}
	}
	&__date {
		font-family: var(--font-heading);
		text-transform: uppercase;
	}
	&__time {
		font-family: var(--font-heading);
		font-size: 2rem;
		font-variant-numeric: tabular-nums;
	}
}

</style>
