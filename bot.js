const { isValidSignal } = require("./botMethods.js");
const dotenv = require("dotenv");
dotenv.config();
const { USDMClient, WebsocketClient, DefaultLogger } = require("binance");
const { minutesDiference, secondsDiference } = require("./utils.js");
const { NewMessage } = require("telegram/events/NewMessage.js");

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
      await futureClient.cancelAllOpenOrders({ symbol: openOrders[0].symbol });
      await updateWalletAndOpenOrders();
    } else {
      const feedBackMessage = `Ordem de ${mainOrder.side} para o par ${mainOrder.symbol} enviada para a corretora.`;
      notifyUser(feedBackMessage);
    }
    isReady = true;
  } catch (error) {
    await futureClient.cancelAllOpenOrders({ symbol: openOrders[0].symbol });
    await updateWalletAndOpenOrders();
    console.log("houve um problema para enviar os sinais", error);
    isReady = true;
  }
};

const startBot = async (telegramClientt) => {
  try {
    isReady = false;
    telegramClient = telegramClientt;
    await wsBinanceClient.subscribeUsdFuturesUserDataStream();
    await updateWalletAndOpenOrders();

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

      if (signal) await sendSignal(signal);
      else console.log("Esta mensagem não é um sinal");
    }, new NewMessage({ chats: [-816838568] }));

    // Resultado da posição
    wsBinanceClient.on("formattedMessage", async (data) => {
      if (
        data.eventType === "ACCOUNT_UPDATE" &&
        data.updateData &&
        data.updateData.updatedPositions.length > 0 &&
        data.updateData.updatedPositions[0].accumulatedRealisedPreFee !== 0
      ) {
        await futureClient.cancelAllOpenOrders({
          symbol: data.updateData.updatedPositions[0].symbol,
        });
        await updateWalletAndOpenOrders();
        if (data.updateData.updatedPositions[0].accumulatedRealisedPreFee > 0) {
          let feedBackMessage = `Ordem com ✅**lucro**✅ de USD ${data.updateData.updatedPositions[0].accumulatedRealisedPreFee} 💸💸💸💸`;
          feedBackMessage += `\nSaldo atual: ${availableWalletUSDT}`
          notifyUser(feedBackMessage);
        } else {
          let feedBackMessage = `Ordem com 🟥**prejuízo**🟥 de USD ${data.updateData.updatedPositions[0].accumulatedRealisedPreFee}`;
          feedBackMessage += `\nSaldo atual: ${availableWalletUSDT}`
          notifyUser(feedBackMessage);
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
      }
    }, new NewMessage({ chats: ["me"] }));

    let botStartMessage = `✅**O bot agora está RODANDO!**✅\n`;
    botStartMessage += `\nExiste uma orden aberta.`;
    botStartMessage += `\nSaldo de USD ${availableWalletUSDT} 🤑`;
    botStartMessage += `\nEnvie 'stop' ou 'start' quando quiser para alterar seu status.`;

    notifyUser(botStartMessage);
    isReady = true;
  } catch (error) {
    console.log("Erro no método que inicializa o robo");
    notifyUser(`**HOUVE UM ERRO AO INICIAR O BOT!**\n - **Bot PARADO!**\n`);
    process.exit();
  }
};

//verificar o tempo das ordens em aberto, se tiver 3 com mais de 30 minutos, cancelá-las para liberar banca.
const updateWalletAndOpenOrders = async () => {
  try {
    const allBalance = await futureClient.getBalance();
    allBalance.forEach((asset) => {
      if (asset.asset === "USDT")
        availableWalletUSDT = parseFloat(asset.maxWithdrawAmount).toFixed(2);
    });
    openOrders = await futureClient.getAllOpenOrders();
    console.log(
      openOrders.length,
      "Ordens em aberto",
      "Saldo USDT: ",
      availableWalletUSDT
    );
  } catch (error) {
    console.log(
      "Erro no método de atualizar saldo e capturar ordens em aberta."
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

module.exports = {
  startBot,
};
