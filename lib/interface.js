const head = require("./sentinel").head;
const lead = require("./sentinel").lead;
const rest = require("./sentinel").rest;
const term = require("./sentinel").term;
const stateful = require("./sentinel").stateful;
const State = require("./state");
const ParseError = require("./parse-error");

const handlers$key = Symbol("Interface.handlers$key");
const bindings$key = Symbol("Interface.bindings$key");
const patterns$key = Symbol("Interface.patterns$key");
const head$key = Symbol("Interface.head$key");
const lead$key = Symbol("Interface.lead$key");
const rest$key = Symbol("Interface.rest$key");

/**
 * Command-line interface.
 * @constructor
 */
function Interface() {
    this[handlers$key] = {};
    this[bindings$key] = {};
    this[patterns$key] = new Set();
    this[head$key] = null;
    this[lead$key] = null;
    this[rest$key] = null;
}

Interface.handlers$key = handlers$key;
Interface.bindings$key = bindings$key;
Interface.patterns$key = patterns$key;
Interface.head$key = head$key;
Interface.lead$key = lead$key;
Interface.rest$key = rest$key;

/**
 * Bind to a handler.
 * @param {string|string[]|RegExp|sentinel.head|sentinel.lead|sentinel.rest} key
 * @param {function} handler
 * @returns {Binding}
 */
Interface.prototype.bind = function(key, handler) {
    if (typeof key === "string") key = [key];

    var binding = Symbol(),
        orig;

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
        if (key instanceof RegExp) {
            this[patterns$key].add([key, binding]);
            orig = handler;
            handler = function(state) {
                var m = key.exec(state.curr),
                    args = m.slice(1, orig.length+1).concat(state);
                return orig.apply(this, args);
            };
            handler[stateful] = true;
        } else if (key instanceof Array) {
            key.forEach(key => {
                if (key in this[bindings$key]) {
                    throw new Error(`cannot rebind ${key}`);
                }
                this[bindings$key][key] = binding;
            });
        } else {
            throw new Error(`invalid bind key ${key}`);
        }
    }

    this[handlers$key][binding] = handler;
    return binding;
};

/**
 * Return binding which is bound to the key.
 * @param {string|sentinel.head|sentinel.lead|sentinel.rest} key
 * @returns {Binding}
 */
Interface.prototype.bound = function(key) {
    var patte, pattk, patt, binding;

    if (key === head) return this[head$key];
    if (key === lead) return this[lead$key];
    if (key === rest) return this[rest$key];
    if (key in this[bindings$key]) return this[bindings$key][key];

    for (patte of this[patterns$key].entries()) {
        pattk = patte[0];
        patt = pattk[0];
        binding = pattk[1];

        if (patt.test(key)) return binding;
    }
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
            bnd, hnd, params, ret, before;

        if ((bnd = s.cli.bound(head))) {
            hnd = s.cli.handler(bnd);
            params = shift(hnd.length, head);
            hnd.apply(s.cli, params);
        }

        while ((bnd = s.cli.bound(s.curr))) {
            before = s;
            s = s.shift();
            hnd = s.cli.handler(bnd);

            params = hnd[stateful]
                ? shift(hnd.length-1, s.behind[0]).concat(before)
                : shift(hnd.length, s.behind[0]);
            ret = hnd.apply(s.cli, params);

            if (ret === term) break;
            if (ret instanceof State) s = ret;
        }

        if ((bnd = s.cli.bound(lead))) {
            hnd = s.cli.handler(bnd);
            params = shift(hnd.length, lead);
            hnd.apply(s.cli, params);
        }

        if ((bnd = s.cli.bound(rest))) {
            hnd = s.cli.handler(bnd);
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
