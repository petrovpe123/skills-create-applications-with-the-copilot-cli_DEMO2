#!/usr/bin/env node
'use strict';

// Supports basic arithmetic, modulo (%), exponentiation (^), and square roots.
function calculate(operation, left, right) {
  const isSquareRoot = operation === 'sqrt' || operation === '√';
  if (!Number.isFinite(left) || (!isSquareRoot && !Number.isFinite(right))) {
    throw new Error('Both operands must be finite numbers.');
  }

  switch (operation) {
    case 'add':
    case '+':
      return left + right;
    case 'subtract':
    case '-':
      return left - right;
    case 'multiply':
    case '*':
      return left * right;
    case 'divide':
    case '/':
      if (right === 0) {
        throw new Error('Cannot divide by zero.');
      }
      return left / right;
    case 'modulo':
    case '%':
      if (right === 0) {
        throw new Error('Cannot calculate modulo by zero.');
      }
      return left % right;
    case 'power':
    case '^': {
      const result = left ** right;
      if (!Number.isFinite(result)) {
        throw new Error('Exponentiation result must be a finite number.');
      }
      return result;
    }
    case 'sqrt':
    case '√':
      if (left < 0) {
        throw new Error('Cannot take the square root of a negative number.');
      }
      return Math.sqrt(left);
    default:
      throw new Error('Unsupported operation. Use add, subtract, multiply, divide, modulo, power, or sqrt.');
  }
}

const usage = [
  'Usage: node src\\calculator.js <operation> <number> [number]',
  'Operations: add (+), subtract (-), multiply (*), divide (/), modulo (%), power (^), sqrt (√)',
  'Example: node src\\calculator.js add 2 3',
  'Example: node src\\calculator.js sqrt 16',
  'Quote "*" when using the multiplication symbol in a shell.',
].join('\n');

if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 1 && (args[0] === '--help' || args[0] === '-h')) {
    console.log(usage);
  } else {
    try {
      const isSquareRoot = args[0] === 'sqrt' || args[0] === '√';
      if (args.length !== (isSquareRoot ? 2 : 3)) {
        throw new Error(usage);
      }

      const [operation, left, right] = args;
      if (left.trim() === '' || (!isSquareRoot && right.trim() === '')) {
        throw new Error('Both operands must be finite numbers.');
      }

      console.log(calculate(operation, Number(left), right === undefined ? undefined : Number(right)));
    } catch (error) {
      console.error(`Error: ${error.message}`);
      process.exitCode = 1;
    }
  }
}

module.exports = { calculate };
