const isValidSignal = (message) => {
  if (!message) return false;
  const isBinanceFuturesSinais = testBinanceFuturesSinais(message);
  if (isBinanceFuturesSinais) return isBinanceFuturesSinais;
  else return false;
};

const testBinanceFuturesSinais = (message) => {
  const arrString = String(message.message).split(/\r?\n/);
  if (arrString[0] !== "👉 NOVO SINAL DE ENTRADA 🤑") return false;
  let signal = {};
  const entryPrice = arrString[4]
    .slice(arrString[4].indexOf("Pontos de entrada:") + 18, arrString[4].length)
    .replaceAll("🟢", "")
    .replaceAll(" ", "");
  //Mínimo 5 dólares na moeda
  signal.quantity = parseFloat(
    parseInt(process.env.USDTENTRY) / parseFloat(entryPrice)
  ).toFixed(0);
  signal.side = arrString[2].indexOf("LONG") ? "BUY" : "SELL";
  signal.symbol = arrString[1]
    .slice(arrString[1].indexOf("#") + 1, arrString[1].length)
    .replace("/", "")
    .replaceAll(" ", "");
  signal.entryPrice = entryPrice;
  signal.leverage = arrString[3]
    .slice(arrString[3].indexOf("Alavancagem:") + 12, arrString[3].length)
    .replaceAll(" ", "");
  signal.stopLossPrice = arrString[6]
    .slice(arrString[6].indexOf("StopLoss:") + 9, arrString[6].length)
    .replaceAll("💥", "")
    .replaceAll(" ", "");
  signal.takeProfitPrice = arrString[9]
    .slice(arrString[9].indexOf("TARGET 1 -") + 10, arrString[9].length)
    .replaceAll(" ", "");
  return signal;
};

module.exports = {
  isValidSignal,
};
