const djs = require('discord.js');
const auth = require('auth.json');

var cli = new djs.Client();

cli.on('message', m=>{
    if(m.author.id == cli.user.id) return;  //Ignore own messages.
    if(m.channel.guild) return;             //Ignore if not DM.
    m.reply(`Hello ${m.author.tag}!`);
})

cli.login(auth.token);