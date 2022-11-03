const { isValidSignal } = require("./botMethods.js");
const dotenv = require("dotenv");
dotenv.config();
const { USDMClient, WebsocketClient, DefaultLogger } = require("binance");

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
let isReady = false

const messageRecived = async (message) => {
  if (!isReady) {
    console.log('Sinal chegou cedo de mais, o bot ainda não está pronto')
    return
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

      console.log('Vlr ordem:', signal.quantityUSDT,  'Saldo', availableWalletUSDT)
      if (parseFloat(signal.quantityUSDT) < parseFloat(availableWalletUSDT)) {
        console.log("Ordem não executada por falta de saldo.");
        return;
      }

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
          const ordersAfter = await futureClient.getAllOpenOrders({
            symbol: signal.symbol,
          });

          console.log("Qtd sent", ordersAfter.length);
        }
      } catch (error) {
        await futureClient.cancelAllOpenOrders({
          symbol: signal.symbol,
        });
        console.log("houve um problema para enviar os sinais", error);
      }
    } catch (error) {
      console.log(error);
    }
  } else {
    console.log("This message isn't a signal");
  }
};

const activeListeners = async () => {
  // read response to command sent via WS stream (e.g LIST_SUBSCRIPTIONS)
  wsClient.on("reply", (data) => {
    console.log("log reply: ", JSON.stringify(data, null, 2));
  });

  // receive notification when a ws connection is reconnecting automatically
  wsClient.on("reconnecting", (data) => {
    console.log("ws automatically reconnecting.... ", data?.wsKey);
  });

  // receive notification that a reconnection completed successfully (e.g use REST to check for missing data)
  wsClient.on("reconnected", (data) => {
    console.log("ws has reconnected ", data?.wsKey);
  });

  // Recommended: receive error events (e.g. first reconnection failed)
  wsClient.on("error", (data) => {
    console.log("ws saw error ", data?.wsKey);
  });

  await wsClient.subscribeUsdFuturesUserDataStream();

  await updateWalletAndOpenOrders();

  wsClient.on("formattedMessage", async (data) => {
    console.log(data);
    if (data.eventType === "ORDER_TRADE_UPDATE") {
      //se bater o win ou los, realizar o cancelamento de todas as demais entradas.
      await updateWalletAndOpenOrders();
    }
  });
};

//verificar o tempo das ordens em aberto, se tiver 3 com mais de 30 minutos, cancelá-las para liberar banca.

const updateWalletAndOpenOrders = async () => {
  try {
    const allBalance = await futureClient.getBalance();
    allBalance.forEach((asset) => {
      if (asset.asset === "USDT") availableWalletUSDT = parseFloat(asset.availableBalance).toFixed(2);
    });
    openOrders = await futureClient.getAllOpenOrders();
    console.log("Wallet availble USDT: ", availableWalletUSDT);
    console.log("Open Orders: ", openOrders);
    isReady = true
  } catch (error) {
    console.log("Error to update wallet and open orders.");
  }
};

module.exports = {
  messageRecived,
  activeListeners,
};
