import delegateOff from './delegate_off';

export default function off(source, info){
    if(!info.delegate){
        const {name, listener, useCapture} = info;
        source.element.removeEventListener(name, listener, useCapture);
    }
    return delegateOff(source, info);
}
