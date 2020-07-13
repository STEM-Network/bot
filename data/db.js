//Simple db imp:
/* functions:
    get('id', callback(err, collection));
        collection.
*/

const fs = require('fs');
const log = require('../logger').bind(null,"DB");

var loadedCollectionNames=[];
var loadedCollections={};

const Collections = {
    loading: [],
    loaded: [],
    queue: {},
    reference: {}
}

exports.info = Collections;


exports.get=(id, next=(err,collection)=>{})=>{
    //if(id.includes('..')) id = id.replace(/../g, '.');
    if(Collections.loaded.includes(id)){
        log(4, `Serving loaded collection: ${id}`)
        next(false,Collections.reference[id]);
    } else if(Collections.loading.includes(id)){
        log(4, `awaiting collection: ${id}`)
        Collections.queue[id].push(next);
    } else {
        log(4, `Creating queue for collection: ${id}`)
        Collections.queue[id] = [next]
        Collections.loading.push(id);
        checkLoad(id)
    }
}

function checkLoad(id){
    fs.exists(`./data/collections/${id}`, (exists)=>{
        if(exists){
            log(3, `Loading existing collection: ${id}`);
            load(id);
        } else {
            log(3,`Creating new collection: ${id}`);
            fs.mkdir(`./data/collections/${id}`,{recursive:true},(err)=>{
                if(err){
                    log(1,`Failed to create new collection: ${id}`);
                    unqueue(id,err)
                } else {
                    log(3, `Loading new collection: ${id}`);
                    load(id);
                }
            });
        }
    });
}

function load(id){
    fs.readdir(`./data/collections/${id}`,(err,files)=>{
        if(err){
            log(1,`Failed to load collection: ${id}`);
            unqueue(id,err)
        } else {
            fs.exists(`./data/templates/${id}.js`, (hasTemplate)=>{
                Collections.reference[id] = new Collection(id, files, hasTemplate?require(`./templates/${id}.js`):false);
                Collections.loaded.push(id);
                Collections.loading = Collections.loading.filter(lid=>(lid!=id));
                unqueue(id,false)
            });
        }
    })
}

function unqueue(id,err){
    log(4, `unqueue(${id})`);
    if(Collections.queue[id] && Collections.queue[id].length>0){
        Collections.queue[id].forEach(callback=>{
            callback(err, Collections.reference[id]);
        });
    }
}



/*
exports.get=(id, next=()=>{})=>{
    if(id.includes('..')) id = id.replace(/../g, '.');
    if(loadedCollectionNames.includes(id)){
        
        log(3,`served loaded collection: ${id}: ${loadedCollections[id]}`);
        next(false, loadedCollections[id]);
    } else {
        log(3,`collection not loaded: ${id}`);
        loadedCollectionNames.push(id);
        var loadedCol = null;
        loadedCollections[id] = loadedCol;
        fs.exists(`./data/collections/${id}`, (exists)=>{
            if(!exists){
                log(3,`Creating new collection "${id}"`);
                fs.mkdirSync(`./data/collections/${id}`,{recursive:true});
            }
            fs.readdir(`./data/collections/${id}`,(err,files)=>{
                if(err){
                    next(err);
                } else {
                    fs.exists(`./data/templates/${id}.js`, (hasTemplate)=>{
                        loadedCol = new Collection(id, files, hasTemplate?require(`./templates/${id}.js`):false);
                        //loadedCollections[id] = loadedCol;
                        next(false,loadedCol);
                    });
                }
            })
        });
    }
}*/

function doSave(){
    //log(3, "Saving modified cache data & unloading non persistants");
    Collections.loaded.forEach(colName => {
        var col = Collections.reference[colName];
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
        this.elems.push(`${obj.id}.json`);
        return obj;
    }
}