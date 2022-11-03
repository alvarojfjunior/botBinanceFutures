const { activeListeners } = require("./bot.js");
const { startTelegram } = require("./services/telegram.js");

startTelegram()

activeListeners()