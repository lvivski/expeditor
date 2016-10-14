var toRegex = require('path-to-regexp')
var cache = {}

module.exports = function Expeditor (routes) {
  return function (uri, params) {
    if (!uri) throw new TypeError('Expeditor requires URI')
		params || (params == {})

    for (var pattern in routes) {
      var m = match(pattern, uri, params)
      if (m) {
				var handler = routes[pattern]
        if (typeof handler !== 'function') return handler
        else return handler(params)
      }
    }

    return null
  }
}

function match(pattern, uri, params) {
  var regex = cache[pattern]
	if (!regex) {
			var keys = []
			regex = toRegex(pattern, keys)
			cache[pattern] = regex
	}
  var match = regex.exec(uri)

  if (!match) return false
  else if (!params) return true

  for (var i = 1, len = match.length; i < match.length; ++i) {
    var key = keys[i - 1]
    var val = typeof match[i] === 'string' ? decodeURIComponent(match[i]) : match[i]
    if (key) {
			params[key.name] = val
		}
  }
  return true
}
