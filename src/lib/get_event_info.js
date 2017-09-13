export default function getEventInfo(name, delegate, listener, useCapture){
    
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
