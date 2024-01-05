var telegram = require("telegram-bot-api");

var dotenv = require("dotenv");
dotenv.config()

//Inclure les modules que j'ai créé
const YouTube = require("./src/YouTube.js")
const TelegramUtils = require("./src/TelegramUtils.js");
const messageCode = require("./src/languages/getMessages.js")
const userSettingsDB = require("./src/database/userSettings.js");
const { verify } = require("crypto");

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
    let userData = {};
    let userLang = "en";

    if(update.callback_query){
        let interaction = update.callback_query;
        let dataInteraction = interaction.data;

        userData = await verifyUser(update.callback_query.from, update.callback_query.message.chat.id)

        if(userData.isExist != true) return;

        if(dataInteraction == "lolocheHello"){
            await TelegramUtils.sendTextMessage(octoChat, interaction.from.first_name + " te dit bonjour ^^");

            let helloLoloche = "You said hello";
                await messageCode.getMessageLanguage(userLang, "messages", "lolocheHelloSayed")
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
        let messageContent = String(update.message.text) //Convertir le message envoyé en string

        userData = await verifyUser(update.message.from);
        if(!messageContent.startsWith("/start")){
            if(userData.isExist != true){
                return TelegramUtils.sendTextMessage(update.message.chat.id, "Hey, i never meet you before, nice to meet you !\nBy default i'll speaking with you in English. If you want to change the language, just use ```language /setLanguage yourLanguage```", undefined, "Markdown")
            }
        }

        if((messageContent.startsWith("/") && userData.isExist == true) || messageContent.startsWith("/")){
            let command = (((messageContent.split(" ")[0]).replace("/", "")).split("@")[0]).toLowerCase();
            let args = messageContent.split(" ").slice(1); //Supprime le / des commandes + divise les arguments

            if(userData.isExist){
                userLang = userData.lang;
            }
            console.log("Language du bot: " + userLang);

            switch(command){
                case "ping":

                    TelegramUtils.sendTextMessage(chat.id, "Pong", update.message.message_id)
                    .catch((err) =>{
                        console.log(err)
                    })

                    break;
                case "start":

                    let helloLoloche = "Say hello to loloche";
                    await messageCode.getMessageLanguage("userLang", "messages", "lolocheHello")
                    .then(result => {helloLoloche = result})
                    TelegramUtils.sendTextMessage(chat.id, "start", undefined, undefined, {inline_keyboard: [[{ text: helloLoloche, callback_data: "lolocheHello"}, { text: 'GitHub Repository', url: "https://github.com/Octoklingjs/Bot_Telegram" }]]}, "messages", userLang);
                    if(!userData.isExist) await userSettingsDB.addUserSettingsToDB(update.message.from);

                    break;
                case "youtube":
                case "ytb":

                    YouTube.startCommand(tg, args, chat, update, userLang);

                    break;
                case "setlanguage":

                    userSettingsDB.changeUserLang(update.message.from, "fr").then(result => {
                        console.log("Ok c'est bon")
                    })

                    break;
                case "rep":

                    TelegramUtils.sendTextMessage(chat.id, args[0], undefined, undefined, undefined, "messages", userLang)
                    .catch((err) =>{
                        TelegramUtils.sendTextMessage(chat.id, err.code + ": " + err.codeError)
                    })

                    break;
                case "test":
                    break;
            }

        }
    }
})

async function verifyUser(userInfo){
    return new Promise(async (resolve, reject) => {

        await userSettingsDB.verificationUserAndGetData(userInfo.id)
        .then(async result => {
            if(result.isExist == false){
                await userSettingsDB.addUserSettingsToDB(userInfo);
                resolve(result)
            }else{
                resolve(result)
            }
        })
        .catch(err =>{
            reject(err)
        })

    })
}

start();