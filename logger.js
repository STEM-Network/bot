//TODO update
const cols={
    "Reset"     :  "\x1b[0m",
    "Bright"    :  "\x1b[1m",
    "Dim"       :  "\x1b[2m",
    "Underscore":  "\x1b[4m",
    "Blink"     :  "\x1b[5m",
    "Reverse"   :  "\x1b[7m",
    "Hidden"    :  "\x1b[8m",

    "FgBlack"   :  "\x1b[30m",
    "FgRed"     :  "\x1b[31m",
    "FgGreen"   :  "\x1b[32m",
    "FgYellow"  :  "\x1b[33m",
    "FgBlue"    :  "\x1b[34m",
    "FgMagenta" :  "\x1b[35m",
    "FgCyan"    :  "\x1b[36m",
    "FgWhite"   :  "\x1b[37m",

    "BgBlack"   :  "\x1b[40m",
    "BgRed"     :  "\x1b[41m",
    "BgGreen"   :  "\x1b[42m",
    "BgYellow"  :  "\x1b[43m",
    "BgBlue"    :  "\x1b[44m",
    "BgMagenta" :  "\x1b[45m",
    "BgCyan"    :  "\x1b[46m",
    "BgWhite"   :  "\x1b[47m"
}

const levels = [
    {lbl: `${cols.BgRed+cols.FgWhite}FATAL#`},
    {lbl:              `${cols.FgRed}SEVERE`},
    {lbl:              `${cols.FgRed} WARN `},
    {lbl:             `${cols.FgCyan} Info `},
    {lbl:            `${cols.FgWhite}_Debug`}
]

module.exports=(module, severity, message="", object={type:false})=>{
    if(object.type){
        switch(object.type){
            case 'moduleDesc':
                message+=`Loaded "${cols.FgGreen+object.object.name+cols.FgWhite}" module V${cols.FgGreen+object.object.version}`
                break;
            case 'startup':
                message+=`Starting ${cols.FgRed}N${cols.FgYellow}C${cols.FgBlue}E${cols.FgRed}E${cols.FgYellow}S ${cols.FgWhite}Discord bot Core`
        }
        if(object.type=="moduleDesc"){
                    }
    }
    console.log(`${cols.FgBlue}[${cols.FgWhite+formatDate(new Date())+cols.FgBlue}]{${cols.FgCyan+module+cols.FgBlue}}\t[${levels[severity].lbl+cols.Reset+cols.FgBlue}]: ${cols.FgWhite+message}`);
}

function formatDate(date, dateSep='-', timeSep=':'){
    var da = `${date.getDate()}`;
    var mo = `${date.getMonth()+1}`;
    var hr = `${date.getHours()}`;
    var mi = `${date.getMinutes()}`;
    var se = `${date.getSeconds()}`;
    return `${da.length==2?da:"0"+da}${dateSep}${mo.length==2?mo:"0"+mo}${dateSep}${date.getFullYear()} ${hr.length==2?hr:"0"+hr}${timeSep}${mi.length==2?mi:"0"+mi}${timeSep}${se.length==2?se:"0"+se}`
}