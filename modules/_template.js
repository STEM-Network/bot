var log;
exports.init=(_log, mgr, db, cli)=>{
    log=_log;
    mgr.readyUp(exports.descriptor);
}

exports.requiredKeys={
    collection:[
        {key:"keyName", default:0}
    ]
};
exports.cmds={
    cmdName:{
        options:{getUserdata:true, createNew:true},
        handler:(err, msg, args,userdata)=>{}
    }
};

exports.descriptor={
    name:"ModName",
    version:"1.0.0",
    authors:[
        "Azurethi"
    ]
}
