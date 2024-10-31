import ExpressionContext from "./expression-context";

type FunctionEvaluator = {
    isFunction<T>(token: string, context: ExpressionContext<T>): boolean;
    evaluate<T, R>(token: string, context: ExpressionContext<T>): R;
};

export default FunctionEvaluator;