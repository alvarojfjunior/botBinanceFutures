const { isValidSignal } = require("./botMethods.js");
const dotenv = require("dotenv");
dotenv.config();
const { USDMClient } = require("binance");

const key = process.env.BINANCEAPIKEY;
const secret = process.env.BINANCEAPISECRET;

const futureClient = new USDMClient({
  api_key: key,
  api_secret: secret,
  beautifyResponses: true,
});

const messageRecived = async (message) => {
  const signal = isValidSignal(message);
  
  if (signal) {
    try {
      // Este método deve sair futuramente
      await futureClient.cancelAllOpenOrders({
        symbol: signal.symbol,
      });

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
            console.log(`Erro ao enviar ordem:`, order);
            if (i === 0) console.log(mainOrder)
            else if (i === 1) console.log(stopLossOrder)
            else if (i === 2) console.log(takeProfitOrder)
          }
        });

        if (hasError) {
          await futureClient.cancelAllOpenOrders({
            symbol: signal.symbol,
          });
        } else {
          console.log("Sinal Enviado para a corretora");
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

  //postRequest()
};

module.exports = {
  messageRecived,
};
