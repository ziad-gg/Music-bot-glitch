module.exports.run = async function() {

    let { message, args, client } = this
    let { MessageActionRow, MessageButton } = client.Discord 

    if (!this.message.member.voice.channelId) return this.message.reply({content: ":no_entry_sign: You must be in a voice channel first"});

    let guildQueue = client.player.getQueue(this.message.guild.id);
    let queue = client.player.createQueue(this.message.guild.id);

    await queue.join(message.member.voice.channel);
    await queue.play(args.join(' ')).then(async song => {

      let embed = new this.client.Discord.MessageEmbed()
      .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL()})
      .setColor("RANDOM")
      .setDescription(`> **${song.isFirst? "Now" : ""} palying __${song.name}__ ${song.isFirst? "" : "Next"} duration: __${song.duration}__**`)
      .setImage(song.thumbnail)
      .setTimestamp()

      const row = new MessageActionRow().addComponents(
        new MessageButton().setCustomId('play').setLabel('▶️ Play').setStyle('SECONDARY'),
        new MessageButton().setCustomId('stop').setLabel('⏹️ Stop').setStyle('SECONDARY'),
        new MessageButton().setCustomId('repeat').setLabel('🔁 Repeat').setStyle('SECONDARY'),
        new MessageButton().setLabel('SONG').setURL(song.url).setStyle('LINK'),
      );

      const row1 = new MessageActionRow().addComponents(
        new MessageButton().setCustomId('volume-up').setLabel('🔊 Volume++').setStyle('SECONDARY'),
        new MessageButton().setCustomId('volume-down').setLabel('🔉 Volume--').setStyle('SECONDARY'),
        new MessageButton().setCustomId('skip').setLabel('⏭️ Skip').setStyle('SECONDARY'),
        new MessageButton().setCustomId('seek').setLabel('🧿 Seek').setStyle('SECONDARY'),
      );

      if (!guildQueue?.songs || guildQueue?.songs.length < 1) {
        let msg = await this.message.reply({embeds: [embed], components: [row, row1]});

        queue.setData({
          song: song,
          Msg: msg,
          message
        });
        
        if(!client.Musics.get("message")) client.Musics.set("message", {
          messageId: msg.id, 
          repeated: false,
          volume: 50,
        })

      } else {
        message.reply({content: `:notes: **${song.name}** Added to **Queue** (\`${song.duration}\`)!`})
      }

    }).catch(err => {
        console.log(err);
        //if(!guildQueue) queue.stop();
    });
}

module.exports.details = {
 name: "play",
}