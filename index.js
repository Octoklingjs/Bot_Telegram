var telegram = require("telegram-bot-api");
var dotenv = require("dotenv");
dotenv.config()

console.log(process.env.TOKEN)

const api = new telegram({
    token: process.env.TOKEN
})