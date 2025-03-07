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
    new webpack.DefinePlugin({
      "process.env.ENV": JSON.stringify(process.env.ENV),
      "process.env.APP_NAME": JSON.stringify(process.env.APP_NAME),
      "process.env.PROD_FIREBASE_API_KEY": JSON.stringify(
        process.env.PROD_FIREBASE_API_KEY
      ),
      "process.env.PROD_FIREBASE_AUTH_DOMAIN": JSON.stringify(
        process.env.PROD_FIREBASE_AUTH_DOMAIN
      ),
      "process.env.PROD_FIREBASE_DATABASE_URL": JSON.stringify(
        process.env.PROD_FIREBASE_DATABASE_URL
      ),
      "process.env.PROD_FIREBASE_PROJECT_ID": JSON.stringify(
        process.env.PROD_FIREBASE_PROJECT_ID
      ),
      "process.env.PROD_FIREBASE_STORAGE_BUCKET": JSON.stringify(
        process.env.PROD_FIREBASE_STORAGE_BUCKET
      ),
      "process.env.PROD_FIREBASE_MESSAGING_SENDER_ID": JSON.stringify(
        process.env.PROD_FIREBASE_MESSAGING_SENDER_ID
      ),
      "process.env.PROD_FIREBASE_APP_ID": JSON.stringify(
        process.env.PROD_FIREBASE_APP_ID
      ),
      "process.env.DEV_FIREBASE_API_KEY": JSON.stringify(
        process.env.DEV_FIREBASE_API_KEY
      ),
      "process.env.DEV_FIREBASE_AUTH_DOMAIN": JSON.stringify(
        process.env.DEV_FIREBASE_AUTH_DOMAIN
      ),
      "process.env.DEV_FIREBASE_DATABASE_URL": JSON.stringify(
        process.env.DEV_FIREBASE_DATABASE_URL
      ),
      "process.env.DEV_FIREBASE_PROJECT_ID": JSON.stringify(
        process.env.DEV_FIREBASE_PROJECT_ID
      ),
      "process.env.DEV_FIREBASE_STORAGE_BUCKET": JSON.stringify(
        process.env.DEV_FIREBASE_STORAGE_BUCKET
      ),
      "process.env.DEV_FIREBASE_MESSAGING_SENDER_ID": JSON.stringify(
        process.env.DEV_FIREBASE_MESSAGING_SENDER_ID
      ),
      "process.env.DEV_FIREBASE_APP_ID": JSON.stringify(
        process.env.DEV_FIREBASE_APP_ID
      ),
    })
  );
}

module.exports = {
  plugins: plugins,
};
