const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  apps: [
    {
      name: process.env.NAME ? process.env.NAME : "NO-NAME",
      script: "npm start",
      watch: true,
      autorestart: true,
      env: {
        NODE_ENV: "development"
      },
      env_production: {
        NODE_ENV: "production"
      }
    },
  ],

  deploy: {
    production: {
      host: '54.94.122.132',
      user: 'ubuntu',
      ref: 'origin/main',
      repo: "git@github.com:alvarojfjunior/botBinanceFutures.git",
      path: "/var/app/repositories",
      "post-deploy":
        "npm install && pm2 reload ecosystem.config.js --env production && pm2 save"
    }
  }
};
