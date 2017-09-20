dom-events-mixin
========

Install
----

`npm install dom-events-mixin`

Import
---

```javascript
//The two imports do the dame thing
import { mixin, mixinDOMEvents } from 'dom-events-mixin';
```

Attach the mixin to a prototype
-----------------------

```javascript
class MyElement {
    constructor(tag){
        //mixinDOMEvents requires an element property
        //to be on the object in order to work
        if(typeof tag === 'string'){
            this.element = document.querySelector(tag);
        }else{
            this.element = tag;
        }

    }
}
//Methods, and properties are added to MyElement
mixinDOMEvents(MyElement.prototype);

const el = new MyElement('#element-id');
```

API
---

Using `mixinDOMEvents()` the following methods, or properties are set on a target object of your choice.

`proto` stands for the prototype of the target class/object.

`el` stands for the instance of the target class/object.

### proto.on(name, delegate|handler, handler|options, options| undefined)

Set DOM events on `el.element`.

```javascript
el.on('click', '.child-class-selector', event=>{
    //Do some action here
}, {
    //Default options
    capture: false,
    debounce: 0,
    throttle: 0
});
```

You can set multiple events. The delegate, and options arguments are optional.

```javascript
el.on('click mousemove', event=>{
    //Do some action here on click, and on mousedown
});
```

Pass a delegate selector as the second argument to isolate event firing to those elements.

```javascript
el.on('click', '.child-class-selector', event=>{
    //Do some action here only when clicking on an element
    //that matches the selector .child-class-selector
});
```

**If options.debounce, or options.throttle is set then you won't be able to return a value from the event listener**

#### options.debounce

Setting `options.debounce` to an integer greater than zero will make events only fire once at that specified interval.

```javascript
el.on('click', '.child-class-selector', event=>{
    //Do some action here only after 500 milliseconds
}, {
    debounce: 500
});
```

#### options.throttle

Setting `options.throttle` to an integer greater than zero will make events fire every interval.

```javascript
el.on('click', '.child-class-selector', event=>{
    //Do some action here every 100 milliseconds
}, {
    throttle: 100
});
```

### proto.off()

Use `el.off()` to remove an event set on the object.

`el.off()` should have the exact same parameter input as `el.on()`.

```javascript
function myEventListener(event){
    //Do some action here
}

el.on('click', '.child-class-selector', myEventListener, {
    //Default options
    capture: false,
    debounce: 0,
    throttle: 0
});

el.off('click', '.child-class-selector', myEventListener, {
    //Default options
    capture: false,
    debounce: 0,
    throttle: 0
});
```

### proto.dispatch(event)

`el.dispatch()` is identical to `Element.dispatchEvent(event)`.

Other methods
-----------

These methods do what they say.

* proto.click()
* proto.focus()
* proto.blur()
