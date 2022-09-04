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

let messages = {

}
// listen to event:
io.on('connection', (socket) => {

    console.log(socket.id)

    socket.on('join_room', (data) => {
        console.log('joined_room:', data.room)
        if (messages[data.room]) {
            messages[data.room] = []
        }
        socket.join(data.room)
    })
    socket.on('send_message', (data) => {
        console.log('message_sent:', data)
        console.log(messages)
        if (data.room in messages) {
            messages[data.room].push(data.message)
        } else {
            messages[data.room] = [data.message]
        }
        console.log(messages[data.room])
        socket.to(data.room).emit('receive_messages', {
            messages: messages[data.room]
        })
    })
})


server.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`)
})