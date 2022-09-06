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
        origin: "http://localhost:3000 http://real-blackjack-online.herokuapp.com:*",
        methods: ['GET', 'POST']
    }
})

let onePlayerRooms = []
let fullRooms = []
let nextRoomId = 1;

// listen to event:
io.on('connection', (socket) => {

    console.log(socket.id)

    socket.on('join_room', (_) => {
        console.log(onePlayerRooms)
        console.log(fullRooms)

        // find a room, or create one
        let joinedId;
        if (!onePlayerRooms.length) {
            onePlayerRooms.push({
                joinedId: nextRoomId,
                players: [socket.id]
            })

            socket.join(nextRoomId)
            socket.to(nextRoomId).emit('joined_room', {
                joinedId: nextRoomId,
                waiting: true,
                // he's the first, so he will play first
                playerOrder: 0
            })

            nextRoomId++;
        } else {
            let {
                joinedId, players
            } = onePlayerRooms[0];

            if (players[0] == socket.id) {
                console.log('Player already joined the empty room')
                return;
            }

            socket.join(joinedId)
            socket.to(joinedId).emit('joined_room', {
                joinedId: joinedId,
                waiting: false,
                playerOrder: 0
            })
            socket.emit('joined_room', {
                joinedId: joinedId,
                waiting: false,
                playerOrder: 1
            })

            fullRooms.push(onePlayerRooms[0])
            onePlayerRooms = onePlayerRooms.slice(1);
        }
    })
    socket.on('send_option', (data) => {
        console.log('send_option:', data)

        socket.to(data.joinedId).emit('receive_rival_option', {
            option: data.option
        })
    })

    socket.on('update_match', (data) => {
        console.log('update_match:', data)

        socket.to(data.joinedMatch).emit('receive_match_update', {
            match: data.match
        })
    })
})


server.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`)
})