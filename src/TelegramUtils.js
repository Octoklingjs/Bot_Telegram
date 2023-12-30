const ErrorCode = require("./error_message.json");
var api = undefined;

module.exports.importAPI = function (importedAPI){ api = importedAPI; }

/***
 * Permet d'envoyer un message à partir d'un identifiant de chat
 * @param chatId L'identifiant du chat
 * @param text Le texte qui sera envoyé
 * @param replyId L'identifiant du message pour répondre depuis ce message
 * @param parse_mode La méthode de mise à page : Markdown OU HTML
 * @param reply_markup Balisage de réponse pour l'envoi de boutons de bot : 
*/

module.exports.sendTextMessage = async function (chatId, text, replyId, parse_mode, reply_markup){
    return new Promise((resolve, reject) => {
        if(api == undefined) reject({code: "U-00", codeError: ErrorCode["U-00"], error: "Aucun"});

        if(chatId || text){
            let sendJSON = {chat_id: chatId, text: text}

            if(replyId && replyId != undefined) sendJSON = Object.assign(sendJSON, {reply_to_message_id: replyId});
            if(parse_mode && parse_mode != undefined) sendJSON = Object.assign(sendJSON, {parse_mode: parse_mode});
            if(reply_markup && reply_markup != undefined) sendJSON = Object.assign(sendJSON, {reply_markup: reply_markup});

            console.log(sendJSON.text)

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