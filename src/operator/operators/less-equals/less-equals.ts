import ComparisonOperator from "../../comparison-operator";
import ExpressionContext from "../../../expression/context/expression-context";
import {comparePrimitives} from "../../../utils";
const isNil = require("lodash/isNil");

const VALUES = new Set([-1,0]);

const lessEquals: ComparisonOperator = {
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

export default lessEquals;