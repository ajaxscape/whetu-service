const WebSocket = require('ws')
const PORT = process.env.PORT || 40510
const wss = new WebSocket.Server({port: PORT})
const stringify = require('json-stringify-safe')
const game = require('whetu-engine')

game.start()

console.log(`service on port ${PORT}`)

wss.on('connection', function (ws) {
  let id
  let viewport
  let radar
  ws.send(stringify({type: 'ping'}))
  ws.on('message', function (message) {
    try {
      const {type, data} = JSON.parse(message)
      switch (type) {
        case 'player': {
          viewport = data.viewport
          radar = data.radar
          game.update(data)
          break
        }
        case 'join': {
          const data = game.join()
          id = data.id
          ws.send(stringify({type: 'joined', data}))
          break
        }
      }
    } catch (error) {
      console.log(error)
    }
  })
  setInterval(async () => {
    if (id && viewport && radar && ws.readyState === WebSocket.OPEN) {
      const data = await game.state(id, viewport, radar)
      ws.send(stringify({type: 'state', data}))
    }
  }, 50)
})
