import { mixin } from '../';

class MyElement {
    constructor(tag){
        mixin(this);
        this.element = document.querySelector(tag);
    }
}

const el = new MyElement('#input1');
el.on('click', e=>console.log('clicked'));
el.once('mousedown', e=>console.log('mousedowned'));
const el2 = new MyElement('#list1');
el2.on('click', 'li', e=>console.log(e.target.innerHTML));
el2.once('click', 'li', e=>console.log('once ',e.target.innerHTML));
el.on('ctrl:click', e=>console.log('ctrl:click'));
el.on('ctrl s:keydown', e=>{
    e.preventDefault();
    console.log('ctrl s')
});
