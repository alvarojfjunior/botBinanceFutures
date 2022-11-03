const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const { NewMessage } = require("telegram/events");
const moment = require("moment");
const input = require("input");
const dotenv = require("dotenv");
dotenv.config();
const { messageRecived } = require("../bot.js");
moment.locale("pt-br");

const telegramApiId = parseInt(process.env.TELEGRAMAPIID);
const telegramApiHash = process.env.TELEGRAMAPIHASH;
const stringSession = new StringSession(process.env.TELEGRAMSTRINGSESSION);

const client = new TelegramClient(
  stringSession,
  telegramApiId,
  telegramApiHash,
  {
    connectionRetries: 5,
  }
);

const startTelegram = async () => {
  try {
    await client.start({
      phoneNumber: async () => await input.text("Please enter your number: "),
      password: async () => await input.text("Please enter your password: "),
      phoneCode: async () =>
        await input.text("Please enter the code you received: "),
      onError: (err) => console.log(err),
    });
  } catch (error) {
    console.log("Error to connect in telegram API");
    return;
  }

  console.log("TELEGRAMSTRINGSESSION= ", client.session.save());

  // Listen messages
  client.addEventHandler(async ({ message }) => {
    await messageRecived({
      client: client,
      date: message.date,
      message: message.message,
    });
  }, new NewMessage({ chats: [-816838568, 5638057854] }));
};

module.exports = {
  startTelegram,
};
