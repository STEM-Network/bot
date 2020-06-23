module.exports=(cli, db, log, options={regex:/^\/([a-zA-Z0-9_.]*)( |$)/})=>{
    var registeredCMDS = {
        list:[],
        handlers:{}
    }
    cli.on('message', msg=>{
        var cmd=options.regex.exec(msg.content);
        if(cmd != null && cmd[1]){
            var tlc = cmd[1].toLocaleLowerCase()
            if(registeredCMDS.list.includes(tlc)){
                registeredCMDS.handlers[tlc](false,msg,[]);
            }
        }
    })
    const api = {
        registerCMD:(cmd, handler, options={getUserdata:false,createNew:false})=>{
            if(options.getUserdata){
                registeredCMDS.handlers[cmd.toLowerCase()]=(err, msg, args)=>{
                    if(err) handler(err);
                    db.get('users',(err,users)=>{
                        if(err){
                            handler(err)
                        } else {
                            users.get(msg.user.id, (err,userdata)=>{
                                if(err){
                                    handler(err)  //TODO create userdata if required
                                } else {
                                    handler(false, msg, args, userdata)
                                }
                            })
                        }
                    })
                }
            } else {
                registeredCMDS.handlers[cmd.toLowerCase()] = handler;
            }
            registeredCMDS.list.push(cmd.toLowerCase());
        },
        getUserdata:(id, next)=>{
            db.get('users',(err,users)=>{
                if(err){
                    next('err')
                } else {
                    users.get(id, (err,userdata)=>{
                        if(err){
                            next('err')  //TODO create userdata if required
                        } else {
                            next(false, userdata);
                        }
                    })
                }
            })
        }
    }
    return api;
}