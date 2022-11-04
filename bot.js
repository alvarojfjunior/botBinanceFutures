const { isValidSignal } = require("./botMethods.js");
const dotenv = require("dotenv");
dotenv.config();
const { USDMClient, WebsocketClient, DefaultLogger } = require("binance");
const { minutesDiference, secondsDiference } = require("./utils.js");

const key = process.env.BINANCEAPIKEY;
const secret = process.env.BINANCEAPISECRET;

const futureClient = new USDMClient({
  api_key: key,
  api_secret: secret,
  beautifyResponses: true,
});

const wsClient = new WebsocketClient(
  {
    api_key: key,
    api_secret: secret,
    beautify: true,
    // Disable ping/pong ws heartbeat mechanism (not recommended)
    // disableHeartbeat: true
  },
  {
    ...DefaultLogger,
    silly: (...params) => {},
  }
);

let availableWalletUSDT = 0;
let openOrders = [];
let lastOrderSent = {};
let isReady = false;
let client = null;
let lastNotify = new Date(new Date().getTime() - 10000);

const messageRecived = async (message) => {
  client = message.client;

  if (!isReady) {
    console.log("Sinal recusado pelo bot");
    return;
  }

  const signal = isValidSignal(message);

  if (signal) {
    try {
      if (openOrders.length > 0) {
        console.log(
          "Ordem não executada por já existir ordem em aberto na Binance."
        );
        return;
      }

      if (parseFloat(signal.quantityUSDT) > parseFloat(availableWalletUSDT)) {
        console.log("Ordem não executada por falta de saldo.");
        return;
      }

      isReady = false;

      try {
        await futureClient.setMarginType({
          marginType: "ISOLATED",
          symbol: signal.symbol,
        });
      } catch (error) {
        // Dont do nothing
      }

      await futureClient.setLeverage({
        leverage: signal.leverage,
        symbol: signal.symbol,
      });

      try {
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
            console.log(`Erro ao enviar ordem: ${i}`, order);
            if (i === 0) console.log(mainOrder);
            else if (i === 1) console.log(stopLossOrder);
            else if (i === 2) console.log(takeProfitOrder);
          }
        });

        if (hasError) {
          await futureClient.cancelAllOpenOrders({
            symbol: signal.symbol,
          });
        } else {
          lastOrderSent = mainOrder;
          const feedBackMessage = `Ordem de ${mainOrder.side} para o par ${mainOrder.symbol} enviada para a corretora.`;
          notifyUser(feedBackMessage);
          isReady = true;
        }
      } catch (error) {
        await futureClient.cancelAllOpenOrders({
          symbol: signal.symbol,
        });
        console.log("houve um problema para enviar os sinais", error);
        isReady = true;
      }
      isReady = true;
    } catch (error) {
      isReady = true;
      console.log(error);
    }
  } else {
    console.log("This message isn't a signal");
  }
};

const activeListeners = async () => {
  wsClient.on("reply", (data) => {
    console.log("log reply: ", JSON.stringify(data, null, 2));
  });
  wsClient.on("reconnecting", (data) => {
    console.log("ws automatically reconnecting.... ", data?.wsKey);
  });
  wsClient.on("reconnected", (data) => {
    console.log("ws has reconnected ", data?.wsKey);
  });
  wsClient.on("error", (data) => {
    console.log("ws saw error ", data?.wsKey);
  });
  await wsClient.subscribeUsdFuturesUserDataStream();
  await updateWalletAndOpenOrders();

  notifyUser(`**Bot iniciado!**\n${openOrders.length / 2} orden(s) abertas.\nSaldo de ${availableWalletUSDT}`);

  wsClient.on("formattedMessage", async (data) => {
    if (data.eventType === "ORDER_TRADE_UPDATE") {
      //se bater o win ou los, realizar o cancelamento de todas as demais entradas.
      await updateWalletAndOpenOrders();
      await verifyAndCancelOrdes();
    }
  });
};

//verificar o tempo das ordens em aberto, se tiver 3 com mais de 30 minutos, cancelá-las para liberar banca.
const updateWalletAndOpenOrders = async () => {
  try {
    isReady = false;
    const allBalance = await futureClient.getBalance();
    allBalance.forEach((asset) => {
      if (asset.asset === "USDT")
        availableWalletUSDT = parseFloat(asset.availableBalance).toFixed(2);
    });
    openOrders = await futureClient.getAllOpenOrders();
    if (openOrders.length > 0) await verifyAndCancelOrdes();
    else
      console.log(
        openOrders.length,
        "Ordens em aberto",
        "Saldo USDT: ",
        availableWalletUSDT
      );
    isReady = true;
  } catch (error) {
    isReady = true;
    console.log("Error to update wallet and open orders.");
  }
};

const verifyAndCancelOrdes = async () => {
  //Cancel protections
  if (openOrders.length === 1) {
    await futureClient.cancelAllOpenOrders({ symbol: openOrders[0].symbol });
    if (
      openOrders[0].side === "BUY" &&
      openOrders[0].stopPrice > parseFloat(lastOrderSent.price)
    ) {
      const feedBackMessage = `Ordem ${openOrders[0].side} - ${openOrders[0].symbol} com lucro, saldo atual: ${availableWalletUSDT}`;
      notifyUser(feedBackMessage);
    } else {
      const feedBackMessage = `Ordem ${openOrders[0].side} - ${openOrders[0].symbol} com prejuízo, saldo atual: ${availableWalletUSDT}`;
      notifyUser(feedBackMessage);
    }
  }

  //Cancel old signal if diference is bigest 30 minutes
  else if (openOrders.length === 3) {
    try {
      const signalDate = new Date(openOrders[0].time * 1000);
      const nowDate = new Date();
      const difMinutes = minutesDiference(signalDate, nowDate);
      if (difMinutes >= 30) {
        await futureClient.cancelAllOpenOrders({
          symbol: openOrders[0].symbol,
        });
        console.log(
          "O bot cancelou uma ordem que estava a muito tempo para entrar."
        );
      }
    } catch (error) {
      console.log("Houve um erro ao finalizar as ordens paradas");
    }
  }

  console.log(
    openOrders.length,
    "Ordens em aberto",
    "Saldo USDT: ",
    availableWalletUSDT
  );
};

const notifyUser = (message) => {
  const secondsLastNotify = secondsDiference(lastNotify, new Date());
  if (secondsLastNotify >= 3) {
    console.log(message);
    setTimeout(function () {
      if (client) {
        client.sendMessage("me", { message });
      }
    }, 3000);

    lastNotify = new Date();
  }
};

module.exports = {
  messageRecived,
  activeListeners,
};
