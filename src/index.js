import matches from 'matches-selector';

function getEventInfo(name, delegate, listener, useCapture){
    let info = {
        name,
        listener: delegate,
        useCapture: listener,
        delegate: null
    };

    if(typeof delegate === 'string'){
        info.listener = listener;
        info.delegate = delegate;
        info.useCapture = useCapture;
    }
    return info;
}

function on(source, info){
    if(!info.delegate){
        const {name, listener, useCapture} = info;
        source.element.addEventListener(name, listener, useCapture);
        return source;
    }
    return delegateOn(source, info);
}

function off(source, info){
    if(!info.delegate){
        const {name, listener, useCapture} = info;
        source.element.removeEventListener(name, listener, useCapture);
    }
    return delegateOff(source, info);
}

function delegateOn(source, {name, delegate, listener, useCapture}){
    function actual(event){
        if(matches(event.target, delegate)){
            return listener.apply(this, event);
        }
    }
    source._delegated[name] = source._delegated[name] || [];
    source._delegated[name].push({
        delegate,
        listener,
        useCapture,
        actual
    });

    on(source, {name, listener:actual, useCapture});

    return source;
}

function delegateOff(source, {name, delegate, listener, useCapture}){
    let delegated = source._delegated[name];
    for(let i=0; i<delegated.length; i++){
        if(delegated[i].listener === listener){
            off(source, {name, listener:delegated[i].actual, useCapture});
            delegated.splice(i, 1);
            break;
        }
    }
    return source;
}

const props = {
    _delegated: [],
    on(name, delegate, listener, useCapture){
        return on(this, getEventInfo(arguments));
    }
    off(name, delegate, listener, useCapture){
        return off(this, getEventInfo(arguments));
    }
    matches(selector){
        return matches(this.element, selector);
    }
    keyed(keys, listener){
        return keyed(this, keys, listener);
    },
    observe(event){
        return new Observable({

        });
    }
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
