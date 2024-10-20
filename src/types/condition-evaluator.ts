import ExpressionContext from "./expression-context";

type ConditionEvaluator = {
    evaluate<T>(token: string, context: ExpressionContext<T>): boolean;
};

export default ConditionEvaluator;