import ComparisonOperator from "../types/comparison-operator";
import ExpressionContext from "../types/expression-context";
import {unwrapString} from "../_utils";
const _has = require("lodash/has");

const has: ComparisonOperator = {
    evaluate<T>(value: any, conditionValue: any, tokens: string[], context: ExpressionContext<T>): boolean {
        return _has(value, unwrapString(conditionValue));
    },
    isSymbol: false,
    regex: '\\sHAS\\s'
};

export default has;