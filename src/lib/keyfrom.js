import keynames from './keynames.js';

export default function keyFrom(event){
    if(event.key !== void 0){
        return event.key.toLowerCase();
    }
    return (keynames[n]
        || String.fromCharCode(event.keyCode).toLowerCase());
}
