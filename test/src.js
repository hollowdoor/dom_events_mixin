import { mixin } from '../';

class MyElement {
    constructor(tag){
        //mixin(this);
        if(typeof tag === 'string'){
            this.element = document.querySelector(tag);
        }else{
            this.element = tag;
        }

    }
}

mixin(MyElement.prototype);

const input1 = new MyElement('#input1');
input1.on('click', e=>console.log('clicked'));
input1.once('mousedown', e=>console.log('mousedowned'));

const el2 = new MyElement('#list1');
el2.on('click', 'li', e=>console.log(e.target.innerHTML));
el2.once('click', 'li', e=>console.log('once ',e.target.innerHTML));


const div1 = new MyElement('#div1');
div1.on('mousemove click', e=>{
    console.log('debounced ', Date.now());
}, {debounce: 500});

const div2 = new MyElement(document);
div2.on('mousemove', '#div2',e=>{
    console.log('throttled ', Date.now());
}, {throttle: 200});
