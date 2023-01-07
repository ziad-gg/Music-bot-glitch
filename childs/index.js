const Discord = require("discord.js")
const { readdirSync } = require("node:fs")
const { Intents, MessageActionRow, MessageButton } = require("discord.js")
const { Player, RepeatMode } = require("discord-music-player")
const { joinVoiceChannel } = require('@discordjs/voice');
const config = require("../config.json")

module.exports.deloy = deloy

async function deloy(token, prefix) {

    const client = new Discord.Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES]})
    client.commands = new Map()
    client.Musics = new Map()

    client.Discord = Discord
    client.player = new Player(client, {
        leaveOnEmpty: true,
    });

    const settings = {
        prefix: prefix,
        token: token
    };
     
    for (let fileName of (readdirSync("childs/commands"))) {
      let command = require('./commands'.concat("/", fileName))
      client.commands.set(command.details.name, command)
    }

    client.on("ready", async () => {
        console.log("%s is online", client.user.username);
        client.mainGuild = await client.guilds.cache.get(config.guildId);
        client.voiceChannel = await client.mainGuild.channels.cache.get(config.channelId)
        joinVoiceChannel({
            channelId: client.voiceChannel.id,
            guildId: client.mainGuild.id,
            adapterCreator: client.mainGuild.voiceAdapterCreator
        })
    });
 
    async function kill(queue) {
        let { Msg, song } = queue.data
     
        const row = new MessageActionRow().addComponents(
         new MessageButton().setCustomId('play').setLabel('▶️ Play').setStyle('SECONDARY').setDisabled(true),
         new MessageButton().setCustomId('stop').setLabel('⏹️ Stop').setStyle('SECONDARY').setDisabled(true),
         new MessageButton().setCustomId('repeat').setLabel('🔁 Repeat').setStyle('SECONDARY').setDisabled(true),
         new MessageButton().setLabel('SONG').setURL(song.url).setStyle('LINK'),
       );
    
       const row1 = new MessageActionRow().addComponents(
         new MessageButton().setCustomId('volume-up').setLabel('🔊 Volume++').setStyle('SECONDARY').setDisabled(true),
         new MessageButton().setCustomId('volume-down').setLabel('🔉 Volume--').setStyle('SECONDARY').setDisabled(true),
         new MessageButton().setCustomId('skip').setLabel('⏭️ Skip').setStyle('SECONDARY').setDisabled(true),
         new MessageButton().setCustomId('seek').setLabel('🧿 Seek').setStyle('SECONDARY').setDisabled(true),
       );
    
       Msg.edit({components: [row, row1], content: "ended"})
       client.Musics.delete("message")

       setTimeout(() => {
          joinVoiceChannel({
            channelId: client.voiceChannel.id,
            guildId: client.mainGuild.id,
            adapterCreator: client.mainGuild.voiceAdapterCreator
           })
       }, 3000)
    }

    client.on('messageCreate', async (message) => {
        const args = message.content.slice(settings.prefix.length).trim().split(/ +/g);
        const command = args.shift().toLocaleLowerCase();
        const cmd = client.commands.get(command)
        if (cmd) return cmd.run.call({client, message, args});      
    })

    client.on("interactionCreate", (interaction) => {
    	if (!interaction.isButton()) return;
        let guildQueue = client.player.getQueue(interaction.guild.id);
        let embed = new Discord.MessageEmbed().setColor("RANDOM")
        let message = client.Musics.get("message")

        if (!message || interaction.message.id !== message.messageId) return

        if (interaction.customId === "skip") {
            let next = guildQueue?.skip()
            if (next) interaction.reply({embeds: [embed.setDescription(`> **Skip __${next.name}__**`)]})
        }

        if (interaction.customId === "stop") {
            guildQueue?.stop()
            interaction.reply({content: ":notes: The player has stopped and the queue has been cleared."})
        }

        if (interaction.customId === "repeat") {
            let repeat = message.repeated
            if (!repeat) {
                guildQueue.setRepeatMode(RepeatMode.SONG)
                client.Musics.set("message", {
                    messageId: message.messageId,
                    repeated: true
                })
                interaction.reply({content: ":notes: Repeat Mode: **ON**"})
            }
            if (repeat) {
                guildQueue.setRepeatMode(RepeatMode.DISABLED)
                client.Musics.set("message", {
                    messageId: message.messageId,
                    repeated: false
                })
                interaction.reply({content: ":notes: Repeat Mode: **OFF**"})
            }
        }

        if (interaction.customId === "volume-up") {
            let currentVol = message.volume
            guildQueue.setVolume(100);
            if ((currentVol + 20) > 100) return interaction.reply({content: `volume **100** 🟢`, ephemeral: true})

            guildQueue.setVolume((currentVol + 20) * 2);
            client.Musics.set("message", {
                messageId: message.messageId,
                repeated: false,
                volume: message.volume += 20
            })

            interaction.reply({content: `volume **${currentVol + 20} 🟢**`, ephemeral: true})
        }

        if (interaction.customId === "volume-down") {
            let currentVol = message.volume
            if ((currentVol - 20) < 1) return interaction.reply({content: `volume **20** 🔴`, ephemeral: true})
            guildQueue.setVolume(currentVol -= 20);
            client.Musics.set("message", {
                messageId: message.messageId,
                repeated: false,
                volume: message.volume -= 20
            })

            interaction.reply({content: `volume **${currentVol} 🔴**`, ephemeral: true})
        }

        if (interaction.customId === "seek") {
            guildQueue.seek(parseInt(30) * 1000);
            interaction.reply({content: "seeked 20 sec", ephemeral: true})
        }
    })

    client.player.on('songChanged', (queue, song, oldSong) => {
        let { Msg, message } = queue.data

        let embed = new Discord.MessageEmbed()
        .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL()})
        .setColor("RANDOM")
        .setDescription(`> **Now  palying __${song.name}__  duration: __${song.duration}__**`)
        .setImage(song.thumbnail)
        .setTimestamp()

        Msg.edit({embeds: [embed]})
    })

    client.player.on('queueEnd', kill)
    client.player.on('queueDestroyed', kill)
    client.player.on('channelEmpty', kill)
    client.player.on('clientDisconnect', kill)
 
    client.login(settings.token)
}

