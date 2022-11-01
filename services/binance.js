const axios = require("axios");
const crypto = require("crypto");
const moment = require("moment");

const apiKey = process.env.APIKEY
const apiSecret = process.env.APISECRET

const baseUrl = "https://fapi.binance.com";

const createHash = (query, apiSecret) =>
  crypto.createHmac("sha256", apiSecret).update(query).digest("hex");

// API DOC: https://binance-docs.github.io/apidocs/spot/en/#change-log

//Mandar os parametros sem a '?'
const getRequest = async (
  endpoint,
  params = "",
  apiKey,
  apiSecret,
  signed = false
) => {
  const config = {
    headers: {
      accept: "*/*",
      "Content-Type": "application/x-www-form-urlencoded",
      "X-MBX-APIKEY": apiKey,
    },
  };

  let query = params;
  let uri = baseUrl + endpoint + "?" + query;

  if (signed) {
    const timestamp = Date.now();
    query += `&timestamp=${timestamp}`;
    uri += `&timestamp=${timestamp}&signature=${createHash(query, apiSecret)}`;
  }

  try {
    return await axios.get(uri, config);
  } catch (error) {
    console.log(error);
    throw new Error("Error ", error);
  }
};

const postRequest = async (
  endpoint,
  params = "",
  body = {},
  signed = false
) => {
  let config = {
    headers: {
      accept: "*/*",
      "Content-Type": "application/x-www-form-urlencoded",
      "X-MBX-APIKEY": apiKey,
    },
  };
  const timestamp = Date.now();

  let query = params + `&timestamp=${timestamp}&recvWindow=10000000`;

  let uri = baseUrl + endpoint + "?" + query;

  if (signed) {
    uri += `&signature=${createHash(query, apiSecret)}`;
  }

  try {
    return await axios.post(uri, body, config);
  } catch (error) {
    console.log(error.response.data);
    throw new Error("Error ", error);
  }
};

module.exports = {
  getRequest,
  postRequest,
};
