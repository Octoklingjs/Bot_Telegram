/*
Pour plus tard ^^

var { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });

var dotenv = require("dotenv");
dotenv.config()

client.on('ready', () => {
    console.log(`Connecté !`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
  
    if (interaction.commandName === 'update') {
        await interaction.reply('Pong!');
    }
});

client.on("guildMemberAdd", member =>{
    console.log(member.user.username + " has joined the server " + member.guild.name);
    let guild = member.guild.channels.cache.get("!!!!!!!!!!!!!!!ID Salon!!!!!!!!!!!!!!!!!!")

    guild.send('Bienvenue')
})

client.login(process.env.TOKENDISCORD);
  */