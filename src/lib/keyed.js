import keyFrom from './keyfrom.js';

function initMap(keys){
    const list = keys.split(' ');
    const map = {operators: false}, index;
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
    map.key = list[0] || 'any';
    return map;
}

function createKeyCheck(keys){
    const map = initMap(keys);

    return event=>{
        if(map.key === keyFrom(event)){
            return (event.ctrlKey || undefined) == map.ctrl &&
            (event.altKey || undefined) == map.alt &&
            (event.shiftKey || undefined) == map.shift);
        }
    };
}

export function keyed(source, keys, listener, useCapture){

    let match = createKeyCheck(keys);

    function actual(event){
        if(match(event)){
            return listener(event);
        }
    }

    addEvent({
        listener: actual,
        userListener: listener,
        useCapture
    });

    return source;
}

export function unkey(source, keys, listener){
    let keyed = source._keyed[keys];
    for(let i=0; i<keyed.length; i++){
        if(keyed[i].listener === listener){
            source.element.removeEventListener(
                'keydown',
                keyed[i].actual,
                false
            );
            break;
        }
    }
    return this;
}
