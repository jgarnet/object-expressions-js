import ComparisonOperator from "../types/comparison-operator";
import ExpressionContext from "../types/expression-context";
import {unwrapString} from "../_utils";
const _has = require("lodash/has");

const has: ComparisonOperator = {
    evaluate<T>(leftSide: any, rightSide: any, context: ExpressionContext<T>): boolean {
        return _has(leftSide, unwrapString(rightSide));
    }
};

export default has;