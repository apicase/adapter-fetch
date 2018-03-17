const fetch = require('cross-fetch')
const pathToRegexp = require('path-to-regexp')

const parseUrl = url => {
  let origin = ''
  let pathname = ''
  if (url.indexOf('://') > -1) {
    const res = url.match('(^(?:(?:.*?)?//)?[^/?#;]*)(.*)')
    origin = res[1]
    pathname = res[2]
  } else {
    pathname = url
  }
  return { origin, pathname }
}

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

  callback({ payload, resolve, reject, setCancelCallback }) {
    if (payload.controller) {
      setCancelCallback(payload.controller.abort)
    }
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
      .catch(function(err) {
        if (err.name === 'AbortError') return
        fail(err)
      })
  },

  convert(payload) {
    let controller
    try {
      /* eslint-disable no-undef */
      controller = new AbortController()
      /* eslint-enable no-undef */
    } catch (err) {}
    const { origin, pathname } = parseUrl(payload.url)
    const res = {
      url: origin + compilePath(pathname, payload.params || {}),
      parser: payload.parser || 'json',
      controller: controller,
      validateStatus: payload.validateStatus || defaultStatusValidator,
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
    if (controller) {
      res.options.signal = controller.signal
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
