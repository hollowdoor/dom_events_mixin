(function (exports) {
'use strict';

/*
object-assign
(c) Sindre Sorhus
@license MIT
*/

/* eslint-disable no-unused-vars */
var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
	if (val === null || val === undefined) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

function shouldUseNative() {
	try {
		if (!Object.assign) {
			return false;
		}

		// Detect buggy property enumeration order in older V8 versions.

		// https://bugs.chromium.org/p/v8/issues/detail?id=4118
		var test1 = new String('abc');  // eslint-disable-line no-new-wrappers
		test1[5] = 'de';
		if (Object.getOwnPropertyNames(test1)[0] === '5') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test2 = {};
		for (var i = 0; i < 10; i++) {
			test2['_' + String.fromCharCode(i)] = i;
		}
		var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
			return test2[n];
		});
		if (order2.join('') !== '0123456789') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test3 = {};
		'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
			test3[letter] = letter;
		});
		if (Object.keys(Object.assign({}, test3)).join('') !==
				'abcdefghijklmnopqrst') {
			return false;
		}

		return true;
	} catch (err) {
		// We don't expect any of the above to throw, but better to be safe.
		return false;
	}
}

var objectAssign = shouldUseNative() ? Object.assign : function (target, source) {
	var arguments$1 = arguments;

	var from;
	var to = toObject(target);
	var symbols;

	for (var s = 1; s < arguments.length; s++) {
		from = Object(arguments$1[s]);

		for (var key in from) {
			if (hasOwnProperty.call(from, key)) {
				to[key] = from[key];
			}
		}

		if (getOwnPropertySymbols) {
			symbols = getOwnPropertySymbols(from);
			for (var i = 0; i < symbols.length; i++) {
				if (propIsEnumerable.call(from, symbols[i])) {
					to[symbols[i]] = from[symbols[i]];
				}
			}
		}
	}

	return to;
};

var proto = typeof Element !== 'undefined' ? Element.prototype : {};
var vendor = proto.matches
  || proto.matchesSelector
  || proto.webkitMatchesSelector
  || proto.mozMatchesSelector
  || proto.msMatchesSelector
  || proto.oMatchesSelector;

var matchesSelector = match;

/**
 * Match `el` to `selector`.
 *
 * @param {Element} el
 * @param {String} selector
 * @return {Boolean}
 * @api public
 */

function match(el, selector) {
  if (!el || el.nodeType !== 1) { return false; }
  if (vendor) { return vendor.call(el, selector); }
  var nodes = el.parentNode.querySelectorAll(selector);
  for (var i = 0; i < nodes.length; i++) {
    if (nodes[i] == el) { return true; }
  }
  return false;
}

var EventObserver = function EventObserver(ref){
    if ( ref === void 0 ) ref = {};
    var handle = ref.handle; if ( handle === void 0 ) handle = null;
    var remove = ref.remove; if ( remove === void 0 ) remove = function (){};

    this._handle = handle;
    this._remove = remove;
};
EventObserver.prototype.emit = function emit (ctx, event){
    return this._handle(ctx, event);
};
EventObserver.prototype.remove = function remove (){
    this._remove();
};

var keynames = {
  8   : 'backspace',
  9   : 'tab',
  13  : 'enter',
  16  : 'shift',
  17  : 'ctrl',
  18  : 'alt',
  20  : 'capslock',
  27  : 'esc',
  32  : 'space',
  33  : 'pageup',
  34  : 'pagedown',
  35  : 'end',
  36  : 'home',
  37  : 'left',
  38  : 'up',
  39  : 'right',
  40  : 'down',
  45  : 'ins',
  46  : 'del',
  91  : 'meta',
  93  : 'meta',
  224 : 'meta'
};

function keyFrom(event){

    if(event.key !== void 0){
        return event.key.toLowerCase();
    }

    return (keynames[event.which]
        || String.fromCharCode(event.keyCode).toLowerCase());
}

