/**
 * Command-line interface.
 * @constructor
 */
function Interface() {
}

/**
 * Create argument parser for this interface.
 * @returns {function}
 */
Interface.prototype.parser = function() {
    return args => {
        return args.slice();
    };
};

module.exports = Interface;
