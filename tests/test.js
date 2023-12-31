var messages = require("../src/languages/getMessages.js")

messages.getMessageLanguage("fr", "messages", "test").then(result =>{
    console.log(result)
})
 //Cela marche vraiment comme j'ai envie que ça marche 