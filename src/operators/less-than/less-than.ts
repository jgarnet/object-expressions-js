import ComparisonOperator from "../comparison-operator";
import ExpressionContext from "../../context/expression-context";
import {comparePrimitives} from "../../utils";
const isNil = require("lodash/isNil");

const lessThan: ComparisonOperator = {
    async evaluate<T>(leftSide: any, rightSide: any, context: ExpressionContext<T>): Promise<boolean> {
        if (isNil(leftSide) || isNil(rightSide)) {
            return false;
        }
        return comparePrimitives(leftSide, rightSide, context) === -1;
    },
    precedence: 1
};

export default lessThan;