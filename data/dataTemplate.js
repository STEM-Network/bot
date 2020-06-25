class DataTemplate {
    constructor(defaultKeys=[{key:"id", required:true, default:null}]){
        if(new.target==DataTemplate) {
            throw "Cannot instantiate DataTemplate base class";
        }
        if (this.create === undefined) {
            throw "All DataTemplates must implement create method";
        }
        this.regKeys = defaultKeys;
    }

    build(){
        var obj = {};
        this.regKeys.forEach(key=>{
            obj[key.key] = key.default;
        })
        return obj;
    }

    getTemplate(){
        return JSON.parse(JSON.stringify(this.regKeys));
    }

    registerKey(desc={}){
        if(desc.key == undefined) throw "No keyname given!";
        if(desc.default == undefined) throw "Must specify default";
        for(var i=0; i<this.regKeys.length; i++){
            if(this.regKeys[i].key == desc.key) throw "Keyname already in use";
        }
        desc.required=false;
        this.regKeys.push(desc);
    }
    
    create(...vals){
        var obj = {};
        for(var i=0; i<this.regKeys.length; i++){
            if(i<vals.length){
                obj[this.regKeys[i].key] = vals[i];
            } else if(this.regKeys[i].required){
                throw `Missing required key ${JSON.stringify(this.regKeys[i])}`
            } else {
                obj[this.regKeys[i].key] = this.regKeys[i].default;
            }
        }
        return obj;
    }

    validate(obj={}){
        var existingKeys = Object.keys(obj);
        for(var i=0; i<this.regKeys.length; i++){
            if(!existingKeys.includes(this.regKeys[i].key)){
                if(this.regKeys[i].required){
                    return false;
                } else {
                    obj[this.regKeys[i].key] = this.regKeys[i].default;
                }
            }
        }
        return obj;
    }
}

module.exports = DataTemplate;