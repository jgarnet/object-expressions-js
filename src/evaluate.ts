import BaseExpressionEvaluator from "./index";
const expression = process.argv[2];
const object = JSON.parse(process.argv[3]);

const evaluator = new BaseExpressionEvaluator();

const red = '\x1b[31m';
const green = '\x1b[32m';
const blue = '\x1b[34m';
const reset = '\x1b[0m';

console.log('Evaluating expression: ' + blue + expression);
const result = evaluator.evaluate({ expression, object });
console.log(reset + 'Result: ' + (result ? green : red) + result + reset);