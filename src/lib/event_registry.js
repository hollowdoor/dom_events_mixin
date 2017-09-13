import matches from 'matches-selector';
import keyFrom from './keyfrom.js';

export function registerEvent(source, name){
    source._events = source._events || {};
    source._events[name] = source._events[name] || [];
}

function initInfo(name){
    const info = {keys: null, name};
    let keys, names;
    let maybeKeys = name.split(':').map(s=>s.trim());
    if(maybeKeys.length > 1){
        let map = {}, index;
        [keys, names] = maybeKeys;
        let list = keys.split(' ');
        const setOp = (name)=>{
            if((index = list.indexOf(name)) !== -1){
                map[name] = true;
                map.operators = true;
                list.splice(index, 1);
            }

        };
        setOp('ctrl');
        setOp('alt');
        setOp('shift');
        map.key = list[0];
        info.keys = map;
        info.names = names.split(' ');
    }else{
        info.names = name.split(' ');
    }

    return info;
}

export function getEventInfo(name, delegate, listener, useCapture, once){

    let userListener = listener;
    let source = this;
    let info = initInfo(name);

    if(typeof delegate !== 'string'){
        useCapture = listener;
        listener = delegate;
        delegate = null;
    }

    //Last caller is created first
    //All layered like an onion from the inside out on creation
    //Pealed from the outside in on event firing
    if(once){
        listener = ((fire)=>{
            return function(event){
                removeEvent(source, info);
                return fire.call(this, event);
            };
        })(listener);
    }

    if(typeof delegate === 'string'){
        listener = ((fire)=>{
            return function(event){
                if(matches(event.target, delegate)){
                    return fire.call(this, event);
                }
            };
        })(listener);
    }

    if(info.keys){
        listener = ((fire)=>{
            const map = info.keys;
            return function(event){

                if(!map.key || map.key === keyFrom(event)){
                    if((event.ctrlKey || undefined) == map.ctrl &&
                    (event.altKey || undefined) == map.alt &&
                    (event.shiftKey || undefined) == map.shift){
                        return fire.call(this, event);
                    }
                }
            };
        })(listener);
    }

    return Object.assign(info, {
        listener,
        userListener,
        useCapture,
        delegate
    });
}

export function addEvent(source, event){
    source._events[event.name].push(event);
    event.names.forEach(name=>{
        source.element.addEventListener(name, event.listener, event.useCapture);
    });
}

export function removeEvent(source, event){
    if(source._events === void 0) return;
    if(source._events[event.name] === void 0) return;

    let events = source._events[event.name];

    for(let i=0; i<events.length; i++){
        if(events[i].userListener === event.userListener){
            events[i].names.forEach(name=>{
                source.element.removeEventListener(
                    name, event.listener, event.useCapture);
            });
            
            source._events[event.name].splice(i, 1);
            if(!source._events[event.name].length){
                delete source._events[event.name];
            }
            return;
        }
    }
}
