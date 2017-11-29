const pathToRegexp = require('path-to-regexp')

function compilePath (url, params) {
  return pathToRegexp.compile(url)(params)
}

function evaluateHeaders (headers) {
  return typeof headers === 'function'
    ? headers()
    : headers
}

function buildQueryString (query) {
  var queryString = ''
  Object.keys(query).forEach(function encodeQueryPart (key) {
    queryString += encodeURIComponent(key) + '=' + encodeURIComponent(query[key])
  })
  return queryString.length
    ? '?' + queryString
    : ''
}

function fetchAdapter (ctx) {
  var options = {
    method: ctx.options.method || 'GET',
    credentials: ctx.options.credentials || 'omit'
  }
  var url = compilePath(ctx.options.url, ctx.options.params || {})
  if (ctx.options.body) options.body = ctx.options.body
  if (ctx.options.headers) options.headers = evaluateHeaders(ctx.options.headers)
  if (ctx.options.query) url += buildQueryString(query)

  return fetch(url, options)
    .then(function resolveFetch (res) {
      return res[ctx.options.parser || 'json']()
    })
    .then(function resolveAdapter (data) {
      ctx.done(data)
    })
    .catch(function rejectAdapter (reason) {
      ctx.fail(reason)
    })
}

module.exports = fetchAdapter
