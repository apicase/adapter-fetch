var pathToRegexp = require('path-to-regexp')

function compilePath(url, params) {
  return pathToRegexp.compile(url)(params)
}

function buildQueryString(query) {
  var queryString = ''
  Object.keys(query).forEach(function encodeQueryPart(key) {
    queryString +=
      encodeURIComponent(key) + '=' + encodeURIComponent(query[key])
  })
  return queryString.length ? '?' + queryString : ''
}

module.exports = {
  callback(ctx) {
    return fetch(ctx.payload.url, ctx.payload.options)
      .then(ctx.resolve)
      .catch(ctx.reject)
  },
  convert(payload) {
    var res = {
      url: compilePath(payload.url, payload.params || {}),
      options: {
        method: payload.method || 'GET',
        headers: payload.headers || {},
        credentials: payload.createntials || 'omit'
      }
    }
    if (payload.query) {
      res.url += buildQueryString(payload.query)
    }
    if (payload.body) {
      res.options.body = payload.body
    }
    return res
  },
  merge(to, from) {
    var res = Object.assign(from, to)
    if (to.url && from.url) {
      res.url = to.url[0] === '/' ? to.url : [from.url, to.url].join('/')
    }
    return res
  }
}
