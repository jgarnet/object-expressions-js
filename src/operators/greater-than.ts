import ComparisonOperator from "../types/comparison-operator";
import ExpressionContext from "../types/expression-context";
import {comparePrimitives} from "../utils";
const isNil = require("lodash/isNil");

const greaterThan: ComparisonOperator = {
    async evaluate<T>(leftSide: any, rightSide: any, context: ExpressionContext<T>): Promise<boolean> {
        if (isNil(leftSide) || isNil(rightSide)) {
            return false;
        }
        return comparePrimitives(leftSide, rightSide, context) === 1;
    },
    precedence: 1
};

export default greaterThan;