const ErrorCode = require("./error_message.json");
const messageCode = require("./languages/getMessages.js")
var api = undefined;

module.exports.importAPI = function (importedAPI){ api = importedAPI; }

/***
 * Permet d'envoyer un message à partir d'un identifiant de chat
 * @param chatId L'identifiant du chat
 * @param text Le texte qui sera envoyé
 * @param replyId L'identifiant du message pour répondre depuis ce message
 * @param parse_mode La méthode de mise à page : Markdown OU HTML
 * @param reply_markup Balisage de réponse pour l'envoi de boutons de bot
 * @param code "messages" OR "errors"
*/
module.exports.sendTextMessage = async function (chatId, text, replyId, parse_mode, reply_markup, codeMessage){
    return new Promise(async (resolve, reject) => {
        if(api == undefined) reject({code: "U-00", codeError: ErrorCode["U-00"], error: "Aucun"});

        if(chatId || text){
            let sendJSON = {chat_id: chatId}

            if(codeMessage){
                await getMessage("fr", codeMessage, text)
                .then(message => {
                    Object.assign(sendJSON, {text: message});
                })
                .catch(()=>{
                    Object.assign(sendJSON, {text: text});
                })
            }else{Object.assign(sendJSON, {text: text});}


            if(replyId && replyId != undefined) sendJSON = Object.assign(sendJSON, {reply_to_message_id: replyId});
            if(parse_mode && parse_mode != undefined) sendJSON = Object.assign(sendJSON, {parse_mode: parse_mode});
            if(reply_markup && reply_markup != undefined) sendJSON = Object.assign(sendJSON, {reply_markup: reply_markup});

            api.sendMessage(sendJSON)
            .then((result) => {
                resolve(result)
            })
            .catch((err) => {
                reject({code: "U-02", codeError: ErrorCode["U-02"], error: err}); 
            });

        }else{ reject({code: "U-01", codeError: ErrorCode["U-01"], error: "Aucun"}); }
    })
}

/***
 * @param chatId L'identifiant du chat
 * @param text Le texte qui sera envoyé
 * @param replyId L'identifiant du message pour répondre depuis ce message
 * @param parse_mode La méthode de mise à page : Markdown OU HTML
 * @param reply_markup Balisage de réponse pour l'envoi de boutons de bot : 
*/
module.exports.deleteMessage = async function(chatId, messageId){
    return new Promise((resolve, reject) => {
        if(api == undefined) reject({code: "U-00", codeError: ErrorCode["U-00"], error: "Aucun"});

        if(chatId || messageId){

            api.deleteMessage({ //Suppression du message
                chat_id: chatId,
                message_id: messageId
            })
            .then((result) => {
                resolve({message: result})
            })
            .catch((err) => {
                reject({code: "U-03", codeError: ErrorCode["U-03"], error: err}); 
            });

        }else{ reject({code: "U-01", codeError: ErrorCode["U-01"], error: "Aucun"}); }
    })
}

module.exports.replaceBracketsByWords = async function (message, words){
    return new Promise((resolve) => {
        Object.entries(words).forEach(entry => {
            const [key, value] = entry;
            message = String(message).replace(`{${key}}`, value)
          });
          resolve(message)
    })
}


async function getMessage(lang, type, msgCode){
    return new Promise((resolve, reject) =>{
        messageCode.getMessageLanguage(lang, type, msgCode)
        .then(result => {resolve(result)})
        .catch((err)=> {
            console.log("Erreur: " + err)
            reject("Erreur: " + err)
        })
    })
}