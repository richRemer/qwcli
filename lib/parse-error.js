const ENOARG = Symbol("missing argument");

/**
 * Parse error.
 * @constructor
 * @augments {Error}
 * @param {string} message
 * @param {State} state
 * @param {Symbol} code
 */
function ParseError(message, state, code) {
    var err = new Error(message);
    Object.setPrototypeOf(err, ParseError.prototype);
    
    err.state = state;
    err.code = code;

    return err;
}

ParseError.ENOARG = ENOARG;

/**
 * Generate a parse error with ENOARG code.
 * @param {string} message
 * @param {State} state
 * @returns {ParseError}
 */
ParseError.noarg = function(message, state) {
    var err = new Error(message);
    Object.setPrototypeOf(err, ParseError.prototype);
    
    err.state = state;
    err.code = ENOARG;

    return err;
};

ParseError.prototype = Object.create(Error.prototype, {
    name: {value: ParseError.name, enumerable: false}
});

module.exports = ParseError;
