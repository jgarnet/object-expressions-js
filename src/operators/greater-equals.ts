import ComparisonOperator from "../types/comparison-operator";
import ExpressionContext from "../types/expression-context";

const greaterEquals: ComparisonOperator = {
    evaluate<T>(value: any, conditionValue: string, tokens: string[], context: ExpressionContext<T>): boolean {
        return value >= conditionValue;
    },
    isSymbol: true,
    regex: '>='
};

export default greaterEquals;