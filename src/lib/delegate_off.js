
export default function delegateOff(source, {name, delegate, listener, useCapture}){
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
