var fetch = require('node-fetch')
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
      .then(function(res) {
        return res[ctx.payload.parser]()
          .then(function(data) {
            ctx.resolve({
              success: ctx.payload.validateStatus(res.status),
              data: data,
              error: null,
              status: res.status,
              statusText: res.statusText
            })
          })
          .catch(function(error) {
            ctx.reject({
              success: false,
              data: res.body,
              error: error,
              status: res.status,
              statusText: res.statusText
            })
          })
      })
      .catch(function(error) {
        ctx.reject({
          success: false,
          data: null,
          error: error,
          status: null,
          statusText: null
        })
      })
  },
  convert(payload) {
    var res = {
      url: compilePath(payload.url, payload.params || {}),
      parser: payload.parser || 'json',
      validateStatus:
        payload.validateStatus ||
        function(status) {
          return status >= 200 && status < 300
        },
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
  merge(from, to) {
    var res = Object.assign({}, from, to)
    if (to.url && from.url) {
      res.url = to.url[0] === '/' ? to.url : [from.url, to.url].join('/')
    }
    return res
  }
}
