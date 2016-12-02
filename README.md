Example
=======
```js
const qwcli = require("qwcli");
const CLI = qwcli.Interface;
const assign = Object.assign;

var cli = qwcli(),
    opts = {cmd: undefined, verbosity: 0, logfile: "", debug: false},
    parser, args;

cli.bind(CLI.head, (node, script) => assign(opts, {node:node, script:script}));
cli.bind(["-v", "--verbose"], () => opts.verbosity++);
cli.bind(["-L", "--log"], file => opts.logfile = file);
cli.bind("--debug", () => opts.debug = true);

parse = cli.parser();
args = parse(["/bin/node", "script.js", "-v", "--log", "my.log");
assert(opts.node === "/bin/node");
assert(opts.script === "script.js");
assert(opts.verbosity === 1);
assert(opts.logfile === "my.log");
```

Old Notes
=========
const qwcli = require("qwcli");
const first = qwcli.first;

var opts = {},
    cli;

chain([
    read((node, script) => {opts.node = node; opts.script = script;}),
    
    option(["-v", "--verbose"], opts.verbosity++),
    
])

prefix((node, script) => opts.node = node, opts.script = script, cli);


// launch command
var launch = cli();
launch.first(cmd => opts.cmdname = cmd);
launch.bind(["network"], 

// parser should just run functions and switch states (interfaces)
// should not try to 


```js
const qwcli = require("qwcli");

// add -v|--verbose flag to CLI
function verbosity(cli) {
    var vcli = qwcli.cli();

    vcli.bind(["-v", "--verbose"], () => opts.verbosity++, true);
    vcli.bind(["-q", "--quiet"], () => opts.verbosity--, true);
}
```

cmd -v foo -v           # different -v options
cmd --help foo --help   # same --help option

```js
const qwcli = require("qwcli");

var clihelp = qwcli.cli();


```
