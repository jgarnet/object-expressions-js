import ComparisonOperator from "../types/comparison-operator";
import ExpressionContext from "../types/expression-context";
const some = require("lodash/some");
const isArray = require("lodash/isArray");
const isSet = require("lodash/isSet");

const _in: ComparisonOperator = {
    evaluate<T>(value: any, conditionValue: any, tokens: string[], context: ExpressionContext<T>): boolean {
        if (isSet(conditionValue)) {
            return conditionValue.has(value);
        }
        const values = isArray(conditionValue) ? conditionValue : conditionValue.split(',').map((val: any) => val.trim());
        return some(values, (val: any) => val == value);
    },
    isSymbol: false,
    regex: '\\sIN\\s'
};

export default _in;