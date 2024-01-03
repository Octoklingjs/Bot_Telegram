var telegram = require("telegram-bot-api");

var dotenv = require("dotenv");
dotenv.config()

//Inclure les modules que j'ai créé
const YouTube = require("./src/YouTube.js")
const TelegramUtils = require("./src/TelegramUtils.js");
const messageCode = require("./src/languages/getMessages.js")
const db = require("./src/database/user.js")

const octoChat = "6252590790" //C'est mon chatID avec le bot ;b

const tg = new telegram({
    token: process.env.TOKEN,
    updates: {
        enabled: true,
      },
})

const mp = new telegram.GetUpdateMessageProvider() //Initialisation d'envoie et de réception de message ? (Je sais toujours pas)

function start(){
    tg.setMessageProvider(mp);
    tg.start()
    .then(() => {
        console.log("Le bot est allumé !")
    })
    .catch(console.err)

    TelegramUtils.importAPI(tg);
}

tg.on("update", async update =>{ //Lorsque le bot est sollicité

    if(update.callback_query){
        let interaction = update.callback_query;
        let dataInteraction = interaction.data;

        if(dataInteraction == "lolocheHello"){
            await TelegramUtils.sendTextMessage(octoChat, interaction.from.first_name + " te dit bonjour ^^");

            let helloLoloche = "You said hello";
                await messageCode.getMessageLanguage("fr", "messages", "lolocheHelloSayed")
                .then(result => {helloLoloche = result})

            await tg.editMessageReplyMarkup({
                chat_id: interaction.message.chat.id,
                message_id: interaction.message.message_id,
                reply_markup: {inline_keyboard: [[{ text: helloLoloche, callback_data: "1"}, { text: 'GitHub Repository', url: "https://github.com/Octoklingjs/Bot_Telegram" }]]}
            }).catch(console.err)

            tg.answerCallbackQuery({
                callback_query_id: interaction.id,
                text: helloLoloche,
            }).catch(err =>{console.log(err)})
        }
    }

    if(update.message){
        let chat = update.message.chat; //Récupère le chat du message envoyé
        let messageContent = String(update.message.text)//Convertir le message envoyé en string

        if(messageContent.startsWith("/")){
            let command = messageContent.split(" ")[0].replace("/", "").toString().toLowerCase();
            let args = messageContent.split(" ").slice(1); //Supprime le / des commandes + divise les arguments

            if(command == "ping"){
                TelegramUtils.sendTextMessage(chat.id, "Pong", update.message.message_id)
                .catch((err) =>{
                    console.log(err)
                })
            }

            if(command == "start"){
                let helloLoloche = "Say hello to loloche";
                await messageCode.getMessageLanguage("fr", "messages", "lolocheHello")
                .then(result => {helloLoloche = result})
                TelegramUtils.sendTextMessage(chat.id, "start", undefined, undefined, {inline_keyboard: [[{ text: helloLoloche, callback_data: "lolocheHello"}, { text: 'GitHub Repository', url: "https://github.com/Octoklingjs/Bot_Telegram" }]]}, "messages");
            }

            if(command == "ytb"){
                YouTube.startCommand(tg, args, chat, update);
            }

            if(command == "rep"){ //Permet de répéter ce que l'utilisateur à écrit. Si un code message est trouvé, il enverra le code message
                TelegramUtils.sendTextMessage(chat.id, args[0], undefined, undefined, undefined, "messages")
                .catch((err) =>{
                    TelegramUtils.sendTextMessage(chat.id, err.code + ": " + err.codeError)
                })
            }

            if(command == "test"){
                let helloLoloche = "Say hello to loloche";
                await messageCode.getMessageLanguage("fr", "messages", "lolocheHello")
                TelegramUtils.sendTextMessage(chat.id, "start", undefined, undefined, {inline_keyboard: [[{ text: helloLoloche, callback_data: "HeyLaMerde"}, { text: 'GitHub Repository', url: "https://github.com/Octoklingjs/Bot_Telegram" }]]}, "messages");
            }
        }
    }
})

start();