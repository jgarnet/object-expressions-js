import Operator from "../types/operator";
import ExpressionContext from "../types/expression-context";
const _has = require("lodash/has");

const has: Operator = {
    evaluate<T>(value: any, conditionValue: string, tokens: string[], context: ExpressionContext<T>): boolean {
        const [operandA] = tokens;
        if (operandA === '$') {
            return _has(context.object, conditionValue);
        }
        return _has(value, conditionValue);
    },
    isSymbol: false,
    regex: 'HAS'
};

export default has;