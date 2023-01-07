module.exports.run = async function() {

    if (!this.message.member.voice.channelId) return this.message.reply({content: ":no_entry_sign: You must be in a voice channel first"});

    let guildQueue = this.client.player.getQueue(this.message.guild.id)
    if (!guildQueue?.songs || guildQueue?.songs.length < 1) return this.message.reply({content: ":no_entry_sign: There must be music playing to use that!"})
    guildQueue.stop();
    this.message.reply({content: ":notes: The player has stopped and the queue has been cleared."})
}

module.exports.details = {
 name: "stop",
}