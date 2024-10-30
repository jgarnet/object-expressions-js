import BaseExpressionEvaluator from "./index";
const expression = process.argv[2];
const object = JSON.parse(process.argv[3]);

const evaluator = new BaseExpressionEvaluator();

console.log(evaluator.evaluate({ expression, object }));