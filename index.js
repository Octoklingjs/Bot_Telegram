var telegram = require("telegram-bot-api");
var dotenv = require("dotenv");
dotenv.config()

const api = new telegram({
    token: process.env.TOKEN
})

const mp = new telegram.GetUpdateMessageProvider() //Initialisation d'envoie et de réception de message ?

api.setMessageProvider(mp);
api.start()
.then(() => {
    console.log("Le bot est allumé !")
})
.catch(console.err)

api.on("update", update =>{ //Lorsque le bot est sollicité
    console.log(update);
})


// Les informations sur le bot
function getInfos(){
    api.getMe()
    .then(console.log) //Si des informations ont été reçu
    .catch(console.err) //Si un message d'erreur à été envoyé
}