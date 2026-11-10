#!/usr/bin/env node
'use strict';

// Supports addition (+), subtraction (-), multiplication (*), and division (/).
function calculate(operation, left, right) {
  if (!Number.isFinite(left) || !Number.isFinite(right)) {
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
    default:
      throw new Error('Unsupported operation. Use add, subtract, multiply, or divide.');
  }
}

const usage = [
  'Usage: node src\\calculator.js <operation> <number> <number>',
  'Operations: add (+), subtract (-), multiply (*), divide (/)',
  'Example: node src\\calculator.js add 2 3',
  'Quote "*" when using the multiplication symbol in a shell.',
].join('\n');

if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 1 && (args[0] === '--help' || args[0] === '-h')) {
    console.log(usage);
  } else {
    try {
      if (args.length !== 3) {
        throw new Error(usage);
      }

      const [operation, left, right] = args;
      if (left.trim() === '' || right.trim() === '') {
        throw new Error('Both operands must be finite numbers.');
      }

      console.log(calculate(operation, Number(left), Number(right)));
    } catch (error) {
      console.error(`Error: ${error.message}`);
      process.exitCode = 1;
    }
  }
}

module.exports = { calculate };
