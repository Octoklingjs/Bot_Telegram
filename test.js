const fs = require('fs');
const ytdl = require('ytdl-core');
const ffmpeg = require("fluent-ffmpeg");
const { randomInt } = require('crypto');

async function test() {
    try {
        const audio = await ytdl("https://www.youtube.com/watch?v=EiV1YxtbfcE", { filter: "audioonly" });
        let  name = randomInt(10000, 99999)

        console.log(info)

        ffmpeg(audio)
        .audioBitrate(128)
        .save(`./audios/${name}.mp3`)
        .on('end', () => {
            return {status: "Success" + error, path: `./audios/${name}.mp3`}
        });

    } catch (error) {
        console.error('Une erreur est survenue :', error);
        return {status: "Une erreur est survenue :" + error}
    }
    return {status: "Aucune réponse de la requête."}
}

test()
/*
ytdl('http://www.youtube.com/watch?v=aqz-KE-bpKQ')
  .pipe(fs.createWriteStream('video.mp4'));*/