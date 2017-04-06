Example
=======
```js
const CLI = require("qwcli");
const assign = Object.assign;

var cli = CLI(),
    opts = {cmd: "", cmdopts: [], verbosity: 0, logfile: ""},
    parser, args;

cli.bind(CLI.head, (node, script) => assign(opts, {node:node, script:script}));
cli.bind(["-v", "--verbose"], () => opts.verbosity++);
cli.bind(["-L", "--log"], file => opts.logfile = file);
cli.bind(CLI.lead, cmd => opts.cmd = cmd);
cli.bind(CLI.rest, opts => opts.cmdopts = opts);

parse = cli.parser();
args = parse(["/bin/node", "script.js", "-v", "--log", "my.log", "apple", "foo");

assert(opts.node === "/bin/node");
assert(opts.script === "script.js");
assert(opts.verbosity === 1);
assert(opts.logfile === "my.log");
assert(opts.cmd = "apple");
assert(opts.cmdopts[0] === "foo");
```

Things To Ponder
================
```sh
cmd -v foo -v           # different -v options
cmd --help foo --help   # same --help option
```
