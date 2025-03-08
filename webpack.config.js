const Dotenv = require("dotenv-webpack");

const plugins = [];
plugins.push(
  new Dotenv({
    path: "./.env", // Percorso al file .env
    safe: true, // Carica il file .env.example per garantire che tutte le variabili siano definite
    systemvars: true, // Carica le variabili d'ambiente del sistema
    silent: true, // Nasconde eventuali errori se il file .env non è trovato
  })
);

module.exports = {
  plugins: plugins,
};
