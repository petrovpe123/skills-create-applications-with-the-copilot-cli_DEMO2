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

test('CLI calculates all four operations using names and symbols', () => {
  for (const [name, symbol, left, right, expected] of [
    ['add', '+', 2, 3, 5],
    ['subtract', '-', 10, 4, 6],
    ['multiply', '*', 45, 2, 90],
    ['divide', '/', 20, 5, 4],
  ]) {
    for (const operation of [name, symbol]) {
      const result = run(operation, String(left), String(right));
      assert.equal(result.status, 0, result.stderr);
      assert.equal(result.stdout.trim(), String(expected));
    }
  }
});

test('rejects unsupported operations and invalid operands', () => {
  assert.throws(() => calculate('modulo', 5, 2), /Unsupported operation/);
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
    [['power', '2', '3'], /Unsupported operation/],
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
