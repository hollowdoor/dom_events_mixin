import {
    getEventInfo,
    registerEvent,
    addEvent,
    removeEvent
} from './lib/event_registry.js';

const props = {
    _delegated: [],
    on(name, delegate, listener, useCapture){
        const info = getEventInfo.apply(null, arguments);
        registerEvent(this, name);
        addEvent(this, info);
    },
    off(name, delegate, listener, useCapture){
        const info = getEventInfo.apply(null, arguments);
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

export function mixin(dest){
    console.log(props)
    Object.assign(dest, props);
    return dest;
}

export function mixinDOMEvents(dest){
    return mixin(dest);
}

export { props };

function hasDelegate(args){
    return (typeof args[1] === 'string'
    && typeof args[2] === 'function');
}
