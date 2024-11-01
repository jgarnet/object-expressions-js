import ComparisonOperator from "../types/comparison-operator";
import ExpressionContext from "../types/expression-context";
import {unwrapString} from "../_utils";

const equals: ComparisonOperator = {
    evaluate<T>(value: any, conditionValue: any, tokens: string[], context: ExpressionContext<T>): boolean {
        return unwrapString(value) == unwrapString(conditionValue);
    },
    isSymbol: true,
    regex: '='
};

export default equals;