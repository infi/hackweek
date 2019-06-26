// imports and instances
const { Client, RichEmbed } = require("discord.js")
const client = new Client();
const rdb = require("redis").createClient()
const util = require("util")

// load config
const cfg = {
    auth: require("./cfg/authorization"),
    bot: require("./cfg/bot")
}

// message event
client.on('message', async (message) => {
    if (message.author.bot || !message.guild) return
    if (message.content.startsWith(cfg.bot.prefix)) {
        let args = message.content.split(" ").slice(1)
        let command = message.content.split(" ")[0].substr(cfg.bot.prefix)

        if (command === "help") {
            var embedHelp = new RichEmbed()
                .setTitle("CommonMispellingHelp")
                .setColor(0x005500)
            message.reply(embedHelp)
        }
    } else {
        let msgWords = message.content.toLocaleLowerCase().split(" ")
        let list = require("./lists/typos.json")
        for (let t of list) {
            if (msgWords.includes(t.typo)) {
                message.reply("\nYou might have a spelling error at '**" + t.typo + "**', as it is actually '**" + t.fix + "**'\n" + t.comment)
            }
        }
    }
})

// when discord responded
client.on('ready', () => {
    client.user.setPresence({ game: { name: cfg.bot.game } })
    console.log("Bot should be ready, as " + client.user.tag)
})

// authorization
client.login(cfg.auth.token)
