var log, settings, settingsCol;
exports.init=(_log, mgr, db, cli)=>{
    log=_log;

    db.get('settings',(err,col)=>{
        if(err){
            log(2,"Failed to load settings collection");
            return;
        }
        settingsCol=col;
        col.get(exports.descriptor.name,(err,sets)=>{
            if(err){
                var obj = {id:exports.descriptor.name, leaderboard:[], leaderboardMin:0}
                col.loadedData[obj.id] = obj;
                col.modified.push(obj.id);
                col.elems.push(`${obj.id}.json`);
                col.loaded.push(obj.id);
                settings=obj;
            } else {
                settings=sets;
            }
            cli.on('guildMemberUpdate', (preM, posM)=>{
                if(preM.user.id == cli.user.id) return;
                if(preM.nickname == posM.nickname) return;
                updateNick(mgr,posM);
            });
        
            cli.on('messageReactionAdd',(react, reacter)=>{
                if(react.me) return;
                if(react.message.author.bot) return;
                if(react.emoji.identifier == "%F0%9F%91%8D" && reacter.id != react.message.author.id){
                    react.message.react(react.emoji);
                    if(react.message.member) addUpvote(mgr,react.message.member);
                }
            });
            mgr.readyUp(exports.descriptor);
        })
    });



}

exports.cmds={
    leaderboard:{
        options:{getUserdata:false, createNew:false},
        handler: (err, msg, args)=>{
            var LB=[];
            settings.leaderboard.forEach((lbi,i)=>{
                LB.push(`[${i}] ${lbi.dispName.replace(/( )*\[([0-9]+)\]$/, '')} : ${lbi.upvotes}`);
            });
            msg.channel.send(`The Upvote Leaderboard: \`\`\`\n${LB.join('\n')}\`\`\``);
        }
    }
}

exports.requiredKeys={
    users:[
        {key:'upvotes', default:0},
        {key:'momCount', default:0}
    ]
};

function addUpvote(mgr,member){
    mgr.getUserdata(member.user, (err,ud,u)=>{
        if(err){
            log(2, `Failed to get userdata ${err}`);
        } else {
            ud.upvotes++;
            u.modified.push(ud.id);
            updateNick(mgr,member);
            if(ud.upvotes>settings.leaderboardMin){ //Should be on leaderboard
                var onLB=false;
                for(var i=0; i<settings.leaderboard.length;i++){
                    if(settings.leaderboard[i].id == member.user.id){
                        onLB=true;
                        settings.leaderboard[i].upvotes=ud.upvotes;
                        break;
                    }
                }
                if(!onLB){
                    settings.leaderboard.push({
                        id: member.user.id,
                        dispName: member.displayName,
                        upvotes: ud.upvotes
                    });
                }
                settings.leaderboard.sort((a,b)=>(a.upvotes-b.upvotes));
                if(settings.leaderboard.length>10){
                    settings.leaderboard = settings.leaderboard.slice(0,10);
                }
                settings.leaderboardMin = settings.leaderboard[settings.leaderboard.length-1].upvotes;
                settingsCol.modified.push(exports.descriptor.name);
            }
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
                if(ud.upvotes>=settings.leaderboardMin){
                    for(var i=0; i<settings.leaderboard.length;i++){
                        if(settings.leaderboard[i].id == gm.user.id){
                            onLB=i;
                            settings.leaderboard[i].upvotes=ud.upvotes;
                            settings.leaderboard[i].dispName=gm.displayName;
                            settingsCol.modified.push(exports.descriptor.name);
                            break;
                        }
                    }
                }
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