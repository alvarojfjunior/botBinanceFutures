const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const moment = require("moment");
const input = require("input");
const dotenv = require("dotenv");
dotenv.config();
moment.locale("pt-br");

const telegramApiId = parseInt(process.env.TELEGRAMAPIID);
const telegramApiHash = process.env.TELEGRAMAPIHASH;
const stringSession = new StringSession(process.env.TELEGRAMSTRINGSESSION);

const connectTelegram = async () => {
  try {
    const client = new TelegramClient(
      stringSession,
      telegramApiId,
      telegramApiHash,
      {
        connectionRetries: 5,
      }
    );
    await client.start({
      phoneNumber: async () => await input.text("Please enter your number: "),
      password: async () => await input.text("Please enter your password: "),
      phoneCode: async () =>
        await input.text("Please enter the code you received: "),
      onError: (err) => console.log(err),
    });
    console.log("Telegram access string = ", client.session.save());
    return client;
  } catch (error) {
    return false;
  }
};

module.exports = {
  connectTelegram,
};
