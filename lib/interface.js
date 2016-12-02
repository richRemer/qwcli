const State = require("./state");
const ParseError = require("./parse-error");

const bindings$key = Symbol("Interface.bindings$key");
const handlers$key = Symbol("Interface.handlers$key");

/**
 * Command-line interface.
 * @constructor
 */
function Interface() {
    this[bindings$key] = {};
    this[handlers$key] = {};
}

Interface.bindings$key = bindings$key;
Interface.handlers$key = handlers$key;

/**
 * Bind to a handler.
 * @param {string|string[]} key
 * @param {function} handler
 * @returns {Binding}
 */
Interface.prototype.bind = function(key, handler) {
    if (typeof key === "string") key = [key];

    var binding = Symbol();

    key.forEach(key => {
        if (key in this[bindings$key]) {
            throw new Error(`cannot rebind ${key}`);
        } else {
            this[bindings$key][key] = binding;
        }
    });

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
                    msg = `${ctx} expects ${num} arg${p}; got ${result.length}`;
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
