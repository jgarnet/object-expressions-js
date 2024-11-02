import ComparisonOperator from "../types/comparison-operator";
import ExpressionContext from "../types/expression-context";
import {isWrapped, unwrapString, unwrapValue} from "../_utils";
const some = require("lodash/some");
const isArray = require("lodash/isArray");
const isSet = require("lodash/isSet");

const _in: ComparisonOperator = {
    evaluate<T>(leftSide: any, rightSide: any, context: ExpressionContext<T>): boolean {
        leftSide = unwrapString(leftSide);
        if (isSet(rightSide)) {
            return rightSide.has(leftSide);
        }
        const values = isArray(rightSide) ? rightSide : rightSide.split(',').map((val: any) => unwrapString(val.trim()));
        return some(values, (val: any) => val == leftSide);
    }
};

export default _in;