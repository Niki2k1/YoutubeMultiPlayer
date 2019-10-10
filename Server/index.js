const express = require('express');
let app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('Client'));


io.on('connection', function (socket) {
    console.log(socket.id + ' connected!');
    io.emit('users', Object.keys(io.sockets.sockets));
    
    socket.on('message', (msg) => {
        console.log('raw: ' + msg);
        let split = msg.split(' ');
        msg = {
            full: msg,
            cmd: split[0],
            arg: split[1]
        }
        switch (msg.cmd) {
            case 'play':
                io.emit('message', msg.full);
                break;
            case 'pause':
                socket.broadcast.emit('message', msg.full);
                break;
            case 'resume':
                socket.broadcast.emit('message', msg.full);
            default:
                break;
        }
    });
    
    socket.on('disconnect', () => {
        console.log(socket.id + ' disconnected!');
        io.emit('users', Object.keys(io.sockets.sockets));
    })

});

http.listen(8080, function () {
    console.log('listening on *:8080');
});