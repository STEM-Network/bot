var log,mgr,db,cli;
exports.init=(_log, _mgr, _db, _cli)=>{
    log=_log; mgr=_mgr; db=_db; cli=_cli;
    mgr.readyUp(exports.descriptor);
}

exports.requiredKeys=false;
exports.cmds={
    'git':{
        options:{getUserdata:false, createNew:false},
        handler:git
    },
    'force-save':{
        options:{getUserdata:false, createNew:false},
        handler:force_save
    },
    'db':{
        options:{getUserdata:false, createNew:false},
        handler:dbcmd
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

function dbcmd(err,msg,args){
    if(skip(msg)) return;
    if(args[1]){
        db.get(args[1], (err,col)=>{
            if(err){
                msg.channel.send(`Error getting "${args[1]}": ${err}`);
            }else if(args[2]){
                col.get(args[2],(err,item)=>{
                    if(err){
                        msg.channel.send(`Error getting "${args[2]}" in ${args[1]}: ${err}`);
                    }else{
                        msg.channel.send(`${args[1]} > ${args[2]}: ${cb(JSON.stringify(item,null,4))}`);
                    }
                });
            }else{
                var contents = col.elems.join('\n');
                if(contents.length>1500) contents=contents.substring(0,1500)+' ...';
                msg.channel.send(`${args[1]} contains: ${cb(contents)}`);
            }
        })
    } else {
        msg.channel.send('Usage: \`\`/db <collection> [<itemid>]\`\`');
    }
}

function git(err,msg,args){
    if(skip(msg)) return;
    if(args[1]){
        switch(args[1]){
            case "update":
                msg.reply("Shutting down for git update");
                setTimeout(()=>{
                    var shell=require('shelljs');
                    shell.exec('bash update.sh')
                    process.exit(0);
                }, 500);
                break;
            case "log":
                reply_update_log(msg);
                break;
            case "branch":
                msg.reply(`Git branch: ${cb(shelljs.exec("git branch -v").stdout)}`);
                break;
            case "fetch":
                msg.reply(`Git branch: ${cb(shelljs.exec("git fetch -v").stdout)}`);
                break;
        }
    } else {
        msg.reply("Please specify command");
    }
}

function force_save(err,msg,args){
    log(3,'Got force-save CMD');
    if(skip(msg)) return;
    db.doSave();
    msg.reply('Forced a db save');
}

function reply_update_log(msg){
    fs.readFile('update.log',(err,data)=>{
        if(err){
            msg.reply("no log available.");
        } else {
            msg.reply(`git update log: ${cb(data)}`);
        }
    })
}

function skip(msg){
    if(msg.author.id != "434711871061491716") {
        msg.reply("You need to be Azurethi to do this.");
        return true;
    } else {
        return false;
    }
}

function cb(contents){
    return `\`\`\`${contents}\`\`\``;
}