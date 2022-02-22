const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

module.exports = {
	configureWebpack: {
		resolve: {
			fallback: {
				assert: require.resolve('assert'),
				buffer: require.resolve('buffer'),
				console: require.resolve('console-browserify'),
				constants: require.resolve('constants-browserify'),
				crypto: require.resolve('crypto-browserify'),
				domain: require.resolve('domain-browser'),
				events: require.resolve('events'),
				fs: false,
				http: require.resolve('stream-http'),
				https: require.resolve('https-browserify'),
				net: false,
				os: require.resolve('os-browserify/browser'),
				path: require.resolve('path-browserify'),
				punycode: require.resolve('punycode'),
				process: require.resolve('process/browser'),
				querystring: require.resolve('querystring-es3'),
				stream: require.resolve('stream-browserify'),
				string_decoder: require.resolve('string_decoder'),
				sys: require.resolve('util'),
				timers: require.resolve('timers-browserify'),
				tls: false,
				tty: require.resolve('tty-browserify'),
				url: require.resolve('url'),
				util: require.resolve('util'),
				vm: require.resolve('vm-browserify'),
				zlib: require.resolve('browserify-zlib'),
			}
		},
		plugins: [
			new NodePolyfillPlugin()
		]
	}
}