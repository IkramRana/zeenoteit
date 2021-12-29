const Validator = require('validatorjs');

const validator = (body, rules, customMessages, callback) => {
    const validation = new Validator(body, rules, customMessages);
    validation.passes(() => callback(null, true));
    validation.fails(() => callback(validation.errors, false));
};

const getMinHrFromString = (timeString,timeInterval) => {
    const splitTime = timeString.split(':')
    const totalMinutes = (+splitTime[0] * 60 ) + +timeInterval + +splitTime[1];

    const hours = Math.floor(totalMinutes / 60) < 10 ? '0'+Math.floor(totalMinutes / 60) : Math.floor(totalMinutes / 60);          
    const minutes = (totalMinutes % 60) < 10 ? '0'+(totalMinutes % 60) : (totalMinutes % 60);
    const sec = splitTime[2].substring(0, 2);
    
    const time = hours+':'+minutes+':'+sec;

    return  time;
}

const getMinFromString = (timeString) => {
    const splitTime = timeString.split(':')
    const totalMinutes = (+splitTime[0] * 60 ) + +splitTime[1];
    return  totalMinutes;
}

const convertMinToHr = async (minutesDifference) => {
    const minutes = Math.abs(minutesDifference);
    let hour = Math.floor(minutes / 60); 
    let minute = minutes % 60;

    if(+hour < 10){
        hour = '0'+hour
    }
    
    if(+minute < 10){
        minute = '0'+minute
    }

    let time = hour + ':' + minute;
    return time;
}


module.exports = {
    validator,
    convertMinToHr,
    getMinFromString,
    getMinHrFromString,
}