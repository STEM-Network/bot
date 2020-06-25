exports.init=(log, mgr, db, cli)=>{
    db.get('users',(err,users)=>{
        if(err){
            log(0, `Failed to access users to required keys: ${err}`);
        } else {
            users.template.registerKey({
                key:"score",
                default:0
            });

            mgr.registerCMD('score',(err, msg, args,userdata)=>{
                if(err) {
                    msg.reply(`Command failed: ${err}`)
                    log(1, `Command exception: ${err}`);
                } else {
                    msg.reply(`Your score is ${userdata.score}`);
                    log(3, `Replied to score command from ${msg.user.tag}`);
                }
            }, {getUserdata:true, createNew:true})

            mgr.registerCMD('scoreadd',(err, msg,args,userdata,users)=>{
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
                    
                    log(3, `Replied to score command from ${msg.user.tag}`);
                }
            }, {getUserdata:true, createNew:true})

            mgr.readyUp(exports.descriptor);
        }
    })
}

exports.descriptor={
    name:"Ex.Score",
    version:"2.0.0",
    authors:[
        "Azurethi"
    ]
}
