import sinon from 'sinon/lib/sinon.js';
import * as chai from 'chai';

mocha.setup('bdd');

const target = window ? window : global;

target.should = chai.should();
target.sinon = sinon;
