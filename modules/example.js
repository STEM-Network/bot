var log;
exports.init=(_log, mgr, db, cli)=>{
    log=_log;
    mgr.readyUp(exports.descriptor);
}

exports.requiredKeys={
    users:[
        {key:'score', default:0}
    ]
};

exports.cmds={
    score:{
        options:{getUserdata:true, createNew:true},
        handler:(err, msg, args,userdata)=>{
            if(err) {
                msg.reply(`Command failed: ${err}`)
                log(1, `Command exception: ${err}`);
            } else {
                msg.reply(`Your score is ${userdata.score}`);
                log(3, `Replied to score command from ${msg.author.tag}`);
            }
        }
    },
    scoreadd:{
        options:{getUserdata:true, createNew:true},
        handler:(err, msg,args,userdata,users)=>{
            if(err) {
                msg.reply(`Command failed: ${err}`)
                log(1, `Command exception: ${err}`);
            } else {
                if(args.length != 2) {
                    msg.reply(`Please specify just one score value after /scoreadd`);
                } else{
                    userdata.score+=parseFloat(args[1]);
                    users.modified.push(userdata.id);
                    msg.reply(`Your score is now ${userdata.score}`);
                }
                
                log(3, `Replied to score command from ${msg.author.tag}`);
            }
        }
    }
};

exports.descriptor={
    name:"Ex.Score",
    version:"3.0.0",
    authors:[
        "Azurethi"
    ]
}
