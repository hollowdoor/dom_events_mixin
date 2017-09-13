import matches from 'matches-selector';
import {
    addEvent,
} from './event_registry.js';

export default function delegateOn(source, {name, delegate, listener, useCapture}){

    function actual(event){
        if(matches(event.target, delegate)){
            return listener.apply(this, event);
        }
    }
    addEvent(source, )
    /*source._delegated[name] = source._delegated[name] || [];
    source._delegated[name].push({
        delegate,
        listener,
        useCapture,
        actual
    });

    on(source, {name, listener:actual, useCapture});*/

    return source;
}
