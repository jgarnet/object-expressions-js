import ExpressionContext from "./expression-context";

/**
 * Represents an operator which is used to compare values on an object against a condition.
 */
type ComparisonOperator = {
    evaluate: <T> (value: any, conditionValue: string, tokens: string[], context: ExpressionContext<T>) => boolean,
    isSymbol: boolean,
    regex: string
};

export default ComparisonOperator;