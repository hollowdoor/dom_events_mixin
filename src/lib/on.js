//import getEventInfo from './get_event_info.js';
import {
    getEventInfo,
    registerEvent,
    addEvent,
} from './event_registry.js';
import delegateOn from './delegate_on.js';

export default function on(name, delegate, listener, useCapture){
    const info = getEventInfo.apply(null, arguments);
    if(!info.delegate){
        registerEvent(this, name);
        addEvent(this, info);
        //const {name, listener, useCapture} = info;
        //source.element.addEventListener(name, listener, useCapture);
        return source;
    }
    return delegateOn(this, info);
}
