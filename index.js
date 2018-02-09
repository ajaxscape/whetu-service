const WebSocket = require('ws');
const PORT = process.env.PORT || 40510
const wss = new WebSocket.Server({port: PORT})
const game = require('whetu-engine')

game.start()

console.log(`service on port ${PORT}`)

// wss.broadcast = function broadcast () {
//   wss.clients.forEach(function each (client) {
//     if (client.readyState === WebSocket.OPEN) {
//       const data = game.getState()
//       client.send(JSON.stringify({type: 'state', data}))
//     }
//   })
// }

// setInterval(() => {
//   wss.broadcast()
// }, 40)

wss.on('connection', function (ws) {
  let id
  let viewport
  let radar
  ws.send(JSON.stringify({type: 'ping'}))
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
          ws.send(JSON.stringify({type: 'joined', data}))
          break
        }
        case 'pong': {
          console.log('pong')
          setTimeout(() => ws.send(JSON.stringify({type: 'ping'})), 10000)
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
    ws.send(JSON.stringify({type: 'state', data}))
  }
}, 10)
})