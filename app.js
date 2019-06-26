// imports and instances
const { Client, RichEmbed } = require("discord.js")
const client = new Client();
const rdb = require("redis").createClient()
const util = require("util")

rdb.getAsync = util.promisify(rdb.get).bind(rdb)
rdb.smembersA = util.promisify(rdb.smembers).bind(rdb)

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
        let command = message.content.split(" ")[0].substr(cfg.bot.prefix.length)

        if (command === "help") {
            var embedHelp = new RichEmbed()
                .setTitle("CommonMispellingHelp")
                .addField("help", "Show this list")
                .addField("settings", "Show help for `settings`")
                .setColor(0x005500)
            message.reply(embedHelp)
        } else if (command === "settings") {
            if (!message.member.permissions.has("MANAGE_CHANNELS")) return message.reply("You lack permissions")
            var key = [args[0]] // trust me this will get useful
            if (key[0] === "disabled") {
                key.push(args[1])
                if (key[1] === "list") {
                    var dis = ""
                    var disDB = await rdb.smembersA("disabled:" + message.guild.id)
                    for (let channel of disDB) {
                        dis += "\n<#" + channel + ">" // mentions
                    }
                    function getDis() {
                        return (dis === "") ? "Nothing here but crickets" : dis // simple UX tweak: if dis is empty return text else return dis. 
                    }
                    var embedList = new RichEmbed()
                        .setTitle("Disabled Channels")
                        .setDescription(getDis())
                        .setColor(0x115522)
                    return message.reply(embedList)
                } else if (key[1] === "add") {
                    var channels = message.mentions.channels
                    if (channels.size === 0) return message.channel.send("I need one more argument, the channel!")
                    rdb.sadd("disabled:" + message.guild.id, channels.first().id)
                    var embedDone = new RichEmbed()
                        .setTitle("Added Channel")
                        .setDescription(channels.first().name + " was added.")
                        .setColor(0x115522)
                    return message.reply(embedDone)
                } else if (key[1] === "remove") {
                    var channels = message.mentions.channels
                    if (channels.size === 0) return message.channel.send("I need one more argument, the channel!")
                    rdb.srem("disabled:" + message.guild.id, channels.first().id)
                    var embedDone = new RichEmbed()
                        .setTitle("Removed Channel")
                        .setDescription(channels.first().name + " was removed.")
                        .setColor(0x115522)
                    return message.reply(embedDone)
                }
                var embedDisabled = new RichEmbed()
                    .setTitle("Settings - Disabled")
                    .addField("List", "List disabled channels", true)
                    .addField("Add", "Exclude a channel", true)
                    .addField("Remove", "Include a channel after being excluded", true)
                    .setColor(0x115522)
                return message.reply(embedDisabled)
            } else if (key[0] === "channel") {
                key.push(args[1])
                if (key[1] === "set") {
                    if (args[2] === "dynamic") {
                        rdb.del("channel:" + message.guild.id)
                        var embedDone = new RichEmbed()
                            .setTitle("Channel Set")
                            .setDescription("The message's channel is now the correction channel.")
                            .setColor(0x115522)
                        return message.reply(embedDone)
                    } else {
                        var channels = message.mentions.channels
                        if (channels.size === 0) return message.channel.send("I need one more argument, the channel!")
                        rdb.set("channel:" + message.guild.id, channels.first().id)
                        var embedDone = new RichEmbed()
                            .setTitle("Channel Set")
                            .setDescription(channels.first().name + " is now the correction channel.\nSet this to `dynamic` to use the message's channel.")
                            .setColor(0x115522)
                        return message.reply(embedDone)
                    }
                }
                var embedCh = new RichEmbed()
                    .setTitle("Settings - Correction Channel")
                    .addField("`set`", "Set the Channel, duh", true)
                    .setColor(0x115522)
                return message.reply(embedCh)
            }
            var embedSt = new RichEmbed()
                .setTitle("Settings")
                .addField("`disabled`", "Manages disabled channels", true)
                .addField("`channel`", "Manages the correction channel", true)
                .setColor(0x115522)
            message.reply(embedSt)
        }
    } else {
        rdb.sismember("disabled:" + message.guild.id, message.channel.id, async (err, reply) => {
            if (reply) return // zero is true so this works since reply is always binary
            let msgWords = message.content.toLocaleLowerCase().split(" ")
            let list = require("./lists/typos.json")
            let chId = await rdb.getAsync("channel:"+message.guild.id) || message.channel.id
            let ch = client.channels.get(chId)
            for (let t of list) {
                if (msgWords.includes(t.typo)) {
                    ch.send("<@" + message.author.id + ">\nYou might have a spelling error at '**" + t.typo + "**', as it is actually '**" + t.fix + "**'\n" + t.comment)
                }
            }
        })
    }
})

// when discord responded
client.on('ready', () => {
    client.user.setPresence({ game: { name: cfg.bot.game } })
    console.log("Bot should be ready, as " + client.user.tag)
})

// authorization
client.login(cfg.auth.token)
