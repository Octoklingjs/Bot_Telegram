var telegram = require("telegram-bot-api");
var dotenv = require("dotenv");

const ytdl = require('ytdl-core');
const ffmpeg = require("fluent-ffmpeg");
const { randomInt } = require('crypto');

const fs = require('fs');

dotenv.config()

const octoChat = "6252590790"

const api = new telegram({
    token: process.env.TOKEN,
    updates: {
        enabled: true,
      },
})

const mp = new telegram.GetUpdateMessageProvider() //Initialisation d'envoie et de réception de message ?

api.setMessageProvider(mp);
api.start()
.then(() => {
    console.log("Le bot est allumé !")
})
.catch(console.err)

async function sendAMessage(replyId, chatId, text, parse_mode, reply_markup){
    let result = [];
    if(replyId == "0"){
        await api.sendMessage({
            chat_id: chatId,
            text: text,
            parse_mode: parse_mode,
            reply_markup: reply_markup
        }).then((message) => {
            result = message;
        });
        return result;
    }else{
        await api.sendMessage({
            chat_id: chatId,
            text: text,
            parse_mode: parse_mode,
            reply_markup: reply_markup,
            reply_to_message_id: replyId
        }).then((message) => {
            result = message;
        });
        return result;
    }
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
        let messageContent = String(update.message.text)//Convertir le message envoyé en string

        console.log("Message Update: \nAuthor: " + update.message.from.first_name + "\nMessage: " + messageContent);

        if(messageContent.startsWith("/")){
            let command = messageContent.split(" ")[0].replace("/", "").toString().toLowerCase();
            let args = messageContent.split(" ").slice(1); //Supprime le / des commandes + divise les arguments

            if(command == "ping"){
                await sendAMessage("0", chat.id, "pong", "", {})
            }

            if(command == "start"){
                await sendAMessage("0", chat.id, "Salut à toi !\nPour l'instant je suis encore en développement par Octokling", "Markdown", {inline_keyboard: [[{ text: 'Dire bonjour à Loloche', callback_data: "lolocheHello"}, { text: 'GitHub Repository', url: "https://github.com/Octoklingjs/Bot_Telegram" }]]})
            }

            if(command == "ytb"){
                console.log(args[0] + " " + args[1])
                if(args[0] != undefined && args[1] != undefined){

                    if(args[1].startsWith("https://www.youtube.com/watch?v=") || args[1].startsWith("https://youtu.be/")){

                        let messageSended = await sendAMessage("0", chat.id, "Traitement en cours...", "Markdown", {}); //Mettre dans une variable pour récuperer resolv

                        switch(args[0][0].toLocaleLowerCase()){
                            case "m": //Pour la musique
                                let downloadedMusic = await downloadMusic(args[1]);

                                if(downloadedMusic.path){ //Si il y a path, alors tout est bon
                                    let audio = await fs.createReadStream(downloadedMusic.path); //La seul sollution pour envoyé chez telegram :) (J'en ai chier à trouver ^^)

                                    api.sendAudio({
                                        chat_id: chat.id,
                                        audio: audio,
                                        title: downloadedMusic.title,
                                        duration: downloadedMusic.duration,
                                        performer: downloadedMusic.performer,
                                        caption: "Voici " + downloadedMusic.title + " par " + downloadedMusic.performer
                                    }).then(function (){
                                        api.deleteMessage({ //Suppression du message da patience
                                            chat_id: chat.id,
                                            message_id: messageSended.message_id
                                        })
                                        fs.unlink(downloadedMusic.path, (err) => {if (err) {console.error(err);}});
                                    }).catch(function(err){
                                        if(err.code == 413){
                                            api.editMessageText({
                                                chat_id: chat.id,
                                                message_id: messageSended.message_id,
                                                text: "La vidéo est trop longue, impossible de l'envoyer"
                                            })
                                        }else{
                                            api.editMessageText({
                                                chat_id: chat.id,
                                                message_id: messageSended.message_id,
                                                text: "Une erreur est survenue, nous somme navré."
                                            })
                                        }
                                        fs.unlink(downloadedMusic.path, (err) => {if (err) {console.error(err);}});
                                        console.log(err);
                                    });
                                }else{
                                    api.editMessageText({
                                        chat_id: chat.id,
                                        message_id: messageSended.message_id,
                                        text: "Une erreur est survenu !\nVérifiez le lien de votre vidéo YouTube."
                                    })
                                }
                                break;

                            case "v":
                                let downloadedVideo = await downloadVideo(args[1]);

                                if(downloadedVideo.path){
                                    let video = await fs.createReadStream(downloadedVideo.path);
                                    
                                    api.sendVideo({
                                        chat_id: chat.id,
                                        video: video,
                                        title: downloadedVideo.title,
                                        duration: downloadedVideo.duration,
                                        performer: downloadedVideo.performer,
                                        caption: "Voici " + downloadedVideo.title + " par " + downloadedVideo.performer
                                    }).then(function (){
                                        api.deleteMessage({ //Suppression du message da patience
                                            chat_id: chat.id,
                                            message_id: messageSended.message_id
                                        })
                                        fs.unlink(downloadedVideo.path, (err) => {if (err) {console.error(err);}});
                                    })
                                    .catch(function(err){
                                        if(err.code == 413){
                                            api.editMessageText({
                                                chat_id: chat.id,
                                                message_id: messageSended.message_id,
                                                text: "La vidéo est trop longue, impossible de l'envoyer"
                                            })
                                        }else{
                                            api.editMessageText({
                                                chat_id: chat.id,
                                                message_id: messageSended.message_id,
                                                text: "Une erreur est survenue, nous somme navré."
                                            })
                                        }
                                        fs.unlink(downloadedVideo.path, (err) => {if (err) {console.error(err);}});
                                        console.log(err);
                                    });
                                }else{
                                    api.editMessageText({
                                        chat_id: chat.id,
                                        message_id: messageSended.message_id,
                                        text: "Une erreur est survenu !\nVérifiez le lien de votre vidéo YouTube."
                                    })
                                }
                                break;
                            
                            default:
                                await sendAMessage(update.message.message_id, chat.id, "Vous devez choisir si vous voulez obtenir la vidéo ou la musique\nExemple, si vous voulez la musique : ```Exemple /ytb music https://youtu.be/YOURVIDEO```\nSi vous voulez la vidéo : ```Exemple /ytb video https://youtu.be/YOURVIDEO```", "Markdown", {});
                        }
                    }else{
                        await sendAMessage(update.message.message_id, chat.id, "Le lien donné, n'est pas un lien YouTube traitable.", "Markdown", {});
                    }
                }else{
                    await sendAMessage(update.message.message_id, chat.id, "Il vous manque des arguments\nExemple, si vous voulez récupérer l'audio : ```Exemple /ytb music https://youtu.be/YOURVIDEO```\nSi vous voulez récupérer la vidéo : ```Exemple /ytb video https://youtu.be/YOURVIDEO```", "Markdown", {});
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

async function downloadMusic(link) {
    try {
        let info = await ytdl.getInfo(link);
        const audio = await ytdl(link, { filter: "audioonly" });
        let  name = randomInt(10000, 99999)

        return new Promise((resolve) => { // Créer une instance de promesse car nous voulons attendre la réponse de resolve
            ffmpeg(audio)
            .audioBitrate(128)
            .save(`./medias/${name}.mp3`)
            .on('end', async () => {
                console.log("Audio complete")
                resolve({status: "Success", path: `./medias/${name}.mp3`, title: info.videoDetails.title, performer: info.videoDetails.author.name, duration: info.videoDetails.lengthSeconds})
            })
            .on('error', (error) => {
                return {status: "Une erreur est survenue :" + error}
            });
        })

    } catch (error) {
        console.error('Une erreur est survenue :', error);
        return {status: "Une erreur est survenue :" + error}
    }
}

async function downloadVideo(link) {
    return new Promise(async (resolve) => {
        try {
            let info = await ytdl.getInfo(link);
            let  name = randomInt(10000, 99999)

            const video = await ytdl(link, { quality: '18' })
            console.log(video)

            video.on('end', () => {
                console.log("Video complete")
                resolve({status: "Success", path: `./medias/${name}.mp4`, title: info.videoDetails.title, performer: info.videoDetails.author.name, duration: info.videoDetails.lengthSeconds})
            });

            video.on('error', err => {
                return {status: "Une erreur est survenue :" + error}
            });

            video.pipe(fs.createWriteStream(`./medias/${name}.mp4`));

            
        } catch (error) {
            console.error('Une erreur est survenue :', error);
            resolve({status: "Une erreur est survenue :" + error})
        }
    })
}