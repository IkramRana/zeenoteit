//const server = require('http').createServer(app);
const io = require('socket.io')(3019,{
    cors: {
        origin: "http://localhost:3001",
        methods: ["GET", "POST"]
    }
});

var userNotifications = [];

const updateArray = (obj) => {
    //console.log('file: socket.js => line 12 => obj', obj);
    userNotifications = [];
    obj.map(function(val, index){
        // *push result to  user notification array
        userNotifications.push(val);
    });
    console.log('file: socket.js => line 17 => obj.map => userNotifications', userNotifications);
    //initSocket();
}

initSocket = () => { 
    // Add a connect listener
    io.on('connection', function (socket) {

        console.log('connect');

        socket.on("new_notification", userId => {
        console.log('file: socket.js => line 29 => userId', userId);
            userNotifications.map(function(val, index){
                if(val._id.equals(userId)){
                    socket.emit("show_notification", val)
                }
            });
        })

    });
}

module.exports = {
    updateArray,
    initSocket
}



//server.listen(3001);