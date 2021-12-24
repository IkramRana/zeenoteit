var CronJob = require('cron').CronJob;
var { init } = require('../util/notification');

initJob = () => {
    try {
        var job = new CronJob('5 * * * * *', function() {
            //const d = new Date();
            //console.log('You will see this message every minute',d.toLocaleTimeString());
            init();
        }, null, true);
        job.start();
    } catch (error) {
        console.log('file: cronJob.js => line 7 => error', error);
    }
}

module.exports = {
    initJob
}