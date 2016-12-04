const Interface = require("./interface");
const term = require("./sentinel").term;

const longval = /^(--[a-z][-a-z0-9_]*)=(.*)$/i;

/**
 * Create default command-line interface.
 * @returns {Interface}
 */
function cli() {
    var cli = new Interface();

    cli.bind("--", () => term);
    cli.bind(longval, (n, v, state) => state.expand([n, v]));
    return cli;
}

module.exports = cli;
