const Interface = require("./interface");

/**
 * Create default command-line interface.
 * @returns {Interface}
 */
function cli() {
    return new Interface();
}

module.exports = cli;
