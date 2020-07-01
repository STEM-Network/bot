exports.init=(log, mgr, db, cli)=>{
    mgr.registerKey('users',{key:'score', default:0},(err)=>{
        if(err){
            log(3, `regKey error: ${err}`);
            return;
        }
        mgr.registerCMD('score',(err, msg, args,userdata)=>{
            if(err) {
                msg.reply(`Command failed: ${err}`)
                log(1, `Command exception: ${err}`);
            } else {
                msg.reply(`Your score is ${userdata.score}`);
                log(3, `Replied to score command from ${msg.author.tag}`);
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
                
                log(3, `Replied to score command from ${msg.author.tag}`);
            }
        }, {getUserdata:true, createNew:true})

        mgr.readyUp(exports.descriptor);
    })
}

exports.cmds=false;
exports.requiredKeys=false;

exports.descriptor={
    name:"Ex.Score",
    version:"2.0.0",
    authors:[
        "Azurethi"
    ]
}
