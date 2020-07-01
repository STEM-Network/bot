var log;
exports.init=(_log, mgr, db, cli)=>{
    log=_log;
    db.get('users',(err,users)=>{
        if(err){
            log(0, `Failed to access users to required keys: ${err}`);
        } else {
            users.template.registerKey({
                key:"upvotes",
                default:0
            });

            cli.on('guildMemberUpdate', (preM, posM)=>{
                if(preM.user.id == cli.user.id) return;
                if(preM.nickname == posM.nickname) return;
                updateNick(mgr,posM);
            });

            cli.on('messageReactionAdd',(react, reacter)=>{
                if(react.me) return;
                if(react.emoji.identifier == "%F0%9F%91%8D" && reacter.id != react.message.author.id){
                    react.message.react(react.emoji);
                    if(react.message.member) addUpvote(mgr,react.message.member);
                }
            });

            mgr.readyUp(exports.descriptor);
        }
    })
}

function addUpvote(mgr,member){
    mgr.getUserdata(member.user, (err,ud,u)=>{
        if(err){
            log(2, `Failed to get userdata ${err}`);
        } else {
            ud.upvotes++;
            u.modified.push(ud.id);
            updateNick(mgr,member);
        }
    },{createNew:true});
}

function updateNick(mgr,member){
    mgr.getUserdata(member.user, (err,ud,u)=>{
        if(err){
            log(2, `Failed to get userdata ${err}`);
        } else {
            var n = member.displayName.replace(/( )*\[([0-9]+)\]$/, '');
            member.setNickname(`${n} [${ud.upvotes}]`, "Upvote score").then((gm)=>{
                log(3, `Set ${gm.user.tag}'s username to ${gm.displayName}`);
            }).catch((err)=>{
                log(2, `Failled to set nickname of ${member.user.tag} (${member.displayName}): ${err}`);
            })
        }
    },{createNew:true})
}

exports.descriptor={
    name:"Upvotes",
    version:"1.0.0",
    authors:[
        "Azurethi"
    ]
}