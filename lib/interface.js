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
 * Bind option to handler.
 * @param {string} option
 * @param {function} handler
 * @returns {Binding}
 */
Interface.prototype.bind = function(option, handler) {
    var id = Symbol();

    if (option in this[bindings$key]) {
        throw new Error(`cannot rebind ${option}`);
    }

    this[bindings$key][option] = id;
    this[handlers$key][id] = handler;
    return id;
};

/**
 * Create argument parser for this interface.
 * @returns {function}
 */
Interface.prototype.parser = function() {
    return args => {
        args = args.slice();

        var cli = this,
            index = 0,
            optname, optval, bnd, hnd;

        while (!eoa() && (bnd = find())) {
            shift();
            hnd = handler(bnd);
            hnd.apply(cli, shiftn(hnd.length));
        }

        return args.slice(index);

        /////////////////////////////////////////////

        // () => boolean: true at end of arguments
        function eoa() {
            return index === args.length;
        }

        // () => string: current argument
        function curr() {
            return args[index];
        }

        // () => Binding[]: bindings defined
        function binds() {
            return Object.getOwnPropertySymbols(cli[handlers$key]);
        }

        // () => Binding: find matching binding
        function find() {
            var arg = curr();

            return binds().find(b => {
                return cli[bindings$key][arg] === b;
            });
        }

        // () => string: shift an argument
        function shift() {
            return args[index++];
        }

        // number => string[]: shift a number of arguments
        function shiftn(n) {
            var args = [], i = 0;
            while (i++ < n) args.push(shift());
            return args;
        }

        // Binding => function: lookup handler for binding
        function handler(b) {
            return cli[handlers$key][b];
        }
    };
};

module.exports = Interface;
