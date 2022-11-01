const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const { NewMessage } = require("telegram/events");
const moment = require("moment");
const input = require("input");
const { messageRecived } = require("../bot.js");

moment.locale("pt-br");

const apiId = 26860671;
const api_hash = "1cbad764633907b7f506f37fa0a4e0b6";
const stringSession = new StringSession(
  "1AQAOMTQ5LjE1NC4xNzUuNTIBuy2JZc3m5lgWgvCqAGC6t1/Gpit4cIRK12Lz/j46/Mn+yqRp/5xKWNAC27Txly9KBRSFHJSuwxtxArgQlegTiDMPbHdB+PdNnw3tZz/53H/eMh00TYwZ4pfcL0uKe8rPIqnWonIl7qH23cybAEPXGzqsLNKyoxWTMkowv8EKcTijS9AqOHnPZLUXFhkeiOgJ3u46uinqBPC4hH4rpYK+ZST5oxLjt9/X5q+Pwwz2ELdYq4t+aduMpXZ//nmFkqDjbR4rfKki1XHC2WbiGk9D4A24FkRWzEldxZiAlSM91Z1pBJAKXQwWv5tOmTVUTI/NCKxOqjahVYEfHrF/saek9JE="
);

const client = new TelegramClient(stringSession, apiId, api_hash, {
  connectionRetries: 5,
});

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

  // Listen messages
  client.addEventHandler(async ({ message }) => {
    await messageRecived({
      date: message.date,
      message: message.message,
    });
  }, new NewMessage({ chats: [-1726157437, 5638057854] }));
};

module.exports = {
  startTelegram,
};
