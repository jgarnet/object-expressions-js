import ComparisonOperator from "../types/comparison-operator";
import ExpressionContext from "../types/expression-context";
import {unwrapString} from "../_utils";

const greaterThan: ComparisonOperator = {
    evaluate<T>(leftSide: any, rightSide: any, context: ExpressionContext<T>): boolean {
        return unwrapString(leftSide) > unwrapString(rightSide);
    }
};

export default greaterThan;