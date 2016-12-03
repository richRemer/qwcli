const assign = Object.assign;
const freeze = Object.freeze;

/**
 * Parse state.
 * @constructor
 * @param {Interface} cli
 * @param {string[]} args
 */
function State(cli, args) {
    return State.init(cli, args);
}

/**
 * Create initialized state.
 * @param {Interface} cli
 * @param {string[]} args
 * @returns {State}
 */
State.init = function(cli, args) {
    var state = Object.create(State.prototype);

    assign(state, {
        cli: cli,
        index: 0,
        prev: null,
        args: freeze(args.map(String)),
        expand: 0,
        expansion: null
    });

    return freeze(state);
};

Object.defineProperties(State.prototype, {
    /**
     * Current argument.
     * @name State#curr
     * @type {string}
     * @readonly
     */
    curr: {
        configurable: true,
        enumerable: true,
        get: function() {
            return this.args[this.index];
        }
    },

    /**
     * Lookahead.
     * @name State#ahead
     * @type {string[]}
     * @readonly
     */
    ahead: {
        configurable: true,
        enumerable: true,
        get: function() {
            return freeze(this.args.slice(this.index));
        }
    },

    /**
     * Lookbehind.
     * @name State#behind
     * @type {string[]}
     * @readonly
     */
    behind: {
        configurable: true,
        enumerable: true,
        get: function() {
            return freeze(this.args.slice(0, this.index).reverse());
        }
    }
});

/**
 * Update state.
 * @param {object} delta
 * @returns {State}
 */
State.prototype.update = function(delta) {
    var state = Object.create(State.prototype);
    return freeze(assign(state, this, {prev: this}, delta));
};

/**
 * Shift argument.
 * @returns {State}
 */
State.prototype.shift = function() {
    return this.index < this.args.length
        ? this.update({index: this.index + 1})
        : null;
};

/**
 * Expand arguments.
 * @param {number} num
 * @param {string[]} expansion
 * @returns {State}
 */
State.prototype.expand = function(num, expansion) {
    if (this.expanded) 
    var expanded = expansion.concat(num);
};

/**
 * True if parsing has finished.
 * @returns {boolean}
 */
State.prototype.parsed = function() {
    return this.index === this.args.length;
};

/**
 * Return copy of remaining arguments.
 * @returns {string[]}
 */
State.prototype.rest = function() {
    return this.args.slice(this.index);
};

module.exports = State;
