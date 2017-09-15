import keynames from './keynames.js';

function keyFrom(event){

    if(event.key !== void 0){
        return event.key.toLowerCase();
    }

    return (keynames[event.which]
        || String.fromCharCode(event.keyCode).toLowerCase());
}

const setOp = (map, list, name)=>{
    let index;
    if((index = list.indexOf(name)) !== -1){
        /*Object.defineProperty(map, name, {
            value: true
        });*/
        map[name] = true;
        map.modifiers = true;
        list.splice(index, 1);
    }else{
        /*Object.defineProperty(map, name, {
            value: false
        });*/
    }
};

export default class Keys {
    constructor(keys){
        this.sequence = keys;
        let list = keys.split('+');
        setOp(this, list, 'ctrl');
        setOp(this, list, 'alt');
        setOp(this, list, 'shift');
        setOp(this, list, 'cmd');
        this.key = list[0];

        if(this.modifiers){
            Object.defineProperty(this, 'modifiers', {
                value: true
            });
        }

        this.matchModifiers = function(event){
            return ((event.ctrlKey || undefined) == this.ctrl &&
            (event.altKey || undefined) == this.alt &&
            (event.shiftKey || undefined) == this.shift);
        };

        if(typeof this.cmd === 'boolean'){
            //supporting ctrl and meta for mac
            this.matchModifiers = function(event){
                return ((event.ctrlKey || event.metaKey) &&
                (event.altKey || undefined) == this.alt &&
                (event.shiftKey || undefined) == this.shift);
            };
        }

        //Some times a visible key is used
        this.matchSequence = function(event){
            if(this.key === keyFrom(event)){
                return this.matchModifiers(event);
            }
        };

        if(!this.key){
            this.matchSequence = this.matchModifiers;
        }
    }
    match(event){
        return this.matchSequence(event);
    }
}
