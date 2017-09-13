import keynames from './keynames.js';

export default function keyFrom(event){

    return (keynames[event.which]
        || String.fromCharCode(event.keyCode).toLowerCase());
}
