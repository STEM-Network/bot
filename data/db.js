//Simple db imp:
/* functions:
    get('id', callback(err, collection));
        collection.
*/

const fs = require('fs');

exports.get=(id, next)=>{
    if(id.includes('..')) id = id.replace(/../g, '.');
    fs.exists(`./data/collections/${id}`, (exists)=>{
        if(exists){
            fs.readdir(`./data/collections/${id}`,(err,files)=>{
                if(err){
                    next(err);
                } else {
                    next(false,new Collection(id, files))
                }
                
            })
        } else {
            next(new Error("Collection does not exist"));
        }
    });
}

class Collection{
    constructor(id, elems){
        this.id = id;
        this.elems = elems;
        this.loaded = [];
        this.loadedData = {};
        this.modified = [];
        this.persist = [];
    }

    exists(eid){
        return this.elems.includes(`${eid}.json`);
    }

    isLoaded(eid){
        return this.loaded.includes(eid);
    }

    get(eid, next){
        if(this.exists(eid)){
            if(this.isLoaded(eid)){
                next(false, this.loadedData[eid]);
            } else {
                this.loadedData[eid] = JSON.parse(fs.readFileSync(`./data/collections/${this.id}/${eid}.json`));
                this.loaded.push(eid);
                next(false, this.loadedData[eid]);
            }
        } else {
            next("Does not exist!");
        }
    }
    
    save(eid){
        if(modified.includes(eid)){
            fs.writeFile(`./data/collections/${this.id}/${eid}.json`, JSON.stringify(loadedData[eid]));
        }
    }
    
}