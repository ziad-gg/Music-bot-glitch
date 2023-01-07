module.exports.run = async function() {

    if (!this.message.member.voice.channelId) return this.message.reply({content: ":no_entry_sign: You must be in a voice channel first"});

    let guildQueue = this.client.player.getQueue(this.message.guild.id)
    if (!guildQueue?.songs || guildQueue?.songs.length < 1) return this.message.reply({content: ":no_entry_sign: There must be music playing to use that!."})
    let next = guildQueue.skip();
    
    let embed = new this.client.Discord.MessageEmbed()
    .setColor("RANDOM")
    .setDescription(`> **Skip __${next.name}__**`)

    this.message.reply({embeds: [embed]})
}

module.exports.details = {
 name: "skip",
}