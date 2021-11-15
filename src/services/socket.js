//const server = require('http').createServer(app);
const io = require('socket.io')(3019);

var userNotifications = [1,2,3];

initSocket = () => { 
    // Add a connect listener
    io.on('connection', function (socket) {

        console.log('connect');

        socket.on("user-notifications", obj => {
            socket.emit(userNotifications)
        })

    });
}

module.exports = {
    initSocket
}



//server.listen(3001);