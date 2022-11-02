const dotenv = require("dotenv");
dotenv.config();

const { assetsMinValue } = require("./utils")

const unidade = parseInt(process.env.UNIDADE);

const isValidSignal = (message) => {
  if (!message) return false;

  const isSignal = testSignal(message);
  
  if (isSignal) return isSignal;
  else return false;
};

const testSignal = (message) => {
  const arrString = String(message.message).split(/\r?\n/);
  let signal = {}
  const leverage = arrString[6].slice(arrString[6].indexOf(':')+2, arrString[6].length)
  const quantity = String((parseFloat(arrString[10].slice(arrString[10].indexOf(':')+2, arrString[10].length)) * unidade) * parseInt(leverage))
  const symbol = arrString[4].slice(arrString[4].indexOf(':')+2, arrString[4].length)
  const minTrade = assetsMinValue.find(e=> e.asset === symbol).value
  const decimal = minTrade.indexOf('.') < 0 ? 0 : minTrade.length -1 - minTrade.indexOf('.')
  signal.quantity = parseFloat(quantity).toFixed(decimal)
  signal.side = arrString[3].slice(arrString[3].indexOf(':')+2, arrString[3].length)
  signal.symbol = symbol
  signal.entryPrice = arrString[5].slice(arrString[5].indexOf(':')+2, arrString[5].length)
  signal.takeProfitPrice = arrString[8].slice(arrString[8].indexOf(':')+2, arrString[8].length)
  signal.stopLossPrice = arrString[7].slice(arrString[7].indexOf(':')+2, arrString[7].length)
  signal.leverage = arrString[6].slice(arrString[6].indexOf(':')+2, arrString[6].length)

  return isAllProperiesValid(signal);
};


const isAllProperiesValid = (signal) => {
  if (!signal.quantity) return false
  if (!signal.side === 'BUY' || !signal.side === 'SELL') return false
  if (!signal.symbol) return false
  if (!signal.entryPrice) return false
  if (!signal.leverage) return false
  if (!signal.stopLossPrice) return false
  if (!signal.takeProfitPrice) return false
  return signal
}


module.exports = {
  isValidSignal,
};
