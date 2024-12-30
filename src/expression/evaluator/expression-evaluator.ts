import ExpressionContext from "../context/expression-context";

/**
 * Evaluates an expression to determine if all conditions are met for a given object.
 */
type ExpressionEvaluator = {
    evaluate<T>(initialContext: Partial<ExpressionContext<T>>): Promise<boolean>;
};

export default ExpressionEvaluator;