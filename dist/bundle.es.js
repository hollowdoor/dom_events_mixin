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
        var list = keys.split(' ');
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
        map.key = list[0];
        info.keys = map;
        info.names = names.split(' ');
    }else{
        info.names = name.split(' ');
    }

    return info;
}

function getEventInfo(name, delegate, listener, useCapture, once){

    var userListener = listener;
    var source = this;
    var info = initInfo(name);

    if(typeof delegate !== 'string'){
        useCapture = listener;
        listener = delegate;
        delegate = null;
    }

    //Last caller is created first
    //All layered like an onion from the inside out on creation
    //Pealed from the outside in on event firing
    if(once){
        listener = (function (fire){
            return function(event){
                removeEvent(source, info);
                return fire.call(this, event);
            };
        })(listener);
    }

    if(typeof delegate === 'string'){
        listener = (function (fire){
            return function(event){
                if(matches$1(event.target, delegate)){
                    return fire.call(this, event);
                }
            };
        })(listener);
    }

    if(info.keys){
        listener = (function (fire){
            var map = info.keys;
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
    on: function on(name, delegate, listener, useCapture){
        var info = getEventInfo.apply(null, arguments);
        registerEvent(this, name);
        addEvent(this, info);
    },
    off: function off(name, delegate, listener, useCapture){
        var info = getEventInfo.apply(null, arguments);
        removeEvent(this, info);
    },
    once: function once(name, delegate, listener, useCapture){
        var info = getEventInfo.call(this, name, delegate, listener, useCapture, true);
        registerEvent(this, name);
        addEvent(this, info);
    },
    matches: function matches$1$$1(selector){
        return matches(this.element, selector);
    },/*
    key(keys, listener){
        return keyed(this, keys, listener);
    }*/
};

function mixin(dest){
    Object.assign(dest, props);
    return dest;
}

function mixinDOMEvents(dest){
    return mixin(dest);
}

export { mixin, mixinDOMEvents, props };
//# sourceMappingURL=bundle.es.js.map
