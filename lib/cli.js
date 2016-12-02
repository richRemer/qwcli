const Interface = require("./interface");
const term = require("./sentinel").term;

/**
 * Create default command-line interface.
 * @returns {Interface}
 */
function cli() {
    var cli = new Interface();

    cli.bind("--", () => term);
    return cli;
}

module.exports = cli;
