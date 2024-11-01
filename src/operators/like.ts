import ComparisonOperator from "../types/comparison-operator";
import ExpressionContext from "../types/expression-context";
import {isWrapped, unwrapString, unwrapValue} from "../_utils";

const like: ComparisonOperator = {
    evaluate<T>(value: any, conditionValue: any, tokens: string[], context: ExpressionContext<T>): boolean {
        if (isWrapped(value, '/', '/')) {
            value = unwrapValue(value, '/', '/');
        } else {
            value = unwrapString(value);
        }
        if (isWrapped(conditionValue, '/', '/')) {
            conditionValue = unwrapValue(conditionValue, '/', '/');
        } else {
            conditionValue = unwrapString(conditionValue);
        }
        return new RegExp(conditionValue).test(`${value}`);
    },
    isSymbol: false,
    regex: '\\sLIKE\\s'
};

export default like;