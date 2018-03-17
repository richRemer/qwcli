const {defineProperties} = Object;
const expect = require("expect.js");
const sinon = require("sinon");
const CLI = require("..");

describe("Interface", () => {
	var cli;

	beforeEach(() => {
		cli = new CLI.Interface();
	});

	describe("#parser()", () => {
		it("should return a parse function", () => {
			expect(cli.parser()).to.be.a("function");
		});
	});

	describe("#parser() => function(array)", () => {
		it("should return unparsed arguments", () => {
			const parse = cli.parser();
			const args = ["foo", "bar"];
			const result = parse(args);

			expect(result).to.not.be(args);
			expect(result).to.be.an("array");
			expect(result.length).to.be(2);
			expect(result[0]).to.be("foo");
			expect(result[1]).to.be("bar");
		});
	});

	describe("#bind(string, function)", () => {
		it("should return binding symbol", () => {
			const spy = sinon.spy();
			expect(typeof cli.bind("foo", spy)).to.be("symbol");
		});

		it("should bind option to handler", () => {
			const spy = sinon.spy();

			cli.bind("foo", spy);
			cli.parser()(["foo"]);

			expect(spy.called).to.be(true);
		});

		it("should pass positional arguments to handler", () => {
			const spy = defineProperties(sinon.spy(), {length: {value: 2}});

			cli.bind("foo", spy);
			const argv = cli.parser()(["foo", "bar", "baz", "bang"]);

			expect(spy.called).to.be(true);
			expect(spy.calledWith("bar", "baz")).to.be(true);
			expect(argv.length).to.be(1);
			expect(argv[0]).to.be("bang");
		});

		it("should error on attempt to set option twice", () => {
			const spy = sinon.spy();

			cli.bind("foo", spy);
			expect(() => cli.bind("foo", spy)).to.throwError();
		});
	});

	describe("#bind(string[], function)", () => {
		it("should return binding symbol", () => {
			const spy = sinon.spy();
			expect(typeof cli.bind(["foo"], spy)).to.be("symbol");
		});

		it("should bind option aliases to handler", () => {
			const spy = sinon.spy();

			cli.bind(["foo", "bar"], spy);
			cli.parser()(["bar"]);

			expect(spy.called).to.be(true);
		});

		it("should pass positional arguments to handler", () => {
			const spy = defineProperties(sinon.spy(), {length: {value: 2}});

			cli.bind(["foo", "bar"], spy);
			const argv = cli.parser()(["bar", "foo", "baz", "bang"]);

			expect(spy.called).to.be(true);
			expect(spy.calledWith("foo", "baz")).to.be(true);
			expect(argv.length).to.be(1);
			expect(argv[0]).to.be("bang");
		});

		it("should error on attempt to set option twice", () => {
			const spy = sinon.spy();

			cli.bind(["foo", "bar"], spy);
			expect(() => cli.bind("foo", spy)).to.throwError();
			expect(() => cli.bind("bar", spy)).to.throwError();
		});
	});

	describe("#bind(qwcli.head, function)", () => {
		it("should return binding symbol", () => {
			const spy = sinon.spy();
			expect(typeof cli.bind(CLI.head, spy)).to.be("symbol");
		});

		it("should bind positional arguments to handler", () => {
			const spy = defineProperties(sinon.spy(), {length: {value: 2}});

			cli.bind(CLI.head, spy);
			const argv = cli.parser()(["baz", "bang", "biff"]);

			expect(spy.called).to.be(true);
			expect(spy.calledWith("baz", "bang")).to.be(true);
			expect(argv.length).to.be(1);
			expect(argv[0]).to.be("biff");
		});

		it("should bind positional arguments before options", () => {
			const headspy = defineProperties(sinon.spy(), {length: {value: 1}});
			const foospy = sinon.spy();
			const barspy = sinon.spy();

			cli.bind(CLI.head, headspy);
			cli.bind("foo", foospy);
			cli.bind("bar", barspy);
			const argv = cli.parser()(["foo", "bar", "baz"]);

			expect(headspy.called).to.be(true);
			expect(headspy.calledWith("foo")).to.be(true);
			expect(foospy.called).to.be(false);
			expect(barspy.called).to.be(true);
			expect(argv.length).to.be(1);
			expect(argv[0]).to.be("baz");
		});

		it("should error on attempt to set head twice", () => {
			const spy = defineProperties(sinon.spy(), {length: {value: 1}});

			cli.bind(CLI.head, spy);
			expect(() => cli.bind(CLI.head, spy)).to.throwError();
		});
	});

	describe("#bind(qwcli.lead, function)", () => {
		it("should return binding symbol", () => {
			const spy = sinon.spy();
			expect(typeof cli.bind(CLI.lead, spy)).to.be("symbol");
		});

		it("should bind positional arguments to handler", () => {
			const spy = defineProperties(sinon.spy(), {length: {value: 2}});

			cli.bind(CLI.lead, spy);
			const argv = cli.parser()(["baz", "bang", "biff"]);

			expect(spy.called).to.be(true);
			expect(spy.calledWith("baz", "bang")).to.be(true);
			expect(argv.length).to.be(1);
			expect(argv[0]).to.be("biff");
		});

		it("should bind positional arguments after options", () => {
			const leadspy = defineProperties(sinon.spy(), {length: {value: 1}});
			const foospy = sinon.spy();
			const barspy = sinon.spy();

			cli.bind(CLI.lead, leadspy);
			cli.bind("foo", foospy);
			cli.bind("bar", barspy);
			const argv = cli.parser()(["foo", "bar", "baz"]);

			expect(leadspy.called).to.be(true);
			expect(leadspy.calledWith("baz")).to.be(true);
			expect(foospy.called).to.be(true);
			expect(barspy.called).to.be(true);
			expect(argv.length).to.be(0);
		});

		it("should error on attempt to set lead twice", () => {
			const spy = defineProperties(sinon.spy(), {length: {value: 1}});

			cli.bind(CLI.lead, spy);
			expect(() => cli.bind(CLI.lead, spy)).to.throwError();
		});
	});

	describe("#bind(qwcli.rest, handler)", () => {
		it("should return binding symbol", () => {
			const spy = sinon.spy();
			expect(typeof cli.bind(CLI.rest, spy)).to.be("symbol");
		});

		it("should bind positional arguments to handler", () => {
			const spy = sinon.spy(argv => {
				expect(argv).to.be.an("array");
				expect(argv.length).to.be(2);
				expect(argv[0]).to.be("baz");
				expect(argv[1]).to.be("bang");
			});

			cli.bind(CLI.rest, spy);
			const argv = cli.parser()(["baz", "bang"]);

			expect(spy.called).to.be(true);
		});

		it("should bind positional arguments after lead", () => {
			const leadspy = defineProperties(sinon.spy(), {length: {value: 1}});
			const restspy = sinon.spy(argv => {
				expect(argv.length).to.be(1);
				expect(argv[0]).to.be("bar");
			});

			cli.bind(CLI.lead, leadspy);
			cli.bind(CLI.rest, restspy);
			const argv = cli.parser()(["foo", "bar"]);

			expect(leadspy.called).to.be(true);
			expect(leadspy.calledWith("foo")).to.be(true);
			expect(restspy.called).to.be(true);
		});

		it("should error on attempt to set rest twice", () => {
			const spy = sinon.spy();

			cli.bind(CLI.rest, spy);
			expect(() => cli.bind(CLI.rest, spy)).to.throwError();
		});
	});

	describe("#bind(RegExp, handler)", () => {
		it("should return binding symbol", () => {
			const spy = sinon.spy();
			expect(typeof cli.bind(/./, spy)).to.be("symbol");
		});

		it("should bind matching option to handler", () => {
			const spy = sinon.spy();

			cli.bind(/^f/, spy);
			const argv = cli.parser()(["foo", "fum", "bar"]);

			expect(spy.calledTwice).to.be(true);
			expect(argv.length).to.be(1);
			expect(argv[0]).to.be("bar");
		});

		it("should pass RegExp captures to handler", () => {
			const spy = defineProperties(sinon.spy(), {length: {value: 2}});

			cli.bind(/^(.*):(.*)$/, spy);
			const argv = cli.parser()(["foo:bar"]);

			expect(spy.called).to.be(true);
			expect(spy.calledWith("foo", "bar")).to.be(true);
			expect(spy.firstCall.args.length).to.be(3);
			expect(spy.firstCall.args[2]).to.be.a(CLI.State);
		});

		it("should pass qwcli.State to handler", () => {
			const spy = defineProperties(sinon.spy(), {length: {value: 1}});

			cli.bind(/^(.*):(.*)$/, spy);
			const argv = cli.parser()(["foo:bar"]);

			expect(spy.called).to.be(true);
			expect(spy.calledWith("foo")).to.be(true);
			expect(spy.firstCall.args.length).to.be(2);
			expect(spy.firstCall.args[1]).to.be.a(CLI.State);
		});

		it("should bind with options between head and lead", () => {
			const headspy = defineProperties(sinon.spy(), {length: {value: 1}});
			const leadspy = defineProperties(sinon.spy(), {length: {value: 1}});
			const foospy = sinon.spy();
			const respy = sinon.spy();

			cli.bind(CLI.head, headspy);
			cli.bind(CLI.lead, leadspy);
			cli.bind("foo", foospy);
			cli.bind(/^b/, respy);
			const argv = cli.parser()(["head", "foo", "bar", "foo", "lead"]);

			expect(foospy.calledTwice).to.be(true);
			expect(headspy.calledWith("head")).to.be(true);
			expect(leadspy.calledWith("lead")).to.be(true);
			expect(respy.called).to.be(true);
			expect(argv.length).to.be(0);
		});
	});

	describe("#bound(string)", () => {
		var foo, re;

		beforeEach(() => {
			foo = cli.bind("foo", sinon.spy());
			re = cli.bind(/^b/, sinon.spy());
		});

		it("should return the effective binding symbol for an option", () => {
			expect(cli.bound("foo")).to.be(foo);
			expect(cli.bound("bar")).to.be(re);
		});
	});

	describe("#handler(Binding)", () => {
		var binding, spy;

		beforeEach(() => {
			spy = sinon.spy();
			binding = cli.bind("foo", spy);
		});

		it("should return the handler for a binding", () => {
			expect(cli.handler(binding)).to.be(spy);
		});
	});
});