var setOp = function (map, list, name){
    var index;
    if((index = list.indexOf(name)) !== -1){
        /*Object.defineProperty(map, name, {
            value: true
        });*/
        map[name] = true;
        map.modifiers = true;
        list.splice(index, 1);
    }
};

var Keys = function Keys(keys){
    this.sequence = keys;
    var list = keys.split('+');
    setOp(this, list, 'ctrl');
    setOp(this, list, 'alt');
    setOp(this, list, 'shift');
    setOp(this, list, 'cmd');
    this.key = list[0];

    this.matchModifiers = function(event){
        return ((event.ctrlKey || undefined) == this.ctrl &&
        (event.altKey || undefined) == this.alt &&
        (event.shiftKey || undefined) == this.shift);
    };

    if(typeof this.cmd === 'boolean'){
        //supporting ctrl and meta for mac
        this.matchModifiers = function(event){
            return ((event.ctrlKey || event.metaKey) &&
            (event.altKey || undefined) == this.alt &&
            (event.shiftKey || undefined) == this.shift);
        };
    }

    //Some times a visible key is used
    this.matchSequence = function(event){
        if(this.key === keyFrom(event)){
            return this.matchModifiers(event);
        }
    };

    if(!this.key){
        this.matchSequence = this.matchModifiers;
    }
};
Keys.prototype.match = function match (event){
    return this.matchSequence(event);
};

function registerEvent(source, name){
    source._events = source._events || {};
    source._events[name] = source._events[name] || [];
}

function initInfo(name){
    var info = {keys: null, name: name};
    /*let keys;
    let maybeKeys = name.split(':').map(s=>s.trim());
    if(maybeKeys.length > 1){
        [keys, name] = maybeKeys;
        info.keys = new Keys(keys);
    }*/

    info.names = name.split(' ');

    return info;
}

var layers = {
    delegate: function delegate(fire, delegate$1){
        return function(event){
            if(matchesSelector(event.target, delegate$1)){
                return fire.call(this, event);
            }
        };
    },
    debounce: function debounce(fire, delay){
        var timer = null;
        return function(event){
            var this$1 = this;

            clearTimeout(timer);
            timer = setTimeout(function (){
                fire.call(this$1, event);
            }, delay);
        };
    },
    throttle: function throttle(fire, wait){
        var rtn, last = 0, first = false, timeoutID;

        var reset = function (){
            timeoutID = 0;
            last = Date.now();
        };

        return function(event){
            var this$1 = this;

            var delta = new Date() - last;

            if(!first){
                first = true;
                reset();
                fire.call(this, event);
                return;
            }

            if(!timeoutID){
                if(delta >= wait){
                    reset();
                    rtn = fire.call(this, event);
                }else{
                    timeoutID = setTimeout(function (){
                        reset();
                        rtn = fire.call(this$1, event);
                    }, wait - delta);
                }
            }
            return rtn;
        };
    },
    contain: function contain(fire){
        return function(event){

            var rect = this.getBoundingClientRect();
            if (event.clientX >= rect.left
                && event.clientX <= rect.right
                && event.clientY >= rect.top
                && event.clientY <= rect.bottom) {
              // Mouse is inside element.
              return fire.call(this, event);
            }
        };
    },
    once: function once(source, fire, info){
        return function(event){
            removeEvent(source, info);
            return fire.call(this, event);
        };
    },
    object: function object(handler){
        return function(event){
            return (handler.handleEvent).call(handler, event);
        };
    },
    main: function main(handler){
        return handler;
    }
};

