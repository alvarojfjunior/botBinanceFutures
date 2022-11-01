const { startTelegram } = require("./services/telegram.js");

startTelegram().then(res => console.log('telegram is ready'))