const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  apps: [
    {
      name: process.env.NAME ? process.env.NAME : 'BOT-NO-NAME',
      script: "./index.js",
      watch: true,
    },
  ],
};
