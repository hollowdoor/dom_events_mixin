'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var matches = _interopDefault(require('matches-selector'));

function registerEvent(source, name){
    source._events = source._events || {};
    source._events[name] = source._events[name] || [];
}

function getEventInfo(name, delegate, listener, useCapture, ref){
    if ( ref === void 0 ) ref = {};
    var once = ref.once; if ( once === void 0 ) once = false;


    var userListener;
    var source = this;
    var info = {
        name: name,
        once: once
    };

    if(typeof delegate !== 'string'){
        useCapture = listener;
        listener = delegate;
        delegate = null;
    }

    if(delegate){
        if(once){
            userListener = listener;
            listener = function(event){
                if(matches(event.target, delegate)){
                    removeEvent(source, info);
                    return userListener.call(this, event);
                }
            };
        }else{
            userListener = listener;
            listener = function(event){
                if(matches(event.target, delegate)){
                    return userListener.call(this, event);
                }
            };
        }
    }else if(once){
        userListener = listener;
        listener = function(event){
            removeEvent(source, info);
            return userListener.call(this, event);
        };
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
    source.element.addEventListener(event.name, event.listener, event.useCapture);
}

function removeEvent(source, event){
    if(source._events === void 0) { return; }
    if(source._events[event.name] === void 0) { return; }

    var events = source._events[event.name];

    for(var i=0; i<events.length; i++){
        if(events[i].userListener === event.userListener){
            source.element.removeEventListener(
                name, event.listener, event.useCapture);
            source._events[event.name].splice(i, 1);
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
    }
    /*on(name, delegate, listener, useCapture){
        return on(this, getEventInfo.apply(null,arguments));
    },
    off(name, delegate, listener, useCapture){
        return off(this, getEventInfo.apply(null, arguments));
    },
    matches(selector){
        return matches(this.element, selector);
    },
    key(keys, listener){
        return keyed(this, keys, listener);
    },
    observe(event){
        return new Observable({

        });
    }*/
};

function mixin(dest){
    console.log(props);
    Object.assign(dest, props);
    return dest;
}

function mixinDOMEvents(dest){
    return mixin(dest);
}

exports.mixin = mixin;
exports.mixinDOMEvents = mixinDOMEvents;
exports.props = props;
//# sourceMappingURL=bundle.js.map
