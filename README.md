# apicase-adapter-fetch
Fetch adapter for apicase-core

## Installation
Fetch adapter is out-of-the-box adapter and it's installed in apicase-core by default

## Basic usage
```javascript
apicase.call({
  adapter: 'fetch',
  parser: 'json',
  url: '/api/posts',
  method: 'GET',
  headers: { token: 'my_secret_token' },
  query: { userId: 1 }
})
.then(console.log)
.catch(console.error)
```

It will call:
```javascript
fetch('/api/posts?userId=1', {
  method: 'GET',
  headers: { token: 'my_secret_token' }
})
.then(res => res.json())
.then(console.log)
.catch(console.error)
```

## Advanced

### Url params
Fetch adapter also has [path-to-regexp](https://github.com/pillarjs/path-to-regexp) to pass urls params smarter. Params are stored in **params** property
```javascript
apicase.call({
  adapter: 'fetch',
  url: '/api/posts/:id',
  params: { id: 1 }
})
// => GET /api/posts/1
```

### Dynamic headers
If you want to create dynamic headers object so you can pass **headers** property as function that returns headers object
```javascript
apicase.call({
  adapter: 'fetch',
  url: '/api/posts',
  method: 'POST',
  headers: () => ({
    token: localStorage.getItem('token')
  })
})
```
It will be called every time you make a request so if token will be removed, header won't be sent too.

## Author
[Anton Kosykh](https://github.com/Kelin2025)

## License
MIT
