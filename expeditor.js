var toRegex = require('path-to-regexp')
var cache = {}

module.exports = function expeditor (routes) {
	return function (uri, params) {
		if (!uri) throw new TypeError('expeditor requires URI')
		params || (params == {})

		for (var pattern in routes) {
			var match = matchPattern(pattern, uri, params)
			if (match) {
				var handler = routes[pattern]
				if (typeof handler !== 'function') return handler
				else return handler(params)
			}
		}

		return null
	}
}

exports.compile = function (pattern) {
	return toRegex.compile(pattern)
}

function getMatcher(pattern) {
	if (!cache[pattern]) {
		var keys = [],
			regex = toRegex(pattern, keys)

		cache[pattern] = {
			regex: regex,
			keys: keys
		}
	}
	return cache[pattern]
}

function matchPattern(pattern, uri, params) {
	var matcher = getMatcher(pattern),
		match = matcher.regex.exec(uri)

	if (!match) return false
	else if (!params) return true

	var keys = matcher.keys
	for (var i = 1; i < match.length; ++i) {
		var key = keys[i - 1],
			val = decodeURIComponent(match[i])

		if (key) {
			params[key.name] = val
			if (key.repeat) {
				params[key.name] = params[key.name].split(key.delimiter)
			}
		}
	}
	return true
}
