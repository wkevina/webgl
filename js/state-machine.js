class StateStack {
    constructor() {
        this.states = [];
    }

    replace(next) {
        const leaving = this.states.shift();
        if (leaving) {
            leaving.exit(next);
        }
        this.states.unshift(next)
        next.enter(leaving || null);
    }

    push(next) {
        const leaving = this.states[0] || null;
        this.states.unshift(next);
        if (leaving) {
            leaving.exit(next);
        }
        if (next) {
            next.enter(leaving);
        }
    }

    pop() {
        const leaving = this.states.shift() || null;
        const next = this.states[0] || null;
        if (leaving) {
            leaving.exit(next);
        }
        if (next) {
            next.enter(leaving);
        }
    }

    top() {
        return this.states[0] || null;
    }
}

class StateGroup {
    constructor(states, context) {
        this.states = states;
        this.context = context;
    }

    enter(last) {
        this.states.forEach(state => state.enter(last, this.context));
    }

    exit(next) {
        this.states.forEach(state => state.exit(next, this.context));
    }

    first() {
        return this.states[0];
    }
}

class State {
    enter(last) {

    }

    exit(next) {

    }
}

export {State, StateStack, StateGroup};
