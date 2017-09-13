import matches from 'matches-selector';

export function registerEvent(source, name){
    source._events = source._events || {};
    source._events[name] = source._events[name] || [];
}

export function getEventInfo(name, delegate, listener, useCapture, {
    once = false
} = {}){

    let userListener;
    let source = this;
    let info = {
        name,
        once
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
        listener,
        userListener,
        useCapture,
        delegate
    });
}

export function addEvent(source, event){
    source._events[event.name].push(event);
    source.element.addEventListener(event.name, event.listener, event.useCapture);
}

export function removeEvent(source, event){
    if(source._events === void 0) return;
    if(source._events[event.name] === void 0) return;

    let events = source._events[event.name];

    for(let i=0; i<events.length; i++){
        if(events[i].userListener === event.userListener){
            source.element.removeEventListener(
                name, event.listener, event.useCapture);
            source._events[event.name].splice(i, 1);
            return;
        }
    }
}
