//Importation de tout les json de langages
const { promises } = require("dns")
const listLang = require("./listLang.json")
var langAvailable;


Object.keys(listLang).forEach((key) => {
    console.log(key)
})

/***
 * @param lang La langue que nous voulons récupérer
 * @param type Le type de message recherché [0: Messages, 1: Erreurs, 2: COMMING SOON)]
 */

module.exports.getMessageLanguage = async function (lang, type, msgCode){
    return langAvailable;
    /*return new Promise((resolve, reject) => {
        if(lang && )
    })*/
}

this.getMessageLanguage("fr", 0)