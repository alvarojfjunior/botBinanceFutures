const dotenv = require("dotenv");
dotenv.config();

const unidade = parseFloat(process.env.UNIDADE);

const isValidSignal = (message) => {
  if (!message) return false;
  const isSignal = testSignal(message);

  if (isSignal) return isSignal;
  else return false;
};

const testSignal = (message) => {
  const arrString = String(message).split(/\r?\n/);

  if (arrString.length < 2) return false

  let signal = {};
  const leverage = arrString[5].slice(
    arrString[5].indexOf(":") + 2,
    arrString[5].length
  );
  const strQuantity = String(
    parseFloat(
      arrString[9].slice(arrString[9].indexOf(":") + 2, arrString[9].length)
    )
  );

  const assetDecimal = strQuantity.length - 1 - strQuantity.indexOf(".");

  const quantity = (parseFloat(strQuantity) * unidade * parseInt(leverage)).toFixed(
    assetDecimal
  );
  
  const symbol = arrString[3].slice(
    arrString[3].indexOf(":") + 2,
    arrString[3].length
  );
  signal.quantity = quantity;
  signal.quantityUSDT = parseFloat(
    arrString[8].slice(arrString[8].indexOf(":") + 2, arrString[8].length)
  ).toFixed(2)

  signal.side = arrString[2].slice(
    arrString[2].indexOf(":") + 2,
    arrString[2].length
  );
  signal.symbol = symbol;
  signal.entryPrice = arrString[4].slice(
    arrString[4].indexOf(":") + 2,
    arrString[4].length
  );
  signal.takeProfitPrice = arrString[7].slice(
    arrString[7].indexOf(":") + 2,
    arrString[7].length
  );
  signal.stopLossPrice = arrString[6].slice(
    arrString[6].indexOf(":") + 2,
    arrString[6].length
  );
  signal.leverage = arrString[5].slice(
    arrString[5].indexOf(":") + 2,
    arrString[5].length
  );

  return isAllProperiesValid(signal);
};

const isAllProperiesValid = (signal) => {
  if (!signal.quantity) return false;
  if (!signal.side === "BUY" || !signal.side === "SELL") return false;
  if (!signal.symbol) return false;
  if (!signal.entryPrice) return false;
  if (!signal.leverage) return false;
  if (!signal.stopLossPrice) return false;
  if (!signal.takeProfitPrice) return false;
  return signal;
};

module.exports = {
  isValidSignal,
};
