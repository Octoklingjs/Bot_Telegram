var telegram = require("telegram-bot-api");
var dotenv = require("dotenv");
dotenv.config()

const octoChat = "6252590790"

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

function sendAMessage(replyId, chatId, text, parse_mode, reply_markup){
    if(replyId == "0"){
        api.sendMessage({
            chat_id: chatId,
            text: text,
            parse_mode: parse_mode,
            reply_markup: reply_markup
        })
    }else{
        api.sendMessage({
            chat_id: chatId,
            text: text,
            parse_mode: parse_mode,
            reply_markup: reply_markup,
            reply_to_message_id: replyId
        })
    }
}

function editAMessage(){
    api.
}

api.on("update", async update =>{ //Lorsque le bot est sollicité
    console.log(update)
    if(update.callback_query){
        let interaction = update.callback_query;
        let dataInteraction = interaction.data;
        console.log(dataInteraction)
        if(dataInteraction == "lolocheHello"){
            await sendAMessage("0", octoChat, interaction.from.first_name + " te dit bonjour ^^", "Markdown", {});
            await sendAMessage(interaction.message.message_id, interaction.message.chat.id, " Bonjour envoyé !", "Markdown", {});
        }
    }

    if(update.message){
        let chat = update.message.chat; //Récupère le chat du message envoyé
        let messageContent = update.message.text.toString() //Convertir le message envoyé en string
        if(messageContent.startsWith("/")){
            let args = messageContent.split("/").join(" ").split(" ").slice(1); //Supprime le / des commandes + divise les arguments

            if(args[0] == "ping"){
                await sendAMessage("0", chat.id, "pong", "", {})
            }

            if(args[0] == "start"){
                await sendAMessage("0", chat.id, "Salut à toi !\nPour l'instant je suis encore en développement par Octokling", "Markdown", {inline_keyboard: [[{ text: 'Say hello to loloche', callback_data: "lolocheHello" }, { text: 'GitHub Repository', url: "https://github.com/Octoklingjs/Bot_Telegram" }]]})
            }
        }
    }
})

// Les informations sur le bot
function getInfos(){
    api.getMe()
    .then(console.log) //Si des informations ont été reçu
    .catch(console.err) //Si un message d'erreur à été envoyé
}