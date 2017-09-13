import { mixin } from '../';

class MyElement {
    constructor(tag){
        mixin(this);
        if(typeof tag === 'string'){
            this.element = document.createElement(tag);
        }else{
            this.element = tag;
        }
        if(this.element !== document.body)
            document.body.appendChild(this.element);
    }
}

const el = new MyElement('input');
el.on('click', e=>console.log('clicked'));
