import ComparisonOperator from "../types/comparison-operator";
import ExpressionContext from "../types/expression-context";
import {comparePrimitives} from "../utils";
const isNil = require("lodash/isNil");

const VALUES = new Set([0,1]);

const greaterEquals: ComparisonOperator = {
    async evaluate<T>(leftSide: any, rightSide: any, context: ExpressionContext<T>): Promise<boolean> {
        if (isNil(leftSide) && isNil(rightSide)) {
            return true;
        } else if (isNil(leftSide) || isNil(rightSide)) {
            return false;
        }
        return VALUES.has(comparePrimitives(leftSide, rightSide, context));
    },
    precedence: 2
};

export default greaterEquals;