function getEventInfo(name, delegate, handler, options){

    var userHandler = handler;
    var source = this;
    var info = initInfo(name);

    if(typeof delegate !== 'string'){
        options = handler;
        userHandler = handler = delegate;
        delegate = null;
    }

    var ref = typeof options === 'object' ? options : {};
    var once = ref.once;
    var capture = ref.capture; if ( capture === void 0 ) capture = false;
    var throttle = ref.throttle; if ( throttle === void 0 ) throttle = 0;
    var debounce = ref.debounce; if ( debounce === void 0 ) debounce = 0;

    //Last caller is created first
    //All layered like an onion from the inside out on creation
    //Pealed from the outside in on event firing

    handler = layers.main(handler);

    if(typeof handler === 'object'){
        if(typeof handler.handleEvent !== 'object'){
            throw new TypeError(
                handler.handleEvent + ' on ' + handler +
                ' is not a function'
            );
        }

        handler = layers.object(handler);
    }

    //Prefer throttle over debounce
    if(throttle && !(throttle !== throttle)){
        handler = layers.throttle(handler, parseInt(throttle));
    }else
    if(debounce && !(debounce !== debounce)){
        handler = layers.debounce(handler, parseInt(debounce));
    }

    //once runs before async layers,
    //and after sync layers
    if(!!once){
        handler = layers.once(source, handler, info);
    }
    /*
    if(!!info.keys){
        handler = layers.keys(handler, info.keys);
    }*/

    if(typeof delegate === 'string'){
        try{
            document.querySelector(delegate);
        }catch(e){
            throw new Error('delegate selector Error \n'+e.message);
        }
        handler = layers.delegate(handler, delegate);
    }

    return objectAssign(info, {
        handler: handler,
        //Matching properties for removal
        userHandler: userHandler,
        capture: capture,
        delegate: delegate,
        throttle: throttle,
        debounce: debounce
    });
}

function addEvent(source, event){
    source._events[event.name].push(event);
    event.names.forEach(function (name){
        source.element.addEventListener(name, event.handler, event.capture);
    });
}

function removeEvent(source, event){
    if(source._events === void 0) { return; }
    if(source._events[event.name] === void 0) { return; }

    var events = source._events[event.name];

    for(var i=0; i<events.length; i++){
        if(
            events[i].userHandler === event.userHandler &&
            events[i].capture === event.capture &&
            events[i].delegate === event.delegate &&
            events[i].throttle === event.throttle &&
            events[i].debounce === event.debounce
        ){
            events[i].names.forEach(function (name){
                source.element.removeEventListener(
                    name, event.handler, event.capture);
            });

            source._events[event.name].splice(i, 1);
            if(!source._events[event.name].length){
                delete source._events[event.name];
            }
            return;
        }
    }
}

function trigger(source, event){
    source.element.dispatchEvent(event);
}

var props = {
    _delegated: [],
    on: function on(name, delegate, listener, options){
        var info = getEventInfo.apply(null, arguments);
        registerEvent(this, name);
        addEvent(this, info);
        return this;
    },
    off: function off(name, delegate, listener, options){
        var info = getEventInfo.apply(null, arguments);
        removeEvent(this, info);
        return this;
    },
    once: function once(name, delegate, listener, options){
        if(typeof delegate === 'function'){
            listener = delegate;
            options = listener;
        }
        options = options || {};
        options.once = true;
        var info = getEventInfo.call(this, name, delegate, listener, options);
        registerEvent(this, name);
        addEvent(this, info);
        return this;
    },
    trigger: function trigger$1(event){
        trigger(this, event);
        return this;
    },
    matches: function matches$1(selector){
        return matches(this.element, selector);
    },
    observe: function observe(event){
        //This is here to remind us that native observables
        //are on the horizon.
        /*
        return new Observable(observer=>{
            //using events from this prototype
            //emit the observable value
        });
        */
    }
};

function mixin(dest){
    objectAssign(dest, props);
    return dest;
}

function mixinDOMEvents(dest){
    return mixin(dest);
}

exports.mixin = mixin;
exports.mixinDOMEvents = mixinDOMEvents;
exports.props = props;

}((this.domEventsMixin = this.domEventsMixin || {})));
//# sourceMappingURL=dom-events-mixin.js.map
