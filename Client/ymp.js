/*
Version: 1.0
Author: Niklas Lausch <support@niki2k1.de>
 __     __ __  __  _____  
 \ \   / /|  \/  ||  __ \ 
  \ \_/ / | \  / || |__) |
   \   /  | |\/| ||  ___/ 
    | |   | |  | || |     
    |_|   |_|  |_||_|     
                          
This is the Javascript to generate the Player and for the communication with the Server
Librarys used:
 * socket.io
 * yt-player
*/
const player = new ytPlayer('#player', {
    autoplay: true
});
const socket = io();
let paused = false;

let usersDiv = document.getElementById('users');
let logDiv = document.getElementById('log');

function log(text) {
    let p = document.createElement("p");
    p.innerText = text;
    logDiv.append(p);
}

player.on('playing', () => {
    if (paused) {
        socket.emit('message', 'resume ' + player.getCurrentTime());
    }
    paused = false;
})

player.on('paused', () => {
    paused = true;
    socket.emit('message', 'pause');
})

let statusIndicator = document.getElementById('statusIndicator');
let status = document.getElementById('status');

socket.on('connect', function () {
    if (socket.connected) {
        statusIndicator.classList.toggle('connected');
        status.innerText = 'Connected';
    }
});

socket.on('disconnect', function () {
    if (!socket.connected) {
        statusIndicator.classList.toggle('connected');
        status.innerText = 'Disconnected';
    }
});

socket.on('users', (users) => {
    addUsers(users);
})

socket.on('message', function (msg) {
    log('command: ' + msg);

    let split = msg.split(' ');
    msg = {
        cmd: split[0],
        arg: split[1]
    }

    switch (msg.cmd) {
        case 'play':
            player.load(msg.arg);
            player.play();
            break;
        case 'resume':
            player.seek(msg.arg);
            player.play();
            break;
        case 'pause':
            player.pause();
            break;
        default:
            break;
    }
});

function addUsers(users) {
    usersDiv.innerHTML = "";

    for (const user of users) {
        let div = document.createElement("div");
        div.classList.add('user')

        let img = document.createElement("img");
        img.src = "user.png";
        div.append(img);

        let label = document.createElement("label");
        if(socket.io.engine.id === user) {
            label.innerText = user + ' (you)';
        } else {
            label.innerText = user;
        }
            
        div.append(label);

        usersDiv.append(div);
    }
}

function chooseVideo() {
    let id = document.getElementById('url').value;
    id = id.split('https://www.youtube.com/watch?v=')[1];
    socket.emit('message', 'play ' + id);
}