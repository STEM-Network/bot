//Simple db imp:
/* functions:
    get('id', callback(err, collection));
        collection.
*/

const fs = require('fs');
const log = require('../logger').bind(null,"DB");

var loadedCollectionNames=[];
var loadedCollections={};

exports.get=(id, next=()=>{})=>{
    if(id.includes('..')) id = id.replace(/../g, '.');
    if(loadedCollectionNames.includes(id)){
        next(false, loadedCollections[id]);
    } else {
        fs.exists(`./data/collections/${id}`, (exists)=>{
            if(exists){
                fs.readdir(`./data/collections/${id}`,(err,files)=>{
                    if(err){
                        next(err);
                    } else {
                        fs.exists(`./data/templates/${id}.js`, (hasTemplate)=>{
                            var loadedCol = new Collection(id, files, hasTemplate?require(`./templates/${id}.js`):false);
                            loadedCollectionNames.push(id);
                            loadedCollections[id] = loadedCol;
                            next(false,loadedCol);
                        });
                    }
                    
                })
            } else {
                next(new Error("Collection does not exist"));
            }
        });
    }
}

function doSave(){
    log(3, "Saving modified cache data & unloading non persistants");
    loadedCollectionNames.forEach(colName => {
        var col = loadedCollections[colName];
        var hadLoaded = [...col.loaded];
        hadLoaded.forEach((loaded)=>{
            col.save(loaded);
            col.unload(loaded);
        })
    });
}
setInterval(doSave,15*60*1000);   //TODO update timing

global.doSave = doSave; //TODO REMOVE
exports.doSave = doSave;

class Collection{
    constructor(id, elems,template=false){
        this.id = id;
        this.elems = elems;
        this.loaded = [];
        this.loadedData = {};
        this.modified = [];
        this.persist = [];
        if(template){
            this.template=new template();
            //this.create = this.template.create.bind(this.template);
            this.validate = this.template.validate.bind(this.template);
        } else {
            this.template=false;
        }
    }

    exists(eid){
        return this.elems.includes(`${eid}.json`);
    }

    isLoaded(eid){
        return this.loaded.includes(eid);
    }

    get(eid, next=()=>{}){
        if(this.exists(eid)){
            if(this.isLoaded(eid)){
                next(false, this.loadedData[eid]);
                return;
            } else {
                var load=JSON.parse(fs.readFileSync(`./data/collections/${this.id}/${eid}.json`));
                if(this.template){
                    load=this.validate(load);
                    if(load==false){
                        next("Invalid json load");
                        return;
                    }
                }
                this.loadedData[eid] = load;
                this.loaded.push(eid);
                next(false, this.loadedData[eid]);
                return;
            }
        } else {
            next(`Does not exist in ${this.id}!`);
            return;
        }
    }
    
    save(eid){
        if(this.modified.includes(eid)){
            fs.writeFileSync(`./data/collections/${this.id}/${eid}.json`, JSON.stringify(this.loadedData[eid]));
            this.modified = this.modified.filter((v)=>(v!=eid));
        }
    }

    unload(eid){
        if(!this.persist.includes(eid)){
            if(this.modified.includes(eid)) this.save(eid);
            this.loaded = this.loaded.filter((v)=>(v!=eid));
            this.persist = this.persist.filter((v)=>(v!=eid));
            this.loadedData[eid] = null;
        }
    }
    
    create(...args){
        var obj = this.template.create(...args);
        this.loadedData[obj.id] = obj;
        this.modified.push(obj.id);
        this.loaded.push(obj.id);
        return obj;
    }
}