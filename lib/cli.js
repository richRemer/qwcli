const Interface = require("./interface");
const ParseError = require("./parse-error");
const term = require("./sentinel").term;

const longval = /^(--[a-z][-a-z0-9_]*)=(.*)$/i;
const shortval = /^-([a-z0-9]{2,})(.*)$/i;

/**
 * Create default command-line interface.
 * @returns {Interface}
 */
function cli() {
    var cli = new Interface();

    cli.bind("--", () => term);
    cli.bind(longval, (n, v, state) => state.expand([n, v]));

    cli.bind(shortval, (chars, arg, state) => {
        var opt, bnd, val, msg, i,
            expanded = [];

        for (i = 0; i < chars.length; i++) {
            opt = "-" + chars[i];
            val = chars.slice(i+1) + arg;

            if ((bnd = state.cli.bound(opt))) {
                if (state.cli.handler(bnd).length && val) {
                    expanded = expanded.concat([opt, val]);
                    arg = "";
                    break;
                } else {
                    expanded.push(opt);
                }
            } else {
                i = expanded.length;
                expanded = expanded.concat(opt);

                if (val && val !== arg) expanded = expanded.concat(`-${val}`);
                else if (arg) expanded = expanded.concat(arg);

                state = state.expand(expanded);
                while (i--) state = state.shift();
                throw ParseError.noopt(state);
            }
        }

        if (arg) expanded.push(arg);
        return state.expand(expanded);
    });

    return cli;
}

module.exports = cli;
