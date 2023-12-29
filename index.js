var telegram = require("telegram-bot-api");
var dotenv = require("dotenv");
import { BcDLP } from 'bc-dlp'
const bcDLP = new BcDLP('yt-dlp')
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
    
}

api.on("update", async update =>{ //Lorsque le bot est sollicité

    if(update.callback_query){
        let interaction = update.callback_query;
        let dataInteraction = interaction.data;
        if(dataInteraction == "lolocheHello"){
            await sendAMessage("0", octoChat, interaction.from.first_name + " te dit bonjour ^^", "Markdown", {});
            //await sendAMessage(interaction.message.message_id, interaction.message.chat.id, " Bonjour envoyé !", "Markdown", {});
            //console.log(interaction.message.message_id)
            await api.editMessageReplyMarkup({
                chat_id: interaction.message.chat.id,
                message_id: interaction.message.message_id,
                reply_markup: {inline_keyboard: [[{ text: 'Vous avez dit bonjour', callback_data: "1"}, { text: 'GitHub Repository', url: "https://github.com/Octoklingjs/Bot_Telegram" }]]}
            }).catch(console.err)
        }
    }

    if(update.message){
        let chat = update.message.chat; //Récupère le chat du message envoyé
        let messageContent = update.message.text.toString() //Convertir le message envoyé en string
        if(messageContent.startsWith("/")){
            let command = messageContent.split(" ")[0].replace("/", "").toString().toLowerCase();
            let args = messageContent.split(" ").slice(1); //Supprime le / des commandes + divise les arguments

            console.log(args);

            if(command == "ping"){
                await sendAMessage("0", chat.id, "pong", "", {})
            }

            if(command == "start"){
                await sendAMessage("0", chat.id, "Salut à toi !\nPour l'instant je suis encore en développement par Octokling", "Markdown", {inline_keyboard: [[{ text: 'Dire bonjour à Loloche', callback_data: "lolocheHello"}, { text: 'GitHub Repository', url: "https://github.com/Octoklingjs/Bot_Telegram" }]]})
            }

            if(command == "ytb"){
                if(args[0]){
                    if(args[0].startsWith("https://www.youtube.com/watch?v=")){
                        
                    }else{
                        await sendAMessage(update.message.message_id, chat.id, "Ce que vous avez envoyé n'est pas un lien YouTube", "Markdown", {});
                    }
                }else{
                    await sendAMessage(update.message.message_id, chat.id, "Vous n'avez pas envoyé de lien YouTube", "Markdown", {});
                }
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
