const { isValidSignal } = require("./botMethods.js");
const dotenv = require("dotenv");
dotenv.config();
const { USDMClient, WebsocketClient, DefaultLogger } = require("binance");
const cron = require("node-cron");
const { NewMessage } = require("telegram/events/NewMessage.js");
const moment = require("moment/moment.js");

const key = process.env.BINANCEAPIKEY;
const secret = process.env.BINANCEAPISECRET;

const futureClient = new USDMClient({
  api_key: key,
  api_secret: secret,
  beautifyResponses: true,
});

const wsBinanceClient = new WebsocketClient(
  {
    api_key: key,
    api_secret: secret,
    beautify: true,
    // Disable ping/pong ws heartbeat mechanism (not recommended)
    // disableHeartbeat: true
  },
  {
    ...DefaultLogger,
  }
);

let availableWalletUSDT = 0;
let openOrders = [];
let openPositions = [];
let isReady = false;
let telegramClient = null;
let isRunning = true;

const sendSignal = async (signal) => {
  try {
    isReady = false;

    await updateWalletAndOpenOrders();

    if (openOrders.length > 0) {
      console.log(
        "Ordem não executada por já existir ordem em aberto na Binance."
      );
      isReady = true;
      return;
    }

    if (parseFloat(signal.quantityUSDT) > parseFloat(availableWalletUSDT)) {
      console.log("Ordem não executada por falta de saldo.");
      isReady = true;
      return;
    }

    try {
      await futureClient.setMarginType({
        marginType: "ISOLATED",
        symbol: signal.symbol,
      });
    } catch (error) {
      // do nothing
    }

    await futureClient.setLeverage({
      leverage: signal.leverage,
      symbol: signal.symbol,
    });

    const mainOrder = {
      type: "LIMIT",
      workingType: "MARK_PRICE",
      quantity: signal.quantity,
      side: signal.side,
      symbol: signal.symbol,
      price: signal.entryPrice,
      positionSide: "BOTH",
      timeInForce: "GTC",
    };

    const stopLossOrder = {
      type: "STOP_MARKET",
      side: signal.side === "BUY" ? "SELL" : "BUY",
      workingType: "MARK_PRICE",
      positionSide: "BOTH",
      timeInForce: "GTC",
      priceProtect: "TRUE",
      closePosition: "true",
      quantity: signal.quantity,
      symbol: signal.symbol,
      stopPrice: signal.stopLossPrice,
    };

    const takeProfitOrder = {
      type: "TAKE_PROFIT_MARKET",
      side: signal.side === "BUY" ? "SELL" : "BUY",
      workingType: "MARK_PRICE",
      positionSide: "BOTH",
      timeInForce: "GTC",
      priceProtect: "TRUE",
      closePosition: "true",
      quantity: signal.quantity,
      symbol: signal.symbol,
      stopPrice: signal.takeProfitPrice,
    };

    const ordersRes = await futureClient.submitMultipleOrders([
      mainOrder,
      stopLossOrder,
      takeProfitOrder,
    ]);

    let hasError = false;

    ordersRes.map((order, i) => {
      if (!order.orderId) {
        hasError = true;
        console.log(`Erro ao enviar ordem:`, order);
        if (i === 0) console.log(mainOrder);
        else if (i === 1) console.log(stopLossOrder);
        else if (i === 2) console.log(takeProfitOrder);
      }
    });

    if (hasError) {
      await futureClient.cancelAllOpenOrders({ symbol: mainOrder.symbol });
      await updateWalletAndOpenOrders();
    } else {
      await updateWalletAndOpenOrders();
      const feedBackMessage = `Ordem de ${mainOrder.side} para o par ${mainOrder.symbol} enviada para a Binance.`;
      notifyUser(feedBackMessage);
    }

    isReady = true;
  } catch (error) {
    console.log("houve um problema para enviar os sinais", error);
    await updateWalletAndOpenOrders();
    if (openOrders.length > 0)
      await futureClient.cancelAllOpenOrders({ symbol: openOrders[0].symbol });
    isReady = true;
  }
};
isRunning;
const startBot = async (telegramClientt) => {
  try {
    isReady = false;
    telegramClient = telegramClientt;
    await wsBinanceClient.subscribeUsdFuturesUserDataStream();
    await closeOldOrders();

    //await futureClient.cancelAllOpenOrders({ symbol: openOrders[0].symbol });

    telegramClient.addEventHandler(async ({ message }) => {
      if (!isRunning) {
        console.log("Sinal recusado porque o bot não está rodando");
        return;
      }
      if (!isReady) {
        console.log("Sinal recusado pelo bot");
        return;
      }

      const signal = isValidSignal(message.message);

      if (signal) {
        await sendSignal(signal);
      } else {
        console.log("Esta mensagem não é um sinal");
        isReady = true;
      }
    }, new NewMessage({ chats: [-831855575] }));

    // Resultado da posição
    wsBinanceClient.on("formattedMessage", async (data) => {
      if (
        data.eventType === "ACCOUNT_UPDATE" &&
        data.updateData.updatedPositions.length > 0 &&
        data.updateData.updatedPositions[0].accumulatedRealisedPreFee != 0 &&
        openPositions.length > 0 &&
        openPositions[0].symbol === data.updateData.updatedPositions[0].symbol
      ) {
        // Houve um encerramento de posição
        await closeOldOrders();

        if (data.updateData.updatedPositions[0].accumulatedRealisedPreFee > 0) {
          let feedBackMessage = `Ordem ${data.updateData.updatedPositions[0].symbol} com ✅**lucro**✅ de USD ${data.updateData.updatedPositions[0].accumulatedRealisedPreFee} 💸💸💸💸`;
          feedBackMessage += `\nSaldo atual: ${availableWalletUSDT}`;
          notifyUser(feedBackMessage);
          isReady = true;
        } else {
          let feedBackMessage = `Ordem ${data.updateData.updatedPositions[0].symbol} com 🟥**prejuízo**🟥 de USD ${data.updateData.updatedPositions[0].accumulatedRealisedPreFee}`;
          feedBackMessage += `\nSaldo atual: ${availableWalletUSDT}`;
          notifyUser(feedBackMessage);
          isReady = true;
        }
      }
    });

    telegramClient.addEventHandler(async ({ message }) => {
      if (String(message.message).toLocaleLowerCase() === "start") {
        isRunning = true;
        notifyUser(
          `O bot agora está ✅**RODANDO**✅, envie 'stop' ou 'start' quando quiser para alterar seu status.`
        );
      } else if (String(message.message).toLocaleLowerCase() === "stop") {
        isRunning = false;
        notifyUser(
          `O bot agora está 🔴**PARADO**🔴, envie 'stop' ou 'start' quando quiser para alterar seu status.`
        );
      } else if (String(message.message).toLocaleLowerCase() === "status") {
        await updateWalletAndOpenOrders();
        let botStatusMessage = `**O bot está ${
          isRunning ? "RODANDO" : "PARADO"
        }!**\n`;
        botStatusMessage += `\nEnvie 'stop' ou 'start' quando quiser para alterar seu status.`;
        botStatusMessage += `\nExistem ${openPositions.length} posições(s) aberta(s).`;
        botStatusMessage += `\nExistem ${openOrders.length} orden(s) aberta(s).`;
        botStatusMessage += `\nSaldo de USD ${availableWalletUSDT} 🤑`;
        notifyUser(botStatusMessage);
      }
    }, new NewMessage({ chats: ["me"] }));

    let botStartMessage = `✅**O bot agora está RODANDO!**✅\n`;
    botStartMessage += `\nExistem ${openPositions.length} posições(s) aberta(s).`;
    botStartMessage += `\nExistem ${openOrders.length} orden(s) aberta(s).`;
    botStartMessage += `\nSaldo de USD ${availableWalletUSDT} 🤑`;
    botStartMessage += `\nEnvie 'status' para saber se o bot está em plena operação ou 'stop' e 'start' quando quiser alterar seu status de operação.`;
    notifyUser(botStartMessage);
    isReady = true;
  } catch (error) {
    console.log("Erro no método que inicializa o robo");
    notifyUser(
      `**HOUVE UM ERRO AO INICIAR O BOT!**\n - **Bot PARADO, PROCURE O SUPORTE TÉCNICO.**\n`
    );
    process.exit();
  }
};

