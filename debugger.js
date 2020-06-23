var log = ()=>{};
module.exports = (_log,cli)=>{
    log =_log;
    send('/score', cli);
}

//TODO implement more of the discord API
function buildMessage(content){
    return {
        user:{id:'test', tag:"test#1234"},
        content,
        reply:(m)=>{log(4,`REPLY to "${content}": "${m}"`)}
    }
}

function send(msg,cli){
    log(4,`Sending message: "${msg}"`);
    cli.emit('message', buildMessage(msg));
}