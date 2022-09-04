var express = require('express');
var path = require('path');
var logger = require('morgan');

const http = require("http");
const {Server} = require("socket.io");
const cors = require('cors')


var app = express();

// cors
app.use(cors())

app.use(logger('dev'));
app.use(express.json());

// constants:
const PORT = process.env.PORT || 3001;


// set up the recommended http server for Socket.IO
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ['GET', 'POST']
    }
})

// listen to event:
io.on('connection', (socket) => {
    console.log(socket.id)

    socket.on('send_message', (data) => {
        // broadcast
        socket.broadcast.emit('receive_message', {'data': data})
        console.log(data)
    })
})


server.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`)
})