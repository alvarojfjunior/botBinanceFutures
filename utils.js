const assetsMinValue = [
  { asset: "BTCUSDT", value: "0.001" },
  { asset: "ETHUSDT", value: "0.001" },
  { asset: "BCHUSDT", value: "0.001" },
  { asset: "XRPUSDT", value: "0.1" },
  { asset: "EOSUSDT", value: "0.1" },
  { asset: "LTCUSDT", value: "0.001" },
  { asset: "TRXUSDT", value: "1" },
  { asset: "ETCUSDT", value: "0.01" },
  { asset: "LINKUSDT", value: "0.01" },
  { asset: "XLMUSDT", value: "1" },
  { asset: "ADAUSDT", value: "1" },
  { asset: "XMRUSDT", value: "0.001" },
  { asset: "DASHUSDT", value: "0.001" },
  { asset: "ZECUSDT", value: "0.001" },
  { asset: "XTZUSDT", value: "0.1" },
  { asset: "BNBUSDT", value: "0.01" },
  { asset: "ATOMUSDT", value: "0.01" },
  { asset: "ONTUSDT", value: "0.1" },
  { asset: "IOTAUSDT", value: "0.1" },
  { asset: "BATUSDT", value: "0.1" },
  { asset: "VETUSDT", value: "1" },
  { asset: "NEOUSDT", value: "0.01" },
  { asset: "QTUMUSDT", value: "0.1" },
  { asset: "IOSTUSDT", value: "1" },
  { asset: "THETAUSDT", value: "0.1" },
  { asset: "ALGOUSDT", value: "0.1" },
  { asset: "ZILUSDT", value: "1" },
  { asset: "KNCUSDT", value: "1" },
  { asset: "ZRXUSDT", value: "0.1" },
  { asset: "COMPUSDT", value: "0.001" },
  { asset: "OMGUSDT", value: "0.1" },
  { asset: "DOGEUSDT", value: "1" },
  { asset: "SXPUSDT", value: "0.1" },
  { asset: "KAVAUSDT", value: "0.1" },
  { asset: "BANDUSDT", value: "0.1" },
  { asset: "RLCUSDT", value: "0.1" },
  { asset: "WAVESUSDT", value: "0.1" },
  { asset: "MKRUSDT", value: "0.001" },
  { asset: "SNXUSDT", value: "0.1" },
  { asset: "DOTUSDT", value: "0.1" },
  { asset: "DEFIUSDT", value: "0.001" },
  { asset: "YFIUSDT", value: "0.001" },
  { asset: "BALUSDT", value: "0.1" },
  { asset: "CRVUSDT", value: "0.1" },
  { asset: "TRBUSDT", value: "0.1" },
  { asset: "RUNEUSDT", value: "1" },
  { asset: "SUSHIUSDT", value: "1" },
  { asset: "SRMUSDT", value: "1" },
  { asset: "EGLDUSDT", value: "0.1" },
  { asset: "SOLUSDT", value: "1" },
  { asset: "ICXUSDT", value: "1" },
  { asset: "STORJUSDT", value: "1" },
  { asset: "BLZUSDT", value: "1" },
  { asset: "UNIUSDT", value: "1" },
  { asset: "AVAXUSDT", value: "1" },
  { asset: "FTMUSDT", value: "1" },
  { asset: "HNTUSDT", value: "1" },
  { asset: "ENJUSDT", value: "1" },
  { asset: "FLMUSDT", value: "1" },
  { asset: "TOMOUSDT", value: "1" },
  { asset: "RENUSDT", value: "1" },
  { asset: "KSMUSDT", value: "0.1" },
  { asset: "NEARUSDT", value: "1" },
  { asset: "AAVEUSDT", value: "0.1" },
  { asset: "FILUSDT", value: "0.1" },
  { asset: "RSRUSDT", value: "1" },
  { asset: "LRCUSDT", value: "1" },
  { asset: "MATICUSDT", value: "1" },
  { asset: "OCEANUSDT", value: "1" },
  { asset: "CVCUSDT", value: "1" },
  { asset: "BELUSDT", value: "1" },
  { asset: "CTKUSDT", value: "1" },
  { asset: "AXSUSDT", value: "1" },
  { asset: "ALPHAUSDT", value: "1" },
  { asset: "ZENUSDT", value: "0.1" },
  { asset: "SKLUSDT", value: "1" },
  { asset: "GRTUSDT", value: "1" },
  { asset: "1INCHUSDT", value: "1" },
  { asset: "BTCUSDT", value: "0.001" },
  { asset: "CHZUSDT", value: "1" },
  { asset: "SANDUSDT", value: "1" },
  { asset: "ANKRUSDT", value: "1" },
  { asset: "LITUSDT", value: "0.1" },
  { asset: "UNFIUSDT", value: "0.1" },
  { asset: "REEFUSDT", value: "1" },
  { asset: "RVNUSDT", value: "1" },
  { asset: "SFPUSDT", value: "1" },
  { asset: "XEMUSDT", value: "1" },
  { asset: "COTIUSDT", value: "1" },
  { asset: "CHRUSDT", value: "1" },
  { asset: "MANAUSDT", value: "1" },
  { asset: "ALICEUSDT", value: "0.1" },
  { asset: "HBARUSDT", value: "1" },
  { asset: "ONEUSDT", value: "1" },
  { asset: "LINAUSDT", value: "1" },
  { asset: "STMXUSDT", value: "1" },
  { asset: "DENTUSDT", value: "1" },
  { asset: "CELRUSDT", value: "1" },
  { asset: "HOTUSDT", value: "1" },
  { asset: "MTLUSDT", value: "1" },
  { asset: "OGNUSDT", value: "1" },
  { asset: "NKNUSDT", value: "1" },
  { asset: "DGBUSDT", value: "1" },
  { asset: "1000SHIBUSDT", value: "1" },
  { asset: "BAKEUSDT", value: "1" },
  { asset: "GTCUSDT", value: "0.1" },
  { asset: "ETHUSDT", value: "0.001" },
  { asset: "BTCDOMUSDT", value: "0.001" },
  { asset: "BNBUSDT", value: "0.01" },
  { asset: "ADAUSDT", value: "1" },
  { asset: "XRPUSDT", value: "0.1" },
  { asset: "IOTXUSDT", value: "1" },
  { asset: "DOGEUSDT", value: "1" },
  { asset: "AUDIOUSDT", value: "1" },
  { asset: "RAYUSDT", value: "0.1" },
  { asset: "C98USDT", value: "1" },
  { asset: "MASKUSDT", value: "1" },
  { asset: "ATAUSDT", value: "1" },
  { asset: "SOLUSDT", value: "1" },
  { asset: "FTTUSDT", value: "0.1" },
  { asset: "DYDXUSDT", value: "0.1" },
  { asset: "1000XECUSDT", value: "1" },
  { asset: "GALAUSDT", value: "1" },
  { asset: "CELOUSDT", value: "0.1" },
  { asset: "ARUSDT", value: "0.1" },
  { asset: "KLAYUSDT", value: "0.1" },
  { asset: "ARPAUSDT", value: "1" },
  { asset: "CTSIUSDT", value: "1" },
  { asset: "LPTUSDT", value: "0.1" },
  { asset: "ENSUSDT", value: "0.1" },
  { asset: "PEOPLEUSDT", value: "1" },
  { asset: "ANTUSDT", value: "0.1" },
  { asset: "ROSEUSDT", value: "1" },
  { asset: "DUSKUSDT", value: "1" },
  { asset: "FLOWUSDT", value: "0.1" },
  { asset: "IMXUSDT", value: "1" },
  { asset: "API3USDT", value: "0.1" },
  { asset: "GMTUSDT", value: "1" },
  { asset: "APEUSDT", value: "1" },
  { asset: "BNXUSDT", value: "0.1" },
  { asset: "WOOUSDT", value: "1" },
  { asset: "FTTUSDT", value: "0.1" },
  { asset: "JASMYUSDT", value: "1" },
  { asset: "DARUSDT", value: "0.1" },
  { asset: "GALUSDT", value: "1" },
  { asset: "AVAXUSDT", value: "0.1" },
  { asset: "NEARUSDT", value: "0.1" },
  { asset: "GMTUSDT", value: "0.1" },
  { asset: "APEUSDT", value: "0.1" },
  { asset: "GALUSDT", value: "1" },
  { asset: "FTMUSDT", value: "1" },
  { asset: "DODOUSDT", value: "1" },
  { asset: "ANCUSDT", value: "1" },
  { asset: "GALAUSDT", value: "1" },
  { asset: "TRXUSDT", value: "1" },
  { asset: "1000LUNCUSDT", value: "1" },
  { asset: "LUNA2USDT", value: "1" },
  { asset: "OPUSDT", value: "0.1" },
  { asset: "DOTUSDT", value: "0.1" },
  { asset: "TLMUSDT", value: "1" },
  { asset: "ICPUSDT", value: "0.1" },
  { asset: "WAVESUSDT", value: "0.1" },
  { asset: "LINKUSDT", value: "0.1" },
  { asset: "SANDUSDT", value: "0.1" },
  { asset: "LTCUSDT", value: "0.01" },
  { asset: "MATICUSDT", value: "1" },
  { asset: "CVXUSDT", value: "0.1" },
  { asset: "FILUSDT", value: "0.1" },
  { asset: "1000SHIBUSDT", value: "1" },
  { asset: "LEVERUSDT", value: "1" },
  { asset: "ETCUSDT", value: "0.1" },
  { asset: "LDOUSDT", value: "0.1" },
  { asset: "UNIUSDT", value: "0.1" },
  { asset: "AUCTIONUSDT", value: "0.1" },
  { asset: "INJUSDT", value: "0.1" },
  { asset: "STGUSDT", value: "1" },
  { asset: "FOOTBALLUSDT", value: "0.01" },
  { asset: "SPELLUSDT", value: "1" },
  { asset: "1000LUNCUSDT", value: "1" },
  { asset: "LUNA2USDT", value: "1" },
  { asset: "AMBUSDT", value: "1" },
  { asset: "PHBUSDT", value: "1" },
  { asset: "LDOUSDT", value: "1" },
  { asset: "CVXUSDT", value: "1" },
  { asset: "BTCUSDT", value: "0.001" },
  { asset: "ETHUSDT", value: "0.001" },
  { asset: "ICPUSDT", value: "1" },
  { asset: "APTUSDT", value: "0.1" },
  { asset: "QNTUSDT", value: "0.1" },
  { asset: "APTUSDT", value: "0.1" },
  { asset: "BLUEBIRUSDT", value: "0.1" },
];

module.exports = {
  assetsMinValue,
};
