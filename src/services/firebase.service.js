var admin = require('../../config/firebase-config');

const options = {
    priority: "high",
    timeToLive: 60 * 60 * 24
};
const sendNotification = (device_token, object) => {
    let { title, body, data } = object;
    var message = {
        notification: {
            title: title,
            body: body,
        },
        data: { ...data }
    };
    admin.messaging().sendToDevice(device_token, message, options)
        .then(response => {
            console.log(response);
        })
        .catch(error => {
            console.log(error);
        });
}
module.exports = {
    sendNotification: sendNotification
}