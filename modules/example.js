exports.init=(log, mgr, db, cli)=>{
    mgr.registerCMD('score',(err, msg, args,userdata)=>{
        if(err) {
            msg.reply(`Command failed: ${err}`).
            log(1, `Command exception: ${err}`);
        } else {
            msg.reply(`Your score is ${userdata.score}`);
            log(3, `Replied to score command from ${msg.user.tag}`);
        }
    }, {getUserdata:true, createNew:false})
}

exports.descriptor={
    name:"Ex.Score",
    version:"2.0.0",
    authors:[
        "Azurethi"
    ]
}

/*exports.init=(log, mgr, db, cli)=>{
    cli.on('message', msg=>{
        if(msg.content.startsWith('/myscore')){
            db.get('users', (err,user)=>{
                if(err) {
                    msg.reply('Error accessing users collection').
                    log(log.FATAL, `Could not access users collection! : ${err}`);
                } else {
                    users.get(msg.user.id, (err,userdata)=>{
                        if(err){
                            msg.reply('Error accessing userdata').
                            log(log.FATAL, `Could not access userdata for ${msg.user.id}! : ${err}`);
                        } else {
                            msg.reply(`Your score is ${userdata.score}`);
                            log(log.DEBUG, `Replied to score command from ${msg.user.tag}`);
                        }
                    })
                }
            })
        }
    })
}

exports.descriptor={
    moduleName:"Example Score",
    version:"1.0.0",
    authors:[
        "Azurethi"
    ]
}*/