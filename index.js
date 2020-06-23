const fs = require('fs');

const djs = require('discord.js');

const auth = require('./auth.json');
const db = require('./data/db');
const log = require('./logger');
log('CORE', 3,"",{type:"startup"});

var cli = new djs.Client();

const mgr = require('./mgr')(cli,db,log,{regex:/^\/([a-zA-Z0-9_.]*)( |$)/});

var loadedModules = [];

log('CORE', 3,"Loading modules");
fs.readdir('./modules',(err,modules)=>{
    if(err) throw err;
    modules.forEach(modName => {
        var mod = require(`./modules/${modName}`);
        loadedModules.push(mod.descriptor);
        mod.init(log.bind(null,mod.descriptor.name),mgr,db,cli);
        log('CORE', 3,"  ",{type:"moduleDesc",object:mod.descriptor});
    });
    
    //Do debug instead of login
    require('./debugger')(log.bind(null,'DEBUGGER'),cli);
    //cli.login(auth.token)
})