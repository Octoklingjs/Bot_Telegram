//Importation de tout les json de langages
const listLang = require("./listLang.json")
const fs = require("fs")
var langAvailable = listLang;

/***
 * Récuperer le contenu d'un message à envoyé pré enregistré en échange d'un code
 * @param lang La langue que nous voulons récupérer
 * @param type Le type de message recherché [messages: Messages | errors: Erreurs]
 * @param msgCode Code du message
 * @author Octokling
 */
module.exports.getMessageLanguage = async function (lang, type, msgCode){
    return new Promise((resolve, reject) => {
        if(lang && type && msgCode){
            if(langAvailable.hasOwnProperty(lang)){
                if(langAvailable[lang].hasOwnProperty(type)){

                    fs.readFile(langAvailable[lang][type], "utf8", (error, data) => {
                        if (!error){
                            data = JSON.parse(data)

                            if(data.hasOwnProperty(msgCode)){
                                resolve(data[msgCode])

                            }else{reject("Le code du message recherché n'est pas disponible ou mal écrite")}
                        }else{reject("Erreur FS: " + error);}
                    })
                }else{reject("Le type recherché n'est pas disponible ou mal écrite")}
            }else{reject("La langue recherché n'est pas disponible ou mal écrite")}
        }else{reject("Il manque des arguments !")}
    })
}