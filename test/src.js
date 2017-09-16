import { mixin } from '../';

class MyElement {
    constructor(tag){
        //mixin(this);
        this.element = document.querySelector(tag);
    }
}

mixin(MyElement.prototype);

const el = new MyElement('#input1');
el.on('click', e=>console.log('clicked'));
el.once('mousedown', e=>console.log('mousedowned'));
el.on('ctrl:click', e=>console.log('ctrl:click'));
el.on('ctrl+s:keydown', e=>{
    e.preventDefault();
    console.log('ctrl+s')
});

const el2 = new MyElement('#list1');
el2.on('click', 'li', e=>console.log(e.target.innerHTML));
el2.once('click', 'li', e=>console.log('once ',e.target.innerHTML));

el2.on('cmd:click', 'li', e=>console.log('ctrl:click li', e.target.innerHTML));

const div1 = new MyElement('#div1');
div1.on('mousemove', e=>{
    console.log('debounced ', Date.now());
}, {debounce: 1000});

const div2 = new MyElement('#div2');
div2.on('mousemove', e=>{
    console.log('throttleed ', Date.now());
}, {throttle: 500});
/*el.quiet('ctrl s:keydown', e=>{
    e.preventDefault();
    console.log('ctrl s quiet')
});*/
