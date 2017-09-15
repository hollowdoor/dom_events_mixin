import matches from 'matches-selector';
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
    contain(fire){
        return function(event){

            let rect = this.getBoundingClientRect();
            if (event.clientX >= rect.left
                && event.clientX <= rect.right
                && event.clientY >= rect.top
                && event.clientY <= rect.bottom) {
              // Mouse is inside element.
              return fire.call(this, event);
            }
        };
    },
    once(source, fire, info){
        return function(event){
            removeEvent(source, info);
            return fire.call(this, event);
        };
    },
    object(handler){
        return function(event){
            return (handler.handleEvent).call(handler, event);
        };
    }
};

export function getEventInfo(name, delegate, handler, options){

    let userHandler = handler;
    let source = this;
    let info = initInfo(name);

    if(typeof delegate !== 'string'){
        options = handler;
        userHandler = handler = delegate;
        delegate = null;
    }

    let {
        once, capture = false, throttle = 0, debounce = 0
    } = typeof options === 'object' ? options : {};

    //Last caller is created first
    //All layered like an onion from the inside out on creation
    //Pealed from the outside in on event firing

    if(typeof handler === 'object'){
        if(typeof handler.handleEvent !== 'object'){
            throw new TypeError(
                handler.handleEvent + ' on ' + handler +
                ' is not a function'
            );
        }
        
        handler = layers.object(handler);
    }

    //Prefer throttle over debounce
    if(throttle && !(throttle !== throttle)){
        handler = layers.throttle(handler, parseInt(throttle));
    }else
    if(debounce && !(debounce !== debounce)){
        handler = layers.debounce(handler, parseInt(debounce));
    }

    //once runs before async layers,
    //and after sync layers
    if(!!once){
        handler = layers.once(source, handler, info);
    }

    if(!!info.keys){
        handler = layers.keys(handler, info.keys);
    }

    if(typeof delegate === 'string'){
        try{
            document.querySelector(delegate);
        }catch(e){
            throw new Error('delegate selector Error \n'+e.message);
        }
        handler = layers.delegate(handler, delegate);
    }

    return Object.assign(info, {
        handler,
        //Matching properties for removal
        userHandler,
        capture,
        delegate,
        throttle,
        debounce
    });
}

export function addEvent(source, event){
    source._events[event.name].push(event);
    event.names.forEach(name=>{
        source.element.addEventListener(name, event.handler, event.capture);
    });
}

export function removeEvent(source, event){
    if(source._events === void 0) return;
    if(source._events[event.name] === void 0) return;

    let events = source._events[event.name];

    for(let i=0; i<events.length; i++){
        if(
            events[i].userHandler === event.userHandler &&
            events[i].capture === event.capture &&
            events[i].delegate === event.delegate &&
            events[i].throttle === event.throttle &&
            events[i].debounce === event.debounce
        ){
            events[i].names.forEach(name=>{
                source.element.removeEventListener(
                    name, event.handler, event.capture);
            });

            source._events[event.name].splice(i, 1);
            if(!source._events[event.name].length){
                delete source._events[event.name];
            }
            return;
        }
    }
}
