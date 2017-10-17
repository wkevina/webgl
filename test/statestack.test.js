import {State, StateStack} from 'state-machine.js'

class TestState extends State {
    constructor() {
        super();
        this.enter = sinon.spy();
        this.exit = sinon.spy();
    }
}

describe('StateStack', function() {
    let stack = new StateStack();

    beforeEach(function() {
        stack = new StateStack();
    });

    describe('#push', function() {
        let newState;

        beforeEach(function() {
            newState = new TestState();
            stack.push(newState);
        });

        it("should push the stack", function() {
            stack.top().should.equal(newState);
        });

        it("calls enter on incoming state", function() {
            newState.enter.called.should.be.true;
        });

        describe("with a non-empty stack", function() {
            it("calls exit on top of stack", function() {
                newState.exit.called.should.be.false;
                stack.push(new TestState());
                newState.exit.called.should.be.true;
            });
        });
    });

    describe('#replace', function() {
        describe('with a non-empty stack', function() {
            it('should replace top', function() {
                stack.push(new TestState());
                const newState = new TestState();
                stack.top().should.not.equal(newState);
                stack.replace(newState);
                stack.top().should.equal(newState);
            });

            it('calls exit on top', function() {
                const newState = new TestState();

                stack.replace(newState);
                stack.replace(new TestState());

                newState.exit.called.should.be.true;
            });
        });

        it('should replace top', function() {
            const newState = new TestState();
            should.not.exist(stack.top());
            stack.replace(newState);
            stack.top().should.equal(newState);
        });

        it('calls enter on incoming state', function() {
            const newState = new TestState();
            stack.replace(newState);
            newState.enter.called.should.be.true;
        });
    });
});
