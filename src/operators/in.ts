import ComparisonOperator from "../types/comparison-operator";
import ExpressionContext from "../types/expression-context";
const some = require("lodash/some");

const _in: ComparisonOperator = {
    evaluate<T>(value: any, conditionValue: string, tokens: string[], context: ExpressionContext<T>): boolean {
        const values = conditionValue.split(',').map(val => val.trim());
        return some(values, (val: any) => val == value);
    },
    isSymbol: false,
    regex: '\\sIN\\s'
};

export default _in;