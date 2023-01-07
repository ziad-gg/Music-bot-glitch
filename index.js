const Discord = require("discord.js")
const { Intents } = require("discord.js")
const childs = require("./childs/index")

const client = new Discord.Client({
    intents: [
      Intents.FLAGS.GUILDS, 
      Intents.FLAGS.GUILD_MESSAGES, 
      Intents.FLAGS.GUILD_VOICE_STATES
    ]
});

const settings = {
    prefix: '!',
    token: 'MTA0MTEzODI0MDAyMDgwNzY4MQ.GcB71P.n6oRHvToyJPz6hGxSYZEutXe1fkqnSL-2P0RCU'
};


childs.deloy(settings.token, "#")


