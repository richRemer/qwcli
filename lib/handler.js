const stateful = require("./sentinel").stateful;

/**
 * Create a qwcli-aware handler.  This will tell the parser to pass the parse
 * state as the first argument.
 * @param {function} fn
 * @returns {Handler}
 */
function handler(fn) {
    function handler() {
        fn.apply(this, arguments);
    }

    // this magic is used by the parser to properly extract arguments
    Object.defineProperty(handler, "length", {value: fn.length});
    handler[stateful] = true;

    return handler;
}

module.exports = handler;
