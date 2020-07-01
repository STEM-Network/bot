const fs = require('fs');

const djs = require('discord.js');

const auth = require('./auth.json');
const settings = require('./settings');
const db = require('./data/db');
const log = require('./logger');

log('CORE', 3,"",{type:"startup"});

var cli = new djs.Client();

const mgr = require('./mgr')(cli,db,log.bind(null,"MGR"),{regex:settings.regex});

var loadedModules = [];

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
                cli.user.setPresence({ activity: settings.activity, status: 'online' })
            });
            cli.login(auth.token)
        }
    })
})

//testing the github-discord hook