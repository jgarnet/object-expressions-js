import ExpressionEvaluator from "./expression-evaluator";
import ConditionEvaluator from "./types/condition-evaluator";

// const conditionEvaluator: ConditionEvaluator = {
//     evaluate: (token, object) => {
//         console.log(token);
//         const parts = token.split(" ");
//         switch (parts[1]) {
//             case '=':
//                 return parts[0] === parts[2];
//             case '>':
//                 return parts[0] > parts[2];
//             case '<':
//                 return parts[0] < parts[2];
//
//         }
//         return false;
//     }
// };
// const expressionEvaluator = new ExpressionEvaluator(conditionEvaluator);
//
// console.log(expressionEvaluator.evaluate(process.argv[2], {}));

export { ExpressionEvaluator, ConditionEvaluator };