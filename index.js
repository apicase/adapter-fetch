const fetch = require('cross-fetch')
const pathToRegexp = require('path-to-regexp')

const compilePath = (url, params) => pathToRegexp.compile(url)(params)

const encodeURIParts = (res, [key, val]) =>
  res + encodeURIComponent(key) + '=' + encodeURIComponent(val)

const buildQueryString = query => {
  const queryString = Object.entries(query).reduce(encodeURIParts, '')
  return queryString.length ? '?' + queryString : ''
}

const defaultStatusValidator = status => status >= 200 && status < 300

export default {
  createState: () => ({
    status: null,
    headers: null,
    body: null
  }),

  callback({ payload, resolve, reject }) {
    const done = res => {
      const isValid = payload.validateStatus(res.status)
      if (!isValid) {
        return reject({
          status: res.status,
          headers: res.headers,
          body: res.body
        })
      } else {
        return res[payload.parser]().then(body =>
          resolve({
            status: res.status,
            headers: res.headers,
            body: body
          })
        )
      }
    }

    const fail = err => {
      throw err
    }

    return fetch(payload.url, payload.options)
      .then(done)
      .catch(fail)
  },

  convert(payload) {
    const res = {
      url: compilePath(payload.url, payload.params || {}),
      parser: payload.parser || 'json',
      validateStatus: payload.validateStatus || defaultStatusValidator,
      options: {
        method: payload.method || 'GET',
        headers: payload.headers || {},
        credentials: payload.createntials || 'omit'
      }
    }
    if (payload.query) {
      res.url = buildQueryString(payload.query)
    }
    if (payload.body) {
      res.options.body = payload.body
    }
    return res
  },

  merge(from, to) {
    const res = Object.assign({}, from, to)
    if (to.url && from.url) {
      res.url = to.url[0] === '/' ? to.url : [from.url, to.url].join('/')
    }
    return res
  }
}
