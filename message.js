const Discord = require('discord.js');
let emojiMap = {
  link: "732605373185261629",
  dev: "732605373185261608",
  sharding: "732605372954575029",
  computer : "732607541061877760",
  memoire: "732698462822596659",
  okay: "732581317098602546",
  nope: "732581316880498782",
  info: "732581319971831808",
  what: "732581319678361662",
  warn: "732581316217929782"
  
};
const config = require('../config.json')
const json = require('../package.json')
const fs = require('fs');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const GiveawaysManager = require('../src/Manager');

const GiveawayManagerWithShardSupport = class extends GiveawaysManager {

    async refreshStorage(){
        return client.shard.broadcastEval(() => this.giveawaysManager.getAllGiveaways());
    }
 
};

const loadings = `<a:erjbgtuezrftetgfret:688433071573565440>`
  function getEmoji(name) {
  return `<:${name}:${emojiMap[name]}>`;
}



module.exports = async(client, message) => {

const manager = new GiveawaysManager(client, {
    storage: `./data/storage/${client.shard.ids[0]}/giveaways.json`,
    updateCountdownEvery: 10000,
    default: {
        botsCanWin: false,
        exemptPermissions: [ "MANAGE_MESSAGES", "ADMINISTRATOR" ],
        embedColor: "#4FCAF1",
        reaction: "🎁"
    }
});



    if(message.author.bot) return;
    if(message.channel.type === 'dm') return;
    var adapting = new FileSync(`./data/${client.shard.ids[0]}/${message.guild.id}.json`);
    var database = low(adapting);
        let pf = await database.get(`data.prefix`).value()
        if(!pf) {
            pf = config.prefix
            await database.set(`data.prefix`, pf).write()
        }


    if(message.content === '<@!732003715426287676>') {
        var embed = new Discord.MessageEmbed()
        .setAuthor(`TADAA`, client.user.avatarURL)
        .setDescription(`Préfixe: **${pf}**\n\n*Faites ${pf}help pour plus d'infos*`)
        .setColor(`#F67272`)
        .setTimestamp()
        .setFooter(`TADAA |  créé par ezzud`, message.author.avatarURL)
        message.channel.send(embed)
    }


    if(message.content.startsWith(pf)) {
    let args = message.content.slice(pf.length).trim().split(/ +/g);
    let command = args.shift().toLowerCase();
    const nope = getEmoji("nope")
    const info = getEmoji("info")
    const okay = getEmoji("okay")
    const what = getEmoji("what")
    const warning = getEmoji("warn")
  let commande_file = client.commands.get(command);
  if(commande_file) commande_file.run(client,pf,message,args,nope,info,okay,what,warning,manager,json,command);

}

};