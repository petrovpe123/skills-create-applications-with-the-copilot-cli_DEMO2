'use strict';

const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const { test } = require('node:test');
const { calculate } = require('../calculator');

const calculatorPath = path.join(__dirname, '..', 'calculator.js');
const run = (...args) => spawnSync(process.execPath, [calculatorPath, ...args], {
  encoding: 'utf8',
});

test('addition: 2 + 3 = 5', () => {
  assert.equal(calculate('add', 2, 3), 5);
  assert.equal(calculate('+', 2, 3), 5);
});

test('addition handles negative numbers, decimals, and zero', () => {
  assert.equal(calculate('add', -2, 3), 1);
  assert.equal(calculate('+', 1.5, 2.25), 3.75);
  assert.equal(calculate('add', 0, 0), 0);
});

test('subtraction: 10 - 4 = 6', () => {
  assert.equal(calculate('subtract', 10, 4), 6);
  assert.equal(calculate('-', 10, 4), 6);
});

test('subtraction handles negative results, decimals, and zero', () => {
  assert.equal(calculate('subtract', 4, 10), -6);
  assert.equal(calculate('-', 2.5, 0.75), 1.75);
  assert.equal(calculate('subtract', 0, -4), 4);
});

test('multiplication: 45 * 2 = 90', () => {
  assert.equal(calculate('multiply', 45, 2), 90);
  assert.equal(calculate('*', 45, 2), 90);
});

test('multiplication handles negative numbers, decimals, and zero', () => {
  assert.equal(calculate('multiply', -3, 4), -12);
  assert.equal(calculate('*', 1.5, 2.5), 3.75);
  assert.equal(calculate('multiply', 45, 0), 0);
});

test('division: 20 / 5 = 4', () => {
  assert.equal(calculate('divide', 20, 5), 4);
  assert.equal(calculate('/', 20, 5), 4);
});

test('division handles fractional results and rejects positive and negative zero divisors', () => {
  assert.equal(calculate('divide', -7, 2), -3.5);
  assert.equal(calculate('/', 0, 5), 0);
  assert.throws(() => calculate('divide', 20, 0), /Cannot divide by zero/);
  assert.throws(() => calculate('/', 20, -0), /Cannot divide by zero/);
});

test('modulo: 5 % 2 = 1 and rejects a zero divisor', () => {
  assert.equal(calculate('modulo', 5, 2), 1);
  assert.equal(calculate('%', -5, 2), -1);
  assert.throws(() => calculate('modulo', 5, 0), /modulo by zero/);
});

test('power: 2 ^ 3 = 8 and rejects non-finite results', () => {
  assert.equal(calculate('power', 2, 3), 8);
  assert.equal(calculate('^', -2, 3), -8);
  assert.equal(calculate('power', 2, -2), 0.25);
  assert.throws(() => calculate('^', -2, 0.5), /finite number/);
});

test('square root: sqrt(16) = 4 and rejects negative inputs', () => {
  assert.equal(calculate('sqrt', 16), 4);
  assert.equal(calculate('√', 0), 0);
  assert.throws(() => calculate('sqrt', -1), /negative number/);
});

test('log returns the natural logarithm and rejects non-positive inputs', () => {
  assert.equal(calculate('log', Math.E), 1);
  assert.equal(calculate('log', 1), 0);
  assert.throws(() => calculate('log', 0), /non-positive number/);
  assert.throws(() => calculate('log', -1), /non-positive number/);
});

test('CLI calculates operations using names and symbols', () => {
  for (const [name, symbol, left, right, expected] of [
    ['add', '+', 2, 3, 5],
    ['subtract', '-', 10, 4, 6],
    ['multiply', '*', 45, 2, 90],
    ['divide', '/', 20, 5, 4],
    ['modulo', '%', 5, 2, 1],
    ['power', '^', 2, 3, 8],
  ]) {
    for (const operation of [name, symbol]) {
      const result = run(operation, String(left), String(right));
      assert.equal(result.status, 0, result.stderr);
      assert.equal(result.stdout.trim(), String(expected));
    }
  }

  for (const [operation, operand, expected] of [
    ['sqrt', 16, 4],
    ['√', 16, 4],
    ['log', Math.E, 1],
  ]) {
    const result = run(operation, String(operand));
    assert.equal(result.status, 0, result.stderr);
    assert.equal(Number(result.stdout.trim()), expected);
  }
});

test('rejects unsupported operations and invalid operands', () => {
  assert.throws(() => calculate('unknown', 5, 2), /Unsupported operation/);
  for (const value of [NaN, Infinity, -Infinity, '2', undefined]) {
    assert.throws(() => calculate('add', value, 1), /finite numbers/);
    assert.throws(() => calculate('add', 1, value), /finite numbers/);
  }
});

test('CLI reports invalid input on stderr with a failing exit status', () => {
  for (const [args, message] of [
    [[], /Usage:/],
    [['add', '1'], /Usage:/],
    [['add', '1', '2', '3'], /Usage:/],
    [['add', '', '2'], /finite numbers/],
    [['add', ' ', '2'], /finite numbers/],
    [['add', 'abc', '2'], /finite numbers/],
    [['add', '2', 'Infinity'], /finite numbers/],
    [['divide', '8', '0'], /divide by zero/],
    [['unknown', '2', '3'], /Unsupported operation/],
    [['modulo', '8', '0'], /modulo by zero/],
    [['sqrt', '-1'], /negative number/],
    [['sqrt', 'abc'], /finite number/],
    [['log', '0'], /non-positive number/],
    [['power', '2'], /Usage:/],
    [['sqrt', '16', '2'], /Usage:/],
  ]) {
    const result = run(...args);
    assert.equal(result.status, 1);
    assert.equal(result.stdout, '');
    assert.match(result.stderr, message);
  }
});

test('CLI displays usage when help is requested', () => {
  for (const flag of ['--help', '-h']) {
    const result = run(flag);
    assert.equal(result.status, 0);
    assert.match(result.stdout, /Usage:/);
    assert.equal(result.stderr, '');
  }
});
