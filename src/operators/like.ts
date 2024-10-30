import ComparisonOperator from "../types/comparison-operator";
import ExpressionContext from "../types/expression-context";

const like: ComparisonOperator = {
    evaluate<T>(value: any, conditionValue: string, tokens: string[], context: ExpressionContext<T>): boolean {
        if (conditionValue.charAt(0) === '/' && conditionValue.charAt(conditionValue.length - 1) === '/') {
            conditionValue = conditionValue.slice(1, conditionValue.length - 1);
        }
        return new RegExp(conditionValue).test(`${value}`);
    },
    isSymbol: false,
    regex: '\\sLIKE\\s'
};

export default like;