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
                var obj = {id:"Roles", allowedRoles:[]}
                col.loadedData[obj.id] = obj;
                col.modified.push(obj.id);
                col.elems.push(`${obj.id}.json`);
                col.loaded.push(obj.id);
                settings=obj;
            } else {
                settings=sets;
            }
            mgr.readyUp(exports.descriptor);
        })
    });
}

exports.requiredKeys={};
exports.cmds={
    role:{
        options:{getUserdata:true, createNew:true},
        handler:(err, msg, args, userdata)=>{
            if(args.length>1){
                if(args[1]==".add"){
                    if(msg.member.hasPermission('MANAGE_GUILD') && args.length>2){
                        var mentioned=msg.mentions.roles.first();
                        if(mentioned){
                            settings.allowedRoles.push({
                                name:mentioned.name,
                                id:mentioned.id
                            });
                            settingsCol.modified.push('Roles');
                            msg.channel.send(`Added ${mentioned.name} (${mentioned.id}) to the allowed roles`)
                        } else {
                            //expect roleID in args[2] if no role mentioned
                            var role = msg.guild.roles.resolve(args[2]);
                            if(role){
                                settings.allowedRoles.push({
                                    name:role.name,
                                    id:role.id
                                });
                                settingsCol.modified.push('Roles');
                                msg.channel.send(`Added ${role.name} (${role.id}) to the allowed roles`);
                            } else {
                                msg.channel.send(`No role with an id of ${args[2]}`);
                            }
                        }
                    } else if(args.length<=2){
                        msg.channel.send("Please specify a role to add");
                    }else{
                        msg.channel.send("You need the ``MANAGE_GUILD`` permission to add roles");
                    }
                } else {
                    args.shift();
                    var desired=args.join(' ').replace(/[<>@]/g,'');
                    var roleId=-1;
                    for(var i=0; i<settings.allowedRoles.length; i++){
                        if(settings.allowedRoles[i].name.toLowerCase().startsWith(desired)){
                            roleId=i;
                            break;                            
                        }
                    }
                    if(roleId==-1){
                        msg.channel.send(`I couldn't find any roles like "${desired}"`);
                    } else {
                        msg.member.roles.add(settings.allowedRoles[roleId].id);
                        msg.channel.send(`You've been added to "${settings.allowedRoles[roleId].name}"`);
                    }
                }
            } else {
                msg.channel.send("Usage: \`\`/role (.add) <desired role>\`\`");
            }
        }
    }
};

exports.descriptor={
    name:"Roles",
    version:"0.0.1",
    authors:[
        "Azurethi"
    ]
}
