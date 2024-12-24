import ComparisonOperator from "../comparison-operator";
import ExpressionContext from "../../context/expression-context";
import {unwrapString} from "../../utils";
const _has = require("lodash/has");

const has: ComparisonOperator = {
    async evaluate<T>(leftSide: any, rightSide: any, context: ExpressionContext<T>): Promise<boolean> {
        return _has(leftSide, unwrapString(rightSide));
    },
    precedence: 1
};

export default has;