//verificar o tempo das ordens em aberto, se tiver 3 com mais de 30 minutos, cancelá-las para liberar banca.
const updateWalletAndOpenOrders = async () => {
  try {
    const allBalance = await futureClient.getBalance();
    allBalance.forEach((asset) => {
      if (asset.asset === "USDT") {
        availableWalletUSDT = parseFloat(asset.balance).toFixed(2);
      }
    });
    openOrders = await futureClient.getAllOpenOrders();
    openPositions = await futureClient.getPrivate("fapi/v2/positionRisk");
    openPositions = openPositions.filter((p) => p.entryPrice > 0);
  } catch (error) {
    console.log(
      "Erro no método de atualizar saldo e capturar ordens em aberta.", error
    );
  }
};

const notifyUser = (message) => {
  try {
    console.log(message);
    if (telegramClient) {
      telegramClient.sendMessage("me", { message });
    }
  } catch (error) {
    console.log("Erro no método de notificação");
  }
};

const closeOldOrders = async () => {
  try {
    await updateWalletAndOpenOrders();
    if (openPositions.length === 0 && openOrders.length === 3) {
      //cancelamento automático
      if (openOrders.length === 3) {
        const timeOrder = moment(new Date(openOrders[0].time));
        const timeNow = moment();
        const minDiff = timeNow.diff(timeOrder, "minutes");
        if (minDiff >= 30) {
          const lastOrder = openOrders[0]
          await futureClient.cancelAllOpenOrders({
            symbol: openOrders[0].symbol,
          });
          await updateWalletAndOpenOrders();
          notifyUser(`A ordem ${lastOrder.symbol} foi encerrada automaticamente por tempo excedido. Não houve lucro nem prejuízo.`);
        }
      } else console.log("Aguardando para entrar no sinal");
    } else if (openPositions.length === 1 && openOrders.length === 2) {
      console.log("Plena operação, uma posição em andamento");
    } else if (
      openPositions.length > 0 &&
      (openOrders.length === 1 || openOrders.length === 3)
    ) {
      notifyUser(
        "Existe uma posição sem proteção, verifique na plataforma Binance. Encerre manualmente na Binance quando houver lucro."
      );
    } else if (openPositions.length === 0 && openOrders.length > 0) {
      console.log("Ordem(s) orfã(s)s apagadas.");
      await futureClient.cancelAllOpenOrders({ symbol: openOrders[0].symbol });
      await updateWalletAndOpenOrders();
    } else {
      console.log(
        `Não fez nada. Posições: ${openPositions.length} - Ordens: ${openOrders.length}`
      );
    }
  } catch (error) {
    console.log("Error to run cron");
  }
};

cron.schedule("*/5 * * * *", async () => {
  await closeOldOrders();
});

module.exports = {
  startBot,
};
