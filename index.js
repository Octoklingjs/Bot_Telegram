var telegram = require("telegram-bot-api");

var dotenv = require("dotenv");
dotenv.config()

//Inclure les modules que j'ai créer pour rendre le code plus estétique ;)
const YouTube = require("./src/YouTube.js")
const TelegramUtils = require("./src/TelegramUtils.js")

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

            await tg.editMessageReplyMarkup({
                chat_id: interaction.message.chat.id,
                message_id: interaction.message.message_id,
                reply_markup: {inline_keyboard: [[{ text: 'Vous avez dit bonjour', callback_data: "1"}, { text: 'GitHub Repository', url: "https://github.com/Octoklingjs/Bot_Telegram" }]]}
            }).catch(console.err)
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
                TelegramUtils.sendTextMessage(chat.id, "Salut à toi !\nPour l'instant je suis encore en développement par Octokling", undefined, undefined, {inline_keyboard: [[{ text: 'Dire bonjour à Loloche', callback_data: "lolocheHello"}, { text: 'GitHub Repository', url: "https://github.com/Octoklingjs/Bot_Telegram" }]]});
            }

            if(command == "ytb"){
                YouTube.startCommand(tg, args, chat, update);
            }

            if(command == "rep"){
                TelegramUtils.sendTextMessage(chat.id, args[0], undefined, undefined, undefined, {type: "messages"})
            }
        }
    }
})

start();