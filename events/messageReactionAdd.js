'use strict';
const Discord = require("discord.js");
const fs = require('fs');
const db = require("quick.db");
module.exports = async (client, messageReaction, user) => {
    if (!messageReaction) return;
    if (messageReaction.partial) {
        try {
            await messageReaction.fetch();
        } catch (error) {
            if (error.code === 50001) {
                console.log(`Erreur lors de la récupération de la réaction: Missing Access`);
            } else if (error.code === 50002) {
                console.log(`Erreur lors de la récupération de la réaction: Missing Permission`);
            } else {
                console.log(`Erreur lors de la récupération de la réaction: ${error.httpStatus} Code: ${error.code}`);
            }
        }
    }
    if (!user) return;
    if (user.bot) return;
    var database = new db.table("serverInfo")
    const gw_data = new db.table('giveaways')
    if (messageReaction.message.channel.type === 'dm') return;
    let guild = messageReaction.message.guild
    let gw;
    gw = await gw_data.get("giveaways").filter((g) => g.guildID === messageReaction.message.guild.id);
    gw = await gw_data.get("giveaways").filter((g) => g.ended === false);
    if (!gw) return (console.log("No Giveaway"));
    let checkRole = false
    gw.forEach(give => {
        if (give.messageID === messageReaction.message.id) {
            checkRole = true
        } else {
            return;
        }
    })
    if (checkRole === true) {
        if (messageReaction.emoji.name !== '🎁') return;
        let gw2;
        gw2 = await gw_data.get("giveaways").filter((g) => g.messageID === messageReaction.message.id);
        if (!gw2) return;
        var lang = await database.get(`${messageReaction.message.guild.id}.lang`)
        if (!lang) {
            lang = "fr_FR"
        }
        lang = require(`../lang/${lang}.json`)
        if (gw2[0].IsRequiredRole === true) {
            let role = guild.roles.cache.find(x => x.id === gw2[0].requiredRole)
            if (role) {
                if (guild.member(user.id).roles.cache.find(x => x.id === role.id)) {} else {
                    try {
                        await messageReaction.users.remove(user.id)
                    } catch (error) {
                        console.error(error);
                    }
                    const embed = new Discord.MessageEmbed().setAuthor(`${lang.reactError}`, 'https://ezzud.fr/images/closedFixed.png').setColor('#ED3016').setDescription(`${lang.reactNoRole.split("%rolename%").join(role.name)}`).addField(`\u200B`, `${lang.winButton.split("%link%").join(`https://discordapp.com/channels/${messageReaction.message.guild.id}/${messageReaction.message.channel.id}/${messageReaction.message.id}`)} ${lang.reactErrorMessage}`)
                    user.send(embed).catch(error => {
                        if (error.code === 50007) {
                            console.log(`Erreur: L'utilisateur n'a pas pu être DM`)
                        }
                    })
                }
            }
        }
        if (gw2[0].IsRequiredServer === true) {
            var guild_to_get = await client.shard.broadcastEval(`    
                    (async () => {
                        let guild = this.guilds.cache.get('${gw2[0].requiredServer}');
                        if (!guild) {
                            return undefined;
                        }
                            
                        return guild;
                    })();
                `);
            var completeGuildList = { ...guild_to_get[0],
                ...guild_to_get[1]
            }
            if (completeGuildList.id) {
                var sended = false
                var serv = await client.shard.broadcastEval(`    
                    (async () => {
                        let guild = await this.guilds.cache.get('${gw2[0].requiredServer}');
                        if (guild) {
                            var userd = await guild.members.fetch(${user.id})
                            if(!userd) {
                                console.log("No User in guild")
                                return undefined;
                            }
                            return userd;
                        } else {
                            return undefined;
                        } 
                    })();
                `);
                var completeList = { ...serv[0],
                    ...serv[1]
                }
                const sorted = [];
                let number = 0
                for (let number in completeList) {
                    const entry = completeList[number.toString()]
                    if (sorted.length === 0) {
                        sorted.push(entry);
                        continue;
                    }
                    let i = 0;
                    while (sorted[i] !== undefined) {
                        i++;
                    }
                    sorted.splice(i, 0, entry)
                }

                if (!sorted.find(x => x.userID === user.id)) {
                    try {
                        await messageReaction.users.remove(user.id)
                    } catch (error) {
                        console.error(error);
                    }
                    const embed = new Discord.MessageEmbed().setAuthor(`${lang.reactError}`, 'https://ezzud.fr/images/closedFixed.png').setColor('#ED3016').setDescription(`${lang.reactNoServer.split("%requiredServerName%").join(gw2[0].requiredServerName)}`).addField(`\u200B`, `${lang.winButton.split("%link%").join(`https://discordapp.com/channels/${messageReaction.message.guild.id}/${messageReaction.message.channel.id}/${messageReaction.message.id}`)} ${lang.reactErrorMessage}`)
                    user.send(embed).catch(error => {
                        if (error.code === 50007) {
                            console.log(`Erreur: L'utilisateur n'a pas pu être DM`)
                        }
                    })
                }
            }
        }
    }
}