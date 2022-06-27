
//const origin = "http://localhost:3002";
// const origin = "http://app.zenoteit.com:3002";
const io = require('socket.io')(3019,{
    cors: {
        origin: "http://localhost:3002",
        methods: ["GET", "POST"]
    }
});

var userNotifications = [];
var userCount = 0;
var obj = {};

const updateArray = (obj) => {
    userNotifications = [];
    obj.map(function(val, index){
        // *push result to  user notification array
        userNotifications.push(val);
    });
    console.log("🚀 ~ file: socket.js ~ line 20 ~ obj.map ~ userNotifications", userNotifications)
}

initSocket = () => { 
    // Add a connect listener
    io.on('connection', function (socket) {

        console.log('connect');

        socket.on("new_notification", userId => {
        console.log('file: socket.js => line 42 => userId', userId);
            userNotifications.map(function(val, index){
                if(val._id.equals(userId)){
                    userCount++;
                    obj = val;
                }
            });

            // *if user exist
            if(userCount > 0){
                userCount = 0;
                socket.emit("show_notification", obj)
            } else {
                userCount = 0;
                obj = {
                    _id: userId,
                    notificationCount: 0
                }
                socket.emit("show_notification", obj)
            }
        })

    });
}

module.exports = {
    updateArray,
    initSocket
}