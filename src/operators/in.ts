import Operator from "../types/operator";
import ExpressionContext from "../types/expression-context";
const some = require("lodash/some");

const _in: Operator = {
    evaluate<T>(value: any, conditionValue: string, tokens: string[], context: ExpressionContext<T>): boolean {
        const values = conditionValue.split(',').map(val => val.trim());
        return some(values, (val: any) => val == value);
    },
    isSymbol: false,
    regex: 'IN'
};

export default _in;