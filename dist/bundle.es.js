import objectAssign from 'object-assign';
import matches$1 from 'matches-selector';

var keynames = {
  8   : 'backspace',
  9   : 'tab',
  13  : 'enter',
  16  : 'shift',
  17  : 'ctrl',
  18  : 'alt',
  20  : 'capslock',
  27  : 'esc',
  32  : 'space',
  33  : 'pageup',
  34  : 'pagedown',
  35  : 'end',
  36  : 'home',
  37  : 'left',
  38  : 'up',
  39  : 'right',
  40  : 'down',
  45  : 'ins',
  46  : 'del',
  91  : 'meta',
  93  : 'meta',
  224 : 'meta'
};

function keyFrom(event){

    if(event.key !== void 0){
        return event.key.toLowerCase();
    }

    return (keynames[event.which]
        || String.fromCharCode(event.keyCode).toLowerCase());
}

function registerEvent(source, name){
    source._events = source._events || {};
    source._events[name] = source._events[name] || [];
}

function initInfo(name){
    var info = {keys: null, name: name};
    var keys, names;
    var maybeKeys = name.split(':').map(function (s){ return s.trim(); });
    if(maybeKeys.length > 1){
        var map = {}, index;
        var assign;
        (assign = maybeKeys, keys = assign[0], names = assign[1]);
        var list = keys.split('+');
        var setOp = function (name){
            if((index = list.indexOf(name)) !== -1){
                map[name] = true;
                map.operators = true;
                list.splice(index, 1);
            }

        };
        setOp('ctrl');
        setOp('alt');
        setOp('shift');
        setOp('cmd');
        map.key = list[0];
        info.keys = map;
        info.names = names.split(' ');
        map.controls = function(event){
            return ((event.ctrlKey || undefined) == map.ctrl &&
            (event.altKey || undefined) == map.alt &&
            (event.shiftKey || undefined) == map.shift);
        };
        if(typeof map.cmd === 'boolean'){
            //supporting ctrl and meta for mac
            map.controls = function(event){
                return ((event.ctrlKey || event.metaKey) &&
                (event.altKey || undefined) == map.alt &&
                (event.shiftKey || undefined) == map.shift);
            };
        }
    }else{
        info.names = name.split(' ');
    }

    return info;
}

var layers = {
    delegate: function delegate(fire, delegate$1){
        return function(event){
            if(matches$1(event.target, delegate$1)){
                return fire.call(this, event);
            }
        };
    },
    keys: function keys(fire, map){
        return function(event){
            //Some times a visible key is used
            if(!map.key || map.key === keyFrom(event)){

                if(map.controls(event)){
                    return fire.call(this, event);
                }
            }
        };
    },
    debounce: function debounce(fire, delay){
        var timer = null;
        return function(event){
            var this$1 = this;

            clearTimeout(timer);
            timer = setTimeout(function (){
                fire.call(this$1, event);
            }, delay);
        };
    },
    throttle: function throttle(fire, wait){
        var ctx, args, rtn, timeoutID; // caching
        var last = 0, first = false;

        var reset = function (){
            timeoutID = 0;
            last = Date.now();
        };

        return function(event){
            var this$1 = this;

            //ctx = this;
            //args = arguments;
            if(!first){
                first = true;
                reset();
                fire.call(this, event);
                return;
            }
            var delta = new Date() - last;
            if (!timeoutID){
                if(delta >= wait){
                    reset();
                    rtn = fire.call(this, event);
                }else{
                    timeoutID = setTimeout(function (){
                        reset();
                        rtn = fire.call(this$1, event);
                    }, wait - delta);
                }
            }
            return rtn;
        };
    },
    once: function once(source, fire, info){
        return function(event){
            removeEvent(source, info);
            return fire.call(this, event);
        };
    }

};

function getEventInfo(name, delegate, listener, options){

    var userListener = listener;
    var source = this;
    var info = initInfo(name);

    if(typeof delegate !== 'string'){
        options = listener;
        userListener = listener = delegate;
        delegate = null;
    }

    options = options || {};

    var once = options.once;
    var useCapture = options.useCapture; if ( useCapture === void 0 ) useCapture = false;
    var throttle = options.throttle;
    var debounce = options.debounce;

    //Last caller is created first
    //All layered like an onion from the inside out on creation
    //Pealed from the outside in on event firing

    //Prefer throttle over debounce
    if(!!throttle){
        listener = layers.throttle(listener, parseInt(throttle));
    }else
    if(!!debounce){
        listener = layers.debounce(listener, parseInt(debounce));
    }

    //Sync layers should run before async layers

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

    if(!!once){
        listener = layers.once(source, listener, info);
    }

    return Object.assign(info, {
        listener: listener,
        userListener: userListener,
        useCapture: useCapture,
        delegate: delegate
    });
}

function addEvent(source, event){
    source._events[event.name].push(event);
    event.names.forEach(function (name){
        source.element.addEventListener(name, event.listener, event.useCapture);
    });
}

function removeEvent(source, event){
    if(source._events === void 0) { return; }
    if(source._events[event.name] === void 0) { return; }

    var events = source._events[event.name];

    for(var i=0; i<events.length; i++){
        if(events[i].userListener === event.userListener){
            events[i].names.forEach(function (name){
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

var props = {
    _delegated: [],
    on: function on(name, delegate, listener, options){
        var info = getEventInfo.apply(null, arguments);
        registerEvent(this, name);
        addEvent(this, info);
    },
    off: function off(name, delegate, listener, options){
        var info = getEventInfo.apply(null, arguments);
        removeEvent(this, info);
    },
    once: function once(name, delegate, listener, options){
        if(typeof delegate === 'function'){
            listener = delegate;
            options = listener;
        }
        options = options || {};
        options.once = true;
        var info = getEventInfo.call(this, name, delegate, listener, options);
        registerEvent(this, name);
        addEvent(this, info);
    },
    matches: function matches$1$$1(selector){
        return matches(this.element, selector);
    },
    observe: function observe(event){
        //This is here to remind us that native observables
        //are on the horizon.
        /*
        return new Observable(observer=>{
            //using events from this prototype
            //emit the observable value
        });
        */
    }
};

function mixin(dest){
    objectAssign(dest, props);
    return dest;
}

function mixinDOMEvents(dest){
    return mixin(dest);
}

export { mixin, mixinDOMEvents, props };
//# sourceMappingURL=bundle.es.js.map
