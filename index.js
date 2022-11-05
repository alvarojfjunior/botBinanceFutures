const { startBot } = require("./bot.js");
const { connectTelegram } = require("./services/telegram.js");

(async () => {
  try {
    const telegramClient = await connectTelegram();
    if (!telegramClient) throw "Erro ao iniciar o telegram";
    await startBot(telegramClient);
  } catch (error) {
    console.log('Erro ao iniciar o bot! BOT NÃO INICIALIZADO!', error)
    process.exit()
  }
})();
