//const server = require('http').createServer(app);
const io = require('socket.io')(3019,{
    cors: {
        origin: "http://localhost:3001",
        methods: ["GET", "POST"]
    }
});

var userNotifications = [];

const updateArray = (obj) => {
    console.log('file: socket.js => line 12 => obj', obj);
    userNotifications = [];
    obj.map(function(val, index){
        // *push result to  user notification array
        userNotifications.push(val);
    });
    initSocket();
}

initSocket = () => { 
    // Add a connect listener
    io.on('connection', function (socket) {

        console.log('connect');

        socket.on("user-notifications", userId => {
            userNotifications.map(function(val, index){
                if(val._id.equals(userId)){
                    socket.emit("user-notifications", val)
                }
            });
        })

    });
}

module.exports = {
    updateArray,
}



//server.listen(3001);