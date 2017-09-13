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
    },
    once(name, delegate, listener, useCapture){
        const info = getEventInfo.call(this, name, delegate, listener, useCapture, true);
        registerEvent(this, name);
        addEvent(this, info);
    },
    matches(selector){
        return matches(this.element, selector);
    },/*
    key(keys, listener){
        return keyed(this, keys, listener);
    }*/
};

export function mixin(dest){
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
