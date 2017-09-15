'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var objectAssign = _interopDefault(require('object-assign'));
var matches$1 = _interopDefault(require('matches-selector'));

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

var setOp = function (map, list, name){
    var index;
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

var Keys = function Keys(keys){
    this.sequence = keys;
    var list = keys.split('+');
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
};
Keys.prototype.match = function match (event){
    return this.matchSequence(event);
};

function registerEvent(source, name){
    source._events = source._events || {};
    source._events[name] = source._events[name] || [];
}

function initInfo(name){
    var info = {keys: null, name: name};
    var keys;
    var maybeKeys = name.split(':').map(function (s){ return s.trim(); });
    if(maybeKeys.length > 1){
        var assign;
        (assign = maybeKeys, keys = assign[0], name = assign[1]);
        info.keys = new Keys(keys);
    }

    info.names = name.split(' ');

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
            if(map.match(event)){
                return fire.call(this, event);
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
        var rtn, last = 0, first = false, timeoutID;

        var reset = function (){
            timeoutID = 0;
            last = Date.now();
        };

        return function(event){
            var this$1 = this;

            var delta = new Date() - last;

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
                    timeoutID = setTimeout(function (){
                        reset();
                        rtn = fire.call(this$1, event);
                    }, wait - delta);
                }
            }
            return rtn;
        };
    },
    contain: function contain(fire){
        return function(event){

            var rect = this.getBoundingClientRect();
            if (event.clientX >= rect.left
                && event.clientX <= rect.right
                && event.clientY >= rect.top
                && event.clientY <= rect.bottom) {
              // Mouse is inside element.
              return fire.call(this, event);
            }
        };
    },
    once: function once(source, fire, info){
        return function(event){
            removeEvent(source, info);
            return fire.call(this, event);
        };
    },
    object: function object(handler){
        return function(event){
            return (handler.handleEvent).call(handler, event);
        };
    }
};

function getEventInfo(name, delegate, handler, options){

    var userHandler = handler;
    var source = this;
    var info = initInfo(name);

    if(typeof delegate !== 'string'){
        options = handler;
        userHandler = handler = delegate;
        delegate = null;
    }

    var ref = typeof options === 'object' ? options : {};
    var once = ref.once;
    var capture = ref.capture; if ( capture === void 0 ) capture = false;
    var throttle = ref.throttle; if ( throttle === void 0 ) throttle = 0;
    var debounce = ref.debounce; if ( debounce === void 0 ) debounce = 0;

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
        handler: handler,
        //Matching properties for removal
        userHandler: userHandler,
        capture: capture,
        delegate: delegate,
        throttle: throttle,
        debounce: debounce
    });
}

function addEvent(source, event){
    source._events[event.name].push(event);
    event.names.forEach(function (name){
        source.element.addEventListener(name, event.handler, event.capture);
    });
}

function removeEvent(source, event){
    if(source._events === void 0) { return; }
    if(source._events[event.name] === void 0) { return; }

    var events = source._events[event.name];

    for(var i=0; i<events.length; i++){
        if(
            events[i].userHandler === event.userHandler &&
            events[i].capture === event.capture &&
            events[i].delegate === event.delegate &&
            events[i].throttle === event.throttle &&
            events[i].debounce === event.debounce
        ){
            events[i].names.forEach(function (name){
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

exports.mixin = mixin;
exports.mixinDOMEvents = mixinDOMEvents;
exports.props = props;
//# sourceMappingURL=bundle.js.map
