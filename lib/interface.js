const State = require("./state");
const ParseError = require("./parse-error");

const head = Symbol("Interface.head");
const head$key = Symbol("Interface.head$key");
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
}

Interface.head = head;
Interface.head$key = head$key;
Interface.bindings$key = bindings$key;
Interface.handlers$key = handlers$key;

/**
 * Bind to a handler.
 * @param {string|string[]|Interface.head} key
 * @param {function} handler
 * @returns {Binding}
 */
Interface.prototype.bind = function(key, handler) {
    if (typeof key === "string") key = [key];

    var binding = Symbol();

    if (key === head) {
        if (this[head$key]) {
            throw new Error(`cannot rebind to head arguments`);
        } else {
            this[head$key] = binding;
        }
    } else {
        key.forEach(key => {
            if (key in this[bindings$key]) {
                throw new Error(`cannot rebind ${key}`);
            } else {
                this[bindings$key][key] = binding;
            }
        });
    }

    this[handlers$key][binding] = handler;
    return binding;
};

/**
 * Return binding for an option.
 * @param {string} option
 * @returns {Binding}
 */
Interface.prototype.bound = function(option) {
    return this[bindings$key][option];
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

        if ((bnd = this[head$key])) {
            hnd = this.handler(bnd);
            params = shift(hnd.length, head);
            hnd.apply(this, params);
        }

        while (!s.parsed()) {
            if ((bnd = this.bound(s.curr))) {
                s = s.shift();
                hnd = this.handler(bnd);
                params = shift(hnd.length, s.behind[0]);
                hnd.apply(this, params);
            } else {
                break;
            }
        }

        return s.rest();

        function shift(num, ctx) {
            var result = [],
                msg, p;

            while (result.length < num) {
                if (!s.ahead.length) {
                    p = num !== 1 ? "s" : "";
                    msg = typeof ctx === "string" ? `${ctx} ` : "";
                    msg += `expects ${num} arg${p}`;
                    msg += ctx === head ? " before any options" : "";
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
