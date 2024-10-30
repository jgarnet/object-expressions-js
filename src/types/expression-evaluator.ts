import ExpressionContext from "./expression-context";

/**
 * Evaluates an expression to determine if all conditions are met for a given object.
 */
type ExpressionEvaluator = {
    evaluate<T>(initialContext: Partial<ExpressionContext<T>>): boolean;
};

export default ExpressionEvaluator;