const ytdl = require('ytdl-core');
const ffmpeg = require("fluent-ffmpeg");
const fs = require('fs');

const { randomInt } = require('crypto');

const ErrorCode = require("./error_message.json")
const TelegramUtils = require("./TelegramUtils.js")

var api = undefined;

module.exports.downloadVideo = async function (link) {
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
                return {status: ErrorCode["Y-01"] + err}
            });

            video.pipe(fs.createWriteStream(`./medias/${name}.mp4`));

            
        } catch (error) {
            console.error('Une erreur est survenue :', error);
            resolve({status: ErrorCode["Y-00"] + error})
        }
    })
}

module.exports.downloadMusic = async function (link) {
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
                return {status: ErrorCode["Y-01"] + error}
            });
        })

    } catch (error) {
        console.error('Une erreur est survenue :', error);
        return {status: ErrorCode["Y-00"]}
    }
}


/** 
 * @param api L'API de Telegram
 * @param args Les arguments après les commandes
 * @param chat Les informations sur le chat
 * @param update Les données du message envoyé
**/
module.exports.startCommand = async function (TGapi, args, chat, update){
    api = TGapi;

    if(args[0] != undefined && args[1] != undefined){

        if(args[1].startsWith("https://www.youtube.com/watch?v=") || args[1].startsWith("https://youtu.be/")){

            let messageSended = await TelegramUtils.sendTextMessage(chat.id, "Traitement en cours..."); //Mettre dans une variable pour récuperer resolv

                switch(args[0][0].toLocaleLowerCase()){
                            
                    case "m": //Pour la musique
                                
                    let downloadedMusic = await this.downloadMusic(args[1]);

                    if(downloadedMusic.path){ //Si il y a path, alors tout est bon
                        let audio = await fs.createReadStream(downloadedMusic.path); //La seul sollution pour envoyé chez telegram :) (J'en ai chier à trouver ^^)

                        api.sendAudio({ //Envoie l'audio
                            chat_id: chat.id,
                            audio: audio,
                            title: downloadedMusic.title,
                            duration: downloadedMusic.duration,
                            performer: downloadedMusic.performer,
                            caption: "Voici " + downloadedMusic.title + " par " + downloadedMusic.performer
                        })
                        .then(function (){ //Dès que sendAudio est terminé
                            api.deleteMessage({ //Suppression du message da patience
                                chat_id: chat.id,
                                message_id: messageSended.message_id
                            }).catch((err)=>{
                                console.log(err)
                            })

                            fs.unlink(downloadedMusic.path, (err) => {if (err) {console.error(err);}}); //Supprime le fichier audio téléchargé
                        })
                        .catch(function(err){ //Capturer l'erreur sans faire crash le script

                                        if(err.code == 413){
                                            api.editMessageText({
                                                chat_id: chat.id,
                                                message_id: messageSended.message_id,
                                                text: ErrorCode["Y-05"]
                                            })
                                        }else{
                                            api.editMessageText({
                                                chat_id: chat.id,
                                                message_id: messageSended.message_id,
                                                text: ErrorCode["Y-03"]
                                            })
                                        }

                                        fs.unlink(downloadedMusic.path, (err) => {if (err) {console.error(err);}}) ;//Supprime le fichier audio téléchargé
                                        console.log(err);
                                    });
                                }else{
                                    api.editMessageText({
                                        chat_id: chat.id,
                                        message_id: messageSended.message_id,
                                        text: ErrorCode["Y-02"]
                                    })
                                }
                                break;

                            case "v":
                                let downloadedVideo = await this.downloadVideo(args[1]);

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
                                        }).catch((err)=>{
                                            console.log(err)
                                        })
                                        fs.unlink(downloadedVideo.path, (err) => {if (err) {console.error(err);}});
                                    })
                                    .catch(function(err){
                                        if(err.code == 413){
                                            api.editMessageText({
                                                chat_id: chat.id,
                                                message_id: messageSended.message_id,
                                                text: ErrorCode["Y-05"]
                                            })
                                        }else{
                                            api.editMessageText({
                                                chat_id: chat.id,
                                                message_id: messageSended.message_id,
                                                text: ErrorCode["Y-04"]
                                            })
                                        }
                                        fs.unlink(downloadedVideo.path, (err) => {if (err) {console.error(err);}});
                                        console.log(err);
                                    });
                                }else{
                                    api.editMessageText({
                                        chat_id: chat.id,
                                        message_id: messageSended.message_id,
                                        text: ErrorCode["Y-02"]
                                    })
                                }
                                break;
                            
                            default:
                                TelegramUtils.deleteMessage(chat.id, messageSended.message_id);
                                await TelegramUtils.sendTextMessage(chat.id, ErrorCode["Y-06"] + ErrorCode["Y-09"], update.message.message_id);
                        }
                    }else{
                        await TelegramUtils.sendTextMessage(chat.id, ErrorCode["Y-07"], update.message.message_id);
                    }
                }else{
                    await TelegramUtils.sendTextMessage(chat.id, ErrorCode["Y-08"] + "\n" + ErrorCode["Y-09"], update.message.message_id);
                }
}