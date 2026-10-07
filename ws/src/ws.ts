import { createServer, IncomingMessage } from 'http'
import Websocket, { WebSocketServer } from 'ws'
import 'dotenv/config'

const PORT = 3000
const server = createServer()
const wss = new WebSocketServer({ noServer: true })

server.on('upgrade', (req, socket, head) => {
    wss.handleUpgrade(req, socket, head, (ws: Websocket) => {
        ws.emit("connection", req, ws)
    })
})

wss.on("connection", (req: IncomingMessage, ws: Websocket) => {
   
    ws.on("message", (message: string) => {
        
    })
})




