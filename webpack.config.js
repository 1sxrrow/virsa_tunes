const webpack = require("webpack");
const Dotenv = require("dotenv-webpack");

const plugins = [];
if (process.env.ENV !== "production") {
  plugins.push(
    new Dotenv({
      path: "./.env", // Percorso al file .env
      safe: true, // Carica il file .env.example per garantire che tutte le variabili siano definite
      systemvars: true, // Carica le variabili d'ambiente del sistema
      silent: true, // Nasconde eventuali errori se il file .env non è trovato
    })
  );
} else {
  plugins.push(
    new webpack.EnvironmentPlugin([
      "ENV",
      "APP_NAME",
      "PROD_FIREBASE_API_KEY",
      "PROD_FIREBASE_AUTH_DOMAIN",
      "PROD_FIREBASE_DATABASE_URL",
      "PROD_FIREBASE_PROJECT_ID",
      "PROD_FIREBASE_STORAGE_BUCKET",
      "PROD_FIREBASE_MESSAGING_SENDER_ID",
      "PROD_FIREBASE_APP_ID",
      "DEV_FIREBASE_API_KEY",
      "DEV_FIREBASE_AUTH_DOMAIN",
      "DEV_FIREBASE_DATABASE_URL",
      "DEV_FIREBASE_PROJECT_ID",
      "DEV_FIREBASE_STORAGE_BUCKET",
      "DEV_FIREBASE_MESSAGING_SENDER_ID",
      "DEV_FIREBASE_APP_ID",
    ])
  );
}

module.exports = {
  plugins: plugins,
};
