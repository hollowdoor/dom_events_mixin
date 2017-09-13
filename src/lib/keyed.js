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

function createKeyMap(keys){

    const map = initMap(keys);

    map.hasKey = function(event){
        return map.key === keyFrom(event);
    };
    map.hasOperators = function(event){
        return (event.ctrlKey || undefined) == map.ctrl &&
        (event.altKey || undefined) == map.alt &&
        (event.shiftKey || undefined) == map.shift);
    };

}

export function keyed(source, keys, listener){

    let map = createKeyMap(keys);

    function actual(event){
        if(map.hasKey(event)){
            if(!map.operators){
                return listener(event);
            }else if(map.hasOperators(event)){
                return listener(event);
            }
        }
    }

    source._keyed = source._keyed || {};
    source._keyed[keys] = source._keyed[keys] || [];
    source._keyed[keys].push({
        listener,
        actual
    });

    source.element.addEventListener('keydown', actual, false);

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
