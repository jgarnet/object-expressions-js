import ComparisonOperator from "../types/comparison-operator";
import ExpressionContext from "../types/expression-context";
const _has = require("lodash/has");

const has: ComparisonOperator = {
    evaluate<T>(value: any, conditionValue: any, tokens: string[], context: ExpressionContext<T>): boolean {
        const [operandA] = tokens;
        if (operandA === '$') {
            return _has(context.object, conditionValue);
        }
        return _has(value, conditionValue);
    },
    isSymbol: false,
    regex: '\\sHAS\\s'
};

export default has;