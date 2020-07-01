module.exports=(cli, db, log, options={regex:/^\/([a-zA-Z0-9_.]*)( |$)/})=>{
    var registeredCMDS = {
        list:[],
        handlers:{}
    }
    var waitingFor = {};
    cli.on('message', msg=>{
        var cmd=options.regex.exec(msg.content);
        //TODO extract cmd args
        if(cmd != null && cmd[1]){
            var tlc = cmd[1].toLocaleLowerCase()
            var args = msg.content.split(' ');  //TODO better argument parsing (eg: quoted strings)
            if(registeredCMDS.list.includes(tlc)){
                registeredCMDS.handlers[tlc](false,msg,args);
            }
        }
    })
    const api = {
        registerKey:(collection, keyData, next)=>{
            db.get(collection,(err,col)=>{
                if(err){
                    next(err);
                } else {
                    col.template.registerKey(keyData);
                    next(false);
                }
            });
        },
        registerCMD:(cmd, handler, options={getUserdata:false,createNew:false})=>{
            if(options.getUserdata){
                registeredCMDS.handlers[cmd.toLowerCase()]=(err, msg, args)=>{
                    if(err) handler(err);
                    db.get('users',(err,users)=>{
                        if(err){
                            handler(err,msg,args)
                        } else {
                            users.get(msg.author.id, (err,userdata)=>{
                                if(err){
                                    if(options.createNew && err == "Does not exist in users!"){
                                        handler(false,msg,args,users.create(msg.author.id, msg.author.tag),users);
                                    } else {
                                        handler(err,msg,args,null,null)
                                    }
                                } else {
                                    handler(false, msg, args, userdata,users)
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
        getUserdata:(usr, next, options={createNew:false})=>{
            db.get('users',(err,users)=>{
                if(err){
                    next(err)
                } else {
                    users.get(usr.id, (err,userdata)=>{
                        if(err){
                            if(options.createNew && err == "Does not exist in users!"){
                                next(false,users.create(usr.id,usr.tag),users);
                            } else {
                                next(err)
                            }
                        } else {
                            next(false,userdata,users)
                        }
                    })
                }
            })
        },
        waitFor:(modDesc)=>{
           if(waitingFor[modDesc.name]){
               log(1, `Module name conflict: \n${JSON.stringify(modDesc)} With ${JSON.stringify(waitingFor[modDesc.name].desc)}`);
           } else {
                waitingFor[modDesc.name] = {
                    desc: modDesc,
                    ready:false
                }
           }
        },
        readyUp:(modDesc)=>{
            waitingFor[modDesc.name].ready=true;
            log(4, `  ${modDesc.name} module ready`);
        },
        onReady:(func)=>{
            var waited = 0;
            var waitingInterval = setInterval(()=>{
                var allReady = true;
                var mods = Object.keys(waitingFor);
                for(var i=0; i<mods.length; i++){
                    if(!waitingFor[mods[i]].ready) allReady=false;
                }
                if(allReady){
                    clearInterval(waitingInterval);
                    log(4, "  All modules ready");
                    func();
                } else if(waited>4){
                    var ages = [];
                    for(var i=0; i<mods.length; i++){
                        if(!waitingFor[mods[i]].ready){
                            ages.push(mods[i]);
                        }
                    }
                    log(2, `Modules are taking a long time to ready up: ${ages.join(", ")}`);
                }
                waited++;
            }, 1000)
        }
    }
    return api;
}