import ExpressionContext from "../expression/context/expression-context";

/**
 * Represents an operator which is used to compare values on an object against a condition.
 */
type ComparisonOperator = {
    /**
     * Compares the left-hand and right-hand sides of an operation.
     * @param leftSide The left-hand side of an operation.
     * @param rightSide The right-hand side of an operation.
     * @param context The {@link ExpressionContext}.
     */
    evaluate: <T> (leftSide: any, rightSide: any, context: ExpressionContext<T>) => Promise<boolean>,
    /**
     * Determines the precedence in which the operator is parsed relative to other operators.
     */
    precedence: number
};

export default ComparisonOperator;