const head = require("./sentinel").head;
const lead = require("./sentinel").lead;
const rest = require("./sentinel").rest;
const State = require("./state")
const ParseError = require("./parse-error");

const head$key = Symbol("Interface.head$key");
const lead$key = Symbol("Interface.lead$key");
const rest$key = Symbol("Interface.rest$key");
const bindings$key = Symbol("Interface.bindings$key");
const handlers$key = Symbol("Interface.handlers$key");

/**
 * Command-line interface.
 * @constructor
 */
function Interface() {
    this[bindings$key] = {};
    this[handlers$key] = {};
    this[head$key] = null;
    this[lead$key] = null;
    this[rest$key] = null;
}

Interface.head$key = head$key;
Interface.lead$key = lead$key;
Interface.rest$key = rest$key;
Interface.bindings$key = bindings$key;
Interface.handlers$key = handlers$key;

/**
 * Bind to a handler.
 * @param {string|string[]|sentinel.head|sentinel.lead|sentinel.rest} key
 * @param {function} handler
 * @returns {Binding}
 */
Interface.prototype.bind = function(key, handler) {
    if (typeof key === "string") key = [key];

    var binding = Symbol();

    switch (key) {
        case head:
            if (this[head$key]) throw new Error(`cannot rebind head arguments`);
            this[head$key] = binding;
            break;
        case lead:
            if (this[lead$key]) throw new Error(`cannot rebind lead arguments`);
            this[lead$key] = binding;
            break;
        case rest:
            if (this[rest$key]) throw new Error(`cannot rebind rest arguments`);
            this[rest$key] = binding;
            break;
        default:
            key.forEach(key => {
                if (key in this[bindings$key]) {
                    throw new Error(`cannot rebind ${key}`);
                }
                this[bindings$key][key] = binding;
            });
    }

    this[handlers$key][binding] = handler;
    return binding;
};

/**
 * Return binding which is bound to the key.
 * @param {string|sentinel.head|sentinel.rest} key
 * @returns {Binding}
 */
Interface.prototype.bound = function(key) {
    if (key === head) return this[head$key];
    if (key === lead) return this[lead$key];
    if (key === rest) return this[rest$key];
    return this[bindings$key][key];
};

/**
 * Return handler for a binding.
 * @param {Binding} binding
 * @returns {function}
 */
Interface.prototype.handler = function(binding) {
    return this[handlers$key][binding];
};

/**
 * Create argument parser for this interface.
 * @returns {function}
 */
Interface.prototype.parser = function() {
    return args => {
        var s = State.init(this, args),
            bnd, hnd, params;

        if ((bnd = this.bound(head))) {
            hnd = this.handler(bnd);
            params = shift(hnd.length, head);
            hnd.apply(this, params);
        }

        while ((bnd = this.bound(s.curr))) {
            s = s.shift();
            hnd = this.handler(bnd);
            params = shift(hnd.length, s.behind[0]);
            hnd.apply(this, params);
        }

        if ((bnd = this.bound(lead))) {
            hnd = this.handler(bnd);
            params = shift(hnd.length, lead);
            hnd.apply(this, params);
        }

        if ((bnd = this.bound(rest))) {
            hnd = this.handler(bnd);
            params = shift(s.ahead.length, rest);
            hnd(params);
        }

        return s.rest();

        function shift(num, ctx) {
            var result = [],
                msg, p;

            while (result.length < num) {
                if (!s.ahead.length) {
                    p = num === 1 ? "" : "s";
                    msg = typeof ctx === "string" ? `${ctx} ` : "";
                    msg += `expects ${num} arg${p}`;
                    msg += `; got ${result.length}`;
                    throw ParseError.noarg(msg, s);
                }

                result.push(s.curr);
                s = s.shift();
            }

            return result;
        }
    };
};

module.exports = Interface;
