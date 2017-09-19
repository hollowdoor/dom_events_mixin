import objectAssign from 'object-assign';
import {
    getEventInfo,
    registerEvent,
    addEvent,
    removeEvent,
    trigger
} from './lib/event_registry.js';

const props = {
    _delegated: [],
    on(name, delegate, listener, options){
        const info = getEventInfo.apply(null, arguments);
        registerEvent(this, name);
        addEvent(this, info);
        return this;
    },
    off(name, delegate, listener, options){
        const info = getEventInfo.apply(null, arguments);
        removeEvent(this, info);
        return this;
    },
    once(name, delegate, listener, options){
        if(typeof delegate === 'function'){
            listener = delegate;
            options = listener;
        }
        options = options || {};
        options.once = true;
        const info = getEventInfo.call(this, name, delegate, listener, options);
        registerEvent(this, name);
        addEvent(this, info);
        return this;
    },
    trigger(event){
        trigger(this, event);
        return this;
    },
    matches(selector){
        return matches(this.element, selector);
    },
    observe(event){
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

[
    'click',
    'focus',
    'blur'
].forEach(prop=>{
    props[prop] = function(){
        return this.element[prop]();
    };
});

export function mixin(dest){
    objectAssign(dest, props);
    return dest;
}

export function mixinDOMEvents(dest){
    return mixin(dest);
}

export { props };
