var telegram = require("telegram-bot-api");
var dotenv = require("dotenv");
dotenv.config()

const api = new telegram({
    token: process.env.TOKEN
})

const mp = new telegram.GetUpdateMessageProvider() //Initialisation d'envoie de messages ?

// Les informations sur le bot
api.getMe()
.then(console.log)
.catch(console.err)