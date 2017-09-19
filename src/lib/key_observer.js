const setOp = (map, list, name)=>{
    let index;
    if((index = list.indexOf(name)) !== -1){
        map[name] = true;
        map.modifiers = true;
        list.splice(index, 1);
    }
};

class KeyObserver {
    constructor(dom, keys){
        this.dom = dom;
        this.sequence = keys;
        let list = keys.split('+');
        setOp(this, list, 'ctrl');
        setOp(this, list, 'alt');
        setOp(this, list, 'shift');
        setOp(this, list, 'cmd');
        this.key = list[0];

        document.addEventListener('keydown', event=>{
            e.preventDefault();
            //e.stopPropagation();
            this.ctrlKey = e.ctrlKey;
            this.altKey = e.altKey;
            this.shiftKey = e.shiftKey;
            this.metaKey = e.metaKey;
            this.keyCode = e.keyCode;
            this.key = e.key;
            //return false;
        });
    }
    on(...args){
        this.dom.on(...args);
        return this;
    }
    off(...args){
        this.dom.on(...args);
        return this;
    }
    once(...args){
        this.dom.once(...args);
        return this;
    }
    trigger(...args){
        this.dom.trigger(...args);
        return this;
    }
}
