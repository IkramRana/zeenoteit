var admin = require('../../config/firebase-config');

const options = {
    priority: "high",
    timeToLive: 60 * 60 * 24
};
const sendNotification = async (device_token, object) => {
    let { title, body } = object;
    var message = {
        notification: {
            title: title,
            body: body,
        },
    };
    admin.messaging().sendToDevice(device_token, message, options)
        .then(response => {
            console.log('file: firebase.service.js => line 17 => sendNotification => response', response);
        })
        .catch(error => {
            console.log('file: firebase.service.js => line 20 => sendNotification => error', error);
        });
}
module.exports = {
    sendNotification: sendNotification
}