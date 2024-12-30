import ExpressionContext from "../../expression/context/expression-context";

/**
 * Evaluates if a condition is met for a given object.
 * i.e. given {"a": 2}, 'a = 2' is true, while 'a = 1' is false.
 */
type ConditionEvaluator = {
    evaluate<T>(token: string, context: ExpressionContext<T>): Promise<boolean>;
};

export default ConditionEvaluator;