import matches from 'matches-selector';
//import keyFrom from './keyfrom.js';
import Keys from './keys.js';

export function registerEvent(source, name){
    source._events = source._events || {};
    source._events[name] = source._events[name] || [];
}

function initInfo(name){
    const info = {keys: null, name};
    let keys;
    let maybeKeys = name.split(':').map(s=>s.trim());
    if(maybeKeys.length > 1){
        [keys, name] = maybeKeys;
        info.keys = new Keys(keys);
    }

    info.names = name.split(' ');

    return info;
}

const layers = {
    delegate(fire, delegate){
        return function(event){
            if(matches(event.target, delegate)){
                return fire.call(this, event);
            }
        };
    },
    keys(fire, map){
        return function(event){
            if(map.match(event)){
                return fire.call(this, event);
            }
        };
    },
    debounce(fire, delay){
        let timer = null;
        return function(event){
            clearTimeout(timer);
            timer = setTimeout(()=>{
                fire.call(this, event);
            }, delay);
        };
    },
    throttle(fire, wait){
        let rtn, last = 0, first = false, timeoutID;

        const reset = ()=>{
            timeoutID = 0;
            last = Date.now();
        };

        return function(event){
            let delta = new Date() - last;

            if(!first){
                first = true;
                reset();
                fire.call(this, event);
                return;
            }

            if(!timeoutID){
                if(delta >= wait){
                    reset();
                    rtn = fire.call(this, event);
                }else{
                    timeoutID = setTimeout(()=>{
                        reset();
                        rtn = fire.call(this, event);
                    }, wait - delta);
                }
            }
            return rtn;
        };
    },
    once(source, fire, info){
        return function(event){
            removeEvent(source, info);
            return fire.call(this, event);
        };
    }

};

export function getEventInfo(name, delegate, listener, options){

    let userListener = listener;
    let source = this;
    let info = initInfo(name);

    if(typeof delegate !== 'string'){
        options = listener;
        userListener = listener = delegate;
        delegate = null;
    }

    options = options || {};

    let { once, useCapture = false, throttle, debounce } = options;

    //Last caller is created first
    //All layered like an onion from the inside out on creation
    //Pealed from the outside in on event firing

    //once should be first to allow async calls to finish
    if(!!once){
        listener = layers.once(source, listener, info);
    }

    //Prefer throttle over debounce
    if(!!throttle){
        listener = layers.throttle(listener, parseInt(throttle));
    }else
    if(!!debounce){
        listener = layers.debounce(listener, parseInt(debounce));
    }

    if(!!info.keys){
        listener = layers.keys(listener, info.keys);
    }

    if(typeof delegate === 'string'){
        try{
            document.querySelector(delegate);
        }catch(e){
            throw new Error('delegate selector Error \n'+e.message);
        }
        listener = layers.delegate(listener, delegate);
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
