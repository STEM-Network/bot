var log,mgr,db,cli;
exports.init=(_log, _mgr, _db, _cli)=>{
    log=_log; mgr=_mgr; db=_db; cli=_cli;
    mgr.readyUp(exports.descriptor);
}

exports.requiredKeys=false;
exports.cmds={
    'git':{
        options:{getUserdata:true, createNew:true},
        handler:git
    },
    'force-save':{
        options:{getUserdata:true, createNew:true},
        handler:force_save
    }
};

exports.descriptor={
    name:"Admin",
    version:"1.0.0",
    authors:[
        "Azurethi"
    ]
}

//cmd handlers
const shelljs=require('shelljs');
const fs=require('fs');
function git(err,msg,args){
    if(msg.author.id != "434711871061491716") {
        msg.reply("You need to be Azurethi to do this.");
        return;
    }

    if(args[1]){
        switch(args[1]){
            case "update":
                msg.reply("Shutting down for git update");
                setTimeout(()=>{
                    var shell=require('shelljs');
                    shell.exec('bash update.sh')
                    process.exit(0);
                }, 1000);
                break;
            case "log":
                reply_update_log(msg);
                break;
            case "branch":
                msg.reply(`Git branch: \`\`\`${shelljs.exec("git branch -v").stdout}\`\`\``);
                break;
        }
    } else {
        msg.reply("Please specify command");
    }
}

function force_save(err,msg,args){
    log('CORE',3,'Got force-save CMD');
    if(msg.author.id != "434711871061491716") {
        msg.reply("You need to be Azurethi to do this.");
        return;
    }
    db.doSave();
    msg.reply('Forced a db save');
}

function reply_update_log(msg){
    fs.readFile('update.log',(err,data)=>{
        if(err){
            msg.reply("no log available.");
        } else {
            msg.reply(`git update log: \`\`\`${data}\`\`\``);
        }
    })
}
