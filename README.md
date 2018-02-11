# apicase-adapter-fetch

Fetch adapter for apicase-core

## Installation

1. Install via NPM

```
npm install apicase-adapter-fetch
```

2. Import it

```javascript
import { apicase } from 'apicase-core'
import fetch from 'apicase-adapter-fetch'

const fetchAPI = apicase(fetch)
```

3. If you use Node.js, use this instead of previous

```javascript
const apicase = require('apicase-core').default
const fetch = require('apicase-adapter-fetch/node')

const fetchAPI = apicase(fetch)
```

We use [**node-fetch**](https://www.npmjs.com/package/node-fetch) as polyfill for Node.js

## Basic usage

```javascript
fetchAPI({
  url: '/api/posts',
  headers: { token: 'my_secret_token' },
  query: { userId: 1 }
})
  .then(console.log)
  .catch(console.error)
```

## Response format

```javascript
{
  // true if everything is ok
  // false if got bad status or another errors happened
  "success": Boolean,
  // Response.body
  // null, if error
  "data": any,
  // Error
  // null, if no errors
  "error": any,
  // Response.status
  // null, if no-request error happened
  "status": Number|null,
  // Response.statusText
  // null, if no-request error happened
  "statustext": String|null
}
```

## Features

### Url params

Fetch adapter has [**path-to-regexp**](https://github.com/pillarjs/path-to-regexp) to pass urls params smarter.  
Params are stored in `params` property

```javascript
fetchAPI({
  url: '/api/posts/:id',
  params: { id: 1 }
})
// => GET /api/posts/1
```

### Query params

You can define query params in `query` property

```javascript
fetchAPI({
  url: '/api/posts',
  query: { userId: 1 }
})
// => GET /api/posts?userId=1
```

### Status validation

If you have some specific API, you can define custom status validation

```javascript
fetchAPI({
  url: '/api/posts',
  validateStatus: status => status === 200
})
```

Default status validation behaviour is:

```javascript
function(status) {
  return status >= 200 && status < 300
}
```

### Url concatenation in services

Extended services will have concatenated URI, if the next part doesn't start with `/`:

```javascript
const service1 = new ApiService(fetch, { url: '/api' })

// { "url": "/api/posts" }
const service2 = service1.extend({ url: 'posts' })

// { "url": "/posts" }
const service3 = service1.extend({ url: '/posts' })
```

## Full payload params list

```javascript
{
  // Request URL
  "url": String,
  // Response parser
  // default: 'json'
  "parser": String,
  // Request method
  // default: 'GET'
  "method": String,
  // Request headers
  // default: {}
  "headers": Object,
  // Request body
  // default: undefined
  "body": Object|FormData,
  // Credentials
  // default: 'omit'
  "credentials": String,
  // URL params
  // default: {}
  "params": Object,
  // Query params
  // default: {}
  "query": Object,
  // Status validation callback
  // default: status => status >= 200 && status < 300
  "validateStatus": Function
}
```

## Author

[Anton Kosykh](https://github.com/Kelin2025)

## License

MIT
