const fs = require('fs');

const djs = require('discord.js');

const auth = require('./auth.json');
const db = require('./data/db');
const log = require('./logger');

log('CORE', 3,"",{type:"startup"});

var cli = new djs.Client();

const mgr = require('./mgr')(cli,db,log.bind(null,"MGR"),{regex:/^\/([a-zA-Z0-9_\-.]*)( |$)/});

var loadedModules = [];

//Update from git
mgr.registerCMD('git-update', (err, msg, args)=>{
    log('CORE',3,'Got git Update CMD');
    if(msg.author.id != "434711871061491716") {
        msg.reply("You need to be Azurethi to do this.");
        return;
    }
    if(args[1] && args[1].toLowerCase() == "log"){
        fs.readFile('update.log',(err,data)=>{
            if(err){
                msg.reply("no log available.");
            } else {
                msg.reply(`git update log: \`\`\`${data}\`\`\``);
            }
        })
    } else {
        msg.reply("Shutting down for git update");
        setTimeout(()=>{
            var shell=require('shelljs');
            shell.exec('bash update.sh')
            process.exit(0);
        }, 1000);
    }
    
},{getUserdata:false, createNew:false});

mgr.registerCMD('force-save', (err, msg, args)=>{
    log('CORE',3,'Got force-save CMD');
    if(msg.author.id != "434711871061491716") {
        msg.reply("You need to be Azurethi to do this.");
        return;
    }
    db.doSave();
    msg.reply('Forced a db save');
},{getUserdata:false, createNew:false});


log('CORE', 3,"Loading modules");
fs.readdir('./modules',(err,modules)=>{
    if(err) throw err;
    modules.forEach(modName => {
        if(modName.startsWith("_")) return; //ignore modules starting with _
        var mod = require(`./modules/${modName}`);
        loadedModules.push(mod.descriptor);
        try{
            if(mod.cmds){
                Object.keys(mod.requiredKeys).forEach(collection=>{
                    mod.requiredKeys[collection].forEach(key=>{
                        mgr.registerKey(collection,key,(err)=>{
                            if(err) log(mod.descriptor.name,2,`Failed to create required key "${JSON.stringify(key)}" in ${collection}:: ${err}`);
                        });
                    });
                });
            }
            if(mod.cmds){
                Object.keys(mod.cmds).forEach(cmdName=>{
                    mgr.registerCMD(cmdName,mod.cmds[cmdName].handler, mod.cmds[cmdName].options);
                });
            }
            mgr.waitFor(mod.descriptor);
            mod.init(log.bind(null,mod.descriptor.name),mgr,db,cli);
            log('CORE', 3,"  ",{type:"moduleDesc",object:mod.descriptor});
        } catch(e){
            log('CORE', 3,"  ",{type:"moduleDescFail",object:mod.descriptor,reason:e});
        }
        
    });
    mgr.onReady(()=>{
        if(auth.token==""){
            log('CORE', 2,"No Auth token, running in debug mode!");
            //log('CORE', 3,"Severity formats:");
            //for(var i=0; i<5; i++)log('CORE', i,`Severity ${i}`);
            require('./debugger')(log.bind(null,'DEBUGGER'),cli);
        } else {
            cli.on('ready',()=>{
                log('CORE', 3, `Live as ${cli.user.tag}`);
                cli.guilds.resolve('714803464764522546').channels.resolve('725770219158634586').send('Started');
            });
            cli.login(auth.token)
        }
    })
})

//testing the github-discord hook